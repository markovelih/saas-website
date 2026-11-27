const assert=require('node:assert/strict'),makeDb=require('./helpers/support-mail-db.cjs'),loader=require('./helpers/load-typescript.cjs')
const db=makeDb(),owner='00000000-0000-4000-8000-000000000099',id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const load=loader({'@/lib/supabase/admin':{founderClient:async()=>({supabase:db,user:{id:owner,email:'ceo_artem@koryx.ca'}})}})
const inbox=load('lib/inbox/server.ts'),send=load('lib/inbox/send.ts'),contacts=load('lib/inbox/contacts.ts'),threads=load('lib/inbox/thread-store.ts')
const support={id:id(1),from:'client@example.com',to:['support@koryx.ca'],subject:'Support request',created_at:new Date().toISOString(),message_id:'<support@example.com>',text:'Support body',attachments:[]}
const ceo={...support,id:id(2),to:['ceo_artem@koryx.ca'],subject:'CEO message',message_id:'<ceo@example.com>',html:'<p><b>Private</b></p><img src="cid:photo">',attachments:[{id:id(3),filename:'photo.png',content_type:'image/png',size:4,content_id:'photo'}]}
const previousFetch=global.fetch
process.env.RESEND_API_KEY='mock-send';process.env.RESEND_INBOUND_API_KEY='mock-read'
let sent=[]
global.fetch=async(url,options)=>{
 if(options?.method==='POST'){sent.push(JSON.parse(options.body));return {ok:true,json:async()=>({id:id(10)})}}
 if(url.startsWith('https://inbound-cdn.resend.com/'))return new Response(new Uint8Array([1,2,3,4]))
 if(url.includes('/attachments'))return {ok:true,json:async()=>({data:[{...ceo.attachments[0],download_url:'https://inbound-cdn.resend.com/photo'}],has_more:false})}
 if(url.includes('limit='))return {ok:true,json:async()=>({data:url.includes('/receiving')?[support,ceo]:[],has_more:false})}
 return {ok:true,json:async()=>url.includes(ceo.id)?ceo:support}
}
;(async()=>{
 const a=await inbox.readInboxPage(),b=await inbox.readInboxPage(undefined,'ceo')
 assert(!a.error,a.error);assert(!b.error,b.error)
 assert.deepEqual(a.emails.map(x=>x.id),[support.id]);assert.deepEqual(b.emails.map(x=>x.id),[ceo.id])
 const detail=await inbox.readInboxEmail(ceo.id,true,'inbound',false,'ceo')
 assert(detail.body_html.includes('account=ceo'));assert.deepEqual(detail.inline_ids,[id(3)])
 assert.deepEqual((await inbox.attachmentDetails(ceo.id,id(3),'inbound','ceo')).bytes,new Uint8Array([1,2,3,4]))
 await assert.rejects(()=>inbox.readInboxEmail(ceo.id,true,'inbound'),/not in the support/)
 await assert.rejects(()=>inbox.attachmentDetails(ceo.id,id(3),'inbound'),/not in the support/)
 await assert.rejects(()=>inbox.readInboxEmail(support.id,true,'inbound',false,'ceo'),/not in the support/)
 await assert.rejects(()=>inbox.readInboxPage(undefined,'arbitrary@example.com'),/Unknown mailbox/)
 await contacts.updateContactState('client@example.com',{action:'notify',value:true},'ceo')
 assert.equal((await contacts.readContactStates()).contacts.length,0)
 assert.equal((await contacts.readContactStates('ceo')).contacts[0].notify_since!=null,true)
 await threads.updateThreadState(ceo.id,'inbound',{action:'pin',value:true},'ceo')
 assert.equal((await threads.readThreadStates(db,owner)).some(x=>x.pinned_at),false)
 assert.equal((await threads.readThreadStates(db,owner,'ceo')).some(x=>x.pinned_at),true)
 const form=new FormData()
 for(const [k,v] of Object.entries({account:'ceo',to:'ignored@example.com',subject:'Ignored',text:'A reply',requestId:id(7),startedAt:String(Date.now()),replyId:ceo.id,replyDirection:'inbound'}))form.set(k,v)
 const result=await send.sendSupportEmail(form);assert(result.success,result.error)
 assert.equal(sent[0].from,'Artem · Koryx <ceo_artem@koryx.ca>');assert.equal(sent[0].reply_to,'ceo_artem@koryx.ca')
 assert.deepEqual(sent[0].to,['client@example.com']);assert.equal(sent[0].headers['In-Reply-To'],ceo.message_id)
 const page=await inbox.readInboxPage(undefined,'ceo');assert(page.emails.some(x=>x.id===id(10)))
 const other=await inbox.readInboxPage();assert(!other.emails.some(x=>x.id===id(10)))
 assert.equal(db.rows.find(x=>x.email_id===id(10)).mail_account,'ceo')
 console.log('Company mailboxes: separate lists, thread/contact preferences, archive, authenticated attachment access, inline CID images, CEO sender and reply headers passed. Mock mail only.')
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=previousFetch})
