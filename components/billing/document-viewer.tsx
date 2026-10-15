import {cookies} from 'next/headers'
import {notFound,redirect} from 'next/navigation'
import {Download,ArrowUpRight} from 'lucide-react'
import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import {findBillingDocument} from '@/lib/billing/find-document'
import s from './document-viewer.module.css'

export async function DocumentViewer({document}:{document:string}){
 const db=await createClient(),{data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login?redirect='+encodeURIComponent('/'+document))
 const found=await findBillingDocument(db,document)
 if(!found)notFound()
 const uk=(await cookies()).get('koryx-workspace-language')?.value==='uk'
 const title=found.kind==='invoice'?(uk?'Інвойс':'Invoice'):(uk?'Чек':'Receipt'),src='/api/billing-documents/'+encodeURIComponent(document)
 return <main className={s.viewer} lang={uk?'uk':'en'}><header className={s.toolbar}><Link className={s.brand} href="/dashboard" aria-label="Koryx"><svg viewBox="0 0 50 50" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M0 36 36 0H50L0 50ZM17 34 29 46H43L24 27Z"/></svg><span>koryx</span></Link><div className={s.title}><h1>{title}</h1><p>{found.number}</p></div><nav aria-label={uk?'Дії з документом':'Document actions'}><a className={s.open} href={src} target="_blank" rel="noopener noreferrer"><span>{uk?'Відкрити PDF':'Open PDF'}</span><ArrowUpRight size={16}/></a><a className={s.download} href={src+'?download=1'}><Download size={16}/><span>{uk?'Скачати PDF':'Download PDF'}</span></a></nav></header><iframe className={s.pdf} title={title+' '+found.number} src={src+'#view=FitH'} referrerPolicy="no-referrer"/></main>
}
