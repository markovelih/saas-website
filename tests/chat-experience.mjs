import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'
async function sourceModule(path){const text=await fs.readFile(new URL('../'+path,import.meta.url),'utf8'),js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,module={exports:{}};new Function('module','exports',js)(module,module.exports);return module.exports}
const {chatMessageId}=await sourceModule('lib/project-chat/message-id.ts')
const wifiId=chatMessageId({getRandomValues:array=>crypto.getRandomValues(array)});assert.match(wifiId,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/)
const {validPushEndpoint,pushBody}=await sourceModule('lib/project-chat/push-policy.ts')
for(const endpoint of ['https://fcm.googleapis.com/fcm/send/token','https://web.push.apple.com/token','https://updates.push.services.mozilla.com/wpush/v2/token','https://wns2-ch1p.notify.windows.com/token'])assert.equal(validPushEndpoint(endpoint),true)
for(const endpoint of ['https://127.0.0.1/token','http://fcm.googleapis.com/token','https://fcm.googleapis.com.evil.test/token','https://evil.test/https://fcm.googleapis.com','https://fcm.googleapis.com:8443/token','https://attacker@fcm.googleapis.com/token','https://fcm.googleapis.com/token#test','https://localhost/token','file:///etc/passwd','not a URL'])assert.equal(validPushEndpoint(endpoint),false)
assert.equal(pushBody('en'),'Your developer sent a new message.');assert.ok(pushBody('uk').includes('Розробник'))
const {chatAITranscript,chatAISystem}=await sourceModule('lib/project-chat/assistant.ts')
const base={sender_id:'private-id',sender_name:'Private Name',order_id:'private-order',sender_role:'client',attachments:[{name:'private-photo.jpg'}],body:'A factual client request.'}
const transcript=chatAITranscript([{...base},{...base,body:'deleted private text',deleted_at:'now'},{...base,body:'failed text',failed:true},{...base,body:'pending text',pending:true}])
assert.deepEqual(transcript,[{speaker:'client',text:'A factual client request.'}]);assert.ok(!JSON.stringify(transcript).includes('Private'));assert.ok(!JSON.stringify(transcript).includes('photo'))
const bounded=chatAITranscript(Array.from({length:100},()=>({...base,body:'x'.repeat(8000)})))
assert.ok(bounded.length<=40);assert.ok(bounded.reduce((sum,m)=>sum+m.text.length,0)<=22000)
assert.ok(chatAISystem('reply',true).includes('language of the CLIENT'));assert.ok(chatAISystem('reply',true).includes('reply as the developer'));assert.ok(chatAISystem('reply',false).includes('reply as the client'));assert.ok(chatAISystem('analyze',true).includes('untrusted content'))
const handlers={},shown=[],opened=[]
const worker={location:{origin:'https://koryx.ca'},addEventListener:(event,fn)=>handlers[event]=fn,skipWaiting(){},registration:{showNotification:(title,options)=>shown.push({title,...options})},clients:{claim(){},matchAll:async()=>[],openWindow:url=>opened.push(url)}}
vm.runInNewContext(await fs.readFile(new URL('../public/sw.js',import.meta.url),'utf8'),{self:worker,URL})
assert.equal(handlers.fetch,undefined,'Worker must never cache private fetches')
let work;handlers.push({data:{json:()=>({title:'Fake',body:'A generic notification',url:'https://evil.test/steal'})},waitUntil:p=>work=p});await work
assert.equal(shown[0].title,'Koryx');assert.equal(shown[0].data.url,'/dashboard/chats')
handlers.notificationclick({notification:{close(){},data:{url:'https://evil.test/steal'}},waitUntil:p=>work=p});assert.equal(opened.length,0)
handlers.notificationclick({notification:{close(){},data:{url:'/dashboard/chats?project=00000000-0000-4000-8000-000000000010'}},waitUntil:p=>work=p});await work;assert.equal(opened.length,1);assert.ok(opened[0].startsWith('https://koryx.ca/dashboard/chats'))
console.log('PASS: push endpoint restrictions, private notification content, bounded AI context and safe service-worker navigation')
