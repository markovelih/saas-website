'use server'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
import {workspaceSession} from '@/lib/workspace'
import {founderClient} from '@/lib/supabase/admin'
import {paymentDb,stripeClient} from '@/lib/payments/server'
import {openCareCheckout,syncSubscription} from '@/lib/payments/care'
const uuid=z.string().uuid()
export async function configureCare(raw:unknown){
 await founderClient();const p=z.object({order_id:uuid,domain_id:uuid.nullable(),kind:z.enum(['domain','hosting']),name:z.string().trim().min(2).max(150),amount:z.number().positive().max(10000).refine(n=>Math.abs(Math.round(n*100)-n*100)<0.000001),interval:z.enum(['month','year']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d=>!Number.isNaN(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d)}).safeParse(raw);if(!p.success)return {error:'Check the renewal details.'}
 const d=p.data,db=paymentDb(),{data:o}=await db.from('orders').select('id,user_id').eq('id',d.order_id).single();if(!o)return {error:'Project not found.'}
 let lookup=db.from('care_services').select('*').eq('order_id',o.id).eq('kind',d.kind);lookup=d.domain_id?lookup.eq('domain_id',d.domain_id):lookup.is('domain_id',null);const {data:old}=await lookup.maybeSingle();if(old?.subscription_id||old?.consented_at)return {error:'Cancel the existing automatic renewal before changing its terms. Contact support to arrange a new plan.'}
 if(d.kind==='domain'){if(!d.domain_id||d.interval!=='year')return {error:'Choose an annual domain renewal.'};const {data:domain}=await db.from('order_domains').select('id,hostname,retail_price,renewal_date').eq('id',d.domain_id).eq('order_id',o.id).single();if(!domain||domain.hostname!==d.name||Math.round(Number(domain.retail_price)*100)!==Math.round(d.amount*100)||domain.renewal_date!==d.date)return {error:'Save matching domain price and renewal date first.'}}else if(d.domain_id)return {error:'Hosting cannot have a domain ID.'}
 const value={order_id:o.id,user_id:o.user_id,domain_id:d.domain_id,kind:d.kind,name:d.name,amount_cents:Math.round(d.amount*100),interval:d.interval,next_date:d.date}
 const result=old?await db.from('care_services').update(value).eq('id',old.id).is('consented_at',null).is('subscription_id',null).select('id').single():await db.from('care_services').insert(value);if(result.error)return {error:'Renewal plan could not be saved.'};revalidatePath('/dashboard/admin');revalidatePath('/dashboard/renewals');return {success:true}
}
export async function enableCare(raw:unknown){
 const p=z.object({id:uuid,consent:z.literal(true)}).safeParse(raw);if(!p.success)return {error:'Agree to the renewal price and schedule.'};const {user}=await workspaceSession(),db=paymentDb(),{data:c}=await db.from('care_services').select('*').eq('id',p.data.id).eq('user_id',user.id).single();if(!c)return {error:'Renewal not found.'}
 try{const {error}=await db.from('care_services').update({consented_at:new Date().toISOString()}).eq('id',c.id).eq('amount_cents',c.amount_cents).eq('next_date',c.next_date).eq('interval',c.interval).select('id').single();if(error)throw new Error('Consent could not be saved.');return {url:await openCareCheckout(c,user.id)}}catch(e){return {error:e instanceof Error?e.message:'Renewal checkout could not be opened.'}}
}
export async function stopCare(raw:unknown){
 const p=z.object({id:uuid,confirm:z.literal(true)}).safeParse(raw);if(!p.success)return {error:'Confirm you want to stop future automatic renewals.'};const {user}=await workspaceSession(),{data:c}=await paymentDb().from('care_services').select('*').eq('id',p.data.id).eq('user_id',user.id).single();if(!c?.subscription_id)return {error:'Active renewal not found.'}
 try{const sub=await stripeClient().subscriptions.update(c.subscription_id,{cancel_at_period_end:true},{idempotencyKey:'koryx-stop/'+c.subscription_id});await syncSubscription(sub);revalidatePath('/dashboard/renewals');revalidatePath('/dashboard/admin');return {success:true}}catch{return {error:'Automatic renewal could not be stopped. Contact support.'}}
}
