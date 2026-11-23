const assert=require('node:assert/strict'),makeDb=require('./helpers/support-mail-db.cjs'),loader=require('./helpers/load-typescript.cjs')
const id='00000000-0000-4000-8000-000000000001',fileId='00000000-0000-4000-8000-000000000002',sentId='00000000-0000-4000-8000-000000000004'
const db=makeDb()
let authorized=true,requests=[],reads=0
const original={id,from:'Sender <sender@example.com>',reply_to:['Replies <reply@example.com>'],subject:'Original subject',message_id:'<original@example.com>',references:'<prior@example.com>',to:['support@koryx.ca'],attachments:[],created_at:'2026-11-20T12:00:00Z'}
const auth={'@/lib/supabase/admin':{founderClient:async()=>{if(!authorized)throw Error('Unauthorized');return {supabase:db,user:{id:'founder'}}}}}
const load=loader({...auth,'./server':{readInboxEmail:async(emailId,_attachments,direction)=>{reads++;assert.equal(emailId,id);return direction==='outbound'?{...original,direction:'outbound',from:'support@koryx.ca',to:['prior-recipient@example.com']}:original}}})
const {sendSupportEmail}=load('lib/inbox/send.ts')
const beforeKey=process.env.RESEND_API_KEY,beforeInbound=process.env.RESEND_INBOUND_API_KEY,beforeFetch=global.fetch
process.env.RESEND_API_KEY='mock-send-only';process.env.RESEND_INBOUND_API_KEY='mock-receive-only'
const startedAt=String(Date.now())
function form(changes={},files=[]){const result=new FormData();for(const [key,value] of Object.entries({to:'client@example.com',subject:'A new message',text:'Привіт! <script>plain text</script>',requestId:fileId,startedAt,replyId:'',...changes}))result.set(key,value);for(const file of files)result.append('files',file);return result}
function mock(status=200,providerId=sentId){global.fetch=async(url,options)=>{requests.push({url,options});assert(db.events.includes('save-mail'),'Archive the message before sending');return {ok:status<400,status,json:async()=>({id:providerId})}}}
;(async()=>{
 mock();const upload=new File([Buffer.from([1,2,3,4])],'фото.png',{type:'image/png'})
 const success=await sendSupportEmail(form({},[upload]));assert(success.success);assert.equal(success.email.attachments.length,1)
 let sent=requests.at(-1),payload=JSON.parse(sent.options.body)
 assert.equal(sent.url,'https://api.resend.com/emails');assert.equal(sent.options.method,'POST')
 assert.equal(payload.from,'Koryx <support@koryx.ca>');assert.equal(payload.reply_to,'support@koryx.ca')
 assert.deepEqual(payload.to,['client@example.com']);assert.equal(payload.text,'Привіт! <script>plain text</script>');assert(!payload.html)
 assert.equal(payload.attachments[0].filename,'фото.png');assert.deepEqual(Buffer.from(payload.attachments[0].content,'base64'),Buffer.from([1,2,3,4]))
 const firstKey=sent.options.headers['Idempotency-Key'];assert(firstKey.length<=256)
 await sendSupportEmail(form({},[upload]));assert.equal(requests.length,1,'A saved successful draft must never be sent again')
 assert.equal(db.rows.length,1);assert.equal(db.objects.size,1)
 assert.equal(db.rows[0].status,'sent');assert(db.rows[0].snapshot.kind==='support_email')
 await sendSupportEmail(form({text:'Edited message'},[upload]));assert.notEqual(requests.at(-1).options.headers['Idempotency-Key'],firstKey)
 mock(200,'00000000-0000-4000-8000-000000000005')
 await sendSupportEmail(form({replyId:id,to:'changed@example.com',subject:'Changed'}));payload=JSON.parse(requests.at(-1).options.body)
 assert.deepEqual(payload.to,['reply@example.com']);assert.equal(payload.subject,'Re: Original subject')
 assert.equal(payload.headers['In-Reply-To'],'<original@example.com>');assert.equal(payload.headers.References,'<prior@example.com> <original@example.com>');assert.equal(reads,1)
 await sendSupportEmail(form({replyId:id,replyDirection:'outbound'}));payload=JSON.parse(requests.at(-1).options.body)
 assert.deepEqual(payload.to,['prior-recipient@example.com'],'Replying to your own message must target the other person')
 original.message_id='<unsafe@example.com>\r\nBcc: other@example.com'
 await sendSupportEmail(form({replyId:id,text:'Safe headers'}));assert(!JSON.parse(requests.at(-1).options.body).headers)
 const rich=await sendSupportEmail(form({text:'Formatted photo',html:'<p><b>Formatted photo</b></p><img src="cid:'+fileId+'"><script>bad()</script>',inlineIds:JSON.stringify([fileId])},[upload]));assert(rich.success)
 payload=JSON.parse(requests.at(-1).options.body);assert(payload.html.includes('<b>Formatted photo</b>'));assert(!payload.html.includes('<script'));assert.equal(payload.attachments[0].content_id,fileId);assert.equal(rich.email.attachments[0].content_id,fileId);assert(rich.email.body_html.includes('/api/inbox/'));assert.deepEqual(rich.email.inline_ids,[rich.email.attachments[0].id])
 const count=requests.length,stored=db.rows.length
 for(const invalid of [form({to:'bad'}),form({subject:'Header\r\ninjection'}),form({text:''}),form({startedAt:String(Date.now()-24*3600000)}),form({startedAt:String(Date.now()+3600000)}),form({},[new File([''],'empty.txt')]),form({},[new File([new Uint8Array(4*1024*1024+1)],'large.zip')]),form({},Array.from({length:11},()=>upload))])assert((await sendSupportEmail(invalid)).error)
 assert.equal(requests.length,count);assert.equal(db.rows.length,stored)
 authorized=false;await assert.rejects(()=>sendSupportEmail(form()),/Unauthorized/);assert.equal(requests.length,count);authorized=true
 mock(500);assert.equal((await sendSupportEmail(form({text:'Uncertain'}))).uncertain,true)
 mock(200,'00000000-0000-4000-8000-000000000006');await sendSupportEmail(form({text:'Uncertain'}));assert.equal(requests.at(-1).options.headers['Idempotency-Key'],requests.at(-2).options.headers['Idempotency-Key'])
 mock(422);assert.equal((await sendSupportEmail(form({text:'Rejected'}))).uncertain,false)
 global.fetch=async()=>{throw Error('Network timeout')};assert.equal((await sendSupportEmail(form({text:'Network issue'}))).uncertain,true)

 // New requests and new browser sessions read the immutable archive, even with the provider unavailable.
 const inbox=loader(auth)('lib/inbox/server.ts')
 const page=await inbox.readInboxPage();assert(page.emails.some(email=>email.id===sentId&&email.direction==='outbound'))
 const afterReload=await inbox.readInboxEmail(sentId,true,'outbound')
 assert.equal(afterReload.text,'Привіт! <script>plain text</script>');assert.equal(afterReload.attachments[0].filename,'фото.png')
 const savedFile=await inbox.attachmentDetails(sentId,afterReload.attachments[0].id,'outbound')
 assert.deepEqual(savedFile.bytes,new Uint8Array([1,2,3,4]))
 const types=load('lib/inbox/types.ts')
 assert.equal(types.contactForEmail(afterReload),'client@example.com')
 assert.equal(types.mergeEmails([afterReload],[{...afterReload,id:afterReload.archive_id}]).length,1)
 assert.deepEqual(inbox.externalImages('<img src="cid:photo"><img src="javascript:bad"><img src="data:image/png;base64,AAAA"><img src="https://images.example.com/a.png?x=1&amp;y=2"><img src="https://u:p@private.example/a">'),['https://images.example.com/a.png?x=1&y=2'])

 // Previously sent provider messages and their attachments are imported into the same permanent archive.
 const historicalId='00000000-0000-4000-8000-000000000008'
 global.fetch=async url=>{
  if(String(url).startsWith('https://outbound-cdn.resend.com/'))return new Response(new Uint8Array([5,6]))
  return {ok:true,json:async()=>String(url).endsWith('/attachments')?{data:[{id:fileId,filename:'previous.pdf',content_type:'application/pdf',size:2,download_url:'https://outbound-cdn.resend.com/file'}]}:{...original,id:historicalId,direction:'outbound',from:'Koryx <support@koryx.ca>',to:['client@example.com'],text:'Previous reply',attachments:undefined}}
 }
 const history=await inbox.readInboxEmail(historicalId,true,'outbound');assert.equal(history.attachments.length,1)
 global.fetch=async()=>{throw Error('Provider expired')}
 assert.equal((await inbox.readInboxEmail(historicalId,true,'outbound')).text,'Previous reply')

 // A document endpoint with valid authentication preserves file bytes and prevents active HTML/SVG previews.
 let attachment={id:fileId,filename:"файл's.png",content_type:'image/png',size:4,bytes:new Uint8Array([1,2,3,4])}
 const download=loader({'@/lib/inbox/server':{attachmentDetails:async()=>{if(!authorized)throw Error('Unauthorized');return attachment}}})('app/api/inbox/[id]/attachments/[attachmentId]/route.ts')
 const context={params:Promise.resolve({id,attachmentId:fileId})}
 let response=await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId),context)
 assert.equal(response.status,200);assert(response.headers.get('content-disposition').startsWith('attachment;'));assert(response.headers.get('content-disposition').includes('%27'))
 assert.deepEqual(new Uint8Array(await response.arrayBuffer()),new Uint8Array([1,2,3,4]))
 response=await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId+'?preview=1'),context)
 assert.equal(response.headers.get('content-type'),'image/png');assert(response.headers.get('content-security-policy').includes('sandbox'))
 attachment={...attachment,content_type:'image/svg+xml'}
 response=await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId+'?preview=1'),context)
 assert.equal(response.headers.get('content-type'),'application/octet-stream')
 authorized=false;assert.equal((await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId),context)).status,403);authorized=true

 let routeCalls=0
 const route=loader({...auth,'@/lib/inbox/send':{sendSupportEmail:async data=>{routeCalls++;assert.equal(data.get('to'),'client@example.com');return {success:true,emailId:sentId}}}})('app/api/inbox/send/route.ts')
 assert.equal((await route.POST(new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://other.example'},body:form()}))).status,403)
 assert.equal((await route.POST(new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://koryx.ca','content-length':'5000000'},body:form()}))).status,413);assert.equal(routeCalls,0)
 assert.equal((await route.POST(new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://koryx.ca'},body:form()}))).status,200)
 console.log('Support mail checks passed: durable replies/files, private storage, import of earlier sent mail, reload after provider expiry, same-person contacts, safe retries, threading, authorization and downloads. No real email sent.')
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{global.fetch=beforeFetch;for(const [name,value] of [['RESEND_API_KEY',beforeKey],['RESEND_INBOUND_API_KEY',beforeInbound]])if(value===undefined)delete process.env[name];else process.env[name]=value})
