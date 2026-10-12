import 'server-only'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import type {MailJob} from './mail'
import {sendMail} from './mail'
export async function queueMail(db:SupabaseClient<Database>,input:Omit<MailJob,'id'|'created_at'|'status'|'email_id'|'error'|'attempted_at'>){
 const {data,error}=await db.from('billing_mail').insert({...input,status:'pending',email_id:null,error:null,attempted_at:null}).select('*').single()
 if(error?.code==='23505'){const {data:old}=await db.from('billing_mail').select('*').eq('dedupe_key',input.dedupe_key).single();if(old)return old}
 if(error||!data)throw new Error('Email could not be queued.');return data
}
export async function deliverMail(db:SupabaseClient<Database>,job:MailJob){
 if(job.status==='sent')return {success:true,emailId:job.email_id}
 if(job.attempted_at&&Date.now()-Date.parse(job.attempted_at)>23*3600000)return {error:'Check Resend: the safe retry window has elapsed.'}
 if(job.status==='sending'&&job.attempted_at&&Date.now()-Date.parse(job.attempted_at)<60000)return {error:'Email is already being sent.'}
 const {data:claimed,error}=await db.from('billing_mail').update({status:'sending',attempted_at:job.attempted_at||new Date().toISOString(),error:null}).eq('id',job.id).eq('status',job.status).select('id').maybeSingle();if(error||!claimed)return {error:'Another request is sending this email. Refresh shortly.'}
 let result;try{result=await sendMail(job,'koryx-mail/'+job.id)}catch{result={error:'Documents could not be generated.',uncertain:false}}
 const saved=await db.from('billing_mail').update(result.error?{status:result.uncertain?'uncertain':'failed',error:result.error}:{status:'sent',email_id:result.id,error:null}).eq('id',job.id)
 if(result.error)return {error:result.error};if(saved.error)return {error:'Email accepted; refresh and check Resend before retrying.'};return {success:true,emailId:result.id}
}
