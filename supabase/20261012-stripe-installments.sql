begin;
create table if not exists public.project_billing_state(
 order_id uuid primary key references public.orders(id),user_id uuid not null references public.profiles(id),
 review_ready boolean not null default false,approved_at timestamptz,accepted_at timestamptz,terms_version text,cancelled_at timestamptz
);
create table if not exists public.payment_requests(
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),
 kind text not null check(kind in('deposit','balance','full')),amount_cents bigint not null check(amount_cents>0),contract_cents bigint not null check(contract_cents>0),
 status text not null default 'open' check(status in('open','paid','void')),snapshot jsonb not null,created_at timestamptz not null default now()
);
create unique index if not exists one_open_request on public.payment_requests(order_id) where status='open';
create table if not exists public.care_services(
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),domain_id uuid references public.order_domains(id),
 name text not null,kind text not null check(kind in('domain','hosting')),amount_cents bigint not null check(amount_cents>0),interval text not null check(interval in('month','year')),
 next_date date not null,subscription_id text unique,customer_id text,status text not null default 'inactive' check(status in('inactive','active','past_due','cancelled')),
 cancel_at_period_end boolean not null default false,consented_at timestamptz,created_at timestamptz not null default now()
);
create unique index if not exists care_domain_unique on public.care_services(domain_id) where domain_id is not null;
create unique index if not exists care_host_unique on public.care_services(order_id) where kind='hosting';
create table if not exists public.checkout_attempts(
 id uuid primary key default gen_random_uuid(),request_id uuid references public.payment_requests(id),care_id uuid references public.care_services(id),
 order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),session_id text unique,session_url text,expires_at timestamptz,
 status text not null default 'creating' check(status in('creating','open','completed','expired')),amount_cents bigint not null,snapshot jsonb,created_at timestamptz not null default now(),
 check((request_id is not null)::int+(care_id is not null)::int=1)
);
create unique index if not exists checkout_request_open on public.checkout_attempts(request_id) where status in('creating','open');
create unique index if not exists checkout_care_open on public.checkout_attempts(care_id) where status in('creating','open');
create table if not exists public.payment_transactions(
 id uuid primary key default gen_random_uuid(),request_id uuid references public.payment_requests(id),care_id uuid references public.care_services(id),
 order_id uuid not null references public.orders(id),user_id uuid not null references public.profiles(id),amount_cents bigint not null check(amount_cents>0),
 refunded_cents bigint not null default 0 check(refunded_cents>=0 and refunded_cents<=amount_cents),stripe_payment_id text unique,
 source text not null check(source in('stripe','manual')),snapshot jsonb not null,created_at timestamptz not null default now()
);
create unique index if not exists one_request_settlement on public.payment_transactions(request_id) where request_id is not null;
create table if not exists public.stripe_events(id text primary key,type text not null,processed_at timestamptz not null default now());
alter table public.project_billing_state enable row level security;
alter table public.payment_requests enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.care_services enable row level security;
alter table public.checkout_attempts enable row level security;
alter table public.stripe_events enable row level security;
revoke all on public.project_billing_state,public.payment_requests,public.payment_transactions,public.care_services,public.checkout_attempts,public.stripe_events from anon,authenticated;
grant all on public.project_billing_state,public.payment_requests,public.payment_transactions,public.care_services,public.checkout_attempts,public.stripe_events to service_role;
grant select on public.project_billing_state,public.payment_requests,public.payment_transactions,public.care_services to authenticated;
create policy billing_state_read on public.project_billing_state for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create policy requests_read on public.payment_requests for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create policy transactions_read on public.payment_transactions for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create policy care_read on public.care_services for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
create or replace function public.koryx_issue_installment(p_order_id uuid,p_kind text,p_snapshot jsonb)
returns public.payment_requests language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;r public.payment_requests;total bigint;collected bigint;due bigint;s public.project_billing_state;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 if p_kind not in('deposit','balance','full') then raise exception 'Invalid installment';end if;
 if o.paid or exists(select 1 from public.project_payments where order_id=o.id) then raise exception 'Project already paid';end if;
 total=round(o.quote_price*100);if total is null or total<=0 then raise exception 'Save a positive quote';end if;
 if p_snapshot->>'total' is null or round((p_snapshot->>'total')::numeric*100)<>total then raise exception 'Quote changed';end if;
 select * into s from public.project_billing_state where order_id=o.id;if s.cancelled_at is not null then raise exception 'Project cancelled';end if;
 select coalesce(sum(amount_cents-refunded_cents),0) into collected from public.payment_transactions where order_id=o.id and care_id is null;
 due=case when p_kind='deposit' then greatest(0,ceil(total::numeric/2)::bigint-collected) else greatest(0,total-collected) end;
 if p_kind='full' and collected>0 then raise exception 'Use the final balance invoice after client approval';end if;
 if due<=0 then raise exception 'This installment is already paid';end if;
 if (p_kind='balance' or (p_kind='full' and collected>0)) and (collected<ceil(total::numeric/2)::bigint or s.approved_at is null) then raise exception 'Client approval and deposit are required';end if;
 select * into r from public.payment_requests where order_id=o.id and status='open';
 if found then if r.kind=p_kind and r.amount_cents=due and r.contract_cents=total then return r;else raise exception 'Void the open invoice before issuing another installment';end if;end if;
 insert into public.project_billing_state(order_id,user_id) values(o.id,o.user_id) on conflict do nothing;
 insert into public.payment_requests(order_id,user_id,kind,amount_cents,contract_cents,snapshot)
 values(o.id,o.user_id,p_kind,due,total,p_snapshot||jsonb_build_object('total',due::numeric/100,'settled',false,'receipt_number','','installment',p_kind,'project_total',total::numeric/100,'previous_paid',collected::numeric/100,'remaining_balance',(total-collected-due)::numeric/100,'terms_version','2026-10-12')) returning * into r;
 update public.payment_requests set snapshot=snapshot||jsonb_build_object('request_id',r.id) where id=r.id returning * into r;return r;
