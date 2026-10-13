'use server'
import {createHash} from 'node:crypto'
import {founderClient} from '@/lib/supabase/admin'
import {billingSettings} from '@/lib/billing/service'
import {estimateSchema,estimateSnapshot,estimateEmail} from '@/lib/billing/estimate'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {revalidatePath} from 'next/cache'

export async function sendInformationalEstimate(raw:unknown){
 const {supabase,user}=await founderClient()
 const parsed=estimateSchema.safeParse(raw)
 if(!parsed.success)return {error:parsed.error.issues[0].message}
 const input=parsed.data
 try{
  const snapshot=estimateSnapshot(input,await billingSettings(supabase),new Date().toISOString())
  const fingerprint=createHash('sha256').update(JSON.stringify(input)).digest('hex')
  const job=await queueMail(supabase,{dedupe_key:`estimate/${input.request_id}/${fingerprint}`,user_id:user.id,to_address:input.email,from_address:snapshot.seller.from_email,subject:`Your project estimate from Koryx #${snapshot.invoice_number}`,html:estimateEmail(snapshot),snapshot,documents:'invoice'})
  const result=await deliverMail(supabase,job)
  revalidatePath('/dashboard/admin')
  return result
 }catch(error){return {error:error instanceof Error?error.message:'The estimate could not be prepared. Please retry.'}}
}
