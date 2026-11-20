import {projectAccess,projectResponse,ProjectError,privateHeaders} from '@/lib/projects/server'
import {activityFromBuckets} from '@/lib/projects/policy'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return projectResponse(request,async()=>{
 const {id}=await params,{db}=await projectAccess(id),days=Math.min(30,Math.max(7,Number(new URL(request.url).searchParams.get('days'))||7))
 const since=new Date();since.setUTCHours(0,0,0,0);since.setUTCDate(since.getUTCDate()-(days-1))
 const [{data:connection,error:ce},{data:buckets,error:be},{data:countryBuckets,error:ge}]=await Promise.all([db.from('project_connections').select('enabled,last_event_at').eq('order_id',id).maybeSingle(),db.from('project_metric_buckets').select('*').eq('order_id',id).gte('hour',since.toISOString()).order('hour'),db.rpc('koryx_country_statistics',{p_order:id,p_since:since.toISOString()})])
 if(ce||be||ge)throw new ProjectError('Activity is not connected yet.',503)
 const totals=activityFromBuckets(buckets||[])
 const countries=Object.entries((countryBuckets||[]).reduce<Record<string,number>>((a,b)=>{a[b.country]=(a[b.country]||0)+b.page_views;return a},{})).map(([country,page_views])=>({country,page_views}))
 const unlocated=totals.pageViews-countries.reduce((n,c)=>n+Number(c.page_views),0);if(unlocated>0){const unknown=countries.find(c=>c.country==='ZZ');if(unknown)unknown.page_views+=unlocated;else countries.push({country:'ZZ',page_views:unlocated})}
 return Response.json({countries,connected:Boolean(connection?.enabled),lastEvent:connection?.last_event_at||null,buckets:buckets||[],...totals},{headers:privateHeaders})
})}
