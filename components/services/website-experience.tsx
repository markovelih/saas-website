import Link from 'next/link'
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUpRight,Check,Plus} from 'lucide-react'
import {DesignCanvas} from './logistics-design'
import {WebsiteCapabilities} from './website-capabilities'
import {DeliveryScene,FoundationScene,InterfaceChrome,LaunchScene,ResponsiveScene,WebsiteHeroScene} from './website-page-scenes'
import {serviceBySlug} from './catalog'
import {paymentPolicy} from '@/lib/payments/policy'
import s from './website-experience.module.css'

export function WebsiteExperience(){
 const service=serviceBySlug('business-websites')!
 return <div className={s.page} data-website-experience>
  <header className={s.hero}>
   <div className={s.heroTop}><Link href="/services"><ArrowLeft size={12}/>All services</Link><span>KORYX / CUSTOM WEBSITES</span></div>
   <div className={s.heroMain}><div className={s.heroCopy}><span className={s.eyebrow}>DESIGN MEETS DEVELOPMENT.</span><h1>Beyond<br/><span>the ordinary.</span></h1><p>Your identity. Your ambition. A custom website where distinctive design and useful customer journeys work together.</p><div className={s.heroActions}><Link className={s.primary} href="/dashboard/new-order?intent=build&type=website">Plan your website<ArrowUpRight size={16}/></Link><a href="#experience" className={s.textLink}>Explore<ArrowDown size={14}/></a></div></div><WebsiteHeroScene/></div>
   <nav className={s.chapterNav} aria-label="Website service chapters"><a href="#experience"><span>01 /</span>The experience<ArrowDown size={12}/></a><a href="#craft"><span>02 /</span>The possibilities<ArrowDown size={12}/></a><a href="#delivery"><span>03 /</span>The release<ArrowDown size={12}/></a></nav>
  </header>
  <DesignCanvas/>
  <section className={s.splitFeature} id="responsive"><div className={s.featureCopy}><span className={s.eyebrow}>DESIGNED FOR THE WAY PEOPLE EXPLORE</span><h2>One identity.<br/><span>Every screen.</span></h2><p className={s.lead}><strong>Responsive design.</strong> A considered experience on a wider screen. A natural journey on the one in your hand.</p><p>We shape the layout, navigation and interactions around how visitors actually use your website. Try the two views.</p></div><ResponsiveScene/></section>
  <section className={s.craft} id="craft"><header className={s.sectionHeading}><span className={s.eyebrow}>02 / THE POSSIBILITIES</span><h2>Built to connect.<br/><span>Made to work.</span></h2><p>Thoughtful details can turn attention into a useful next step. Explore three ways a custom website can adapt to your business.</p></header><WebsiteCapabilities/></section>
  <section className={s.splitFeature} id="delivery"><div className={s.featureCopy}><span className={s.eyebrow}>03 / THE RELEASE</span><h2>From possibility.<br/><span>To presence.</span></h2><p className={s.lead}><strong>A project you can follow.</strong> A written scope. A working preview. Your review before launch.</p><p>Explore the stages to see what we agree, what you can review and how your website reaches its own address.</p><Link href="/process" className={s.textLink}>Explore our process<ArrowUpRight size={13}/></Link></div><DeliveryScene/></section>
  <section className={s.splitFeature}><div className={s.featureCopy}><span className={s.eyebrow}>YOUR WEBSITE / THE FOUNDATION</span><h2>The details.<br/><span>Considered.</span></h2><p className={s.lead}><strong>Beyond the first impression.</strong> A clear structure, useful metadata and a considered release belong to the same website.</p><div className={s.deliverables}>{service.deliverables.map((item,i)=><p key={item}><span>0{i+1}</span>{item}<Check size={13}/></p>)}</div></div><FoundationScene/></section>
  <section className={s.faq}><header className={s.featureCopy}><span className={s.eyebrow}>BEFORE YOUR NEXT CHAPTER</span><h2>A little clarity.<br/><span>Before we begin.</span></h2><p>Content, ownership and payments. The practical details that help a project start well.</p></header><div className={s.answerWindow}><InterfaceChrome address="your-project / useful answers"/><div className={s.answerContent}>{service.questions.map(([question,answer])=><details key={question}><summary>{question}<Plus size={17}/></summary><p>{answer}</p></details>)}<details><summary>How do project payments work?<Plus size={17}/></summary><p>{paymentPolicy} The remaining balance applies only to the split plan. Full upfront payment leaves no further payment for the same agreed scope. <Link href="/terms">View project terms.</Link></p></details></div></div></section>
  <section className={s.next} id="next"><span className={s.eyebrow}>YOUR NEXT CHAPTER / MADE WITH KORYX</span><h2>Make your<br/><span>presence felt.</span></h2><p>Bring the idea. The ambition. The details that matter.<br/>We’ll help shape what comes next.</p><LaunchScene/><Link href="/dashboard/new-order?intent=build&type=website" className={s.primary}>Tell us what you have in mind<ArrowRight size={17}/></Link><div className={s.nextMeta}><Link href="/pricing">Explore project budgets<ArrowUpRight size={12}/></Link><span>DESIGNED. DEVELOPED. DELIVERED.</span></div></section>
 </div>
}
