-- These functions are invoked by existing database triggers, never by clients.
-- Keep intentional authenticated chat RPCs and their ownership checks intact.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as signature
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prorettype='trigger'::regtype
      and p.proname in ('koryx_chat_payment_changed','koryx_lock_installment_quote',
                       'koryx_preserve_settlement','koryx_validate_work_link')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated',f.signature);
  end loop;
end $$;
notify pgrst,'reload schema';
