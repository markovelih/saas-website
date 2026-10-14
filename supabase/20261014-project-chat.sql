-- Project messaging: one customer, one assigned developer, founder oversight.
-- Apply after the 20261012 payment migrations. No existing projects are assigned automatically.
begin;
create table if not exists public.project_chat_threads (
 order_id uuid primary key references public.orders(id) on delete cascade,
 developer_id uuid references public.profiles(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists project_chat_developer on public.project_chat_threads(developer_id,updated_at desc);
create table if not exists public.project_chat_messages (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.project_chat_threads(order_id) on delete cascade,
 sender_id uuid not null references public.profiles(id),sender_name text not null,sender_role text not null check(sender_role in('client','developer')),
 body text not null default '' check(length(body)<=8000),created_at timestamptz not null default now(),edited_at timestamptz,deleted_at timestamptz,
 pinned boolean not null default false,reply_to uuid references public.project_chat_messages(id)
);
create index if not exists project_chat_timeline on public.project_chat_messages(order_id,created_at desc,id desc);
create index if not exists project_chat_pins on public.project_chat_messages(order_id) where pinned and deleted_at is null;
create table if not exists public.project_chat_attachments (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.project_chat_threads(order_id) on delete cascade,
 uploader_id uuid not null references public.profiles(id),message_id uuid references public.project_chat_messages(id),
 path text not null unique,name text not null check(length(name)<=160),mime text not null check(mime in('image/jpeg','image/png','image/webp')),
 size integer not null check(size>0 and size<=10485760),created_at timestamptz not null default now()
);
create index if not exists project_chat_attachments_message on public.project_chat_attachments(message_id);
create table if not exists public.project_chat_preferences (
 order_id uuid not null references public.project_chat_threads(order_id) on delete cascade,user_id uuid not null references public.profiles(id),
 pinned boolean not null default false,last_read_at timestamptz,primary key(order_id,user_id)
);
alter table public.project_chat_threads enable row level security;
alter table public.project_chat_messages enable row level security;
alter table public.project_chat_attachments enable row level security;
alter table public.project_chat_preferences enable row level security;
revoke all on public.project_chat_threads,public.project_chat_messages,public.project_chat_attachments,public.project_chat_preferences from anon,authenticated;
grant all on public.project_chat_threads,public.project_chat_messages,public.project_chat_attachments,public.project_chat_preferences to service_role;
grant select on public.project_chat_threads,public.project_chat_messages,public.project_chat_attachments,public.project_chat_preferences to authenticated;
-- Roles cannot be self-promoted through a profile update or insert.
create or replace function public.koryx_protect_chat_role() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if coalesce(auth.role(),'') in('authenticated','anon') and ((tg_op='INSERT' and new.role::text<>'user') or (tg_op='UPDATE' and new.role is distinct from old.role)) then raise exception 'Role changes require studio authorization';end if;
 return new;
end $$;
drop trigger if exists koryx_protect_chat_role on public.profiles;
create trigger koryx_protect_chat_role before insert or update of role on public.profiles for each row execute function public.koryx_protect_chat_role();
create or replace function public.koryx_chat_paid(p_order_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.project_payments where order_id=p_order_id) or coalesce((select sum(amount_cents-refunded_cents)>0 from public.payment_transactions where order_id=p_order_id and care_id is null),false)
$$;
create or replace function public.koryx_chat_access(p_order_id uuid,p_write boolean default false) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.project_chat_threads t join public.orders o on o.id=t.order_id where t.order_id=p_order_id and
 (not p_write or (t.developer_id is not null and public.koryx_chat_paid(o.id))) and
 (auth.uid()='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid or
 (t.developer_id=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and role::text='admin')) or
 (o.user_id=auth.uid() and t.developer_id is not null and public.koryx_chat_paid(o.id))))
