-- Only lightweight message identifiers and list metadata are indexed here; never email bodies or files.
create table public.support_mail_headers (
 user_id uuid not null references auth.users(id) on delete cascade,
 email_key text not null check (length(email_key) between 1 and 100),
 email jsonb not null check (jsonb_typeof(email)='object' and not (email ?| array['text','html','body_html','files'])),
 checked boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key (user_id,email_key)
);
create table public.support_inbox_threads (
 user_id uuid not null references auth.users(id) on delete cascade,
 thread_key text not null check (length(thread_key) between 1 and 1200),
 pinned_at timestamptz,
 archived_at timestamptz,
 read_at timestamptz,
 marked_unread boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key (user_id,thread_key)
);
alter table public.support_mail_headers enable row level security;
alter table public.support_inbox_threads enable row level security;
revoke all on public.support_mail_headers,public.support_inbox_threads from public,anon,authenticated;
grant select,insert,update,delete on public.support_mail_headers,public.support_inbox_threads to service_role;
-- Existing person-wide state is inherited once by pre-existing conversations, never future new threads.
alter table public.support_inbox_contacts add column thread_state_cutover_at timestamptz not null default now();
create or replace view public.support_mail_index with (security_invoker=true) as
select id,dedupe_key,user_id,email_id,status,created_at,
 jsonb_build_object('kind','support_email','version',1,'direction',snapshot->'direction','headers',snapshot->'headers',
 'files',snapshot->'files','email',jsonb_build_object(
 'id',snapshot->'email'->'id','from',snapshot->'email'->'from','to',snapshot->'email'->'to',
 'subject',snapshot->'email'->'subject','created_at',snapshot->'email'->'created_at',
 'reply_to',snapshot->'email'->'reply_to','attachments','[]'::jsonb,
 'message_id',snapshot->'email'->'message_id','in_reply_to',snapshot->'email'->'in_reply_to',
 'references',snapshot->'email'->'references','reply_key',snapshot->'email'->'reply_key',
 'draft_key',snapshot->'email'->'draft_key','thread_id',snapshot->'email'->'thread_id',
 'headers_checked',snapshot->'email'->'headers_checked')) as snapshot
from public.billing_mail where dedupe_key like 'support-mail/%';
revoke all on public.support_mail_index from public,anon,authenticated;
grant select on public.support_mail_index to service_role;
