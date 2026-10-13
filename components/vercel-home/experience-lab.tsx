'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, CreditCard, FileText, Mail, MousePointer2, Plus, Workflow } from 'lucide-react'
import { MotionSurface, SignalPath, KoryxMark } from '@/components/motion/motion-primitives'
import s from './experience-lab.module.css'

/* This section tells the Koryx story; it deliberately contains no pretend products or dashboards. */
export function ExperienceLab() {
  return <section id="work" className={s.section} aria-labelledby="experience-title">
    <header className={s.intro}>
      <div className={s.introTop}><span className={s.eyebrow}>KORYX / THE WAY WE BUILD</span><span className={s.edition}>DESIGN. LOGIC. CONNECTION.</span></div>
      <div className={s.introBody}><h2 id="experience-title">Good design gets noticed.<br/><span>Great experiences get used.</span></h2><p>Your brand on the surface. Your business at the centre. We bring the details together to make something people want to use.</p></div>
      <div className={s.introRail}><span><i/>Thoughtful by design</span><span>Purpose in every interaction</span><Link href="/pricing">A clear scope from the start <ArrowUpRight size={13}/></Link></div>
    </header>
    <div className={s.grid}>
      <article className={s.card}>
        <div className={s.copy}><span className={s.eyebrow}>01 / MAKE AN IMPRESSION</span><h3>A presence that feels<br/>unmistakably yours.</h3><p>Typography, space and motion with a point of view. A website that brings your brand into focus, on every screen.</p></div>
        <MotionSurface className={`${s.scene} ${s.design}`} interactive><DesignScene/></MotionSurface>
        <Link className={s.cardLink} href="/services/business-websites"><span>Design with intention</span><ArrowUpRight size={15}/></Link>
      </article>
      <article className={s.card}>
        <div className={s.copy}><span className={s.eyebrow}>02 / MAKE IT FEEL EFFORTLESS</span><h3>From the first hello<br/>to the next good move.</h3><p>A clear journey from interest to action. We consider what your customer needs to see, understand and do next.</p></div>
        <MotionSurface className={`${s.scene} ${s.journey}`}><JourneyScene/></MotionSurface>
        <Link className={s.cardLink} href="/services/e-commerce"><span>Build a better customer journey</span><ArrowUpRight size={15}/></Link>
      </article>
      <article className={s.card}>
        <div className={s.copy}><span className={s.eyebrow}>03 / MAKE THE PARTS WORK TOGETHER</span><h3>One action.<br/>The right connections.</h3><p>Requests, records and notifications, joined into a useful workflow. Less copying between tools. More time for your business.</p></div>
        <MotionSurface className={`${s.scene} ${s.connected}`}><ConnectionScene/></MotionSurface>
        <Link className={s.cardLink} href="/services/integrations"><span>Connect what matters</span><ArrowUpRight size={15}/></Link>
      </article>
      <article className={s.card}>
        <div className={s.copy}><span className={s.eyebrow}>04 / MAKE ROOM FOR WHAT’S NEXT</span><h3>A strong first release.<br/>A considered next chapter.</h3><p>Start with the essentials. Add a new page, feature or integration when you need it, with a separate scope for each improvement.</p></div>
        <MotionSurface className={`${s.scene} ${s.growth}`} interactive><GrowthScene/></MotionSurface>
        <Link className={s.cardLink} href="/services/custom-software"><span>Build with room to evolve</span><ArrowUpRight size={15}/></Link>
      </article>
    </div>
    <footer className={s.footer}><div><span className={s.eyebrow}>YOUR IDEA / OUR ATTENTION TO DETAIL</span><p>Let’s make the details work for you.</p></div><Link href="/dashboard/new-order">Tell us what you have in mind <ArrowRight size={16}/></Link></footer>
  </section>
}

