import {workspaceSession,isFounder} from '@/lib/workspace'
import {firstName} from '@/lib/project-chat/policy'
import {ProjectChat} from '@/components/project-chat/project-chat'
import {OpenProjectConversation} from '@/components/project-chat/open-project-conversation'
import {z} from 'zod'
import s from '@/components/workspace/workspace.module.css'
import type {ChatPage} from '@/lib/project-chat/types'
export default async function ChatsPage({searchParams}:{searchParams:Promise<{project?:string;conversation?:string}>}){
 const {user,profile,supabase}=await workspaceSession(),query=await searchParams
 const {data,error}=await supabase.rpc('koryx_chat_inbox'),threads=data||[],requested=query.conversation||query.project
 let page:ChatPage|null=null,message=error?'Project chats could not be loaded. Please try again later.':''
 if(requested){
  if(z.string().uuid().safeParse(requested).success){
   // A valid deep link can be older than the inbox's most recent 200 conversations.
   const result=await supabase.rpc('koryx_chat_page',{p_order_id:requested})
   if(result.error||!result.data)message='This conversation is not available.'
   else{page=result.data;if(!threads.some(thread=>thread.order_id===page!.thread.order_id))threads.unshift(page.thread)}
  }else message='This conversation is not available.'
 }
 return <>{isFounder(user.id)&&query.project&&z.string().uuid().safeParse(query.project).success&&!page?.thread.can_write&&<div className={`${s.shell} !pb-0`}><OpenProjectConversation orderId={query.project} className={s.secondary}/></div>}<ProjectChat key={page?.thread.order_id||requested||'inbox'} identity={{id:user.id,name:firstName(profile?.full_name,profile?.role==='admin'?'Developer':'Client'),founder:isFounder(user.id),staff:isFounder(user.id)||profile?.role==='admin'}} initialThreads={threads} initialPage={page} initialError={message}/></>
}
