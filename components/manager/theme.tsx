'use client'

import {useSyncExternalStore} from 'react'
import {useTheme} from 'next-themes'
import {Monitor,Sun,MoonStar} from 'lucide-react'
import {useFounderLanguage} from './language'

const subscribe=()=>()=>{}
export function useFounderTheme(){const {resolvedTheme}=useTheme();return {enabled:true,theme:resolvedTheme==='light'?'light' as const:'dark' as const}}

export function ThemeSwitch(){
 const {theme,setTheme}=useTheme()
 const {t}=useFounderLanguage()
 const mounted=useSyncExternalStore(subscribe,()=>true,()=>false)
 return <div className="site-theme-switch" role="group" aria-label={t('Appearance')}>
  {([['system','System theme',Monitor],['light','Light theme',Sun],['dark','Dark theme',MoonStar]] as const).map(([value,label,Icon])=><button type="button" key={value} aria-label={t(label)} title={t(label)} aria-pressed={mounted?theme===value:undefined} onClick={()=>setTheme(value)}><Icon size={16} strokeWidth={1.7}/></button>)}
 </div>
}
