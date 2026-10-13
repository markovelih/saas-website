'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Check, Plus, Minus, Globe, ShoppingBag, Code2, Layers, Workflow, ChevronDown } from 'lucide-react'
import { projectTypes, featureCatalog, includedEssentials, buildEstimate, normalizeFeatures, money, type ProjectType } from '@/lib/project-planner/catalog'
import s from './pricing.module.css'

const icons = { landing: Layers, website: Globe, store: ShoppingBag, app: Code2, feature: Workflow }
const cardCopy = {
  landing: ['One idea. One great page.', 'A focused launch, campaign or new business.'],
  website: ['Your business, beautifully built.', 'A complete home for your brand and services.'],
  store: ['From discovery to checkout.', 'Products, a catalogue and a buying experience.'],
  app: ['A product of your own.', 'Accounts, workflows and a core dashboard.'],
  feature: ['Make an existing product better.', 'One scoped feature or integration.'],
}
const questions = [
  ['Is this the final price?', 'This is an indicative development estimate using our published starting rates. We review your requirements, complexity and deliverables, then agree a final quote before any work begins. No payment is taken here.'],
  ['Can I start small and add more later?', 'Yes. We can split your scope into a useful first release and later improvements. Additional work is quoted separately, so an invoice for an update contains only the work you are adding.'],
  ['What about an existing website or a bug?', 'Choose an improvement request in the project planner. If the issue needs investigation, diagnostic reviews start at CAD 50; diagnostics cover assessment, not repairs. We explain the findings and agree a repair quote before proceeding.'],
  ['Are domains, hosting and subscriptions included?', 'Domain registration, hosting and third-party services are separate unless your agreed quote explicitly includes them. Renewal terms and recurring charges are shown before you approve them.'],
  ['How does cancellation work?', 'Under our voluntary cancellation policy, the initial 50% deposit is retained. If you paid the full amount upfront, the remaining 50% is refundable. Mandatory consumer rights and the agreed terms always apply. Read the terms before approving a project.'],
]

