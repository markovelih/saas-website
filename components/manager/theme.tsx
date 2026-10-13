'use client'

import {createContext,useContext,useState} from 'react'
import {Moon,Sun} from 'lucide-react'
import {useFounderLanguage} from './language'

type Theme='dark'|'light'
const ThemeContext=createContext({theme:'dark' as Theme,enabled:false,setTheme:((_theme:Theme)=>{void _theme})})

export function FounderThemeProvider({children,enabled=false,initial='dark'}:{children:React.ReactNode;enabled?:boolean;initial?:Theme}){
 const [preference,setPreference]=useState(initial)
 const theme=enabled?preference:'dark'
 function setTheme(value:Theme){
  if(!enabled)return
  setPreference(value)
  document.cookie=`koryx-founder-theme=${value};path=/;max-age=31536000;SameSite=Lax${location.protocol==='https:'?';Secure':''}`
 }
 return <ThemeContext.Provider value={{theme,enabled,setTheme}}><div data-workspace-theme={theme} className="min-h-screen min-w-0">{children}</div></ThemeContext.Provider>
}

export function useFounderTheme(){return useContext(ThemeContext)}

export function ThemeSwitch(){
 const {theme,enabled,setTheme}=useFounderTheme()
 const {t}=useFounderLanguage()
 if(!enabled)return null
 return <div className="text-xs text-white/50"><p className="mb-2">{t('Appearance')}</p><div className="workspace-theme-switch" role="group" aria-label={t('Appearance')}>{([['dark','Dark',Moon],['light','Light',Sun]] as const).map(([value,label,Icon])=><button type="button" key={value} aria-pressed={theme===value} onClick={()=>setTheme(value)}><Icon size={13}/>{t(label)}</button>)}</div></div>
}
