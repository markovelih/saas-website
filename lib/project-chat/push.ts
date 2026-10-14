import 'server-only'
import webpush from 'web-push'
import {chatStorageClient} from './server'
import {validPushEndpoint,pushBody} from './push-policy'
export function pushConfigured(){return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY)}
// Called after a committed message and by the authenticated retry cron. No message text in lock-screen notifications.
export async function deliverChatPush(orderId?:string){
 if(!pushConfigured())return {delivered:0}
 const db=chatStorageClient(),{data:jobs,error}=await db.rpc('koryx_claim_chat_push',{p_order_id:orderId});if(error)throw new Error('Push queue unavailable')
 let delivered=0
 for(const job of jobs||[]){
  const [{data:thread,error:threadError},{data:order,error:orderError},{data:message,error:messageError},{data:subscriptions,error:subscriptionError},{data:paid,error:paidError}]=await Promise.all([
   db.from('project_chat_threads').select('developer_id').eq('order_id',job.order_id).maybeSingle(),
   db.from('orders').select('user_id').eq('id',job.order_id).maybeSingle(),
   db.from('project_chat_messages').select('deleted_at,sender_id,sender_role').eq('id',job.message_id).maybeSingle(),
   db.from('project_push_subscriptions').select('*').eq('user_id',job.user_id),
   db.rpc('koryx_chat_paid',{p_order_id:job.order_id}),
  ])
  const sent=[...(job.sent_subscriptions||[])];let retry=Boolean(threadError||orderError||messageError||subscriptionError||paidError)
  if(!retry&&thread?.developer_id&&paid&&order?.user_id===job.user_id&&message&&!message.deleted_at&&message.sender_role==='developer'&&message.sender_id!==job.user_id){
   await Promise.all((subscriptions||[]).filter(sub=>!sent.includes(sub.id)).map(async sub=>{
    if(!validPushEndpoint(sub.endpoint)){await db.from('project_push_subscriptions').delete().eq('id',sub.id);return}
    try{
     await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:'Koryx',body:pushBody(sub.language),url:'/dashboard/chats?project='+job.order_id,tag:'chat-'+job.order_id}),{TTL:3600,urgency:'normal',timeout:8000,topic:job.message_id.replaceAll('-',''),vapidDetails:{subject:'mailto:support@koryx.ca',publicKey:process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,privateKey:process.env.VAPID_PRIVATE_KEY!}})
     delivered++;sent.push(sub.id)
    }catch(error){const status=(error as {statusCode?:number}).statusCode;if(status===404||status===410){await db.from('project_push_subscriptions').delete().eq('id',sub.id)}else retry=true}
   }))
  }
  await db.from('project_push_outbox').update({sent_subscriptions:sent,lease_until:null,lease_token:null,...(retry?{next_attempt_at:new Date(Date.now()+Math.min(3600000,30000*2**job.attempts)).toISOString()}:{sent_at:new Date().toISOString()})}).eq('id',job.id).eq('lease_token',job.lease_token!)
 }
 return {delivered}
}
