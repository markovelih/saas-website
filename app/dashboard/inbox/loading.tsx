'use client'
import {useFounderLanguage} from '@/components/manager/language'
import s from '@/components/workspace/workspace.module.css'
export default function LoadingInbox(){const {t}=useFounderLanguage();return <div className={s.shell}><p role="status" className={s.muted}>{t('Loading email conversations…')}</p><div className={s.inboxGrid+' mt-6'} aria-hidden="true"><div className={s.panel+' min-h-64'}/><div className={s.panel+' min-h-96'}/></div></div>}
