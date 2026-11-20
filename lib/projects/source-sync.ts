import 'server-only'
import {createHash,createHmac,randomUUID,timingSafeEqual} from 'node:crypto'
import {z} from 'zod'
import {paymentDb} from '@/lib/payments/server'
import {bucket,privateBucket,ProjectError} from './server'
import {sourceContent,sourcePath,MAX_FILE_BYTES,MAX_SOURCE_BYTES} from './policy'
import type {SourceJob,SourceLink} from './types'
const segment=z.string().regex(/^[A-Za-z0-9_.-]+$/).refine(v=>v!=='.'&&v!=='..')
export const sourceLinkSchema=z.object({repo_full_name:z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/).refine(v=>v.split('/').every(p=>segment.safeParse(p).success)),vercel_project_id:z.string().regex(/^prj_[A-Za-z0-9]+$/),team_id:z.string().regex(/^team_[A-Za-z0-9]+$/),production_domain:z.string().toLowerCase().regex(/^(?!.*\.\.)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/),approved_paths:z.array(z.string().min(1).max(300).refine(p=>Boolean(sourcePath(p.replace(/\/$/,''))))).min(1).max(30),reviewed:z.literal(true)})
export function syncConfiguration(){return {github:Boolean(process.env.KORYX_SOURCE_GITHUB_TOKEN),vercel:Boolean(process.env.KORYX_SOURCE_VERCEL_TOKEN),webhook:Boolean(process.env.KORYX_SOURCE_WEBHOOK_SECRET)}}
export function validVercelSignature(body:Buffer,signature:string|null,secret=process.env.KORYX_SOURCE_WEBHOOK_SECRET){if(!secret||!signature||!/^[a-f0-9]{40}$/.test(signature))return false;return timingSafeEqual(Buffer.from(signature,'hex'),createHmac('sha1',secret).update(body).digest())}
async function providerJson(provider:'github'|'vercel',path:string){
 const token=provider==='github'?process.env.KORYX_SOURCE_GITHUB_TOKEN:process.env.KORYX_SOURCE_VERCEL_TOKEN
 if(!token)throw new ProjectError('Source synchronization credentials are not configured.',503)
 const response=await fetch((provider==='github'?'https://api.github.com':'https://api.vercel.com')+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json',...(provider==='github'?{'X-GitHub-Api-Version':'2022-11-28'}:{})},redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)})
 if(!response.ok)throw new ProjectError(`Source provider returned HTTP ${response.status}. Check connection permissions or retry later.`,503)
 const reader=response.body?.getReader();if(!reader)throw new ProjectError('Source provider returned an empty response.',503)
 let size=0;const chunks:Uint8Array[]=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>7*1024*1024){await reader.cancel();throw new ProjectError('Source provider response is too large. Narrow the approved source folders.')}chunks.push(value)}}finally{reader.releaseLock()}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
