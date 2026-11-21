/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness loads the real TypeScript handlers. */
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),{randomUUID,createHash}=require('node:crypto'),loader=require('./helpers/load-typescript.cjs'),adapter=require('./helpers/pg-supabase.cjs')
async function main(){
 const {projectTestDb}=await import('./helpers/project-db.mjs'),pg=await projectTestDb(),db=adapter(pg)
 const [founder,owner,other,order,another,release,fileId]=Array.from({length:7},()=>randomUUID());let identity={id:founder}
 try{
  const migrations=(await fs.readdir('supabase/migrations')).filter(x=>x.endsWith('_legacy_source_imports.sql'));assert.equal(migrations.length,1);await pg.exec(await fs.readFile('supabase/migrations/'+migrations[0],'utf8'))
  await pg.query('insert into profiles(id) values($1),($2),($3)',[founder,owner,other]);await pg.query("insert into orders(id,user_id,quote_price,purchase_mode) values($1,$2,100,'managed'),($3,$2,100,'buyout')",[order,owner,another]);await pg.query('insert into project_source_releases(id,order_id,title) values($1,$2,$3)',[release,order,'Reviewed import'])
  const text='export const title = "Client website"\n',bytes=Buffer.from(text),hash=createHash('sha256').update(bytes).digest('hex')
  await pg.query('insert into project_source_files(id,release_id,path,storage_path,size,sha256,mime,content_base64) values($1,$2,$3,$4,$5,$6,$7,$8)',[fileId,release,'app/page.tsx','database/'+fileId,bytes.length,hash,'text/plain',bytes.toString('base64')])
  const load=loader({'@/lib/payments/server':{paymentDb:()=>db},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:identity}})}})},'@/lib/workspace':{isFounder:id=>id===founder}}),file=load('app/api/projects/[id]/source/[fileId]/route.ts'),list=load('app/api/projects/[id]/source/route.ts')
  const req=(suffix='')=>new Request('https://koryx.ca/source'+suffix),params=(id=order)=>({params:Promise.resolve({id,fileId})})
  assert.equal((await (await file.GET(req(),params())).json()).text,text)
  assert.equal(await (await file.GET(req('?download=1'),params())).text(),text)
  const metadata=await (await list.GET(req(),params())).json();assert.equal(metadata.files.length,1);assert(!JSON.stringify(metadata).includes('content_base64'));assert(!JSON.stringify(metadata).includes(bytes.toString('base64')))
  assert.equal((await file.GET(req(),params(another))).status,404,'a file cannot cross project boundaries')
  identity={id:owner};assert.equal((await file.GET(req(),params())).status,403,'private monthly snapshots remain Founder-only');identity={id:other};assert.equal((await file.GET(req(),params())).status,404)
  identity={id:founder};await pg.query('update project_source_files set content_base64=$1 where id=$2',[Buffer.from('x'.repeat(bytes.length)).toString('base64'),fileId]);assert.equal((await file.GET(req(),params())).status,503,'corruption is rejected before returning bytes')
  await assert.rejects(pg.query('update project_source_files set content_base64=$1 where id=$2',['eA==',fileId]),/check constraint/)
  for(const role of ['anon','authenticated'])assert.equal((await pg.query("select has_table_privilege($1,'project_source_files','SELECT') as ok",[role])).rows[0].ok,false)
  assert.equal((await pg.query("select relrowsecurity as ok from pg_class where oid='project_source_files'::regclass")).rows[0].ok,true)
  console.log('Private legacy Source imports passed: file content/download, metadata privacy, Founder access, customer and cross-project denial, checksums, database size constraints and RLS. No external calls.')
 }finally{await pg.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
