'use client'

import {useId,useState} from 'react'
import {ArrowDown,ArrowRight,ArrowUpRight,CalendarDays,Check,Database,Mail,MousePointer2,Search,ShoppingBag,Workflow} from 'lucide-react'
import {KoryxMark,MotionSurface,SignalPath} from '@/components/motion/motion-primitives'
import s from './website-capabilities.module.css'

type TraceTone='amber'|'violet'|'cyan'|'blue'
function TechTrace({d,tone,active=true,duration=5,delay=0}:{d:string;tone:TraceTone;active?:boolean;duration?:number;delay?:number}){return <g className={s.trace} data-tone={tone} data-active={active}><path d={d} className={s.traceBase}/><SignalPath d={d} tone={tone} active={active} duration={duration} delay={delay} wire={false}/></g>}
const tones=['amber','violet','cyan'] as const
const goals=[
 {name:'Enquiries',action:'Start a conversation',icon:Mail,title:'Give interest a useful next step.',body:'A focused enquiry flow connects the visitor’s question with the information your team needs to reply.',details:['Clear calls to action','Useful form fields','Confirmation and next steps']},
 {name:'Bookings',action:'Choose an appointment',icon:CalendarDays,title:'Make the calendar part of the journey.',body:'Services, availability and confirmation can become one considered flow, built around the way your business works.',details:['Service and time selection','Agreed availability rules','Booking confirmations']},
 {name:'Purchases',action:'Discover a product',icon:ShoppingBag,title:'Connect the story to the product.',body:'Product discovery, selection and checkout can be scoped as an e-commerce experience, with a supported payment provider.',details:['Product discovery','Cart and checkout scope','Payment-provider integration']},
]
function BrandNode({x,y,label=true}:{x:number;y:number;label?:boolean}){return <g className={s.brandNode}><circle cx={x} cy={y} r="35"/><circle cx={x} cy={y} r="45"/><svg x={x-24} y={y-24} width="48" height="48" viewBox="0 0 128 128" fill="currentColor"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg>{label&&<text x={x} y={y+65} textAnchor="middle">YOUR WEBSITE</text>}</g>}

export function WebsiteSignature(){return <MotionSurface className={s.signature}>
 <div className={s.signatureMark}><KoryxMark/><span>ONE WEBSITE.<br/>EVERYTHING CONNECTED.</span></div>
 <svg viewBox="0 0 760 100" aria-hidden="true">{[95,285,475,665].map((x,i)=><g key={x}><TechTrace d={`M0 49H${x-40}Q${x} 49 ${x} 19`} tone={(['amber','violet','cyan','blue'] as const)[i]} duration={5.8} delay={-i*1.2}/><circle cx={x} cy="19" r="3" className={s.signatureDot}/><text x={x} y="82" textAnchor="middle">{['STORY','INTERACTION','CONNECTION','RELEASE'][i]}</text></g>)}</svg>
 </MotionSurface>}

