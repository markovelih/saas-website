import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import ts from 'typescript'
const require=createRequire(import.meta.url)
async function load(path,stubs={}){
 const source=await fs.readFile(new URL('../'+path,import.meta.url),'utf8')
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,testModule={exports:{}}
 new Function('require','module','exports',js)(name=>Object.hasOwn(stubs,name)?stubs[name]:require(name),testModule,testModule.exports)
 return testModule.exports
}
let identity,project,write,dbFailure,pageFailure,calls=[]
const founder='2f0a1860-cb7a-4104-967d-86ccc9166cdc',client='00000000-0000-4000-8000-000000000001',order='00000000-0000-4000-8000-000000000010',conversation='00000000-0000-4000-8000-000000000012'
const direct={thread:{order_id:conversation,kind:'direct',can_write:true},messages:[],pins:[],has_more:false}
const db={auth:{getUser:async()=>({data:{user:identity?{id:identity}:null},error:null})},from:table=>({select(){return this},eq(){return this},single:async()=>({data:{id:identity,role:identity===founder?'admin':'user',full_name:'First PrivateSurname'}}),maybeSingle:async()=>{assert.equal(table,'orders');calls.push('order');return {data:project?{user_id:client}:null,error:dbFailure?{message:'backend error'}:null}}}),rpc:async(name,args)=>{calls.push(name);if(name==='koryx_chat_access')return {data:write,error:dbFailure?{message:'backend error'}:null};if(name==='koryx_chat_page'){assert.equal(args.p_order_id,order);return {data:pageFailure?null:{...direct,thread:{order_id:order,can_write:true,kind:'project'}},error:pageFailure?{message:'read failed'}:null}}assert.equal(name,'koryx_chat_start_direct');assert.equal(args.p_client_id,client);return {data:direct,error:null}}}
const server=await load('lib/project-chat/server.ts',{'server-only':{},'@/lib/supabase/server':{createClient:async()=>db},'@supabase/supabase-js':{createClient(){throw Error('Must not use service role')}},'@/lib/workspace':{isFounder:id=>id===founder},'./policy':{firstName:name=>name.split(' ')[0]}})
const {POST}=await load('app/api/project-chats/open/route.ts',{'@/lib/project-chat/server':server})
function reset(){identity=founder;project=true;write=false;dbFailure=false;pageFailure=false;calls=[]}
function request(body={order_id:order},origin='https://koryx.ca'){return new Request('https://koryx.ca/api/project-chats/open',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)})}
reset();let response=await POST(request());assert.equal(response.status,200);assert.deepEqual(await response.json(),direct);assert.deepEqual(calls,['order','koryx_chat_access','koryx_chat_start_direct']);assert.equal(response.headers.get('cache-control'),'private, no-store')
reset();write=true;response=await POST(request());assert.equal((await response.json()).thread.order_id,order);assert.ok(!calls.includes('koryx_chat_start_direct'))
reset();identity=client;assert.equal((await POST(request())).status,403);assert.deepEqual(calls,[])
reset();identity=null;assert.equal((await POST(request())).status,401);assert.deepEqual(calls,[])
reset();assert.equal((await POST(request({},'https://attacker.test'))).status,403);assert.deepEqual(calls,[])
reset();assert.equal((await POST(request({order_id:'invalid'}))).status,400);assert.deepEqual(calls,[])
reset();project=false;assert.equal((await POST(request())).status,404);assert.deepEqual(calls,['order'])
reset();dbFailure=true;assert.equal((await POST(request())).status,503);assert.deepEqual(calls,['order'])
reset();write=true;pageFailure=true;assert.equal((await POST(request())).status,503);assert.ok(!calls.includes('koryx_chat_start_direct'),'A backend failure must not create a different chat')
const views=await load('lib/billing/document-view.ts')
const snapshot={invoice_number:'KX-2026-A123',receipt_number:'RC-A123',settled:true}
assert.equal(views.documentPath(snapshot,'invoice'),'/invoice-KX-2026-A123');assert.equal(views.documentPath(snapshot,'receipt'),'/receipt-RC-A123')
for(const value of ['invoice-','receipt-../secret','invoice-<script>','other-KX','invoice-'+('a'.repeat(101))])assert.equal(views.parseDocumentPath(value),null)
let generated=0
const {documentResponse}=await load('lib/billing/document-response.ts',{'server-only':{},'./document-view':views,'./pdf':{billingPdf:async()=>{generated++;return new Uint8Array([37,80,68,70])}}})
response=await documentResponse(new Request('https://koryx.ca/api/projects/id/documents/invoice'),snapshot,'invoice');assert.equal(response.status,307);assert.equal(response.headers.get('location'),'/invoice-KX-2026-A123');assert.equal(generated,0)
response=await documentResponse(new Request('https://koryx.ca/api/test?inline=1'),snapshot,'invoice');assert.match(response.headers.get('content-disposition'),/^inline;/);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');assert.equal(response.headers.get('referrer-policy'),'no-referrer')
response=await documentResponse(new Request('https://koryx.ca/api/test?download=1'),snapshot,'receipt');assert.match(response.headers.get('content-disposition'),/^attachment;/);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[37,80,68,70])
assert.equal((await documentResponse(new Request('https://koryx.ca/api/test?download=1'),{...snapshot,settled:false},'receipt')).status,404)
assert.equal((await documentResponse(new Request('https://koryx.ca/api/test'),{...snapshot,receipt_number:''},'receipt')).status,404)
const {findBillingDocument}=await load('lib/billing/find-document.ts',{'server-only':{},'./document-view':views})
let records={},lookupError=false,queries=[]
function lookupDb(){return {from(table){let field,number,excluded;return {select(){return this},eq(f,n){field=f;number=n;return this},neq(f,n){excluded=[f,n];return this},order(){return this},limit(){return this},async maybeSingle(){queries.push({table,field,number,excluded});const row=records[table];return {data:row&&(!excluded||row[excluded[0]]!==excluded[1])&&row.snapshot?.[field.slice(11)]===number?row:null,error:lookupError?{message:'unavailable'}:null}}}}}}
records={project_payments:{snapshot}};let found=await findBillingDocument(lookupDb(),'receipt-RC-A123');assert.equal(found.snapshot,snapshot);assert.ok(queries.every(q=>q.field==='snapshot->>receipt_number'))
records={};assert.equal(await findBillingDocument(lookupDb(),'invoice-KX-2026-A123'),null,'Hidden or missing records must not be discoverable')
records={payment_requests:{snapshot:{...snapshot,settled:false}},payment_transactions:{snapshot}};found=await findBillingDocument(lookupDb(),'invoice-KX-2026-A123');assert.equal(found.snapshot.settled,true,'Prefer the settled snapshot for the same invoice number')
records={domain_renewals:{snapshot,status:'cancelled'}};assert.equal(await findBillingDocument(lookupDb(),'receipt-RC-A123'),null)
records={project_payments:{snapshot:{...snapshot,settled:false}}};assert.equal(await findBillingDocument(lookupDb(),'receipt-RC-A123'),null)
lookupError=true;await assert.rejects(()=>findBillingDocument(lookupDb(),'invoice-KX-2026-A123'))
console.log('PASS: founder project-to-chat resolution, failed-action handling, stable document URLs, inline/download behavior and private snapshot lookup')
