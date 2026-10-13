'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Globe, Layers, ShoppingBag, CalendarCheck, Workflow, ShieldCheck, Code2, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import s from './studio.module.css'
import { ExperienceLab } from './experience-lab'
import { BudgetPricing } from '@/components/workspace/budget-pricing'
import { DeliveryGlobe } from './delivery-globe'
import {IntegrationShowcase,SecurityShowcase} from '@/components/services/service-demos'

export const services = [
  { slug: 'business-websites', icon: Globe, title: 'Websites & brand experiences', short: 'Business websites', description: 'A distinctive home for your business. Thoughtful design, expressive motion, and a clear path from first impression to enquiry.', includes: ['Custom UI/UX & responsive layouts', 'Landing pages & content management', 'Forms, technical SEO & analytics'], result: 'A finished website on your domain, ready for visitors.', audience: 'Local businesses, service brands, portfolios, and companies ready to improve their online presence.', visual: 'website' },
  { slug: 'custom-software', icon: Code2, title: 'Applications & custom software', short: 'Apps & software', description: 'Turn your idea into a working product. We create SaaS platforms, web applications, internal tools, and the features your business actually needs.', includes: ['User accounts, roles & permissions', 'Databases, APIs & business logic', 'Admin panels & product workflows'], result: 'A working application built around your requirements.', audience: 'Founders building a product and businesses replacing manual work with their own software.', visual: 'app' },
  { slug: 'e-commerce', icon: ShoppingBag, title: 'E-commerce & online payments', short: 'E-commerce', description: 'A shopping experience built around your products. From a refined storefront to checkout, inventory, and order management.', includes: ['Product catalogues & filtering', 'Payment provider integration', 'Customer accounts & order management'], result: 'A storefront with the agreed catalogue and checkout flow.', audience: 'Product brands, digital products, and businesses that want to sell online.', visual: 'shop' },
  { slug: 'appointment-booking', icon: CalendarCheck, title: 'Booking & scheduling systems', short: 'Booking systems', description: 'Give customers an easy way to choose a service and request an appointment. We connect the booking flow to how your team works.', includes: ['Services, availability & calendars', 'Booking forms & confirmations', 'Staff dashboards & integrations'], result: 'A booking workflow your customers and team can use.', audience: 'Studios, clinics, consultants, and service businesses with scheduled appointments.', visual: 'app' },
  { slug: 'client-dashboards', icon: Layers, title: 'Dashboards & client portals', short: 'Dashboards & portals', description: 'Make important work easy to find. Private workspaces for your team and customers, with the right information and actions in one place.', includes: ['Role-based private workspaces', 'Projects, files & customer records', 'Reports, search & administration'], result: 'A tailored workspace with access to the right data.', audience: 'Teams managing customers, projects, documents, or operations across several tools.', visual: 'app' },
  { slug: 'integrations', icon: Workflow, title: 'Integrations & new features', short: 'Integrations & features', description: 'Connect your tools or improve the product you already have. Payments, CRM, email, AI-powered features, APIs, and custom automations.', includes: ['Third-party APIs & data sync', 'Workflow automation & notifications', 'New features for existing products'], result: 'The agreed integration or feature, tested in your workflow.', audience: 'Businesses that need their software to work together or their existing product to do more.', visual: 'network' },
  { slug: 'seo-speed', icon: Search, title: 'Performance & technical SEO', short: 'Speed & SEO', description: 'Make your website easier to use and discover. We improve loading, mobile behaviour, page structure, and the technical foundations of search.', includes: ['Performance & accessibility review', 'Image, asset & page optimisation', 'Metadata, indexing & structured data'], result: 'A clearer, faster experience with documented improvements.', audience: 'Existing websites that feel slow, struggle on mobile, or need stronger technical foundations.', visual: 'website' },
  { slug: 'security', icon: ShieldCheck, title: 'Security & launch support', short: 'Security & hosting', description: 'A careful launch with the essentials in place: HTTPS, provider-backed DDoS mitigation, access controls, and secure handling of your data.', includes: ['Domain, hosting & HTTPS setup', 'Authentication & access policies', 'Firewall, rate limits & backup planning'], result: 'A launch and security setup matched to your application.', audience: 'Business websites and applications handling accounts, customer data, or important workflows.', visual: 'security' },
] as const

