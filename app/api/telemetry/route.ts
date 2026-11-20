import {createHash} from 'node:crypto'
import {paymentDb} from '@/lib/payments/server'
import {telemetrySchema} from '@/lib/projects/policy'
import {limitedBody} from '@/lib/projects/server'
export const runtime='nodejs'
// Server-to-server only. Never add CORS or expose this key in NEXT_PUBLIC_*.
export async function POST(request:Request){
 const auth=request.headers.get('authorization');if(!auth||!/^Bearer kx_project_[a-f0-9]{64}$/.test(auth))return new Response('Unauthorized',{status:401})
 let data;try{data=telemetrySchema.parse(JSON.parse((await limitedBody(request,2048)).toString('utf8')))}catch{return new Response('Invalid event',{status:400})}
 const {data:ok,error}=await paymentDb().rpc('koryx_ingest_metric',{p_hash:createHash('sha256').update(auth.slice(7)).digest('hex'),p_id:data.id,p_kind:data.kind,p_status:data.status||200,p_duration:Math.round(data.duration_ms),p_country:data.country})
 if(error)return new Response('Telemetry temporarily unavailable',{status:503})
 return new Response(null,{status:ok?202:429,headers:{'Cache-Control':'no-store'}})
}
