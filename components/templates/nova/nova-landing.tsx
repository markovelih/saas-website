'use client'

import {useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import {ArrowRight,ArrowLeft,Check,ChevronDown,X,Menu,Layers,Command,Orbit,Hexagon,Activity,PanelLeft,BarChart3,Folder,Search,Plus} from 'lucide-react'
import {ParticleScene} from './particle-scene'
import {SmoothDetails} from '@/components/ui/smooth-details'
import s from './nova.module.css'

const questions=[
  ['What is NOVA and how does it work?','NOVA brings projects, collaboration, analytics and everyday workflows into one clear workspace. Explore this concept to see how a focused product experience can look and feel.'],
  ['Can I try NOVA before committing to a paid plan?','You can explore the interactive product preview on this page without an account or payment. The plans shown here demonstrate a SaaS pricing layout.'],
  ['How does NOVA keep my work private?','This concept uses local sample data. It does not connect to your accounts or upload your files. A production product would have security and access controls designed around its requirements.'],
  ['Can I connect NOVA with my existing tools?','The design makes room for integrations with your favourite tools. For a real product, we would scope the connections your team needs before development.'],
  ['What kind of support is available?','The pricing cards illustrate different support options. Your own product can offer a help centre, email support and a dedicated team experience.'],
  ['Can I change my plan anytime?','This is a design preview, so there is no subscription to manage. In a live product, plan changes and billing would follow its published terms.'],
  ['Does exploring this website cost anything?','No. You can browse the entire concept and its product preview for free. No payment details are requested.'],
  ['Can this design be adapted to my business?','Yes. Koryx can use this direction as a starting point and tailor the brand, content, features and interactions to your project.'],
]
const plans=[
  {name:'Starter',price:'29',description:'Perfect for small teams getting started',items:['Up to 5 team members','10 GB storage','Basic analytics','Email support','Standard integrations']},
  {name:'Professional',price:'79',description:'Best for growing businesses',popular:true,items:['Up to 25 team members','100 GB storage','Advanced analytics','Priority support','All integrations','Custom workflows','API access']},
  {name:'Enterprise',price:'Custom',description:'For large organizations',items:['Unlimited team members','Flexible storage','Enterprise analytics','Dedicated support','Custom integrations','Advanced access controls','Service agreements','Deployment options']},
]

function Brand(){return <span className={s.brand}><svg width="25" height="25" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M9 3h13l7 8v13l-8 6H8l-6-8V10z m3 7 9 1 3 8-6 5-8-4z" fill="currentColor" fillRule="evenodd"/><circle cx="27" cy="4" r="4" fill="#737373"/></svg><span>NOVA</span></span>}

function LogoRibbon(){return <div className={s.logoWindow}><div className={s.logoRibbon}>{[0,1].map(copy=><div key={copy} className={s.logoGroup} aria-hidden={copy===1}><span><Layers size={23}/><b>Layers</b></span><span><Hexagon size={24}/><b>Quotient</b></span><span><Command size={24}/><b>Capsule</b></span><span><Orbit size={25}/><b>Orbit</b></span><span><Activity size={24}/><b>Segment</b></span></div>)}</div></div>}

export function NovaLanding(){
  const [menu,setMenu]=useState(false),[modal,setModal]=useState<'tour'|'start'|'signin'|'info'|null>(null),[plan,setPlan]=useState('Professional'),[tour,setTour]=useState(0),[info,setInfo]=useState('About NOVA')
  const header=useRef<HTMLElement>(null),menuButton=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    if(!menu)return
    function closeOnEscape(event:KeyboardEvent){if(event.key==='Escape'){setMenu(false);menuButton.current?.focus()}}
    function closeOutside(event:PointerEvent){if(!header.current?.contains(event.target as Node))setMenu(false)}
    document.addEventListener('keydown',closeOnEscape);document.addEventListener('pointerdown',closeOutside)
    return()=>{document.removeEventListener('keydown',closeOnEscape);document.removeEventListener('pointerdown',closeOutside)}
  },[menu])
  function start(name='Professional'){setPlan(name);setModal('start');setMenu(false)}
  function openInfo(title:string){setInfo(title);setModal('info')}
  return <div className={s.root} data-nova-template>
    <a href="#nova-main" className={s.skip}>Skip to content</a>
    <header ref={header} className={s.navbar}>
      <a href="#top" className={s.brandLink} aria-label="NOVA home" onClick={()=>setMenu(false)}><Brand/></a>
      <nav aria-label="NOVA navigation" className={s.desktopNav}>{[['Features','#features'],['Pricing','#pricing'],['About','#about'],['FAQ','#faq']].map(([label,href])=><a key={href} href={href}>{label}</a>)}</nav>
      <div className={s.navActions}><button className={s.signin} onClick={()=>setModal('signin')}>Sign In</button><button className={s.navCta} onClick={()=>start()}>Get Started</button><button ref={menuButton} className={s.menuToggle} aria-expanded={menu} aria-controls="nova-mobile-menu" aria-label={menu?'Close menu':'Open menu'} onClick={()=>setMenu(v=>!v)}>{menu?<X size={18}/>:<Menu size={18}/>}</button></div>
      {menu&&<nav className={s.mobileNav} id="nova-mobile-menu" aria-label="NOVA mobile navigation">{[['Features','#features'],['Pricing','#pricing'],['About','#about'],['FAQ','#faq']].map(([label,href])=><a key={href} href={href} onClick={()=>setMenu(false)}>{label}<ArrowRight size={16}/></a>)}<button onClick={()=>{setMenu(false);setModal('signin')}}>Explore the workspace <ArrowRight size={16}/></button></nav>}
    </header>
    <main id="nova-main">
      <section className={s.hero} id="top" aria-labelledby="nova-title">
        <ParticleScene/>
        <h1 id="nova-title" className={s.srOnly}>NOVA. One platform. Endless possibilities.</h1>
        <div className={s.heroCopy}><p>Everything you need. One place to build.</p><div className={s.buttons}><button className={s.primary} onClick={()=>start()}>Start Free Trial <ArrowRight size={15}/></button><button className={s.secondary} onClick={()=>{setTour(0);setModal('tour')}}>Watch Demo</button></div></div>
        <div className={s.partners}><p>Powering the best<br/>teams</p><LogoRibbon/></div>
      </section>
      <section id="features" className={`${s.section} ${s.features}`} aria-labelledby="features-title">
        <div className={s.sectionHeading}><h2 id="features-title">Powerful Features</h2><p>Everything you need to take your business to the next level</p></div>
        <div className={s.featureGrid}>
          {[['Advanced Analytics','Real-time Insights','Get deep insights into your business performance with clear analytics and reporting.'],['Team Collaboration','Seamless','Work together effortlessly.'],['Lightning Performance','Always ready','A fast, focused experience for your everyday work.'],['Enterprise Security','Built for trust','Thoughtful access controls that put your team in control.'],['Global Scale & Mobile Ready','Worldwide','Bring your workspace anywhere, with a responsive experience on every screen.']].map(([label,title,body],i)=><article key={title} className={s.feature} data-size={i===0||i===3?'wide':i===4?'full':'normal'}><div><span>{label}</span><h3>{title}</h3><p>{body}</p></div></article>)}
        </div>
      </section>
      <section id="pricing" className={`${s.section} ${s.pricing}`} aria-labelledby="pricing-title">
        <div className={s.sectionHeading}><h2 id="pricing-title">Simple, Transparent Pricing</h2><p>Choose the perfect plan for your business needs. No hidden fees, no surprises.</p></div>
        <div className={s.planGrid}>{plans.map(p=><article key={p.name} className={s.plan} data-popular={p.popular||undefined}>{p.popular&&<span className={s.popular}>Most Popular</span>}<h3>{p.name}</h3><p className={s.price}>{p.price!=='Custom'&&'$'}{p.price}{p.price!=='Custom'&&<span>/month</span>}</p><p className={s.planDescription}>{p.description}</p><ul>{p.items.map(item=><li key={item}><Check size={15}/>{item}</li>)}</ul><button className={p.popular?s.primary:s.secondary} onClick={()=>start(p.name)}>{p.price==='Custom'?'Contact Sales':'Get Started'}<ArrowRight size={15}/></button></article>)}</div>
        <p className={s.planNote}>A pricing concept. Explore the design — no payment details required.</p><p className={s.salesNote}>Need a custom solution? <button onClick={()=>start('Enterprise')}>Contact our team</button></p>
      </section>
      <section id="faq" className={`${s.section} ${s.faq}`} aria-labelledby="faq-title">
        <div className={s.sectionHeading}><h2 id="faq-title">Frequently Asked Questions</h2><p>Everything you need to know about NOVA. Can’t find what you’re looking for?<br/>Contact our team.</p></div>
        <div className={s.faqList}>{questions.map(([q,a])=><SmoothDetails key={q} className={s.question}><summary>{q}<ChevronDown size={16}/></summary><div><p>{a}</p></div></SmoothDetails>)}</div>
      </section>
      <section id="about" className={s.finalCta} aria-labelledby="cta-title"><ParticleScene variant="orbit"/><div><h2 id="cta-title">Ready to Transform Your Business?</h2><p>Bring your team, ideas and everyday work together.<br/>Build your next chapter with NOVA.</p><div className={s.buttons}><button className={s.primary} onClick={()=>start()}>Start Your Free Trial<ArrowRight size={15}/></button><button className={s.secondary} onClick={()=>start('Enterprise')}>Contact Sales</button></div></div></section>
    </main>
    <footer className={s.footer}><div className={s.footerGrid}><div><a href="#top" aria-label="NOVA home"><Brand/></a><p>Empowering businesses with a clearer way to work.<br/>Take control of your next chapter with NOVA.</p><em>“Everything you need. One place to build.”</em></div><div><h3>Product</h3><a href="#features">Features</a><a href="#pricing">Pricing</a><button onClick={()=>openInfo('Security, thoughtfully designed')}>Security</button><button onClick={()=>openInfo('Everything, connected')}>Integrations</button></div><div><h3>Company</h3><a href="#about">About</a><button onClick={()=>openInfo('Notes from NOVA')}>Blog</button><button onClick={()=>openInfo('Made for people')}>Careers</button><button onClick={()=>start('Enterprise')}>Contact</button></div></div><div className={s.footerBottom}><span>© {new Date().getFullYear()} NOVA. A website concept by Koryx.</span><Link href="/catalog">Back to catalog<ArrowRight size={13}/></Link></div></footer>
    <Dialog.Root open={modal!==null} onOpenChange={open=>{if(!open)setModal(null)}}><Dialog.Portal><Dialog.Overlay className={s.backdrop}/><Dialog.Content className={`${s.root} ${s.dialog}`}><Dialog.Close className={s.close} aria-label="Close dialog"><X size={20}/></Dialog.Close>
      {modal==='tour'?<><div className={s.tourTop}><Brand/><span>Product preview</span></div><Dialog.Title className={s.dialogTitle}>{['A little more clarity.','Your work, in motion.','The bigger picture.'][tour]}</Dialog.Title><Dialog.Description className={s.dialogDescription}>{['One view for your team, projects and everything in between.','Keep ideas moving from the first thought to the final detail.','Understand what is working, and where to go next.'][tour]}</Dialog.Description><DemoWorkspace page={tour}/><div className={s.tourControls}><button className={s.iconButton} aria-label="Previous preview" onClick={()=>setTour(v=>(v+2)%3)}><ArrowLeft size={17}/></button><div>{[0,1,2].map(i=><button key={i} data-active={tour===i} aria-label={'Preview '+(i+1)} aria-pressed={tour===i} onClick={()=>setTour(i)}/>)}</div><button className={s.iconButton} aria-label="Next preview" onClick={()=>setTour(v=>(v+1)%3)}><ArrowRight size={17}/></button></div></>:<><span className={s.dialogEyebrow}>NOVA / A KORYX CONCEPT</span><Dialog.Title className={s.dialogTitle}>{modal==='signin'?'Step into your workspace.':modal==='info'?info:'Make this direction yours.'}</Dialog.Title><Dialog.Description className={s.dialogDescription}>{modal==='signin'?'Explore NOVA’s interactive workspace preview. No account is needed.':modal==='info'?'NOVA is a concept for a connected, thoughtful SaaS product. Its content and interactions show what this design direction could become for your business.':`You’re exploring the ${plan} layout. NOVA is a design concept, so there is no subscription or charge. Koryx can adapt this experience to your brand and product.`}</Dialog.Description><div className={s.dialogActions}>{modal==='signin'?<button className={s.primary} onClick={()=>{setTour(0);setModal('tour')}}>Explore workspace<ArrowRight size={16}/></button>:<Link className={s.primary} href="/dashboard/new-order?type=website">Start your project<ArrowRight size={16}/></Link>}<button className={s.secondary} onClick={()=>setModal(null)}>Keep exploring</button></div></>}
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>
}

