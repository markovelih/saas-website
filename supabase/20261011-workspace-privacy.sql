-- Apply after publishing the workspace update. Founder reads use the server-only
-- founder client, after verifying the same immutable owner ID as the RLS policy.
-- No rows are changed. This narrows browser-readable columns, preserving RLS.
begin;
revoke select on public.orders from authenticated;
grant select(id,user_id,business_name,website_type,budget,deadline,pages,design_style,features,description,contact_email,phone,"references",status,quote_price,invoice_sent,paid,created_at) on public.orders to authenticated;
revoke select on public.profiles from authenticated;
grant select(id,full_name,email,phone_code,phone,country,created_at,role) on public.profiles to authenticated;
notify pgrst, 'reload schema';
commit;
select has_column_privilege('authenticated','public.orders','admin_notes','select') as client_can_read_internal_notes,
 has_column_privilege('authenticated','public.profiles','password','select') as client_can_read_legacy_password,
 has_column_privilege('authenticated','public.orders','description','select') as client_can_read_own_brief;
