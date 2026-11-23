import Link from 'next/link'
import { ArrowRight, Check, Code2, Layers } from 'lucide-react'
import { projectTypes, buildEstimate, money } from '@/lib/project-planner/catalog'
import { monthlyEstimate } from '@/lib/projects/monthly-pricing'
import s from './service-models.module.css'

export function ServiceModels() {
  const landing = projectTypes[0]
  const estimate = buildEstimate({ type: landing.id, budget: 50000, pages: landing.pages, features: [], brief: '' })
  const monthly = monthlyEstimate(landing.id, estimate)
  const plans = [
    { title: 'Own your product.', label: 'ONE-TIME PROJECT', icon: Code2, price: estimate.total, period: 'CAD / project', href: '/pricing?mode=buyout', action: 'Explore project pricing', items: ['Design and development for an agreed scope', 'Pay upfront or in two agreed stages', 'Source-code handover after full payment'] },
    { title: 'Pay monthly.', label: 'MANAGED SERVICE', icon: Layers, price: monthly.total, period: 'CAD / month', href: '/pricing?mode=managed', action: 'Explore monthly pricing', items: ['The agreed build, hosting and maintenance', 'Ongoing service within your plan limits', 'Monthly access; source code stays with Koryx'] },
  ]
  return <section className={s.section} id="service-models" aria-labelledby="service-models-title">
    <header><span className={s.eyebrow}>TWO WAYS TO WORK WITH US</span><h2 id="service-models-title">Choose what works for you.</h2><p>Buy your product outright or have Koryx build and operate it as a monthly service.</p></header>
    <div className={s.models}>{plans.map(plan => <article key={plan.label}>
      <div className={s.planLabel}><plan.icon size={20} strokeWidth={1.3} aria-hidden="true"/><span>{plan.label}</span></div>
      <h3>{plan.title}</h3><p className={s.price}><small>From</small> {money(plan.price)} <span>{plan.period}</span></p>
      <ul>{plan.items.map(item => <li key={item}><Check size={14} aria-hidden="true"/>{item}</li>)}</ul>
      <Link href={plan.href}>{plan.action}<ArrowRight size={15} aria-hidden="true"/></Link>
    </article>)}</div>
    <p className={s.note}>Indicative starting prices in CAD. Final scope, usage limits and price are agreed before payment. Domains, paid tools and applicable taxes are separate unless included. Cancel monthly renewals before the next charge; service continues through the paid period.</p>
  </section>
}
