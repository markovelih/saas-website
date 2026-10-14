import {chatResponse,chatSession,chatDbError,privateHeaders} from '@/lib/project-chat/server'
export async function GET(request:Request){return chatResponse(request,async()=>{const {db}=await chatSession();const {data,error}=await db.rpc('koryx_chat_inbox');chatDbError(error);return Response.json({threads:data||[]},{headers:privateHeaders})})}