function JourneyDiagram({goal,mobile}:{goal:number;mobile:boolean}){
 const selected=goals[goal],Icon=selected.icon
 const center=mobile?180:380,cy=mobile?205:190,endX=mobile?180:680,endY=mobile?345:190
 const sources=mobile?[[64,55],[180,55],[296,55]]:[[70,90],[70,190],[70,290]]
 return <svg className={mobile?s.mobileDiagram:s.desktopDiagram} viewBox={mobile?'0 0 360 415':'0 0 760 380'} aria-hidden="true">
  {sources.map(([x,y],i)=>{const I=[Search,MousePointer2,ArrowUpRight][i];const d=mobile?`M${x} ${y+36}V115Q${x} 143 ${center} 143V${cy-45}`:`M${x+100} ${y}H240Q300 ${y} 300 ${cy}H${center-45}`;return <g key={i}><TechTrace d={d} tone={(['amber','violet','cyan'] as const)[i]} duration={5.5} delay={-i*1.65}/><I x={x-10} y={y-10} width="20" height="20" strokeWidth={1.2} className={s.diagramIcon}/><text x={mobile?x:x+22} y={mobile?y+32:y+5} textAnchor={mobile?'middle':'start'} className={s.diagramText}>{['Search','Campaign','Direct'][i]}</text></g>})}
  <BrandNode x={center} y={cy}/>
  <TechTrace d={mobile?`M180 ${cy+75}V${endY-26}`:`M${center+45} ${cy}H${endX-28}`} tone={tones[goal]} duration={3.6}/>
  <g className={s.destination} data-tone={tones[goal]}><circle cx={endX} cy={endY} r="24"/><circle cx={endX} cy={endY} r="33" className={s.destinationOrbit}/><Icon x={endX-10} y={endY-10} width="20" height="20" strokeWidth={1.3}/><text x={endX} y={endY+52} textAnchor="middle">{selected.action}</text></g>
 </svg>
}
function VisitorJourney(){
 const [goal,setGoal]=useState(0),selected=goals[goal],id=useId().replaceAll(':','')
 return <article className={s.feature}>
  <header className={s.featureCopy}><span className={s.eyebrow}>01 / ATTENTION INTO ACTION</span><h3>A good visit.<br/><span>A useful next step.</span></h3><p>Search, a campaign or a recommendation brings someone in. Clear content and considered interactions help them know where to go next.</p><ul><li><Check size={13}/>Content with a clear hierarchy</li><li><Check size={13}/>Technical search foundations</li><li><Check size={13}/>Actions built around your business</li></ul></header>
  <div className={s.featureExperience}><MotionSurface className={s.journeyScene} label="Visitor journey: search, campaign and direct visits connect to an enquiry, booking or purchase"><div className={s.sceneGrid}/><JourneyDiagram goal={goal} mobile={false}/><JourneyDiagram goal={goal} mobile/></MotionSurface><div className={s.choiceRow} aria-label="Choose a website goal">{goals.map((item,i)=><button key={item.name} onClick={()=>setGoal(i)} aria-pressed={goal===i} aria-controls={id} data-tone={tones[i]}><i/><item.icon size={14}/>{item.name}<ArrowRight size={12}/></button>)}</div><div className={s.journeyDetail} id={id}><span className={s.eyebrow}>THE JOURNEY / {selected.name.toUpperCase()}</span><h4>{selected.title}</h4><p>{selected.body}</p><div>{selected.details.map(text=><span key={text}>{text}</span>)}</div></div></div>
 </article>
}

const invitations=['Explore your options.','Start your next chapter.']
function ExperimentDiagram({choice,mobile}:{choice:number|null;mobile:boolean}){
 const center=mobile?180:380,y=mobile?46:55,left=mobile?86:190,right=mobile?274:570,end=mobile?143:142
 return <svg className={mobile?s.mobileDiagram:s.desktopDiagram} viewBox={mobile?'0 0 360 320':'0 0 760 330'} aria-hidden="true">
  <path d={`M${center} ${y-20}V${y+24}`} className={s.entryStem}/><circle cx={center} cy={y} r="15" className={s.branchCore}/><Workflow x={center-8} y={y-8} width="16" height="16" strokeWidth={1.2}/>
  {[left,right].map((x,i)=><g key={x}><TechTrace d={`M${center} ${y+18}V${y+42}Q${center} ${y+60} ${center+(i?20:-20)} ${y+60}H${x+(i?-20:20)}Q${x} ${y+60} ${x} ${y+80}V${end}`} tone={i===0?'violet':'cyan'} duration={4.3} delay={i*-.75} active={choice===null||choice===i}/><path d={`M${x-4} ${end-6}L${x} ${end}L${x+4} ${end-6}`} className={i===0?s.violetStroke:s.cyanStroke}/></g>)}
 </svg>
}
function ContentExperiment(){
 const [choice,setChoice]=useState<number|null>(null),id=useId().replaceAll(':','')
 return <article className={s.feature}>
  <header className={s.featureCopy}><span className={s.eyebrow}>02 / CONTENT THAT CAN EVOLVE</span><h3>Two directions.<br/><span>One better question.</span></h3><p>A different headline can change the invitation. Explore two approaches; an agreed experiment can then compare real visitor outcomes.</p><ul><li><Check size={13}/>Focused content variants</li><li><Check size={13}/>A clearly defined useful action</li><li><Check size={13}/>Measurement when included in scope</li></ul></header>
  <div className={s.featureExperience}><MotionSurface className={s.experimentScene} label="Choose between two calls to action to follow their coloured signal paths"><div className={s.sceneGrid}/><span className={s.experimentLabel}>ONE INVITATION / TWO DIRECTIONS</span><ExperimentDiagram choice={choice} mobile={false}/><ExperimentDiagram choice={choice} mobile/><div className={s.invitations}>{invitations.map((text,i)=><button key={text} aria-pressed={choice===i} aria-controls={id} onClick={()=>setChoice(i)} data-tone={i===0?'violet':'cyan'}><span>DIRECTION {i===0?'A':'B'}</span><strong>{text}</strong><span>Follow this invitation<ArrowUpRight size={15}/></span></button>)}</div></MotionSurface><div className={s.experimentResult} id={id}><div role="status"><i data-tone={choice===0?'violet':choice===1?'cyan':'neutral'}/>{choice===null?'Choose an invitation to follow its path.':`Direction ${choice===0?'A':'B'} selected: ${invitations[choice]}`}</div><button onClick={()=>setChoice(null)} disabled={choice===null}>Explore both<ArrowRight size={12}/></button></div><p className={s.detailNote}>A visual comparison of two messages. A real A/B test needs a defined outcome and sufficient traffic; this interaction does not declare a winner.</p></div>
 </article>
}

