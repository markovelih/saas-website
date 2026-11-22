const assert=require('node:assert/strict'),makeDb=require('./helpers/support-mail-db.cjs'),loader=require('./helpers/load-typescript.cjs')
const db=makeDb(),id='00000000-0000-4000-8000-000000000001',attachmentId='00000000-0000-4000-8000-000000000002'
let authorized=true,requests=[]
const load=loader({'@/lib/supabase/admin':{founderClient:async()=>{if(!authorized)throw Error('Unauthorized');return {supabase:db,user:{id:'founder'}}}}})
const m=load('lib/inbox/server.ts')
const email={id,to:['Support <support@koryx.ca>'],from:'Client <client@example.com>',subject:'Please update two pages',created_at:'2026-11-20T12:00:00Z',html:'<style>bad</style><p>Hello</p><script>steal()</script><img src="https://track.example.com"/><p>New pages &amp; features</p>',text:null}
const file={id:attachmentId,filename:'brief.pdf',content_type:'application/pdf',size:4,download_url:'https://inbound-cdn.resend.com/file?signature=mock'}
assert(m.supportRecipient(email));assert(!m.supportRecipient({to:['support@koryx.ca <other@example.com>']}));assert(!m.supportRecipient({to:['support@koryx.ca.evil.test']}));assert(m.supportRecipient({received_for:['support@koryx.ca']}))
assert.equal(m.mailText(null,email.html),'Hello\nNew pages & features');assert.equal(m.mailText('X'.repeat(250000),null).length,200000)
const oldKey=process.env.RESEND_INBOUND_API_KEY,oldSend=process.env.RESEND_API_KEY,oldFetch=global.fetch
;(async()=>{
 delete process.env.RESEND_INBOUND_API_KEY;delete process.env.RESEND_API_KEY
 assert.equal((await m.readInboxPage()).configured,false)
 process.env.RESEND_INBOUND_API_KEY='mock-key'
 global.fetch=async(url,options)=>{
  requests.push(String(url));assert.equal(options.cache,'no-store')
  if(String(url).startsWith('https://inbound-cdn.resend.com/'))return new Response(new Uint8Array([1,2,3,4]))
  assert.equal(options.headers.Authorization,'Bearer mock-key')
  if(String(url).includes('/attachments'))return {ok:true,json:async()=>({data:[file],has_more:false})}
  if(String(url).includes('/'+id))return {ok:true,json:async()=>email}
  return {ok:true,json:async()=>({data:String(url).includes('/receiving')?[email,{...email,id:attachmentId,to:['private@other.test']}]:[],has_more:String(url).includes('/receiving')})}
 }
 const page=await m.readInboxPage();assert.equal(page.emails.length,1);assert.equal(page.cursor,attachmentId);assert(page.hasMore)
 const detail=await m.readInboxEmail(id);assert.equal(detail.text,'Hello\nNew pages & features');assert(!detail.html.includes('<script'));assert(!detail.body_html.includes('https://track.example.com'))
 assert.equal(detail.attachments[0].id,attachmentId,'List attachments must work when the email has no attachments field')
 const saved=await m.readInboxEmail(id);assert(saved.archive_id);assert.equal(db.objects.size,1)
 const bytes=await m.attachmentDetails(id,attachmentId);assert.deepEqual(bytes.bytes,new Uint8Array([1,2,3,4]))
 authorized=false;const before=requests.length
 await assert.rejects(()=>m.readInboxPage(),/Unauthorized/);await assert.rejects(()=>m.readInboxEmail(id),/Unauthorized/);await assert.rejects(()=>m.attachmentDetails(id,attachmentId),/Unauthorized/);assert.equal(requests.length,before);authorized=true
 await assert.rejects(()=>m.readInboxEmail('../../api-keys'));assert.equal(requests.length,before)
 const other='00000000-0000-4000-8000-000000000003'
 global.fetch=async()=>({ok:true,json:async()=>({...email,id:other,to:['private@other.test']})})
 await assert.rejects(()=>m.readInboxEmail(other),/not in the support/)
 global.fetch=async()=>({ok:false,status:403})
 assert((await m.readInboxPage()).error.includes('mail'))
 console.log('Inbox checks passed: authorization, support filtering, separate attachment discovery, private persistent files, safe text, pagination and archive fallback. No live mail read or sent.')
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{global.fetch=oldFetch;for(const [key,value] of [['RESEND_INBOUND_API_KEY',oldKey],['RESEND_API_KEY',oldSend]])if(value===undefined)delete process.env[key];else process.env[key]=value})
