begin;
alter table public.orders add column if not exists purchase_mode text not null default 'buyout' check(purchase_mode in ('buyout','managed'));
grant select(purchase_mode) on public.orders to authenticated;
create or replace function public.koryx_lock_purchase_mode() returns trigger language plpgsql as $$
begin
 if new.purchase_mode is distinct from old.purchase_mode and (exists(select 1 from public.payment_requests where order_id=old.id) or exists(select 1 from public.project_payments where order_id=old.id) or exists(select 1 from public.care_services where order_id=old.id)) then raise exception 'Purchase model is locked after a payment offer';end if;
 return new;
end $$;
create trigger koryx_lock_purchase_mode before update on public.orders for each row execute function public.koryx_lock_purchase_mode();
create table public.project_materials(
 id uuid primary key,order_id uuid references public.orders(id),user_id uuid not null references public.profiles(id),
 name text not null check(length(name) between 1 and 200),path text not null unique,mime text not null,
 size integer not null check(size between 1 and 3145728),created_at timestamptz not null default now()
);
create index project_materials_order on public.project_materials(order_id);
create index project_materials_owner on public.project_materials(user_id,created_at);
create table public.project_connections(order_id uuid primary key references public.orders(id),enabled boolean not null default false,key_hash text,key_hint text,connected_at timestamptz,last_event_at timestamptz);
create table public.project_metric_buckets(order_id uuid references public.orders(id),hour timestamptz not null,page_views integer not null default 0,requests integer not null default 0,errors integer not null default 0,duration_ms bigint not null default 0,primary key(order_id,hour));
create index project_metric_buckets_retention on public.project_metric_buckets(hour);
create table public.project_metric_receipts(order_id uuid references public.orders(id),id uuid,created_at timestamptz not null default now(),primary key(order_id,id));
create index project_metric_receipts_date on public.project_metric_receipts(created_at);
create table public.project_metric_limits(order_id uuid references public.orders(id),minute timestamptz not null,events integer not null,primary key(order_id,minute));
create index project_metric_limits_retention on public.project_metric_limits(minute);
create table public.project_source_releases(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),title text not null check(length(title) between 1 and 120),published_at timestamptz,created_at timestamptz not null default now());
create index project_source_releases_order on public.project_source_releases(order_id,created_at desc);
create table public.project_source_files(id uuid primary key default gen_random_uuid(),release_id uuid not null references public.project_source_releases(id),path text not null check(length(path) between 1 and 300),storage_path text not null unique,size integer not null check(size between 1 and 3145728),sha256 text not null,mime text not null default 'text/plain',unique(release_id,path));
alter table public.project_materials enable row level security;
alter table public.project_connections enable row level security;
alter table public.project_metric_buckets enable row level security;
alter table public.project_metric_receipts enable row level security;
alter table public.project_metric_limits enable row level security;
alter table public.project_source_releases enable row level security;
alter table public.project_source_files enable row level security;
-- All reads and mutations pass through authenticated route handlers. No browser
-- policy grants access to keys, source releases or private object metadata.
revoke all on public.project_materials,public.project_connections,public.project_metric_buckets,public.project_metric_receipts,public.project_metric_limits,public.project_source_releases,public.project_source_files from public,anon,authenticated;
grant all on public.project_materials,public.project_connections,public.project_metric_buckets,public.project_metric_receipts,public.project_metric_limits,public.project_source_releases,public.project_source_files to service_role;
insert into storage.buckets(id,name,public,file_size_limit) values('project-private','project-private',false,3145728) on conflict(id) do nothing;
-- An existing public bucket must never be used for private handover files.
do $$ begin if exists(select 1 from storage.buckets where id='project-private' and public) then raise exception 'project-private must be private';end if;end $$;

