-- Preserve per-service discounts when managed domains are added or repriced.
begin;
create or replace function public.koryx_save_domain(p_order_id uuid,p_domain jsonb)
returns public.order_domains language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;d public.order_domains;old public.order_domains;items jsonb;item jsonb;label text;subtotal numeric;service_discount numeric;net_subtotal numeric;discount numeric;total numeric;v_delivery jsonb;has_item boolean:=false;new_date date;retail numeric;cost numeric;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Project not found';end if;
 cost=(p_domain->>'cost_price')::numeric;retail=ceil(cost*150)/100;new_date=nullif(p_domain->>'renewal_date','')::date;
 if cost is null or cost<0 or cost>1000000 then raise exception 'Invalid price';end if;
 if p_domain->>'id' is not null then
  select * into old from public.order_domains where id=(p_domain->>'id')::uuid for update;
  if not found or old.order_id<>o.id or old.hostname<>p_domain->>'hostname' then raise exception 'Domain mismatch';end if;
  if exists(select 1 from public.domain_renewals where domain_id=old.id and status='submitted' and (due_date is distinct from new_date or amount<>retail)) then raise exception 'Confirm the submitted renewal first';end if;
  update public.order_domains set status=p_domain->>'status',renewal_date=new_date,cost_price=cost,retail_price=retail,notes=coalesce(p_domain->>'notes','') where id=old.id returning * into d;
 else
  insert into public.order_domains(order_id,user_id,hostname,status,renewal_date,cost_price,retail_price,notes) values(o.id,o.user_id,p_domain->>'hostname',p_domain->>'status',new_date,cost,retail,coalesce(p_domain->>'notes','')) returning * into d;
 end if;
 update public.domain_renewals set status='cancelled' where domain_id=d.id and due_date is distinct from new_date and status='due';
 if new_date is not null then
  insert into public.domain_renewals(domain_id,order_id,user_id,due_date,amount) values(d.id,o.id,o.user_id,new_date,retail) on conflict(domain_id,due_date) do update set status=case when domain_renewals.status='cancelled' then 'due' else domain_renewals.status end,amount=case when domain_renewals.status in('due','cancelled') then excluded.amount else domain_renewals.amount end,snapshot=case when domain_renewals.status in('due','cancelled') and domain_renewals.amount<>excluded.amount then null else domain_renewals.snapshot end;
 end if;
 if not o.paid then
  v_delivery=coalesce(o.delivery,'{}'::jsonb);items=coalesce(v_delivery->'billing_items','[]'::jsonb);
  if jsonb_array_length(items)=0 and o.quote_price is not null then items=jsonb_build_array(jsonb_build_object('description','Website development','quantity',1,'unit_price',o.quote_price));end if;
  label='Domain — '||d.hostname||' · 1 year';
  for item in select value from jsonb_array_elements(items) loop if item->>'description'=label then has_item=true;end if;end loop;
  if has_item then select jsonb_agg(case when value->>'description'=label then value||jsonb_build_object('description',label,'quantity',1,'unit_price',retail) else value end) into items from jsonb_array_elements(items);
  else if jsonb_array_length(items)>=15 then raise exception 'Maximum 15 services';end if;items=items||jsonb_build_array(jsonb_build_object('description',label,'quantity',1,'unit_price',retail));end if;
  select coalesce(sum((value->>'quantity')::numeric*(value->>'unit_price')::numeric),0) into subtotal from jsonb_array_elements(items);
  select coalesce(sum(least((value->>'quantity')::numeric*(value->>'unit_price')::numeric,greatest(0,case when value->'discount'->>'type'='percent' then round((value->>'quantity')::numeric*(value->>'unit_price')::numeric*coalesce((value->'discount'->>'value')::numeric,0)/100,2) else coalesce((value->'discount'->>'value')::numeric,0) end))),0) into service_discount from jsonb_array_elements(items);
  net_subtotal=subtotal-service_discount;
  discount=case when v_delivery->'discount'->>'type'='percent' then round(net_subtotal*coalesce((v_delivery->'discount'->>'value')::numeric,0)/100,2) else coalesce((v_delivery->'discount'->>'value')::numeric,0) end;total=net_subtotal-least(net_subtotal,greatest(discount,0));
  if subtotal>1000000 then raise exception 'Maximum total exceeded';end if;
  update public.orders set delivery=jsonb_set(v_delivery-'notes','{billing_items}',items),quote_price=total where id=o.id;
 end if;return d;
end $$;
revoke all on function public.koryx_save_domain(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.koryx_save_domain(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
