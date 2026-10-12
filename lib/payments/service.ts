import 'server-only'
import {randomUUID} from 'node:crypto'
import {embeddedOptions,resumeEmbeddedSession} from './checkout'
import {paymentDb,stripeClient} from './server'
import {billingSettings,paymentSnapshot} from '@/lib/billing/service'
import {receiptEmail} from '@/lib/billing/email'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import type {BillingSnapshot,DocumentSelection} from '@/lib/billing/types'
import type {Installment,PaymentRequest,Transaction} from './types'
import {TERMS_VERSION} from './policy'
export async function issueInstallment(orderId:string,kind:Installment){
 const db=paymentDb(),{data:o,error}=await db.from('orders').select('*').eq('id',orderId).single();if(error||!o)throw new Error('Project not found.')
 const {data:a}=await db.auth.admin.getUserById(o.user_id);if(!a.user?.email)throw new Error('Client account not found.')
 const snapshot=paymentSnapshot(o,{email:a.user.email,full_name:a.user.user_metadata?.full_name||''},await billingSettings(db),'other',new Date().toISOString());snapshot.settled=false
 const {data:r,error:failure}=await db.rpc('koryx_issue_installment',{p_order_id:orderId,p_kind:kind,p_snapshot:snapshot});if(failure||!r)throw new Error(failure?.message||'Invoice could not be created.');return r
}
export async function emailRequest(r:PaymentRequest){const db=paymentDb();const job=await queueMail(db,{dedupe_key:'installment-invoice/'+r.id,user_id:r.user_id,to_address:r.snapshot.customer.email,from_address:r.snapshot.seller.from_email,subject:`Your Koryx invoice #${r.snapshot.invoice_number}`,html:receiptEmail(r.snapshot,'invoice'),snapshot:r.snapshot,documents:'invoice'});const result=await deliverMail(db,job);if(result.success)await db.from('orders').update({invoice_sent:true}).eq('id',r.order_id);return result}
export async function emailTransaction(t:Transaction,documents:DocumentSelection='receipt'){
 const db=paymentDb();const job=await queueMail(db,{dedupe_key:'transaction/'+t.id+'/'+documents,user_id:t.user_id,to_address:t.snapshot.customer.email,from_address:t.snapshot.seller.from_email,subject:`Your Koryx ${documents==='both'?'invoice & receipt':documents} #${t.snapshot.receipt_number}`,html:receiptEmail(t.snapshot,documents),snapshot:t.snapshot,documents});return deliverMail(db,job)
}
export async function settleRequest(r:PaymentRequest,source:'stripe'|'manual',stripeId:string|null,method:BillingSnapshot['method']='stripe',reference='',paidAt=new Date().toISOString(),cryptoAmount='',customer?:{name?:string;address?:string}){
 const db=paymentDb();const snapshot:BillingSnapshot={...r.snapshot,customer:{...r.snapshot.customer,...customer},settled:true,method,paid_at:paidAt,reference,crypto_amount:cryptoAmount,receipt_number:'RC-'+randomUUID().replaceAll('-','').slice(0,12).toUpperCase()}
 const {data:t,error}=await db.rpc('koryx_settle_installment',{p_request_id:r.id,p_snapshot:snapshot,p_source:source,p_stripe_id:stripeId});if(error||!t)throw new Error(error?.message||'Payment could not be saved.');return t
}
export async function openCheckout(r:PaymentRequest,userId:string){
 if(r.user_id!==userId||r.status!=='open')throw new Error('This invoice is no longer payable.')
 const db=paymentDb(),stripe=stripeClient()
 const {data:state}=await db.from('project_billing_state').select('*').eq('order_id',r.order_id).single();if(state?.cancelled_at)throw new Error('Project cancelled.')
 if(r.kind==='balance'&&!state?.approved_at)throw new Error('Approve the completed work before paying the final balance.')
 if(!state?.accepted_at||state.terms_version!==TERMS_VERSION)throw new Error('Review and accept the payment terms first.')
 let {data:attempt}=await db.from('checkout_attempts').select('*').eq('request_id',r.id).in('status',['creating','open']).maybeSingle()
 if(attempt?.session_id){const secret=await resumeEmbeddedSession(stripe,attempt.session_id);if(secret)return secret;await db.from('checkout_attempts').update({status:'expired'}).eq('id',attempt.id);attempt=null}
 if(attempt&&Date.now()-Date.parse(attempt.created_at)<60000)throw new Error('Checkout is being prepared. Try again shortly.')
 // A stale creating attempt is retried with its original Stripe idempotency key.
 if(!attempt){const result=await db.from('checkout_attempts').insert({request_id:r.id,order_id:r.order_id,user_id:userId,amount_cents:r.amount_cents,snapshot:r.snapshot}).select('*').single();if(result.error||!result.data)throw new Error('Another checkout is opening. Try again shortly.');attempt=result.data}
 const session=await stripe.checkout.sessions.create({...embeddedOptions(`/pay/${r.id}?checkout=success`),mode:'payment',customer_email:r.snapshot.customer.email,client_reference_id:attempt.id,line_items:[{price_data:{currency:'cad',unit_amount:r.amount_cents,product_data:{name:`Koryx · ${r.snapshot.project.name}`,description:r.kind==='deposit'?'50% project deposit':r.kind==='balance'?'Final project balance':'Full project payment'}},quantity:1}],metadata:{koryx_attempt:attempt.id,koryx_request:r.id},payment_intent_data:{metadata:{koryx_attempt:attempt.id,koryx_request:r.id}},expires_at:Math.floor(Date.now()/1000)+1860,consent_collection:{terms_of_service:'required'},custom_text:{submit:{message:'Project payments are one-time. The remaining balance is never charged automatically. See koryx.ca/terms for the 50% cancellation policy.'}}},{idempotencyKey:'koryx-checkout/'+attempt.id})
 const {error}=await db.from('checkout_attempts').update({session_id:session.id,session_url:session.url,expires_at:new Date(session.expires_at*1000).toISOString(),status:'open'}).eq('id',attempt.id);if(error||!session.client_secret)throw new Error('Checkout was prepared but could not be saved. Try again shortly.');return session.client_secret
}
