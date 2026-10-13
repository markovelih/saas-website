import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
export async function workspaceSession(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');const {data:profile}=await supabase.from('profiles').select('id,full_name,email,role,created_at').eq('id',user.id).maybeSingle();return {supabase,user,profile}}
export function isFounder(id:string){return id==='2f0a1860-cb7a-4104-967d-86ccc9166cdc'}
export const clientOrderColumns='id,user_id,business_name,website_type,budget,deadline,pages,design_style,features,description,contact_email,phone,references,status,quote_price,invoice_sent,paid,created_at,delivery,parent_order_id,work_kind,work_origin'
