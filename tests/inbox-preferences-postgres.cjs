const assert=require('node:assert/strict'),fs=require('node:fs'),{PGlite}=require('@electric-sql/pglite')
;(async()=>{
 const db=new PGlite()
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create table public.billing_mail(id uuid primary key,dedupe_key text,user_id uuid,email_id text,status text,created_at timestamptz,snapshot jsonb);grant usage on schema public to anon,authenticated,service_role;grant select on billing_mail to service_role;`)
 await db.exec(fs.readFileSync('supabase/migrations/20261122234032_support_inbox_preferences.sql','utf8'))
 const owner='00000000-0000-4000-8000-000000000001'
 await db.query('insert into auth.users values ($1)',[owner])
 await db.query(`insert into billing_mail values ($1,'support-mail/inbound/test',$1,'provider-id','sent',now(),$2)`,[owner,JSON.stringify({kind:'support_email',version:1,direction:'inbound',email:{id:'provider-id',from:'client@example.com',to:['support@koryx.ca'],subject:'Brief',text:'PRIVATE BODY',html:'<p>PRIVATE HTML</p>'},files:[]})])
 await db.exec('set role service_role')
 const index=(await db.query('select * from support_mail_index')).rows;assert.equal(index.length,1);assert(!JSON.stringify(index).includes('PRIVATE'));assert.equal(index[0].snapshot.email.subject,'Brief')
 await db.query('insert into support_inbox_contacts(user_id,contact,pinned_at) values ($1,$2,now())',[owner,'client@example.com'])
 const state=(await db.query('select * from support_inbox_contacts')).rows[0];assert(state.pinned_at);assert.equal(state.notify_since,null)
 for(const role of ['anon','authenticated']){await db.exec('reset role;set role '+role);await assert.rejects(()=>db.query('select * from support_inbox_contacts'),/permission denied/);await assert.rejects(()=>db.query('select * from support_mail_index'),/permission denied/)}
 await db.exec('reset role');assert.equal((await db.query("select relrowsecurity from pg_class where relname='support_inbox_contacts'")).rows[0].relrowsecurity,true)
 await db.close();console.log('Postgres mailbox: real migration, notification opt-out default, private grants/RLS and body-free list view passed.')
})().catch(error=>{console.error(error);process.exitCode=1})