$$;
create or replace function public.koryx_chat_moderator(p_order_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select auth.uid()='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid or exists(select 1 from public.project_chat_threads t join public.profiles p on p.id=t.developer_id where t.order_id=p_order_id and t.developer_id=auth.uid() and p.role::text='admin')
$$;
revoke all on function public.koryx_chat_paid(uuid),public.koryx_chat_access(uuid,boolean),public.koryx_chat_moderator(uuid) from public,anon;
grant execute on function public.koryx_chat_access(uuid,boolean),public.koryx_chat_moderator(uuid) to authenticated,service_role;
create policy chat_threads_read on public.project_chat_threads for select to authenticated using(public.koryx_chat_access(order_id));
create policy chat_messages_read on public.project_chat_messages for select to authenticated using(public.koryx_chat_access(order_id));
create policy chat_attachments_read on public.project_chat_attachments for select to authenticated using(public.koryx_chat_access(order_id) and (uploader_id=auth.uid() or exists(select 1 from public.project_chat_messages m where m.id=message_id and m.deleted_at is null)));
create policy chat_preferences_read on public.project_chat_preferences for select to authenticated using(user_id=auth.uid() and public.koryx_chat_access(order_id));
create or replace function public.koryx_assign_project_developer(p_order_id uuid,p_developer_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is distinct from '2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid then raise exception 'Only the founder can assign a developer';end if;
 perform 1 from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 if p_developer_id is not null and not exists(select 1 from public.profiles where id=p_developer_id and (id='2f0a1860-cb7a-4104-967d-86ccc9166cdc'::uuid or role::text='admin')) then raise exception 'Choose a studio developer';end if;
 insert into public.project_chat_threads(order_id,developer_id) values(p_order_id,p_developer_id) on conflict(order_id) do update set developer_id=excluded.developer_id,updated_at=now();
end $$;
create or replace function public.koryx_chat_thread_json(p_order_id uuid) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('order_id',o.id,'title',o.business_name,'developer_id',t.developer_id,
 'client_name',left(coalesce(nullif(split_part(regexp_replace(trim(cp.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),'Client'),40),
 'developer_name',left(coalesce(nullif(split_part(regexp_replace(trim(p.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),'Developer'),40),
 'paid',public.koryx_chat_paid(o.id),'can_write',public.koryx_chat_access(o.id,true),'can_moderate',public.koryx_chat_moderator(o.id),
 'pinned',coalesce(pr.pinned,false),'last_read_at',pr.last_read_at,'client_read_at',cr.last_read_at,'developer_read_at',dr.last_read_at,
 'unread',(select count(*) from public.project_chat_messages m where m.order_id=o.id and m.sender_id<>auth.uid() and m.deleted_at is null and m.created_at>coalesce(pr.last_read_at,'epoch'::timestamptz)),
 'last_body',coalesce((select case when m.deleted_at is not null then 'Message deleted' when m.body='' then 'Photo' else left(m.body,120) end from public.project_chat_messages m where m.order_id=o.id order by m.created_at desc,m.id desc limit 1),'Your project conversation'),
 'last_at',coalesce((select max(created_at) from public.project_chat_messages where order_id=o.id),t.updated_at))
 from public.project_chat_threads t join public.orders o on o.id=t.order_id left join public.profiles p on p.id=t.developer_id left join public.profiles cp on cp.id=o.user_id
 left join public.project_chat_preferences pr on pr.order_id=o.id and pr.user_id=auth.uid()
 left join public.project_chat_preferences cr on cr.order_id=o.id and cr.user_id=o.user_id
 left join public.project_chat_preferences dr on dr.order_id=o.id and dr.user_id=t.developer_id
 where o.id=p_order_id and public.koryx_chat_access(o.id)
$$;
create or replace function public.koryx_chat_inbox() returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(v.payload order by coalesce((v.payload->>'pinned')::boolean,false) desc,v.updated_at desc),'[]'::jsonb) from
 (select public.koryx_chat_thread_json(t.order_id) payload,t.updated_at from public.project_chat_threads t where public.koryx_chat_access(t.order_id) order by t.updated_at desc limit 200) v
$$;
create or replace function public.koryx_chat_message_json(p_id uuid) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select to_jsonb(m)||jsonb_build_object('attachments',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'mime',a.mime,'size',a.size) order by a.created_at) from public.project_chat_attachments a where a.message_id=m.id and m.deleted_at is null),'[]'::jsonb)) from public.project_chat_messages m where m.id=p_id and public.koryx_chat_access(m.order_id)
$$;
create or replace function public.koryx_chat_page(p_order_id uuid,p_before timestamptz default null) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare messages jsonb;pins jsonb;older boolean;
begin
 if not public.koryx_chat_access(p_order_id) then raise exception 'Conversation not available';end if;
 select coalesce(jsonb_agg(public.koryx_chat_message_json(v.id) order by v.created_at,v.id),'[]'::jsonb) into messages from
 (select id,created_at from public.project_chat_messages where order_id=p_order_id and (p_before is null or created_at<p_before) order by created_at desc,id desc limit 60) v;
 select exists(select 1 from public.project_chat_messages where order_id=p_order_id and created_at<(messages->0->>'created_at')::timestamptz) into older;
 select coalesce(jsonb_agg(public.koryx_chat_message_json(id) order by created_at desc),'[]'::jsonb) into pins from public.project_chat_messages where order_id=p_order_id and pinned and deleted_at is null;
 return jsonb_build_object('thread',public.koryx_chat_thread_json(p_order_id),'messages',messages,'has_more',older,'pins',pins);
end $$;
create or replace function public.koryx_chat_send(p_order_id uuid,p_id uuid,p_body text,p_reply_to uuid default null,p_attachments uuid[] default '{}') returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;display_name text;staff boolean;existing public.project_chat_messages;
begin
 p_attachments=coalesce(p_attachments,'{}'::uuid[]);
 perform 1 from public.project_chat_threads where order_id=p_order_id for update;
 if not public.koryx_chat_access(p_order_id,true) then raise exception 'Payment and an assigned developer are required';end if;
 select * into existing from public.project_chat_messages where id=p_id;
 if found then if existing.order_id=p_order_id and existing.sender_id=auth.uid() then return public.koryx_chat_message_json(existing.id);else raise exception 'Invalid message';end if;end if;
 if length(trim(coalesce(p_body,'')))>8000 or (trim(coalesce(p_body,''))='' and cardinality(p_attachments)=0) or cardinality(p_attachments)>4 then raise exception 'Enter a message or up to four photos';end if;
 if (select count(*) from public.project_chat_messages where sender_id=auth.uid() and created_at>now()-interval '1 minute')>=40 then raise exception 'Please wait a moment before sending more messages';end if;
 if p_reply_to is not null and not exists(select 1 from public.project_chat_messages where id=p_reply_to and order_id=p_order_id and deleted_at is null) then raise exception 'Reply unavailable';end if;
 select count(*) into n from public.project_chat_attachments where id=any(p_attachments) and order_id=p_order_id and uploader_id=auth.uid() and message_id is null;
 if n<>cardinality(p_attachments) then raise exception 'Photo upload is not available';end if;
 staff=public.koryx_chat_moderator(p_order_id);
 select left(coalesce(nullif(split_part(regexp_replace(trim(full_name),'[[:space:]  ]+',' ','g'),' ',1),''),case when staff then 'Developer' else 'Client' end),40) into display_name from public.profiles where id=auth.uid();
 insert into public.project_chat_messages(id,order_id,sender_id,sender_name,sender_role,body,reply_to) values(p_id,p_order_id,auth.uid(),display_name,case when staff then 'developer' else 'client' end,trim(coalesce(p_body,'')),p_reply_to);
 update public.project_chat_attachments set message_id=p_id where id=any(p_attachments);
 update public.project_chat_threads set updated_at=now() where order_id=p_order_id;
 return public.koryx_chat_message_json(p_id);
end $$;
create or replace function public.koryx_chat_change(p_order_id uuid,p_id uuid,p_action text,p_body text default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.project_chat_messages;moderator boolean;
begin
 perform 1 from public.project_chat_threads where order_id=p_order_id for update;
 if not public.koryx_chat_access(p_order_id,true) then raise exception 'Conversation not available';end if;
 select * into m from public.project_chat_messages where id=p_id and order_id=p_order_id for update;if not found or m.deleted_at is not null then raise exception 'Message not available';end if;
 moderator=public.koryx_chat_moderator(p_order_id);
 if p_action='edit' then
  if m.sender_id<>auth.uid() then raise exception 'Only your own messages can be edited';end if;
  if p_body is null or length(trim(p_body))>8000 or (trim(p_body)='' and not exists(select 1 from public.project_chat_attachments where message_id=m.id)) then raise exception 'Enter a message';end if;
  update public.project_chat_messages set body=trim(p_body),edited_at=now() where id=p_id;
 elsif p_action='delete' then
  if m.sender_id<>auth.uid() and not moderator then raise exception 'Only your own messages can be deleted';end if;
  update public.project_chat_messages set body='',deleted_at=now(),pinned=false where id=p_id;
 elsif p_action in('pin','unpin') then
  if not moderator then raise exception 'Only the developer can pin messages';end if;
  if p_action='pin' and (select count(*) from public.project_chat_messages where order_id=p_order_id and pinned and deleted_at is null)>=20 then raise exception 'Unpin a message first';end if;
  update public.project_chat_messages set pinned=(p_action='pin') where id=p_id;
 else raise exception 'Invalid action';end if;
 update public.project_chat_threads set updated_at=now() where order_id=p_order_id;
 return public.koryx_chat_message_json(p_id);
end $$;
create or replace function public.koryx_chat_preference(p_order_id uuid,p_pinned boolean default null,p_read boolean default false) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.koryx_chat_access(p_order_id) then raise exception 'Conversation not available';end if;
 insert into public.project_chat_preferences(order_id,user_id,pinned,last_read_at) values(p_order_id,auth.uid(),coalesce(p_pinned,false),case when p_read then now() end)
 on conflict(order_id,user_id) do update set pinned=coalesce(p_pinned,project_chat_preferences.pinned),last_read_at=case when p_read then now() else project_chat_preferences.last_read_at end;
end $$;
-- A confirmed deposit / refund refreshes membership and availability immediately.
create or replace function public.koryx_chat_payment_changed() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin update public.project_chat_threads set updated_at=now() where order_id=new.order_id;return new;end $$;
drop trigger if exists koryx_chat_payment_changed on public.payment_transactions;
create trigger koryx_chat_payment_changed after insert or update of refunded_cents on public.payment_transactions for each row execute function public.koryx_chat_payment_changed();
drop trigger if exists koryx_chat_legacy_payment on public.project_payments;
create trigger koryx_chat_legacy_payment after insert on public.project_payments for each row execute function public.koryx_chat_payment_changed();
-- Photo bytes are private. Only the authenticated application route streams them.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-chat','project-chat',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
-- A pre-existing permissive Storage policy must not expose chat photos.
create policy project_chat_storage_private on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'project-chat') with check(bucket_id<>'project-chat');
-- Do not expose SECURITY DEFINER helpers to anonymous calls or the REST RPC surface.
revoke all on function public.koryx_chat_thread_json(uuid),public.koryx_chat_message_json(uuid) from public,anon,authenticated;
revoke all on function public.koryx_assign_project_developer(uuid,uuid),public.koryx_chat_inbox(),public.koryx_chat_page(uuid,timestamptz),public.koryx_chat_send(uuid,uuid,text,uuid,uuid[]),public.koryx_chat_change(uuid,uuid,text,text),public.koryx_chat_preference(uuid,boolean,boolean) from public,anon;
grant execute on function public.koryx_assign_project_developer(uuid,uuid),public.koryx_chat_inbox(),public.koryx_chat_page(uuid,timestamptz),public.koryx_chat_send(uuid,uuid,text,uuid,uuid[]),public.koryx_chat_change(uuid,uuid,text,text),public.koryx_chat_preference(uuid,boolean,boolean) to authenticated;
-- Postgres Changes uses the SELECT policies above; no public presence channel.
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='project_chat_messages') then alter publication supabase_realtime add table public.project_chat_messages;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='project_chat_threads') then alter publication supabase_realtime add table public.project_chat_threads;end if;
 end if;
end $$;
notify pgrst,'reload schema';
commit;
