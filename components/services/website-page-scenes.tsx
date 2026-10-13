'use client'

import {useId,useState} from 'react'
import {ArrowUpRight,Check,Code2,Globe2,Layers,LockKeyhole,Monitor,Smartphone,Sparkles} from 'lucide-react'
import {KoryxMark,MotionSurface,SignalPath} from '@/components/motion/motion-primitives'
import s from './website-page-scenes.module.css'

export function InterfaceChrome({address}:{address:string}){return <div className={s.chrome}><span className={s.dots} aria-hidden="true"><i/><i/><i/></span><span><LockKeyhole size={10}/>{address}</span><KoryxMark/></div>}

function Editions(){const id=useId().replaceAll(':','');return <svg viewBox="0 0 320 190" className={s.editions} aria-hidden="true"><defs>{['#ac50dd','#e09932','#00b5a3'].map((c,i)=><linearGradient id={id+i} key={c} x1="0" y1="0" x2="1" y2="1"><stop stopColor={c}/><stop offset="1" stopColor="#111"/></linearGradient>)}</defs>{[0,1,2].map(i=><g key={i} transform={`translate(${38+i*72} ${30-i*7}) rotate(${i*12-12} 56 70)`}><path d="M0 0H109L118 9V144H9L0 135Z" fill={`url(#${id+i})`} stroke={['#c46cf0','#edb15a','#35d2c0'][i]} strokeWidth=".8"/><path d="M109 0V135H0M109 135L118 144" stroke="#fff" strokeOpacity=".3" fill="none"/><text x="10" y="18" fill="#fff" fontSize="5" letterSpacing="1">KORYX / EDITION 0{i+1}</text><text x="10" y="54" fill="none" stroke="#fff" strokeWidth=".45" fontSize="24" letterSpacing="-1">NEXT.</text><path d="M12 85L74 64L99 93L35 114ZM12 85V102L35 131V114M35 131L99 110V93" fill="none" stroke="#fff" strokeOpacity=".6"/><path d="M10 124H20M80 124H99" stroke="#fff" strokeOpacity=".6"/></g>)}</svg>}

function BrandPage({compact=false}:{compact?:boolean}){return <div className={s.brandPage} data-compact={compact} aria-hidden="true"><div className={s.brandNav}><span><KoryxMark/>YOUR BRAND</span><span>STORY / COLLECTION / CONTACT</span></div><strong className={s.outline}>Made for<br/>what’s next.</strong><div className={s.brandProducts}><span><i/><i/><i/><small>A DISTINCTIVE<br/>POINT OF VIEW.</small></span><Editions/></div><div className={s.brandFooter}><span>EXPLORE THE COLLECTION</span><ArrowUpRight size={12}/></div></div>}

export function WebsiteHeroScene(){return <MotionSurface className={s.heroScene} interactive label="Layered custom website and development interfaces">
 <div className={`${s.window} ${s.heroBack}`} aria-hidden="true"><InterfaceChrome address="your-brand / in development"/><div className={s.buildBody}><span>THE DETAILS, CONNECTED.</span><strong className={s.outline}>Designed.<br/>Developed.</strong><div className={s.buildLines}><i/><i/><i/><i/><i/></div><Code2 className={s.buildIcon}/></div></div>
 <div className={`${s.window} ${s.heroFront}`}><InterfaceChrome address="your-brand / next chapter"/><BrandPage/></div>
 <span className={`${s.orbitBadge} ${s.designBadge}`} aria-hidden="true"><Sparkles size={21}/></span><span className={`${s.orbitBadge} ${s.codeBadge}`} aria-hidden="true"><Code2 size={21}/></span>
 <div className={s.heroCaption}><span>YOUR IDENTITY.</span><span>A WORKING EXPERIENCE.</span></div>
</MotionSurface>}

export function ResponsiveScene(){const [mobile,setMobile]=useState(false),id=useId();return <div className={s.responsiveStudy}>
 <div className={s.deviceControls} role="group" aria-label="Preview a responsive website"><button aria-pressed={!mobile} aria-controls={id} onClick={()=>setMobile(false)}><Monitor size={14}/>Desktop</button><button aria-pressed={mobile} aria-controls={id} onClick={()=>setMobile(true)}><Smartphone size={14}/>Mobile</button></div>
 <MotionSurface className={s.responsiveScene} label="A website layout adapts to desktop and mobile screens"><div id={id} className={`${s.window} ${s.responsiveWindow}`} data-mobile={mobile}><InterfaceChrome address="your-brand / responsive"/><BrandPage compact={mobile}/></div><span className={s.deviceRuler} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></span></MotionSurface>
 <p className={s.caption} role="status">{mobile?'The same identity. A layout made for your hand.':'Room to explore. A layout made for the wider view.'}</p>
</div>}

