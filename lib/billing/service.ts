import 'server-only'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database,Order,Profile} from '@/lib/supabase/types'
import {defaultBilling,type BillingSnapshot,type BillingSettings,type PaymentMethod} from './types'
import {rounded} from './schema'
import {sendReceipt} from './email'
import {randomUUID} from 'node:crypto'
export async function billingSettings(db:SupabaseClient<Database>){const {data,error}=await db.from('billing_settings').select('*').eq('id',true).single();if(error)throw new Error('Billing settings could not be loaded. Apply the manager migration.');return {...defaultBilling,...data,tax_rate:0,seller_address:'',tax_id:''}}
export function paymentSnapshot(order:Order,customer:Pick<Profile,'email'|'full_name'>,seller:BillingSettings,method:PaymentMethod,paidAt:string,reference='',cryptoAmount=''):BillingSnapshot{
 const now=new Date().toISOString(),suffix=randomUUID().replaceAll('-','').slice(0,12).toUpperCase();const items=(order.delivery?.billing_items?.length?order.delivery.billing_items:[{description:order.business_name+' — '+order.website_type,quantity:1,unit_price:Number(order.quote_price)}]).map(i=>({...i,amount:rounded(i.quantity*i.unit_price)}));const subtotal=rounded(items.reduce((sum,i)=>sum+i.amount,0));if(subtotal!==Number(order.quote_price))throw new Error('Service total does not match the agreed quote. Save the project first.');return {version:1,invoice_number:`KX-${now.slice(0,4)}-${suffix}`,receipt_number:`RC-${suffix}`,issued_at:now,paid_at:paidAt,currency:'CAD',seller:{...seller,seller_address:'',tax_id:'',tax_rate:0},customer:{name:order.delivery?.bill_to_name||customer.full_name||customer.email,email:customer.email,address:''},project:{id:order.id,name:order.business_name},items,subtotal,tax:0,total:subtotal,method,reference,crypto_amount:cryptoAmount}
}
export async function deliverPayment(db:SupabaseClient<Database>,id:string){
 const {data:p,error}=await db.from('project_payments').select('*').eq('id',id).single();if(error||!p)return {error:'Payment record was not found.'};if(p.email_status==='sent')return {success:true,emailId:p.email_id};
 if(!process.env.RESEND_API_KEY)return {error:'Payment is saved; configure RESEND_API_KEY in Vercel to send both PDFs.'};
 if(p.attempted_at&&Date.now()-Date.parse(p.attempted_at)>23*3600000)return {error:'A previous request is older than the safe retry window. Check Resend logs before sending another email.'};
 if(p.email_status==='sending'&&p.attempted_at&&Date.now()-Date.parse(p.attempted_at)<60000)return {error:'Email delivery is already in progress. Refresh shortly.'};
 const {data:claimed}=await db.from('project_payments').update({email_status:'sending',attempted_at:p.attempted_at||new Date().toISOString(),email_error:null}).eq('id',id).eq('email_status',p.email_status).select('id').maybeSingle();if(!claimed)return {error:'Another request is handling this email. Refresh shortly.'};
 let sent;try{sent=await sendReceipt(p.snapshot,'koryx-payment/'+p.id)}catch{sent={error:'PDF documents could not be generated. Check the server logs.',uncertain:false}}
 if(sent.error){await db.from('project_payments').update({email_status:sent.uncertain?'uncertain':'failed',email_error:sent.error}).eq('id',id);return {error:sent.error}}
 const saved=await db.from('project_payments').update({email_status:'sent',email_id:sent.id,email_error:null}).eq('id',id);await db.from('orders').update({invoice_sent:true}).eq('id',p.order_id);if(saved.error)return {error:'Resend accepted the email but the status could not be saved. Refresh before retrying.'};return {success:true,emailId:sent.id}
}
