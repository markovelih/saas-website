'use client'
import {LanguageSwitch,useFounderLanguage} from '@/components/manager/language'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {saveProfile,requestPasswordChange,changePassword} from '@/app/dashboard/settings/actions'
import {Check,Loader2,LockKeyhole,Mail} from 'lucide-react'
import s from './workspace.module.css'
export function AccountSettings({name,email,created}:{name:string;email:string;created:string}){
 const {t}=useFounderLanguage(),router=useRouter(),parts=name.trim().split(/\s+/)
 const [firstName,setFirst]=useState(parts[0]||''),[lastName,setLast]=useState(parts.slice(1).join(''))
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
 const [codeSent,setCodeSent]=useState(false),[code,setCode]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState('')
 const [passwordBusy,setPasswordBusy]=useState(false),[passwordMessage,setPasswordMessage]=useState(''),[passwordError,setPasswordError]=useState('')
 async function save(event:FormEvent){
  event.preventDefault();setBusy(true);setMessage('');setError('')
  try{const result=await saveProfile({first_name:firstName,last_name:lastName});if(result.error)setError(result.error);else{setMessage('Your name has been saved.');router.refresh()}}catch{setError('Could not save. Please try again.')}finally{setBusy(false)}
 }
 async function requestCode(){
  setPasswordBusy(true);setPasswordError('');setPasswordMessage('')
  try{const result=await requestPasswordChange();if(result.error)setPasswordError(result.error);else{setCodeSent(true);setPasswordMessage('Verification code sent to your sign-in email.')}}catch{setPasswordError('Could not send the verification code. Please retry.')}finally{setPasswordBusy(false)}
 }
 async function passwordSubmit(event:FormEvent){
  event.preventDefault();setPasswordError('');setPasswordMessage('')
  if(password!==confirmation){setPasswordError('The passwords do not match.');return}
  setPasswordBusy(true)
  try{const result=await changePassword({code,password,confirmation});if(result.error)setPasswordError(result.error);else{setCodeSent(false);setCode('');setPassword('');setConfirmation('');setPasswordMessage('Your password has been changed.');router.refresh()}}catch{setPasswordError('Could not change your password. Please retry.')}finally{setPasswordBusy(false)}
 }
 return <div className={`${s.shell} !max-w-3xl !ml-0`}>
  <header className={s.header}><div><p className={s.eyebrow}>{t('Workspace / Account')}</p><h1 className={s.title}>{t('Your account details.')}</h1><p className={s.muted}>{t('Manage your name and sign-in security.')}</p></div></header>
  <div className="max-w-xs mb-6"><LanguageSwitch/></div>
  <form className={s.panel} onSubmit={save}>
   <h2>{t('Personal details')}</h2><div className={`${s.fields} mt-6`}>
    <label className={s.field}>{t('First name')}<input autoComplete="given-name" value={firstName} maxLength={50} required onChange={event=>setFirst(event.target.value)}/></label>
    <label className={s.field}>{t('Last name')}<input autoComplete="family-name" value={lastName} maxLength={50} onChange={event=>setLast(event.target.value)}/></label>
    <label className={`${s.field} ${s.full}`}>{t('Sign-in email')}<input value={email} readOnly aria-readonly="true" type="email" autoComplete="email"/><span className={s.notice}>{t('Your sign-in email cannot be changed here.')}</span></label>
   </div><p className={`${s.notice} mt-5`}>{t('Member since')} {new Date(created).toLocaleDateString('en-CA')}</p>
   <button className={`${s.primary} mt-6`} disabled={busy}>{busy?<Loader2 size={14} className={s.spin}/>:<Check size={14}/>} {t('Save changes')}</button>
   {message&&<p role="status" className={`${s.saved} mt-4`}>{t(message)}</p>}{error&&<p role="alert" className={`${s.message} ${s.error} mt-4`}>{t(error)}</p>}
  </form>
  <section className={`${s.panel} mt-6`} aria-labelledby="password-heading"><h2 id="password-heading" className="flex items-center gap-2"><LockKeyhole size={18}/>{t('Password & security')}</h2>
   <p className={`${s.muted} mt-3`}>{t('Verify your sign-in email before changing or creating a Koryx password. Google sign-in will keep working.')}</p>
   <button type="button" className={`${s.secondary} mt-5`} disabled={passwordBusy} onClick={requestCode}>{passwordBusy?<Loader2 size={14} className={s.spin}/>:<Mail size={14}/>} {t(codeSent?'Send a new code':'Send verification code')}</button>
   {codeSent&&<form onSubmit={passwordSubmit} className="mt-6"><div className={s.fields}>
    <label className={`${s.field} ${s.full}`}>{t('Email verification code')}<input value={code} required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" maxLength={8} onChange={event=>setCode(event.target.value.replace(/\D/g,''))}/></label>
    <label className={s.field}>{t('New password')}<input type="password" autoComplete="new-password" value={password} required minLength={8} maxLength={128} onChange={event=>setPassword(event.target.value)}/></label>
    <label className={s.field}>{t('Confirm new password')}<input type="password" autoComplete="new-password" value={confirmation} required minLength={8} maxLength={128} onChange={event=>setConfirmation(event.target.value)}/></label>
   </div><p className={`${s.notice} mt-3`}>{t('Use 8–128 characters. Choose a unique password.')}</p><button className={`${s.primary} mt-5`} disabled={passwordBusy}>{t('Change password')}</button></form>}
   {passwordMessage&&<p role="status" className={`${s.saved} mt-4`}>{t(passwordMessage)}</p>}{passwordError&&<p role="alert" className={`${s.message} ${s.error} mt-4`}>{t(passwordError)}</p>}
  </section>
 </div>
}