end $$;
create or replace function public.koryx_settle_installment(p_request_id uuid,p_snapshot jsonb,p_source text,p_stripe_id text)
returns public.payment_transactions language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.payment_requests;o public.orders;t public.payment_transactions;collected bigint;
begin
 select * into r from public.payment_requests where id=p_request_id;if not found then raise exception 'Invoice not found';end if;
 select * into o from public.orders where id=r.order_id for update;
 select * into r from public.payment_requests where id=p_request_id for update;
 select * into t from public.payment_transactions where request_id=r.id;if found then return t;end if;
 if r.status='void' then raise exception 'Invoice voided';end if;
 if p_source not in('stripe','manual') or (p_source='stripe' and p_stripe_id is null) then raise exception 'Invalid payment source';end if;
 if p_snapshot->>'total' is null or p_snapshot->>'request_id' is null or round((p_snapshot->>'total')::numeric*100)<>r.amount_cents or p_snapshot->>'request_id'<>r.id::text then raise exception 'Amount mismatch';end if;
 insert into public.payment_transactions(request_id,order_id,user_id,amount_cents,source,stripe_payment_id,snapshot) values(r.id,r.order_id,r.user_id,r.amount_cents,p_source,p_stripe_id,p_snapshot) returning * into t;
 update public.payment_requests set status='paid' where id=r.id;
 select coalesce(sum(amount_cents-refunded_cents),0) into collected from public.payment_transactions where order_id=o.id and care_id is null;
 update public.orders set paid=collected>=r.contract_cents,status=case when status in('pending','in_review','invoice_sent') then 'in_progress' else status end where id=o.id;
 return t;
end $$;
create or replace function public.koryx_lock_installment_quote() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if (exists(select 1 from public.payment_requests where order_id=old.id and status in('open','paid')) or exists(select 1 from public.payment_transactions where order_id=old.id and care_id is null)) and
 (new.quote_price is distinct from old.quote_price or new.user_id is distinct from old.user_id or coalesce(new.delivery->'billing_items','[]') is distinct from coalesce(old.delivery->'billing_items','[]') or coalesce(new.delivery->'discount','{}') is distinct from coalesce(old.delivery->'discount','{}')) then raise exception 'Issued payment scope is locked';end if;
 return new;
