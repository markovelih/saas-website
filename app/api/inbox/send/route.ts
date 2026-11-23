import {sendSupportEmail} from '@/lib/inbox/send'
import {founderClient} from '@/lib/supabase/admin'
import {boundedFormData,BodyError} from '@/lib/security/request-body'

export const maxDuration=60
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'This request is not allowed.'},{status:403})
 if(Number(request.headers.get('content-length'))>4.4*1024*1024)return Response.json({error:'Choose up to 10 files, 4 MB in total.'},{status:413})
 try{
  // Authenticate before buffering a potentially large multipart body.
  await founderClient()
  const result=await sendSupportEmail(await boundedFormData(request,Math.floor(4.4*1024*1024)))
  return Response.json(result,{status:'error' in result&&result.error?400:200,headers:{'Cache-Control':'private, no-store'}})
 }catch(error){return Response.json({error:error instanceof BodyError?error.message:'Email could not be sent. Please sign in and retry.'},{status:error instanceof BodyError?error.status:403,headers:{'Cache-Control':'private, no-store'}})}
}
