import 'server-only'
import {createClient} from '@supabase/supabase-js'
import {workspaceSession,isFounder} from '@/lib/workspace'
import {redirect} from 'next/navigation'
import type {Database} from './types'
export async function founderClient(){const {user,profile}=await workspaceSession();if(!isFounder(user.id))redirect('/dashboard');return {user,profile,supabase:createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})}}
