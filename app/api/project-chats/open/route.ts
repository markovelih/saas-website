import {z} from 'zod'
import {chatResponse,chatSession,chatJson,chatDbError,ChatError,privateHeaders} from '@/lib/project-chat/server'

// Explicit button action: a prefetched link must never create a conversation.
export async function POST(request:Request){return chatResponse(request,async()=>{
 const {db,identity}=await chatSession()
 if(!identity.founder)throw new ChatError('Founder access required.',403)
 const {order_id}=z.object({order_id:z.string().uuid()}).parse(await chatJson(request))
 const project=await db.from('orders').select('user_id').eq('id',order_id).maybeSingle()
 chatDbError(project.error)
 if(!project.data)throw new ChatError('This project is not available.',404)
 const access=await db.rpc('koryx_chat_access',{p_order_id:order_id,p_write:true})
 chatDbError(access.error)
 // Keep the assigned developer's existing project conversation when it is writable.
 // Before payment/assignment, use the founder's private conversation with the client.
 const result=access.data
  ?await db.rpc('koryx_chat_page',{p_order_id:order_id})
  :await db.rpc('koryx_chat_start_direct',{p_client_id:project.data.user_id})
 chatDbError(result.error)
 if(!result.data?.thread.can_write)throw new ChatError('Could not open the conversation. Please try again.',503)
 return Response.json(result.data,{headers:privateHeaders})
})}
