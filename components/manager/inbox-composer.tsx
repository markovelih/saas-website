'use client'
import {useEffect,useRef,useState,type FormEvent} from 'react'
import {FileText,Loader2,Paperclip,Send,X} from 'lucide-react'
import {MAX_MAIL_BYTES,MAX_MAIL_FILES,isPreviewImage,type InboxEmail} from '@/lib/inbox/types'
import {useFounderLanguage} from './language'
import s from '@/components/workspace/workspace.module.css'

type Upload={id:string;file:File}
function DraftFile({upload,disabled,onRemove}:{upload:Upload;disabled:boolean;onRemove:()=>void}){
 const {t}=useFounderLanguage()
 const [preview,setPreview]=useState('')
 useEffect(()=>{
  if(!isPreviewImage(upload.file.type))return
  const reader=new FileReader()
  reader.onload=()=>setPreview(typeof reader.result==='string'?reader.result:'')
  reader.readAsDataURL(upload.file)
  return ()=>{reader.onload=null;if(reader.readyState===FileReader.LOADING)reader.abort()}
 },[upload.file])
 return <li className="flex items-center gap-3 rounded-lg border border-white/10 p-3 min-w-0">
  {preview?<img src={preview} alt="" className="h-12 w-12 rounded object-cover shrink-0"/>:<FileText size={22} className="shrink-0 text-white/50"/>}
  <span className="min-w-0 flex-1 text-xs [overflow-wrap:anywhere]">{upload.file.name}<small className="block text-white/40 mt-1">{Math.ceil(upload.file.size/1024)} KB</small></span>
  <button type="button" disabled={disabled} onClick={onRemove} aria-label={t('Remove attachment')+': '+upload.file.name} className="p-2"><X size={16}/></button>
 </li>
}

export function InboxComposer({reply,onClose,onSent}:{reply?:InboxEmail;onClose:()=>void;onSent:(email:InboxEmail)=>void}){
 const {t}=useFounderLanguage()
 const target=reply?.direction==='outbound'?reply.to[0]||'':reply?.reply_to?.[0]||reply?.from||''
 const [to,setTo]=useState(target.match(/<([^<>]+)>/)?.[1]||target)
 const [subject,setSubject]=useState(reply?(/^re:/i.test(reply.subject)?reply.subject:'Re: '+reply.subject).slice(0,200):'')
 const [text,setText]=useState(''),[uploads,setUploads]=useState<Upload[]>([])
 const [error,setError]=useState(''),[sending,setSending]=useState(false),[uncertain,setUncertain]=useState(false)
 const [draft]=useState(()=>({id:crypto.randomUUID(),startedAt:Date.now()}))
 const first=useRef<HTMLInputElement>(null),body=useRef<HTMLTextAreaElement>(null),picker=useRef<HTMLInputElement>(null),inFlight=useRef(false)
 const locked=sending||uncertain
 useEffect(()=>{if(reply)body.current?.focus();else first.current?.focus()},[reply])
 function addFiles(files:FileList|null){
  if(!files)return
  const next=[...uploads,...Array.from(files).map(file=>({file,id:crypto.randomUUID()}))]
  if(next.length>MAX_MAIL_FILES||next.reduce((size,value)=>size+value.file.size,0)>MAX_MAIL_BYTES){setError('Choose up to 10 files, 4 MB in total.');return}
  if(next.some(value=>!value.file.size)){setError('Empty files cannot be attached.');return}
  setError('');setUploads(next)
 }
 async function send(event:FormEvent){
  event.preventDefault();if(inFlight.current)return
  if(!text.trim()&&!uploads.length){setError('Write a message or attach a file.');return}
  inFlight.current=true;setSending(true);setError('')
  const form=new FormData()
  for(const [key,value] of Object.entries({to,subject,text,requestId:draft.id,startedAt:String(draft.startedAt),replyId:reply?.id||'',replyDirection:reply?.direction||'inbound'}))form.set(key,value)
  for(const upload of uploads)form.append('files',upload.file)
  try{
   const response=await fetch('/api/inbox/send',{method:'POST',body:form})
   const result=await response.json().catch(()=>({error:response.status===413?'Choose up to 10 files, 4 MB in total.':'Delivery was not confirmed. Retry this same message.',uncertain:response.status!==413}))
   if(result.success&&result.email){onSent(result.email);return}
   setError(result.error||'Email could not be sent. Please retry.');setUncertain(Boolean(result.uncertain))
  }catch{setError('Delivery was not confirmed. Retry this same message.');setUncertain(true)}
  finally{inFlight.current=false;setSending(false)}
 }
 return <section className={`${s.panel} mb-6`} aria-label={t(reply?'Reply to email':'New email')}>
  <div className="flex justify-between items-center gap-3 mb-5"><h2>{t(reply?'Reply to email':'New email')}</h2><button type="button" disabled={sending} onClick={onClose} className={s.secondary}><X size={15}/>{t('Close draft')}</button></div>
  <p className={`${s.notice} mb-5`}>{t('From')}: Koryx &lt;support@koryx.ca&gt;</p>
  <form onSubmit={send}>
   <div className="grid gap-4 sm:grid-cols-2"><label className={s.field}>{t('Recipient email')}<input ref={first} type="email" autoComplete="email" required maxLength={254} readOnly={Boolean(reply)||locked} value={to} onChange={event=>setTo(event.target.value)} placeholder="name@example.com"/></label>
    <label className={s.field}>{t('Subject')}<input required maxLength={200} readOnly={Boolean(reply)||locked} value={subject} onChange={event=>setSubject(event.target.value)}/></label></div>
   <label className={`${s.field} mt-4`}>{t('Message')}<textarea ref={body} rows={7} maxLength={20000} readOnly={locked} value={text} onChange={event=>setText(event.target.value)} placeholder={t('Write a message…')}/></label>
   {uploads.length>0&&<ul className="grid sm:grid-cols-2 gap-3 mt-4">{uploads.map(upload=><DraftFile key={upload.id} upload={upload} disabled={locked} onRemove={()=>setUploads(values=>values.filter(value=>value.id!==upload.id))}/>)}</ul>}
   <div className="flex flex-wrap items-center gap-3 mt-5"><input ref={picker} type="file" multiple className="hidden" tabIndex={-1} onChange={event=>{addFiles(event.target.files);event.target.value=''}}/>
    <button type="button" className={s.secondary} disabled={locked} onClick={()=>picker.current?.click()}><Paperclip size={15}/>{t('Attach images or files')}</button><p className={s.notice}>{t('Up to 10 files · 4 MB total')}</p>
    <button type="submit" className={`${s.primary} sm:ml-auto`} disabled={sending||(!text.trim()&&!uploads.length)}>{sending?<Loader2 size={15} className={s.spin}/>:<Send size={15}/>} {t(sending?'Sending…':uncertain?'Retry same email':'Send email')}</button>
   </div>
   {error&&<p role="alert" className={`${s.message} ${s.error} mt-4`}>{t(error)}</p>}
   {uncertain&&<p role="status" className={`${s.notice} mt-3`}>{t('Keep this draft open and retry the same email to avoid duplicates.')}</p>}
  </form>
 </section>
}
