import 'server-only'
import type Stripe from 'stripe'
import {paymentDb,stripeClient} from './server'
import {settleRequest,emailTransaction} from './service'
import {syncSubscription,settleCareInvoice} from './care'
const idOf=(v:string|{id:string}|null)=>typeof v==='string'?v:v?.id
export async function handleStripeEvent(event:Stripe.Event){
 const db=paymentDb(),stripe=stripeClient()
 const {data:old,error:readError}=await db.from('stripe_events').select('id').eq('id',event.id).maybeSingle();if(readError)throw new Error('Event store unavailable.');if(old)return
 if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired','checkout.session.async_payment_failed'].includes(event.type)){
  const session=event.data.object as Stripe.Checkout.Session,attemptId=session.metadata?.koryx_attempt
  if(attemptId){
   const {data:a,error}=await db.from('checkout_attempts').select('*').eq('id',attemptId).single();if(error||!a)throw new Error('Checkout attempt not found.')
   if(a.session_id&&a.session_id!==session.id)throw new Error('Checkout session mismatch.')
   if(session.client_reference_id&&session.client_reference_id!==a.id)throw new Error('Checkout owner mismatch.')
   if(event.type==='checkout.session.expired'||event.type==='checkout.session.async_payment_failed'){
    const {error:e}=await db.from('checkout_attempts').update({status:'expired'}).eq('id',a.id).neq('status','completed');if(e)throw new Error('Could not release checkout.')
   }else if(a.request_id&&session.payment_status==='paid'){
    if(session.currency!=='cad'||session.amount_total!==a.amount_cents||session.metadata?.koryx_request!==a.request_id||session.mode!=='payment')throw new Error('Payment amount mismatch.')
    const {data:r}=await db.from('payment_requests').select('*').eq('id',a.request_id).single();if(!r||r.user_id!==a.user_id||r.amount_cents!==a.amount_cents)throw new Error('Invoice mismatch.')
    const pi=idOf(session.payment_intent);if(!pi)throw new Error('Payment intent missing.')
    const intent=await stripe.paymentIntents.retrieve(pi,{expand:['latest_charge']});if(intent.status!=='succeeded'||intent.currency!=='cad'||intent.amount_received!==a.amount_cents||intent.metadata.koryx_attempt!==a.id)throw new Error('Payment not verified.')
    const t=await settleRequest(r,'stripe',pi,'stripe',pi,new Date(event.created*1000).toISOString());const charge=intent.latest_charge;if(charge&&typeof charge!=='string'&&charge.amount_refunded){const {error}=await db.rpc('koryx_sync_refund',{p_stripe_id:pi,p_refunded_cents:charge.amount_refunded});if(error)throw new Error('Could not sync an existing refund.')}await emailTransaction(t)
    const {error:e}=await db.from('checkout_attempts').update({status:'completed',session_id:session.id}).eq('id',a.id);if(e)throw new Error('Could not complete checkout.')
   }else if(a.care_id&&session.mode==='subscription'&&session.subscription){
    if(session.metadata?.koryx_care!==a.care_id)throw new Error('Care checkout mismatch.')
    await syncSubscription(await stripe.subscriptions.retrieve(idOf(session.subscription)!))
    const {error:e}=await db.from('checkout_attempts').update({status:'completed',session_id:session.id}).eq('id',a.id);if(e)throw new Error('Could not complete renewal setup.')
   }
  }
 }else if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)){
  const sub=event.data.object as Stripe.Subscription;if(sub.metadata.koryx_care)await syncSubscription(await stripe.subscriptions.retrieve(sub.id))
 }else if(event.type==='invoice.paid'){
  const t=await settleCareInvoice(await stripe.invoices.retrieve((event.data.object as Stripe.Invoice).id));if(t)await emailTransaction(t)
 }else if(event.type==='invoice.payment_failed'){
  const invoice=event.data.object as Stripe.Invoice,id=idOf(invoice.parent?.subscription_details?.subscription||null);if(id){const sub=await stripe.subscriptions.retrieve(id);if(sub.metadata.koryx_care)await syncSubscription(sub)}
 }else if(event.type==='charge.refunded'){
  const charge=await stripe.charges.retrieve((event.data.object as Stripe.Charge).id),pi=idOf(charge.payment_intent)
  if(pi){const {error}=await db.rpc('koryx_sync_refund',{p_stripe_id:pi,p_refunded_cents:charge.amount_refunded});if(error)throw new Error('Refund could not be synchronized.')}
 }
 const {error:writeError}=await db.from('stripe_events').insert({id:event.id,type:event.type});if(writeError&&writeError.code!=='23505')throw new Error('Event receipt could not be saved.')
}
