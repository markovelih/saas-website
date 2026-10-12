import 'server-only'
import {billingPdf} from './pdf'
import type {BillingSnapshot,DocumentSelection} from './types'
export type MailJob={id:string;dedupe_key:string;user_id:string;to_address:string;from_address:string;subject:string;html:string;snapshot:BillingSnapshot|null;documents:DocumentSelection|'none';status:string;email_id:string|null;error:string|null;attempted_at:string|null;created_at:string}
export async function sendMail(job:Pick<MailJob,'to_address'|'from_address'|'subject'|'html'|'snapshot'|'documents'>,key:string){
 if(!process.env.RESEND_API_KEY)return {error:'Email is not configured.',uncertain:false}
 const kinds=job.documents==='none'?[]:job.documents==='both'?['invoice','receipt'] as const:[job.documents] as const
 const attachments=[];for(const kind of kinds){if(!job.snapshot)throw new Error('Missing document snapshot');const content=await billingPdf(job.snapshot,kind);attachments.push({filename:`Koryx-${kind}-${kind==='invoice'?job.snapshot.invoice_number:job.snapshot.receipt_number}.pdf`,content:content.toString('base64')})}
 try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:`Koryx <${job.from_address}>`,to:[job.to_address],reply_to:'support@koryx.ca',subject:job.subject,html:job.html,attachments}),signal:AbortSignal.timeout(20000)});if(!r.ok)return {error:`Email provider returned HTTP ${r.status}.`,uncertain:r.status>=500};const data=await r.json();return typeof data.id==='string'?{id:data.id}:{error:'Email provider did not confirm delivery.',uncertain:true}}catch{return {error:'Email request was not confirmed. Check Resend before retrying.',uncertain:true}}
}
