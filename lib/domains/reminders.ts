import 'server-only'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import {brandedEmail,escapeHtml} from '@/lib/billing/email'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {formatAmount} from '@/lib/billing/pdf'
export function reminderDates(due:string){const end=new Date(due+'T00:00:00Z'),month=new Date(end);month.setUTCDate(1);month.setUTCMonth(month.getUTCMonth()-1);const last=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();month.setUTCDate(Math.min(end.getUTCDate(),last));return {month:month.toISOString().slice(0,10),three_days:new Date(+end-3*86400000).toISOString().slice(0,10),one_day:new Date(+end-86400000).toISOString().slice(0,10)}}
export async function runReminders(db:SupabaseClient<Database>,today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Vancouver'})){
 const {data:domains,error}=await db.from('order_domains').select('*').not('renewal_date','is',null);if(error)throw new Error('Domains could not be loaded');let sent=0,failed=0
 for(const d of domains||[]){if(!d.renewal_date)continue;const dates=reminderDates(d.renewal_date);const stage=Object.entries(dates).find(([,date])=>date===today)?.[0];if(!stage)continue;const {data:paid}=await db.from('domain_renewals').select('id,status').eq('domain_id',d.id).eq('due_date',d.renewal_date).maybeSingle();if(paid?.status==='paid')continue
  const {data:auth}=await db.auth.admin.getUserById(d.user_id);if(!auth.user?.email)continue;const labels:Record<string,string>={month:'in one month',three_days:'in three days',one_day:'in 24 hours'}
  const html=brandedEmail(`<h1 style="font-size:28px;margin-top:32px">Your domain renewal is coming up.</h1><p><b>${escapeHtml(d.hostname)}</b> renews ${labels[stage]}.</p><p>Renewal date: ${d.renewal_date}<br/>Annual renewal: <b>${formatAmount(Number(d.retail_price))} CAD</b></p><p style="color:#666">Keep your website connected by arranging the renewal before its due date.</p><a href="https://koryx.ca/dashboard/renewals" style="display:inline-block;background:#111;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none">Renew your domain →</a>`)
  try{const job=await queueMail(db,{dedupe_key:`reminder/${d.id}/${d.renewal_date}/${stage}`,user_id:d.user_id,to_address:auth.user.email,from_address:'reminder@koryx.ca',subject:`${d.hostname} — renewal ${labels[stage]}`,html,snapshot:null,documents:'none'});const result=await deliverMail(db,job);if(result.error)failed++;else sent++}catch{failed++}
 }
 return {sent,failed}
}
