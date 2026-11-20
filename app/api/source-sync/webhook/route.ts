import {after} from 'next/server'
import {z} from 'zod'
import {paymentDb} from '@/lib/payments/server'
import {limitedBody} from '@/lib/projects/server'
import {queueSourceSync,runSourceJobs,validVercelSignature} from '@/lib/projects/source-sync'
export const runtime='nodejs'
export const maxDuration=300
export async function POST(request:Request){
 if(!process.env.KORYX_SOURCE_WEBHOOK_SECRET)return new Response('Webhook not configured',{status:503})
 let raw:Buffer;try{raw=await limitedBody(request,128*1024)}catch{return new Response('Invalid payload',{status:413})}
 if(!validVercelSignature(raw,request.headers.get('x-vercel-signature')))return new Response('Invalid signature',{status:401})
 let event;try{event=z.object({id:z.string().min(1).max(200),type:z.string(),payload:z.object({project:z.object({id:z.string()}),team:z.object({id:z.string()}),target:z.string().nullable().optional()}).passthrough()}).parse(JSON.parse(raw.toString('utf8')))}catch{return new Response('Invalid event',{status:400})}
 if(!['deployment.promoted','deployment.rollback','deployment.succeeded'].includes(event.type)||(event.type==='deployment.succeeded'&&event.payload.target!=='production'))return Response.json({ignored:true})
 const db=paymentDb(),{data:old,error:oe}=await db.from('project_source_webhook_events').select('id').eq('id',event.id).maybeSingle();if(oe)return new Response('Event store unavailable',{status:503});if(old)return Response.json({received:true})
 try{const {data:link,error}=await db.from('project_source_links').select('order_id').eq('enabled',true).eq('vercel_project_id',event.payload.project.id).eq('team_id',event.payload.team.id).maybeSingle();if(error)throw error
 const job=link?await queueSourceSync(db,link.order_id):null,{error:save}=await db.from('project_source_webhook_events').upsert({id:event.id},{onConflict:'id',ignoreDuplicates:true});if(save)throw save
 if(job)after(()=>runSourceJobs(job).then(()=>{}));return Response.json({received:true})
 }catch{return new Response('Source event will be retried',{status:503})}
}
