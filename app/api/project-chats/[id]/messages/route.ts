import {after} from 'next/server'
import {deliverChatPush} from '@/lib/project-chat/push'
import {z} from 'zod'
import {chatResponse,chatAccess,chatDbError,chatJson,privateHeaders} from '@/lib/project-chat/server'
export const maxDuration=60
const schema=z.object({id:z.string().uuid(),body:z.string().max(8000),reply_to:z.string().uuid().nullable().optional(),attachments:z.array(z.string().uuid()).max(4).default([])})
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return chatResponse(request,async()=>{const id=z.string().uuid().parse((await params).id);const {db}=await chatAccess(id,true);const v=schema.parse(await chatJson(request));const {data,error}=await db.rpc('koryx_chat_send',{p_order_id:id,p_id:v.id,p_body:v.body,p_reply_to:v.reply_to??undefined,p_attachments:v.attachments});chatDbError(error);after(async()=>{try{await deliverChatPush(id)}catch{/* Durable outbox is retried by cron. */}});return Response.json({message:data},{headers:privateHeaders})})}
