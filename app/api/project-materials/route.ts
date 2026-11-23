import {randomUUID} from 'node:crypto'
import {projectSession,projectAccess,projectResponse,ProjectError,privateBucket,bucket,limitedBody,privateHeaders} from '@/lib/projects/server'
import {MAX_FILE_BYTES} from '@/lib/projects/policy'
import {prepareMaterial} from '@/lib/security/material-upload'
import {materialExtension,MATERIAL_FORMATS} from '@/lib/security/material-policy'
import {z} from 'zod'
export const runtime='nodejs'
export async function POST(request:Request){return projectResponse(request,async()=>{
 const session=await projectSession(),{db,user}=session
 const orderId=new URL(request.url).searchParams.get('project')
 if(orderId)await projectAccess(orderId)
 let decodedName:string;try{decodedName=decodeURIComponent(request.headers.get('x-file-name')||'')}catch{throw new ProjectError('Invalid file name.')}
 const name=z.string().min(1).max(200).parse(decodedName)
 if(!materialExtension(name))throw new ProjectError('This file format is not supported. '+MATERIAL_FORMATS)
 // Reject a full project or a busy account before reading or decoding the upload.
 const {count,error:limitError}=await db.from('project_materials').select('id',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',new Date(Date.now()-60000).toISOString())
 if(limitError)throw new ProjectError('Upload limits could not be checked. Please retry.',503)
 if((count||0)>=12)throw new ProjectError('Please wait a minute before uploading more files.',429)
 if(orderId){const {data:existing,error}=await db.from('project_materials').select('size').eq('order_id',orderId);if(error)throw new ProjectError('Project files could not be checked.',503);if((existing||[]).length>=10)throw new ProjectError('This project already has 10 files.')}
 const bytes=await limitedBody(request,MAX_FILE_BYTES)
 if(!bytes.length)throw new ProjectError('Choose a non-empty file.')
 await privateBucket(db)
 let prepared;try{prepared=await prepareMaterial(name,bytes)}catch{throw new ProjectError('This file could not be verified. '+MATERIAL_FORMATS+' Use a matching extension and export Office files without macros.')}
 if(prepared.bytes.length>MAX_FILE_BYTES)throw new ProjectError('The processed image is too large. Choose a smaller image.',413)
 const id=randomUUID(),path=`materials/${user.id}/${id}`
 const {error:upload}=await db.storage.from(bucket).upload(path,prepared.bytes,{contentType:prepared.mime,upsert:false});if(upload)throw new ProjectError('Upload failed. Please retry.',503)
 const {data:record,error}=await db.rpc('koryx_add_project_material',{p_file:{id,user_id:user.id,order_id:orderId,name:prepared.name,path,mime:prepared.mime,size:prepared.bytes.length}})
 if(error||!record){await db.storage.from(bucket).remove([path]);throw new ProjectError('The file could not be attached. Limit: 10 files, 20 MB per request.',400)}
 return Response.json({file:record},{headers:privateHeaders})
})}
export async function GET(request:Request){return projectResponse(request,async()=>{const id=z.string().uuid().parse(new URL(request.url).searchParams.get('project')),{db}=await projectAccess(id),{data,error}=await db.from('project_materials').select('*').eq('order_id',id).order('created_at');if(error)throw new ProjectError('Project materials are not ready.',503);return Response.json({files:data||[]},{headers:privateHeaders})})}
