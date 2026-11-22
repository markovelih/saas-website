import 'server-only'
import {z} from 'zod'
import {founderClient} from '@/lib/supabase/admin'
import {mailbox,type InboxContactState} from './types'
export async function readContactStates(){
 const {supabase,user}=await founderClient()
 const {data,error}=await supabase.from('support_inbox_contacts').select('*').eq('user_id',user.id).order('contact').limit(5000)
 if(error)throw Error('Mailbox preferences could not be loaded.')
 return {contacts:data||[],notificationEmail:user.email||''}
}
const change=z.discriminatedUnion('action',[
 z.object({action:z.literal('pin'),value:z.boolean()}),z.object({action:z.literal('archive'),value:z.boolean()}),
 z.object({action:z.literal('unread'),value:z.boolean(),through:z.string().datetime().optional()}),z.object({action:z.literal('notify'),value:z.boolean()}),
])
export async function updateContactState(contact:string,input:unknown):Promise<{state?:InboxContactState;error?:string}>{
 const {supabase,user}=await founderClient()
 const parsed=change.safeParse(input),address=z.string().email().max(254).safeParse(mailbox(contact))
 if(!parsed.success||!address.success||address.data==='support@koryx.ca')return {error:'Invalid mailbox preference.'}
 const now=new Date().toISOString(),patch:Partial<InboxContactState>={updated_at:now},value=parsed.data
 if(value.action==='pin')patch.pinned_at=value.value?now:null
 if(value.action==='archive')patch.archived_at=value.value?now:null
 if(value.action==='notify'){
  if(value.value&&!user.email)return {error:'Your account needs a verified notification address.'}
  patch.notify_since=value.value?now:null
 }
 if(value.action==='unread'){
  patch.marked_unread=value.value
  if(!value.value){if(value.through&&Date.parse(value.through)>Date.now()+300000)return {error:'Invalid read date.'};patch.read_at=value.through||now}
 }
 // Insert once, then patch only the selected fields. Upserting a partial row resets other preferences.
 const inserted=await supabase.from('support_inbox_contacts').upsert({user_id:user.id,contact:address.data},{onConflict:'user_id,contact',ignoreDuplicates:true})
 if(inserted.error)return {error:'Mailbox preference could not be saved.'}
 const {data,error}=await supabase.from('support_inbox_contacts').update(patch).eq('user_id',user.id).eq('contact',address.data).select('*').single()
 return error||!data?{error:'Mailbox preference could not be saved.'}:{state:data}
}