const destinations=[
 {name:'Team inbox',icon:Mail,tone:'amber' as const,detail:'Send the agreed enquiry details to the right inbox, with a clear confirmation for the visitor.',steps:['Enquiry submitted','Details validated','Team notified']},
 {name:'Calendar',icon:CalendarDays,tone:'violet' as const,detail:'Connect a booking flow to your chosen calendar provider, with availability and confirmation rules agreed in advance.',steps:['Time selected','Availability checked','Appointment confirmed']},
 {name:'CRM',icon:Database,tone:'cyan' as const,detail:'Pass useful lead information into your customer system through a supported integration, with validation and error handling.',steps:['Lead captured','Fields validated','Customer record updated']},
]
function ConnectionDiagram({selected,mobile}:{selected:number;mobile:boolean}){
 const center=mobile?180:380,coreY=mobile?142:145,outputs=mobile?[60,180,300]:[160,380,600],endY=mobile?286:280
 return <svg className={mobile?s.mobileDiagram:s.desktopDiagram} viewBox={mobile?'0 0 360 355':'0 0 760 355'} aria-hidden="true">
  <text x={center} y="25" textAnchor="middle" className={s.diagramText}>A useful action on your website</text><TechTrace d={`M${center} 43V${coreY-45}`} tone={destinations[selected].tone} duration={4}/><BrandNode x={center} y={coreY} label={false}/>
  {outputs.map((x,i)=>{const item=destinations[i],I=item.icon,d=`M${center} ${coreY+45}V${coreY+68}Q${center} ${coreY+91} ${x} ${coreY+91}V${endY-25}`;return <g key={item.name} className={s.outputNode} data-selected={i===selected} data-tone={item.tone}><TechTrace d={d} tone={item.tone} duration={4} delay={-1.8} active={selected===i}/><circle cx={x} cy={endY} r="23"/><I x={x-9} y={endY-9} width="18" height="18" strokeWidth={1.3}/><text x={x} y={endY+46} textAnchor="middle">{item.name}</text></g>})}
 </svg>
}
function ConnectedActions(){
 const [selected,setSelected]=useState(0),destination=destinations[selected],id=useId().replaceAll(':','')
 return <article className={s.feature}>
  <header className={s.featureCopy}><span className={s.eyebrow}>03 / MORE THAN A BEAUTIFUL PAGE</span><h3>From the screen.<br/><span>Into your workflow.</span></h3><p>A website becomes more useful when the next step reaches the tools your team already uses. Choose a connection and follow the flow.</p><ul><li><Check size={13}/>Provider-supported integrations</li><li><Check size={13}/>Validation and failure handling</li><li><Check size={13}/>A practical handover</li></ul></header>
  <div className={s.featureExperience}><MotionSurface className={s.connectionScene} label="Follow an enquiry, booking or lead through the website into an inbox, calendar or CRM"><div className={s.sceneGrid}/><ConnectionDiagram selected={selected} mobile={false}/><ConnectionDiagram selected={selected} mobile/></MotionSurface><div className={s.choiceRow} aria-label="Choose a connected workflow">{destinations.map((item,i)=><button key={item.name} data-tone={item.tone} aria-pressed={selected===i} aria-controls={id} onClick={()=>setSelected(i)}><i/><item.icon size={14}/>{item.name}<ArrowRight size={12}/></button>)}</div><div className={s.connectionDetail} id={id}><div className={s.steps}>{destination.steps.map((step,i)=><span key={step}><small>0{i+1}</small>{step}{i<2&&<ArrowRight size={11}/>}</span>)}</div><p>{destination.detail}</p></div></div>
 </article>
}

export function WebsiteCapabilities(){return <div className={s.capabilities}>
 <VisitorJourney/><ContentExperiment/><ConnectedActions/>
 <div className={s.foundationLine}><div><ArrowDown size={16}/><span>Designed to feel effortless.<br/><strong>Built with the details in mind.</strong></span></div><p>Responsive layouts. Accessible controls. Considered page loading. Clear technical search foundations.</p></div>
 <p className={s.disclosure}>Interactive illustrations of possible website features. Content, bookings, e-commerce, experiments, analytics and integrations are agreed in your project scope. These scenes do not submit enquiries or collect experiment results.</p>
 </div>}
