import {z} from 'zod'
import {chatResponse,chatSession,chatJson,chatDbError,ChatError,privateHeaders} from '@/lib/project-chat/server'

export async function POST(request:Request){return chatResponse(request,async()=>{
 const {db,identity}=await chatSession()
 if(!identity.founder)throw new ChatError('Only the founder can start a private conversation',403)
 const {client_id}=z.object({client_id:z.string().uuid()}).parse(await chatJson(request))
 const {data,error}=await db.rpc('koryx_chat_start_direct',{p_client_id:client_id});chatDbError(error)
 return Response.json(data,{headers:privateHeaders})
})}
