import {workspaceSession,isFounder} from '@/lib/workspace'
import {firstName} from '@/lib/project-chat/policy'
import {ProjectChat} from '@/components/project-chat/project-chat'
import type {ChatPage} from '@/lib/project-chat/types'
export default async function ChatsPage({searchParams}:{searchParams:Promise<{project?:string}>}){
 const {user,profile,supabase}=await workspaceSession(),query=await searchParams
 const {data,error}=await supabase.rpc('koryx_chat_inbox');const threads=data||[];const chosen=threads.find(t=>t.order_id===query.project)
 let page:ChatPage|null=null;if(chosen){const result=await supabase.rpc('koryx_chat_page',{p_order_id:chosen.order_id});page=result.data}
 return <ProjectChat identity={{id:user.id,name:firstName(profile?.full_name,profile?.role==='admin'?'Developer':'Client'),founder:isFounder(user.id),staff:isFounder(user.id)||profile?.role==='admin'}} initialThreads={threads} initialPage={page} initialError={error?'Project chats could not be loaded. Please try again later.':''}/>
}
