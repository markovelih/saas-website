'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {usePathname,useSearchParams} from 'next/navigation'
import {MessageCircle,FolderKanban,UserRound} from 'lucide-react'
import {useFounderLanguage} from '@/components/manager/language'
import s from './workspace-app-navigation.module.css'
export function WorkspaceAppNavigation({founder=false,staff=false,preview=false}:{founder?:boolean;staff?:boolean;preview?:boolean}){
 const {t}=useFounderLanguage(),path=usePathname(),query=useSearchParams(),[installed,setInstalled]=useState(false)
 useEffect(()=>{const media=window.matchMedia('(display-mode: standalone)'),update=()=>{const value=preview||media.matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);setInstalled(value);document.documentElement.classList.toggle('koryx-installed',value)};update();media.addEventListener('change',update);window.addEventListener('appinstalled',update)
 const visual=window.visualViewport,keyboard=()=>document.documentElement.classList.toggle('koryx-keyboard',Boolean(visual&&visual.height<window.innerHeight-150));visual?.addEventListener('resize',keyboard)
 return()=>{media.removeEventListener('change',update);window.removeEventListener('appinstalled',update);visual?.removeEventListener('resize',keyboard);document.documentElement.classList.remove('koryx-installed','koryx-keyboard')}
 },[preview])
 if(!installed)return null
 return <nav className={s.tabs} aria-label={t('Koryx app navigation')}>{[{label:'Chats',href:'/dashboard/chats',icon:MessageCircle},...(!staff||founder?[{label:'Projects',href:founder?'/dashboard/admin?view=list':staff?'/dashboard/chats':'/dashboard/orders',icon:FolderKanban}]:[]),{label:'Account',href:'/dashboard/settings',icon:UserRound}].map(item=><Link key={item.label} href={item.href} aria-current={item.label==='Chats'&&(path.includes('/chats')||preview)||item.label==='Account'&&path.includes('/settings')||item.label==='Projects'&&(path.includes('/orders')||founder&&path==='/dashboard/admin'&&query.get('view')==='list')?'page':undefined}><item.icon size={21} strokeWidth={1.6}/><span>{t(item.label)}</span></Link>)}</nav>
}
