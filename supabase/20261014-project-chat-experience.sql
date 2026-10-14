-- Apply after 20261014-project-chat.sql. No network calls occur in DB triggers.
begin;
create table public.project_chat_events (
 id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,
 status text not null,created_at timestamptz not null default clock_timestamp()
);
create index chat_events_timeline on public.project_chat_events(order_id,created_at desc);
alter table public.project_chat_events enable row level security;
revoke all on public.project_chat_events from public,anon,authenticated;
grant select on public.project_chat_events to authenticated;
grant all on public.project_chat_events to service_role;
-- These notices belong exclusively to the client. Staff cannot read them, even via RPC.
create policy chat_events_client_read on public.project_chat_events for select to authenticated using(
 public.koryx_chat_access(order_id) and not public.koryx_chat_moderator(order_id) and
 exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid())
);
create or replace function public.koryx_chat_status_changed() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.status is distinct from old.status then
  insert into public.project_chat_events(order_id,status) values(new.id,new.status::text);
  update public.project_chat_threads set updated_at=clock_timestamp() where order_id=new.id;
 end if;
 return new;
end $$;
create trigger koryx_chat_status_changed after update of status on public.orders for each row execute function public.koryx_chat_status_changed();
-- Only the application server can store or deliver push subscriptions.
create table public.project_push_subscriptions (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,
 endpoint text not null unique,p256dh text not null,auth text not null,language text not null default 'en' check(language in('en','uk')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index project_push_user on public.project_push_subscriptions(user_id);
create table public.project_push_outbox (
 id uuid primary key default gen_random_uuid(),message_id uuid not null unique references public.project_chat_messages(id) on delete cascade,
 order_id uuid not null references public.orders(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),attempts integer not null default 0,next_attempt_at timestamptz not null default now(),
 lease_until timestamptz,lease_token uuid,sent_at timestamptz,sent_subscriptions uuid[] not null default '{}'
);
create index project_push_ready on public.project_push_outbox(next_attempt_at) where sent_at is null;
alter table public.project_push_subscriptions enable row level security;
alter table public.project_push_outbox enable row level security;
revoke all on public.project_push_subscriptions,public.project_push_outbox from public,anon,authenticated;
grant all on public.project_push_subscriptions,public.project_push_outbox to service_role;
create or replace function public.koryx_chat_queue_push() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.sender_role='developer' then
  insert into public.project_push_outbox(message_id,order_id,user_id)
  select new.id,new.order_id,o.user_id from public.orders o where o.id=new.order_id and o.user_id<>new.sender_id
  on conflict(message_id) do nothing;
 end if;
 return new;
end $$;
create trigger koryx_chat_queue_push after insert on public.project_chat_messages for each row execute function public.koryx_chat_queue_push();
-- Claim work atomically so request retries and cron cannot send the same job concurrently.
create or replace function public.koryx_claim_chat_push(p_order_id uuid default null) returns setof public.project_push_outbox language sql security definer set search_path=public,pg_temp as $$
 update public.project_push_outbox j set lease_until=now()+interval '2 minutes',lease_token=gen_random_uuid(),attempts=j.attempts+1
 where j.id in(select id from public.project_push_outbox where sent_at is null and attempts<8 and next_attempt_at<=now()
 and (lease_until is null or lease_until<now()) and (p_order_id is null or order_id=p_order_id)
 order by created_at for update skip locked limit 5) returning j.*
$$;
revoke all on function public.koryx_claim_chat_push(uuid),public.koryx_chat_status_changed(),public.koryx_chat_queue_push() from public,anon,authenticated;
grant execute on function public.koryx_claim_chat_push(uuid),public.koryx_chat_paid(uuid) to service_role;
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then alter publication supabase_realtime add table public.project_chat_events;end if;
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

create or replace function public.koryx_chat_page(p_order_id uuid,p_before timestamptz default null) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare messages jsonb;pins jsonb;older boolean;events jsonb;
begin
 if not public.koryx_chat_access(p_order_id) then raise exception 'Conversation not available';end if;
 select coalesce(jsonb_agg(public.koryx_chat_message_json(v.id) order by v.created_at,v.id),'[]'::jsonb) into messages from
 (select id,created_at from public.project_chat_messages where order_id=p_order_id and (p_before is null or created_at<p_before) order by created_at desc,id desc limit 60) v;
 select exists(select 1 from public.project_chat_messages where order_id=p_order_id and created_at<(messages->0->>'created_at')::timestamptz) into older;
 select coalesce(jsonb_agg(public.koryx_chat_message_json(id) order by created_at desc),'[]'::jsonb) into pins from public.project_chat_messages where order_id=p_order_id and pinned and deleted_at is null;
 select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at),'[]'::jsonb) into events from (select e.* from public.project_chat_events e join public.orders o on o.id=e.order_id where e.order_id=p_order_id and o.user_id=auth.uid() and not public.koryx_chat_moderator(p_order_id) order by e.created_at desc limit 200) e;
 return jsonb_build_object('events',events,'thread',public.koryx_chat_thread_json(p_order_id),'messages',messages,'has_more',older,'pins',pins);
end $$;

-- Correct historical labels without exposing surnames.
update public.project_chat_messages m set sender_name=left(coalesce(nullif(split_part(regexp_replace(trim(p.full_name),'[[:space:]  ]+',' ','g'),' ',1),''),case when m.sender_role='developer' then 'Developer' else 'Client' end),40) from public.profiles p where p.id=m.sender_id;
create or replace function public.koryx_chat_preference(p_order_id uuid,p_pinned boolean default null,p_read boolean default false) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.koryx_chat_access(p_order_id) then raise exception 'Conversation not available';end if;
 insert into public.project_chat_preferences(order_id,user_id,pinned,last_read_at) values(p_order_id,auth.uid(),coalesce(p_pinned,false),case when p_read then now() end)
 on conflict(order_id,user_id) do update set pinned=coalesce(p_pinned,project_chat_preferences.pinned),last_read_at=case when p_read then now() else project_chat_preferences.last_read_at end;
 if p_read then update public.project_chat_threads set updated_at=updated_at where order_id=p_order_id;end if;
end $$;

notify pgrst,'reload schema';
commit;
