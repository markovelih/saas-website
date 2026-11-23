const assert=require('node:assert/strict'),loader=require('./helpers/load-typescript.cjs'),makeDb=require('./helpers/support-mail-db.cjs')
const db=makeDb(),owner='2f0a1860-cb7a-4104-967d-86ccc9166cdc',id='00000000-0000-4000-8000-000000000001',fileId='00000000-0000-4000-8000-000000000002'
let authorized=true
const load=loader({'@/lib/supabase/admin':{founderClient:async()=>{if(!authorized)throw Error('Unauthorized');return {supabase:db,user:{id:owner,email:'owner@example.com'}}}}})
const html=load('lib/inbox/html.ts'),contacts=load('lib/inbox/contacts.ts'),threads=load('lib/inbox/conversations.ts')
const email={id,from:'client@example.com',to:['support@koryx.ca'],direction:'inbound',subject:'Photos',created_at:new Date().toISOString(),attachments:[{id:fileId,filename:'photo.png',content_type:'image/png',size:4,content_id:'<photo@client>'}],html:'<p>Before <strong>bold</strong> <em>italic</em><s>old</s></p><img src="cid:photo@client"/><p>After</p><img src="https://tracker.example/pixel"><script>alert(1)</script><iframe src="https://evil.example"></iframe><a href="javascript:alert(2)" onclick="alert(3)">bad link</a><div style="background-image:url(https://evil.example/bg);font-weight:bold;position:fixed">Safe</div>'}
;(async()=>{
 const clean=html.cleanMailHtml(email.html)
 for(const danger of ['<script','<iframe','onclick','javascript:','background-image','position:'])assert(!clean.includes(danger),danger)
 for(const markup of ['<strong>bold</strong>','<em>italic</em>','<s>old</s>','cid:photo@client'])assert(clean.includes(markup),markup)
 assert(!html.mailBody({...email,html:'<p style="color:rgb(0,0,0);font-weight:bold">Visible</p>'}).html.includes('color:rgb(0,0,0)'))
 let body=html.mailBody(email)
 assert(body.html.indexOf('Before')<body.html.indexOf('/api/inbox/'));assert(body.html.indexOf('/api/inbox/')<body.html.indexOf('After'))
 assert(body.html.includes('direction=inbound'));assert.deepEqual(body.inlineIds,[fileId]);assert(!body.html.includes('tracker.example'))
 assert(html.mailBody(email,true).html.includes('tracker.example'));assert(!html.mailBody({...email,attachments:[]}).html.includes('/api/inbox/'))
 for(const input of ['<svg><animate attributeName="href" values="javascript:alert(1)"></animate></svg>','<textarea>bad</textarea/><img src=x onerror=alert(1)>','<noscript><p title="</noscript><img src=x onerror=alert(1)>">bad</p>','<meta http-equiv="refresh" content="0;javascript:alert(1)">','<img src="data:image/svg+xml,evil"><a href="//evil.example">x</a>']){
  const safe=html.cleanMailHtml(input);assert(!/onerror|<svg|<animate|<meta|javascript:|data:image|href="\/\//i.test(safe),safe)
 }
 let state=(await contacts.updateContactState('CLIENT@example.com',{action:'pin',value:true})).state;assert(state.pinned_at);assert.equal(state.contact,'client@example.com');assert.equal(state.notify_since,null)
 state=(await contacts.updateContactState('client@example.com',{action:'archive',value:true})).state;assert(state.archived_at);assert(state.pinned_at,'Archiving must preserve pin')
 state=(await contacts.updateContactState('client@example.com',{action:'notify',value:true})).state;assert(state.notify_since);assert(state.pinned_at);assert(state.archived_at)
 state=(await contacts.updateContactState('client@example.com',{action:'notify',value:false})).state;assert.equal(state.notify_since,null)
 state=(await contacts.updateContactState('client@example.com',{action:'unread',value:false,through:email.created_at})).state;assert.equal(state.read_at,email.created_at)
 let thread=threads.mailConversations([email],[{...state,thread_key:'mail:inbound:'+id}])[0];assert(!thread.unread);assert(thread.archived);assert(thread.waiting)
 const newer={...email,id:fileId,reply_key:'inbound:'+id,created_at:new Date(Date.now()+1000).toISOString()};thread=threads.mailConversations([email,newer],[{...state,thread_key:'mail:inbound:'+id}])[0];assert(thread.unread);assert(!thread.archived,'New incoming mail returns archived people to inbox')
 assert(threads.matchesMailTab(thread,'inbox'));assert(threads.matchesMailTab(thread,'new'));assert(threads.matchesMailTab(thread,'pinned'));assert(!threads.matchesMailTab(thread,'sent'))
 const outgoing={...newer,direction:'outbound',to:['client@example.com'],from:'support@koryx.ca',created_at:new Date(Date.now()+2000).toISOString()};thread=threads.mailConversations([email,newer,outgoing],[{...state,thread_key:'mail:inbound:'+id}])[0];assert(!thread.waiting);assert(threads.matchesMailTab(thread,'sent'))
 assert.equal((await contacts.readContactStates()).contacts.length,1);assert((await contacts.updateContactState('client@example.com',{action:'owner',value:true})).error)
 authorized=false;await assert.rejects(()=>contacts.updateContactState('client@example.com',{action:'pin',value:true}),/Unauthorized/);await assert.rejects(()=>contacts.readContactStates(),/Unauthorized/)
 console.log('Mailbox workspace: rich HTML/XSS policy, in-place CID images, external-image consent, durable independent preferences, automatic archive return, folders and authorization passed.')
})().catch(error=>{console.error(error);process.exitCode=1})
