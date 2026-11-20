'use client'
import {useMemo,useRef,useState} from 'react'
import {Mail,RefreshCw,Paperclip,ArrowLeft,Loader2,Reply,SquarePen,ArrowUpRight} from 'lucide-react'
import {loadInboxPage,loadInboxEmail,testInboxConnection} from '@/app/dashboard/inbox/actions'
import {contactForEmail,mergeEmails,messageKey,type InboxEmail,type InboxPage} from '@/lib/inbox/types'
import {useFounderLanguage} from './language'
import {InboxComposer} from './inbox-composer'
import {InboxAttachments} from './inbox-attachments'
import s from '@/components/workspace/workspace.module.css'

export function SupportInbox({initial,initialEmail}:{initial:InboxPage;initialEmail?:InboxEmail}){
 const {t,language}=useFounderLanguage()
 const [page,setPage]=useState<InboxPage>(()=>({...initial,emails:mergeEmails(initial.emails,initialEmail?[initialEmail]:[])}))
 const [selected,setSelected]=useState(initialEmail?contactForEmail(initialEmail):''),[search,setSearch]=useState('')
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const [compose,setCompose]=useState<InboxEmail|'new'|null>(null),[testId]=useState(()=>crypto.randomUUID())
 const [details,setDetails]=useState<Record<string,InboxEmail>>(()=>initialEmail?{[messageKey(initialEmail)]:{...initialEmail,loaded:true}}:{})
 const cache=useRef(details),[messageErrors,setMessageErrors]=useState<Record<string,string>>({})
 const sequence=useRef(0),log=useRef<HTMLDivElement>(null)
 const date=(value:string)=>new Intl.DateTimeFormat(language==='uk'?'uk-UA':'en-CA',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Vancouver'}).format(new Date(value))
 const conversations=useMemo(()=>{
  const groups=new Map<string,InboxEmail[]>()
  for(const email of page.emails){const contact=contactForEmail(email);groups.set(contact,[...(groups.get(contact)||[]),email])}
  return [...groups].map(([contact,messages])=>({contact,messages:messages.sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)),latest:messages.reduce((a,b)=>Date.parse(a.created_at)>Date.parse(b.created_at)?a:b)})).sort((a,b)=>Date.parse(b.latest.created_at)-Date.parse(a.latest.created_at))
 },[page.emails])
 const active=conversations.find(thread=>thread.contact===selected)
 const latest=active?.messages.at(-1)
 const replyTarget=latest?(details[messageKey(latest)]||latest):undefined
 const filtered=conversations.filter(thread=>(thread.contact+' '+thread.messages.map(email=>email.subject+' '+email.from).join(' ')).toLowerCase().includes(search.toLowerCase()))
 function remember(email:InboxEmail){
  cache.current={...cache.current,[messageKey(email)]:{...email,loaded:true}};setDetails(cache.current)
  setPage(current=>({...current,emails:mergeEmails(current.emails,[email])}))
 }
 async function loadMessage(meta:InboxEmail,request=sequence.current){
  const key=messageKey(meta),old=cache.current[key]
  if(old?.loaded&&!old.archive_error&&!old.attachment_error)return true
  try{
   const result=await loadInboxEmail(meta.id,meta.direction||'inbound')
   if(request!==sequence.current)return false
   if(!result.email){setMessageErrors(values=>({...values,[key]:result.error||'This email could not be opened. Please retry.'}));return false}
   remember(result.email);setMessageErrors(values=>({...values,[key]:''}))
   setSelected(current=>current===contactForEmail(meta)?contactForEmail(result.email):current)
   return true
  }catch{if(request===sequence.current)setMessageErrors(values=>({...values,[key]:'This email could not be opened. Please retry.'}));return false}
 }
 async function open(contact:string,emails=page.emails){
  const request=++sequence.current;setSelected(contact);setError('');setLoading(true)
  const messages=emails.filter(email=>contactForEmail(email)===contact).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at))
  for(const meta of messages.slice(-6)){if(request!==sequence.current)break;if(!(await loadMessage(meta,request)))break}
  if(request===sequence.current){setLoading(false);requestAnimationFrame(()=>log.current?.scrollTo({top:log.current.scrollHeight}))}
 }
 async function reload(more=false){
  setBusy(true);setError('')
  try{
   const next=await loadInboxPage(more?page.next:undefined)
   const emails=mergeEmails(more||next.error?page.emails:[],next.emails,Object.values(cache.current))
   setPage({...next,emails});if(next.error)setError(next.error)
   if(selected)await open(selected,emails)
  }catch{setError('Incoming mail could not be loaded. Please retry.')}finally{setBusy(false)}
 }
 async function test(){
  setBusy(true);setError('');setNotice('')
  try{const result=await testInboxConnection(testId);if(result.error)setError(result.error);else setNotice('TEST email sent to support@koryx.ca. Refresh the inbox shortly.')}
  catch{setError('TEST email could not be sent.')}finally{setBusy(false)}
 }
 function sent(email:InboxEmail){
  remember(email);setCompose(null);setSelected(contactForEmail(email));setNotice('Email sent from support@koryx.ca.')
  requestAnimationFrame(()=>log.current?.scrollTo({top:log.current.scrollHeight,behavior:'smooth'}))
 }
 return <div className={s.shell}>
  <header className={s.header}>
   <div><p className={s.eyebrow}>Koryx / support@koryx.ca</p><h1 className={s.title}>{t('Support inbox')}</h1><p className={s.muted}>{t('Your incoming messages, replies and files. One conversation per person.')}</p></div>
   <div className="flex gap-3 flex-wrap">
    <button type="button" className={s.primary} disabled={!page.canSend||Boolean(compose)} onClick={()=>{setNotice('');setCompose('new')}}><SquarePen size={15}/>{t('New email')}</button>
    <button type="button" className={s.secondary} disabled={busy||!page.configured||!page.canSend} onClick={test}>{t('Send inbox TEST')}</button>
    <button type="button" className={s.secondary} disabled={busy} onClick={()=>reload()}>{busy?<Loader2 size={15} className={s.spin}/>:<RefreshCw size={15}/>} {t('Refresh inbox')}</button>
   </div>
  </header>
  {notice&&<p role="status" className={s.message+' mb-5'}>{t(notice)}</p>}
  {!page.configured&&<p className={s.message+' mb-5'}>{t('Inbox is not connected yet.')}</p>}
  {!page.canSend&&<p className={s.message+' mb-5'}>{t('Sending email is not configured.')}</p>}
  {(error||page.error)&&<p className={s.message+' '+s.error+' mb-5'} role="alert">{t(error||page.error||'')}</p>}
  {compose==='new'&&<InboxComposer key="new" onClose={()=>setCompose(null)} onSent={sent}/>}
  <div className={s.inboxGrid}>
   <section className={s.panel+' '+(selected?'hidden lg:block':'')}>
    <label className={s.field+' mb-5'}><span className="sr-only">{t('Search mail')}</span><input value={search} placeholder={t('Search sender or subject…')} onChange={event=>setSearch(event.target.value)}/></label>
    <div className="space-y-2">{filtered.map(thread=><button type="button" key={thread.contact} disabled={Boolean(compose&&compose!=='new'&&contactForEmail(compose)!==thread.contact)} onClick={()=>open(thread.contact)} aria-pressed={selected===thread.contact} className="w-full rounded-lg border border-white/10 text-left p-4 hover:bg-white/5 disabled:opacity-40">
     <p className="text-xs text-white/70 truncate">{thread.contact}</p><h2 className="!text-sm mt-2 !font-medium break-words">{thread.latest.subject}</h2>
     <p className="text-[10px] text-white/40 mt-3 flex gap-2 items-center flex-wrap">{date(thread.latest.created_at)}<span>{thread.messages.length} {t('messages')}</span>{thread.messages.some(email=>email.attachments.length>0)&&<Paperclip size={12}/>}</p>
     {thread.latest.direction==='outbound'&&<p className="text-[10px] text-white/50 mt-2 flex gap-1 items-center"><ArrowUpRight size={11}/>{t('You replied')}</p>}
    </button>)}</div>
    {!filtered.length&&<div className="py-10 text-center"><Mail size={26} className="mx-auto mb-4 text-white/40"/><p className={s.muted}>{t(search?'No matching messages.':'No received support emails yet.')}</p></div>}
    {page.hasMore&&<button type="button" className={s.secondary+' mt-5 w-full'} disabled={busy} onClick={()=>reload(true)}>{t('Older messages')}</button>}
   </section>
   <section className={s.panel+' '+(selected?'':'hidden lg:block')+' !min-w-0'}>
    <button type="button" className={s.secondary+' lg:!hidden mb-5'} onClick={()=>{sequence.current++;setSelected('');setLoading(false)}}><ArrowLeft size={14}/>{t('Back to messages')}</button>
    {active?<>
     <div className="flex gap-4 items-start justify-between flex-wrap mb-5"><div className="min-w-0"><p className={s.eyebrow}>{t('Email conversation')}</p><h2 className="!text-xl [overflow-wrap:anywhere]">{active.contact}</h2><p className={s.notice+' mt-2'}>{active.messages.length} {t('messages')}</p></div>
      {replyTarget&&<button type="button" className={s.secondary} disabled={!page.canSend||Boolean(compose)||loading} onClick={()=>{setNotice('');setCompose(replyTarget)}}><Reply size={15}/>{t('Reply')}</button>}
     </div>
     {loading&&<p role="status" className={s.notice+' mb-4'}>{t('Loading conversation…')}</p>}
     <div ref={log} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1" aria-label={t('Email conversation')}>
      {active.messages.map(meta=>{
       const key=messageKey(meta),email=details[key]||meta,outbound=email.direction==='outbound'
       return <article key={key} data-message-id={email.id} data-mail-direction={outbound?'outbound':'inbound'} className={'rounded-xl border border-white/10 p-4 sm:p-5 min-w-0 '+(outbound?'ml-4 sm:ml-12 bg-white/[.04]':'mr-4 sm:mr-12 bg-white/[.01]')}>
        <div className="flex items-center justify-between gap-3 flex-wrap"><p className="text-xs text-white/65 [overflow-wrap:anywhere]">{outbound?t('You')+' · support@koryx.ca':email.from}</p><time dateTime={email.created_at} className="text-[10px] text-white/40">{date(email.created_at)}</time></div>
        <h3 className="text-sm font-medium mt-3 [overflow-wrap:anywhere]">{email.subject}</h3>
        {email.loaded?<>
         <p className="text-sm leading-7 whitespace-pre-wrap [overflow-wrap:anywhere] mt-3">{email.text||t('This email has no text content.')}</p>
         <InboxAttachments key={key} email={email}/>
         {email.archive_error&&<p role="alert" className={s.notice+' mt-3'}>{t(email.archive_error)}</p>}
         {email.attachment_error&&<p role="alert" className={s.notice+' mt-3'}>{t(email.attachment_error)}</p>}
         {(email.archive_error||email.attachment_error)&&<button type="button" className={s.secondary+' mt-3'} onClick={()=>loadMessage(meta)}>{t('Retry loading')}</button>}
        </>:<button type="button" className={s.secondary+' mt-4'} onClick={()=>loadMessage(meta)}>{t('Open message and files')}</button>}
        {messageErrors[key]&&<p role="alert" className={s.notice+' mt-3'}>{t(messageErrors[key])}</p>}
        {outbound&&<p className={s.notice+' mt-3'}>{t(email.status==='failed'?'Failed':email.status==='uncertain'?'Uncertain':email.status==='pending'?'Pending':email.status==='sending'?'Sending':'Sent')}</p>}
       </article>
      })}
     </div>
     {compose&&compose!=='new'&&<div className="mt-5"><InboxComposer key={messageKey(compose)} reply={compose} onClose={()=>setCompose(null)} onSent={sent}/></div>}
    </>:<div className="py-16 text-center"><Mail size={30} className="mx-auto text-white/30 mb-5"/><h2>{t('Select a message to read it.')}</h2><p className={s.notice+' mt-4'}>{t('Only your Founder account can access this inbox.')}</p></div>}
   </section>
  </div>
 </div>
}
