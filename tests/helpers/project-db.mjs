import {PGlite} from '@electric-sql/pglite'
import fs from 'node:fs/promises'
export async function projectTestDb(){
const db=new PGlite()
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema storage;
create table profiles(id uuid primary key,role text default 'user');
create table orders(id uuid primary key,user_id uuid references profiles(id),business_name text,website_type text,budget text,deadline date,pages text,design_style text,features text[],description text,contact_email text,phone text,"references" text,parent_order_id uuid,work_kind text default 'project',work_origin text default 'koryx',delivery jsonb default '{}',quote_price numeric,paid boolean default false,status text default 'pending',created_at timestamptz default now());
create table project_payments(id uuid primary key default gen_random_uuid(),order_id uuid references orders(id),snapshot jsonb,created_at timestamptz default now());
create table payment_requests(id uuid primary key default gen_random_uuid(),order_id uuid references orders(id),contract_cents bigint);
create table payment_transactions(id uuid primary key default gen_random_uuid(),order_id uuid references orders(id),amount_cents bigint,refunded_cents bigint default 0,care_id uuid,user_id uuid,source text,stripe_payment_id text unique,snapshot jsonb default '{}',created_at timestamptz default now());
create table domain_renewals(id uuid primary key default gen_random_uuid(),order_id uuid references orders(id),status text,snapshot jsonb,payment_reference text,paid_at timestamptz,created_at timestamptz default now());
create table project_billing_state(order_id uuid primary key,cancelled_at timestamptz);
create table care_services(id uuid primary key default gen_random_uuid(),user_id uuid,domain_id uuid,name text,subscription_id text unique,customer_id text,consented_at timestamptz,next_date date,order_id uuid references orders(id),status text default 'inactive',amount_cents bigint default 0,interval text default 'month',cancel_at_period_end boolean default false,kind text constraint care_services_kind_check check(kind in('domain','hosting')));
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
grant all on all tables in schema public to service_role;grant usage on schema public to anon,authenticated,service_role;`)
await db.exec(await fs.readFile(new URL('../../supabase/migrations/20261120205620_managed_project_workspace.sql',import.meta.url),'utf8'))
await db.exec(await fs.readFile(new URL('../../supabase/migrations/20261120214254_source_sync_and_workspace_audit.sql',import.meta.url),'utf8'))
await db.exec(await fs.readFile(new URL('../../supabase/migrations/20261121010303_legacy_source_imports.sql',import.meta.url),'utf8'))
await db.exec(await fs.readFile(new URL('../../supabase/migrations/20261121035745_project_source_relays.sql',import.meta.url),'utf8'))
return db
}
