import 'server-only'
import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import type {InboxEmail,InboxPage} from './types'
import {isPreviewImage} from './types'
const uuid=z.string().uuid()
const address=(value:string)=>(value.match(/<([^<>]+)>/)?.[1]||value).trim().toLowerCase()
export function supportRecipient(value:{to?:string[];cc?:string[];received_for?:string[]}){return [...(value.to||[]),...(value.cc||[]),...(value.received_for||[])].some(v=>address(v)==='support@koryx.ca')}
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
function publicEmail(v:InboxEmail&{html?:string|null;text?:string|null;headers?:Record<string,string>}):InboxEmail{return {id:v.id,from:v.from,to:v.to,subject:v.subject||'(No subject)',created_at:v.created_at,attachments:(v.attachments||[]).map(a=>({id:a.id,filename:a.filename,content_type:a.content_type,size:a.size,content_id:a.content_id})),...(v.text!==undefined||v.html!==undefined?{text:mailText(v.text,v.html),external_images:externalImages(v.html)}:{}),reply_to:v.reply_to,message_id:v.message_id,references:v.headers?.references||v.headers?.References,authentication:v.authentication}}
function verifiedAttachmentUrl(value:string){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.hostname!=='inbound-cdn.resend.com')throw new Error('Attachment link could not be verified.');return url.toString()}
async function provider(path:string){const key=process.env.RESEND_INBOUND_API_KEY;if(!key)throw new Error('Inbox is not connected yet.');const request=()=>fetch('https://api.resend.com/emails/receiving'+path,{headers:{Authorization:'Bearer '+key},cache:'no-store',signal:AbortSignal.timeout(15000)});let response=await request();if(response.status===429){await new Promise(resolve=>setTimeout(resolve,1100));response=await request()}if(!response.ok)throw new Error(response.status===401||response.status===403?'The receiving key needs access to received emails.':'Incoming mail could not be loaded. Please retry.');return response.json()}
export async function readInboxPage(after?:string):Promise<InboxPage>{await founderClient();const configured=Boolean(process.env.RESEND_INBOUND_API_KEY),canSend=Boolean(process.env.RESEND_API_KEY);if(!configured)return {emails:[],cursor:null,hasMore:false,configured,canSend};if(after&&!uuid.safeParse(after).success)return {emails:[],cursor:null,hasMore:false,configured,canSend,error:'Invalid inbox page.'};try{const result=await provider(after?'?after='+encodeURIComponent(after):'');if(!Array.isArray(result.data))throw new Error('Incoming mail could not be loaded. Please retry.');const emails=result.data.filter(supportRecipient).map(publicEmail);return {emails,hasMore:Boolean(result.has_more),cursor:result.data.at(-1)?.id||null,configured,canSend}}catch(e){return {emails:[],cursor:null,hasMore:false,configured,canSend,error:e instanceof Error?e.message:'Incoming mail could not be loaded. Please retry.'}}}
export async function readInboxEmail(id:string,withPreviews=true):Promise<InboxEmail>{
 await founderClient();uuid.parse(id);const result=await provider('/'+id)
 if(!supportRecipient(result))throw new Error('This email is not in the support inbox.')
 const email=publicEmail(result)
 // One API request resolves the image URLs together, avoiding a provider call per image.
 if(withPreviews&&email.attachments.some(a=>isPreviewImage(a.content_type))){
  try{const attachments=await provider('/'+id+'/attachments');for(const attachment of email.attachments){
   const found=attachments.data?.find((v:{id:string})=>v.id===attachment.id)
   if(found&&isPreviewImage(attachment.content_type))attachment.preview_url=verifiedAttachmentUrl(found.download_url)
  }}catch{/* The authenticated attachment endpoint remains available if previews fail. */}
 }
 return email
}
export async function attachmentDetails(emailId:string,attachmentId:string){
 await founderClient();uuid.parse(emailId);uuid.parse(attachmentId)
 const email=await readInboxEmail(emailId,false),item=email.attachments.find(a=>a.id===attachmentId)
 if(!item)throw new Error('Attachment not found.')
 const attachment=await provider('/'+emailId+'/attachments/'+attachmentId)
 return {...item,url:verifiedAttachmentUrl(attachment.download_url)}
}
export async function attachmentLink(emailId:string,attachmentId:string){return (await attachmentDetails(emailId,attachmentId)).url}
