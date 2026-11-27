-- Keep the existing support records intact and add an independent CEO mailbox.
alter table public.billing_mail add column mail_account text not null default 'support' check (mail_account in ('support','ceo'));
alter table public.support_inbox_contacts add column mail_account text not null default 'support' check (mail_account in ('support','ceo'));
alter table public.support_inbox_threads add column mail_account text not null default 'support' check (mail_account in ('support','ceo'));
alter table public.support_mail_headers add column mail_account text not null default 'support' check (mail_account in ('support','ceo'));
create unique index support_inbox_contacts_account_key on public.support_inbox_contacts(user_id,mail_account,contact);
create unique index support_inbox_threads_account_key on public.support_inbox_threads(user_id,mail_account,thread_key);
create unique index support_mail_headers_account_key on public.support_mail_headers(user_id,mail_account,email_key);
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
 'headers_checked',snapshot->'email'->'headers_checked',
 'mail_account',mail_account)) as snapshot,
 mail_account
from public.billing_mail where dedupe_key like 'support-mail/%';
revoke all on public.support_mail_index from public,anon,authenticated;
grant select on public.support_mail_index to service_role;
-- These tables remain private, with service-role access only, behind founderClient().
alter table public.support_inbox_contacts enable row level security;
alter table public.support_inbox_threads enable row level security;
alter table public.support_mail_headers enable row level security;
