import {PGlite} from '@electric-sql/pglite'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
// In-memory PostgreSQL: never connects to production or sends actual messages.
const db=new PGlite()
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.role() returns text language sql stable as $$select current_setting('request.jwt.claim.role',true)$$;
grant usage on schema public,auth to authenticated,anon,service_role;grant execute on function auth.uid(),auth.role() to authenticated,anon,service_role;
create type user_role as enum('user','admin');
create table profiles(id uuid primary key,full_name text,role user_role default 'user');
create table orders(id uuid primary key,user_id uuid references profiles(id),business_name text,status text default 'pending');
grant select on orders to authenticated;
create table project_payments(id uuid primary key default gen_random_uuid(),order_id uuid references orders(id));
create table payment_transactions(id uuid primary key default gen_random_uuid(),order_id uuid references orders(id),amount_cents bigint,refunded_cents bigint default 0,care_id uuid);
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select on storage.objects to authenticated;create policy existing_storage_policy on storage.objects for select to authenticated using(true);`)
const migration=await fs.readFile(new URL('../supabase/20261014-project-chat.sql',import.meta.url),'utf8')
await db.exec(migration)
await db.exec(await fs.readFile(new URL('../supabase/20261014-project-chat-experience.sql',import.meta.url),'utf8'))
const founder='2f0a1860-cb7a-4104-967d-86ccc9166cdc',customer='00000000-0000-4000-8000-000000000001',dev1='00000000-0000-4000-8000-000000000002',dev2='00000000-0000-4000-8000-000000000003',stranger='00000000-0000-4000-8000-000000000004',order='00000000-0000-4000-8000-000000000010',order2='00000000-0000-4000-8000-000000000011'
await db.exec(`insert into profiles values('${founder}','Artem PrivateSurname','admin'),('${customer}','Jane CustomerSurname','user'),('${dev1}','Alex\tPrivateSurname','admin'),('${dev2}','Sam PrivateSurname','admin'),('${stranger}','Stranger','user');insert into orders values('${order}','${customer}','Test project','pending'),('${order2}','${stranger}','Unrelated project','pending');`)
let checks=0
async function as(id){await db.exec(`reset role;select set_config('request.jwt.claim.sub','${id}',false);select set_config('request.jwt.claim.role','authenticated',false);set role authenticated;`)}
async function query(sql,args=[]){return (await db.query(sql,args)).rows}
async function access(id,expected,write=false){await as(id);const r=await query('select public.koryx_chat_access($1,$2) allowed',[order,write]);assert.equal(r[0].allowed,expected);checks++}
async function fails(sql,args=[]){await assert.rejects(()=>db.query(sql,args));checks++}
await db.exec('set role anon');await fails('select public.koryx_chat_inbox()');await db.exec('reset role');
await as(customer);await fails('select public.koryx_assign_project_developer($1,$2)',[order,dev1])
await as(founder);await query('select public.koryx_assign_project_developer($1,$2)',[order,dev1]);await fails('select public.koryx_assign_project_developer($1,$2)',[order,stranger])
await access(customer,false);await access(founder,true);await access(dev1,true);await access(dev1,false,true);await access(dev2,false);await access(stranger,false)
// Care / hosting payments never unlock a build conversation.
await db.exec(`reset role;insert into payment_transactions(order_id,amount_cents,care_id) values('${order}',1000,'${order2}')`)
await access(customer,false)
await db.exec(`reset role;insert into payment_transactions(order_id,amount_cents) values('${order}',50000)`)
await access(customer,true,true);await access(dev1,true,true);await access(founder,true,true)
const mid='00000000-0000-4000-8000-000000000020',mid2='00000000-0000-4000-8000-000000000021',aid='00000000-0000-4000-8000-000000000030'
await as(dev1);let result=await query('select public.koryx_chat_send($1,$2,$3) message',[order,mid,'Hello Jane']);assert.equal(result[0].message.sender_name,'Alex');assert.ok(!JSON.stringify(result).includes('PrivateSurname'));checks++
await query('select public.koryx_chat_send($1,$2,$3)',[order,mid,'duplicate retry'])
assert.equal((await query('select count(*) from project_chat_messages'))[0].count,1);checks++
await as(customer);await fails('select public.koryx_chat_send($1,$2,$3,$4,$5)',[order,'00000000-0000-4000-8000-000000000099','',null,null]);
await as(customer);await fails('select public.koryx_chat_change($1,$2,$3,$4)',[order,mid,'edit','changed by other']);await fails('select public.koryx_chat_change($1,$2,$3)',[order,mid,'pin']);await fails('select public.koryx_chat_change($1,$2,$3)',[order,mid,'delete']);
await query('select public.koryx_chat_send($1,$2,$3,$4)',[order,mid2,'My first reply',mid]);await query('select public.koryx_chat_change($1,$2,$3,$4)',[order,mid2,'edit','Updated reply'])
await as(dev1);await query('select public.koryx_chat_change($1,$2,$3)',[order,mid,'pin']);let page=(await query('select public.koryx_chat_page($1) page',[order]))[0].page;assert.equal(page.pins.length,1);assert.equal(page.messages.length,2);checks++
await as(stranger);assert.equal((await query('select count(*) from project_chat_messages'))[0].count,0);await fails('select public.koryx_chat_page($1)',[order]);checks++
await db.exec(`reset role;insert into project_chat_attachments(id,order_id,uploader_id,path,name,mime,size) values('${aid}','${order}','${customer}','private/path','photo.webp','image/webp',200)`)
await as(dev1);await fails('select public.koryx_chat_send($1,$2,$3,$4,$5)',[order,'00000000-0000-4000-8000-000000000022','Stolen photo',null,[aid]])
await as(customer);await query('select public.koryx_chat_send($1,$2,$3,$4,$5)',[order,'00000000-0000-4000-8000-000000000023','A photo',null,[aid]])
await as(founder);await query('select public.koryx_chat_preference($1,$2,$3)',[order,true,true]);let inbox=(await query('select public.koryx_chat_inbox() inbox'))[0].inbox;assert.equal(inbox[0].pinned,true);assert.equal(inbox[0].developer_name,'Alex');checks++
await query('select public.koryx_assign_project_developer($1,$2)',[order,dev2]);await access(dev1,false);await access(dev2,true,true);await access(founder,true,true);await access(customer,true,true)
await as(dev2);await query('select public.koryx_chat_change($1,$2,$3)',[order,mid2,'delete']);page=(await query('select public.koryx_chat_page($1) page',[order]))[0].page;assert.equal(page.messages.find(m=>m.id===mid2).body,'');checks++
await as(customer);await fails('insert into public.project_chat_messages(order_id,sender_id,sender_name,sender_role,body) values($1,$2,$3,$4,$5)',[order,customer,'Fake','developer','bad'])
await db.exec('reset role;grant update(role) on profiles to authenticated;grant select on profiles to authenticated');await as(customer);await fails("update profiles set role='admin' where id=$1",[customer])
await db.exec(`reset role;update orders set status='in_review' where id='${order}';update orders set status='in_review' where id='${order}'`)
await as(customer);page=(await query('select public.koryx_chat_page($1) page',[order]))[0].page;assert.equal(page.events.length,1);assert.equal(page.events[0].status,'in_review');checks++
assert.equal((await query('select count(*) from project_chat_events'))[0].count,1);checks++
await as(founder);page=(await query('select public.koryx_chat_page($1) page',[order]))[0].page;assert.equal(page.events.length,0);assert.equal((await query('select count(*) from project_chat_events'))[0].count,0);checks++
await as(dev2);page=(await query('select public.koryx_chat_page($1) page',[order]))[0].page;assert.equal(page.events.length,0);assert.equal((await query('select count(*) from project_chat_events'))[0].count,0);checks++
await as(stranger);assert.equal((await query('select count(*) from project_chat_events'))[0].count,0);checks++
await fails('select * from project_push_subscriptions');await fails('select * from project_push_outbox');await fails('select public.koryx_claim_chat_push()')
await as(founder);await query('select public.koryx_chat_send($1,$2,$3)',[order,'00000000-0000-4000-8000-000000000090','Hello from Artem']);page=(await query('select public.koryx_chat_page($1) page',[order]))[0].page;assert.equal(page.messages.at(-1).sender_name,'Artem');checks++
await db.exec('reset role;set role service_role');let jobs=await query('select * from public.koryx_claim_chat_push()');assert.ok(jobs.length>=1);assert.ok(jobs.every(j=>j.user_id===customer));assert.equal((await query('select * from public.koryx_claim_chat_push()')).length,0);checks++
await db.exec('reset role');const count=await query('select count(*) from project_push_outbox');await as(founder);await query('select public.koryx_chat_send($1,$2,$3)',[order,'00000000-0000-4000-8000-000000000090','Retry']);await db.exec('reset role');assert.equal((await query('select count(*) from project_push_outbox'))[0].count,count[0].count);checks++
await db.exec(`reset role;update payment_transactions set refunded_cents=amount_cents where order_id='${order}' and care_id is null`);await access(customer,false);await access(dev2,false,true);await access(founder,true)
await db.exec("reset role;insert into storage.objects(bucket_id) values('project-chat'),('other-bucket')");await as(stranger);assert.equal((await query('select count(*) from storage.objects'))[0].count,1);checks++;
// Upgrade an existing installation, then exercise founder-initiated direct chats without creating orders.
await db.exec('reset role')
const orderCount=(await query('select count(*) from orders'))[0].count
const paymentCount=(await query('select count(*) from payment_transactions'))[0].count
await db.exec(await fs.readFile(new URL('../supabase/20261014-direct-conversations.sql',import.meta.url),'utf8'))
assert.equal((await query('select project_order_id from project_chat_threads where order_id=$1',[order]))[0].project_order_id,order);checks++
await access(customer,false,true);await access(founder,true)
await as(customer);await fails('select koryx_chat_start_direct($1)',[stranger])
await as(dev1);await fails('select koryx_chat_start_direct($1)',[customer])
await db.exec('reset role;set role anon');await fails('select koryx_chat_start_direct($1)',[customer])
await as(founder);await fails('select koryx_chat_start_direct($1)',[founder]);await fails('select koryx_chat_start_direct($1)',['00000000-0000-4000-8000-000000000999'])
let direct=(await query('select koryx_chat_start_direct($1) page',[customer]))[0].page
const directId=direct.thread.order_id
assert.equal(direct.thread.kind,'direct');assert.equal(direct.thread.project_id,null);assert.equal(direct.thread.can_write,true);assert.equal(direct.thread.paid,false);assert.equal(direct.thread.title,'Jane');checks++
assert.equal((await query('select koryx_chat_start_direct($1) page',[customer]))[0].page.thread.order_id,directId);checks++
await fails('select koryx_assign_project_developer($1,$2)',[directId,dev1])
for(const id of [stranger,dev1,dev2]){await as(id);assert.equal((await query('select koryx_chat_access($1,true) allowed',[directId]))[0].allowed,false);await fails('select koryx_chat_page($1)',[directId]);checks++}
await as(customer);direct=(await query('select koryx_chat_page($1) page',[directId]))[0].page
assert.equal(direct.thread.title,'Artem');assert.equal(direct.thread.can_write,true);assert.equal(direct.events.length,0);assert.ok(!JSON.stringify(direct).includes('PrivateSurname'));checks++
await as(customer);await fails('select koryx_chat_send($1,$2,$3,$4)',[directId,'00000000-0000-4000-8000-000000000114','Wrong conversation reply',mid])
const directReply='00000000-0000-4000-8000-000000000110',directMessage='00000000-0000-4000-8000-000000000111'
await query('select koryx_chat_send($1,$2,$3)',[directId,directReply,'Can we discuss an idea before I order?'])
await as(founder);await query('select koryx_chat_send($1,$2,$3,$4)',[directId,directMessage,'Yes, let’s talk.',directReply]);await query('select koryx_chat_change($1,$2,$3)',[directId,directMessage,'pin']);checks++
await as(customer);await fails('select koryx_chat_change($1,$2,$3,$4)',[directId,directMessage,'edit','stolen']);await fails('select koryx_chat_change($1,$2,$3)',[directId,directMessage,'pin'])
await query('select koryx_chat_preference($1,$2,$3)',[directId,true,true]);direct=(await query('select koryx_chat_page($1) page',[directId]))[0].page;assert.equal(direct.messages.length,2);assert.equal(direct.pins.length,1);assert.equal(direct.thread.pinned,true);checks++
await fails('select koryx_chat_push_recipient($1)',[directId])
await db.exec('reset role;set role service_role');const recipient=(await query('select koryx_chat_push_recipient($1) recipient',[directId]))[0].recipient;assert.equal(recipient.user_id,customer);assert.equal(recipient.direct,true);assert.equal((await query('select koryx_chat_push_recipient($1) recipient',[order]))[0].recipient,null);checks++
await db.exec('reset role');assert.equal((await query('select user_id from project_push_outbox where message_id=$1',[directMessage]))[0].user_id,customer);assert.equal((await query('select count(*) from project_push_outbox where message_id=$1',[directReply]))[0].count,0);checks++
// A developer who is the recipient of a direct conversation is not a moderator of it.
await as(founder);const adminChat=(await query('select koryx_chat_start_direct($1) page',[dev1]))[0].page.thread.order_id
await as(dev1);assert.equal((await query('select koryx_chat_moderator($1) allowed',[adminChat]))[0].allowed,false);const adminMessage=(await query('select koryx_chat_send($1,$2,$3) message',[adminChat,'00000000-0000-4000-8000-000000000112','Internal discussion'] ))[0].message;assert.equal(adminMessage.sender_role,'client');checks++
await as(customer);assert.equal((await query('select koryx_chat_inbox() inbox'))[0].inbox.some(t=>t.order_id===adminChat),false);checks++
// New project assignments retain normal payment restrictions and the real-order FK.
await as(founder);await query('select koryx_assign_project_developer($1,$2)',[order2,dev2]);await as(stranger);assert.equal((await query('select koryx_chat_access($1,true) allowed',[order2]))[0].allowed,false);checks++
await db.exec('reset role');assert.equal((await query('select count(*) from orders'))[0].count,orderCount);assert.equal((await query('select count(*) from payment_transactions'))[0].count,paymentCount);checks++

console.log(`PASS: ${checks} authorization, payment, privacy, idempotency, attachment, moderation and assignment checks`)
await db.close()
