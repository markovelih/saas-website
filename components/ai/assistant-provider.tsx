'use client'
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react'
import dynamic from 'next/dynamic'
const AskAIPanel=dynamic(()=>import('@/components/vercel-home/ask-ai-panel').then(module=>module.AskAIPanel),{ssr:false})
const Context=createContext({open:false,openAssistant:()=>{},closeAssistant:()=>{}})
export function AssistantProvider({children}:{children:ReactNode}){
 const opener=useRef<HTMLElement|null>(null)
 const [open,setOpen]=useState(false),[loaded,setLoaded]=useState(false)
 const openAssistant=useCallback(()=>{opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setLoaded(true);setOpen(true)},[])
 const closeAssistant=useCallback(()=>setOpen(false),[])
 useEffect(()=>{function shortcut(event:KeyboardEvent){if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='i'&&!event.altKey){event.preventDefault();if(!open)opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setLoaded(true);setOpen(value=>!value)}}window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut)},[open])
 const value=useMemo(()=>({open,openAssistant,closeAssistant}),[open,openAssistant,closeAssistant])
 return <Context.Provider value={value}>{children}{loaded&&<AskAIPanel open={open} onClose={closeAssistant} onReturnFocus={()=>opener.current?.focus()}/>}</Context.Provider>
}
export function useAssistant(){return useContext(Context)}
