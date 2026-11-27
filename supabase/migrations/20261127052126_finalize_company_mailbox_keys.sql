-- Apply after the mailbox-aware application has reached production.
alter table public.support_inbox_contacts drop constraint support_inbox_contacts_pkey, add primary key using index support_inbox_contacts_account_key;
alter table public.support_inbox_threads drop constraint support_inbox_threads_pkey, add primary key using index support_inbox_threads_account_key;
alter table public.support_mail_headers drop constraint support_mail_headers_pkey, add primary key using index support_mail_headers_account_key;