export const faqs = [
  ['What can I order from Koryx?', 'Websites, online stores, SaaS applications, dashboards, booking systems, custom software, integrations, and individual features. Share your idea and we will define the right solution together.'],
  ['Do I need to know how to code or launch a website?', 'No. You explain what your business needs; Koryx handles design, development, testing, and launch. We also show you how to use the finished product.'],
  ['How much will my project cost?', 'Each project is quoted after we understand its scope. The proposal covers the features, design, timeline, and price. Hosting, paid tools, and ongoing support are identified separately so you can make an informed decision.'],
  ['Can you improve an existing website or application?', 'Yes. We can review your current product and plan a redesign, performance improvements, integrations, or new features. The first step is checking the existing code and requirements.'],
  ['How long does a project take?', 'The timeline depends on the features, number of screens, integrations, and feedback. We agree on milestones before development and share working previews throughout the project.'],
  ['Will my website work on phones?', 'Responsive layouts are part of the build. We check the main pages and interactions across mobile and desktop sizes before launch.'],
  ['What about security and DDoS protection?', 'We choose hosting with network-level DDoS mitigation, configure HTTPS, and implement access controls appropriate to your application. Additional firewall rules, rate limits, and monitoring are scoped to the project.'],
  ['What happens after launch?', 'You receive the agreed deliverables, access, and guidance for using your product. We can also agree on maintenance, monitoring, and future improvements. Ownership and handover are recorded in your proposal.'],
] as const

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .45, ease: [.16, 1, .3, 1] }}>{children}</motion.div>
}

export function ProjectButtons() {
  return <div className={s.actions}><Link className={s.button} href="/dashboard/new-order">Start your project <ArrowRight size={16} /></Link><Link className={`${s.button} ${s.outline}`} href="/services">Explore services</Link></div>
}

export function WebsitePreview({ type = 'website' }: { type?: string }) {
  return <div className={s.preview} role="img" aria-label={type === 'website' ? 'Concept website for an architecture studio' : type === 'shop' ? 'Concept online store with a sculptural product' : 'Concept project management application'}>
    <div className={s.browser}><i className={s.dot} /><i className={s.dot} /><i className={s.dot} /><span className={s.address}>↗ {type === 'website' ? 'form.studio' : type === 'shop' ? 'sola.store' : 'nexus.workspace'} · design concept</span></div>
    {type === 'website' ? <div className={`${s.mock} ${s.arch}`}><div className={s.mocknav}><strong>FORM / SPACES</strong><span>WORK &nbsp; ABOUT &nbsp; ↗</span></div><h3>Spaces for<br />a different<br />perspective.</h3><p>Considered architecture.<br />Extraordinary everyday living.</p><span className={s.tinyButton}>Explore our work ↗</span><div className={s.archArt} /></div> : type === 'shop' ? <div className={`${s.mock} ${s.shop}`}><div><div className={s.mocknav}>SOLA — OBJECTS</div><h3>Less, but<br />better.</h3><p>Objects made to stay.</p><span className={s.tinyButton}>Explore collection ↗</span></div><div className={s.product} /></div> : <div className={`${s.mock} ${s.app}`}><aside><strong>NEXUS</strong><br />Overview<br />Projects<br />Team<br />Documents</aside><div><div className={s.mocknav}>WORKSPACE / DESIGN TEAM</div><h3>Your work. In focus.</h3><div className={s.taskRow}>Website experience <span>In review</span></div><div className={s.taskRow}>Customer portal <span>In progress</span></div><div className={s.taskRow}>Product release <span>Ready</span></div></div></div>}
  </div>
}

export function WorkShowcase() { return <ExperienceLab/> }

export function GlobeVisual() {
  return <DeliveryGlobe/>
}

export function SecurityVisual() { return <SecurityShowcase compact/> }
export function IntegrationVisual() { return <IntegrationShowcase compact/> }

export function CraftVisual() {
  return <div className={s.stack} aria-label="Layered previews of your finished project" role="img"><div className={s.window}>● ● ● &nbsp; yourbrand.com<strong>Designed for your brand.</strong></div><div className={s.window}>● ● ● &nbsp; yourbrand.com<strong>Built around your workflow.</strong></div><div className={s.window}>● ● ● &nbsp; 🔒 yourbrand.com<strong>Ready for your customers.</strong><div className="mt-3 h-px bg-white/10 w-3/4" /></div></div>
}

