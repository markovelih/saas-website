import 'server-only'
import {mailAccounts,type MailAccount} from './accounts'
import {z} from 'zod'
import {paymentDb} from '@/lib/payments/server'
import {queueMail,deliverMail} from '@/lib/billing/outbox'
import {brandedEmail} from '@/lib/billing/email'
import {readHeaderRows,readThreadStates} from './thread-store'
import {mailConversations} from './conversations'
import {contactForEmail,type InboxEmail,type InboxContactState,type InboxThreadState,messageKey,mailbox} from './types'
import {supportRecipient} from './server'

const owner='2f0a1860-cb7a-4104-967d-86ccc9166cdc'
export function shouldNotify(state:InboxContactState,email:InboxEmail,thread?:InboxThreadState){
 const created=Date.parse(email.created_at)
 return email.direction!=='outbound'&&Boolean(state.notify_since)&&created>Date.parse(state.notify_since!)&&created>Math.max(Date.parse(state.read_at||'1970-01-01'),Date.parse(thread?.read_at||'1970-01-01'))
}
// Only opted-in contacts are polled. No bodies/files are fetched or forwarded by this job.
export async function deliverInboxNotifications(){
 const db=paymentDb(),{data:preferences,error}=await db.from('support_inbox_contacts').select('*').eq('user_id',owner).not('notify_since','is',null)
 if(error)throw Error('Mailbox preferences unavailable.')
 if(!preferences?.length)return {enabled:0,sent:0}
 if(!process.env.RESEND_API_KEY||!process.env.RESEND_INBOUND_API_KEY)throw Error('Mail connection unavailable.')
 const {data:account,error:accountError}=await db.auth.admin.getUserById(owner)
 const recipient=z.string().email().safeParse(account.user?.email)
 if(accountError||!recipient.success||!account.user?.email_confirmed_at||mailbox(recipient.data)==='support@koryx.ca')throw Error('Notification address unavailable.')
 const accountIds=Object.keys(mailAccounts) as MailAccount[]
 const all=await Promise.all(accountIds.map(async account=>({account,index:await readHeaderRows(db,owner,account),states:await readThreadStates(db,owner,account)})))
 const readStates=new Map(all.flatMap(({account,index,states})=>mailConversations(index.map(row=>row.email),states).flatMap(thread=>thread.messages.map(email=>[account+'/'+messageKey(email),thread.state] as const))))
 const since=Math.min(...preferences.map(p=>Date.parse(p.notify_since!))),contacts=new Map(preferences.map(p=>[(p.mail_account||'support')+'/'+p.contact,p]))
 let after:string|undefined,sent=0,checked=0,complete=false
 for(let page=0;page<10;page++){
  const response=await fetch('https://api.resend.com/emails/receiving?limit=100'+(after?'&after='+encodeURIComponent(after):''),{headers:{Authorization:'Bearer '+process.env.RESEND_INBOUND_API_KEY},cache:'no-store',signal:AbortSignal.timeout(15000)})
  if(!response.ok)throw Error('Incoming mail unavailable.')
  const result=await response.json()
  if(!Array.isArray(result.data))throw Error('Invalid incoming mail response.')
  for(const item of result.data){
   if(!z.string().uuid().safeParse(item.id).success)continue
   for(const account of accountIds){
   if(!supportRecipient(item,account))continue
   const email={...item,mail_account:account,direction:'inbound'} as InboxEmail,state=contacts.get(account+'/'+contactForEmail(email))
   const thread=readStates.get(account+'/'+messageKey(email))
   if(!state||!shouldNotify(state,email,thread))continue
   // Re-read consent immediately before queueing/delivery. Opting out takes effect on the next check.
   const current=await db.from('support_inbox_contacts').select('*').eq('user_id',owner).eq('contact',state.contact).eq('mail_account',account).single()
   if(!current.data||!shouldNotify(current.data,email,thread))continue
   const job=await queueMail(db,{dedupe_key:`inbox-notification/${owner}/${account==='ceo'?'ceo/':''}${email.id}`,user_id:owner,to_address:recipient.data,from_address:'support@koryx.ca',subject:'Koryx — у вас є нове повідомлення',html:brandedEmail('<h1>У вас є нове повідомлення в Koryx</h1><p>Ви ввімкнули сповіщення для цього контакту. Відкрийте пошту компанії, щоб прочитати лист і переглянути вкладення.</p><p><a href="https://koryx.ca'+mailAccounts[account].href+'?email='+email.id+'">Відкрити пошту Koryx</a></p><p>Вимкнути сповіщення можна в розмові з цим контактом.</p>'),snapshot:null,documents:'none'})
   checked++
   const alreadySent=job.status==='sent',delivered=await deliverMail(db,job)
   if(delivered.error)throw Error('Mailbox notification delivery needs a retry.')
   if(!alreadySent)sent++
   }
  }
  if(!result.has_more||result.data.some((email:InboxEmail)=>Date.parse(email.created_at)<=since)){complete=true;break}
  after=result.data.at(-1)?.id
  if(!after)throw Error('Incoming mail cursor unavailable.')
  // Respect Resend rate limits while walking an unusually busy inbox.
  await new Promise(resolve=>setTimeout(resolve,600))
 }
 return {enabled:preferences.length,sent,checked,complete}
}
