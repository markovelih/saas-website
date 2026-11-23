import 'server-only'
import {createHash} from 'node:crypto'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import type {MailJob} from '@/lib/billing/mail'
import {headerValue} from './threading'
import {isSupportSnapshot,type ArchivedMailFile,type InboxEmail,type MailDirection,type SupportMailSnapshot} from './types'

const bucket='support-mail'
const maxStoredBytes=40*1024*1024
type Db=SupabaseClient<Database>
export async function ensureMailStorage(db:Db){
 let result=await db.storage.getBucket(bucket)
 if(!result.data){
  const created=await db.storage.createBucket(bucket,{public:false,fileSizeLimit:maxStoredBytes})
  if(created.error){result=await db.storage.getBucket(bucket);if(!result.data)throw Error('Private mail storage could not be created.')}
  else return
 }
 if(result.data?.public)throw Error('Mail attachments require private storage.')
}
export async function storeMailFiles(db:Db,owner:string,folder:string,files:{id:string;filename:string;content_type:string;content_id?:string|null;bytes:Uint8Array}[]):Promise<ArchivedMailFile[]>{
 if(!files.length)return []
 await ensureMailStorage(db)
 const saved:ArchivedMailFile[]=[]
 for(const file of files){
  if(file.bytes.byteLength>maxStoredBytes)throw Error('This attachment is too large to archive.')
  const sha256=createHash('sha256').update(file.bytes).digest('hex')
  const objectPath=`${owner}/${folder}/${sha256}`
  const result=await db.storage.from(bucket).upload(objectPath,file.bytes,{contentType:file.content_type||'application/octet-stream',upsert:false})
  if(result.error&&String(result.error.statusCode)!=='409'&&!/already exists|duplicate/i.test(result.error.message))throw Error('Mail attachments could not be saved. Please retry.')
  saved.push({id:file.id,filename:file.filename,content_type:file.content_type,content_id:file.content_id,size:file.bytes.byteLength,path:objectPath,sha256})
 }
 return saved
}
export function archivedEmail(job:MailJob,detail=true):InboxEmail|null{
 if(!isSupportSnapshot(job.snapshot))return null
 const snapshot=job.snapshot
 return {...snapshot.email,in_reply_to:snapshot.email.in_reply_to||headerValue(snapshot.headers,'in-reply-to'),references:snapshot.email.references||headerValue(snapshot.headers,'references'),id:job.email_id||job.id,direction:snapshot.direction,archive_id:job.id,
  loaded:detail,status:snapshot.direction==='inbound'?'received':job.status,
  text:detail?snapshot.email.text:undefined,
  html:detail?snapshot.email.html:undefined,
  attachments:snapshot.files.map(({id,filename,content_type,size,content_id})=>({id,filename,content_type,size,content_id})),
 }
}
export async function findArchivedMail(db:Db,userId:string,id:string,direction:MailDirection){
 for(const column of ['email_id','id'] as const){
  const result=await db.from('billing_mail').select('*').eq('user_id',userId).like('dedupe_key','support-mail/%').eq(column,id).limit(1).maybeSingle()
  if(result.error)throw Error('Saved mail could not be loaded. Please retry.')
  if(result.data&&isSupportSnapshot(result.data.snapshot)&&result.data.snapshot.direction===direction)return result.data
 }
 return null
}
export async function readArchivedPage(db:Db,userId:string,offset=0){
 const {data,error}=await db.from('support_mail_index').select('*').eq('user_id',userId).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+39)
 if(error)throw Error('Saved mail could not be loaded. Please retry.')
 return {emails:(data||[]).map(job=>archivedEmail(job,false)).filter((email):email is InboxEmail=>Boolean(email)),hasMore:data?.length===40}
}
export async function saveImportedMail(db:Db,userId:string,email:InboxEmail,files:ArchivedMailFile[]){
 const direction=email.direction||'inbound'
 const snapshot:SupportMailSnapshot={kind:'support_email',version:1,direction,email:{...email,attachments:[],archive_error:undefined,attachment_error:undefined},files}
 const result=await db.from('billing_mail').upsert({dedupe_key:`support-mail/${direction}/${email.id}`,user_id:userId,
  to_address:email.to[0]||'support@koryx.ca',from_address:email.from,subject:email.subject,
  html:'',snapshot,documents:'none',status:'sent',email_id:email.id,error:null,attempted_at:email.created_at,created_at:email.created_at,
 },{onConflict:'dedupe_key'})
 if(result.error)throw Error('The message could not be archived. Refresh to retry.')
}
export async function archivedFileBytes(db:Db,file:ArchivedMailFile){
 const {data,error}=await db.storage.from(bucket).download(file.path)
 if(error||!data)throw Error('Saved attachment could not be loaded.')
 const bytes=new Uint8Array(await data.arrayBuffer())
 if(bytes.byteLength!==file.size||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Saved attachment could not be verified.')
 return bytes
}
export async function sendArchivedSupportEmail(db:Db|undefined,snapshot:SupportMailSnapshot){
 if(!db||snapshot.direction!=='outbound'||!snapshot.idempotency_key)return {error:'This archived message cannot be sent.',uncertain:false}
 const attachments=[]
 try{for(const file of snapshot.files)attachments.push({filename:file.filename,content:Buffer.from(await archivedFileBytes(db,file)).toString('base64'),content_type:file.content_type,...(file.content_id?{content_id:file.content_id}:{})})}
 catch{return {error:'Saved attachments could not be loaded. Please retry.',uncertain:false}}
 const payload={from:'Koryx <support@koryx.ca>',to:snapshot.email.to,reply_to:'support@koryx.ca',subject:snapshot.email.subject,
  text:snapshot.email.text||'',...(snapshot.email.html?{html:snapshot.email.html}:{}),attachments,...(Object.keys(snapshot.headers||{}).length?{headers:snapshot.headers}:{}),
 }
 try{
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':snapshot.idempotency_key},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)})
  if(!response.ok)return {error:response.status===429?'Email is busy. Wait a moment and retry.':response.status===401||response.status===403?'The email connection does not allow sending.':response.status===422?'The email provider rejected the address or an attachment.':'Email could not be sent. Please retry.',uncertain:response.status>=500}
  const result=await response.json()
  return typeof result.id==='string'?{id:result.id}:{error:'Delivery was not confirmed. Retry this same message.',uncertain:true}
 }catch{return {error:'Delivery was not confirmed. Retry this same message.',uncertain:true}}
}
