begin;
alter table public.billing_settings add column if not exists usdt_address text not null default '';
alter table public.billing_settings add column if not exists btc_address text not null default '';
-- Notes are founder-only. Preserve old notes before removing them from client-visible JSON.
update public.orders set admin_notes=concat_ws(E'\n\n',nullif(admin_notes,''),nullif(delivery->>'notes','')),delivery=delivery-'notes' where coalesce(delivery->>'notes','')<>'';
create table if not exists public.order_domains(
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),
 hostname text not null,status text not null default 'pending' check(status in('pending','connected','expired')),
 renewal_date date,cost_price numeric(12,2) not null default 0 check(cost_price>=0),retail_price numeric(12,2) not null default 0 check(retail_price>=0),
 notes text not null default '',created_at timestamptz not null default now(),unique(order_id,hostname)
);
alter table public.order_domains enable row level security;
revoke all on public.order_domains from anon,authenticated;
grant select(id,order_id,user_id,hostname,status,renewal_date,retail_price,created_at) on public.order_domains to authenticated;
grant all on public.order_domains to service_role;
create policy domains_owner_read on public.order_domains for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create table if not exists public.domain_renewals(
 id uuid primary key default gen_random_uuid(),domain_id uuid not null references public.order_domains(id),order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),
 due_date date not null,amount numeric(12,2) not null check(amount>=0),status text not null default 'due' check(status in('due','submitted','paid','cancelled')),
 payment_method text,payment_reference text,snapshot jsonb,created_at timestamptz not null default now(),paid_at timestamptz,
 unique(domain_id,due_date)
);
alter table public.domain_renewals enable row level security;
revoke all on public.domain_renewals from anon,authenticated;
grant select on public.domain_renewals to authenticated;
grant all on public.domain_renewals to service_role;
create policy renewals_owner_read on public.domain_renewals for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create table if not exists public.project_invoices(
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),snapshot jsonb not null,fingerprint text,created_at timestamptz not null default now()
);
alter table public.project_invoices enable row level security;
revoke all on public.project_invoices from anon,authenticated;
grant select on public.project_invoices to authenticated;
grant all on public.project_invoices to service_role;
create unique index if not exists project_invoice_fingerprint on public.project_invoices(order_id,fingerprint);
create policy invoices_owner_read on public.project_invoices for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create table if not exists public.billing_mail(
 id uuid primary key default gen_random_uuid(),dedupe_key text not null unique,user_id uuid not null references public.profiles(id),
 to_address text not null,from_address text not null,subject text not null,html text not null,snapshot jsonb,documents text not null default 'both' check(documents in('invoice','receipt','both','none')),
 status text not null default 'pending' check(status in('pending','sending','sent','failed','uncertain')),email_id text,error text,attempted_at timestamptz,created_at timestamptz not null default now()
);
alter table public.billing_mail enable row level security;
revoke all on public.billing_mail from public,anon,authenticated;
grant all on public.billing_mail to service_role;
create or replace function public.koryx_record_payment(p_order_id uuid,p_snapshot jsonb)
returns public.project_payments language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;p public.project_payments;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 select * into p from public.project_payments where order_id=p_order_id;if found then return p;end if;
 if o.quote_price is null or o.quote_price<0 then raise exception 'A positive agreed quote is required';end if;
 if (p_snapshot->>'total') is null or (p_snapshot->>'subtotal') is null or (p_snapshot->>'total')::numeric<>o.quote_price or (p_snapshot->>'subtotal')::numeric-coalesce((p_snapshot->>'discount_amount')::numeric,0)<>(p_snapshot->>'total')::numeric then raise exception 'Quote changed';end if;
 insert into public.project_payments(order_id,user_id,snapshot) values(o.id,o.user_id,p_snapshot) returning * into p;
 update public.orders set paid=true,status=case when status in('pending','in_review','invoice_sent') then 'paid' else status end where id=o.id;return p;
