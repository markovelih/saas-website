'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { orderSchema } from '@/lib/project-planner/schema'
import { buildEstimate, normalizeFeatures, projectTypes, featureCatalog } from '@/lib/project-planner/catalog'
import { verifyEstimate } from '@/lib/project-planner/signature'
import { serializePlan } from '@/lib/project-planner/snapshot'
export async function createOrder(raw:unknown){
 const parsed=orderSchema.safeParse(raw);if(!parsed.success)return {error:parsed.error.issues[0].message}
 const data=parsed.data;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:'Please sign in again.'}
 const input={type:data.type,budget:data.budget,pages:data.pages,features:normalizeFeatures(data.type,data.features),brief:data.brief}
 const estimate=data.estimateToken?verifyEstimate(data.estimateToken,user.id,input):buildEstimate(input)
 if(!estimate)return {error:'Your AI estimate expired or the scope changed. Review your plan again.'}
 const {data:order,error}=await supabase.from('orders').insert({user_id:user.id,business_name:data.businessName,website_type:projectTypes.find(t=>t.id===data.type)!.title,budget:`CAD ${data.budget.toLocaleString('en-CA')}`,deadline:data.deadline||null,pages:String(data.pages),design_style:data.designStyle||null,features:input.features.map(id=>featureCatalog.find(f=>f.id===id)!.title),description:serializePlan({input,estimate,brief:data.brief}),contact_email:data.contactEmail,phone:data.phone||null,references:data.references||null}).select('id').single()
 if(error||!order)return {error:'Could not save your project. Please try again.'}
 for(const path of ['/dashboard','/dashboard/orders','/dashboard/admin'])revalidatePath(path)
 return {id:order.id}
}
