import {randomBytes,createHash} from 'node:crypto'
import {z} from 'zod'
import {projectAccess,projectResponse,projectJson,ProjectError,privateHeaders} from '@/lib/projects/server'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{const {id}=await params,{db}=await projectAccess(id,true),{data,error}=await db.from('project_connections').select('order_id,enabled,connected_at,last_event_at,key_hint').eq('order_id',id).maybeSingle();if(error)throw new ProjectError('Project connection is not ready.',503);return Response.json({connection:data},{headers:privateHeaders})})}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{
 const {id}=await params,{db}=await projectAccess(id,true),{action}=z.object({action:z.enum(['rotate','disable'])}).parse(await projectJson(request))
 if(action==='disable'){const {error}=await db.from('project_connections').update({enabled:false,key_hash:null,key_hint:null}).eq('order_id',id);if(error)throw new ProjectError('Connection could not be disabled.',503);return Response.json({success:true},{headers:privateHeaders})}
 const key='kx_project_'+randomBytes(32).toString('hex'),{error}=await db.from('project_connections').upsert({order_id:id,enabled:true,key_hash:createHash('sha256').update(key).digest('hex'),key_hint:key.slice(-6),connected_at:new Date().toISOString()},{onConflict:'order_id'})
 if(error)throw new ProjectError('Connection could not be configured.',503)
 return Response.json({key,endpoint:'https://koryx.ca/api/telemetry'},{headers:privateHeaders})
})}
