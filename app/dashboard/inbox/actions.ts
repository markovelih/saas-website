'use server'
import {readInboxPage,readInboxEmail} from '@/lib/inbox/server'
import type {InboxCursor,MailDirection} from '@/lib/inbox/types'
export async function loadInboxPage(after?:InboxCursor|string){return readInboxPage(after)}
export async function loadInboxEmail(id:string,direction:MailDirection='inbound'){try{return {email:await readInboxEmail(id,true,direction)}}catch{return {error:'This email could not be opened. Please retry.'}}}
export async function saveInboxContact(contact:string,input:unknown){const {updateContactState}=await import('@/lib/inbox/contacts');return updateContactState(contact,input)}
export async function loadMailBody(emailId:string,direction:MailDirection,external=false){const {mailBody}=await import('@/lib/inbox/html');return mailBody(await readInboxEmail(emailId,true,direction),external)}

import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {brandedEmail} from '@/lib/billing/email'
export async function testInboxConnection(requestId:string){
 const {supabase,user}=await founderClient()
 const parsed=z.string().uuid().safeParse(requestId)
 if(!parsed.success)return {error:'Invalid test request.'}
 if(!process.env.RESEND_INBOUND_API_KEY||!process.env.RESEND_API_KEY)return {error:'Inbox is not connected yet.'}
 const job=await queueMail(supabase,{dedupe_key:'inbox-test/'+parsed.data,user_id:user.id,to_address:'support@koryx.ca',from_address:'support@koryx.ca',subject:'[TEST] Koryx support inbox connection',html:brandedEmail('<h1>Support inbox connection test</h1><p>This TEST confirms that messages sent to support@koryx.ca can be read in the Founder workspace.</p><p>No client project, invoice, payment or debt was created.</p>'),snapshot:null,documents:'none'})
 const result=await deliverMail(supabase,job)
 return result.error?{error:result.error}:{success:true}
}

export async function saveInboxThread(emailId:string,direction:MailDirection,input:unknown){const {updateThreadState}=await import('@/lib/inbox/thread-store');return updateThreadState(emailId,direction,input)}
