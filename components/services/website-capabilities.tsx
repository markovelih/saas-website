'use client'

import {useId,useState} from 'react'
import Link from 'next/link'
import {ArrowRight,ArrowUpRight,CalendarDays,Check,LockKeyhole,Mail,UserRound} from 'lucide-react'
import {KoryxMark,MotionSurface,SignalPath} from '@/components/motion/motion-primitives'
import s from './website-capabilities.module.css'

type TraceTone='amber'|'violet'|'cyan'|'blue'
function TechTrace({d,tone,duration=5,delay=0}:{d:string;tone:TraceTone;duration?:number;delay?:number}){
 return <g className={s.trace} data-tone={tone}><path d={d} className={s.traceBase}/><SignalPath d={d} tone={tone} duration={duration} delay={delay} wire={false}/></g>
}
export function WebsiteSignature(){return <MotionSurface className={s.signature}>
 <div className={s.signatureMark}><KoryxMark/><span>ONE WEBSITE.<br/>EVERYTHING CONNECTED.</span></div>
 <svg viewBox="0 0 760 100" aria-hidden="true">{[95,285,475,665].map((x,i)=><g key={x}><TechTrace d={`M0 49H${x-40}Q${x} 49 ${x} 19`} tone={(['amber','violet','cyan','blue'] as const)[i]} duration={5.8} delay={-i*1.2}/><circle cx={x} cy="19" r="3" className={s.signatureDot}/><text x={x} y="82" textAnchor="middle">{['STORY','INTERACTION','CONNECTION','RELEASE'][i]}</text></g>)}</svg>
 </MotionSurface>}

function WindowDots(){return <span className={s.windowDots} aria-hidden="true"><i/><i/><i/></span>}
function ProductStack({colourful}:{colourful:boolean}){
 const id=useId().replaceAll(':','')
 const colours=colourful?['#0076dd','#cb2374','#d9940c']:['#484848','#666666','#969696']
 return <svg viewBox="0 0 240 112" className={s.products} aria-hidden="true">
  <defs>{colours.map((colour,i)=><linearGradient id={`${id}-${i}`} key={i} x1="0" y1="0" x2="1" y2="1"><stop stopColor={colour}/><stop offset="1" stopColor="#070707"/></linearGradient>)}</defs>
  {[0,1,2].map(i=><g key={i} transform={`translate(${i===0?136:i===1?107:79} ${i===0?19:i===1?13:7}) rotate(${i===0?12:i===1?4:-5} 35 42)`}>
   <path d="M23 8L12 13L0 29L12 39L19 32L17 87H65L63 32L70 39L82 29L70 13L59 8L49 4H33Z" fill={`url(#${id}-${i})`} stroke={colours[i]} strokeWidth="1.25"/>
   <path d="M33 4Q41 19 49 4M23 8L26 24M59 8L56 24M18 79H64M3 29L12 35M69 35L78 29" fill="none" stroke={colours[i]} strokeWidth=".8" opacity=".8"/>
   <path d="M24 12L16 17L7 29M62 12L68 17L75 29M21 35L20 74M60 35L62 74" fill="none" stroke="#ffffff" strokeWidth=".6" strokeDasharray="2 3" opacity=".35"/>
   <circle cx="41" cy="48" r="9" fill="#111a" stroke={colours[i]} strokeWidth=".6"/>
   <path d="M37 50V53L46 42H43ZM42 49L44 52H47L44 47Z" fill={colours[i]}/>
  </g>)}
 </svg>
}
function WelcomeWindow({audience,colourful,front}:{audience:string;colourful:boolean;front:boolean}){
 return <div className={s.welcomeWindow} data-colourful={colourful} data-front={front} aria-hidden="true">
  <WindowDots/>
  <div className={s.welcomeContent}><strong className={s.outlineTitle}>Good to see you,<br/>{audience}.</strong><div className={s.productLayout}><div className={s.productPreview}><span className={s.microLines}><i/><i/><i/></span><ProductStack colourful={colourful}/></div><i className={s.productSide}/></div><div className={s.productFooter}><i/><i/></div></div>
 </div>
}
function Personalization(){
 const [audience,setAudience]=useState(1),id=useId().replaceAll(':','')
 return <article className={s.feature} id="website-personalization">
  <p className={s.featureLead}><strong>Personalization.</strong> Give different visitors a more relevant welcome.</p>
  <MotionSurface className={s.personalizationScene} interactive label="Two layered website interfaces, with different content for creators and founders">
   <div className={s.personalizationPerspective} id={id}><WelcomeWindow audience="Creators" colourful={false} front={audience===0}/><WelcomeWindow audience="Founders" colourful front={audience===1}/></div>
   <button className={`${s.audienceBadge} ${s.creatorsBadge}`} aria-label="Explore the creators welcome" aria-pressed={audience===0} aria-controls={id} onClick={()=>setAudience(0)}><UserRound size={19}/></button>
   <button className={`${s.audienceBadge} ${s.foundersBadge}`} aria-label="Explore the founders welcome" aria-pressed={audience===1} aria-controls={id} onClick={()=>setAudience(1)}><UserRound size={19}/></button>
   <span className={s.visuallyHidden} role="status">{audience===0?'Creators':'Founders'} welcome in front.</span>
  </MotionSurface>
 </article>
}

