import 'server-only'
import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import {archivedEmail,archivedFileBytes,findArchivedMail,readArchivedPage,saveImportedMail,storeMailFiles} from './archive'
import {isPreviewImage,isSupportSnapshot,mailbox,mergeEmails,type InboxAttachment,type InboxCursor,type InboxEmail,type InboxPage,type MailDirection} from './types'
const uuid=z.string().uuid()
const cursorSchema=z.object({received:uuid.optional(),sent:uuid.optional(),receivedDone:z.boolean().optional(),sentDone:z.boolean().optional(),archiveOffset:z.number().int().min(0).max(100000).optional(),archiveDone:z.boolean().optional()})
export function supportRecipient(value:{to?:string[];cc?:string[];received_for?:string[]}){return [...(value.to||[]),...(value.cc||[]),...(value.received_for||[])].some(v=>mailbox(v)==='support@koryx.ca')}
export function mailText(text:unknown,html:unknown){if(typeof text==='string'&&text.trim())return text.slice(0,200000);if(typeof html!=='string')return '';return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<!--[^]*?-->/g,'').replace(/<(?:br|\/p|\/div|\/tr|\/h[1-6])\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g,v=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[v]||v)).replace(/\n[\t ]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,200000)}
export function externalImages(html:unknown){
 if(typeof html!=='string')return []
 const urls=new Set<string>()
 for(const tag of html.slice(0,2_000_000).matchAll(/<img\b[^>]*>/gi)){
  const source=tag[0].match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const raw=(source?.[1]||source?.[2]||source?.[3]||'').replace(/&amp;/gi,'&')
  try{const url=new URL(raw);if(url.protocol==='https:'&&!url.username&&!url.password)urls.add(url.toString())}catch{}
  if(urls.size===20)break
 }
 return [...urls]
}
type ProviderEmail=InboxEmail&{html?:string|null;headers?:Record<string,string>;last_event?:string}
function publicEmail(v:ProviderEmail,direction:MailDirection,detail=false):InboxEmail{
 return {id:v.id,from:v.from,to:v.to||[],subject:v.subject||'(No subject)',created_at:new Date(v.created_at).toISOString(),direction,
  attachments:(v.attachments||[]).filter(a=>uuid.safeParse(a.id).success).map(a=>({id:a.id,filename:a.filename||'Attachment',content_type:a.content_type||'application/octet-stream',size:a.size||0,content_id:a.content_id})),
  ...(detail?{text:mailText(v.text,v.html),external_images:externalImages(v.html),loaded:true}:{}),
  reply_to:v.reply_to||[],message_id:v.message_id,references:v.headers?.references||v.headers?.References,authentication:v.authentication,status:direction==='inbound'?'received':v.last_event||'sent'}
}
function supportedEmail(v:ProviderEmail,direction:MailDirection){return direction==='inbound'?supportRecipient(v):mailbox(v.from)==='support@koryx.ca'}
function verifiedAttachmentUrl(value:string,direction:MailDirection){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.hostname!==(direction==='inbound'?'inbound':'outbound')+'-cdn.resend.com')throw Error('Attachment link could not be verified.');return url.toString()}
async function provider(path:string,direction:MailDirection='inbound'){
 const key=process.env.RESEND_INBOUND_API_KEY||(direction==='outbound'?process.env.RESEND_API_KEY:undefined)
 if(!key)throw Error('Inbox is not connected yet.')
 let response:Response|undefined
 for(let attempt=0;attempt<3;attempt++){
  response=await fetch('https://api.resend.com/emails'+(direction==='inbound'?'/receiving':'')+path,{headers:{Authorization:'Bearer '+key},cache:'no-store',signal:AbortSignal.timeout(15000)})
  if(response.status!==429)break
  if(attempt<2)await new Promise(resolve=>setTimeout(resolve,1100*(attempt+1)))
 }
 if(!response?.ok)throw Error(response?.status===401||response?.status===403?'The receiving key needs access to received emails.':'Incoming mail could not be loaded. Please retry.')
 return response.json()
}
function attachmentPreview(email:InboxEmail):InboxEmail{
 return {...email,attachments:email.attachments.map(a=>({...a,...(isPreviewImage(a.content_type)?{preview_url:'/api/inbox/'+email.id+'/attachments/'+a.id+'?preview=1&direction='+(email.direction||'inbound')}:{})}))}
}
export async function readInboxPage(after?:InboxCursor|string):Promise<InboxPage>{
 const {supabase,user}=await founderClient()
 const configured=Boolean(process.env.RESEND_INBOUND_API_KEY),canSend=Boolean(process.env.RESEND_API_KEY)
 const input=cursorSchema.safeParse(typeof after==='string'?{received:after}:after||{})
 if(!input.success)return {emails:[],cursor:null,hasMore:false,configured,canSend,error:'Invalid inbox page.'}
 const cursor=input.data,errors:string[]=[],groups:InboxEmail[][]=[]
 const next:InboxCursor={...cursor,receivedDone:cursor.receivedDone||!configured,sentDone:cursor.sentDone||!(configured||canSend)}
 for(const direction of ['inbound','outbound'] as const){
  const done=direction==='inbound'?next.receivedDone:next.sentDone
  if(done)continue
  try{
   const last=direction==='inbound'?cursor.received:cursor.sent
   const result=await provider('?limit=40'+(last?'&after='+encodeURIComponent(last):''),direction)
   if(!Array.isArray(result.data))throw Error('Incoming mail could not be loaded. Please retry.')
   groups.push(result.data.filter((email:ProviderEmail)=>supportedEmail(email,direction)).map((email:ProviderEmail)=>publicEmail(email,direction)))
   if(direction==='inbound'){next.received=result.data.at(-1)?.id;next.receivedDone=!result.has_more}
   else{next.sent=result.data.at(-1)?.id;next.sentDone=!result.has_more}
  }catch{errors.push(direction==='outbound'?'Sent history could not be loaded. Please retry.':'Incoming mail could not be loaded. Please retry.')}
 }
 if(!cursor.archiveDone){
  try{const saved=await readArchivedPage(supabase,user.id,cursor.archiveOffset||0);groups.push(saved.emails);next.archiveOffset=(cursor.archiveOffset||0)+40;next.archiveDone=!saved.hasMore}
  catch{errors.push('Saved mail could not be loaded. Please retry.')}
 }
 return {emails:mergeEmails(...groups),cursor:next.received||null,hasMore:!next.receivedDone||!next.sentDone||!next.archiveDone,configured,canSend,next,...(errors.length?{error:errors.join(' ')}:{})}
}
async function attachmentList(id:string,direction:MailDirection){
 const items:InboxAttachment[]=[]
 let after:string|undefined
 for(let page=0;page<10;page++){
  const result=await provider('/'+id+'/attachments'+(after?'?after='+encodeURIComponent(after):''),direction)
  if(!Array.isArray(result.data))throw Error('Attachments could not be loaded. Please retry.')
  items.push(...result.data)
  if(!result.has_more)return items as (InboxAttachment&{download_url?:string})[]
  after=result.data.at(-1)?.id
  if(!after)throw Error('Attachments could not be loaded. Please retry.')
 }
 throw Error('Attachments could not be loaded. Please retry.')
}
async function downloadedBytes(url:string){
 const response=await fetch(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000)})
 if(!response.ok||!response.body)throw Error('Attachment is unavailable.')
 const reader=response.body.getReader(),chunks:Uint8Array[]=[],limit=40*1024*1024
 let length=0
 while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw Error('Attachment is too large.')}chunks.push(value)}
 return new Uint8Array(Buffer.concat(chunks))
}
export async function readInboxEmail(id:string,withAttachments=true,direction:MailDirection='inbound',refresh=false):Promise<InboxEmail>{
 const {supabase,user}=await founderClient();uuid.parse(id);z.enum(['inbound','outbound']).parse(direction)
 const saved=await findArchivedMail(supabase,user.id,id,direction)
 if(saved&&!refresh){const email=archivedEmail(saved)!;return attachmentPreview(email)}
 const result=await provider('/'+id+(direction==='inbound'?'?html_format=cid':''),direction)
 if(!supportedEmail(result,direction))throw Error('This email is not in the support inbox.')
 const email=publicEmail(result,direction,true)
 if(!withAttachments)return email
 let listed:(InboxAttachment&{download_url?:string})[]
 try{
  listed=await attachmentList(id,direction)
  // The attachment endpoint is authoritative even when the email object has no attachments field.
  const all=new Map(email.attachments.map(a=>[a.id,a]))
  for(const a of listed)if(uuid.safeParse(a.id).success)all.set(a.id,{id:a.id,filename:a.filename||'Attachment',content_type:a.content_type||'application/octet-stream',size:a.size||0,content_id:a.content_id,...(isPreviewImage(a.content_type)&&a.download_url?{preview_url:verifiedAttachmentUrl(a.download_url,direction)}:{})})
  email.attachments=[...all.values()]
 }catch{return {...email,attachment_error:'Attachments could not be loaded. Please retry.'}}
 try{
  const files=[]
  for(const attachment of email.attachments){
   const found=listed.find(a=>a.id===attachment.id)
   const info=found?.download_url?found:await provider('/'+id+'/attachments/'+attachment.id,direction)
   files.push({id:attachment.id,filename:attachment.filename,content_type:attachment.content_type,bytes:await downloadedBytes(verifiedAttachmentUrl(info.download_url,direction))})
  }
  const stored=await storeMailFiles(supabase,user.id,direction+'/'+id,files)
  await saveImportedMail(supabase,user.id,email,stored)
 }catch{email.archive_error='The message could not be archived. Refresh to retry.'}
 return email
}
export async function attachmentDetails(emailId:string,attachmentId:string,direction:MailDirection='inbound'){
 const {supabase,user}=await founderClient();uuid.parse(emailId);uuid.parse(attachmentId);z.enum(['inbound','outbound']).parse(direction)
 const saved=await findArchivedMail(supabase,user.id,emailId,direction)
 if(saved&&isSupportSnapshot(saved.snapshot)){
  const file=saved.snapshot.files.find(a=>a.id===attachmentId)
  if(!file)throw Error('Attachment not found.')
  return {...file,bytes:await archivedFileBytes(supabase,file)}
 }
 const result=await provider('/'+emailId,direction)
 if(!supportedEmail(result,direction))throw Error('This email is not in the support inbox.')
 // Fetch the attachment list rather than depending on sparse email metadata.
 const files=await attachmentList(emailId,direction),file=files.find(a=>a.id===attachmentId)
 if(!file)throw Error('Attachment not found.')
 const detail=file.download_url?file:await provider('/'+emailId+'/attachments/'+attachmentId,direction)
 return {...file,url:verifiedAttachmentUrl(detail.download_url,direction)}
}
export async function attachmentLink(emailId:string,attachmentId:string){const detail=await attachmentDetails(emailId,attachmentId);if('url' in detail)return detail.url;throw Error('This attachment is stored privately.')}
