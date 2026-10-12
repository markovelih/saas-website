'use server'
import {z} from 'zod'
import {createHash} from 'node:crypto'
import {founderClient} from '@/lib/supabase/admin'
import {documentSelectionSchema} from '@/lib/billing/schema'
import {billingSettings,paymentSnapshot} from '@/lib/billing/service'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {receiptEmail} from '@/lib/billing/email'
import {revalidatePath} from 'next/cache'
export async function sendProjectDocuments(raw:unknown){
 const {supabase}=await founderClient();const p=z.object({id:z.string().uuid(),documents:documentSelectionSchema}).safeParse(raw);if(!p.success)return {error:'Choose the documents to send.'};const {id,documents}=p.data
 const {data:order}=await supabase.from('orders').select('*').eq('id',id).single();if(!order)return {error:'Project not found.'}
 const {data:payment}=await supabase.from('project_payments').select('*').eq('order_id',id).maybeSingle();let snapshot=payment?.snapshot,recordId=payment?.id
 if(!snapshot){if(documents!=='invoice')return {error:'Record a received payment before sending a receipt.'};if(order.quote_price===null)return {error:'Save an agreed price first.'};const {data:auth}=await supabase.auth.admin.getUserById(order.user_id);if(!auth.user?.email)return {error:'Client not found.'};snapshot=paymentSnapshot(order,{email:auth.user.email,full_name:order.delivery?.bill_to_name||auth.user.user_metadata?.full_name||''},await billingSettings(supabase),'other',new Date().toISOString());snapshot.settled=false;snapshot.receipt_number=''
  const fingerprint=createHash('sha256').update(JSON.stringify([snapshot.items,snapshot.discount,snapshot.total,snapshot.customer,snapshot.seller])).digest('hex');const {data:invoice,error}=await supabase.from('project_invoices').upsert({order_id:id,user_id:order.user_id,snapshot,fingerprint},{onConflict:'order_id,fingerprint',ignoreDuplicates:true}).select('*').maybeSingle();if(error)return {error:'Invoice could not be saved.'};const saved=invoice||(await supabase.from('project_invoices').select('*').eq('order_id',id).eq('fingerprint',fingerprint).single()).data;if(!saved)return {error:'Invoice could not be saved.'};snapshot=saved.snapshot;recordId=saved.id
 }
 try{const job=await queueMail(supabase,{dedupe_key:`project/${recordId}/${documents}`,user_id:order.user_id,to_address:snapshot.customer.email,from_address:snapshot.seller.from_email,subject:`Your ${documents==='both'?'invoice & receipt':documents} from Koryx #${snapshot.invoice_number}`,html:receiptEmail(snapshot,documents),snapshot,documents});const result=await deliverMail(supabase,job);if(!result.error)await supabase.from('orders').update({invoice_sent:true}).eq('id',id);revalidatePath('/dashboard/admin');revalidatePath(`/dashboard/orders/${id}`);return result}catch{return {error:'Email could not be prepared. Please retry.'}}
}
export async function retryMail(raw:unknown){const {supabase}=await founderClient();const p=z.string().uuid().safeParse(raw);if(!p.success)return {error:'Invalid email.'};const {data:job}=await supabase.from('billing_mail').select('*').eq('id',p.data).single();if(!job)return {error:'Email not found.'};const result=await deliverMail(supabase,job);revalidatePath('/dashboard/admin');return result}
