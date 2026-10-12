'use client';
import { LanguageSwitch, useFounderLanguage } from '@/components/manager/language';
import { useState } from 'react';
import { saveProfile } from '@/app/dashboard/settings/actions';
import { Check, Loader2 } from 'lucide-react';
import s from './workspace.module.css';
export function AccountSettings({ name, email, created }: {
    name: string;
    email: string;
    created: string;
}) { const { t } = useFounderLanguage(); const [fullName, setName] = useState(name), [loading, setLoading] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''); async function save(e: React.FormEvent) { e.preventDefault(); setLoading(true); setMessage(''); setError(''); try {
    const result = await saveProfile({ full_name: fullName });
    if (result.error)
        setError(result.error);
    else
        setMessage('Your name has been saved.');
}
catch {
    setError('Could not save. Please try again.');
}
finally {
    setLoading(false);
} } return <div className={`${s.shell} !max-w-3xl !ml-0`}><header className={s.header}><div><p className={s.eyebrow}>{t("Workspace / Account")}</p><h1 className={s.title}>{t("Your account details.")}</h1><p className={s.muted}>{t("Keep your name up to date across your project workspace.")}</p></div></header><div className="max-w-xs mb-6"><LanguageSwitch /></div><form className={s.panel} onSubmit={save}><div className={s.fields}><label className={s.field}>{t("Full name")}<input value={fullName} maxLength={100} required minLength={2} onChange={e => setName(e.target.value)}/></label><label className={s.field}>{t("Sign-in email")}<input value={email} readOnly type="email"/></label></div><p className={`${s.notice} mt-5`}>{t("Member since")}{new Date(created).toLocaleDateString('en-CA')}{t(". Contact email for each project can be set in its brief.")}</p><button className={`${s.primary} mt-6`} disabled={loading}>{loading ? <Loader2 size={14} className={s.spin}/> : <Check size={14}/>}{t("Save changes")}</button>{message && <p role="status" className={`${s.saved} mt-4`}>{message}</p>}{error && <p role="alert" className={`${s.message} ${s.error} mt-4`}>{error}</p>}</form></div>; }
