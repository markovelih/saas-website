import 'server-only'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import {brandedEmail,escapeHtml} from '@/lib/billing/email'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {formatAmount} from '@/lib/billing/pdf'
export function reminderDates(due:string){const end=new Date(due+'T00:00:00Z'),month=new Date(end);month.setUTCDate(1);month.setUTCMonth(month.getUTCMonth()-1);const last=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();month.setUTCDate(Math.min(end.getUTCDate(),last));return {month:month.toISOString().slice(0,10),three_days:new Date(+end-3*86400000).toISOString().slice(0,10),one_day:new Date(+end-86400000).toISOString().slice(0,10)}}
export async function runReminders(db:SupabaseClient<Database>,today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Vancouver'})){
 const {data:domains,error}=await db.from('order_domains').select('*').not('renewal_date','is',null);if(error)throw new Error('Domains could not be loaded');let sent=0,failed=0
 for(const d of domains||[]){if(!d.renewal_date)continue;const {data:auto}=await db.from('care_services').select('id').eq('domain_id',d.id).eq('cancel_at_period_end',false).in('status',['active','past_due']).not('subscription_id','is',null).maybeSingle();if(auto)continue;const dates=reminderDates(d.renewal_date);const stage=Object.entries(dates).find(([,date])=>date===today)?.[0];if(!stage)continue;const {data:paid}=await db.from('domain_renewals').select('id,status').eq('domain_id',d.id).eq('due_date',d.renewal_date).maybeSingle();if(paid?.status==='paid')continue
  const {data:auth}=await db.auth.admin.getUserById(d.user_id);if(!auth.user?.email)continue;const labels:Record<string,string>={month:'in one month',three_days:'in three days',one_day:'in 24 hours'}
  const html=brandedEmail(`<h1 style="font-size:28px;margin-top:32px">Your domain renewal is coming up.</h1><p><b>${escapeHtml(d.hostname)}</b> renews ${labels[stage]}.</p><p>Renewal date: ${d.renewal_date}<br/>Annual renewal: <b>${formatAmount(Number(d.retail_price))} CAD</b></p><p style="color:#666">Keep your website connected by arranging the renewal before its due date.</p><a href="https://koryx.ca/dashboard/renewals" style="display:inline-block;background:#111;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none">Renew your domain →</a>`)
  try{const job=await queueMail(db,{dedupe_key:`reminder/${d.id}/${d.renewal_date}/${stage}`,user_id:d.user_id,to_address:auth.user.email,from_address:'reminder@koryx.ca',subject:`${d.hostname} — renewal ${labels[stage]}`,html,snapshot:null,documents:'none'});const result=await deliverMail(db,job);if(result.error)failed++;else sent++}catch{failed++}
 }
 return {sent,failed}
}

// Exact 30-day notice for automatic annual services, including hosting.
// This is a renewal warning, not an instruction to pay a second time manually.
export async function runAutomaticReminders(db:SupabaseClient<Database>,today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Vancouver'})){
 const {data:services,error}=await db.from('care_services').select('*').eq('cancel_at_period_end',false).in('status',['active','past_due']).not('subscription_id','is',null);if(error)throw new Error('Automatic renewals could not be loaded');let sent=0,failed=0
 for(const c of services||[]){const days=Math.round((Date.parse(c.next_date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);if(![30,3,1].includes(days))continue;const {data:auth}=await db.auth.admin.getUserById(c.user_id);if(!auth.user?.email)continue
  const html=brandedEmail(`<h1 style="font-size:28px;margin-top:32px">Your automatic renewal is approaching.</h1><p><b>${escapeHtml(c.name)}</b> is scheduled to renew on <b>${c.next_date}</b>.</p><p>Amount: <b>${formatAmount(c.amount_cents/100)} CAD</b> every ${c.interval==='year'?'year':'month'}.</p><p>If you do not cancel, the service will renew and your authorized payment method will be charged. Stop future automatic charges without a cancellation fee in your Koryx renewal dashboard. For cancellation after a renewal charge, contact support@koryx.ca; applicable statutory refund rights are preserved.</p><a href="https://koryx.ca/dashboard/renewals" style="display:inline-block;background:#111;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none">Manage or cancel renewal →</a><p style="font-size:12px;color:#666">Payment collection and actual domain registration or hosting provision are managed separately. <a href="https://koryx.ca/refunds">Cancellation & refund policy</a>.</p>`)
  try{const job=await queueMail(db,{dedupe_key:`automatic-reminder/${c.id}/${c.next_date}/${days}`,user_id:c.user_id,to_address:auth.user.email,from_address:'reminder@koryx.ca',subject:`${c.name} — automatic renewal ${c.next_date}`,html,snapshot:null,documents:'none'});const result=await deliverMail(db,job);if(result.error)failed++;else sent++}catch{failed++}
 }
 return {automatic_sent:sent,automatic_failed:failed}
}