function DemoWorkspace({page}:{page:number}){
  return <div className={s.workspace} data-page={page}><aside><Command size={20}/><span><PanelLeft size={16}/></span><span><Folder size={16}/></span><span><BarChart3 size={16}/></span></aside><div className={s.workspaceMain}><div className={s.workspaceHeader}><span>{['Overview','Projects','Analytics'][page]}</span><div><Search size={13}/><Plus size={13}/><i>N</i></div></div><div className={s.workspaceGreeting}><p>YOUR WORKSPACE</p><h3>{['Good things, coming together.','From idea to done.','See the progress.'][page]}</h3><span>Sample workspace · Local preview</span></div>{page===1?<div className={s.kanban}>{['Planned','In progress','Complete'].map((status,i)=><div key={status}><span>{status}<i>{i+2}</i></span>{['Website experience','Product workspace','New chapter'].slice(0,i===1?3:2).map((name,j)=><article key={name}><small>PROJECT / 0{i+j+1}</small><p>{name}</p><div><i/><i/><b>↗</b></div></article>)}</div>)}</div>:<><div className={s.metricGrid}>{[['Active projects','12','+3 this month'],['Tasks completed','84','+18 this week'],['Team activity','98%','Looking good']].map(([label,value,note])=><article key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div><div className={s.chart}><div><span>{page===2?'Workspace activity':'Your momentum'}</span><small>Last 7 days</small></div><svg viewBox="0 0 600 150" role="img" aria-label="Sample activity trend increasing over seven days"><defs><linearGradient id="nova-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fff" stopOpacity=".15"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient></defs><path d="M0 120C35 125 45 80 80 90S140 115 180 75S230 60 270 70S330 100 365 55S420 80 460 40S520 45 555 25S590 20 600 8V150H0Z" fill="url(#nova-chart-fill)"/><path d="M0 120C35 125 45 80 80 90S140 115 180 75S230 60 270 70S330 100 365 55S420 80 460 40S520 45 555 25S590 20 600 8" fill="none" stroke="#ddd" strokeWidth="2"/></svg></div></>}</div></div>
}
