'use client'
import {useEffect,useRef,useState,useSyncExternalStore,type FormEvent,type ReactNode} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport} from 'ai'
import Link from 'next/link'
import {Copy,Share2,Trash2,ChevronsRight,ArrowUp,Square,Check,ThumbsUp,ThumbsDown,RotateCcw,Globe,CreditCard,Layers,RefreshCw,ArrowUpRight} from 'lucide-react'
import {conversationContext,conversationText,messageText} from '@/lib/ai/conversation'
import s from './ask-ai-panel.module.css'
const transport=new DefaultChatTransport({api:'/api/assistant',prepareSendMessagesRequest:({messages})=>({body:{messages:conversationContext(messages)}})})
const subscribeMobile=(fn:()=>void)=>{const media=window.matchMedia('(max-width: 767px)');media.addEventListener('change',fn);return()=>media.removeEventListener('change',fn)}
const mobileSnapshot=()=>window.matchMedia('(max-width: 767px)').matches
const suggestions=[['What can Koryx build for me?',Globe],['What could my project cost?',CreditCard],['Can you improve my existing website?',Layers],['How does monthly service work?',RefreshCw]] as const
function Answer({text}:{text:string}){
 const tokens=text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>]+)/g)
 return <>{tokens.map((token,index):ReactNode=>{
  if(token.startsWith('**')&&token.endsWith('**'))return <strong key={index}>{token.slice(2,-2)}</strong>
  if(token.startsWith('`')&&token.endsWith('`'))return <code key={index}>{token.slice(1,-1)}</code>
  const markdown=token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
  const href=markdown?.[2]||(/^https?:\/\//.test(token)?token.replace(/[.,;!?]+$/,''):null)
  if(href){try{const url=new URL(href);if(!url.username&&!url.password)return <span key={index}><a href={url.toString()} target="_blank" rel="noopener noreferrer">{markdown?.[1]||href}</a>{!markdown&&token.slice(href.length)}</span>}catch{}}
  return token
 })}</>
}
function friendlyError(error:Error|undefined){
 if(!error)return ''
 try{const parsed=JSON.parse(error.message);if(typeof parsed.error==='string')return parsed.error.slice(0,280)}catch{}
 return error.message.startsWith('Koryx AI')?error.message:'That connection got interrupted. Please try again.'
}
function ActionButton({label,children,onClick,disabled=false}:{label:string;children:ReactNode;onClick:()=>void;disabled?:boolean}){return <button type="button" className={s.icon} title={label} aria-label={label} onClick={onClick} disabled={disabled}>{children}</button>}
export function AskAIPanel({open,onClose,onReturnFocus}:{open:boolean;onClose:()=>void;onReturnFocus?:()=>void}){
 const mobile=useSyncExternalStore(subscribeMobile,mobileSnapshot,()=>false)
 const {messages,sendMessage,status,stop,setMessages,error,clearError,regenerate}=useChat({transport})
 const [input,setInput]=useState(''),[notice,setNotice]=useState(''),[copied,setCopied]=useState(''),[feedback,setFeedback]=useState<Record<string,'up'|'down'>>({})
 const scroll=useRef<HTMLDivElement>(null),textarea=useRef<HTMLTextAreaElement>(null),stick=useRef(true),copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
 const generating=status==='submitted'||status==='streaming',last=messages.at(-1),waiting=generating&&(last?.role!=='assistant'||!messageText(last))
 useEffect(()=>()=>{if(copyTimer.current)clearTimeout(copyTimer.current)},[])
 useEffect(()=>{const element=scroll.current;if(open&&element&&stick.current)element.scrollTop=element.scrollHeight},[messages,status,open])
 function submit(event?:FormEvent,text=input){
  event?.preventDefault();const question=text.trim();if(!question||question.length>5000||generating)return
  clearError();setInput('');setNotice('');stick.current=true;void sendMessage({text:question})
 }
 async function copy(text:string,id:string){
  try{await navigator.clipboard.writeText(text);setCopied(id);setNotice('Copied to clipboard.');if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(''),2000);return true}catch{setNotice('Copy is unavailable in this browser. You can select the text instead.');return false}
 }
 async function share(){
  const text=conversationText(messages);if(!text)return
  if(navigator.share){try{await navigator.share({title:'A conversation with Koryx AI',text});setNotice('Conversation shared.')}catch(error){if(!(error instanceof Error)||error.name!=='AbortError')await copy(text,'chat')}return}
  if(await copy(text,'chat'))setNotice('Conversation copied — ready to share.')
 }
 async function clear(){await stop();setMessages([]);clearError();setInput('');setFeedback({});setNotice('A fresh start. What’s on your mind?');stick.current=true;textarea.current?.focus()}
 return <Dialog.Root open={open} onOpenChange={value=>{if(!value)onClose()}} modal={mobile}>
  <Dialog.Portal>
   <Dialog.Overlay className={s.overlay}/>
   <Dialog.Content id="koryx-ai-panel" className={s.panel} onOpenAutoFocus={event=>{event.preventDefault();textarea.current?.focus();stick.current=true}} onInteractOutside={event=>{if(!mobile)event.preventDefault()}} onCloseAutoFocus={event=>{event.preventDefault();onReturnFocus?.()}} aria-describedby="koryx-ai-description">
    <header className={s.header}><Dialog.Title className={s.title}>Ask AI</Dialog.Title><div className={s.tools}>
     <ActionButton label="Copy chat" disabled={!messages.length} onClick={()=>void copy(conversationText(messages),'chat')}>{copied==='chat'?<Check size={15}/>:<Copy size={15}/>}</ActionButton>
     <ActionButton label="Share chat" disabled={!messages.length} onClick={()=>void share()}><Share2 size={15}/></ActionButton>
     <ActionButton label="Clear chat" disabled={!messages.length&&!input} onClick={()=>void clear()}><Trash2 size={15}/></ActionButton>
     <Dialog.Close className={s.icon} title="Close panel" aria-label="Close panel"><ChevronsRight size={17}/></Dialog.Close>
    </div></header>
    <Dialog.Description id="koryx-ai-description" className={s.srOnly}>Koryx’s AI assistant. Ask about websites, apps, pricing or your next idea. Answers use Koryx’s public information.</Dialog.Description>
    <div ref={scroll} className={s.scroll} onScroll={()=>{const el=scroll.current;if(el)stick.current=el.scrollHeight-el.scrollTop-el.clientHeight<80}} role="log" aria-label="Conversation with Koryx AI" aria-live="off">
     {!messages.length?<div className={s.empty}><p className={s.intro}>A little clarity for your next idea.</p><div className={s.suggestions}>{suggestions.map(([question,Icon])=><button type="button" key={question} onClick={()=>submit(undefined,question)} disabled={generating}><Icon size={15} strokeWidth={1.5}/><span>{question}</span></button>)}</div><p className={s.tip}>Tip: open or close chat with <kbd>⌘</kbd><kbd>I</kbd><span> / Ctrl I</span></p></div>:<div className={s.messages}>
      {messages.map((message,index)=>{const text=messageText(message),assistant=message.role==='assistant';if(!text)return null;return <article key={message.id} className={assistant?s.answer:s.question} aria-label={assistant?'Koryx AI response':'Your question'}><div className={s.text}><Answer text={text}/></div>{assistant&&!generating&&<div className={s.messageTools}>
       <button type="button" className={s.icon} title="Helpful answer" aria-label="Helpful answer" aria-pressed={feedback[message.id]==='up'} onClick={()=>{setFeedback(values=>({...values,[message.id]:'up'}));setNotice('Marked helpful in this chat.')}}><ThumbsUp size={14}/></button>
       <button type="button" className={s.icon} title="Unhelpful answer" aria-label="Unhelpful answer" aria-pressed={feedback[message.id]==='down'} onClick={()=>{setFeedback(values=>({...values,[message.id]:'down'}));setNotice('Marked unhelpful in this chat. You can try another answer.')}}><ThumbsDown size={14}/></button>
       <ActionButton label="Copy answer" onClick={()=>void copy(text,message.id)}>{copied===message.id?<Check size={14}/>:<Copy size={14}/>}</ActionButton>
       {index===messages.length-1&&<ActionButton label="Try another answer" onClick={()=>{stick.current=true;clearError();void regenerate()}}><RotateCcw size={14}/></ActionButton>}
      </div>}</article>})}
      {waiting&&<div className={s.thinking} aria-label="Koryx AI is thinking"><i/><i/><i/></div>}
     </div>}
    </div>
    <footer className={s.footer}>
     {error&&<div role="alert" className={s.error}><p>{friendlyError(error)}</p><button type="button" onClick={()=>{clearError();stick.current=true;void regenerate()}}>Try again <RotateCcw size={12}/></button></div>}
     <p role="status" aria-live="polite" className={notice?s.notice:s.srOnly}>{notice|| (waiting?'Koryx AI is thinking.':'')}</p>
     <form onSubmit={submit} className={s.composer}><label htmlFor="koryx-ai-question" className={s.srOnly}>Your question</label><textarea id="koryx-ai-question" ref={textarea} rows={3} maxLength={5000} value={input} onChange={event=>setInput(event.target.value)} placeholder="Ask a question…" onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();submit()}}}/><button type={generating?'button':'submit'} onClick={generating?()=>void stop():undefined} className={generating?s.stop:s.send} disabled={!generating&&!input.trim()} aria-label={generating?'Stop generating':'Send question'}>{generating?<><Square size={12}/> Stop</>:<ArrowUp size={17}/>}</button></form>
     <div className={s.footnote}><p>AI can make mistakes. Keep private details private.</p><Link href="/dashboard" onClick={onClose}>Client workspace <ArrowUpRight size={11}/></Link></div>
    </footer>
   </Dialog.Content>
  </Dialog.Portal>
 </Dialog.Root>
}
