import Link from 'next/link'
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUpRight,Check,Plus} from 'lucide-react'
import {DesignCanvas} from './logistics-design'
import {WebsiteCapabilities,WebsiteSignature} from './website-capabilities'
import {serviceBySlug} from './catalog'
import {paymentPolicy} from '@/lib/payments/policy'
import s from './website-experience.module.css'

function Mark(){return <svg viewBox="0 0 128 128" fill="currentColor" aria-hidden="true"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg>}
export function WebsiteExperience(){
 const service=serviceBySlug('business-websites')!
 return <div className={s.page} data-website-experience>
  <header className={s.hero}>
   <div className={s.heroTop}><Link href="/services"><ArrowLeft size={12}/>All services</Link><span>KORYX / CUSTOM WEBSITES</span><span>DESIGN MEETS DEVELOPMENT.</span></div>
   <div className={s.heroMain}><div><span className={s.eyebrow}>MADE AROUND YOUR BUSINESS</span><h1>Beyond<br/><span>the ordinary.</span></h1></div><div className={s.heroPurpose}><span>BUILT AROUND THE NEXT STEP.</span><p>Tell the story.<br/>Make the connection.<br/><strong>Move the business forward.</strong></p></div></div>
   <div className={s.heroBottom}><p>Your brand, made unmistakable. Custom websites where design, motion and useful customer journeys work together.</p><div className={s.heroActions}><Link className={s.primary} href="/dashboard/new-order?intent=build&type=website">Plan your website<ArrowUpRight size={16}/></Link><a href="#experience" className={s.textLink}>Feel the experience<ArrowDown size={14}/></a></div></div>
   <WebsiteSignature/><nav className={s.chapterNav} aria-label="Website service chapters"><a href="#experience"><span>01 /</span>The experience<ArrowDown size={12}/></a><a href="#craft"><span>02 /</span>The possibilities<ArrowDown size={12}/></a><a href="#next"><span>03 /</span>Your next chapter<ArrowDown size={12}/></a></nav>
  </header>
  <DesignCanvas/>
  <section className={s.interlude}><span className={s.eyebrow}>THE DETAIL IS THE DIFFERENCE.</span><p>When design and technology<br/>move together,<br/><span>a website becomes an experience.</span></p><div><span>01</span><i/><span>EVERY INTERACTION HAS A PURPOSE.</span></div></section>
  <section className={s.craft} id="craft"><header className={s.sectionHeading}><div><span className={s.eyebrow}>02 / EVERY INTERACTION HAS A PURPOSE</span><h2>From attention.<br/><span>To action.</span></h2></div><p>A relevant welcome. A different invitation. A feature introduced with care. Explore the details that can make a website work better for your business.</p></header><WebsiteCapabilities/></section>
  <section className={s.delivery}><div><span className={s.eyebrow}>A RELEASE YOU CAN REVIEW</span><h2>From the first idea.<br/><span>To your own address.</span></h2><p>A written scope. Working previews. Your review before launch. A process that keeps the next step clear.</p></div><div className={s.deliverySteps}>{[['01','Define the direction.','Your goals, audience, pages and important journeys. A clear scope, quote and content plan.'],['02','Make it work beautifully.','Explore the working preview. Review the design and try the agreed features as they take shape.'],['03','Review. Refine. Release.','Approve the completed work, arrange any outstanding agreed balance and launch with a practical handover.']].map(([n,title,body])=><div key={n}><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div></section>
  <section className={s.included}><div><span className={s.eyebrow}>YOUR WEBSITE / THE FOUNDATION</span><h2>Considered from<br/><span>start to finish.</span></h2></div><div>{service.deliverables.map((item,i)=><p key={item}><span>0{i+1}</span>{item}<Check size={13}/></p>)}</div></section>
  <section className={s.faq}><header><span className={s.eyebrow}>BEFORE YOUR NEXT CHAPTER</span><h2>A few useful answers.</h2></header><div>{service.questions.map(([question,answer])=><details key={question}><summary>{question}<Plus size={17}/></summary><p>{answer}</p></details>)}<details><summary>How do project payments work?<Plus size={17}/></summary><p>{paymentPolicy} The remaining balance applies only to the split plan. Full upfront payment leaves no further payment for the same agreed scope. <Link href="/terms">View project terms.</Link></p></details></div></section>
  <section className={s.next} id="next"><div className={s.nextTop}><span className={s.eyebrow}>03 / YOUR NEXT CHAPTER</span><Mark/></div><h2>Make your<br/><span>presence felt.</span></h2><div className={s.nextBottom}><p>Bring the idea. The ambition. The details that matter.<br/>We’ll help shape what comes next.</p><Link href="/dashboard/new-order?intent=build&type=website" className={s.primary}>Tell us what you have in mind<ArrowRight size={17}/></Link></div><div className={s.nextMeta}><Link href="/pricing">Explore project budgets<ArrowUpRight size={12}/></Link><span>DESIGNED. DEVELOPED. DELIVERED.</span></div></section>
 </div>
}
