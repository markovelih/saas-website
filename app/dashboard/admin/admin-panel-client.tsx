'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutGrid, List, Download, ArrowUpRight, Users, FolderKanban, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { updateUserProfile } from './actions';
import { ManagerProjectEditor, AddClientProject, BillingPanel } from '@/components/manager/project-controls';
import type { MailJob } from '@/lib/billing/mail';
import { useFounderLanguage } from '@/components/manager/language';
import type { Payment, BillingSettings, ManagedDomain, Renewal, ProjectInvoice } from '@/lib/billing/types';
import type { Order, Profile } from '@/lib/supabase/types';
import { money, statusLabels } from '@/lib/project-planner/catalog';
import { readPlan } from '@/lib/project-planner/snapshot';
import { ProjectStatus } from '@/components/workspace/project-ui';
import s from '@/components/workspace/workspace.module.css';
const lanes = [{ title: 'New briefs', statuses: ['pending'] }, { title: 'Scoping', statuses: ['in_review'] }, { title: 'Quote & payment', statuses: ['invoice_sent', 'paid'] }, { title: 'Building', statuses: ['in_progress'] }, { title: 'Delivered', statuses: ['completed'] }];
export function AdminPanelClient({ orders, profiles, user, initialView = 'board', initialProject, payments, billing, mailConfigured, domains = [], renewals = [], jobs = [], invoices = [] }: {
    domains?: ManagedDomain[];
    renewals?: Renewal[];
    jobs?: MailJob[];
    invoices?: ProjectInvoice[];
    payments: Payment[];
    billing: BillingSettings;
    mailConfigured: boolean;
    initialView?: 'board' | 'list' | 'clients' | 'billing';
    initialProject?: string;
    orders: Order[];
    profiles: Profile[];
    user: {
        email?: string;
        fullName: string;
    };
}) {
    const { t, language } = useFounderLanguage();
    const [view, setView] = useState<'board' | 'list' | 'clients' | 'billing'>(initialView), [q, setQ] = useState(''), [stage, setStage] = useState('all'), [selected, setSelected] = useState<string | null>(initialProject || null), [clientId, setClientId] = useState<string | null>(null);
    const [adding, setAdding] = useState(false), [addClientId, setAddClientId] = useState('');
    const router = useRouter();
    const profileMap = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles]);
    const current = orders.find(o => o.id === selected);
    const filtered = orders.filter(o => [o.business_name, o.website_type, o.contact_email, profileMap.get(o.user_id)?.full_name || ''].join(' ').toLowerCase().includes(q.toLowerCase()) && (stage === 'all' || o.status === stage));
    const clients = profiles.filter(p => `${p.full_name} ${p.email}`.toLowerCase().includes(q.toLowerCase()));
    const paid = orders.filter(o => o.paid).reduce((sum, o) => sum + Number(o.quote_price || 0), 0);
    const pipeline = orders.filter(o => !o.paid).reduce((sum, o) => sum + Number(o.quote_price || 0), 0);
    function exportCsv() { const cell = (v: string | number) => '"' + String(v).replace(/^[=+@\-]/, "'$&").replaceAll('"', '""') + '"'; const csv = [['Project', 'Client email', 'Stage', 'Budget', 'Agreed quote CAD', 'Paid'], ...filtered.map(o => [o.business_name, o.contact_email, statusLabels[o.status], o.budget, o.quote_price ?? '', o.paid ? 'Yes' : 'No'])].map(row => row.map(cell).join(',')).join('\r\n'); const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'koryx-projects.csv'; a.click(); URL.revokeObjectURL(url); }
    return <div className={s.shell}><header className={s.header}><div><p className={s.eyebrow}>{t("Koryx / Studio control")}</p><h1 className={s.title}>{t("Your studio. Under control.")}</h1><p className={s.muted}>{t("Briefs, clients, quotes and delivery. Move from the big picture to the detail in one click.")}</p></div><div className="flex gap-3 flex-wrap items-center"><span className={s.tag}>{user.fullName} / {t('Founder')}</span><button className={s.primary} onClick={() => { setAddClientId(''); setAdding(true); }}><Plus size={14}/>{t("Add client project")}</button></div></header><div className={s.stats}>{[['Needs review', orders.filter(o => ['pending', 'in_review'].includes(o.status)).length], ['In development', orders.filter(o => o.status === 'in_progress').length], ['Unpaid quotes', money(pipeline)], ['Recorded revenue', money(paid)]].map(([label, value]) => <div className={s.stat} key={t(String(label))}><p>{t(String(label))}</p><strong>{value}</strong></div>)}</div><div className={s.toolbar}><div className={s.tabs} role="tablist" aria-label={t('Studio view')}>{[['board', 'Pipeline', FolderKanban], ['list', 'All projects', List], ['clients', 'Clients', Users], ['billing', 'Billing & email', Download]].map(([id, title, Icon]) => { const I = Icon as typeof LayoutGrid; return <button key={String(id)} role="tab" aria-selected={view === id} onClick={() => { setView(id as typeof view); setQ(''); setStage('all'); }}><I size={13} className="inline mr-2"/>{t(String(title))}</button>; })}</div><div className="flex gap-2 flex-wrap"><label className={s.search}><Search size={14}/><input aria-label={t('Search studio')} placeholder={t(view === 'clients' ? 'Find a client…' : 'Find a project or client…')} value={q} onChange={e => setQ(e.target.value)}/></label>{!['clients', 'billing'].includes(view) && <><select className={s.select} aria-label={t('Filter studio stage')} value={stage} onChange={e => setStage(e.target.value)}><option value="all">{t("All stages")}</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{t(String(label))}</option>)}</select><button className={s.secondary} onClick={exportCsv} aria-label={t('Export filtered projects as CSV')}><Download size={14}/></button></>}</div></div>
 {view === 'board' && <div className={s.board}>{lanes.map(lane => { const rows = filtered.filter(o => lane.statuses.includes(o.status)); return <section key={t(lane.title)} className={s.column}><h3>{t(lane.title)}<span className="text-white/30">{rows.length}</span></h3>{rows.map(o => { const plan = readPlan(o.description); return <button className={s.project} key={o.id} onClick={() => setSelected(o.id)}><div className={s.row}><span className="text-[9px] uppercase tracking-wide text-white/30">{t(o.website_type)}</span><ArrowUpRight size={12} className="text-white/25"/></div><h4 className="text-sm font-medium mt-4">{o.business_name}</h4><p className="!text-[11px]">{profileMap.get(o.user_id)?.full_name || o.contact_email}</p><div className={`${s.row} mt-5 text-xs`}><span>{o.quote_price !== null ? money(Number(o.quote_price)) : plan ? `~ ${money(plan.estimate.total)}` : t('No quote')}</span><span className="text-white/30 text-[9px]">{new Date(o.created_at).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-CA', { month: 'short', day: 'numeric' })}</span></div></button>; })}{!rows.length && <p className="text-xs text-white/20 text-center py-16">{t("No projects in this stage")}</p>}</section>; })}</div>}
 {view === 'list' && <div className={`${s.panel} ${s.tableWrap}`}><table className={s.table}><thead><tr>{['Project', 'Client', 'Stage', 'Budget', 'Estimate', 'Agreed quote'].map(x => <th key={x}>{t(x)}</th>)}</tr></thead><tbody>{filtered.map(o => { const plan = readPlan(o.description); return <tr key={o.id}><td><button onClick={() => setSelected(o.id)} className="!font-medium">{o.business_name}<ArrowUpRight size={12} className="inline ml-2 opacity-30"/></button><p className="text-[10px] text-white/30 mt-1">{t(o.website_type)}</p></td><td>{profileMap.get(o.user_id)?.full_name || o.contact_email}</td><td><ProjectStatus status={o.status}/></td><td>{o.budget}</td><td>{plan ? money(plan.estimate.total) : '—'}</td><td>{o.quote_price !== null ? money(Number(o.quote_price)) : '—'}</td></tr>; })}</tbody></table>{!filtered.length && <div className={s.empty}><h2>{t("No projects yet.")}</h2><p>{t("New client briefs will appear here with their saved scope and estimates.")}</p></div>}</div>}
 {view === 'clients' && <div className={`${s.panel} ${s.tableWrap}`}><table className={s.table}><thead><tr>{['Client', 'Email', 'Projects', 'Paid quotes', 'Joined'].map(x => <th key={x}>{t(x)}</th>)}</tr></thead><tbody>{clients.map(p => { const projects = orders.filter(o => o.user_id === p.id); return <tr key={p.id}><td><button onClick={() => setClientId(p.id)}>{p.full_name || 'Unnamed client'} <ArrowUpRight size={12} className="inline opacity-30"/></button></td><td>{p.email}</td><td>{projects.length}</td><td>{money(projects.filter(o => o.paid).reduce((sum, o) => sum + Number(o.quote_price || 0), 0))}</td><td>{new Date(p.created_at).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-CA')}</td></tr>; })}</tbody></table>{!clients.length && <p className="text-sm text-white/40 p-10">{t("No matching clients.")}</p>}</div>}
 {view === 'billing' && <BillingPanel settings={billing} payments={payments} configured={mailConfigured} domains={domains} renewals={renewals} jobs={jobs}/>}
 <p className={`${s.notice} mt-5`}>{t("Assign work to client accounts, attach finished websites and confirm received payments. Invoice and receipt PDFs are emailed through Resend after payment is recorded.")}</p><Dialog open={Boolean(current)} onOpenChange={open => { if (!open)
        setSelected(null); }}>{current && <ManagerProjectEditor key={current.id} order={current} domains={domains.filter(d => d.order_id === current.id)} invoice={invoices.find(i => i.order_id === current.id)} client={profileMap.get(current.user_id)} payment={payments.find(p => p.order_id === current.id)} onClose={() => setSelected(null)}/>}</Dialog><Dialog open={Boolean(clientId)} onOpenChange={open => { if (!open)
        setClientId(null); }}>{clientId && <ClientEditor key={clientId} profile={profileMap.get(clientId)!} orders={orders.filter(o => o.user_id === clientId)} onProject={id => { setClientId(null); setSelected(id); }} onAdd={() => { setAddClientId(clientId); setClientId(null); setAdding(true); }}/>}</Dialog><Dialog open={adding} onOpenChange={setAdding}>{adding && <AddClientProject profiles={profiles} initialClient={addClientId} onClose={() => setAdding(false)} onAdded={id => { setAdding(false); setSelected(id); router.refresh(); }}/>}</Dialog></div>;
}
function ClientEditor({ profile, orders, onProject, onAdd }: {
    profile: Profile;
    orders: Order[];
    onProject: (id: string) => void;
    onAdd: () => void;
}) { const { t, language } = useFounderLanguage(); const router = useRouter(); const [name, setName] = useState(profile.full_name || ''), [loading, setLoading] = useState(false), [message, setMessage] = useState(''); async function save(e: React.FormEvent) { e.preventDefault(); setLoading(true); try {
    const r = await updateUserProfile({ id: profile.id, full_name: name });
    setMessage(r.error || 'Client name saved.');
    if (!r.error)
        router.refresh();
}
catch {
    setMessage('Could not save the client.');
}
finally {
    setLoading(false);
} } return <DialogContent closeLabel={t('Close')} className={`${s.shell} bg-[#101012] !max-w-xl`}><DialogTitle className="!text-xl">{t("Client details")}</DialogTitle><DialogDescription>{profile.email}</DialogDescription><form onSubmit={save}><label className={s.field}>{t("Full name")}<input value={name} maxLength={100} minLength={2} required onChange={e => setName(e.target.value)}/></label><button className={`${s.primary} mt-4`} disabled={loading}>{t("Save client")}</button><p className={`${s.notice} mt-3`} role="status">{t(message)}</p></form><hr className={s.divider}/><div className={s.row}><h3 className="text-sm">{t('Projects')} ({orders.length})</h3><button className={s.secondary} onClick={onAdd}><Plus size={12}/>{t("Add project for client")}</button></div>{orders.map(o => <button className={`${s.secondary} !justify-between w-full`} key={o.id} onClick={() => onProject(o.id)}>{o.business_name}<ArrowUpRight size={13}/></button>)}</DialogContent>; }