export function QualitySection() {
  const cards = [
    { title: 'Beautiful on every screen.', text: 'Considered layouts, smooth interactions, and responsive design. We build the details that make your website feel like your brand.', visual: <CraftVisual/> },
    { title: 'Fast, wherever customers are.', text: 'Optimised pages and modern hosting help your experience travel well. We handle the domain and launch so you can focus on your business.', visual: <GlobeVisual/> },
    { title: 'Connected to the way you work.', text: 'Payments, booking, CRM, email, and custom APIs. Bring the right tools together and remove repetitive steps from your day.', visual: <IntegrationVisual/> },
    { title: 'Security built into the plan.', text: 'HTTPS, provider-backed DDoS mitigation, secure sign-in, and scoped data access. Additional protections are chosen for your application.', visual: <SecurityVisual/> },
  ]
  return <section id="quality" className={s.section}><div className={s.wrap}><Reveal className={s.intro}><div><p className={s.eyebrow}>More than a good-looking page</p><h2 className={s.heading}>The details that make<br /><span className="text-white/40">the difference.</span></h2></div><Link href="/services/security" className={s.link}>Explore our approach <ArrowRight size={16}/></Link></Reveal><div className={s.benefits}>{cards.map(c=><Reveal className={s.benefit} key={c.title}><h3>{c.title}</h3><p>{c.text}</p>{c.visual}<div className={s.visualLabel}>Concept illustration</div></Reveal>)}</div></div></section>
}

export function Features() {
  return <section id="services" className={s.section}><div className={s.wrap}><Reveal className={s.intro}><div><p className={s.eyebrow}>What we build for you</p><h2 className={s.heading}>One idea. Every part<br /><span className="text-white/40">needed to make it real.</span></h2></div><p className={s.muted}>Design, development, and launch in one place. Order a complete product or the specific feature your business needs.</p></Reveal><div className={s.grid}>{services.slice(0,6).map(service=><Reveal className={s.card} key={service.slug}><service.icon size={26} strokeWidth={1.3} className="text-white/70"/><h3>{service.short}</h3><p>{service.description}</p><ul>{service.includes.map(item=><li key={item}><Check size={12} className="shrink-0 text-white/35"/>{item}</li>)}</ul><Link className={s.link} href={`/services/${service.slug}`}>Explore service <ArrowRight size={14}/></Link></Reveal>)}</div><div className="mt-7 flex gap-5 flex-wrap"><Link className={s.link} href="/services/seo-speed">Performance & SEO <ArrowRight size={14}/></Link><Link className={s.link} href="/services/security">Security & launch support <ArrowRight size={14}/></Link></div></div></section>
}

export function ProcessSection() {
  return <section id="process" className={s.section}><div className={s.wrap}><Reveal className={s.intro}><div><p className={s.eyebrow}>A clear path from idea to launch</p><h2 className={s.heading}>You bring the vision.<br /><span className="text-white/40">We handle the build.</span></h2></div><p className={s.muted}>You stay involved through working previews and focused feedback. Each stage moves your project toward a finished product.</p></Reveal><div className={s.steps}>{[['Define','Tell us your goals, audience, features, and budget. We agree on scope, deliverables, and milestones.'],['Design','Review the visual direction, layouts, and important journeys before development moves ahead.'],['Develop','We build the interface, data, and integrations, sharing working previews for your feedback.'],['Launch','We test the main flows, connect your domain, and hand over the finished project with guidance.']].map(([title,text])=><Reveal className={s.step} key={title}><h3>{title}</h3><p>{text}</p></Reveal>)}</div><ProjectButtons/></div></section>
}

export function FAQSection() {
  return <section id="faq" className={s.section}><div className={s.wrap}><Reveal><p className={`${s.eyebrow} text-center`}>Before we start</p><h2 className={`${s.heading} text-center mb-12`}>Good questions.<br /><span className="text-white/40">Clear answers.</span></h2><div className={s.faq}>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></Reveal></div></section>
}

export function PricingContent() { return <BudgetPricing/> }

