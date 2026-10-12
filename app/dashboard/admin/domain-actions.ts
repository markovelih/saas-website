'use server'
import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import {domainSchema,paymentSchema} from '@/lib/billing/schema'
import {domainRetail} from '@/lib/billing/pricing'
import {billingSettings,paymentSnapshot} from '@/lib/billing/service'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {nextAnnualDate} from '@/lib/domains/calendar'
import {receiptEmail} from '@/lib/billing/email'
import {revalidatePath} from 'next/cache'
export async function saveDomain(raw:unknown){
 const {supabase}=await founderClient();const p=z.object({order_id:z.string().uuid(),domain:domainSchema}).safeParse(raw);if(!p.success)return {error:p.error.issues[0].message};const {data:o}=await supabase.from('orders').select('*').eq('id',p.data.order_id).single();if(!o)return {error:'Project not found.'};const d=p.data.domain,retail=domainRetail(d.cost_price)
 if(d.id){const {data:old}=await supabase.from('order_domains').select('id,order_id,hostname').eq('id',d.id).single();if(!old||old.order_id!==o.id)return {error:'Domain not found.'};if(old.hostname!==d.hostname)return {error:'Create a separate domain instead of renaming an existing one.'}}
 const {error}=await supabase.rpc('koryx_save_domain',{p_order_id:o.id,p_domain:{...d,retail_price:retail}});if(error)return {error:'Could not save the domain. Check its renewal date and outstanding payment.'}
 revalidatePath('/dashboard/admin');revalidatePath(`/dashboard/orders/${o.id}`);return {success:true}
}
export async function confirmRenewal(raw:unknown){
 const {supabase}=await founderClient();const p=paymentSchema.extend({next_date:z.string().refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v))}).safeParse(raw);if(!p.success)return {error:p.error.issues[0].message};const v=p.data;if(Date.parse(v.paid_at)>Date.now()+60000)return {error:'Payment date cannot be in the future.'};const {data:r}=await supabase.from('domain_renewals').select('*').eq('id',v.id).single();if(!r)return {error:'Renewal not found.'};const {data:d}=await supabase.from('order_domains').select('*').eq('id',r.domain_id).single();const {data:o}=await supabase.from('orders').select('*').eq('id',r.order_id).single();const {data:auth}=await supabase.auth.admin.getUserById(r.user_id);if(!d||!o||!auth.user?.email)return {error:'Client domain not found.'};const snapshot=r.snapshot?{...r.snapshot,settled:true,receipt_number:r.snapshot.receipt_number||'RC-'+crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase(),paid_at:v.paid_at,method:v.method,reference:v.reference,crypto_amount:v.crypto_amount}:paymentSnapshot({...o,quote_price:Number(r.amount),delivery:{bill_to_name:o.delivery?.bill_to_name,billing_items:[{description:`Domain renewal — ${d.hostname} · 1 year`,quantity:1,unit_price:Number(r.amount)}]}},{email:auth.user.email,full_name:auth.user.user_metadata?.full_name||''},await billingSettings(supabase),v.method,v.paid_at,v.reference,v.crypto_amount)
 const {data:paid,error}=await supabase.rpc('koryx_settle_renewal',{p_id:r.id,p_snapshot:snapshot,p_next_date:v.next_date||nextAnnualDate(r.due_date)});if(error||!paid)return {error:'Could not record this renewal. Check the amount and next date.'}
 const savedSnapshot=paid.snapshot!;
 try{const job=await queueMail(supabase,{dedupe_key:`renewal/${r.id}/${v.documents}`,user_id:r.user_id,to_address:savedSnapshot.customer.email,from_address:savedSnapshot.seller.from_email,subject:`Your domain renewal ${v.documents==='both'?'invoice & receipt':v.documents} from Koryx`,html:receiptEmail(savedSnapshot,v.documents),snapshot:savedSnapshot,documents:v.documents});const sent=await deliverMail(supabase,job);revalidatePath('/dashboard/admin');revalidatePath(`/dashboard/orders/${o.id}`);return {...sent,recorded:true}}catch{return {error:'Payment is recorded. Retry the email from Billing & email.',recorded:true}}
}
