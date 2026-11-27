'use client'
import {mailAccounts,type MailAccount} from '@/lib/inbox/accounts'
import {useEffect,useRef,useState,type FormEvent} from 'react'
import {Bold,Italic,Underline,Strikethrough,List,ListOrdered,Link as LinkIcon,ImagePlus,Undo2,Redo2,Type,FileText,Loader2,Paperclip,Send,X} from 'lucide-react'
import {MAX_MAIL_BYTES,MAX_MAIL_FILES,isPreviewImage,type InboxEmail} from '@/lib/inbox/types'
import {useFounderLanguage} from './language'
import s from '@/components/workspace/workspace.module.css'
import m from './inbox.module.css'

type Upload={id:string;file:File;inline:boolean;url:string}
export function InboxComposer({account='support',reply:targetReply,defaultTo='',compact=false,onDraftChange,onClose,onSent}:{account?:MailAccount;reply?:InboxEmail;defaultTo?:string;compact?:boolean;onDraftChange?:(dirty:boolean)=>void;onClose:()=>void;onSent:(email:InboxEmail)=>void}){
 const {t}=useFounderLanguage()
 const [initialReply]=useState(targetReply),reply=compact?initialReply:targetReply
 const target=reply?.direction==='outbound'?reply.to[0]||'':reply?.reply_to?.[0]||reply?.from||defaultTo
 const [to,setTo]=useState(target.match(/<([^<>]+)>/)?.[1]||target)
 const [subject,setSubject]=useState(reply?(/^re:/i.test(reply.subject)?reply.subject:'Re: '+reply.subject).slice(0,200):'')
 const [text,setText]=useState(''),[uploads,setUploads]=useState<Upload[]>([])
 const [error,setError]=useState(''),[sending,setSending]=useState(false),[uncertain,setUncertain]=useState(false),[link,setLink]=useState<string|null>(null)
 const [draft]=useState(()=>({id:crypto.randomUUID(),startedAt:Date.now()}))
 const first=useRef<HTMLInputElement>(null),body=useRef<HTMLDivElement>(null),picker=useRef<HTMLInputElement>(null),imagePicker=useRef<HTMLInputElement>(null),inFlight=useRef(false),urls=useRef<string[]>([]),range=useRef<Range|null>(null)
 const locked=sending||uncertain
 const title=compact?'New message':reply?'Reply to email':'New email'
 useEffect(()=>{if(compact)return;if(reply||defaultTo)body.current?.focus();else first.current?.focus()},[compact,reply,defaultTo])
 useEffect(()=>{onDraftChange?.(Boolean(text.trim()||uploads.length||sending||uncertain))},[text,uploads.length,sending,uncertain,onDraftChange])
 const [formatting,setFormatting]=useState(false)
 useEffect(()=>()=>{for(const url of urls.current)URL.revokeObjectURL(url)},[])
 function saveSelection(){const selection=window.getSelection();if(selection?.rangeCount&&body.current?.contains(selection.anchorNode))range.current=selection.getRangeAt(0).cloneRange()}
 function command(name:string,value?:string){
  body.current?.focus();if(range.current){const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range.current)}
  document.execCommand(name,false,value);setText(body.current?.innerText||'');saveSelection()
 }
 function addFiles(files:FileList|null,inline=false){
  if(!files)return
  const incoming=Array.from(files)
  if(uploads.length+incoming.length>MAX_MAIL_FILES||[...uploads.map(v=>v.file),...incoming].reduce((n,f)=>n+f.size,0)>MAX_MAIL_BYTES){setError('Choose up to 10 files, 4 MB in total.');return}
  if(incoming.some(file=>!file.size)){setError('Empty files cannot be attached.');return}
  if(inline&&incoming.some(file=>!isPreviewImage(file.type))){setError('Choose a PNG, JPEG, GIF, WebP or AVIF image.');return}
  const next=incoming.map(file=>{const url=URL.createObjectURL(file);urls.current.push(url);return {file,url,id:crypto.randomUUID(),inline}})
  setUploads(values=>[...values,...next]);setError('')
  if(inline)for(const upload of next){const img=document.createElement('img');img.src=upload.url;img.alt=upload.file.name;img.dataset.inlineId=upload.id;command('insertHTML',img.outerHTML+'<br>')}
 }
 function removeFile(upload:Upload){setUploads(values=>values.filter(value=>value.id!==upload.id));for(const img of body.current?.querySelectorAll('img')||[])if(img.dataset.inlineId===upload.id)img.remove()}
 async function send(event:FormEvent){
  event.preventDefault();if(inFlight.current||locked&&!uncertain)return
  const plain=body.current?.innerText.trim()||''
  if(!plain&&!uploads.length){setError('Write a message or attach a file.');return}
  if(plain.length>20000){setError('The message is too long. Maximum 20,000 characters.');return}
  const copy=body.current!.cloneNode(true) as HTMLElement
  for(const img of copy.querySelectorAll('img')){const id=img.dataset.inlineId;if(id&&uploads.some(upload=>upload.id===id))img.setAttribute('src','cid:'+id);else img.remove()}
  inFlight.current=true;setSending(true);setError('')
  const form=new FormData()
  for(const [key,value] of Object.entries({account,to,subject,text:plain,html:copy.innerHTML,inlineIds:JSON.stringify(uploads.map(upload=>upload.inline?upload.id:'')),requestId:draft.id,startedAt:String(draft.startedAt),replyId:reply?.id||'',replyDirection:reply?.direction||'inbound'}))form.set(key,value)
  for(const upload of uploads)form.append('files',upload.file)
  try{
   const response=await fetch('/api/inbox/send',{method:'POST',body:form})
   const result=await response.json().catch(()=>({error:response.status===413?'Choose up to 10 files, 4 MB in total.':'Delivery was not confirmed. Retry this same message.',uncertain:response.status!==413}))
   if(result.success&&result.email){onSent(result.email);return}
   setError(result.error||'Email could not be sent. Please retry.');setUncertain(Boolean(result.uncertain))
  }catch{setError('Delivery was not confirmed. Retry this same message.');setUncertain(true)}
  finally{inFlight.current=false;setSending(false)}
 }
 const tools=[['bold','Bold',Bold],['italic','Italic',Italic],['underline','Underline',Underline],['strikeThrough','Strikethrough',Strikethrough],['insertUnorderedList','Bulleted list',List],['insertOrderedList','Numbered list',ListOrdered],['undo','Undo',Undo2],['redo','Redo',Redo2]] as const
 return <section className={`${s.panel} ${m.composer} ${compact?m.quickComposer:''}`} aria-label={t(title)}>
  <div className="flex justify-between items-center gap-3 mb-4"><h2>{t(title)}</h2>{compact&&<button type="button" className={s.secondary} aria-expanded={formatting} onClick={()=>setFormatting(value=>!value)}><Type size={15}/>{t('Formatting')}</button>}<button type="button" disabled={sending||uncertain||compact&&!text.trim()&&!uploads.length} onClick={onClose} className={s.secondary}><X size={15}/>{t(compact?'Clear message':'Close draft')}</button></div>
  <p className={`${s.notice} mb-5`}>{compact?<>{t('To')}: {to}</>:<>{t('From')}: {mailAccounts[account].name} &lt;{mailAccounts[account].address}&gt;</>}</p>
  <form onSubmit={send}>
   {!compact&&<div className="grid gap-4 sm:grid-cols-2"><label className={s.field}>{t('Recipient email')}<input ref={first} type="email" autoComplete="email" required maxLength={254} readOnly={Boolean(reply)||locked} value={to} onChange={event=>setTo(event.target.value)} placeholder="name@example.com"/></label>
    <label className={s.field}>{t('Subject')}<input required maxLength={200} readOnly={Boolean(reply)||locked} value={subject} onChange={event=>setSubject(event.target.value)}/></label></div>}
   <div className={m.editorBox}>
    {(!compact||formatting)&&<div role="toolbar" aria-label={t('Text formatting')} className={m.toolbar}>
     {tools.map(([name,label,Icon])=><button key={name} type="button" title={t(label)} aria-label={t(label)} disabled={locked} onMouseDown={event=>event.preventDefault()} onClick={()=>command(name)}><Icon size={16}/></button>)}
     <select aria-label={t('Font')} disabled={locked} defaultValue="Arial" onMouseDown={saveSelection} onChange={event=>command('fontName',event.target.value)}><option>Arial</option><option>Georgia</option><option value="Courier New">Monospace</option></select>
     <button type="button" title={t('Insert link')} aria-label={t('Insert link')} disabled={locked} onMouseDown={event=>event.preventDefault()} onClick={()=>{saveSelection();setLink('https://')}}><LinkIcon size={16}/></button>
     <button type="button" title={t('Clear formatting')} disabled={locked} onMouseDown={event=>event.preventDefault()} onClick={()=>command('removeFormat')}>Tx</button>
    </div>}
    {link!==null&&<div className={m.linkBox}><input aria-label={t('Link URL')} type="url" value={link} onChange={event=>setLink(event.target.value)} placeholder="https://"/><button type="button" disabled={!/^https?:\/\//i.test(link)} onClick={()=>{command('createLink',link);setLink(null)}}>{t('Insert link')}</button><button type="button" onClick={()=>setLink(null)} aria-label={t('Cancel')}><X size={15}/></button></div>}
    <div ref={body} role="textbox" aria-label={t('Message')} aria-multiline="true" contentEditable={!locked} suppressContentEditableWarning className={m.editor} data-placeholder={t('Write a message…')} onInput={()=>{setText(body.current?.innerText||'');saveSelection()}} onKeyUp={saveSelection} onMouseUp={saveSelection} onPaste={event=>{event.preventDefault();const images=Array.from(event.clipboardData.files).filter(file=>isPreviewImage(file.type));if(images.length){const transfer=new DataTransfer();images.forEach(file=>transfer.items.add(file));addFiles(transfer.files,true)}else command('insertText',event.clipboardData.getData('text/plain'))}}/>
   </div>
   {uploads.length>0&&<ul className="grid sm:grid-cols-2 gap-3 mt-4">{uploads.map(upload=><li key={upload.id} className={m.draftFile}>
    {isPreviewImage(upload.file.type)?<img src={upload.url} alt=""/>:<FileText size={22}/>}
    <span>{upload.file.name}<small>{upload.inline?t('Inline image'):t('Attachment')} · {Math.ceil(upload.file.size/1024)} KB</small></span>
    <button type="button" disabled={locked} onClick={()=>removeFile(upload)} aria-label={t('Remove attachment')+': '+upload.file.name}><X size={16}/></button>
   </li>)}</ul>}
   <div className="flex flex-wrap items-center gap-3 mt-5">
    <input ref={picker} type="file" multiple hidden onChange={event=>{addFiles(event.target.files);event.target.value=''}}/>
    <input ref={imagePicker} type="file" multiple accept="image/png,image/jpeg,image/gif,image/webp,image/avif" hidden onChange={event=>{addFiles(event.target.files,true);event.target.value=''}}/>
    <button type="button" className={s.secondary} disabled={locked} onClick={()=>picker.current?.click()}><Paperclip size={15}/>{t('Attach files')}</button>
    <button type="button" className={s.secondary} disabled={locked} onMouseDown={event=>event.preventDefault()} onClick={()=>{saveSelection();imagePicker.current?.click()}}><ImagePlus size={15}/>{t('Insert image')}</button>
    <p className={s.notice}>{t('Up to 10 files · 4 MB total')}</p>
    <button type="submit" className={`${s.primary} sm:ml-auto`} disabled={sending||(!text.trim()&&!uploads.length)}>{sending?<Loader2 size={15} className={s.spin}/>:<Send size={15}/>} {t(sending?'Sending…':uncertain?'Retry same email':'Send email')}</button>
   </div>
   {error&&<p role="alert" className={`${s.message} ${s.error} mt-4`}>{t(error)}</p>}
   {uncertain&&<p role="status" className={`${s.notice} mt-3`}>{t('Keep this draft open and retry the same email to avoid duplicates.')}</p>}
  </form>
 </section>
}
