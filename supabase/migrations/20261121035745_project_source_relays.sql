alter table public.project_source_releases drop constraint project_source_releases_origin_check;
alter table public.project_source_releases add constraint project_source_releases_origin_check check(origin in('manual','automatic','relay'));
create unique index source_relay_version on public.project_source_releases(order_id,deployment_id,policy_version) where origin='relay';
create table public.project_source_relays(
 order_id uuid primary key references public.orders(id),endpoint text not null check(endpoint ~ '^https://[^/]+/api/koryx/source$'),
 enabled boolean not null default true,policy_version uuid not null default gen_random_uuid(),
 current_release_id uuid references public.project_source_releases(id),last_checked_at timestamptz,last_synced_at timestamptz,
 lease_token uuid,lease_until timestamptz,error text,excluded_count integer not null default 0,created_at timestamptz not null default now()
);
alter table public.project_source_relays enable row level security;
revoke all on public.project_source_relays from public,anon,authenticated;
grant all on public.project_source_relays to service_role;
create index source_relays_due on public.project_source_relays(last_checked_at nulls first) where enabled;

create function public.koryx_claim_source_relay(p_order uuid default null) returns setof public.project_source_relays language plpgsql security invoker set search_path=public,pg_temp as $$
declare chosen uuid;
begin
 select r.order_id into chosen from public.project_source_relays r where r.enabled and (p_order is null or r.order_id=p_order)
 and (r.lease_until is null or r.lease_until<now()) and (r.last_checked_at is null or r.last_checked_at<now()-interval '1 minute')
 order by r.last_checked_at nulls first limit 1 for update skip locked;
 if chosen is null then return;end if;
 return query update public.project_source_relays r set lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',last_checked_at=now() where r.order_id=chosen returning r.*;
end $$;
create function public.koryx_begin_source_relay(p_order uuid,p_lease uuid,p_version text,p_commit text) returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare l public.project_source_relays;rid uuid;
begin
 select * into l from public.project_source_relays where order_id=p_order and enabled and lease_token=p_lease and lease_until>now() for update;
 if not found or p_version !~ '^[a-f0-9]{64}$' or (p_commit is not null and p_commit !~ '^[a-f0-9]{40}$') then raise exception 'Source lease or revision invalid';end if;
 select id into rid from public.project_source_releases where order_id=p_order and origin='relay' and policy_version=l.policy_version and deployment_id=p_version;
 if rid is null then insert into public.project_source_releases(order_id,title,origin,deployment_id,commit_sha,policy_version)
 values(p_order,'Website version · '||to_char(now() at time zone 'UTC','YYYY-MM-DD HH24:MI'),'relay',p_version,p_commit,l.policy_version) returning id into rid;end if;
 return rid;
end $$;
create function public.koryx_add_source_relay_files(p_order uuid,p_lease uuid,p_release uuid,p_files jsonb) returns integer language plpgsql security invoker set search_path=public,pg_temp as $$
declare l public.project_source_relays;r public.project_source_releases;f jsonb;body bytea;existing public.project_source_files;
begin
 select * into l from public.project_source_relays where order_id=p_order and enabled and lease_token=p_lease and lease_until>now() for update;
 if not found then raise exception 'Source lease changed';end if;
 select * into r from public.project_source_releases where id=p_release and order_id=p_order and origin='relay' and policy_version=l.policy_version and published_at is null for update;
 if not found or jsonb_typeof(p_files)<>'array' or jsonb_array_length(p_files) not between 1 and 1000 then raise exception 'Invalid source batch';end if;
 for f in select value from jsonb_array_elements(p_files) loop
  if length(f->>'path') not between 1 and 300 or f->>'path' ~ '(^/|\\|(^|/)\.\.(/|$)|(^|/)\.env)' or f->>'sha256' !~ '^[a-f0-9]{64}$'
  or f->>'mime' not in('text/plain','image/png','image/jpeg','image/gif','image/webp','application/octet-stream') or f->>'content_base64' is null or length(f->>'content_base64')>4194304 then raise exception 'Invalid source file';end if;
  body=decode(f->>'content_base64','base64');
  if octet_length(body)<>(f->>'size')::integer or octet_length(body)>3145728 or encode(sha256(body),'hex')<>f->>'sha256' then raise exception 'Source integrity check failed';end if;
  select * into existing from public.project_source_files where release_id=r.id and path=f->>'path';
  if found then if existing.sha256<>f->>'sha256' or existing.size<>(f->>'size')::integer or existing.mime<>f->>'mime' then raise exception 'Immutable source file changed';end if;
  else insert into public.project_source_files(release_id,path,storage_path,size,sha256,mime,content_base64)
   values(r.id,f->>'path','database/'||gen_random_uuid(),octet_length(body),f->>'sha256',f->>'mime',f->>'content_base64');end if;
 end loop;
 if (select count(*) from public.project_source_files where release_id=r.id)>1000 or (select sum(size) from public.project_source_files where release_id=r.id)>31457280 then raise exception 'Source snapshot limit exceeded';end if;
 update public.project_source_relays set lease_until=now()+interval '5 minutes' where order_id=p_order;
 return jsonb_array_length(p_files);
end $$;
create function public.koryx_finish_source_relay(p_order uuid,p_lease uuid,p_release uuid,p_manifest jsonb,p_excluded integer) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare l public.project_source_relays;r public.project_source_releases;
begin
 select * into l from public.project_source_relays where order_id=p_order and enabled and lease_token=p_lease and lease_until>now() for update;if not found then return false;end if;
 select * into r from public.project_source_releases where id=p_release and order_id=p_order and origin='relay' and policy_version=l.policy_version for update;if not found then return false;end if;
 if jsonb_typeof(p_manifest)<>'array' or jsonb_array_length(p_manifest) not between 1 and 1000 or (select count(*) from public.project_source_files where release_id=r.id)<>jsonb_array_length(p_manifest)
 or exists(select 1 from jsonb_array_elements(p_manifest) m left join public.project_source_files f on f.release_id=r.id and f.path=m->>'path'
 where f.id is null or f.content_base64 is null or f.sha256<>m->>'sha256' or f.size<>(m->>'size')::integer or f.mime<>m->>'mime') then raise exception 'Source snapshot incomplete';end if;
 update public.project_source_releases set published_at=coalesce(published_at,now()) where id=r.id;
 update public.project_source_relays set current_release_id=r.id,last_synced_at=case when current_release_id is distinct from r.id then now() else last_synced_at end,
 error=null,excluded_count=greatest(0,p_excluded),lease_until=null,lease_token=null where order_id=p_order;
 return true;
end $$;
revoke all on function public.koryx_claim_source_relay(uuid),public.koryx_begin_source_relay(uuid,uuid,text,text),public.koryx_add_source_relay_files(uuid,uuid,uuid,jsonb),public.koryx_finish_source_relay(uuid,uuid,uuid,jsonb,integer) from public,anon,authenticated;
grant execute on function public.koryx_claim_source_relay(uuid),public.koryx_begin_source_relay(uuid,uuid,text,text),public.koryx_add_source_relay_files(uuid,uuid,uuid,jsonb),public.koryx_finish_source_relay(uuid,uuid,uuid,jsonb,integer) to service_role;
