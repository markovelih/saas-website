import 'server-only'
import {mailAccount,type MailAccount} from './accounts'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import {founderClient} from '@/lib/supabase/admin'
import {z} from 'zod'
import {contactForEmail,messageKey,type InboxEmail,type InboxThreadState,type InboxContactState,type InboxHeaderRow} from './types'
import {resolveMailThreads,threadMetadata,withThreadIds} from './threading'
type Db=SupabaseClient<Database>
export async function readHeaderRows(db:Db,userId:string,account:MailAccount='support'){
 const rows:InboxHeaderRow[]=[]
 for(let offset=0;;offset+=1000){const {data,error}=await db.from('support_mail_headers').select('*').eq('user_id',userId).eq('mail_account',account).order('email_key').range(offset,offset+999);if(error)throw Error('Email conversation links could not be loaded.');rows.push(...data||[]);if(!data||data.length<1000)break}
 return rows
}
export async function saveHeaderRow(db:Db,userId:string,email:InboxEmail,checked=true){
 const result=await db.from('support_mail_headers').upsert({user_id:userId,mail_account:email.mail_account||'support',email_key:messageKey(email),email:threadMetadata(email),checked,updated_at:new Date().toISOString()},{onConflict:'user_id,mail_account,email_key'})
 if(result.error)throw Error('Email conversation links could not be saved.')
}
export async function readThreadStates(db:Db,userId:string,account:MailAccount='support'){
 const states:InboxThreadState[]=[]
 for(let offset=0;;offset+=1000){const {data,error}=await db.from('support_inbox_threads').select('*').eq('user_id',userId).eq('mail_account',account).order('thread_key').range(offset,offset+999);if(error)throw Error('Conversation preferences could not be loaded.');states.push(...data||[]);if(!data||data.length<1000)break}
 return states
}
export async function ensureThreadStates(db:Db,userId:string,emails:InboxEmail[],contacts:InboxContactState[],account:MailAccount='support'){
 const states=await readThreadStates(db,userId,account),byKey=new Map(states.map(state=>[state.thread_key,state])),legacy=new Map(contacts.map(state=>[state.contact,state]))
 for(const thread of resolveMailThreads(emails)){
  const old=thread.aliases.map(key=>byKey.get(key)).filter((state):state is InboxThreadState=>Boolean(state)).sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at))[0]
  const current=byKey.get(thread.id)
  if(current){
   if(old&&Date.parse(old.updated_at)>Date.parse(current.updated_at)){
    const {data,error}=await db.from('support_inbox_threads').update({pinned_at:old.pinned_at,archived_at:old.archived_at,read_at:old.read_at,marked_unread:old.marked_unread,updated_at:old.updated_at}).eq('user_id',userId).eq('mail_account',account).eq('thread_key',thread.id).eq('updated_at',current.updated_at).select('*').maybeSingle()
    if(error)throw Error('Conversation preferences could not be saved.');if(data)byKey.set(thread.id,data)
   }
   continue
  }
  const root=thread.messages[0],contact=legacy.get(contactForEmail(root))
  const inherited=old||(contact&&Date.parse(root.created_at)<=Date.parse(contact.thread_state_cutover_at||contact.updated_at)?contact:undefined)
  const row:InboxThreadState={user_id:userId,mail_account:account,thread_key:thread.id,pinned_at:inherited?.pinned_at||null,archived_at:inherited?.archived_at||null,read_at:inherited?.read_at||null,marked_unread:inherited?.marked_unread||false,updated_at:inherited?.updated_at||root.created_at}
  const inserted=await db.from('support_inbox_threads').upsert(row,{onConflict:'user_id,mail_account,thread_key',ignoreDuplicates:true});if(inserted.error)throw Error('Conversation preferences could not be saved.')
  byKey.set(thread.id,row)
 }
 return [...byKey.values()]
}
const mutation=z.discriminatedUnion('action',[z.object({action:z.literal('pin'),value:z.boolean()}),z.object({action:z.literal('archive'),value:z.boolean()}),z.object({action:z.literal('unread'),value:z.boolean(),through:z.string().datetime().optional()})])
export async function updateThreadState(emailId:string,direction:'inbound'|'outbound',input:unknown,rawAccount:unknown='support'){
 const account=mailAccount(rawAccount)
 const {supabase,user}=await founderClient(),parsed=mutation.safeParse(input)
 if(!parsed.success||!z.string().uuid().safeParse(emailId).success||!z.enum(['inbound','outbound']).safeParse(direction).success)return {error:'Invalid conversation preference.'}
 const index=await readHeaderRows(supabase,user.id,account),meta=index.find(row=>row.email_key===messageKey({id:emailId,direction}))
 if(!meta)return {error:'Open this conversation before changing its preferences.'}
 const email=withThreadIds([meta.email],index.map(row=>row.email))[0],now=new Date().toISOString(),patch:Partial<InboxThreadState>={updated_at:now},value=parsed.data
 if(value.action==='pin')patch.pinned_at=value.value?now:null
 if(value.action==='archive')patch.archived_at=value.value?now:null
 if(value.action==='unread'){patch.marked_unread=value.value;if(!value.value){if(value.through&&Date.parse(value.through)>Date.now()+300000)return {error:'Invalid read date.'};patch.read_at=value.through||now}}
 const inserted=await supabase.from('support_inbox_threads').upsert({user_id:user.id,mail_account:account,thread_key:email.thread_id!},{onConflict:'user_id,mail_account,thread_key',ignoreDuplicates:true})
 if(inserted.error)return {error:'Conversation preference could not be saved.'}
 const {data,error}=await supabase.from('support_inbox_threads').update(patch).eq('user_id',user.id).eq('mail_account',account).eq('thread_key',email.thread_id!).select('*').single()
 return error||!data?{error:'Conversation preference could not be saved.'}:{state:data}
}
