'use server'
import {workspaceSession} from '@/lib/workspace'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
export async function saveProfile(raw:unknown){const result=z.object({full_name:z.string().trim().min(2).max(100)}).safeParse(raw);if(!result.success)return {error:'Enter a name between 2 and 100 characters.'};const {supabase,user}=await workspaceSession();const {error}=await supabase.from('profiles').update(result.data).eq('id',user.id);if(error)return {error:'Your name could not be saved.'};revalidatePath('/dashboard','layout');return {success:true}}
