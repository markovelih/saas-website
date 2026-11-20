import {randomUUID,createHash} from 'node:crypto'
import {z} from 'zod'
import {projectAccess,sourceAccess,projectResponse,projectJson,ProjectError,privateHeaders,privateBucket,bucket,limitedBody} from '@/lib/projects/server'
import {sourcePath,sourceContent,MAX_FILE_BYTES} from '@/lib/projects/policy'
export const runtime='nodejs'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{
 const {id}=await params,session=await projectAccess(id);if(!session.founder)await sourceAccess(id)
 let query=session.db.from('project_source_releases').select('*').eq('order_id',id).order('created_at',{ascending:false}).limit(25);if(!session.founder)query=query.not('published_at','is',null)
 const {data:releases,error}=await query;if(error)throw new ProjectError('Source handover is not ready.',503)
 const {data:link,error:le}=await session.db.from('project_source_links').select('current_release_id,policy_version').eq('order_id',id).maybeSingle();if(le)throw new ProjectError('Source connection could not be loaded.',503)
 const visible=(releases||[]).filter(r=>session.founder||r.origin!=='automatic'||r.policy_version===link?.policy_version)
 const requested=new URL(request.url).searchParams.get('release');let release=visible.find(r=>r.id===(requested||link?.current_release_id))||visible[0]
 if(!requested&&link?.current_release_id&&!visible.some(r=>r.id===link.current_release_id)){const {data:current}=await session.db.from('project_source_releases').select('*').eq('id',link.current_release_id).eq('order_id',id).not('published_at','is',null).maybeSingle();if(current&&(session.founder||current.origin!=='automatic'||current.policy_version===link.policy_version)){visible.unshift(current);release=current}}
 if(requested&&!visible.some(r=>r.id===requested))throw new ProjectError('Source version not found.',404)
 const {data:files,error:fe}=release?await session.db.from('project_source_files').select('id,release_id,path,size,sha256,mime').eq('release_id',release.id).order('path'):{data:[],error:null};if(fe)throw new ProjectError('Source files could not be loaded.',503)
 return Response.json({releases:visible.map(r=>({id:r.id,order_id:r.order_id,title:r.title,published_at:r.published_at,created_at:r.created_at,origin:r.origin})),release:release?{id:release.id,title:release.title}:undefined,currentReleaseId:link?.current_release_id||null,files:files||[]},{headers:privateHeaders})
})}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{
 const {id}=await params,{db}=await projectAccess(id,true),action=new URL(request.url).searchParams.get('action')
 if(action==='create'){const {title}=z.object({title:z.string().trim().min(1).max(120)}).parse(await projectJson(request)),{data,error}=await db.from('project_source_releases').insert({order_id:id,title}).select('*').single();if(error)throw new ProjectError('Handover could not be created.',503);return Response.json({release:data},{headers:privateHeaders})}
 const releaseId=z.string().uuid().parse(new URL(request.url).searchParams.get('release')),{data:release}=await db.from('project_source_releases').select('*').eq('id',releaseId).eq('order_id',id).single();if(!release||release.published_at||release.origin==='automatic')throw new ProjectError('Choose an unpublished handover.')
 if(action==='remove'){const {fileId}=z.object({fileId:z.string().uuid()}).parse(await projectJson(request)),{data:path,error}=await db.rpc('koryx_remove_source_file',{p_release:release.id,p_file:fileId});if(error||!path)throw new ProjectError('This file could not be removed.');await db.storage.from(bucket).remove([path]);return Response.json({success:true},{headers:privateHeaders})}
 if(action==='publish'){const {reviewed}=z.object({reviewed:z.literal(true)}).parse(await projectJson(request));if(!reviewed)throw new ProjectError('Review all files before publishing.');const {error}=await db.rpc('koryx_publish_source',{p_release:release.id});if(error)throw new ProjectError('Handover requires files and a fully paid buyout project.');return Response.json({success:true},{headers:privateHeaders})}
 if(action!=='file')throw new ProjectError('Choose a valid action.')
 const path=sourcePath(decodeURIComponent(request.headers.get('x-file-path')||''));if(!path)throw new ProjectError('This path is excluded from source handover.')
 const bytes=await limitedBody(request,MAX_FILE_BYTES);let content;try{content=sourceContent(bytes)}catch{throw new ProjectError('Remove credentials from source files before handover.')}
 await privateBucket(db);const storagePath=`source/${id}/${release.id}/${randomUUID()}`,{error:upload}=await db.storage.from(bucket).upload(storagePath,bytes,{contentType:content.mime,upsert:false});if(upload)throw new ProjectError('File could not be uploaded.',503)
 const {error}=await db.rpc('koryx_add_source_file',{p_release:release.id,p_file:{path,storage_path:storagePath,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),mime:content.mime}})
 if(error){await db.storage.from(bucket).remove([storagePath]);throw new ProjectError('File already exists or the handover reached its limit (300 files, 30 MB).')}
 return Response.json({success:true},{headers:privateHeaders})
})}