end $$;
create trigger koryx_lock_installment_quote before update on public.orders for each row execute function public.koryx_lock_installment_quote();
revoke all on function public.koryx_issue_installment(uuid,text,jsonb),public.koryx_settle_installment(uuid,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.koryx_issue_installment(uuid,text,jsonb),public.koryx_settle_installment(uuid,jsonb,text,text) to service_role;
create or replace function public.koryx_settle_care(p_care_id uuid,p_snapshot jsonb,p_stripe_id text,p_due_date date,p_next_date date)
returns public.payment_transactions language plpgsql security definer set search_path=public,pg_temp as $$
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
 else
  update public.orders set delivery=coalesce(delivery,'{}'::jsonb)||jsonb_build_object('hosting_renewal_date',p_next_date) where id=c.order_id;
 end if;
 return t;
end $$;
create or replace function public.koryx_sync_refund(p_stripe_id text,p_refunded_cents bigint)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.payment_transactions;r public.payment_requests;collected bigint;
begin
 select * into t from public.payment_transactions where stripe_payment_id=p_stripe_id for update;if not found then return;end if;
 if p_refunded_cents<0 or p_refunded_cents>t.amount_cents then raise exception 'Invalid refund amount';end if;
 update public.payment_transactions set refunded_cents=greatest(refunded_cents,p_refunded_cents) where id=t.id;
 if t.request_id is not null then
  select * into r from public.payment_requests where id=t.request_id;
  perform 1 from public.orders where id=t.order_id for update;
  select coalesce(sum(amount_cents-refunded_cents),0) into collected from public.payment_transactions where order_id=t.order_id and care_id is null;
  update public.orders set paid=collected>=r.contract_cents where id=t.order_id;
 end if;
end $$;
revoke all on function public.koryx_settle_care(uuid,jsonb,text,date,date),public.koryx_sync_refund(text,bigint) from public,anon,authenticated;
grant execute on function public.koryx_settle_care(uuid,jsonb,text,date,date),public.koryx_sync_refund(text,bigint) to service_role;
create or replace function public.koryx_save_domain(p_order_id uuid,p_domain jsonb)
returns public.order_domains language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;d public.order_domains;old public.order_domains;items jsonb;item jsonb;label text;subtotal numeric;service_discount numeric;net_subtotal numeric;discount numeric;total numeric;v_delivery jsonb;has_item boolean:=false;new_date date;retail numeric;cost numeric;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 cost=(p_domain->>'cost_price')::numeric;retail=ceil(cost*150)/100;new_date=nullif(p_domain->>'renewal_date','')::date;
 if cost is null or cost<0 or cost>1000000 then raise exception 'Invalid price';end if;
 if p_domain->>'id' is not null then
  select * into old from public.order_domains where id=(p_domain->>'id')::uuid for update;
  if not found or old.order_id<>o.id or old.hostname<>p_domain->>'hostname' then raise exception 'Domain mismatch';end if;
  if exists(select 1 from public.care_services where domain_id=old.id and (subscription_id is not null or consented_at is not null) and (next_date is distinct from new_date or amount_cents<>round(retail*100))) then raise exception 'Automatic renewal terms are locked';end if;
  if exists(select 1 from public.domain_renewals where domain_id=old.id and status='submitted' and (due_date is distinct from new_date or amount<>retail)) then raise exception 'Confirm the submitted renewal first';end if;
  update public.order_domains set status=p_domain->>'status',renewal_date=new_date,cost_price=cost,retail_price=retail,notes=coalesce(p_domain->>'notes','') where id=old.id returning * into d;
 else
  insert into public.order_domains(order_id,user_id,hostname,status,renewal_date,cost_price,retail_price,notes) values(o.id,o.user_id,p_domain->>'hostname',p_domain->>'status',new_date,cost,retail,coalesce(p_domain->>'notes','')) returning * into d;
 end if;
 update public.domain_renewals set status='cancelled' where domain_id=d.id and due_date is distinct from new_date and status='due';
 if new_date is not null then
  insert into public.domain_renewals(domain_id,order_id,user_id,due_date,amount) values(d.id,o.id,o.user_id,new_date,retail) on conflict(domain_id,due_date) do update set status=case when domain_renewals.status='cancelled' then 'due' else domain_renewals.status end,amount=case when domain_renewals.status in('due','cancelled') then excluded.amount else domain_renewals.amount end,snapshot=case when domain_renewals.status in('due','cancelled') and domain_renewals.amount<>excluded.amount then null else domain_renewals.snapshot end;
 end if;
 if not o.paid and not exists(select 1 from public.payment_requests where order_id=o.id and status in('open','paid')) and not exists(select 1 from public.payment_transactions where order_id=o.id and care_id is null) then
  v_delivery=coalesce(o.delivery,'{}'::jsonb);items=coalesce(v_delivery->'billing_items','[]'::jsonb);
  if jsonb_array_length(items)=0 and o.quote_price is not null then items=jsonb_build_array(jsonb_build_object('description','Website development','quantity',1,'unit_price',o.quote_price));end if;
  label='Domain — '||d.hostname||' · 1 year';
  for item in select value from jsonb_array_elements(items) loop if item->>'description'=label then has_item=true;end if;end loop;
  if has_item then select jsonb_agg(case when value->>'description'=label then value||jsonb_build_object('description',label,'quantity',1,'unit_price',retail) else value end) into items from jsonb_array_elements(items);
  else if jsonb_array_length(items)>=15 then raise exception 'Maximum 15 services';end if;items=items||jsonb_build_array(jsonb_build_object('description',label,'quantity',1,'unit_price',retail));end if;
  select coalesce(sum((value->>'quantity')::numeric*(value->>'unit_price')::numeric),0) into subtotal from jsonb_array_elements(items);
  select coalesce(sum(least((value->>'quantity')::numeric*(value->>'unit_price')::numeric,greatest(0,case when value->'discount'->>'type'='percent' then round((value->>'quantity')::numeric*(value->>'unit_price')::numeric*coalesce((value->'discount'->>'value')::numeric,0)/100,2) else coalesce((value->'discount'->>'value')::numeric,0) end))),0) into service_discount from jsonb_array_elements(items);
  net_subtotal=subtotal-service_discount;
  discount=case when v_delivery->'discount'->>'type'='percent' then round(net_subtotal*coalesce((v_delivery->'discount'->>'value')::numeric,0)/100,2) else coalesce((v_delivery->'discount'->>'value')::numeric,0) end;total=net_subtotal-least(net_subtotal,greatest(discount,0));
  if subtotal>1000000 then raise exception 'Maximum total exceeded';end if;
  update public.orders set delivery=jsonb_set(v_delivery-'notes','{billing_items}',items),quote_price=total where id=o.id;
 end if;return d;
end $$;
revoke all on function public.koryx_save_domain(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.koryx_save_domain(uuid,jsonb) to service_role;
create or replace function public.koryx_record_payment(p_order_id uuid,p_snapshot jsonb)
returns public.project_payments language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;p public.project_payments;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 select * into p from public.project_payments where order_id=p_order_id;if found then return p;end if;
 if exists(select 1 from public.payment_requests where order_id=o.id and status in('open','paid')) or exists(select 1 from public.payment_transactions where order_id=o.id and care_id is null) then raise exception 'Use installment payment recording';end if;
 if o.quote_price is null or o.quote_price<0 then raise exception 'A positive agreed quote is required';end if;
 if (p_snapshot->>'total') is null or (p_snapshot->>'subtotal') is null or (p_snapshot->>'total')::numeric<>o.quote_price or (p_snapshot->>'subtotal')::numeric-coalesce((p_snapshot->>'discount_amount')::numeric,0)<>(p_snapshot->>'total')::numeric then raise exception 'Quote changed';end if;
 insert into public.project_payments(order_id,user_id,snapshot) values(o.id,o.user_id,p_snapshot) returning * into p;
 update public.orders set paid=true,status=case when status in('pending','in_review','invoice_sent') then 'paid' else status end where id=o.id;return p;
end $$;
revoke all on function public.koryx_record_payment(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.koryx_record_payment(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
