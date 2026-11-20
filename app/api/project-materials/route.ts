import {randomUUID} from 'node:crypto'
import {projectSession,projectAccess,projectResponse,ProjectError,privateBucket,bucket,limitedBody,privateHeaders} from '@/lib/projects/server'
import {MAX_FILE_BYTES} from '@/lib/projects/policy'
import {z} from 'zod'
export const runtime='nodejs'
export async function POST(request:Request){return projectResponse(request,async()=>{
 const session=await projectSession(),{db,user}=session
 const orderId=new URL(request.url).searchParams.get('project')
 if(orderId)await projectAccess(orderId)
 const name=z.string().trim().min(1).max(200).parse(decodeURIComponent(request.headers.get('x-file-name')||'')),bytes=await limitedBody(request,MAX_FILE_BYTES)
 if(!bytes.length)throw new ProjectError('Choose a non-empty file.')
 await privateBucket(db)
 const id=randomUUID(),path=`materials/${user.id}/${id}`
 const mime=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes.subarray(0,6).toString().match(/^GIF8[79]a$/)?'image/gif':bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'?'image/webp':'application/octet-stream'
 const {error:upload}=await db.storage.from(bucket).upload(path,bytes,{contentType:mime,upsert:false});if(upload)throw new ProjectError('Upload failed. Please retry.',503)
 const {data:record,error}=await db.rpc('koryx_add_project_material',{p_file:{id,user_id:user.id,order_id:orderId,name,path,mime,size:bytes.length}})
 if(error||!record){await db.storage.from(bucket).remove([path]);throw new ProjectError('The file could not be attached. Limit: 10 files, 20 MB per request.',400)}
 return Response.json({file:record},{headers:privateHeaders})
})}
export async function GET(request:Request){return projectResponse(request,async()=>{const id=z.string().uuid().parse(new URL(request.url).searchParams.get('project')),{db}=await projectAccess(id),{data,error}=await db.from('project_materials').select('*').eq('order_id',id).order('created_at');if(error)throw new ProjectError('Project materials are not ready.',503);return Response.json({files:data||[]},{headers:privateHeaders})})}
