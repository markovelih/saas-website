import {PGlite} from '@electric-sql/pglite'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'

const db=new PGlite()
try {
  await db.exec(`create role anon;create role authenticated;create role service_role;
    create schema auth;create function auth.role() returns text language sql as $$select 'service_role'::text$$;
    create table orders(id uuid primary key,user_id uuid,business_name text,paid boolean,quote_price numeric,delivery jsonb,parent_order_id uuid,work_kind text,work_origin text,invoice_sent boolean,status text,admin_notes text);
    create table project_payments(order_id uuid);
    create table payment_requests(order_id uuid,status text);
    create table payment_transactions(order_id uuid,care_id uuid);
    create table project_chat_threads(order_id uuid,updated_at timestamptz);
    grant usage on schema public to authenticated,service_role;
    grant select,update on orders to authenticated;
    grant all on payment_transactions,project_chat_threads to service_role;`)
  const targets={koryx_preserve_settlement:'20261012-manager-billing.sql',koryx_lock_installment_quote:'20261012-stripe-installments.sql',koryx_validate_work_link:'20261012-project-additions.sql',koryx_chat_payment_changed:'20261014-project-chat.sql'}
  for(const [name,file] of Object.entries(targets)){
    const sql=await fs.readFile(new URL('../supabase/'+file,import.meta.url),'utf8')
    const fn=sql.match(new RegExp('create or replace function public\\.'+name+'\\(\\)[\\s\\S]*?end \\$\\$;','i'))?.[0]
    assert.ok(fn,name);await db.exec(fn)
  }
  await db.exec(`create trigger a before update on orders for each row execute function koryx_preserve_settlement();
    create trigger b before update on orders for each row execute function koryx_lock_installment_quote();
    create trigger c before update on orders for each row execute function koryx_validate_work_link();
    create trigger d after insert on payment_transactions for each row execute function koryx_chat_payment_changed();`)
  await db.exec(await fs.readFile(new URL('../supabase/migrations/20261123073444_restrict_internal_trigger_execution.sql',import.meta.url),'utf8'))
  for(const name of Object.keys(targets))for(const role of ['anon','authenticated']){
    assert.equal((await db.query('select has_function_privilege($1,$2,\'EXECUTE\') as allowed',[role,'public.'+name+'()'])).rows[0].allowed,false)
  }
  const id='00000000-0000-4000-8000-000000000001'
  await db.query("insert into orders values($1,$1,'Before',true,100,'{}',null,'project','koryx',false,'completed',null)",[id])
  await db.query('insert into project_payments values($1)',[id]);await db.query("insert into payment_requests values($1,'paid')",[id])
  await db.query("insert into project_chat_threads values($1,'2000-01-01')",[id])
  await db.exec('set role authenticated')
  await db.query("update orders set business_name='After' where id=$1",[id])
  await assert.rejects(()=>db.query('update orders set quote_price=1 where id=$1',[id]),/immutable|locked/)
  await db.exec('reset role;set role service_role')
  await db.query('insert into payment_transactions values($1,null)',[id])
  await db.exec('reset role')
  assert.equal((await db.query('select business_name from orders where id=$1',[id])).rows[0].business_name,'After')
  assert.ok(new Date((await db.query('select updated_at from project_chat_threads where order_id=$1',[id])).rows[0].updated_at).getUTCFullYear()>2000)
  console.log('PASS: internal trigger execution revoked from public clients; original settlement/quote/work-link triggers and payment-to-chat updates still execute. Isolated PostgreSQL only.')
} finally {await db.close()}
