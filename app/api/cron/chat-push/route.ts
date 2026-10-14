import {timingSafeEqual} from 'node:crypto'
import {deliverChatPush} from '@/lib/project-chat/push'
export const maxDuration=60
export async function GET(request:Request){const secret=process.env.CRON_SECRET,actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+secret);if(!secret||actual.length!==expected.length||!timingSafeEqual(actual,expected))return new Response('Unauthorized',{status:401});try{return Response.json(await deliverChatPush())}catch{return Response.json({error:'Notification delivery could not finish.'},{status:503})}}
