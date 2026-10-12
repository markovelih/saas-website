import 'server-only'
import {randomUUID} from 'node:crypto'
import type Stripe from 'stripe'
import {paymentDb,stripeClient,SITE} from './server'
import {billingSettings} from '@/lib/billing/service'
import type {BillingSnapshot} from '@/lib/billing/types'
import type {CareService} from './types'
const stripeId=(v:string|{id:string}|null|undefined)=>typeof v==='string'?v:v?.id
export async function careSnapshot(c:CareService,paidAt:string):Promise<BillingSnapshot>{
 const db=paymentDb(),[{data:auth},{data:order}]=await Promise.all([db.auth.admin.getUserById(c.user_id),db.from('orders').select('business_name,delivery').eq('id',c.order_id).single()]);if(!auth.user?.email||!order)throw new Error('Customer not found.')
 const suffix=randomUUID().replaceAll('-','').slice(0,12).toUpperCase(),price=c.amount_cents/100
 return {version:1,invoice_number:'KX-'+new Date().getUTCFullYear()+'-'+suffix,receipt_number:'RC-'+suffix,issued_at:paidAt,paid_at:paidAt,currency:'CAD',seller:await billingSettings(db),customer:{email:auth.user.email,name:order.delivery?.bill_to_name||auth.user.user_metadata.full_name||auth.user.email,address:''},project:{id:c.order_id,name:order.business_name},items:[{description:c.name+' · '+(c.interval==='year'?'annual':'monthly')+' renewal',quantity:1,unit_price:price,amount:price}],subtotal:price,tax:0,total:price,settled:true,method:'stripe',reference:'',crypto_amount:''}
}
export async function openCareCheckout(c:CareService,userId:string){
 if(c.user_id!==userId||!['inactive','cancelled'].includes(c.status)||c.subscription_id)throw new Error('An automatic renewal already exists.')
 const db=paymentDb(),stripe=stripeClient(),date=Math.floor(Date.parse(c.next_date+'T12:00:00Z')/1000)
 // Keep a future first charge on the recorded renewal date; Stripe requires >=48h for a Checkout trial.
 if(date<Math.floor(Date.now()/1000)+172800)throw new Error('Automatic renewal needs a first charge date at least 48 hours away. Ask Koryx to arrange this renewal and set the next date.')
 let {data:a}=await db.from('checkout_attempts').select('*').eq('care_id',c.id).in('status',['creating','open']).maybeSingle()
 if(a?.session_id){const s=await stripe.checkout.sessions.retrieve(a.session_id);if(s.status==='open'&&s.url)return s.url;if(s.status==='complete')throw new Error('Your renewal is being confirmed. Refresh shortly.');await db.from('checkout_attempts').update({status:'expired'}).eq('id',a.id);a=null}
 if(a&&Date.now()-Date.parse(a.created_at)<60000)throw new Error('Checkout is being prepared. Try again shortly.')
 if(!a){const {data,error}=await db.from('checkout_attempts').insert({care_id:c.id,order_id:c.order_id,user_id:userId,amount_cents:c.amount_cents,snapshot:await careSnapshot(c,new Date().toISOString())}).select('*').single();if(error||!data)throw new Error('Another checkout is being prepared.');a=data}
 const s=await stripe.checkout.sessions.create({mode:'subscription',customer_email:a.snapshot!.customer.email,allowed_payment_method_types:['card'],payment_method_collection:'always',line_items:[{price_data:{currency:'cad',unit_amount:c.amount_cents,recurring:{interval:c.interval},product_data:{name:'Koryx · '+c.name}},quantity:1}],subscription_data:{trial_end:date,metadata:{koryx_care:c.id,koryx_attempt:a.id}},metadata:{koryx_care:c.id,koryx_attempt:a.id},consent_collection:{terms_of_service:'required'},custom_text:{submit:{message:`Automatic ${c.interval==='year'?'annual':'monthly'} renewal. First charge on ${c.next_date}. Cancel future renewals in your Koryx dashboard.`}},success_url:SITE+'/dashboard/renewals?checkout=success',cancel_url:SITE+'/dashboard/renewals?checkout=cancelled',expires_at:Math.floor(Date.now()/1000)+1860},{idempotencyKey:'koryx-care/'+a.id})
 const {error}=await db.from('checkout_attempts').update({session_id:s.id,session_url:s.url,expires_at:new Date(s.expires_at*1000).toISOString(),status:'open'}).eq('id',a.id);if(error||!s.url)throw new Error('Checkout could not be saved. Please retry shortly.');return s.url
}
export async function syncSubscription(sub:Stripe.Subscription){
 const id=sub.metadata.koryx_care;if(!id)return
 const db=paymentDb(),{data:c}=await db.from('care_services').select('*').eq('id',id).single();if(!c)return
 if(c.subscription_id&&c.subscription_id!==sub.id)throw new Error('Renewal subscription mismatch.')
 const {data:a}=await db.from('checkout_attempts').select('*').eq('id',sub.metadata.koryx_attempt||'00000000-0000-0000-0000-000000000000').eq('care_id',id).single();if(!a)return
 const item=sub.items.data[0];if(sub.items.data.length!==1||item.price.currency!=='cad'||item.price.unit_amount!==a.amount_cents||item.price.recurring?.interval!==c.interval)throw new Error('Renewal price mismatch.')
 const state=sub.status==='canceled'?'cancelled':['past_due','unpaid','incomplete_expired'].includes(sub.status)?'past_due':['active','trialing'].includes(sub.status)?'active':'inactive'
 const next=(sub.trial_end&&sub.trial_end>Date.now()/1000?sub.trial_end:item.current_period_end)
 const {error}=await db.from('care_services').update({subscription_id:sub.id,customer_id:stripeId(sub.customer),status:state,cancel_at_period_end:sub.cancel_at_period_end,next_date:new Date(next*1000).toISOString().slice(0,10)}).eq('id',id);if(error)throw new Error('Could not sync renewal.')
}
export async function settleCareInvoice(invoice:Stripe.Invoice){
 const subId=stripeId(invoice.parent?.subscription_details?.subscription);if(!subId||invoice.status!=='paid'||invoice.amount_paid<=0)return null
 const stripe=stripeClient(),sub=await stripe.subscriptions.retrieve(subId);if(!sub.metadata.koryx_care)return null
 await syncSubscription(sub)
 const db=paymentDb(),{data:c}=await db.from('care_services').select('*').eq('subscription_id',subId).single();if(!c)throw new Error('Care service not found.')
 if(invoice.currency!=='cad'||invoice.amount_paid!==c.amount_cents)throw new Error('Renewal invoice amount mismatch.')
 const payments=await stripe.invoicePayments.list({invoice:invoice.id,status:'paid',limit:10})
 const paid=payments.data.find(p=>p.payment.type==='payment_intent'&&p.amount_paid===invoice.amount_paid),pi=stripeId(paid?.payment.payment_intent);if(!pi)throw new Error('Renewal card payment not found.')
 const snapshot=await careSnapshot(c,new Date((invoice.status_transitions.paid_at||invoice.created)*1000).toISOString());snapshot.reference=invoice.id
 const {data:t,error}=await db.rpc('koryx_settle_care',{p_care_id:c.id,p_snapshot:snapshot,p_stripe_id:pi,p_due_date:new Date(invoice.period_start*1000).toISOString().slice(0,10),p_next_date:c.next_date});if(error||!t)throw new Error(error?.message||'Renewal could not be recorded.');
 const intent=await stripe.paymentIntents.retrieve(pi,{expand:['latest_charge']});const charge=intent.latest_charge;if(charge&&typeof charge!=='string'&&charge.amount_refunded){const {error:e}=await db.rpc('koryx_sync_refund',{p_stripe_id:pi,p_refunded_cents:charge.amount_refunded});if(e)throw new Error('Could not sync an existing renewal refund.')}return t
}
