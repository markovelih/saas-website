const assert=require('node:assert/strict'),loader=require('./helpers/load-typescript.cjs'),makeDb=require('./helpers/support-mail-db.cjs')
const db=makeDb(),owner='00000000-0000-4000-8000-000000000099',id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const base=n=>({id:id(n),from:'client@example.com',to:['support@koryx.ca'],subject:'Project',created_at:new Date(1700000000000+n*1000).toISOString(),attachments:[],text:'PRIVATE BODY',html:'<p>PRIVATE HTML</p>',message_id:`<m${n}@example.com>`})
const a=base(1),reply={...base(2),subject:'Changed subject',headers:{'IN-REPLY-TO':a.message_id,References:a.message_id}},independent=base(3),sent={...base(4),from:'Koryx <support@koryx.ca>',to:['client@example.com']}
db.rows.push({id:id(80),dedupe_key:'support-mail/outbound/old',user_id:owner,email_id:sent.id,status:'sent',created_at:sent.created_at,snapshot:{kind:'support_email',version:1,direction:'outbound',headers:{'In-Reply-To':a.message_id,References:a.message_id},email:{...sent,message_id:undefined},files:[]}})
const load=loader({'@/lib/supabase/admin':{founderClient:async()=>({supabase:db,user:{id:owner,email:'owner@example.com'}})}}),inbox=load('lib/inbox/server.ts'),{mailConversations}=load('lib/inbox/conversations.ts')
let detailReads=0,attachments=0
const priorFetch=global.fetch,priorIn=process.env.RESEND_INBOUND_API_KEY,priorOut=process.env.RESEND_API_KEY
process.env.RESEND_INBOUND_API_KEY='mock-inbound';process.env.RESEND_API_KEY='mock-outbound'
global.fetch=async value=>{const url=new URL(value);if(url.pathname.includes('/attachments'))attachments++;if(url.searchParams.has('limit'))return {ok:true,json:async()=>({data:url.pathname.endsWith('/receiving')?[a,reply,independent].map(({headers,text,html,...meta})=>meta):[sent].map(({text,html,...meta})=>meta),has_more:false})};detailReads++;const email=[a,reply,independent,sent].find(email=>url.pathname.endsWith('/'+email.id));assert(email,url.href);return {ok:true,json:async()=>email}}
;(async()=>{
 const first=await inbox.readInboxPage();assert(!first.error,first.error)
 const groups=mailConversations(first.emails,first.threads);assert.equal(groups.length,2)
 assert.equal(groups.find(group=>group.id==='rfc:'+a.message_id).messages.length,3,'Legacy outbound reply headers must survive the sparse sent-email API response')
 assert.equal(groups.find(group=>group.messages.some(email=>email.id===independent.id)).messages.length,1)
 assert.equal(db.headers.length,4);assert.equal(attachments,0);assert(!JSON.stringify(db.headers).includes('PRIVATE'),'Index only routing metadata, never body content')
 const before=detailReads;await inbox.readInboxPage();assert.equal(detailReads,before,'Refresh uses cached headers rather than fetching every full email again')
 console.log('Mail thread index: header discovery, cached refresh, legacy outbound links, independent same-subject mail, body-free metadata and no attachment downloads passed. Mock provider only.')
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{global.fetch=priorFetch;for(const [key,value] of [['RESEND_INBOUND_API_KEY',priorIn],['RESEND_API_KEY',priorOut]])if(value===undefined)delete process.env[key];else process.env[key]=value})