const githubPath=(repo:string)=>'/repos/'+repo.split('/').map(encodeURIComponent).join('/')
export async function currentProduction(link:Pick<SourceLink,'production_domain'|'team_id'|'vercel_project_id'|'repo_id'>){
 const query='?teamId='+encodeURIComponent(link.team_id),alias=await providerJson('vercel','/v4/aliases/'+encodeURIComponent(link.production_domain)+query)
 const id=z.string().regex(/^dpl_[A-Za-z0-9]+$/).parse(alias.deployment?.id||alias.deploymentId)
 const deployment=await providerJson('vercel','/v13/deployments/'+id+query+'&withGitRepoInfo=true')
 if(deployment.id!==id||deployment.projectId!==link.vercel_project_id||deployment.readyState!=='READY'||deployment.target!=='production')throw new ProjectError('The configured domain is not serving a ready production deployment.')
 const repoId=Number(deployment.gitSource?.repoId||deployment.meta?.githubRepoId),sha=z.string().regex(/^[a-f0-9]{40}$/).parse(deployment.gitSource?.sha||deployment.meta?.githubCommitSha)
 if(repoId!==Number(link.repo_id))throw new ProjectError('The deployed project does not match the approved repository.')
 return {id,sha}
}
export async function verifySourceLink(input:z.infer<typeof sourceLinkSchema>){
 const repo=await providerJson('github',githubPath(input.repo_full_name));const repoId=z.number().int().positive().parse(repo.id)
 await currentProduction({...input,repo_id:repoId})
 return {...input,repo_id:repoId}
}
export async function queueSourceSync(db:ReturnType<typeof paymentDb>,orderId:string){const {data,error}=await db.rpc('koryx_queue_source_sync',{p_order:orderId});if(error)throw new ProjectError('Source synchronization could not be queued.',503);return data}
const permitted=(path:string,roots:string[])=>roots.some(root=>root.endsWith('/')?path.startsWith(root):path===root)
export function sourceTreeEntries(tree:{truncated?:boolean;tree?:{type:string;mode:string;path:string;sha:string;size?:number}[]},roots:string[]){
 if(tree.truncated||!Array.isArray(tree.tree))throw new ProjectError('Repository listing is incomplete. Narrow the source scope.')
 const files=tree.tree.filter(f=>f.type==='blob'&&['100644','100755'].includes(f.mode)&&sourcePath(f.path)&&permitted(f.path,roots))
 if(!files.length||files.length>300||files.some(f=>(f.size||0)>MAX_FILE_BYTES)||files.reduce((n,f)=>n+(f.size||0),0)>MAX_SOURCE_BYTES)throw new ProjectError('Approved source exceeds the handover limits (300 files, 3 MB each, 30 MB total).')
 for(const f of files)if(!/^[a-f0-9]{40}$/.test(f.sha)||!Number.isSafeInteger(f.size)||(f.size??-1)<0)throw new ProjectError('Repository returned invalid file metadata.')
 return files
}
async function runJob(db:ReturnType<typeof paymentDb>,job:SourceJob){
 const {data:link}=await db.from('project_source_links').select('*').eq('order_id',job.order_id).single()
 if(!link?.enabled||link.policy_version!==job.policy_version)throw new ProjectError('Source configuration changed. Run a new synchronization.')
 // Founder-approved imports are private operations for every project. Client
 // ownership/payment is checked independently on every source list/file request.
 await privateBucket(db)
 const deployment=await currentProduction(link),repoPath=githubPath(link.repo_full_name),repo=await providerJson('github',repoPath)
 if(Number(repo.id)!==Number(link.repo_id))throw new ProjectError('Repository identity changed. Review the source connection.')
 const {error:jobError}=await db.from('project_source_jobs').update({deployment_id:deployment.id}).eq('id',job.id).eq('lease_token',job.lease_token!);if(jobError)throw new Error('Source progress unavailable')
 const {data:old}=await db.from('project_source_releases').select('*').eq('order_id',job.order_id).eq('deployment_id',deployment.id).eq('policy_version',link.policy_version).maybeSingle()
 let release=old
 if(!release){const {data,error}=await db.from('project_source_releases').insert({order_id:job.order_id,title:'Website version · '+new Date().toISOString().slice(0,16).replace('T',' '),origin:'automatic',deployment_id:deployment.id,commit_sha:deployment.sha,policy_version:link.policy_version}).select('*').single();if(error||!data)throw new Error('Could not prepare source snapshot');release=data}
 if(!release.published_at){
  const tree=await providerJson('github',repoPath+'/git/trees/'+deployment.sha+'?recursive=1'),files=sourceTreeEntries(tree,link.approved_paths),{data:stored,error:se}=await db.from('project_source_files').select('path').eq('release_id',release.id);if(se)throw new Error('Could not read source progress')
  const done=new Set((stored||[]).map(f=>f.path));let cursor=0;const started=Date.now()
  async function upload(){while(cursor<files.length){const file=files[cursor++];if(done.has(file.path))continue;if(Date.now()-started>240000)throw new Error('Source import needs another attempt')
   const blob=await providerJson('github',repoPath+'/git/blobs/'+file.sha);if(blob.encoding!=='base64'||typeof blob.content!=='string')throw new Error('Invalid source blob')
   const bytes=Buffer.from(blob.content.replace(/\s/g,''),'base64');if(bytes.length!==file.size||createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex')!==file.sha)throw new Error('Source blob integrity check failed')
   let content;try{content=sourceContent(bytes)}catch{throw new ProjectError('Source contains possible credentials. Review the repository before retrying.')}
   const path=`source/${job.order_id}/${release!.id}/${randomUUID()}`,{error:ue}=await db.storage.from(bucket).upload(path,bytes,{contentType:content.mime,upsert:false});if(ue)throw new Error('Source storage upload failed')
   const {error}=await db.rpc('koryx_add_source_file',{p_release:release!.id,p_file:{path:file.path,storage_path:path,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),mime:content.mime}})
   if(error){await db.storage.from(bucket).remove([path]);throw new Error('Source file could not be saved')}
  }}
  const results=await Promise.allSettled(Array.from({length:Math.min(4,files.length)},()=>upload()));const failure=results.find(r=>r.status==='rejected');if(failure?.status==='rejected')throw failure.reason
 }
 // Re-resolve the domain after download: a delayed event or a newer deployment
 // must never replace the source for the version now serving production traffic.
 const current=await currentProduction(link);if(current.id!==deployment.id){await queueSourceSync(db,job.order_id);throw new ProjectError('Production changed during synchronization. A fresh import was queued.')}
 const {data:finished,error}=await db.rpc('koryx_finish_source_sync',{p_job:job.id,p_lease:job.lease_token!,p_release:release.id});if(error||!finished)throw new Error('Source lease or configuration changed before publication')
}
export async function runSourceJobs(id?:string){
 const ready=syncConfiguration();if(!ready.github||!ready.vercel)return {configured:false,processed:0}
 const db=paymentDb(),{data:jobs,error}=await db.rpc('koryx_claim_source_job',id?{p_id:id}:{})
 if(error)throw new Error('Source queue unavailable')
 for(const job of jobs||[]){try{await runJob(db,job)}catch(e){const blocked=e instanceof ProjectError&&e.status===400;const {error:updateError}=await db.from('project_source_jobs').update({status:blocked?'blocked':'failed',error:blocked?e.message:'Source import did not finish. The previous version is preserved; retry is scheduled.',next_attempt_at:new Date(Date.now()+Math.min(60,2**job.attempts)*60000).toISOString(),lease_until:null,updated_at:new Date().toISOString()}).eq('id',job.id).eq('lease_token',job.lease_token!).eq('status','running');if(updateError)throw new Error('Source queue status unavailable')}}
 return {configured:true,processed:jobs?.length||0}
}
