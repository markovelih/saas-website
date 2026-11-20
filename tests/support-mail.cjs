const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript')
function load(file,overrides={}){
 file=path.resolve(file);const m={exports:{}}
 new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(name=>Object.hasOwn(overrides,name)?overrides[name]:name==='server-only'?{}:name.startsWith('@/')?load(name.slice(2)+'.ts',overrides):name.startsWith('.')?load(path.resolve(path.dirname(file),name)+'.ts',overrides):require(name),m,m.exports)
 return m.exports
}
const id='00000000-0000-4000-8000-000000000001',fileId='00000000-0000-4000-8000-000000000002'
let authorized=true,requests=[],reads=0
const auth={'@/lib/supabase/admin':{founderClient:async()=>{if(!authorized)throw Error('Unauthorized');return {user:{id:'founder'}}}}}
const original={id,from:'Sender <sender@example.com>',reply_to:['Replies <reply@example.com>'],subject:'Original subject',message_id:'<original@example.com>',references:'<prior@example.com>',to:['support@koryx.ca'],attachments:[],created_at:'2026-11-20T12:00:00Z'}
const {sendSupportEmail}=load('lib/inbox/send.ts',{...auth,'./server':{readInboxEmail:async emailId=>{reads++;assert.equal(emailId,id);return original}}})
const beforeKey=process.env.RESEND_API_KEY,beforeInbound=process.env.RESEND_INBOUND_API_KEY,beforeFetch=global.fetch
process.env.RESEND_API_KEY='mock-send-only';process.env.RESEND_INBOUND_API_KEY='mock-receive-only'
const startedAt=String(Date.now())
function form(changes={},files=[]){const result=new FormData();for(const [key,value] of Object.entries({to:'client@example.com',subject:'A new message',text:'Привіт! <script>plain text</script>',requestId:fileId,startedAt,replyId:'',...changes}))result.set(key,value);for(const file of files)result.append('files',file);return result}
function mock(status=200){global.fetch=async(url,options)=>{requests.push({url,options});return {ok:status<400,status,json:async()=>({id:'mock-sent-id'})}}}
;(async()=>{
 mock();const upload=new File([Buffer.from([1,2,3,4])],'фото.png',{type:'image/png'})
 assert((await sendSupportEmail(form({},[upload]))).success)
 let sent=requests.at(-1),payload=JSON.parse(sent.options.body)
 assert.equal(sent.url,'https://api.resend.com/emails');assert.equal(sent.options.method,'POST')
 assert.equal(payload.from,'Koryx <support@koryx.ca>');assert.equal(payload.reply_to,'support@koryx.ca')
 assert.deepEqual(payload.to,['client@example.com']);assert.equal(payload.text,'Привіт! <script>plain text</script>');assert(!payload.html)
 assert.equal(payload.attachments[0].filename,'фото.png');assert.deepEqual(Buffer.from(payload.attachments[0].content,'base64'),Buffer.from([1,2,3,4]))
 const firstKey=sent.options.headers['Idempotency-Key'];assert(firstKey.length<=256)
 await sendSupportEmail(form({},[upload]));assert.equal(requests.at(-1).options.headers['Idempotency-Key'],firstKey)
 await sendSupportEmail(form({text:'Edited message'},[upload]));assert.notEqual(requests.at(-1).options.headers['Idempotency-Key'],firstKey)
 await sendSupportEmail(form({replyId:id,to:'changed@example.com',subject:'Changed'}));payload=JSON.parse(requests.at(-1).options.body)
 assert.deepEqual(payload.to,['reply@example.com']);assert.equal(payload.subject,'Re: Original subject')
 assert.equal(payload.headers['In-Reply-To'],'<original@example.com>');assert.equal(payload.headers.References,'<prior@example.com> <original@example.com>');assert.equal(reads,1)
 original.message_id='<unsafe@example.com>\r\nBcc: other@example.com'
 await sendSupportEmail(form({replyId:id}));assert(!JSON.parse(requests.at(-1).options.body).headers)
 const count=requests.length
 for(const invalid of [form({to:'bad'}),form({subject:'Header\r\ninjection'}),form({text:''}),form({startedAt:String(Date.now()-24*3600000)}),form({startedAt:String(Date.now()+3600000)}),form({},[new File([''],'empty.txt')]),form({},[new File([new Uint8Array(4*1024*1024+1)],'large.zip')]),form({},Array.from({length:11},()=>upload))])assert((await sendSupportEmail(invalid)).error)
 assert.equal(requests.length,count)
 authorized=false;await assert.rejects(()=>sendSupportEmail(form()),/Unauthorized/);assert.equal(requests.length,count);authorized=true
 mock(500);assert.equal((await sendSupportEmail(form())).uncertain,true)
 mock(422);assert.equal((await sendSupportEmail(form())).uncertain,false)
 global.fetch=async()=>{throw Error('Network timeout')};assert.equal((await sendSupportEmail(form())).uncertain,true)
 delete process.env.RESEND_API_KEY;assert((await sendSupportEmail(form())).error);process.env.RESEND_API_KEY='mock-send-only'

 // The route rejects cross-origin requests and oversized bodies before sending.
 let routeCalls=0
 const route=load('app/api/inbox/send/route.ts',{'@/lib/inbox/send':{sendSupportEmail:async data=>{routeCalls++;assert.equal(data.get('to'),'client@example.com');return {success:true,emailId:'mock'}}}})
 assert.equal((await route.POST(new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://other.example'},body:form()}))).status,403)
 assert.equal((await route.POST(new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://koryx.ca','content-length':'5000000'},body:form()}))).status,413)
 assert.equal(routeCalls,0)
 assert.equal((await route.POST(new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://koryx.ca'},body:form()}))).status,200);assert.equal(routeCalls,1)

 // Attached images use provider-verified URLs. Remote HTML images require a user action.
 const inbox=load('lib/inbox/server.ts',auth)
 assert.deepEqual(inbox.externalImages('<img src="cid:photo"><img src="javascript:bad"><img src="data:image/png;base64,AAAA"><img src="https://images.example.com/a.png?x=1&amp;y=2"><img src="https://u:p@private.example/a">'),['https://images.example.com/a.png?x=1&y=2'])
 global.fetch=async url=>({ok:true,json:async()=>String(url).endsWith('/attachments')?{data:[{id:fileId,download_url:'https://inbound-cdn.resend.com/photo?signature=mock'}]}:{...original,html:'<p>Hello</p><img src="https://images.example.com/a.png">',attachments:[{id:fileId,filename:'photo.png',content_type:'image/png',size:4,content_id:'photo'}]}})
 const detail=await inbox.readInboxEmail(id)
 assert.equal(detail.attachments[0].preview_url,'https://inbound-cdn.resend.com/photo?signature=mock');assert(!detail.html);assert.equal(detail.reply_to[0],'Replies <reply@example.com>')
 assert.deepEqual(detail.external_images,['https://images.example.com/a.png'])

 // Downloads preserve bytes, force an attachment, and only preview raster images/PDFs.
 let attachment={id:fileId,filename:"файл's.png",content_type:'image/png',size:4,url:'https://inbound-cdn.resend.com/file'}
 const download=load('app/api/inbox/[id]/attachments/[attachmentId]/route.ts',{'@/lib/inbox/server':{attachmentDetails:async()=>{if(!authorized)throw Error('Unauthorized');return attachment}}})
 global.fetch=async(_url,options)=>{assert.equal(options.redirect,'error');return new Response(new Uint8Array([1,2,3,4]))}
 const context={params:Promise.resolve({id,attachmentId:fileId})}
 let response=await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId),context)
 assert.equal(response.status,200);assert(response.headers.get('content-disposition').startsWith('attachment;'));assert(response.headers.get('content-disposition').includes('%27'))
 assert.deepEqual(new Uint8Array(await response.arrayBuffer()),new Uint8Array([1,2,3,4]))
 response=await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId+'?preview=1'),context)
 assert.equal(response.headers.get('content-type'),'image/png');assert(response.headers.get('content-disposition').startsWith('inline;'));assert(response.headers.get('content-security-policy').includes('sandbox'))
 attachment={...attachment,content_type:'image/svg+xml'}
 response=await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId+'?preview=1'),context)
 assert.equal(response.headers.get('content-type'),'application/octet-stream');assert(response.headers.get('content-disposition').startsWith('attachment;'))
 authorized=false;assert.equal((await download.GET(new Request('https://koryx.ca/api/inbox/'+id+'/attachments/'+fileId),context)).status,403)
 console.log('Support mail checks passed: compose/reply, reply-to and threading, file bytes, limits, safe retries, authorization, previews, downloads and cross-origin rejection. No real email sent.')
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{global.fetch=beforeFetch;for(const [name,value] of [['RESEND_API_KEY',beforeKey],['RESEND_INBOUND_API_KEY',beforeInbound]])if(value===undefined)delete process.env[name];else process.env[name]=value})
