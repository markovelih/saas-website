import {projectSession,projectAccess,projectResponse,ProjectError,privateBucket,bucket,privateHeaders} from '@/lib/projects/server'
import {z} from 'zod'
export async function GET(request:Request,{params}:{params:Promise<{fileId:string}>}){return projectResponse(request,async()=>{
 const {fileId}=await params;z.string().uuid().parse(fileId);const {db,user,founder}=await projectSession(),{data:file}=await db.from('project_materials').select('*').eq('id',fileId).single()
 if(!file)throw new ProjectError('File not found.',404)
 if(file.order_id)await projectAccess(file.order_id);else if(file.user_id!==user.id&&!founder)throw new ProjectError('File not found.',404)
 await privateBucket(db);const {data,error}=await db.storage.from(bucket).download(file.path);if(error||!data)throw new ProjectError('File is temporarily unavailable.',503)
 const inline=/^image\/(png|jpeg|webp|gif)$/.test(file.mime)&&new URL(request.url).searchParams.get('view')==='1'
 return new Response(data,{headers:{...privateHeaders,'Content-Type':inline?file.mime:'application/octet-stream','Content-Disposition':`${inline?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name).replaceAll("'",'%27')}`,'Cross-Origin-Resource-Policy':'same-origin','Referrer-Policy':'no-referrer','Content-Security-Policy':"sandbox; default-src 'none'; frame-ancestors 'self'"}})
})}
export async function DELETE(request:Request,{params}:{params:Promise<{fileId:string}>}){return projectResponse(request,async()=>{
 const {fileId}=await params;z.string().uuid().parse(fileId);const {db,user}=await projectSession(),{data:file}=await db.from('project_materials').select('*').eq('id',fileId).eq('user_id',user.id).is('order_id',null).single();if(!file)throw new ProjectError('File not found.',404)
 const {error}=await db.from('project_materials').delete().eq('id',fileId).eq('user_id',user.id).is('order_id',null).select('id').single();if(error)throw new ProjectError('File could not be removed.');await db.storage.from(bucket).remove([file.path]);return Response.json({success:true},{headers:privateHeaders})
})}