function VariantWindow({variant,selected,onSelect}:{variant:'A'|'B';selected:boolean;onSelect:()=>void}){
 return <button className={s.variantWindow} data-variant={variant} aria-pressed={selected} onClick={onSelect} aria-label={`Explore variant ${variant}: ${variant==='A'?'Make a first impression':'Start your next chapter'}`}>
  <span className={s.variantChrome}><WindowDots/><span className={s.address}><LockKeyhole size={10}/>/start</span></span>
  <span className={s.variantPage}><span className={s.variantGrid}/><strong className={s.outlineTitle}>{variant==='A'?<>Make a first<br/>impression.</>:<>Start your<br/>next chapter.</>}</strong><span className={s.formStudy}><i/><i/><i/></span><span className={s.segment}>Variant {variant}{selected&&<Check size={11}/>}</span></span>
 </button>
}
function ABTesting(){
 const [variant,setVariant]=useState<'A'|'B'|null>(null),id=useId().replaceAll(':','')
 return <article className={s.feature} id="website-experiments">
  <p className={s.featureLead}><strong>A/B testing.</strong> Two invitations. Find the one that fits your audience.</p>
  <MotionSurface className={s.variantScene} label="A violet and turquoise signal branches into two dark website interfaces with different calls to action">
   <svg className={s.fork} viewBox="0 0 548 124" fill="none" aria-hidden="true">
    <defs><linearGradient id={id+'-gradient'} gradientUnits="userSpaceOnUse" x1="138" y1="0" x2="410" y2="0"><stop stopColor="#a640d9"/><stop offset=".48" stopColor="#d84878"/><stop offset="1" stopColor="#00ad9c"/></linearGradient></defs>
    <path className={s.forkBase} d="M138 108V57Q138 18 177 18H262M286 18H371Q410 18 410 57V108" stroke={`url(#${id}-gradient)`}/>
    <SignalPath d="M262 18H177Q138 18 138 57V108" tone="violet" duration={3.8} delay={-.7} wire={false}/><SignalPath d="M286 18H371Q410 18 410 57V108" tone="cyan" duration={3.8} delay={-1.4} wire={false}/>
    <path className={s.forkPulse} d="M260 18H265L269 10L274 27L279 9L284 18H289"/><path d="M131 102L138 116L145 102Z" fill="#a640d9"/><path d="M403 102L410 116L417 102Z" fill="#00ad9c"/>
   </svg>
   <VariantWindow variant="A" selected={variant==='A'} onSelect={()=>setVariant(current=>current==='A'?null:'A')}/><VariantWindow variant="B" selected={variant==='B'} onSelect={()=>setVariant(current=>current==='B'?null:'B')}/>
   <span className={s.visuallyHidden} role="status">{variant?`Variant ${variant} selected.`:'Explore either invitation.'}</span>
  </MotionSurface>
 </article>
}

function FeatureControl(){
 const [booking,setBooking]=useState(true),[enquiries,setEnquiries]=useState(true),id=useId().replaceAll(':','')
 return <article className={s.feature} id="website-feature-control">
  <p className={s.featureLead}><strong>Feature control.</strong> Introduce useful features at the right moment, with a release you can review.</p>
  <MotionSurface className={s.flagsScene} label="A working interface study with controls for booking and enquiry features">
   <div className={s.releaseWindow}>
    <div className={s.releaseChrome}><WindowDots/><span><LockKeyhole size={10}/>your-domain / preview</span><KoryxMark/></div>
    <div className={s.releaseContent}><span className={s.releaseEyebrow}>YOUR NEXT CHAPTER</span><strong className={s.outlineTitle}>Make room<br/>for what’s next.</strong><div className={s.availableActions} id={id}>
     {booking&&<Link href="/services/appointment-booking"><CalendarDays size={13}/>Explore a booking flow<ArrowUpRight size={12}/></Link>}
     {enquiries&&<Link href="/dashboard/new-order?intent=build&type=website"><Mail size={13}/>Plan your website<ArrowUpRight size={12}/></Link>}
     {!booking&&!enquiries&&<span>Choose a feature below to explore.</span>}
    </div></div>
    <div className={s.featureToolbar}><span className={s.toolbarMark}><KoryxMark/></span><label><input type="checkbox" role="switch" checked={booking} aria-controls={id} onChange={event=>setBooking(event.target.checked)}/><span className={s.switchTrack}/><span>Bookings</span></label><label><input type="checkbox" role="switch" checked={enquiries} aria-controls={id} onChange={event=>setEnquiries(event.target.checked)}/><span className={s.switchTrack}/><span>Enquiries</span></label></div>
   </div>
  </MotionSurface>
 </article>
}

export function WebsiteCapabilities(){return <div className={s.capabilities}>
 <div className={s.featureGrid}><Personalization/><ABTesting/><FeatureControl/></div>
 <p className={s.disclosure}>Interactive interface studies. Personalization, experiments and feature controls are agreed in your project scope. These examples do not submit enquiries or record experiment results.</p>
 <div className={s.capabilityLink}><span>A distinctive website. A considered working experience.</span><Link href="/dashboard/new-order?intent=build&type=website">Plan yours<ArrowRight size={13}/></Link></div>
 </div>}
