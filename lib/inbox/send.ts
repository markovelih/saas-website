import 'server-only'
import {createHash} from 'node:crypto'
import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import {readInboxEmail} from './server'
import {MAX_MAIL_BYTES,MAX_MAIL_FILES} from './types'

const fields=z.object({
 to:z.string().trim().email().max(254),subject:z.string().trim().min(1).max(200).regex(/^[^\r\n\x00-\x1f]+$/),
 text:z.string().trim().max(20000).refine(value=>!value.includes('\0')),
 requestId:z.string().uuid(),startedAt:z.coerce.number().finite(),replyId:z.union([z.literal(''),z.string().uuid()]),
})
const mailbox=(value:string)=>(value.match(/<([^<>]+)>/)?.[1]||value).trim()
const messageId=(value:string|undefined)=>value&&/^<[^<>\s\x00-\x1f]{1,900}>$/.test(value)?value:undefined

export async function sendSupportEmail(form:FormData){
 const {user}=await founderClient()
 if(!process.env.RESEND_API_KEY)return {error:'Sending email is not configured.'}
 const parsed=fields.safeParse(Object.fromEntries(['to','subject','text','requestId','startedAt','replyId'].map(key=>[key,form.get(key)??''])))
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
  const original=await readInboxEmail(input.replyId,false)
  const recipient=z.string().email().safeParse(mailbox(original.reply_to?.[0]||original.from))
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
 const attachments=await Promise.all(uploads.map(async file=>({
  filename:file.name.replace(/[\x00-\x1f\x7f/\\]/g,'_').slice(0,180),
  content:Buffer.from(await file.arrayBuffer()).toString('base64'),
 })))
 const payload={from:'Koryx <support@koryx.ca>',to:[to],reply_to:'support@koryx.ca',subject,
  text:input.text,attachments,...(Object.keys(headers).length?{headers}:{}),
 }
 const body=JSON.stringify(payload)
 // Bind retries to the sender, draft and exact payload, including attachment bytes.
 const digest=createHash('sha256').update(body).digest('hex')
 const key=`support/${user.id}/${input.requestId}/${input.startedAt}/${digest}`
 try{
  const response=await fetch('https://api.resend.com/emails',{
   method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},
   body,signal:AbortSignal.timeout(25000),
  })
  if(!response.ok)return {error:response.status===429?'Email is busy. Wait a moment and retry.':response.status===401||response.status===403?'The email connection does not allow sending.':response.status===422?'The email provider rejected the address or an attachment.':'Email could not be sent. Please retry.',uncertain:response.status>=500}
  const result=await response.json()
  return typeof result.id==='string'?{success:true,emailId:result.id}:{error:'Delivery was not confirmed. Retry this same message.',uncertain:true}
 }catch{return {error:'Delivery was not confirmed. Retry this same message.',uncertain:true}}
}
