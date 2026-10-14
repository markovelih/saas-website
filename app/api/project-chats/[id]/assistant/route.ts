import {generateText} from 'ai'
import {z} from 'zod'
import {chatAccess,chatDbError,chatJson,chatResponse,chatStorageClient,ChatError,privateHeaders} from '@/lib/project-chat/server'
import {chatAITranscript,chatAISystem} from '@/lib/project-chat/assistant'
export const maxDuration=30
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return chatResponse(request,async()=>{
 const id=z.string().uuid().parse((await params).id),{db,identity}=await chatAccess(id)
 const input=z.object({mode:z.enum(['analyze','reply']),question:z.string().trim().max(1500).default('')}).parse(await chatJson(request))
 if(!process.env.AI_GATEWAY_API_KEY)throw new ChatError('kAI is temporarily unavailable. Your conversation is unchanged.',503)
 const service=chatStorageClient(),limit=await service.rpc('koryx_auth_email_limit',{p_key:'project-ai/'+identity.id,p_limit:12,p_seconds:3600});chatDbError(limit.error);if(!limit.data)throw new ChatError('Please try kAI again later.',429)
 const {data,error}=await db.rpc('koryx_chat_page',{p_order_id:id});chatDbError(error)
 const transcript=chatAITranscript(data?.messages||[]);if(!transcript.length)throw new ChatError('Send a message before asking kAI.')
 const result=await generateText({model:process.env.KORYX_CHAT_MODEL||'openai/gpt-4o-mini',system:chatAISystem(input.mode,Boolean(data?.thread.can_moderate)),messages:[{role:'user',content:JSON.stringify({transcript,question:input.question})}],maxOutputTokens:1600,maxRetries:0,abortSignal:AbortSignal.any([request.signal,AbortSignal.timeout(22000)])})
 // Reassignment / refunds while the model was working must revoke the result too.
 await chatAccess(id)
 return Response.json({text:result.text},{headers:privateHeaders})
})}
