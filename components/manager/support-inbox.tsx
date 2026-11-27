'use client'
import {mailAccounts,type MailAccount} from '@/lib/inbox/accounts'
import {useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react'
import {Mail,RefreshCw,Paperclip,ArrowLeft,Loader2,Reply,SquarePen,ArrowUpRight,Pin,PinOff,Archive,ArchiveRestore,MailOpen,Bell} from 'lucide-react'
import {loadInboxPage,loadInboxEmail,saveInboxContact,saveInboxThread,loadMailBody} from '@/app/dashboard/inbox/actions'
import {mergeEmails,messageKey,type InboxEmail,type InboxPage,type InboxContactState,type InboxThreadState} from '@/lib/inbox/types'
import {mailConversations,matchesMailTab,type MailTab} from '@/lib/inbox/conversations'
import {useFounderLanguage} from './language'
import {InboxComposer} from './inbox-composer'
import {InboxAttachments} from './inbox-attachments'
import s from '@/components/workspace/workspace.module.css'
import m from './inbox.module.css'

function EmailContent({email}:{email:InboxEmail}){
 const {t}=useFounderLanguage(),[external,setExternal]=useState(false),[body,setBody]=useState({html:email.body_html||'',inlineIds:email.inline_ids||[]}),[busy,setBusy]=useState(false),[error,setError]=useState('')
 async function toggleImages(){setBusy(true);setError('');try{setBody(await loadMailBody(email.id,email.direction||'inbound',!external,email.mail_account));setExternal(!external)}catch{setError('Images could not be loaded. Please retry.')}finally{setBusy(false)}}
 return <>
  {body.html?<div className={m.body} dangerouslySetInnerHTML={{__html:body.html}}/>:<p className={m.body+' whitespace-pre-wrap'}>{email.text||t('This email has no text content.')}</p>}
  {Boolean(email.external_images?.length)&&<div className="mt-4"><button type="button" className={s.secondary} disabled={busy} onClick={toggleImages}>{t(external?'Hide external images':'Show external images')}</button>{!external&&<p className={s.notice+' mt-2'}>{t('External images are blocked until you choose to load them.')}</p>}</div>}
  {error&&<p role="alert" className={s.notice}>{t(error)}</p>}
  <InboxAttachments email={{...email,external_images:[],attachments:email.attachments.filter(file=>!body.inlineIds.includes(file.id))}}/>
  {body.inlineIds.length>0&&<details className="mt-4 text-xs text-white/50"><summary className="cursor-pointer">{t('Download inline images')} ({body.inlineIds.length})</summary><InboxAttachments email={{...email,external_images:[],attachments:email.attachments.filter(file=>body.inlineIds.includes(file.id))}}/></details>}
 </>
}

type Draft={kind:'new';to?:string}|{kind:'reply';email:InboxEmail}
const subscribe=()=>()=>{}
const tabs:[MailTab,string][]=[['inbox','Inbox'],['new','Awaiting reply'],['unread','Unread'],['pinned','Pinned'],['sent','Sent'],['archive','Archive'],['all','All mail']]
export function SupportInbox({initial,initialEmail,account='support'}:{initial:InboxPage;initialEmail?:InboxEmail;account?:MailAccount}){
 const {t,language}=useFounderLanguage()
 const browserTime=useSyncExternalStore(subscribe,()=>true,()=>false)
 const [page,setPage]=useState<InboxPage>(()=>({...initial,emails:mergeEmails(initial.emails,initialEmail?[initialEmail]:[])}))
 const [states,setStates]=useState<InboxThreadState[]>(initial.threads||[]),[contacts,setContacts]=useState<InboxContactState[]>(initial.contacts||[]),[tab,setTab]=useState<MailTab>('inbox')
 const [selected,setSelected]=useState(initialEmail?messageKey(initialEmail):''),[search,setSearch]=useState(''),[messageSearch,setMessageSearch]=useState('')
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const [compose,setCompose]=useState<Draft|null>(null),[quickVersion,setQuickVersion]=useState(0),[quickDirty,setQuickDirty]=useState(false)
 const [details,setDetails]=useState<Record<string,InboxEmail>>(()=>initialEmail?{[messageKey(initialEmail)]:{...initialEmail,loaded:true}}:{})
 const cache=useRef(details),[messageErrors,setMessageErrors]=useState<Record<string,string>>({})
 const sequence=useRef(0),log=useRef<HTMLDivElement>(null),quickBox=useRef<HTMLDivElement>(null)
 // Server and browser may have different Vancouver timezone data. Hydrate a shared UTC value first.
 const date=(value:string)=>new Intl.DateTimeFormat(language==='uk'?'uk-UA':'en-CA',{dateStyle:'medium',timeStyle:'short',timeZone:browserTime?'America/Vancouver':'UTC'}).format(new Date(value))+(browserTime?'':' UTC')
 const conversations=useMemo(()=>mailConversations(page.emails,states),[page.emails,states])
 const active=conversations.find(thread=>thread.id===selected||thread.aliases.includes(selected)||thread.messages.some(email=>messageKey(email)===selected))
 const contactState=contacts.find(state=>state.contact===active?.contact)
 const latest=active?.messages.at(-1),replyTarget=latest?(details[messageKey(latest)]||latest):undefined
 const filtered=conversations.filter(thread=>matchesMailTab(thread,tab)&&(thread.contact+' '+thread.messages.map(email=>email.subject+' '+email.from+' '+(details[messageKey(email)]?.text||'')).join(' ')).toLowerCase().includes(search.toLowerCase()))
 // Refresh metadata only while the workspace is visible. Never send a test message on load.
 useEffect(()=>{
  if(compose)return
  let cancelled=false,inFlight=false
  const refresh=async()=>{
   if(document.hidden||inFlight)return
   inFlight=true
   try{const next=await loadInboxPage(undefined,account);if(!cancelled){setPage(current=>({...next,emails:mergeEmails(current.emails,next.emails,Object.values(cache.current))}));if(next.threads)setStates(next.threads);if(next.contacts)setContacts(next.contacts)}}catch{/* Manual refresh exposes connection errors. */}finally{inFlight=false}
  }
  void refresh()
  const timer=setInterval(refresh,45000)
  return ()=>{cancelled=true;clearInterval(timer)}
 },[compose,account])
 function remember(email:InboxEmail){
  cache.current={...cache.current,[messageKey(email)]:{...email,loaded:true}};setDetails(cache.current)
  setPage(current=>({...current,emails:mergeEmails(current.emails,[email])}))
 }
 async function preference(email:InboxEmail,input:unknown){
  setSaving(true);setError('')
  try{const result=await saveInboxThread(email.id,email.direction||'inbound',input,account);if(result.error||!result.state){setError(result.error||'Mailbox preference could not be saved.');return false}setStates(values=>[...values.filter(state=>state.thread_key!==result.state!.thread_key),result.state!]);return true}
  catch{setError('Mailbox preference could not be saved.');return false}finally{setSaving(false)}
 }
 async function notify(contact:string,value:boolean){
  setSaving(true);setError('')
  try{const result=await saveInboxContact(contact,{action:'notify',value},account);if(result.error||!result.state){setError(result.error||'Mailbox preference could not be saved.');return}setContacts(values=>[...values.filter(state=>state.contact!==contact),result.state!])}
  catch{setError('Mailbox preference could not be saved.')}finally{setSaving(false)}
 }
 async function loadMessage(meta:InboxEmail,request=sequence.current){
  const key=messageKey(meta),old=cache.current[key]
  if(old?.loaded&&!old.archive_error&&!old.attachment_error)return true
  try{
   const result=await loadInboxEmail(meta.id,meta.direction||'inbound',account)
   if(request!==sequence.current)return false
   if(!result.email){setMessageErrors(values=>({...values,[key]:result.error||'This email could not be opened. Please retry.'}));return false}
   remember(result.email);setMessageErrors(values=>({...values,[key]:''}));return true
  }catch{if(request===sequence.current)setMessageErrors(values=>({...values,[key]:'This email could not be opened. Please retry.'}));return false}
 }
 async function open(threadId:string,emails=page.emails){
  const request=++sequence.current;setSelected(threadId);setMessageSearch('');setError('');setLoading(true)
  const messages=mailConversations(emails,states).find(thread=>thread.id===threadId||thread.aliases.includes(threadId)||thread.messages.some(email=>messageKey(email)===threadId))?.messages||[]
  let read=true
  for(const meta of messages.slice(-6)){if(request!==sequence.current){read=false;break}if(!(await loadMessage(meta,request))){read=false;break}}
  if(request===sequence.current){
   setLoading(false)
   const incoming=messages.filter(email=>email.direction!=='outbound').at(-1)
   if(read&&incoming)await preference(incoming,{action:'unread',value:false,through:incoming.created_at})
   requestAnimationFrame(()=>log.current?.scrollTo({top:log.current.scrollHeight}))
  }
 }
 async function reload(more=false){
  setBusy(true);setError('')
  try{
   const next=await loadInboxPage(more?page.next:undefined,account),emails=mergeEmails(page.emails,next.emails,Object.values(cache.current))
   setPage({...next,emails});if(next.threads)setStates(next.threads);if(next.contacts)setContacts(next.contacts);if(next.error)setError(next.error)
   if(selected)await open(selected,emails)
  }catch{setError('Incoming mail could not be loaded. Please retry.')}finally{setBusy(false)}
 }
 function sent(email:InboxEmail){remember(email);setCompose(null);setQuickDirty(false);setQuickVersion(value=>value+1);setSelected(email.thread_id||'mail:'+messageKey(email));setNotice('Email sent from '+mailAccounts[account].address+'.');requestAnimationFrame(()=>log.current?.scrollTo({top:log.current.scrollHeight,behavior:'smooth'}))}
 async function draftFor(kind:'reply',meta:InboxEmail){
  if(!await loadMessage(meta))return
  setNotice('');setCompose({kind,email:cache.current[messageKey(meta)]||meta})
 }
 const composer=compose&&<InboxComposer account={account} key={compose.kind+(compose.kind==='new'?compose.to||'':messageKey(compose.email))} reply={compose.kind==='reply'?compose.email:undefined} defaultTo={compose.kind==='new'?compose.to:undefined} onClose={()=>setCompose(null)} onSent={sent}/>
 return <div className={`${s.shell} ${m.mailbox}`}>
  <header className={s.header}>
   <div><p className={s.eyebrow}>Koryx / {mailAccounts[account].address}</p><h1 className={s.title}>{t(mailAccounts[account].title)}</h1><p className={s.muted}>{t('New emails start separate conversations. Replies stay with their original email.')}</p></div>
   <div className="flex gap-3 flex-wrap">
    <button type="button" className={s.primary} disabled={!page.canSend||Boolean(compose)||quickDirty} onClick={()=>{setNotice('');setCompose({kind:'new'})}}><SquarePen size={15}/>{t('New email')}</button>
    <button type="button" className={s.secondary} disabled={busy||loading||quickDirty} onClick={()=>reload()}>{busy?<Loader2 size={15} className={s.spin}/>:<RefreshCw size={15}/>} {t('Refresh inbox')}</button>
   </div>
  </header>
  {notice&&<p role="status" className={s.message+' mb-5'}>{t(notice)}</p>}
  {!page.configured&&<p className={s.message+' mb-5'}>{t('Inbox is not connected yet.')}</p>}
  {!page.canSend&&<p className={s.message+' mb-5'}>{t('Sending email is not configured.')}</p>}
  {(error||page.error)&&<p className={s.message+' '+s.error+' mb-5'} role="alert">{t(error||page.error||'')}</p>}
  <div role="tablist" aria-label={t('Mail folders')} className={m.tabs}>{tabs.map(([key,label])=><button key={key} type="button" role="tab" aria-selected={tab===key} aria-controls="mail-thread-list" onClick={()=>setTab(key)}>{t(label)}<span className={m.count}>{conversations.filter(thread=>matchesMailTab(thread,key)).length}</span></button>)}</div>
  {compose?.kind==='new'&&composer}
  <div className={s.inboxGrid}>
   <section id="mail-thread-list" aria-label={t('Conversations')} className={s.panel+' '+(selected?'hidden lg:block':'')}>
    <label className={s.field+' mb-5'}><span className="sr-only">{t('Search mail')}</span><input value={search} placeholder={t('Search sender or subject…')} onChange={event=>setSearch(event.target.value)}/></label>
    <div className={m.list}>{filtered.map(thread=><button type="button" key={thread.id} disabled={Boolean(compose)||quickDirty} onClick={()=>open(thread.id)} aria-pressed={active?.id===thread.id} className={m.thread+' '+(thread.unread?m.unread:'')}>
     <div className="flex items-center gap-2"><p className="text-xs text-white/65 truncate flex-1">{thread.contact}</p>{contacts.some(state=>state.contact===thread.contact&&state.notify_since)&&<Bell size={12} aria-label={t('Notifications enabled')}/>} {thread.state?.pinned_at&&<Pin size={13} aria-label={t('Pinned')}/>} {thread.unread&&<span className={m.dot} aria-label={t('Unread')}/>}</div>
     <h2>{thread.subject}</h2><div className={m.threadMeta}><time>{date(thread.latest.created_at)}</time><span>· {thread.messages.length}</span>{thread.messages.some(email=>email.attachments.length>0)&&<Paperclip size={12}/>}</div>
     {thread.latest.direction==='outbound'&&<p className="text-[11px] text-white/45 mt-2 flex gap-1 items-center"><ArrowUpRight size={11}/>{t('You sent the last message')}</p>}
    </button>)}</div>
    {!filtered.length&&<div className={m.empty}><Mail size={26} className="mx-auto mb-4"/><p>{t('No messages in this view.')}</p></div>}
    {page.hasMore&&<button type="button" className={s.secondary+' mt-5 w-full'} disabled={busy||Boolean(compose)||quickDirty} onClick={()=>reload(true)}>{t('Older messages')}</button>}
    <p className={m.footer}>{t('Counts and search cover loaded conversations. Load older messages for more history.')}</p>
   </section>
   <section className={s.panel+' '+(selected?'':'hidden lg:block')+' !min-w-0'}>
    <button type="button" className={s.secondary+' lg:!hidden mb-5'} disabled={Boolean(compose)||quickDirty} onClick={()=>{sequence.current++;setSelected('');setLoading(false)}}><ArrowLeft size={14}/>{t('Back to messages')}</button>
    {active?<>
     <div className="flex gap-4 items-start justify-between flex-wrap"><div className="min-w-0"><p className={s.eyebrow}>{t('Email conversation')}</p><h2 className="!text-xl [overflow-wrap:anywhere]">{active.subject}</h2><p className={s.notice+' mt-2'}>{active.contact}</p><p className={s.notice+' mt-2'}>{active.messages.length} {t('messages')}</p></div>
      <button type="button" className={s.primary} disabled={!page.canSend||Boolean(compose)||loading} onClick={()=>quickBox.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus()}><SquarePen size={15}/>{t('Write to contact')}</button>
     </div>
     <div className={m.contactActions}>
      <button type="button" className={s.secondary} disabled={saving} onClick={()=>preference(active.latest,{action:'pin',value:!active.state?.pinned_at})}>{active.state?.pinned_at?<PinOff size={14}/>:<Pin size={14}/>} {t(active.state?.pinned_at?'Unpin':'Pin')}</button>
      <button type="button" className={s.secondary} disabled={saving} onClick={()=>preference(active.latest,{action:'archive',value:!active.archived})}>{active.archived?<ArchiveRestore size={14}/>:<Archive size={14}/>} {t(active.archived?'Move to inbox':'Archive')}</button>
      <button type="button" className={s.secondary} disabled={saving} onClick={()=>preference(active.latest,{action:'unread',value:!active.unread,through:active.incoming?.created_at})}><MailOpen size={14}/>{t(active.unread?'Mark as read':'Mark as unread')}</button>
      {replyTarget&&<button type="button" className={s.secondary} disabled={!page.canSend||Boolean(compose)||quickDirty||loading} onClick={()=>draftFor('reply',replyTarget)}><Reply size={14}/>{t('Reply')}</button>}
     </div>
     <label className={m.notify}><input type="checkbox" disabled={saving||!page.notificationEmail} checked={Boolean(contactState?.notify_since)} onChange={event=>notify(active.contact,event.target.checked)}/><span>{t('Notify me about new messages from this person')}<small className="block text-white/40 mt-1">{t('Only a notification, never the message or files.')} {page.notificationEmail&&t('To')+': '+page.notificationEmail} · {t('Checked every 5 minutes.')}</small></span></label>
     <label className={s.field+' my-5'}><span className="sr-only">{t('Find in conversation')}</span><input value={messageSearch} onChange={event=>setMessageSearch(event.target.value)} placeholder={t('Find in conversation')}/></label>
     {loading&&<p role="status" className={s.notice+' mb-4'}>{t('Loading conversation…')}</p>}
     <div ref={log} className={m.conversation} aria-label={t('Email conversation')}>
      {active.messages.filter(meta=>!messageSearch||(meta.subject+' '+(details[messageKey(meta)]?.text||'')).toLowerCase().includes(messageSearch.toLowerCase())).map(meta=>{
       const key=messageKey(meta),email=details[key]||meta,outbound=email.direction==='outbound'
       return <article key={key} data-message-id={email.id} data-mail-direction={outbound?'outbound':'inbound'} className={m.message}>
        <div className="flex items-center justify-between gap-3 flex-wrap"><p className="text-xs [overflow-wrap:anywhere]"><span className="text-white/40 mr-2">{t('From')}:</span><span className="text-white/80">{email.from}</span></p><time dateTime={email.created_at} className="text-[10px] text-white/40">{date(email.created_at)}</time></div>
        <div className={m.messageSubject}><span>{t('Subject')}</span><h3>{email.subject}</h3></div><div className={m.messageDivider}/>
        {email.loaded?<><EmailContent key={key+(email.body_html||email.text||'')} email={email}/>{email.archive_error&&<p role="alert" className={s.notice+' mt-3'}>{t(email.archive_error)}</p>}{email.attachment_error&&<p role="alert" className={s.notice+' mt-3'}>{t(email.attachment_error)}</p>}{(email.archive_error||email.attachment_error)&&<button type="button" className={s.secondary+' mt-3'} onClick={()=>loadMessage(meta)}>{t('Retry loading')}</button>}</>:<button type="button" className={s.secondary+' mt-4'} onClick={()=>loadMessage(meta)}>{t('Open message and files')}</button>}
        {messageErrors[key]&&<p role="alert" className={s.notice+' mt-3'}>{t(messageErrors[key])}</p>}
        <div className={m.messageActions}><button type="button" disabled={!page.canSend||Boolean(compose)||quickDirty} onClick={()=>draftFor('reply',email)}><Reply size={13}/>{t('Reply')}</button>{outbound&&<span className="ml-auto">{t(email.status==='failed'?'Failed':email.status==='uncertain'?'Uncertain':email.status==='pending'?'Pending':email.status==='sending'?'Sending':'Sent')}</span>}</div>
       </article>
      })}
     </div>
     {compose&&compose.kind!=='new'&&composer}
     {!compose&&replyTarget&&page.canSend&&!loading&&<div ref={quickBox}><InboxComposer account={account} key={'conversation/'+active.id+'/'+quickVersion} compact reply={replyTarget} onDraftChange={setQuickDirty} onClose={()=>{setQuickDirty(false);setQuickVersion(value=>value+1)}} onSent={sent}/></div>}
     {quickDirty&&<p className={s.notice+' mt-3'}>{t('Send or clear this message before changing conversations.')}</p>}
    </>:<div className={m.empty}><Mail size={30} className="mx-auto mb-5"/><h2>{t('Select a message to read it.')}</h2><p className={s.notice+' mt-4'}>{t('Only your CEO account can access this inbox.')}</p></div>}
   </section>
  </div>
  <p className={m.footer}><span className={m.live}>{t('Inbox refreshes while this page is open.')}</span> · {t('Notifications are off unless you enable them for a person.')}</p>
 </div>
}
