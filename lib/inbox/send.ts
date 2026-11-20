import 'server-only'
import {createHash,randomUUID} from 'node:crypto'
import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import {readInboxEmail} from './server'
import {MAX_MAIL_BYTES,MAX_MAIL_FILES,isSupportSnapshot,type SupportMailSnapshot} from './types'
import {archivedEmail,storeMailFiles} from './archive'
import {queueMail,deliverMail} from '@/lib/billing/outbox'

const fields=z.object({
 to:z.string().trim().email().max(254),subject:z.string().trim().min(1).max(200).regex(/^[^\r\n\x00-\x1f]+$/),
 text:z.string().trim().max(20000).refine(value=>!value.includes('\0')),
 requestId:z.string().uuid(),startedAt:z.coerce.number().finite(),replyId:z.union([z.literal(''),z.string().uuid()]),replyDirection:z.enum(['inbound','outbound']).default('inbound'),
})
const mailbox=(value:string)=>(value.match(/<([^<>]+)>/)?.[1]||value).trim()
const messageId=(value:string|undefined)=>value&&/^<[^<>\s\x00-\x1f]{1,900}>$/.test(value)?value:undefined

export async function sendSupportEmail(form:FormData){
 const {user,supabase}=await founderClient()
 if(!process.env.RESEND_API_KEY)return {error:'Sending email is not configured.'}
 const parsed=fields.safeParse({...Object.fromEntries(['to','subject','text','requestId','startedAt','replyId'].map(key=>[key,form.get(key)??''])),replyDirection:form.get('replyDirection')||'inbound'})
 if(!parsed.success)return {error:'Enter a valid recipient, subject and message.'}
 const input=parsed.data,age=Date.now()-input.startedAt
 if(age>23*3600000||age< -300000)return {error:'This draft has expired. Check your mail before starting a new message.'}
 const files=form.getAll('files')
 if(files.length>MAX_MAIL_FILES||files.some(file=>typeof file==='string'))return {error:'Choose up to 10 files, 4 MB in total.'}
 const uploads=files as File[]
 if(uploads.reduce((size,file)=>size+file.size,0)>MAX_MAIL_BYTES)return {error:'Choose up to 10 files, 4 MB in total.'}
 if(!input.text&&!uploads.length)return {error:'Write a message or attach a file.'}
 if(uploads.some(file=>!file.size||!file.name.trim()))return {error:'Empty files cannot be attached.'}
 let to=input.to,subject=input.subject
 const headers:Record<string,string>={}
 if(input.replyId){
  let original=await readInboxEmail(input.replyId,false,input.replyDirection)
  if(input.replyDirection==='outbound'&&!original.message_id){try{original=await readInboxEmail(input.replyId,false,'outbound',true)}catch{}}
  const recipient=z.string().email().safeParse(mailbox(original.direction==='outbound'?original.to[0]:original.reply_to?.[0]||original.from))
  if(!recipient.success)return {error:'This message has no valid reply address.'}
  to=recipient.data;subject=/^re:/i.test(original.subject)?original.subject:'Re: '+original.subject
  subject=subject.replace(/[\r\n\x00-\x1f]/g,' ').slice(0,200)
  const parent=messageId(original.message_id)
  if(parent){
   headers['In-Reply-To']=parent
   const previous=(original.references||'').match(/<[^<>\s\x00-\x1f]{1,200}>/g)||[]
   const references=[parent]
   for(const id of previous.reverse()){if(id!==parent&&[id,...references].join(' ').length<=950)references.unshift(id);if(references.length===6)break}
   headers.References=references.join(' ')
  }
 }
 const prepared=await Promise.all(uploads.map(async file=>({
  id:randomUUID(),filename:file.name.replace(/[\x00-\x1f\x7f/\\]/g,'_').slice(0,180),
  content_type:file.type||'application/octet-stream',bytes:new Uint8Array(await file.arrayBuffer()),
 })))
 const attachments=prepared.map(file=>({filename:file.filename,content:Buffer.from(file.bytes).toString('base64')}))
 const payload={from:'Koryx <support@koryx.ca>',to:[to],reply_to:'support@koryx.ca',subject,
  text:input.text,attachments,...(Object.keys(headers).length?{headers}:{}),
 }
 const body=JSON.stringify(payload)
 // Bind retries to the sender, draft and exact payload, including attachment bytes.
 const digest=createHash('sha256').update(body).digest('hex')
 const key=`support/${user.id}/${input.requestId}/${input.startedAt}/${digest}`
 try{
  // Save immutable content and private files before contacting the mail provider.
  const savedFiles=await storeMailFiles(supabase,user.id,'outbound/'+input.requestId+'/'+digest,prepared)
  const snapshot:SupportMailSnapshot={kind:'support_email',version:1,direction:'outbound',idempotency_key:key,headers,
   email:{id:input.requestId,from:payload.from,to:[to],subject,text:input.text,created_at:new Date().toISOString(),attachments:[],direction:'outbound',loaded:true},files:savedFiles}
  const job=await queueMail(supabase,{dedupe_key:'support-mail/outbound/'+user.id+'/'+input.requestId+'/'+digest,user_id:user.id,to_address:to,from_address:'support@koryx.ca',subject,html:'',snapshot,documents:'none'})
  const result=await deliverMail(supabase,job)
  if(result.error)return result
  const email=archivedEmail({...job,status:'sent',email_id:result.emailId||job.email_id})
  if(!email||!isSupportSnapshot(job.snapshot))return {error:'Email accepted; refresh and check Resend before retrying.',uncertain:true}
  return {success:true,emailId:result.emailId,email}
 }catch(error){return {error:error instanceof Error?error.message:'The email could not be saved. Please retry.',uncertain:false}}
}
