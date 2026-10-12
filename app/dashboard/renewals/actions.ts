'use server'
import {createClient} from '@/lib/supabase/server'
import {createClient as adminClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
export async function submitRenewalPayment(raw:unknown){const parsed=z.object({id:z.string().uuid(),method:z.enum(['usdt_trc20','btc']),reference:z.string().trim().min(5).max(200)}).safeParse(raw);if(!parsed.success)return {error:parsed.error.issues[0].message};const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)return {error:'Sign in again.'};const admin=adminClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});const {data:row,error}=await admin.from('domain_renewals').update({status:'submitted',payment_method:parsed.data.method,payment_reference:parsed.data.reference}).eq('id',parsed.data.id).eq('user_id',user.id).eq('status','due').select('id').maybeSingle();if(error||!row)return {error:'This renewal is already submitted or paid. Refresh to check its status.'};revalidatePath('/dashboard/renewals');return {success:true}}
