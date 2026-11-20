begin;
alter table public.project_source_releases add column origin text not null default 'manual' check(origin in('manual','automatic'));
alter table public.project_source_releases add column deployment_id text;
alter table public.project_source_releases add column commit_sha text;
alter table public.project_source_releases add column policy_version uuid;
create unique index source_deployment_version on public.project_source_releases(order_id,deployment_id,policy_version) where origin='automatic';
alter table public.project_source_files drop constraint project_source_files_size_check;
alter table public.project_source_files add constraint project_source_files_size_check check(size between 0 and 3145728);
create table public.project_source_links(
 order_id uuid primary key references public.orders(id),repo_full_name text not null,repo_id bigint not null,vercel_project_id text not null,team_id text not null,production_domain text not null,
 approved_paths text[] not null check(cardinality(approved_paths) between 1 and 30),enabled boolean not null default true,policy_version uuid not null default gen_random_uuid(),
 current_release_id uuid references public.project_source_releases(id),last_checked_at timestamptz,last_synced_at timestamptz,created_at timestamptz not null default now(),unique(team_id,vercel_project_id)
);
create index source_links_reconcile on public.project_source_links(last_checked_at nulls first) where enabled;
create table public.project_source_jobs(
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),policy_version uuid not null,status text not null default 'pending' check(status in('pending','running','completed','failed','blocked','superseded')),
 deployment_id text,attempts integer not null default 0,next_attempt_at timestamptz not null default now(),lease_until timestamptz,lease_token uuid,error text,release_id uuid references public.project_source_releases(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create unique index source_one_pending on public.project_source_jobs(order_id) where status='pending';
create index source_jobs_due on public.project_source_jobs(next_attempt_at,created_at) where status in('pending','failed','running');
alter table public.project_source_links enable row level security;
alter table public.project_source_jobs enable row level security;
revoke all on public.project_source_links,public.project_source_jobs from public,anon,authenticated;
grant all on public.project_source_links,public.project_source_jobs to service_role;
create function public.koryx_queue_source_sync(p_order uuid) returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare l public.project_source_links;jid uuid;
begin
 select * into l from public.project_source_links where order_id=p_order and enabled for update;if not found then return null;end if;
 insert into public.project_source_jobs(order_id,policy_version) values(l.order_id,l.policy_version) on conflict(order_id) where status='pending' do update set next_attempt_at=now(),policy_version=excluded.policy_version returning id into jid;
 return jid;
end $$;
create function public.koryx_claim_source_job(p_id uuid default null) returns setof public.project_source_jobs language plpgsql security invoker set search_path=public,pg_temp as $$
declare j public.project_source_jobs;
begin
 select * into j from public.project_source_jobs where (p_id is null or id=p_id) and attempts<5 and ((status in('pending','failed') and next_attempt_at<=now()) or (status='running' and lease_until<now())) order by created_at for update skip locked limit 1;
 if not found then return;end if;
 perform pg_advisory_xact_lock(hashtextextended(j.order_id::text,1));
 -- Serialize imports for the same project, including abandoned leases.
 if exists(select 1 from public.project_source_jobs where order_id=j.order_id and status='running' and lease_until>=now()) then return;end if;
 return query update public.project_source_jobs set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '6 minutes',updated_at=now(),error=null where id=j.id returning *;
end $$;
-- Completing an import makes a private snapshot ready for the Founder.
-- Client download routes separately enforce full buyout entitlement.
create function public.koryx_finish_source_sync(p_job uuid,p_lease uuid,p_release uuid) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare j public.project_source_jobs;l public.project_source_links;r public.project_source_releases;
begin
 select * into j from public.project_source_jobs where id=p_job and status='running' and lease_token=p_lease and lease_until>now() for update;if not found then return false;end if;
 select * into l from public.project_source_links where order_id=j.order_id and enabled and policy_version=j.policy_version for update;if not found then return false;end if;
 select * into r from public.project_source_releases where id=p_release and order_id=j.order_id and origin='automatic' and policy_version=l.policy_version and deployment_id=j.deployment_id for update;
 if not found or not exists(select 1 from public.project_source_files where release_id=r.id) then return false;end if;
 update public.project_source_releases set published_at=coalesce(published_at,now()) where id=r.id;
 update public.project_source_links set current_release_id=r.id,last_synced_at=now(),last_checked_at=now() where order_id=l.order_id;
 update public.project_source_jobs set status='completed',release_id=r.id,lease_until=null,updated_at=now() where id=j.id;
 return true;
end $$;
revoke all on function public.koryx_queue_source_sync(uuid),public.koryx_claim_source_job(uuid),public.koryx_finish_source_sync(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.koryx_queue_source_sync(uuid),public.koryx_claim_source_job(uuid),public.koryx_finish_source_sync(uuid,uuid,uuid) to service_role;
create table public.project_source_webhook_events(id text primary key,created_at timestamptz not null default now());
create index source_webhook_retention on public.project_source_webhook_events(created_at);
alter table public.project_source_webhook_events enable row level security;
revoke all on public.project_source_webhook_events from public,anon,authenticated;
grant all on public.project_source_webhook_events to service_role;
create table public.project_country_buckets(order_id uuid references public.orders(id),hour timestamptz not null,country text not null check(country~'^[A-Z]{2}$'),page_views integer not null default 0,primary key(order_id,hour,country));
create index project_country_retention on public.project_country_buckets(hour);
alter table public.project_country_buckets enable row level security;
revoke all on public.project_country_buckets from public,anon,authenticated;
grant all on public.project_country_buckets to service_role;
drop function public.koryx_ingest_metric(text,uuid,text,integer,integer);
create or replace function public.koryx_ingest_metric(p_hash text,p_id uuid,p_kind text,p_status integer,p_duration integer,p_country text default 'ZZ') returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare oid uuid;n integer;
begin
 select order_id into oid from public.project_connections where key_hash=p_hash and enabled for update;
 if not found then return false;end if;
 if p_country !~ '^[A-Z]{2}$' then raise exception 'Invalid country';end if;
 if p_kind not in('page_view','request') or p_duration not between 0 and 120000 or p_status not between 100 and 599 then raise exception 'Invalid event';end if;
 if exists(select 1 from public.project_metric_receipts where order_id=oid and id=p_id) then return true;end if;
 insert into public.project_metric_limits values(oid,date_trunc('minute',now()),1) on conflict(order_id,minute) do update set events=project_metric_limits.events+1 returning events into n;
 if n>10000 then return false;end if;
 insert into public.project_metric_receipts(order_id,id) values(oid,p_id);
 insert into public.project_metric_buckets(order_id,hour,page_views,requests,errors,duration_ms) values(oid,date_trunc('hour',now()),case when p_kind='page_view' then 1 else 0 end,case when p_kind='request' then 1 else 0 end,case when p_kind='request' and p_status>=500 then 1 else 0 end,case when p_kind='request' then p_duration else 0 end)
 on conflict(order_id,hour) do update set page_views=project_metric_buckets.page_views+excluded.page_views,requests=project_metric_buckets.requests+excluded.requests,errors=project_metric_buckets.errors+excluded.errors,duration_ms=project_metric_buckets.duration_ms+excluded.duration_ms;
 if p_kind='page_view' then insert into public.project_country_buckets values(oid,date_trunc('hour',now()),p_country,1) on conflict(order_id,hour,country) do update set page_views=project_country_buckets.page_views+1;end if;
 update public.project_connections set last_event_at=now() where order_id=oid;
 return true;
end $$;
revoke all on function public.koryx_ingest_metric(text,uuid,text,integer,integer,text) from public,anon,authenticated;
grant execute on function public.koryx_ingest_metric(text,uuid,text,integer,integer,text) to service_role;
create or replace function public.koryx_project_cleanup() returns void language sql security invoker set search_path=public,pg_temp as $$
 delete from public.project_metric_receipts where created_at<now()-interval '32 days';
 delete from public.project_metric_limits where minute<now()-interval '2 days';
 delete from public.project_metric_buckets where hour<now()-interval '90 days';
 delete from public.project_country_buckets where hour<now()-interval '90 days';
 delete from public.project_source_webhook_events where created_at<now()-interval '32 days';
$$;
create function public.koryx_country_statistics(p_order uuid,p_since timestamptz) returns table(country text,page_views bigint) language sql stable security invoker set search_path=public,pg_temp as $$
 select country,sum(page_views)::bigint from public.project_country_buckets where order_id=p_order and hour>=p_since group by country;
$$;
revoke all on function public.koryx_country_statistics(uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.koryx_country_statistics(uuid,timestamptz) to service_role;
create index if not exists payment_transaction_receipt_lookup on public.payment_transactions(order_id,(snapshot->>'receipt_number'));
create function public.koryx_business_statistics(p_days integer default 30) returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 with ledger as (
  select order_id,amount_cents::numeric gross,refunded_cents::numeric refunds,coalesce(nullif(snapshot->>'paid_at','')::timestamptz,created_at) paid_at from public.payment_transactions
  union all
  select p.order_id,round((p.snapshot->>'total')::numeric*100),0,coalesce(nullif(p.snapshot->>'paid_at','')::timestamptz,p.created_at) from public.project_payments p
   where not exists(select 1 from public.payment_transactions t where t.order_id=p.order_id and t.care_id is null)
  union all
  select r.order_id,round((r.snapshot->>'total')::numeric*100),0,coalesce(r.paid_at,r.created_at) from public.domain_renewals r
   where r.status='paid' and r.snapshot->>'total' is not null and not exists(select 1 from public.payment_transactions t where t.order_id=r.order_id and (t.snapshot->>'receipt_number'=r.snapshot->>'receipt_number' or t.stripe_payment_id=r.payment_reference))
 ), project_collections as (
  select order_id,sum(amount_cents-refunded_cents)::numeric paid from public.payment_transactions where care_id is null group by order_id
  union all
  select p.order_id,round((p.snapshot->>'total')::numeric*100) from public.project_payments p where not exists(select 1 from public.payment_transactions t where t.order_id=p.order_id and t.care_id is null)
 ), days as (
  select generate_series((now() at time zone 'UTC')::date-(greatest(7,least(p_days,90))-1),(now() at time zone 'UTC')::date,'1 day')::date as day
 ), daily as (
  select d.day,coalesce(sum(l.gross-l.refunds),0)::bigint net_cents,coalesce(sum(l.gross),0)::bigint gross_cents from days d left join ledger l on (l.paid_at at time zone 'UTC')::date=d.day group by d.day order by d.day
 )
 select jsonb_build_object(
 'gross_cents',(select coalesce(sum(gross),0) from ledger),'refunds_cents',(select coalesce(sum(refunds),0) from ledger),'net_cents',(select coalesce(sum(gross-refunds),0) from ledger),
 'outstanding_cents',(select coalesce(sum(greatest(0,round(o.quote_price*100)-coalesce((select sum(paid) from project_collections where order_id=o.id),0))),0) from public.orders o where o.purchase_mode='buyout' and o.quote_price is not null and not exists(select 1 from public.project_billing_state b where b.order_id=o.id and b.cancelled_at is not null)),
 'recurring_cents',(select round(coalesce(sum(case when interval='year' then amount_cents::numeric/12 else amount_cents end),0)) from public.care_services where status='active' and not cancel_at_period_end),
 'subscriptions',(select count(*) from public.care_services where status='active' and not cancel_at_period_end),'past_due',(select count(*) from public.care_services where status='past_due'),
 'projects',(select count(*) from public.orders),'needs_review',(select count(*) from public.orders where status in('pending','in_review')),'in_progress',(select count(*) from public.orders where status='in_progress'),'completed',(select count(*) from public.orders where status='completed'),
 'customers',(select count(*) from public.profiles where role::text='user'),'daily',(select coalesce(jsonb_agg(to_jsonb(daily)),'[]') from daily),
 'source_attention',(select count(*) from public.project_source_jobs j where status in('failed','blocked') and not exists(select 1 from public.project_source_jobs newer where newer.order_id=j.order_id and newer.created_at>j.created_at)),
 'updated_at',now());
$$;
revoke all on function public.koryx_business_statistics(integer) from public,anon,authenticated;
grant execute on function public.koryx_business_statistics(integer) to service_role;
drop index public.care_managed_unique;
create unique index care_managed_unique on public.care_services(order_id) where kind='managed' and status<>'cancelled';
create function public.koryx_restart_managed(p_id uuid,p_user uuid) returns public.care_services language plpgsql security invoker set search_path=public,pg_temp as $$
declare old public.care_services;fresh public.care_services;
begin
 select * into old from public.care_services where id=p_id and user_id=p_user and kind='managed' and status='cancelled' for update;
 if not found then raise exception 'Cancelled monthly service not found';end if;
 perform 1 from public.orders where id=old.order_id for update;
 select * into fresh from public.care_services where order_id=old.order_id and kind='managed' and status<>'cancelled';
 if found then
  if fresh.amount_cents<>old.amount_cents or fresh.service_terms<>old.service_terms then raise exception 'Review the new service offer first';end if;
  return fresh;
 end if;
 insert into public.care_services(order_id,user_id,domain_id,name,kind,amount_cents,interval,next_date,service_terms,consented_at)
 values(old.order_id,old.user_id,null,old.name,'managed',old.amount_cents,'month',(now() at time zone 'UTC')::date,old.service_terms,now()) returning * into fresh;
 return fresh;
end $$;
revoke all on function public.koryx_restart_managed(uuid,uuid) from public,anon,authenticated;
grant execute on function public.koryx_restart_managed(uuid,uuid) to service_role;
create or replace function public.koryx_settle_care(p_care_id uuid,p_snapshot jsonb,p_stripe_id text,p_due_date date,p_next_date date)
returns public.payment_transactions language plpgsql security invoker set search_path=public,pg_temp as $$
declare c public.care_services;t public.payment_transactions;
begin
 select * into c from public.care_services where id=p_care_id for update;if not found then raise exception 'Care service not found';end if;
 select * into t from public.payment_transactions where stripe_payment_id=p_stripe_id;if found then return t;end if;
 if p_stripe_id is null or c.subscription_id is null or p_snapshot->>'total' is null or round((p_snapshot->>'total')::numeric*100)<>c.amount_cents then raise exception 'Invalid renewal payment';end if;
 insert into public.payment_transactions(care_id,order_id,user_id,amount_cents,source,stripe_payment_id,snapshot) values(c.id,c.order_id,c.user_id,c.amount_cents,'stripe',p_stripe_id,p_snapshot) returning * into t;
 if c.domain_id is not null then
  update public.domain_renewals set status='paid',payment_method='stripe',payment_reference=p_stripe_id,snapshot=p_snapshot,paid_at=(p_snapshot->>'paid_at')::timestamptz where domain_id=c.domain_id and due_date=p_due_date and status in('due','submitted');
  update public.order_domains set renewal_date=greatest(renewal_date,p_next_date) where id=c.domain_id;
  insert into public.domain_renewals(domain_id,order_id,user_id,due_date,amount) values(c.domain_id,c.order_id,c.user_id,p_next_date,c.amount_cents::numeric/100) on conflict(domain_id,due_date) do nothing;
 elsif c.kind='hosting' then
  update public.orders set delivery=coalesce(delivery,'{}'::jsonb)||jsonb_build_object('hosting_renewal_date',p_next_date) where id=c.order_id;
 end if;
 return t;
end $$;
revoke all on function public.koryx_settle_care(uuid,jsonb,text,date,date) from public,anon,authenticated;
grant execute on function public.koryx_settle_care(uuid,jsonb,text,date,date) to service_role;
notify pgrst,'reload schema';
commit;
