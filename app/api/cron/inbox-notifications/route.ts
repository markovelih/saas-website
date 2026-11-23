import {timingSafeEqual} from 'node:crypto'
import {deliverInboxNotifications} from '@/lib/inbox/notifications'
export const maxDuration=300
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+secret)
 if(!secret||actual.length!==expected.length||!timingSafeEqual(actual,expected))return new Response('Unauthorized',{status:401})
 try{return Response.json(await deliverInboxNotifications(),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Mailbox notifications could not finish. The next scheduled check will retry.'},{status:503})}
}
