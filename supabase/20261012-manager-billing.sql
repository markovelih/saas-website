begin;
alter table public.orders add column if not exists delivery jsonb not null default '{}';
alter table public.orders add column if not exists assignment_key uuid;
create unique index if not exists orders_assignment_key_unique on public.orders(assignment_key) where assignment_key is not null;
grant select(delivery) on public.orders to authenticated;
-- Existing client insert policy must also reject owner-managed attachment fields.
drop policy if exists "orders_create" on public.orders;
drop policy if exists "koryx_client_insert" on public.orders;
create policy orders_create on public.orders for insert to authenticated with check (
 user_id=auth.uid() and status='pending' and quote_price is null and not paid and not invoice_sent
 and admin_notes is null and delivery='{}'::jsonb and assignment_key is null
);
create table if not exists public.billing_settings(
 id boolean primary key default true check(id), seller_name text not null default 'Koryx',
 seller_address text not null default '', support_email text not null default 'support@koryx.ca',
 tax_id text not null default '', tax_label text not null default 'Tax', tax_rate numeric(5,2) not null default 0 check(tax_rate between 0 and 30),
 from_email text not null default 'support@koryx.ca'
);
alter table public.billing_settings enable row level security;
revoke all on public.billing_settings from anon,authenticated;
grant all on public.billing_settings to service_role;
insert into public.billing_settings(id) values(true) on conflict do nothing;
create table if not exists public.project_payments(
 id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id),
 user_id uuid not null references public.profiles(id), snapshot jsonb not null,
 created_at timestamptz not null default now(), email_status text not null default 'pending' check(email_status in('pending','sending','sent','failed','uncertain')),
 email_id text, email_error text, attempted_at timestamptz
);
alter table public.project_payments enable row level security;
revoke all on public.project_payments from anon,authenticated;
grant select(id,order_id,user_id,snapshot,created_at) on public.project_payments to authenticated;
grant all on public.project_payments to service_role;
create policy payment_owner_read on public.project_payments for select to authenticated using(user_id=auth.uid() or public.koryx_is_admin());
-- One immutable settlement per project. Save payment + paid flag atomically.
create or replace function public.koryx_record_payment(p_order_id uuid,p_snapshot jsonb)
returns public.project_payments language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders; p public.project_payments;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then raise exception 'Project not found'; end if;
 select * into p from public.project_payments where order_id=p_order_id;
 if found then return p; end if;
 if o.quote_price is null or o.quote_price<=0 then raise exception 'A positive agreed quote is required'; end if;
 if (p_snapshot->>'subtotal')::numeric<>o.quote_price then raise exception 'Quote changed. Refresh before recording payment'; end if;
 insert into public.project_payments(order_id,user_id,snapshot) values(o.id,o.user_id,p_snapshot) returning * into p;
 update public.orders set paid=true,status=case when status in('pending','in_review','invoice_sent') then 'paid' else status end where id=o.id;
 return p;
end $$;
revoke all on function public.koryx_record_payment(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.koryx_record_payment(uuid,jsonb) to service_role;
-- Prevent later flag/quote changes from contradicting a recorded settlement.
create or replace function public.koryx_preserve_settlement() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if exists(select 1 from public.project_payments where order_id=old.id) and
 (new.paid is distinct from true or new.quote_price is distinct from old.quote_price or new.user_id is distinct from old.user_id)
 then raise exception 'Recorded settlements are immutable'; end if;
 return new;
end $$;
drop trigger if exists koryx_preserve_settlement on public.orders;
create trigger koryx_preserve_settlement before update on public.orders for each row execute function public.koryx_preserve_settlement();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-previews','project-previews',false,5242880,array['image/webp']) on conflict(id) do nothing;
-- Preview storage is private; authenticated application routes check project ownership.
notify pgrst,'reload schema';
commit;
