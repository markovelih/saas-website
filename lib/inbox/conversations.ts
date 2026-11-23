import {resolveMailThreads} from './threading'
import {contactForEmail,type InboxEmail,type InboxThreadState} from './types'
export type MailTab='inbox'|'new'|'unread'|'pinned'|'sent'|'archive'|'all'
export function mailConversations(emails:InboxEmail[],states:InboxThreadState[]){
 const preferences=new Map(states.map(state=>[state.thread_key,state]))
 return resolveMailThreads(emails).map(({id,aliases,messages})=>{
  const latest=messages.at(-1)!,contact=contactForEmail(latest),root=messages[0]
  const state=preferences.get(id)||aliases.map(key=>preferences.get(key)).filter((state):state is InboxThreadState=>Boolean(state)).sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at))[0]
  const incoming=messages.filter(email=>email.direction!=='outbound').at(-1),outgoing=messages.filter(email=>email.direction==='outbound').at(-1)
  const archived=Boolean(state?.archived_at&&Date.parse(state.archived_at)>=Date.parse(latest.created_at))
  const unread=Boolean(state?.marked_unread||incoming&&Date.parse(incoming.created_at)>Date.parse(state?.read_at||'1970-01-01'))
  const waiting=Boolean(incoming&&(!outgoing||Date.parse(incoming.created_at)>Date.parse(outgoing.created_at)))
  return {id,aliases,contact,subject:root.subject,messages,latest,state,archived,unread,waiting,incoming,outgoing}
 }).sort((a,b)=>Number(Boolean(b.state?.pinned_at))-Number(Boolean(a.state?.pinned_at))||Date.parse(b.latest.created_at)-Date.parse(a.latest.created_at))
}
export function matchesMailTab(thread:ReturnType<typeof mailConversations>[number],tab:MailTab){
 return tab==='all'||tab==='archive'&&thread.archived||tab==='pinned'&&Boolean(thread.state?.pinned_at)||tab==='sent'&&Boolean(thread.outgoing)||!thread.archived&&(tab==='inbox'||tab==='unread'&&thread.unread||tab==='new'&&thread.waiting)
}
