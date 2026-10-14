-- Founder-initiated private conversations. Reuses the existing private message/photo pipeline.
-- order_id remains the conversation key for API compatibility; project_order_id is its optional real order.
-- No orders or payments are created by this migration or by starting a direct conversation.
begin;
alter table public.project_chat_threads add column project_order_id uuid references public.orders(id) on delete cascade;
alter table public.project_chat_threads add column direct_client_id uuid references public.profiles(id) on delete cascade;
update public.project_chat_threads set project_order_id=order_id;
alter table public.project_chat_threads drop constraint project_chat_threads_order_id_fkey;
alter table public.project_chat_threads add constraint chat_thread_kind check (
 (direct_client_id is null and project_order_id is not null and project_order_id=order_id) or
 (direct_client_id is not null and project_order_id is null and developer_id is not null and developer_id='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid and direct_client_id<>developer_id)
);
alter table public.project_chat_threads add constraint chat_direct_client_unique unique(direct_client_id);
alter table public.project_push_outbox drop constraint project_push_outbox_order_id_fkey;
alter table public.project_push_outbox add constraint project_push_outbox_thread_fkey foreign key(order_id) references public.project_chat_threads(order_id) on delete cascade;

create or replace function public.koryx_chat_access(p_order_id uuid,p_write boolean default false) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.project_chat_threads t left join public.orders o on o.id=t.project_order_id where t.order_id=p_order_id and (
  (t.direct_client_id is not null and (auth.uid()=t.direct_client_id or auth.uid()='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid)) or
  (t.direct_client_id is null and (not p_write or (t.developer_id is not null and public.koryx_chat_paid(o.id))) and
   (auth.uid()='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid or
    (t.developer_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and role::text='admin')) or
    (o.user_id=auth.uid() and t.developer_id is not null and public.koryx_chat_paid(o.id))))
 ))
$$;
create or replace function public.koryx_chat_moderator(p_order_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select auth.uid()='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid or exists(select 1 from public.project_chat_threads t join public.profiles p on p.id=t.developer_id where t.order_id=p_order_id and t.direct_client_id is null and t.developer_id=auth.uid() and p.role::text='admin')
$$;

create or replace function public.koryx_assign_project_developer(p_order_id uuid,p_developer_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is distinct from '2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid then raise exception 'Only the founder can assign a developer';end if;
 perform 1 from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 if p_developer_id is not null and not exists(select 1 from public.profiles where id=p_developer_id and (id='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid or role::text='admin')) then raise exception 'Choose a studio developer';end if;
 insert into public.project_chat_threads(order_id,project_order_id,developer_id) values(p_order_id,p_order_id,p_developer_id) on conflict(order_id) do update set developer_id=excluded.developer_id,updated_at=now();
end $$;

create or replace function public.koryx_chat_thread_json(p_order_id uuid) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('order_id',t.order_id,'kind',case when t.direct_client_id is null then 'project' else 'direct' end,'project_id',t.project_order_id,
 'title',case when t.direct_client_id is null then o.business_name when auth.uid()=t.direct_client_id then left(coalesce(nullif(split_part(regexp_replace(trim(p.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),'Koryx'),40) else left(coalesce(nullif(split_part(regexp_replace(trim(cp.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),'Client'),40) end,'developer_id',t.developer_id,
 'client_name',left(coalesce(nullif(split_part(regexp_replace(trim(cp.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),'Client'),40),
 'developer_name',left(coalesce(nullif(split_part(regexp_replace(trim(p.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),'Developer'),40),
 'paid',case when t.direct_client_id is null then public.koryx_chat_paid(t.order_id) else false end,'can_write',public.koryx_chat_access(t.order_id,true),'can_moderate',public.koryx_chat_moderator(t.order_id),
 'pinned',coalesce(pr.pinned,false),'last_read_at',pr.last_read_at,'client_read_at',cr.last_read_at,'developer_read_at',dr.last_read_at,
 'unread',(select count(*) from public.project_chat_messages m where m.order_id=t.order_id and m.sender_id<>auth.uid() and m.deleted_at is null and m.created_at>coalesce(pr.last_read_at,'epoch'::timestamptz)),
 'last_body',coalesce((select case when m.deleted_at is not null then 'Message deleted' when m.body='' then 'Photo' else left(m.body,120) end from public.project_chat_messages m where m.order_id=t.order_id order by m.created_at desc,m.id desc limit 1),case when t.direct_client_id is null then 'Your project conversation' else 'Start the conversation' end),
 'last_at',coalesce((select max(created_at) from public.project_chat_messages where order_id=t.order_id),t.updated_at))
 from public.project_chat_threads t left join public.orders o on o.id=t.project_order_id left join public.profiles p on p.id=t.developer_id left join public.profiles cp on cp.id=coalesce(t.direct_client_id,o.user_id)
 left join public.project_chat_preferences pr on pr.order_id=t.order_id and pr.user_id=auth.uid()
 left join public.project_chat_preferences cr on cr.order_id=t.order_id and cr.user_id=coalesce(t.direct_client_id,o.user_id)
 left join public.project_chat_preferences dr on dr.order_id=t.order_id and dr.user_id=t.developer_id
 where t.order_id=p_order_id and public.koryx_chat_access(t.order_id)
$$;

-- Only an intentional founder action can create a direct chat. Concurrent/repeated clicks reuse it.
create or replace function public.koryx_chat_start_direct(p_client_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare conversation_id uuid;
begin
 if auth.uid() is distinct from '2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid then raise exception 'Only the founder can start a private conversation';end if;
 if p_client_id is null or p_client_id=auth.uid() or not exists(select 1 from public.profiles where id=p_client_id) then raise exception 'Choose another person from your client list';end if;
 insert into public.project_chat_threads(order_id,developer_id,direct_client_id)
 values(gen_random_uuid(),auth.uid(),p_client_id)
 on conflict(direct_client_id) do update set direct_client_id=excluded.direct_client_id returning order_id into conversation_id;
 return public.koryx_chat_page(conversation_id);
end $$;
revoke all on function public.koryx_chat_start_direct(uuid) from public,anon;
grant execute on function public.koryx_chat_start_direct(uuid) to authenticated;

-- The server rechecks recipient and current project eligibility before delivering a queued notification.
create or replace function public.koryx_chat_push_recipient(p_order_id uuid) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('user_id',coalesce(t.direct_client_id,o.user_id),'developer_id',t.developer_id,'direct',t.direct_client_id is not null)
 from public.project_chat_threads t left join public.orders o on o.id=t.project_order_id
 where t.order_id=p_order_id and t.developer_id is not null and (t.direct_client_id is not null or public.koryx_chat_paid(o.id))
$$;
revoke all on function public.koryx_chat_push_recipient(uuid) from public,anon,authenticated;
grant execute on function public.koryx_chat_push_recipient(uuid) to service_role;
create or replace function public.koryx_chat_queue_push() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.sender_role='developer' then
  insert into public.project_push_outbox(message_id,order_id,user_id)
  select new.id,new.order_id,coalesce(t.direct_client_id,o.user_id) from public.project_chat_threads t left join public.orders o on o.id=t.project_order_id
  where t.order_id=new.order_id and coalesce(t.direct_client_id,o.user_id)<>new.sender_id
  on conflict(message_id) do nothing;
 end if;
 return new;
end $$;
notify pgrst,'reload schema';
commit;