const stages=[
 {name:'Define',path:'brief',title:<>A clear<br/>starting point.</>,text:'Your goals, audience, pages and important customer journeys shape a written scope, quote and content plan.',items:['Goals & audience','Pages & customer journeys','Scope, quote & content responsibilities'],tone:'amber' as const},
 {name:'Develop',path:'preview',title:<>Try it.<br/>Refine it.</>,text:'Review a working preview. Explore the design and try the agreed features as they take shape, with feedback checked against your scope.',items:['Working design preview','Agreed features & flows','Review & scoped refinements'],tone:'violet' as const},
 {name:'Release',path:'launch',title:<>Your website.<br/>Your address.</>,text:'Approve the completed work, arrange any outstanding agreed balance and launch with domain connection and a practical handover.',items:['Final review & approval','Agreed balance before release','Domain connection & handover'],tone:'cyan' as const},
]
export function DeliveryScene(){const [stage,setStage]=useState(0),id=useId(),item=stages[stage];return <div className={s.deliveryStudy}>
 <div className={s.stageControls} role="group" aria-label="Explore the website project stages">{stages.map((step,i)=><button key={step.name} aria-pressed={i===stage} aria-controls={id} onClick={()=>setStage(i)}><span>0{i+1}</span>{step.name}<ArrowUpRight size={12}/></button>)}</div>
 <MotionSurface className={s.deliveryScene} label="A project workspace illustrates the selected stage"><div className={`${s.window} ${s.deliveryWindow}`} id={id} data-stage={stage}>
  <InterfaceChrome address={'your-project / '+item.path}/><div className={s.deliveryContent}><span className={s.micro}>KORYX / YOUR PROJECT</span><strong className={s.outline}>{item.title}</strong><div className={s.reviewList}>{item.items.map((text,i)=><div key={text}><span>0{i+1}</span>{text}<Check size={12}/></div>)}</div><div className={s.reviewStamp}><Layers size={12}/><span>{['DIRECTION','WORKING PREVIEW','RELEASE & HANDOVER'][stage]}</span></div></div>
 </div><svg className={s.deliverySignal} viewBox="0 0 600 90" fill="none" aria-hidden="true"><path d="M0 40H212Q240 40 240 12H355Q382 12 382 40H600" stroke="#272727"/><SignalPath d="M0 40H212Q240 40 240 12H355Q382 12 382 40H600" tone={item.tone} duration={4}/></svg></MotionSurface>
 <p className={s.stageDescription} role="status">{item.text}</p>
</div>}

export function FoundationScene(){return <MotionSurface className={s.foundationScene} label="A domain window and search preview illustrate website launch foundations">
 <div className={`${s.window} ${s.domainWindow}`}><InterfaceChrome address="your-domain / launch foundations"/><div className={s.domainBody}><Globe2 size={20}/><strong className={s.outline}>Your place.<br/>On the web.</strong><div className={s.domainRow}><LockKeyhole size={12}/><span>your-brand.ca</span><Check size={13}/></div></div></div>
 <div className={`${s.window} ${s.searchWindow}`} aria-hidden="true"><span className={s.searchLabel}>SEARCH PREVIEW / ILLUSTRATIVE</span><span className={s.searchAddress}><Globe2 size={11}/>your-brand.ca</span><strong>Your brand. Beautifully presented.</strong><p>A clear title. A useful description.<br/>The right introduction to your website.</p></div>
 <span className={`${s.orbitBadge} ${s.domainBadge}`} aria-hidden="true"><Globe2 size={18}/></span>
</MotionSurface>}

export function LaunchScene(){return <MotionSurface className={s.launchScene} label="An illustrated launch window for your next website">
 <svg viewBox="0 0 600 110" fill="none" aria-hidden="true"><path d="M70 0V40Q70 76 106 76H494Q530 76 530 40V0" stroke="#282828"/><SignalPath d="M70 0V40Q70 76 106 76H300" tone="violet" duration={4}/><SignalPath d="M530 0V40Q530 76 494 76H300" tone="cyan" duration={4} delay={-2}/></svg>
 <div className={s.launchAddress}><KoryxMark/><span>YOUR NEXT CHAPTER</span><ArrowUpRight size={19}/></div>
</MotionSurface>}
