import {createHash} from 'node:crypto'
import {z} from 'zod'
import {projectAccess,sourceAccess,projectResponse,ProjectError,privateHeaders,privateBucket,bucket} from '@/lib/projects/server'
export async function GET(request:Request,{params}:{params:Promise<{id:string;fileId:string}>}){return projectResponse(request,async()=>{
 const {id,fileId}=await params;z.string().uuid().parse(fileId);const {db,founder}=await projectAccess(id);if(!founder)await sourceAccess(id)
 const {data:file}=await db.from('project_source_files').select('*').eq('id',fileId).single();if(!file)throw new ProjectError('File not found.',404)
 const {data:release}=await db.from('project_source_releases').select('*').eq('id',file.release_id).eq('order_id',id).single();if(!release||(!founder&&!release.published_at))throw new ProjectError('File not found.',404)
 if(!founder&&release.origin==='automatic'){const {data:link}=await db.from('project_source_links').select('policy_version').eq('order_id',id).maybeSingle();if(link?.policy_version!==release.policy_version)throw new ProjectError('Source version is no longer shared.',404)}
 // Reviewed legacy imports can retain their bytes in the same private, service-only
 // row. Authorization and integrity checks are identical for both storage backends.
 let bytes:Buffer
 if(typeof file.content_base64==='string')bytes=Buffer.from(file.content_base64,'base64')
 else{await privateBucket(db);const {data,error}=await db.storage.from(bucket).download(file.storage_path);if(error||!data)throw new ProjectError('File is temporarily unavailable.',503);bytes=Buffer.from(await data.arrayBuffer())}
 if(bytes.length!==file.size||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new ProjectError('File verification failed.',503)
 if(new URL(request.url).searchParams.get('download')==='1')return new Response(bytes,{headers:{...privateHeaders,'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(file.path.split('/').pop()!).replaceAll("'",'%27')}`}})
 if(new URL(request.url).searchParams.get('asset')==='1'&&/^image\/(png|jpeg|gif|webp)$/.test(file.mime))return new Response(bytes,{headers:{...privateHeaders,'Content-Type':file.mime,'Content-Security-Policy':"sandbox; default-src 'none'"}})
 return Response.json({path:file.path,text:file.mime==='text/plain'?bytes.toString('utf8').slice(0,100000):'',truncated:file.mime==='text/plain'&&bytes.toString('utf8').length>100000,binary:file.mime!=='text/plain',mime:file.mime},{headers:privateHeaders})
})}
