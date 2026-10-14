'use client'
import {useEffect,useRef,useState} from 'react'
import {Bell,BellOff,Check,Download,Loader2,MoreHorizontal,Share,Smartphone,X} from 'lucide-react'
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog'
import {useFounderLanguage} from '@/components/manager/language'
import type {ChatTransport} from './project-chat'
import s from './chat-extras.module.css'
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}
function keyBytes(value:string){const raw=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0))}
export function ChatAppTools({userId,transport,recommend=true}:{userId:string;transport:ChatTransport;recommend?:boolean}){
 const {t,language}=useFounderLanguage(),[installOpen,setInstallOpen]=useState(false),[notificationsOpen,setNotificationsOpen]=useState(false),[suggest,setSuggest]=useState(false),[subscribed,setSubscribed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[available,setAvailable]=useState(false),[publicKey,setPublicKey]=useState(''),[secure,setSecure]=useState(false),[ios,setIOS]=useState(false),[installed,setInstalled]=useState(false),[canInstall,setCanInstall]=useState(false),installer=useRef<InstallEvent|null>(null),registration=useRef<ServiceWorkerRegistration|null>(null)
 const dismissal='koryx-push-later/'+userId
 useEffect(()=>{
  let cancelled=false
  const standalone=window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone)
  // Browser-only capabilities and storage become available after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setInstalled(standalone);setIOS(/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));setSecure(window.isSecureContext)
  try{setSuggest(recommend&&localStorage.getItem(dismissal)!=='yes'&&(!('Notification'in window)||Notification.permission!=='denied'))}catch{setSuggest(recommend)}
  const offer=(event:Event)=>{event.preventDefault();installer.current=event as InstallEvent;setCanInstall(true)}
  const done=()=>{setInstalled(true);setInstallOpen(false);setCanInstall(false)}
  window.addEventListener('beforeinstallprompt',offer);window.addEventListener('appinstalled',done)
  if(window.isSecureContext&&'serviceWorker'in navigator){
   void (async()=>{try{const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});registration.current=reg;const config=await transport('/push') as {enabled:boolean;publicKey:string|null};if(cancelled)return;setAvailable(config.enabled);setPublicKey(config.publicKey||'');const sub=await reg.pushManager?.getSubscription();if(sub&&'Notification'in window&&Notification.permission==='granted'&&config.enabled){await transport('/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...sub.toJSON(),language})});if(!cancelled){setSubscribed(true);setSuggest(false)}}}catch{/* A closed browser or offline connection can retry from the menu. */}})()
  }
  return()=>{cancelled=true;window.removeEventListener('beforeinstallprompt',offer);window.removeEventListener('appinstalled',done)}
 },[transport,language,dismissal,recommend])
 function later(){setSuggest(false);try{localStorage.setItem(dismissal,'yes')}catch{}}
 async function enable(){
  setError('')
  if(ios&&!installed){setInstallOpen(true);return}
  if(!secure){setError('Phone notifications work on the secure published site. Local Wi-Fi preview does not support them.');return}
  if(!('Notification'in window)||!('PushManager'in window)){setError('This browser does not support notifications.');return}
  if(Notification.permission==='denied'){setError('Notifications are blocked. Allow them in your browser settings.');return}
  if(!available||!publicKey||!registration.current){setError('Notifications will be available once Koryx finishes setup.');return}
  setBusy(true)
  try{
   // Must be the first awaited operation in the user's click handler (especially Safari).
   const permission=await Notification.requestPermission();if(permission!=='granted'){setError('Notifications were not enabled. You can try again from the chat menu.');setSuggest(false);return}
   const reg=await navigator.serviceWorker.ready,existing=await reg.pushManager.getSubscription(),sub=existing||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(publicKey)})
   try{await transport('/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...sub.toJSON(),language})})}catch(error){if(!existing)await sub.unsubscribe();throw error}
   setSubscribed(true);setSuggest(false);setNotificationsOpen(false)
  }catch(e){setError(e instanceof Error?e.message:'Notifications could not be enabled. Please retry.')}finally{setBusy(false)}
 }
 async function disable(){setBusy(true);setError('');try{const sub=await registration.current?.pushManager.getSubscription();if(sub){await transport('/push',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint})});await sub.unsubscribe()}setSubscribed(false);later()}catch{setError('Notification settings could not be saved. Please retry.')}finally{setBusy(false)}}
 async function install(){if(!installer.current)return;await installer.current.prompt();await installer.current.userChoice;installer.current=null;setCanInstall(false)}
 return <><DropdownMenu><DropdownMenuTrigger asChild><button className={s.menuButton} aria-label={t('Chat menu')}><MoreHorizontal size={19}/></button></DropdownMenuTrigger><DropdownMenuContent align="end" className={s.appMenu}><DropdownMenuItem onSelect={()=>{setError('');setInstallOpen(true)}}><Smartphone size={16}/>{t('Add Koryx to Home Screen')}</DropdownMenuItem><DropdownMenuItem onSelect={()=>{setError('');setNotificationsOpen(true)}}><Bell size={16}/>{t('Notifications')}{subscribed&&<Check size={13}/>}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
 {suggest&&<div className={s.nudge} role="region" aria-label={t('Stay in the conversation')}><span className={s.nudgeIcon}><Bell size={16}/></span><div><strong>{t('Stay in the conversation')}</strong><p>{t('Get a notification when your developer replies.')}</p><button disabled={busy} onClick={()=>void enable()}>{busy?<Loader2 size={12} className={s.spin}/>:<Bell size={12}/>} {t('Enable notifications')}</button><button onClick={later}>{t('Later')}</button>{error&&<p role="status" className={s.error}>{t(error)}</p>}</div><button className={s.closeNudge} onClick={later} aria-label={t('Later')}><X size={14}/></button></div>}
 <Dialog open={installOpen} onOpenChange={setInstallOpen}><DialogContent className={`${s.sheet} ${s.installSheet}`} closeLabel={t('Close')} onOpenAutoFocus={e=>e.preventDefault()}><img src="/brand/app-192.png" width={64} height={64} alt="Koryx" className={s.appIcon}/><DialogTitle>{t('Koryx. One tap away.')}</DialogTitle><DialogDescription>{t('Your projects and conversations, right on your Home Screen.')}</DialogDescription>{installed?<p className={s.instruction}><Check size={18}/>{t('Koryx is already installed.')}</p>:canInstall?<button className={s.primary} onClick={()=>void install()}><Download size={16}/>{t('Install Koryx')}</button>:<div className={s.installSteps}><p><span>1</span><Share size={17}/>{t(ios?'Open the Share menu in your browser.':'Open your browser’s menu or install icon.')}</p><p><span>2</span><Smartphone size={17}/>{t('Choose “Add to Home Screen” or “Install app”.')}</p><p><span>3</span><Check size={17}/>{t('Open Koryx and enable notifications.')}</p></div>}{!secure&&<p className={s.disclosure}>{t('Installation and phone notifications require the secure published site.')}</p>}<p className={s.footnote}>{t('Uses the Koryx website icon. Your account stays private.')}</p></DialogContent></Dialog>
 <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}><DialogContent className={`${s.sheet} ${s.installSheet}`} closeLabel={t('Close')} onOpenAutoFocus={e=>e.preventDefault()}><span className={s.aiMark}><Bell size={22}/></span><DialogTitle>{t('Your project. Stay in the loop.')}</DialogTitle><DialogDescription>{t('Get a notification when your developer replies. Message contents stay off the lock screen.')}</DialogDescription><button disabled={busy} className={s.primary} onClick={()=>void(subscribed?disable():enable())}>{busy?<Loader2 size={16} className={s.spin}/>:subscribed?<BellOff size={16}/>:<Bell size={16}/>} {t(subscribed?'Turn off notifications':'Enable notifications')}</button>{error&&<p role="status" className={s.error}>{t(error)}</p>}<small className={s.footnote}>{t('You can change this any time from the chat menu.')}</small></DialogContent></Dialog></>
}
