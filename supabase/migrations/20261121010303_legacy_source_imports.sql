-- Small, reviewed legacy source snapshots can be imported without making a
-- repository public or sharing provider credentials. Existing uploads remain
-- in Storage; this optional body inherits the table's service-only grants/RLS.
alter table public.project_source_files add column content_base64 text;
alter table public.project_source_files add constraint project_source_import_size
 check(content_base64 is null or (
  char_length(content_base64)<=4194304
  and octet_length(decode(content_base64,'base64'))=size
 ));
comment on column public.project_source_files.content_base64 is
 'Optional reviewed legacy import; private bytes, never include in metadata responses.';
