'use client'
import {useState} from 'react'
import {Download,ExternalLink,FileText} from 'lucide-react'
import {isPreviewImage,type InboxAttachment,type InboxEmail,type MailDirection} from '@/lib/inbox/types'
import {useFounderLanguage} from './language'
import s from '@/components/workspace/workspace.module.css'

function Attachment({attachment,emailId,direction}:{attachment:InboxAttachment;emailId:string;direction:MailDirection}){
 const {t}=useFounderLanguage(),[failed,setFailed]=useState(false)
 const url=`/api/inbox/${emailId}/attachments/${attachment.id}?direction=${direction}`
 const image=isPreviewImage(attachment.content_type),view=image||attachment.content_type==='application/pdf'
 return <div className="min-w-0 overflow-hidden rounded-lg border border-white/10">
  {image&&!failed?<a href={url+'&preview=1'} target="_blank" rel="noopener noreferrer"><img src={attachment.preview_url||url+'&preview=1'} referrerPolicy="no-referrer" loading="lazy" alt={attachment.filename||t('Attached image')} onError={()=>setFailed(true)} className="w-full max-h-44 object-contain bg-white/[.03]"/></a>:<div className="p-4 text-white/45"><FileText size={24}/></div>}
  <div className="p-4"><p className="text-sm [overflow-wrap:anywhere]">{attachment.filename||t('Attachment')}</p><p className={`${s.notice} mt-1`}>{Math.ceil(attachment.size/1024)} KB</p>
   <div className="flex flex-wrap gap-3 mt-3">{view&&<a href={url+'&preview=1'} target="_blank" rel="noopener noreferrer" className={s.secondary}><ExternalLink size={14}/>{t('View attachment')}</a>}
    <a href={url} download className={s.secondary}><Download size={14}/>{t('Download')}</a></div>
  </div>
 </div>
}
export function InboxAttachments({email}:{email:InboxEmail}){
 const {t}=useFounderLanguage(),[external,setExternal]=useState(false)
 return <>{email.attachments.length>0&&<section className="mt-5 border-t border-white/10 pt-4"><h3 className="text-sm mb-3">{t('Attachments')} ({email.attachments.length})</h3><div className="grid sm:grid-cols-2 gap-4 items-start">{email.attachments.map(attachment=><Attachment key={attachment.id} emailId={email.id} direction={email.direction||'inbound'} attachment={attachment}/>)}</div></section>}
  {Boolean(email.external_images?.length)&&<section className="mt-6"><button type="button" className={s.secondary} onClick={()=>setExternal(value=>!value)}>{t(external?'Hide external images':'Show external images')}</button>{external&&<div className="grid gap-4 mt-4">{email.external_images?.map((url,index)=><img key={url} src={url} referrerPolicy="no-referrer" loading="lazy" alt={t('Email image')+' '+(index+1)} className="max-w-full max-h-[480px] object-contain"/>)}</div>}</section>}
 </>
}
