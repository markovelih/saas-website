'use client'
import {useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {Loader2,MessageCircle} from 'lucide-react'
import {useFounderLanguage} from '@/components/manager/language'
import type {ChatPage} from '@/lib/project-chat/types'

async function startDirect(clientId:string):Promise<ChatPage>{
 const response=await fetch('/api/project-chats/direct',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId})})
 const data=await response.json()
 if(!response.ok)throw new Error(data.error||'Could not open the conversation. Please try again.')
 return data
}
export function StartConversation({clientId,name,className,start=startDirect,onOpen}:{clientId:string;name:string;className?:string;start?:(clientId:string)=>Promise<ChatPage>;onOpen?:(page:ChatPage)=>void}){
 const {t}=useFounderLanguage(),router=useRouter(),[busy,setBusy]=useState(false),[error,setError]=useState(''),pending=useRef(false)
 async function open(){
  if(pending.current)return
  pending.current=true;setBusy(true);setError('')
  try{const page=await start(clientId);if(onOpen)onOpen(page);else router.push('/dashboard/chats?conversation='+encodeURIComponent(page.thread.order_id))}
  catch(e){setError(e instanceof Error?e.message:'Could not open the conversation. Please try again.')}
  finally{pending.current=false;setBusy(false)}
 }
 return <div className="min-w-0"><button type="button" className={className} disabled={busy} onClick={()=>void open()} aria-label={t('Message person')+' '+name} aria-busy={busy}>{busy?<Loader2 size={15} className="animate-spin"/>:<MessageCircle size={15}/>} {t(busy?'Opening conversation…':'Message person')}</button>{error&&<p role="alert" className="mt-2 max-w-64 text-xs text-red-500">{t(error)}</p>}</div>
}
