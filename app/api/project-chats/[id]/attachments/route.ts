import {z} from 'zod'
import {prepareChatPhoto} from '@/lib/project-chat/images'
import {randomUUID} from 'node:crypto'
import {chatResponse,chatAccess,chatStorageClient,chatDbError,ChatError,privateHeaders} from '@/lib/project-chat/server'
import {CHAT_MAX_FILE_BYTES,validateChatImage} from '@/lib/project-chat/policy'
export const runtime='nodejs'
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return chatResponse(request,async()=>{
 const id=z.string().uuid().parse((await params).id);const {user}=await chatAccess(id,true)
 if(Number(request.headers.get('content-length'))>CHAT_MAX_FILE_BYTES+65536)throw new ChatError('Each photo must be 4 MB or smaller.')
 const form=await request.formData(),file=form.get('file');if(!(file instanceof File))throw new ChatError('Choose a photo.');const invalid=validateChatImage(file);if(invalid)throw new ChatError(invalid)
 const db=chatStorageClient();const {count,error:countError}=await db.from('project_chat_attachments').select('id',{count:'exact',head:true}).eq('uploader_id',user.id).gte('created_at',new Date(Date.now()-60000).toISOString());chatDbError(countError);if((count||0)>=12)throw new ChatError('Please wait a moment before uploading more photos.',429)
 let bytes:Buffer;try{bytes=await prepareChatPhoto(Buffer.from(await file.arrayBuffer()))}catch{throw new ChatError('This photo could not be opened. Choose a JPG, PNG or WebP file.')}
 const attachmentId=randomUUID(),path=`${id}/${user.id}/${attachmentId}.webp`,name=file.name.replace(/[\x00-\x1f\x7f/\\]/g,'').slice(0,145).replace(/\.[^.]+$/,'')+'.webp'
 const {error:uploadError}=await db.storage.from('project-chat').upload(path,bytes,{contentType:'image/webp',upsert:false});if(uploadError)throw new ChatError('Photo upload failed. Please retry.',503)
 // Re-check membership after processing, so a reassignment revokes a former developer immediately.
 try{await chatAccess(id,true);const {error}=await db.from('project_chat_attachments').insert({id:attachmentId,order_id:id,uploader_id:user.id,path,name,mime:'image/webp',size:bytes.length});chatDbError(error)}catch(error){await db.storage.from('project-chat').remove([path]);throw error}
 return Response.json({attachment:{id:attachmentId,name,mime:'image/webp',size:bytes.length}},{headers:privateHeaders})
})}
