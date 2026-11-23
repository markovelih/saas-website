import {contactForEmail,type InboxEmail,type InboxContactState} from './types'
export type MailTab='inbox'|'new'|'unread'|'pinned'|'sent'|'archive'|'all'
export function mailConversations(emails:InboxEmail[],states:InboxContactState[]){
 const groups=new Map<string,InboxEmail[]>(),preferences=new Map(states.map(state=>[state.contact,state]))
 for(const email of emails){const contact=contactForEmail(email);groups.set(contact,[...(groups.get(contact)||[]),email])}
 return [...groups].map(([contact,items])=>{
  const messages=items.sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)),latest=messages.at(-1)!,state=preferences.get(contact)
  const incoming=messages.filter(email=>email.direction!=='outbound').at(-1),outgoing=messages.filter(email=>email.direction==='outbound').at(-1)
  const archived=Boolean(state?.archived_at&&Date.parse(state.archived_at)>=Date.parse(latest.created_at))
  const unread=Boolean(state?.marked_unread||incoming&&Date.parse(incoming.created_at)>Date.parse(state?.read_at||'1970-01-01'))
  const waiting=Boolean(incoming&&(!outgoing||Date.parse(incoming.created_at)>Date.parse(outgoing.created_at)))
  return {contact,messages,latest,state,archived,unread,waiting,incoming,outgoing}
 }).sort((a,b)=>Number(Boolean(b.state?.pinned_at))-Number(Boolean(a.state?.pinned_at))||Date.parse(b.latest.created_at)-Date.parse(a.latest.created_at))
}
export function matchesMailTab(thread:ReturnType<typeof mailConversations>[number],tab:MailTab){
 return tab==='all'||tab==='archive'&&thread.archived||tab==='pinned'&&Boolean(thread.state?.pinned_at)||tab==='sent'&&Boolean(thread.outgoing)||!thread.archived&&(tab==='inbox'||tab==='unread'&&thread.unread||tab==='new'&&thread.waiting)
}
