'use client'
import {createContext,useContext,useState} from 'react'
import {translate,type FounderLanguage} from '@/lib/i18n/founder'
const Context=createContext({language:'en' as FounderLanguage,t:(v:string)=>v,setLanguage:(_v:FounderLanguage)=>{},enabled:false})
export function FounderLanguageProvider({children,initial='en',enabled=false}:{children:React.ReactNode;initial?:FounderLanguage;enabled?:boolean}){const [language,set]=useState(initial);function setLanguage(value:FounderLanguage){if(!enabled)return;set(value);document.cookie=`koryx-founder-language=${value};path=/;max-age=31536000;SameSite=Lax;Secure`}return <Context.Provider value={{language,t:v=>translate(v,enabled?language:'en'),setLanguage,enabled}}><div lang={enabled?language:'en'} className="min-w-0">{children}</div></Context.Provider>}
export function useFounderLanguage(){return useContext(Context)}
export function LanguageSwitch(){const {language,setLanguage,enabled,t}=useFounderLanguage();if(!enabled)return null;return <label className="block text-xs text-white/50">{t('Language')}<select aria-label={t('Language')} className="mt-2 w-full bg-[#161619] border border-white/15 rounded-lg p-2.5 text-white" value={language} onChange={e=>setLanguage(e.target.value as FounderLanguage)}><option value="en">English</option><option value="uk">Українська</option></select></label>}