export function PricingExperience() {
  const [type, setType] = useState<ProjectType>('website')
  const [pages, setPages] = useState(5)
  const [selected, setSelected] = useState<string[]>([])
  const [payment, setPayment] = useState<'split' | 'full'>('split')
  const project = projectTypes.find(p => p.id === type)!
  const features = normalizeFeatures(type, selected)
  const estimate = buildEstimate({ type, budget: 50000, pages, features, brief: '' })
  const deposit = Math.round(estimate.total * 50) / 100
  const remaining = estimate.total - deposit
  const plannerHref = `/dashboard/new-order?${new URLSearchParams({ intent: 'build', type, budget: String(estimate.total), pages: String(pages), features: features.join(',') })}`

  function chooseType(next: ProjectType) {
    setType(next)
    setPages(projectTypes.find(p => p.id === next)!.pages)
    setSelected([])
  }
  function toggleFeature(id: string) {
    // Removing accounts also removes the dashboard that depends on them.
    const next = features.includes(id) ? features.filter(f => f !== id && !(id === 'accounts' && f === 'dashboard')) : [...features, id]
    setSelected(normalizeFeatures(type, next))
  }

  return <div className={s.page}>
    <header className={s.hero}>
      <div className={s.heroTop}><span className={s.eyebrow}>KORYX / PROJECT PRICING</span><span className={s.currency}>CAD · PROJECT-BASED</span></div>
      <h1>A clear scope.<br/><span>A better investment.</span></h1>
      <div className={s.heroBottom}><p>Build what matters. See how it adds up.<br/>A considered starting point for your next website or software project.</p><a href="#configure" className={s.textLink}>Shape your project <ArrowDown size={16}/></a></div>
      <div className={s.heroRail}><span><Check size={13}/> Itemised estimates</span><span><Check size={13}/> 50/50 or full upfront</span><span><Check size={13}/> Scope agreed before work</span></div>
    </header>
    <section className={s.startingPoints} aria-labelledby="starting-title">
      <div className={s.sectionIntro}><div><span className={s.eyebrow}>01 / THE STARTING POINT</span><h2 id="starting-title">Different ambitions.<br/>The same attention to detail.</h2></div><p>Choose a foundation. These are starting estimates for a defined scope, with room to grow.</p></div>
      <div className={s.projectCards}>{projectTypes.filter(p => p.id !== 'feature').map((p, i) => { const Icon = icons[p.id]; return <button key={p.id} className={s.projectCard} aria-pressed={type === p.id} onClick={() => chooseType(p.id)}>
        <span className={s.cardTop}><span>0{i + 1} / {p.title}</span><span className={s.selection}>{type === p.id ? <Check size={12}/> : <Plus size={12}/>}</span></span>
        <div className={s.cardVisual} aria-hidden="true"><div className={s.visualGrid}/><Icon size={36} strokeWidth={1}/><span className={s.orbit}/></div>
        <span className={s.cardPrice}><small>FROM / CAD</small><strong>{money(p.base)}</strong></span>
        <h3>{cardCopy[p.id][0]}</h3><p>{cardCopy[p.id][1]}</p><span className={s.cardFoot}>{p.pages} {p.pages === 1 ? 'page' : 'pages / main screens'}<ArrowRight size={14}/></span>
      </button> })}</div>
    </section>
    <section id="configure" className={s.configure} aria-labelledby="configure-title">
      <div className={s.sectionIntro}><div><span className={s.eyebrow}>02 / YOUR SCOPE, IN FOCUS</span><h2 id="configure-title">Make it work for you.</h2></div><p>A living estimate. Add the capabilities you need and see each cost, before you commit.</p></div>
      <div className={s.configLayout}>
        <div className={s.scope}>
          <div className={s.scopeHeading}><h3>Project foundation</h3><span>01</span></div>
          <div className={s.typeOptions}>{projectTypes.map(p => <button key={p.id} aria-pressed={type === p.id} onClick={() => chooseType(p.id)}>{p.title}{type === p.id && <Check size={13}/>}</button>)}</div>
          <div className={s.pageControl}><div><span>Pages / main screens</span><p>{project.pages} included · additional pages from CAD 150 each</p></div><div className={s.stepper}><button aria-label="Remove a page" disabled={pages <= project.pages} onClick={() => setPages(p => p - 1)}><Minus size={14}/></button><output aria-label="Number of pages">{pages}</output><button aria-label="Add a page" disabled={pages >= 30} onClick={() => setPages(p => p + 1)}><Plus size={14}/></button></div></div>
          <div className={s.scopeHeading}><h3>Choose your capabilities</h3><span>02</span></div>
          <p className={s.helper}>Add only what you need. A management dashboard also adds customer accounts.</p>
          <div className={s.featureGrid}>{featureCatalog.map(f => { const included = (type === 'store' && f.id === 'payments') || (type === 'app' && ['accounts', 'dashboard'].includes(f.id)); const active = included || features.includes(f.id); return <button key={f.id} className={s.feature} disabled={included} aria-pressed={active} onClick={() => toggleFeature(f.id)}><span className={s.featureTop}><small>{f.group}</small><span className={s.selection}>{active ? <Check size={12}/> : <Plus size={12}/>}</span></span><strong>{f.title}</strong><p>{f.description}</p><span className={s.featurePrice}>{included ? 'Included in foundation' : `+ ${money(f.price)} CAD`}</span></button> })}</div>
          <div className={s.essentials}><span className={s.eyebrow}>THE FOUNDATION, INCLUDED</span>{includedEssentials.map(item => <span key={item}><Check size={13}/>{item}</span>)}</div>
        </div>
        <aside className={s.quote} aria-label="Your live project estimate">
          <div className={s.quoteTop}><span className={s.eyebrow}>YOUR PROJECT / LIVE ESTIMATE</span><span className={s.liveDot}/></div>
          <div className={s.total} aria-live="polite" aria-atomic="true"><strong>{money(estimate.total)}</strong><span>CAD · indicative development cost</span></div>
          <ul className={s.lineItems}>{estimate.items.map(item => <li key={item.label}><span>{item.label}</span><strong>{money(item.amount)}</strong></li>)}</ul>
          <div className={s.quoteMeta}><span>Planning range<strong>{money(estimate.low)}–{money(estimate.high)}</strong></span><span>Indicative timeline<strong>{estimate.weeks[0]}–{estimate.weeks[1]} weeks</strong></span></div>
          <div className={s.paymentOptions} aria-label="Illustrative payment plan"><button aria-pressed={payment === 'split'} onClick={() => setPayment('split')}>50 / 50</button><button aria-pressed={payment === 'full'} onClick={() => setPayment('full')}>Full upfront</button></div>
          <div className={s.paymentPreview}><span>{payment === 'split' ? 'Initial 50% deposit' : 'Full project payment'}<strong>{money(payment === 'split' ? deposit : estimate.total)}</strong></span>{payment === 'split' && <span>After review & approval<strong>{money(remaining)}</strong></span>}</div>
          <Link href={plannerHref} className={s.primary}>Continue with this scope <ArrowRight size={15}/></Link>
          <p className={s.quoteNote}>Your selections continue into the project planner. This is an estimate, not an invoice. Final scope and price are agreed before work. Domains, hosting and paid services are separate; applicable taxes are determined separately.</p>
        </aside>
      </div>
    </section>
    <section className={s.paymentSection} aria-labelledby="payment-title"><div className={s.sectionIntro}><div><span className={s.eyebrow}>03 / A CLEAR PATH TO LAUNCH</span><h2 id="payment-title">Two payments.<br/>One shared finish line.</h2></div><p>Start with 50%, review the work together, then pay the remaining 50% after approval. Full upfront payment is also available.</p></div><div className={s.milestones}>{[
      ['01', 'Agree & begin', '50%', 'We confirm the deliverables and quote. Your initial deposit starts the agreed work.'],
      ['02', 'Build & review', 'Review', 'See the progress, check the finished work and approve the agreed scope.'],
      ['03', 'Approve & complete', '50%', 'Pay the remaining balance after approval. The final project payment is not charged automatically.'],
    ].map(([number, title, value, copy]) => <article key={number}><div className={s.milestoneVisual}><span>{number}</span><strong>{value}</strong><i aria-hidden="true"/></div><div className={s.milestoneCopy}><h3>{title}</h3><p>{copy}</p></div></article>)}</div><p className={s.policy}>Voluntary cancellation: the initial 50% deposit is retained. For a full upfront payment, the remaining 50% is refundable, subject to mandatory consumer rights and the agreed terms. <Link href="/terms">Read the terms <ArrowRight size={12}/></Link></p></section>
    <section className={s.otherWork}><div><span className={s.eyebrow}>ALREADY HAVE SOMETHING?</span><h2>The next chapter<br/>starts here, too.</h2><p>New pages, new features or a problem to investigate. Keep your existing project and quote only the next piece of work.</p><Link className={s.textLink} href="/dashboard/new-order">Request an improvement <ArrowRight size={16}/></Link></div><div className={s.workPaths}><article><Workflow size={22} strokeWidth={1.3}/><h3>Improve & expand</h3><p>For Koryx projects or software built elsewhere. We assess the existing work and agree the update scope.</p><span>A separate quote for the new work</span></article><article><Code2 size={22} strokeWidth={1.3}/><h3>Understand the issue</h3><p>A diagnostic review to identify the problem, explain the findings and recommend a way forward.</p><span>Diagnostic reviews from CAD 50</span></article></div></section>
    <section className={s.faq} aria-labelledby="faq-title"><div><span className={s.eyebrow}>BEFORE YOU BEGIN</span><h2 id="faq-title">Good questions.<br/>Clear answers.</h2></div><div>{questions.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={16}/></summary><p>{a}{q === 'How does cancellation work?' && <> <Link href="/terms">Read our terms.</Link></>}</p></details>)}</div></section>
    <section className={s.finalCta}><span className={s.eyebrow}>YOUR NEXT MOVE</span><h2>Let’s build something<br/>worth building.</h2><Link href={plannerHref} className={s.primary}>Plan your project <ArrowRight size={16}/></Link><p>No charge. No commitment. Just a clearer starting point.</p></section>
  </div>
}
