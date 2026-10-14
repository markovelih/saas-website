import {z} from 'zod'
import {chatResponse,chatAccess,chatStorageClient,chatDbError,ChatError,privateHeaders} from '@/lib/project-chat/server'
export async function GET(request:Request,{params}:{params:Promise<{id:string;attachmentId:string}>}){return chatResponse(request,async()=>{
 const ids=z.object({id:z.string().uuid(),attachmentId:z.string().uuid()}).parse(await params);const {db:session,user}=await chatAccess(ids.id)
 const {data:attachment,error}=await session.from('project_chat_attachments').select('id,path,name,mime,message_id,uploader_id').eq('id',ids.attachmentId).eq('order_id',ids.id).maybeSingle();chatDbError(error);if(!attachment)throw new ChatError('Photo not found.',404)
 if(attachment.message_id){const {data:message}=await session.from('project_chat_messages').select('deleted_at').eq('id',attachment.message_id).maybeSingle();if(!message||message.deleted_at)throw new ChatError('Photo not found.',404)}else if(attachment.uploader_id!==user.id)throw new ChatError('Photo not found.',404)
 const {data,error:downloadError}=await chatStorageClient().storage.from('project-chat').download(attachment.path);if(downloadError||!data)throw new ChatError('Photo could not be loaded.',404)
 return new Response(data,{headers:{...privateHeaders,'Content-Type':attachment.mime,'Content-Disposition':`inline; filename="photo.webp"; filename*=UTF-8''${encodeURIComponent(attachment.name)}`,'X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'none'"}})
})}
