const assert=require('node:assert/strict'),makeDb=require('./helpers/support-mail-db.cjs'),loader=require('./helpers/load-typescript.cjs')
const db=makeDb(),owner='2f0a1860-cb7a-4104-967d-86ccc9166cdc',id='00000000-0000-4000-8000-000000000001'
let fetches=0,sends=[],status=200,optOutDuringPoll=false
const now=Date.now(),email={id,from:'client@example.com',to:['support@koryx.ca'],subject:'PRIVATE SUBJECT',text:'PRIVATE CONTENT',created_at:new Date(now-1000).toISOString(),attachments:[{filename:'PRIVATE FILE'}]}
const pref={user_id:owner,contact:'client@example.com',notify_since:new Date(now-10000).toISOString(),read_at:null,pinned_at:null,archived_at:null,marked_unread:false,updated_at:new Date(now).toISOString()}
db.auth={admin:{getUserById:async()=>({data:{user:{id:owner,email:'owner@example.com',email_confirmed_at:'2026-01-01'}},error:null})}}
const load=loader({'@/lib/payments/server':{paymentDb:()=>db}}),notify=load('lib/inbox/notifications.ts')
const oldFetch=global.fetch,oldSend=process.env.RESEND_API_KEY,oldInbound=process.env.RESEND_INBOUND_API_KEY
process.env.RESEND_API_KEY='mock-send';process.env.RESEND_INBOUND_API_KEY='mock-receive'
global.fetch=async(url,options)=>{
 fetches++
 if(url.startsWith('https://api.resend.com/emails/receiving?')){
  if(optOutDuringPoll)db.contacts[0].notify_since=null
  return {ok:true,json:async()=>({data:[email,{...email,id:'00000000-0000-4000-8000-000000000003',from:'unwatched@example.com'},{...email,id:'00000000-0000-4000-8000-000000000004',created_at:new Date(now-60000).toISOString()}],has_more:false})}
 }
 assert.equal(url,'https://api.resend.com/emails');const body=JSON.parse(options.body);sends.push({body,key:options.headers['Idempotency-Key']})
 assert.deepEqual(body.to,['owner@example.com']);assert(!JSON.stringify(body).includes('PRIVATE'),'Never forward sender, subject, content or files')
 assert.equal(body.attachments.length,0);assert(body.html.includes('koryx.ca/dashboard/inbox?email='));return {ok:status<400,status,json:async()=>({id:'00000000-0000-4000-8000-000000000005'})}
}
;(async()=>{
 assert.deepEqual(await notify.deliverInboxNotifications(),{enabled:0,sent:0});assert.equal(fetches,0,'Off by default must not contact provider')
 db.contacts.push({...pref});assert.equal((await notify.deliverInboxNotifications()).sent,1);assert.equal(sends.length,1);assert.equal(db.rows.length,1);assert.equal(db.rows[0].snapshot,null)
 await notify.deliverInboxNotifications();assert.equal(sends.length,1,'Cron replay must not duplicate email')
 db.contacts[0].notify_since=null;const before=fetches;await notify.deliverInboxNotifications();assert.equal(fetches,before)
 db.contacts[0]={...pref};optOutDuringPoll=true;await notify.deliverInboxNotifications();assert.equal(sends.length,1);optOutDuringPoll=false
 db.contacts[0]={...pref,read_at:new Date(now).toISOString()};await notify.deliverInboxNotifications();assert.equal(sends.length,1,'Already read messages should not notify')
 db.contacts[0]={...pref,notify_since:new Date(now).toISOString()};await notify.deliverInboxNotifications();assert.equal(sends.length,1,'Enabling notifications does not send old history')
 db.contacts[0]={...pref};email.id='00000000-0000-4000-8000-000000000006';status=500;await assert.rejects(()=>notify.deliverInboxNotifications(),/retry/);status=200;await notify.deliverInboxNotifications();assert.equal(sends.at(-1).key,sends.at(-2).key)
 const mutedId='00000000-0000-4000-8000-000000000007';email.id=mutedId;email.message_id='<read-thread@example.com>'
 db.headers.push({user_id:owner,email_key:'inbound:'+mutedId,email:{...email,direction:'inbound',text:undefined,attachments:[]},checked:true})
 db.threads.push({user_id:owner,thread_key:'rfc:<read-thread@example.com>',read_at:new Date(now).toISOString()})
 const beforeRead=sends.length;await notify.deliverInboxNotifications();assert.equal(sends.length,beforeRead,'Read state suppresses only its own conversation')
 email.id='00000000-0000-4000-8000-000000000008';email.message_id='<another-thread@example.com>';await notify.deliverInboxNotifications();assert.equal(sends.length,beforeRead+1,'Another unread conversation from the same person still notifies')
 const route=loader({'@/lib/inbox/notifications':{deliverInboxNotifications:async()=>({sent:0})}})('app/api/cron/inbox-notifications/route.ts'),prior=process.env.CRON_SECRET;process.env.CRON_SECRET='mock-cron'
 assert.equal((await route.GET(new Request('https://koryx.ca/api/cron/inbox-notifications'))).status,401);assert.equal((await route.GET(new Request('https://koryx.ca/api/cron/inbox-notifications',{headers:{authorization:'Bearer mock-cron'}}))).status,200)
 if(prior===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=prior
 console.log('Mailbox notifications: default off, per-person consent, verified recipient, no forwarding, read/history suppression, opt-out recheck, deduplication, safe retry and cron authorization passed. No real email sent.')
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{global.fetch=oldFetch;for(const [key,value] of [['RESEND_API_KEY',oldSend],['RESEND_INBOUND_API_KEY',oldInbound]])if(value===undefined)delete process.env[key];else process.env[key]=value})
