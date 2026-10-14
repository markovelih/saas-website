import {z} from 'zod'
import {chatResponse,chatAccess,chatDbError,privateHeaders} from '@/lib/project-chat/server'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return chatResponse(request,async()=>{const id=z.string().uuid().parse((await params).id);const {db}=await chatAccess(id);const before=new URL(request.url).searchParams.get('before');const {data,error}=await db.rpc('koryx_chat_page',{p_order_id:id,p_before:before?z.string().datetime({offset:true}).parse(before):undefined});chatDbError(error);return Response.json(data,{headers:privateHeaders})})}