create or replace function public.koryx_add_project_material(p_file jsonb) returns public.project_materials language plpgsql security invoker set search_path=public,pg_temp as $$
declare uid uuid:=(p_file->>'user_id')::uuid;oid uuid:=nullif(p_file->>'order_id','')::uuid;result public.project_materials;
begin
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if (select coalesce(sum(size),0) from public.project_materials where user_id=uid and created_at>now()-interval '1 day')+(p_file->>'size')::integer>104857600 then raise exception 'Daily upload limit reached';end if;
 if oid is not null then
  if not exists(select 1 from public.orders where id=oid and (user_id=uid or uid='2f0a1860-cb7a-4104-967d-86ccc9166cdc')) then raise exception 'Project not found';end if;
  perform 1 from public.orders where id=oid for update;
  if (select count(*) from public.project_materials where order_id=oid)>=10 or (select coalesce(sum(size),0) from public.project_materials where order_id=oid)+(p_file->>'size')::integer>20971520 then raise exception 'Material limit reached';end if;
 end if;
 insert into public.project_materials(id,order_id,user_id,name,path,mime,size) values((p_file->>'id')::uuid,oid,uid,p_file->>'name',p_file->>'path',p_file->>'mime',(p_file->>'size')::integer) returning * into result;
 return result;
end $$;
revoke all on function public.koryx_add_project_material(jsonb) from public,anon,authenticated;
grant execute on function public.koryx_add_project_material(jsonb) to service_role;
create or replace function public.koryx_create_project_request(p_id uuid,p_order jsonb,p_files uuid[]) returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare existing public.orders; owner_id uuid:=(p_order->>'user_id')::uuid;n integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into existing from public.orders where id=p_id;
 if found then
  if existing.user_id<>owner_id then raise exception 'Request already used';end if;
  return existing.id;
 end if;
 if cardinality(p_files)>10 then raise exception 'Too many files';end if;
 perform 1 from public.project_materials where id=any(p_files) for update;
 select count(*) into n from public.project_materials where id=any(p_files) and user_id=owner_id and order_id is null;
 if n<>cardinality(p_files) or (select coalesce(sum(size),0) from public.project_materials where id=any(p_files))>20971520 then raise exception 'Uploaded files are unavailable';end if;
 insert into public.orders(id,user_id,business_name,website_type,budget,deadline,pages,design_style,features,description,contact_email,phone,"references",parent_order_id,work_kind,work_origin,purchase_mode,delivery)
 values(p_id,owner_id,p_order->>'business_name',p_order->>'website_type',p_order->>'budget',nullif(p_order->>'deadline','')::date,p_order->>'pages',p_order->>'design_style',array(select jsonb_array_elements_text(coalesce(p_order->'features','[]'))),p_order->>'description',p_order->>'contact_email',p_order->>'phone',p_order->>'references',nullif(p_order->>'parent_order_id','')::uuid,coalesce(p_order->>'work_kind','project'),coalesce(p_order->>'work_origin','koryx'),coalesce(p_order->>'purchase_mode','buyout'),coalesce(p_order->'delivery','{}'));
 update public.project_materials set order_id=p_id where id=any(p_files);
 return p_id;
end $$;

create or replace function public.koryx_ingest_metric(p_hash text,p_id uuid,p_kind text,p_status integer,p_duration integer) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare oid uuid;n integer;
begin
 select order_id into oid from public.project_connections where key_hash=p_hash and enabled for update;
 if not found then return false;end if;
 if p_kind not in('page_view','request') or p_duration not between 0 and 120000 or p_status not between 100 and 599 then raise exception 'Invalid event';end if;
 if exists(select 1 from public.project_metric_receipts where order_id=oid and id=p_id) then return true;end if;
 insert into public.project_metric_limits values(oid,date_trunc('minute',now()),1) on conflict(order_id,minute) do update set events=project_metric_limits.events+1 returning events into n;
 if n>10000 then return false;end if;
 insert into public.project_metric_receipts(order_id,id) values(oid,p_id);
 insert into public.project_metric_buckets(order_id,hour,page_views,requests,errors,duration_ms) values(oid,date_trunc('hour',now()),case when p_kind='page_view' then 1 else 0 end,case when p_kind='request' then 1 else 0 end,case when p_kind='request' and p_status>=500 then 1 else 0 end,case when p_kind='request' then p_duration else 0 end)
 on conflict(order_id,hour) do update set page_views=project_metric_buckets.page_views+excluded.page_views,requests=project_metric_buckets.requests+excluded.requests,errors=project_metric_buckets.errors+excluded.errors,duration_ms=project_metric_buckets.duration_ms+excluded.duration_ms;
 update public.project_connections set last_event_at=now() where order_id=oid;
 return true;
end $$;
create unique index project_connection_key on public.project_connections(key_hash) where key_hash is not null;

