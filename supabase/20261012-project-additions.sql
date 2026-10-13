begin;
alter table public.orders add column if not exists parent_order_id uuid references public.orders(id);
alter table public.orders add column if not exists work_kind text not null default 'project' check(work_kind in('project','addition','repair','diagnostic'));
alter table public.orders add column if not exists work_origin text not null default 'koryx' check(work_origin in('koryx','external'));
create index if not exists orders_parent on public.orders(parent_order_id);
create or replace function public.koryx_validate_work_link() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare parent public.orders;
begin
 if tg_op='UPDATE' and (new.parent_order_id is distinct from old.parent_order_id or new.work_kind is distinct from old.work_kind or new.work_origin is distinct from old.work_origin) then raise exception 'Work relationship is immutable';end if;
 if tg_op='INSERT' and coalesce(auth.role(),'')<>'service_role' then
  if new.parent_order_id is null and new.work_kind<>'project' then new.work_origin='external';end if;
  if new.work_kind<>'project' and (new.quote_price is not null or new.paid or new.invoice_sent or new.status::text<>'pending' or new.admin_notes is not null or coalesce(new.delivery->'billing_items','[]'::jsonb)<>'[]'::jsonb or new.delivery ? 'diagnostic_report') then raise exception 'Only Koryx can quote or publish work';end if;
 end if;
 if new.parent_order_id is not null then
  select * into parent from public.orders where id=new.parent_order_id;
  if not found or parent.user_id<>new.user_id or parent.parent_order_id is not null or new.work_kind='project' then raise exception 'Invalid project relationship';end if;
  new.work_origin=parent.work_origin;
 end if;
 if new.work_kind='diagnostic' and new.work_origin<>'external' then raise exception 'Diagnostics are for external projects';end if;
 return new;
end $$;
drop trigger if exists koryx_validate_work_link on public.orders;
create trigger koryx_validate_work_link before insert or update on public.orders for each row execute function public.koryx_validate_work_link();
grant select(parent_order_id,work_kind,work_origin) on public.orders to authenticated;
notify pgrst,'reload schema';
commit;