function DesignScene() {
  return <div className={s.designCanvas} aria-hidden="true">
    <svg className={s.designGuides} viewBox="0 0 600 310" preserveAspectRatio="none"><path d="M95 24V286M505 24V286M40 62H560M40 247H560"/><SignalPath d="M40 62H505V247H95V62" tone="violet" duration={10} wire={false}/><path d="M87 62H103M95 54V70M497 247H513M505 239V255" className={s.registration}/></svg>
    <div className={s.typeSheet}><div className={s.sheetTop}><span>YOUR BRAND / IN FOCUS</span><KoryxMark/></div><div className={s.letterform}>Aa<span>01</span></div><div className={s.typeLines}><i/><i/><i/></div><div className={s.sheetBottom}><span>SPACE</span><div><b/><b/><b/><b/><b/></div><span>RHYTHM</span></div></div>
    <div className={s.mobileSheet}><div/><strong>Aa</strong><i/><i/><span/></div><span className={s.sceneNote}>A visual language. Every screen.</span>
  </div>
}

function JourneyScene() {
  return <div className={s.journeyCanvas} aria-hidden="true">
    <span className={s.routeLabel}>THE CUSTOMER JOURNEY</span>
    <svg viewBox="0 0 600 310" preserveAspectRatio="none"><SignalPath d="M116 144H286" tone="blue" duration={6.6}/><SignalPath d="M314 144H484" tone="cyan" duration={6.6} delay={-3.3}/><path d="M496 184V203Q496 224 474 224H126Q104 224 104 203V184" className={s.returnPath}/><SignalPath d="M496 184V203Q496 224 474 224H126Q104 224 104 203V184" tone="violet" duration={11} delay={-2} wire={false}/></svg>
    <div className={`${s.journeyNode} ${s.discover}`}><span><MousePointer2 size={22} strokeWidth={1.2}/></span><strong>Discover</strong><small>A reason to stay</small></div>
    <div className={`${s.journeyNode} ${s.decide}`}><span><FileText size={22} strokeWidth={1.2}/></span><strong>Understand</strong><small>A clear next step</small></div>
    <div className={`${s.journeyNode} ${s.act}`}><span><Check size={23} strokeWidth={1.4}/></span><strong>Take action</strong><small>A useful outcome</small></div>
    <span className={s.journeyReturn}>BUILT TO BRING PEOPLE BACK</span>
  </div>
}

const destinations = [
  { name: 'Your records', Icon: FileText, y: 62, tone: 'blue' },
  { name: 'Your tools', Icon: CreditCard, y: 155, tone: 'cyan' },
  { name: 'The next update', Icon: Mail, y: 248, tone: 'violet' },
] as const
function ConnectionScene() {
  return <div className={s.connectionCanvas} aria-hidden="true">
    <svg viewBox="0 0 600 310" preserveAspectRatio="none"><SignalPath d="M104 155H264" tone="amber" duration={7}/>{destinations.map(({y,tone})=><SignalPath key={y} d={`M332 155H350Q382 155 382 ${y}H439`} tone={tone} duration={7}/>)}</svg>
    <div className={s.eventSource}><Workflow size={20} strokeWidth={1.2}/><span>A customer<br/>takes action</span></div>
    <div className={s.connectionCore}><div className={s.coreGrid}/><KoryxMark/><i/><span>YOUR WORKFLOW</span></div>
    {destinations.map(({name,Icon,y})=><div key={name} className={s.destination} style={{top:`${y/3.1}%`}}><Icon size={15} strokeWidth={1.4}/><span>{name}</span><i/></div>)}
    <span className={s.sceneNote}>Connected to the work behind the screen.</span>
  </div>
}

function GrowthScene() {
  return <div className={s.growthCanvas} aria-hidden="true">
    <div className={s.releaseStack}><div className={s.futurePlane}><span>NEXT / RELEASE</span><div/><Plus size={20}/></div><div className={s.middlePlane}><span>ROOM / TO GROW</span><div/></div><div className={s.basePlane}><span>YOUR / FOUNDATION</span><KoryxMark/><div/><i/></div></div>
    <div className={s.releaseTag}><span><Check size={12}/>First release</span><i/><span><Plus size={12}/>Next chapter</span></div>
    <span className={s.sceneNote}>Start with purpose. Build on it.</span>
  </div>
}
