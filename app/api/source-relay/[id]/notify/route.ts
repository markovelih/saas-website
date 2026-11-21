import {after} from 'next/server'
import {validRelayRequest,syncSourceRelays} from '@/lib/projects/source-relay'
import {paymentDb} from '@/lib/payments/server'
export const runtime='nodejs'
export const maxDuration=300
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!validRelayRequest(request,id))return new Response('Unauthorized',{status:401,headers:{'Cache-Control':'no-store'}})
 const {data}=await paymentDb().from('project_source_relays').select('enabled').eq('order_id',id).maybeSingle();if(!data?.enabled)return new Response('Not found',{status:404})
 after(()=>syncSourceRelays(id));return Response.json({accepted:true},{status:202,headers:{'Cache-Control':'no-store'}})
}
