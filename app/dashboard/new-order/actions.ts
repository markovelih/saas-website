'use server'
import { createClient } from '@/lib/supabase/server'
import {paymentDb} from '@/lib/payments/server'
import {monthlyEstimate} from '@/lib/projects/monthly-pricing'
import { revalidatePath } from 'next/cache'
import { orderSchema } from '@/lib/project-planner/schema'
import { buildEstimate, normalizeFeatures, projectTypes, featureCatalog } from '@/lib/project-planner/catalog'
import { verifyEstimate } from '@/lib/project-planner/signature'
import {verifyDomainQuote} from '@/lib/domains/search'
import { serializePlan } from '@/lib/project-planner/snapshot'
export async function createOrder(raw:unknown){
 const parsed=orderSchema.safeParse(raw);if(!parsed.success)return {error:parsed.error.issues[0].message}
 const data=parsed.data;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:'Please sign in again.'}
 const domains=data.domainTokens.map(token=>verifyDomainQuote(token,user.id));if(domains.some(d=>!d))return {error:'Your domain price expired. Search and choose the domain again.'};
 const input={type:data.type,budget:data.budget,pages:data.pages,features:normalizeFeatures(data.type,data.features),brief:data.brief}
 const estimate=data.estimateToken?verifyEstimate(data.estimateToken,user.id,input):buildEstimate(input)
 if(!estimate)return {error:'Your AI estimate expired or the scope changed. Review your plan again.'}
 const orderData={user_id:user.id,purchase_mode:data.purchaseMode,business_name:data.businessName,website_type:projectTypes.find(t=>t.id===data.type)!.title,budget:`CAD ${data.budget.toLocaleString('en-CA')}`,deadline:data.deadline||null,pages:String(data.pages),design_style:data.designStyle||null,features:input.features.map(id=>featureCatalog.find(f=>f.id===id)!.title),description:serializePlan({input,estimate,brief:data.brief,domains:domains.filter(d=>d!==null),purchaseMode:data.purchaseMode,monthlyEstimate:data.purchaseMode==='managed'?monthlyEstimate(data.type,estimate):undefined}),contact_email:data.contactEmail,phone:data.phone||null,references:data.references||null}
 const {data:orderId,error}=await paymentDb().rpc('koryx_create_project_request',{p_id:data.requestId,p_order:orderData,p_files:data.materials})
 if(error||!orderId)return {error:'Could not save your project. Please try again.'}
 for(const path of ['/dashboard','/dashboard/orders','/dashboard/admin'])revalidatePath(path)
 return {id:orderId}
}
