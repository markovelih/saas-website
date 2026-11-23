-- Mail content stays in the existing private archive. This table stores only per-person preferences.
create table public.support_inbox_contacts (
 user_id uuid not null references auth.users(id) on delete cascade,
 contact text not null check (contact = lower(trim(contact)) and length(contact) between 3 and 254),
 pinned_at timestamptz,
 archived_at timestamptz,
 read_at timestamptz,
 marked_unread boolean not null default false,
 notify_since timestamptz,
 updated_at timestamptz not null default now(),
 primary key (user_id,contact)
);
alter table public.support_inbox_contacts enable row level security;
revoke all on public.support_inbox_contacts from public,anon,authenticated;
grant select,insert,update,delete on public.support_inbox_contacts to service_role;
create index support_inbox_notifications on public.support_inbox_contacts (user_id,notify_since) where notify_since is not null;
-- List pages do not transfer complete email bodies or HTML from Postgres.
create view public.support_mail_index with (security_invoker=true) as
select id,dedupe_key,user_id,email_id,status,created_at,
 jsonb_build_object('kind','support_email','version',1,'direction',snapshot->'direction',
 'files',snapshot->'files','email',jsonb_build_object(
 'id',snapshot->'email'->'id','from',snapshot->'email'->'from','to',snapshot->'email'->'to',
 'subject',snapshot->'email'->'subject','created_at',snapshot->'email'->'created_at',
 'reply_to',snapshot->'email'->'reply_to','attachments','[]'::jsonb)) as snapshot
from public.billing_mail where dedupe_key like 'support-mail/%';
revoke all on public.support_mail_index from public,anon,authenticated;
grant select on public.support_mail_index to service_role;
create index if not exists support_mail_user_created on public.billing_mail (user_id,created_at desc,id desc) where dedupe_key like 'support-mail/%';
