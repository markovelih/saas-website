import {timingSafeEqual} from 'node:crypto'
import {paymentDb} from '@/lib/payments/server'
import {currentProduction,queueSourceSync,runSourceJobs,syncConfiguration} from '@/lib/projects/source-sync'
export const maxDuration=300
export async function GET(request:Request){const secret=process.env.CRON_SECRET,actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+secret);if(!secret||actual.length!==expected.length||!timingSafeEqual(actual,expected))return new Response('Unauthorized',{status:401})
 const ready=syncConfiguration();if(!ready.github||!ready.vercel)return Response.json({configured:false})
 const db=paymentDb(),{data:links,error}=await db.from('project_source_links').select('*').eq('enabled',true).order('last_checked_at',{nullsFirst:true}).limit(5);if(error)return new Response('Source queue unavailable',{status:503});let checked=0
 for(const link of links||[]){try{await db.from('project_source_links').update({last_checked_at:new Date().toISOString()}).eq('order_id',link.order_id)
 const current=await currentProduction(link),{data:release}=link.current_release_id?await db.from('project_source_releases').select('deployment_id').eq('id',link.current_release_id).maybeSingle():{data:null};if(release?.deployment_id===current.id)continue
 const {data:job}=await db.from('project_source_jobs').select('status,deployment_id').eq('order_id',link.order_id).eq('policy_version',link.policy_version).order('created_at',{ascending:false}).limit(1).maybeSingle();if(job&&(['pending','running'].includes(job.status)||job.deployment_id===current.id))continue
 await queueSourceSync(db,link.order_id);checked++
 }catch{/* Provider problems remain visible on the last job; next cron rechecks. */}}
 const result=await runSourceJobs();return Response.json({...result,checked})
}
