'use client'
import {useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {MessageCircle,Loader2,ArrowUpRight} from 'lucide-react'
import {useFounderLanguage} from '@/components/manager/language'

export function OpenProjectConversation({orderId,className}:{orderId:string;className?:string}){
 const {t}=useFounderLanguage(),router=useRouter(),pending=useRef(false)
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 async function open(){
  if(pending.current)return
  pending.current=true;setBusy(true);setError('')
  try{
   const response=await fetch('/api/project-chats/open',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:orderId})})
   const result=await response.json()
   if(!response.ok)throw new Error(result.error||'Could not open the conversation. Please try again.')
   router.push('/dashboard/chats?conversation='+encodeURIComponent(result.thread.order_id))
  }catch(e){setError(e instanceof Error?e.message:'Could not open the conversation. Please try again.')}
  finally{pending.current=false;setBusy(false)}
 }
 return <div><button type="button" className={className} disabled={busy} aria-busy={busy} onClick={()=>void open()}>{busy?<Loader2 size={14} className="animate-spin"/>:<MessageCircle size={14}/>} {t(busy?'Opening conversation…':'Open chat')}<ArrowUpRight size={13}/></button>{error&&<p role="alert" className="mt-2 max-w-64 text-xs text-red-500">{t(error)}</p>}</div>
}
