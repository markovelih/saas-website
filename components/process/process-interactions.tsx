'use client'

import {useEffect,useId,useRef,useState} from 'react'
import Link from 'next/link'
import {ArrowDown,ArrowRight,ArrowUpRight,Check,ChevronRight,Code2,Globe,MessageSquare,ShoppingBag,Sparkles} from 'lucide-react'
import {ProcessField,TypeField} from './living-geometry'
import s from './process-experience.module.css'

const stages=[
 {name:'Define',eyebrow:'01 / A SHARED STARTING POINT',title:'Give the idea\na direction.',body:'We get to know your business, the people using the product and the outcome that matters. The possibilities become a clear, written scope.',you:'Your goals, references and constraints.',us:'Scope, deliverables, price and milestones.',result:'A plan you can understand.',artifact:'THE BRIEF'},
 {name:'Design',eyebrow:'02 / MAKE THE DIRECTION VISIBLE',title:'Find its\npoint of view.',body:'Structure, typography, layouts and key journeys come together. You explore the visual direction and give focused feedback before the build moves ahead.',you:'Review the look and important journeys.',us:'A considered interface and working direction.',result:'An experience shaped around your brand.',artifact:'THE DIRECTION'},
 {name:'Develop',eyebrow:'03 / TURN THE DETAILS INTO BEHAVIOUR',title:'Make it work\nas well as it looks.',body:'We build the agreed interface, logic and connections. Working previews let you try the product, review progress and refine the important details.',you:'Try the previews and share specific feedback.',us:'The agreed features, integrations and testing.',result:'A working product you can review.',artifact:'THE PRODUCT'},
 {name:'Launch',eyebrow:'04 / READY FOR ITS NEXT CHAPTER',title:'A thoughtful\nway into the world.',body:'After the final review and approval, we arrange launch and handover. Any remaining agreed project balance is handled before release; a full upfront payment leaves no balance for the same scope.',you:'Final review, approval and agreed balance.',us:'Domain, launch checks and handover guidance.',result:'The agreed release, on your own address.',artifact:'THE RELEASE'},
]
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
export function IdeaSculpture(){return <ProcessField hero/>}
export function ProcessJourney(){
 const [active,setActive]=useState(0),section=useRef<HTMLElement>(null),panel=useRef<HTMLDivElement>(null),progress=useRef<HTMLDivElement>(null),id=useId().replaceAll(':','')
 useEffect(()=>{
  const root=section.current,sticky=panel.current;if(!root||!sticky)return
  let frame=0,visible=false
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  function update(){frame=0;if(!visible||reduced.matches||document.hidden)return;const style=getComputedStyle(sticky!);if(style.position!=='sticky')return;const bounds=root!.getBoundingClientRect(),top=parseFloat(style.top)||64,travel=Math.max(1,bounds.height-sticky!.clientHeight),p=clamp((top-bounds.top)/travel,0,1);progress.current?.style.setProperty('--journey-progress',String(p));setActive(Math.min(3,Math.floor(p*4)))}
  function schedule(){if(!frame&&visible)frame=requestAnimationFrame(update)}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0}},{threshold:.01})
  const resizer=new ResizeObserver(schedule);observer.observe(sticky);resizer.observe(sticky);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule)
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule)}
 },[])
 const stage=stages[active]
 return <section ref={section} className={s.journey} id="journey" aria-labelledby="journey-title"><div ref={panel} className={s.journeyPanel}>
  <header className={s.journeyHeader}><div><span className={s.eyebrow}>01 / FOLLOW THE IDEA</span><h2 id="journey-title">From possibility.<br/><span>To presence.</span></h2></div><p>One system. Four arrangements.<br/>Or choose a stage to explore.</p></header>
  <div className={s.stageTabs} role="tablist" aria-label="Project process stages">{stages.map((item,i)=><button key={item.name} id={id+'-stage-'+i} role="tab" aria-selected={active===i} aria-controls={id+'-detail'} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?3:(i+(event.key==='ArrowRight'?1:3))%4;setActive(next);document.getElementById(id+'-stage-'+next)?.focus()}}><span>0{i+1}</span>{item.name}<i>{i<active?<Check size={10}/>:<ChevronRight size={10}/>}</i></button>)}</div>
  <div className={s.journeyBody}><ProcessField active={active}/><div className={s.phaseCopy} id={id+'-detail'} role="tabpanel" aria-labelledby={id+'-stage-'+active} tabIndex={0}><span className={s.eyebrow}>{stage.eyebrow}</span><h3>{stage.title.split('\n').map((line,i)=><span key={line}>{i>0&&<br/>}{line}</span>)}</h3><p>{stage.body}</p><div className={s.phaseRoles}><div><span>YOUR PART</span><p>{stage.you}</p></div><div><span>OUR PART</span><p>{stage.us}</p></div></div><div className={s.stageOutcome}><ArrowUpRight size={15}/><span>{stage.result}</span></div></div></div>
  <footer className={s.journeyFooter}><span><ArrowDown size={11}/>EXPLORE THE FOUR STAGES</span><div ref={progress}><i/></div><span>0{active+1} / 04</span></footer>
 </div></section>
}
const notes=[
 {title:'Open the space.',body:'Give the lines more breathing room.',name:'Apply more breathing room'},
 {title:'Strengthen the contrast.',body:'Bring the main contours forward.',name:'Apply stronger contrast'},
 {title:'Find the alignment.',body:'Settle the movement into a clearer rhythm.',name:'Apply clearer alignment'},
]
export function ReviewWorkbench(){
 const [changes,setChanges]=useState<boolean[]>([false,false,false]),[original,setOriginal]=useState(false),id=useId().replaceAll(':','')
 const applied=changes.filter(Boolean).length
 return <div className={s.workbench}>
  <div className={s.typeArea} id={id+'-study'}><TypeField space={!original&&changes[0]} contrast={!original&&changes[1]} alignment={!original&&changes[2]}/><div className={s.comparison}><span role="status">{original?'Original arrangement.':applied===0?'An open starting direction.':`${applied} refinement${applied===1?'':'s'} applied.`}</span><button onClick={()=>setOriginal(v=>!v)} aria-pressed={original} disabled={applied===0}>{original?'Return to refinements':'Compare with original'}<ArrowRight size={13}/></button></div></div>
  <div className={s.reviewControls}><div className={s.reviewIntro}><span className={s.eyebrow}>CHANGE ONE DETAIL. FEEL THE DIFFERENCE.</span><p>This is a live typographic study. Choose a refinement, then move across the letters to explore their depth.</p></div><div className={s.notes}>{notes.map((note,i)=><button key={note.name} aria-pressed={changes[i]} aria-controls={id+'-study'} onClick={()=>{setChanges(v=>v.map((selected,index)=>index===i?!selected:selected));setOriginal(false)}} aria-label={note.name}><span className={s.noteNumber}>{changes[i]?<Check size={11}/>:String(i+1).padStart(2,'0')}</span><span><strong>{note.title}</strong><small>{note.body}</small></span><PlusIcon active={changes[i]}/></button>)}</div></div>
  <div className={s.reviewHint}><MessageSquare size={15}/><p>Your choices only change this study. In your project, feedback is reviewed against the agreed scope before changes are made.</p></div>
 </div>
}
function PlusIcon({active}:{active:boolean}){return <span className={s.notePlus} aria-hidden="true">{active?'−':'+'}</span>}
const starts=[
 {name:'A new website',type:'website',icon:Globe,title:'Start with the impression.',body:'Tell us who you are, who you want to reach and what visitors should do next.',items:['Your business and audience','Important pages or visitor actions','One or two visual references']},
 {name:'An online store',type:'store',icon:ShoppingBag,title:'Start with the products.',body:'Show us what you sell and how customers should discover, choose and receive it.',items:['Your products and catalogue size','Payments and delivery requirements','The experience you want for shoppers']},
 {name:'An application',type:'app',icon:Code2,title:'Start with the useful action.',body:'Describe the people using it and the task they need to complete. We can help define the first release.',items:['Who needs access','The most important workflow','Existing tools or data to connect']},
]
export function StartingPoint(){
 const [selected,setSelected]=useState(0),item=starts[selected]
 return <div className={s.startPicker}><div className={s.startButtons} aria-label="Your project direction">{starts.map((option,i)=><button key={option.name} aria-pressed={selected===i} onClick={()=>setSelected(i)}><option.icon size={15}/>{option.name}<i/></button>)}</div><div className={s.startCopy}><span className={s.eyebrow}>A USEFUL FIRST BRIEF</span><h3>{item.title}</h3><p>{item.body}</p><ul>{item.items.map(text=><li key={text}><Check size={12}/>{text}</li>)}</ul><Link href={'/dashboard/new-order?intent=build&type='+item.type} className={s.primary}>Start with this direction<ArrowRight size={14}/></Link><span className={s.startNote}><Sparkles size={11}/>We agree on the scope before the work begins.</span></div></div>
}
