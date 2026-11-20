import {after} from 'next/server'
import {randomUUID} from 'node:crypto'
import {projectAccess,projectResponse,projectJson,ProjectError,privateHeaders} from '@/lib/projects/server'
import {sourceLinkSchema,syncConfiguration,verifySourceLink,queueSourceSync,runSourceJobs} from '@/lib/projects/source-sync'
import {z} from 'zod'
export const maxDuration=300
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{const {id}=await params,{db}=await projectAccess(id,true);const [link,jobs]=await Promise.all([db.from('project_source_links').select('*').eq('order_id',id).maybeSingle(),db.from('project_source_jobs').select('*').eq('order_id',id).order('created_at',{ascending:false}).limit(5)]);if(link.error||jobs.error)throw new ProjectError('Source synchronization schema is not ready.',503);return Response.json({link:link.data,jobs:jobs.data||[],configuration:syncConfiguration()},{headers:privateHeaders})})}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{
 const {id}=await params,{db}=await projectAccess(id,true),body=await projectJson(request),action=z.enum(['configure','disable','sync']).parse(body.action)
 if(action==='disable'){const {error}=await db.from('project_source_links').update({enabled:false}).eq('order_id',id);if(error)throw new ProjectError('Source synchronization could not be disabled.',503);return Response.json({success:true},{headers:privateHeaders})}
 if(action==='configure'){const parsed=sourceLinkSchema.parse(body),v=await verifySourceLink(parsed);const {error}=await db.from('project_source_links').upsert({order_id:id,repo_full_name:v.repo_full_name,repo_id:v.repo_id,vercel_project_id:v.vercel_project_id,team_id:v.team_id,production_domain:v.production_domain,approved_paths:v.approved_paths,enabled:true,policy_version:randomUUID(),current_release_id:null,last_checked_at:null,last_synced_at:null},{onConflict:'order_id'});if(error)throw new ProjectError('Source connection could not be saved. Check that this hosted project is not assigned to another client.')}
 const idJob=await queueSourceSync(db,id);if(idJob)after(()=>runSourceJobs(idJob).then(()=>{}));return Response.json({success:true,jobId:idJob},{headers:privateHeaders})
})}
