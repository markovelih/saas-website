import 'server-only'
import {ZodError} from 'zod'
import {createClient} from '@/lib/supabase/server'
import {createClient as createServiceClient} from '@supabase/supabase-js'
import {isFounder} from '@/lib/workspace'
import type {Database} from '@/lib/supabase/types'
import {firstName} from './policy'
export class ChatError extends Error {constructor(message:string,public status=400){super(message)}}
export async function chatSession(){
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)throw new ChatError('Sign in to open your project chats.',401)
 const {data:profile}=await db.from('profiles').select('id,full_name,role').eq('id',user.id).single()
 return {db,user,identity:{id:user.id,name:firstName(profile?.full_name,profile?.role==='admin'?'Developer':'Client'),founder:isFounder(user.id),staff:isFounder(user.id)||profile?.role==='admin'}}
}
export function chatStorageClient(){return createServiceClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function chatAccess(orderId:string,write=false){const session=await chatSession();const {data,error}=await session.db.rpc('koryx_chat_access',{p_order_id:orderId,p_write:write});if(error||!data)throw new ChatError('This conversation is not available.',403);return session}
export function chatDbError(error:{code?:string;message:string}|null){if(error)throw new ChatError(error.code==='P0001'?error.message:'The conversation could not be updated. Please retry.',error.code==='P0001'?400:503)}
export async function chatResponse(request:Request,action:()=>Promise<Response>){try{if(request.method!=='GET'){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new ChatError('Reload the page before trying again.',403)}return await action()}catch(error){return Response.json({error:error instanceof ChatError?error.message:error instanceof ZodError?'Check the message and try again.':'Chat is temporarily unavailable. Please retry.'},{status:error instanceof ChatError?error.status:error instanceof ZodError?400:503,headers:{'Cache-Control':'private, no-store'}})}}
export async function chatJson(request:Request){const text=await request.text();if(text.length>16000)throw new ChatError('Message is too long.');try{return JSON.parse(text)}catch{throw new ChatError('Invalid message.')}}
export const privateHeaders={'Cache-Control':'private, no-store'}