create or replace function public.koryx_source_entitled(p_order_id uuid) returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select exists(select 1 from public.orders o where o.id=p_order_id and o.purchase_mode='buyout' and o.quote_price>0
 and not exists(select 1 from public.project_billing_state where order_id=o.id and cancelled_at is not null)
 and (
 (not exists(select 1 from public.payment_transactions where order_id=o.id and care_id is null) and exists(select 1 from public.project_payments p where p.order_id=o.id and coalesce((p.snapshot->>'settled')::boolean,true) and coalesce((p.snapshot->>'remaining_balance')::numeric,0)<=0 and round((p.snapshot->>'total')::numeric*100)>=round(o.quote_price*100)))
 or (select coalesce(sum(amount_cents-refunded_cents),0) from public.payment_transactions where order_id=o.id and care_id is null)>=greatest(round(o.quote_price*100),coalesce((select max(contract_cents) from public.payment_requests where order_id=o.id),0))
 ));
$$;
-- Atomic per-release limits and immutability; callers cannot race total size checks.
create or replace function public.koryx_add_source_file(p_release uuid,p_file jsonb) returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.project_source_releases; fid uuid;
begin
 select * into r from public.project_source_releases where id=p_release for update;
 if not found or r.published_at is not null then raise exception 'Release is not editable';end if;
 if (select count(*) from public.project_source_files where release_id=r.id)>=300 or (select coalesce(sum(size),0) from public.project_source_files where release_id=r.id)+(p_file->>'size')::integer>31457280 then raise exception 'Release limit exceeded';end if;
 insert into public.project_source_files(release_id,path,storage_path,size,sha256,mime) values(r.id,p_file->>'path',p_file->>'storage_path',(p_file->>'size')::integer,p_file->>'sha256',p_file->>'mime') returning id into fid;
 return fid;
end $$;
create or replace function public.koryx_remove_source_file(p_release uuid,p_file uuid) returns text language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.project_source_releases;object_path text;
begin
 select * into r from public.project_source_releases where id=p_release for update;
 if not found or r.published_at is not null then raise exception 'Release is not editable';end if;
 delete from public.project_source_files where id=p_file and release_id=r.id returning storage_path into object_path;
 if object_path is null then raise exception 'File not found';end if;
 return object_path;
end $$;
revoke all on function public.koryx_remove_source_file(uuid,uuid) from public,anon,authenticated;
grant execute on function public.koryx_remove_source_file(uuid,uuid) to service_role;
create or replace function public.koryx_publish_source(p_release uuid) returns void language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.project_source_releases;
begin
 select * into r from public.project_source_releases where id=p_release for update;
 if not found or not exists(select 1 from public.project_source_files where release_id=r.id) then raise exception 'Upload source files first';end if;
 if not public.koryx_source_entitled(r.order_id) then raise exception 'Source handover requires a fully paid buyout';end if;
 update public.project_source_releases set published_at=coalesce(published_at,now()) where id=r.id;
end $$;
create or replace function public.koryx_project_cleanup() returns void language sql security invoker set search_path=public,pg_temp as $$
 delete from public.project_metric_receipts where created_at<now()-interval '32 days';
 delete from public.project_metric_limits where minute<now()-interval '2 days';
 delete from public.project_metric_buckets where hour<now()-interval '90 days';
$$;
revoke all on function public.koryx_create_project_request(uuid,jsonb,uuid[]),public.koryx_ingest_metric(text,uuid,text,integer,integer),public.koryx_source_entitled(uuid),public.koryx_add_source_file(uuid,jsonb),public.koryx_publish_source(uuid),public.koryx_project_cleanup() from public,anon,authenticated;
grant execute on function public.koryx_create_project_request(uuid,jsonb,uuid[]),public.koryx_ingest_metric(text,uuid,text,integer,integer),public.koryx_source_entitled(uuid),public.koryx_add_source_file(uuid,jsonb),public.koryx_publish_source(uuid),public.koryx_project_cleanup() to service_role;
-- Reuse the existing verified Stripe subscription, consent and invoice pipeline.
alter table public.care_services add column if not exists service_terms text not null default '';
alter table public.care_services drop constraint care_services_kind_check;
alter table public.care_services add constraint care_services_kind_check check(kind in('domain','hosting','managed'));
create unique index care_managed_unique on public.care_services(order_id) where kind='managed';
notify pgrst,'reload schema';
commit;
