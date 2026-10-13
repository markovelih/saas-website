'use server'
import {readInboxPage,readInboxEmail} from '@/lib/inbox/server'
export async function loadInboxPage(after?:string){return readInboxPage(after)}
export async function loadInboxEmail(id:string){try{return {email:await readInboxEmail(id)}}catch{return {error:'This email could not be opened. Please retry.'}}}

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
