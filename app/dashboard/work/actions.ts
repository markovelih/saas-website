'use server'
import {revalidatePath} from 'next/cache'
import {workspaceSession} from '@/lib/workspace'
import {founderClient} from '@/lib/supabase/admin'
import {workRequestSchema,founderWorkSchema} from '@/lib/work/schema'
import {validateDiagnostic,validateServiceChanges,type WorkOrigin,workKinds} from '@/lib/billing/service-catalog'
import {totals} from '@/lib/billing/pricing'
import type {Order} from '@/lib/supabase/types'
function refresh(id:string,parent:string|null){for(const p of ['/dashboard','/dashboard/admin','/dashboard/orders','/dashboard/orders/'+id,...(parent?['/dashboard/orders/'+parent]:[])])revalidatePath(p)}
export async function requestAdditionalWork(raw:unknown){
 const p=workRequestSchema.safeParse(raw);if(!p.success)return {error:p.error.issues[0].message};const v=p.data,{supabase,user}=await workspaceSession()
 let parent:Order|null=null
 if(v.parent_id){const {data}=await supabase.from('orders').select('id,user_id,business_name,parent_order_id,work_origin,status,paid').eq('id',v.parent_id).eq('user_id',user.id).maybeSingle();if(!data||data.parent_order_id)return {error:'Choose one of your existing projects.'};parent=data as Order}
 const origin:WorkOrigin=parent?.work_origin||'external'
 if(v.kind==='diagnostic'&&origin!=='external')return {error:'For a Koryx project, choose an update or bug fix instead.'}
 const {data,error}=await supabase.from('orders').insert({user_id:user.id,parent_order_id:parent?.id||null,work_kind:v.kind,work_origin:origin,business_name:v.title,website_type:workKinds[v.kind],budget:v.budget?`CAD ${v.budget}`:'Scope review before quote',description:v.brief,contact_email:user.email!,features:[],deadline:null,pages:null,design_style:null,phone:null,references:v.website_url||null,assignment_key:v.request_id,delivery:{website_url:v.website_url}}).select('id').single()
 if(error?.code==='23505'){const {data:old}=await supabase.from('orders').select('id').eq('assignment_key',v.request_id).eq('user_id',user.id).maybeSingle();if(old)return {id:old.id}}
 if(error||!data)return {error:'Could not save your request. Please try again.'};refresh(data.id,parent?.id||null);return {id:data.id}
}
export async function addWorkQuote(raw:unknown){
 const p=founderWorkSchema.safeParse(raw);if(!p.success)return {error:p.error.issues[0].message};const v=p.data,{supabase}=await founderClient()
 const {data:profile}=await supabase.from('profiles').select('id').eq('id',v.user_id).single();const {data:auth}=await supabase.auth.admin.getUserById(v.user_id);if(!profile||!auth.user?.email)return {error:'Choose an existing client account.'}
 let parent:Order|null=null
 if(v.parent_id){const {data}=await supabase.from('orders').select('*').eq('id',v.parent_id).eq('user_id',v.user_id).single();if(!data||data.parent_order_id)return {error:'Choose the original project for this client.'};parent=data}
 const origin:WorkOrigin=parent?.work_origin||'external';if(v.kind==='diagnostic'&&origin!=='external')return {error:'Diagnostics are for external projects.'}
 if(v.kind==='diagnostic'){const invalid=validateDiagnostic(v.items);if(invalid)return {error:invalid}}
 const invalid=validateServiceChanges(v.items,v.discount,[],undefined,origin);if(invalid)return {error:invalid};const total=totals(v.items,v.discount).total;if(total<=0)return {error:'Save a positive quote.'}
 const {data,error}=await supabase.from('orders').insert({user_id:v.user_id,parent_order_id:parent?.id||null,work_kind:v.kind,work_origin:origin,business_name:v.title,website_type:workKinds[v.kind],budget:`CAD ${total}`,description:v.brief,contact_email:auth.user.email,admin_notes:v.private_notes||null,features:[],deadline:null,pages:null,design_style:null,phone:null,references:null,quote_price:total,status:'in_review',assignment_key:v.request_id,delivery:{website_url:v.website_url,billing_items:v.items,discount:v.discount,service_status:'not_launched'}}).select('id').single()
 if(error?.code==='23505'){const {data:old}=await supabase.from('orders').select('id').eq('assignment_key',v.request_id).maybeSingle();if(old)return {id:old.id}}
 if(error||!data)return {error:'Could not save the work quote. Please retry.'};refresh(data.id,parent?.id||null);return {id:data.id}
}
export async function sendDiagnosticFindings(raw:unknown){
 const p=workRequestSchema.shape.request_id.safeParse(raw);if(!p.success)return {error:'Invalid project.'};const {supabase}=await founderClient()
 const {data:order}=await supabase.from('orders').select('*').eq('id',p.data).single();if(!order||order.work_kind!=='diagnostic'||!order.delivery?.diagnostic_report?.trim())return {error:'Save the diagnostic report first.'}
 const {data:auth}=await supabase.auth.admin.getUserById(order.user_id);if(!auth.user?.email)return {error:'Client account not found.'}
 const {createHash}=await import('node:crypto'),{queueMail,deliverMail}=await import('@/lib/billing/outbox')
 const fingerprint=createHash('sha256').update(order.delivery.diagnostic_report).digest('hex').slice(0,24)
 const job=await queueMail(supabase,{dedupe_key:`diagnostic/${order.id}/${fingerprint}`,user_id:order.user_id,to_address:auth.user.email,from_address:'support@koryx.ca',subject:'Your Koryx diagnostic findings are ready',html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#fff;color:#171717;padding:32px"><p style="font-size:24px;letter-spacing:5px">koryx</p><h1 style="font-size:26px">Your diagnostic review is ready.</h1><p style="color:#666;line-height:1.7">Read the findings in your secure project workspace. We will agree on any repair scope, price and timeline separately before work begins.</p><a href="https://koryx.ca/dashboard/orders/${order.id}" style="display:inline-block;background:#171717;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none">View findings</a><p style="color:#777;font-size:12px;margin-top:32px">Questions? Reply to support@koryx.ca.</p></div>`,snapshot:null,documents:'none'})
 return deliverMail(supabase,job)
}
