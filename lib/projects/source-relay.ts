import 'server-only'
import {createHash,createHmac,randomUUID,timingSafeEqual} from 'node:crypto'
import {isIP} from 'node:net'
import {z} from 'zod'
import {paymentDb} from '@/lib/payments/server'
import {sourcePath,sourceContent,MAX_FILE_BYTES,MAX_SOURCE_BYTES} from './policy'
import type {SourceRelay} from './types'

const hex=z.string().regex(/^[a-f0-9]{64}$/),fileSchema=z.object({path:z.string().refine(p=>Boolean(sourcePath(p))),size:z.number().int().min(0).max(MAX_FILE_BYTES),sha256:hex,mime:z.enum(['text/plain','image/png','image/jpeg','image/gif','image/webp','application/octet-stream'])}).strict()
const manifestSchema=z.object({protocol:z.literal(1),version:hex,commit:z.string().regex(/^[a-f0-9]{40}$/).nullable(),excluded_count:z.number().int().min(0).max(10000000),parts:z.number().int().min(1).max(1000),files:z.array(fileSchema).min(1).max(1000)}).strict()
const partSchema=z.object({protocol:z.literal(1),version:hex,part:z.number().int().min(0),files:z.array(fileSchema.extend({content_base64:z.string().max(4194304)})).min(1).max(1000)}).strict()
export const relayKeyName=(order:string)=>'KORYX_SOURCE_RELAY_'+z.string().uuid().parse(order).replaceAll('-','').toUpperCase()
function signature(key:string,method:string,url:string,time:string,nonce:string){const u=new URL(url);return createHmac('sha256',key).update([method,u.pathname,u.search,time,nonce].join('\n')).digest('hex')}
export function validRelayRequest(request:Request,order:string){
 let key;try{key=process.env[relayKeyName(order)]}catch{return false}if(!key||key.length<32)return false
 const time=request.headers.get('x-koryx-time')||'',nonce=request.headers.get('x-koryx-nonce')||'',actual=request.headers.get('x-koryx-signature')||''
 return /^\d{13}$/.test(time)&&Math.abs(Date.now()-Number(time))<=60000&&/^[a-f0-9-]{36}$/.test(nonce)&&/^[a-f0-9]{64}$/.test(actual)&&timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(signature(key,request.method,request.url,time,nonce),'hex'))
}
export function sourceRelayEndpoint(value:string){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/api/koryx/source'||isIP(url.hostname)||!url.hostname.includes('.')||/(?:^|\.)(?:localhost|local|internal)$/.test(url.hostname))throw Error('Invalid Source endpoint');return url.href}
async function relayJson(url:string,key:string){
 const time=String(Date.now()),nonce=randomUUID(),response=await fetch(url,{headers:{'X-Koryx-Time':time,'X-Koryx-Nonce':nonce,'X-Koryx-Signature':signature(key,'GET',url,time,nonce)},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)})
 if(!response.ok)throw Error('Source endpoint unavailable')
 const reader=response.body?.getReader();if(!reader)throw Error('Empty Source response');const chunks:Uint8Array[]=[];let size=0
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5*1024*1024){await reader.cancel();throw Error('Source response too large')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=Buffer.concat(chunks),actual=response.headers.get('x-koryx-response-signature')||'',expected=createHmac('sha256',key).update(nonce+'\n').update(bytes).digest('hex')
 if(!/^[a-f0-9]{64}$/.test(actual)||!timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(expected,'hex')))throw Error('Source response signature invalid')
 return JSON.parse(bytes.toString('utf8'))
}
export function relayManifest(value:unknown){const m=manifestSchema.parse(value);if(m.files.reduce((n,f)=>n+f.size,0)>MAX_SOURCE_BYTES||m.files.some((f,i)=>i>0&&m.files[i-1].path>=f.path))throw Error('Source manifest invalid')
 const version=createHash('sha256').update(JSON.stringify({commit:m.commit,files:m.files.map(({path,size,sha256,mime})=>({path,size,sha256,mime}))})).digest('hex');if(version!==m.version)throw Error('Source manifest integrity failed');return m}
async function importRelay(db:ReturnType<typeof paymentDb>,link:SourceRelay){
 const key=process.env[relayKeyName(link.order_id)];if(!key||key.length<32)throw Error('Source key unavailable')
 const endpoint=sourceRelayEndpoint(link.endpoint),manifest=relayManifest(await relayJson(endpoint,key)),args={p_order:link.order_id,p_lease:link.lease_token!}
 const {data:releaseId,error:be}=await db.rpc('koryx_begin_source_relay',{...args,p_version:manifest.version,p_commit:manifest.commit});if(be||!releaseId)throw Error('Source revision could not be prepared')
 const {data:release,error:re}=await db.from('project_source_releases').select('published_at').eq('id',releaseId).single();if(re||!release)throw Error('Source revision unavailable')
 if(!release.published_at){const expected=new Map(manifest.files.map(f=>[f.path,f])),seen=new Set<string>(),started=Date.now()
  for(let part=0;part<manifest.parts;part++){
   if(Date.now()-started>210000)throw Error('Source import will resume later')
   const u=new URL(endpoint);u.searchParams.set('version',manifest.version);u.searchParams.set('part',String(part));const payload=partSchema.parse(await relayJson(u.href,key))
   if(payload.version!==manifest.version||payload.part!==part)throw Error('Source version changed')
   for(const file of payload.files){const metadata=expected.get(file.path),bytes=Buffer.from(file.content_base64,'base64');if(seen.has(file.path)||!metadata||metadata.size!==file.size||metadata.sha256!==file.sha256||metadata.mime!==file.mime||bytes.length!==file.size||createHash('sha256').update(bytes).digest('hex')!==file.sha256||sourceContent(bytes).mime!==file.mime)throw Error('Source file integrity failed');seen.add(file.path)}
   const {error}=await db.rpc('koryx_add_source_relay_files',{...args,p_release:releaseId,p_files:payload.files});if(error)throw Error('Source files could not be stored')
  }
  if(seen.size!==expected.size)throw Error('Source snapshot incomplete')
 }
 // Ask the production domain again, so a deployment during transfer never
 // publishes a mixed version. The lease prevents concurrent stale writers.
 const current=relayManifest(await relayJson(endpoint,key));if(current.version!==manifest.version)throw Error('Production version changed during transfer')
 const {data:finished,error}=await db.rpc('koryx_finish_source_relay',{...args,p_release:releaseId,p_manifest:manifest.files,p_excluded:manifest.excluded_count});if(error||!finished)throw Error('Source connection changed during transfer')
}
export async function syncSourceRelays(order?:string){
 const db=paymentDb(),{data:links,error}=await db.rpc('koryx_claim_source_relay',order?{p_order:order}:{});if(error)throw Error('Source relay queue unavailable');let completed=0
 for(const link of links||[]){try{await importRelay(db,link);completed++}catch{await db.from('project_source_relays').update({error:'Automatic Source update did not finish. The previous version remains available; the next scheduled check will retry.',lease_token:null,lease_until:null}).eq('order_id',link.order_id).eq('lease_token',link.lease_token!)}}
 return {processed:links?.length||0,completed}
}