end $$;
revoke all on function public.koryx_record_payment(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.koryx_record_payment(uuid,jsonb) to service_role;
create or replace function public.koryx_settle_renewal(p_id uuid,p_snapshot jsonb,p_next_date date)
returns public.domain_renewals language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.domain_renewals;
begin
 select * into r from public.domain_renewals where id=p_id for update;if not found then raise exception 'Renewal not found';end if;
 if r.status='paid' then return r;end if;
 if r.status='cancelled' then raise exception 'Renewal was replaced';end if;
 if (p_snapshot->>'total') is null or (p_snapshot->>'total')::numeric<>r.amount then raise exception 'Renewal amount changed';end if;
 update public.domain_renewals set status='paid',snapshot=p_snapshot,paid_at=(p_snapshot->>'paid_at')::timestamptz,payment_method=p_snapshot->>'method',payment_reference=p_snapshot->>'reference' where id=r.id returning * into r;
 if p_next_date is not null then
  if p_next_date<=r.due_date then raise exception 'Next date must follow paid renewal';end if;
  update public.order_domains set renewal_date=p_next_date,status='connected' where id=r.domain_id;
  update public.domain_renewals set status='cancelled' where domain_id=r.domain_id and id<>r.id and due_date<>p_next_date and status='due';
  insert into public.domain_renewals(domain_id,order_id,user_id,due_date,amount) select id,order_id,user_id,p_next_date,retail_price from public.order_domains where id=r.domain_id on conflict(domain_id,due_date) do nothing;
 end if;return r;
end $$;
revoke all on function public.koryx_settle_renewal(uuid,jsonb,date) from public,anon,authenticated;
grant execute on function public.koryx_settle_renewal(uuid,jsonb,date) to service_role;
create or replace function public.koryx_save_domain(p_order_id uuid,p_domain jsonb)
returns public.order_domains language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;d public.order_domains;old public.order_domains;items jsonb;item jsonb;label text;subtotal numeric;discount numeric;total numeric;v_delivery jsonb;has_item boolean:=false;new_date date;retail numeric;cost numeric;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 cost=(p_domain->>'cost_price')::numeric;retail=ceil(cost*150)/100;new_date=nullif(p_domain->>'renewal_date','')::date;
 if cost is null or cost<0 or cost>1000000 then raise exception 'Invalid price';end if;
 if p_domain->>'id' is not null then
  select * into old from public.order_domains where id=(p_domain->>'id')::uuid for update;
  if not found or old.order_id<>o.id or old.hostname<>p_domain->>'hostname' then raise exception 'Domain mismatch';end if;
  if exists(select 1 from public.domain_renewals where domain_id=old.id and status='submitted' and (due_date is distinct from new_date or amount<>retail)) then raise exception 'Confirm the submitted renewal first';end if;
  update public.order_domains set status=p_domain->>'status',renewal_date=new_date,cost_price=cost,retail_price=retail,notes=coalesce(p_domain->>'notes','') where id=old.id returning * into d;
 else
  insert into public.order_domains(order_id,user_id,hostname,status,renewal_date,cost_price,retail_price,notes) values(o.id,o.user_id,p_domain->>'hostname',p_domain->>'status',new_date,cost,retail,coalesce(p_domain->>'notes','')) returning * into d;
 end if;
 update public.domain_renewals set status='cancelled' where domain_id=d.id and due_date is distinct from new_date and status='due';
 if new_date is not null then
  insert into public.domain_renewals(domain_id,order_id,user_id,due_date,amount) values(d.id,o.id,o.user_id,new_date,retail) on conflict(domain_id,due_date) do update set status=case when domain_renewals.status='cancelled' then 'due' else domain_renewals.status end,amount=case when domain_renewals.status in('due','cancelled') then excluded.amount else domain_renewals.amount end,snapshot=case when domain_renewals.status in('due','cancelled') and domain_renewals.amount<>excluded.amount then null else domain_renewals.snapshot end;
 end if;
 if not o.paid then
  v_delivery=coalesce(o.delivery,'{}'::jsonb);items=coalesce(v_delivery->'billing_items','[]'::jsonb);
  if jsonb_array_length(items)=0 and o.quote_price is not null then items=jsonb_build_array(jsonb_build_object('description','Website development','quantity',1,'unit_price',o.quote_price));end if;
  label='Domain — '||d.hostname||' · 1 year';
  for item in select value from jsonb_array_elements(items) loop if item->>'description'=label then has_item=true;end if;end loop;
  if has_item then select jsonb_agg(case when value->>'description'=label then jsonb_build_object('description',label,'quantity',1,'unit_price',retail) else value end) into items from jsonb_array_elements(items);
  else if jsonb_array_length(items)>=15 then raise exception 'Maximum 15 services';end if;items=items||jsonb_build_array(jsonb_build_object('description',label,'quantity',1,'unit_price',retail));end if;
  select coalesce(sum((value->>'quantity')::numeric*(value->>'unit_price')::numeric),0) into subtotal from jsonb_array_elements(items);
  discount=case when v_delivery->'discount'->>'type'='percent' then round(subtotal*coalesce((v_delivery->'discount'->>'value')::numeric,0)/100,2) else coalesce((v_delivery->'discount'->>'value')::numeric,0) end;total=subtotal-least(subtotal,greatest(discount,0));
  if subtotal>1000000 then raise exception 'Maximum total exceeded';end if;
  update public.orders set delivery=jsonb_set(v_delivery-'notes','{billing_items}',items),quote_price=total where id=o.id;
 end if;return d;
end $$;
revoke all on function public.koryx_save_domain(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.koryx_save_domain(uuid,jsonb) to service_role;
notify pgrst,'reload schema';commit;
-- Shared abuse limits for public registration emails. Keys are one-way hashes.
begin;
create table if not exists public.auth_email_limits(key text primary key,window_start timestamptz not null default now(),count integer not null default 0);
alter table public.auth_email_limits enable row level security;
revoke all on public.auth_email_limits from public,anon,authenticated;
grant all on public.auth_email_limits to service_role;
create or replace function public.koryx_auth_email_limit(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 insert into public.auth_email_limits(key,count) values(p_key,1) on conflict(key) do update set count=case when auth_email_limits.window_start<now()-make_interval(secs=>p_seconds) then 1 else auth_email_limits.count+1 end,window_start=case when auth_email_limits.window_start<now()-make_interval(secs=>p_seconds) then now() else auth_email_limits.window_start end returning count into n;
 return n<=p_limit;
end $$;
revoke all on function public.koryx_auth_email_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.koryx_auth_email_limit(text,integer,integer) to service_role;
notify pgrst,'reload schema';commit;
