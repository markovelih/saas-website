import {attachmentDetails} from '@/lib/inbox/server'
import {isPreviewImage} from '@/lib/inbox/types'

export async function GET(request:Request,{params}:{params:Promise<{id:string;attachmentId:string}>}){
 try{
  const direction=new URL(request.url).searchParams.get('direction')==='outbound'?'outbound':'inbound'
  const {id,attachmentId}=await params,attachment=await attachmentDetails(id,attachmentId,direction)
  const preview=new URL(request.url).searchParams.get('preview')==='1'
  const inline=preview&&(isPreviewImage(attachment.content_type)||attachment.content_type==='application/pdf')
  const response='bytes' in attachment?new Response(new Uint8Array(attachment.bytes)):await fetch(attachment.url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000)})
  if(!response.ok||!response.body)throw new Error('Attachment is unavailable.')
  const filename=encodeURIComponent((attachment.filename||'attachment').replace(/[\x00-\x1f\x7f/\\]/g,'_')).replace(/['()*]/g,char=>'%'+char.charCodeAt(0).toString(16).toUpperCase())
  return new Response(response.body,{headers:{
   'Content-Type':inline?attachment.content_type:'application/octet-stream',
   'Content-Disposition':`${inline?'inline':'attachment'}; filename="attachment"; filename*=UTF-8''${filename}`,
   'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
   'Content-Security-Policy':"sandbox; default-src 'none'; frame-ancestors 'self'",'X-Frame-Options':'SAMEORIGIN',
  }})
 }catch{return new Response('Attachment is unavailable.',{status:403,headers:{'Cache-Control':'private, no-store'}})}
}
