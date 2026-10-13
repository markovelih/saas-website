'use client'

import {useEffect,useId,useRef,useState} from 'react'
import type {RefObject} from 'react'
import Link from 'next/link'
import {ArrowDown,ArrowRight,ArrowUpRight,Check,ChevronRight,Code2,Globe,MessageSquare,Monitor,Smartphone,ShoppingBag,Sparkles} from 'lucide-react'
import s from './process-experience.module.css'

const stages=[
 {name:'Define',eyebrow:'01 / A SHARED STARTING POINT',title:'Give the idea\na direction.',body:'We get to know your business, the people using the product and the outcome that matters. The possibilities become a clear, written scope.',you:'Your goals, references and constraints.',us:'Scope, deliverables, price and milestones.',result:'A plan you can understand.',artifact:'THE BRIEF'},
 {name:'Design',eyebrow:'02 / MAKE THE DIRECTION VISIBLE',title:'Find its\npoint of view.',body:'Structure, typography, layouts and key journeys come together. You explore the visual direction and give focused feedback before the build moves ahead.',you:'Review the look and important journeys.',us:'A considered interface and working direction.',result:'An experience shaped around your brand.',artifact:'THE DIRECTION'},
 {name:'Develop',eyebrow:'03 / TURN THE DETAILS INTO BEHAVIOUR',title:'Make it work\nas well as it looks.',body:'We build the agreed interface, logic and connections. Working previews let you try the product, review progress and refine the important details.',you:'Try the previews and share specific feedback.',us:'The agreed features, integrations and testing.',result:'A working product you can review.',artifact:'THE PRODUCT'},
 {name:'Launch',eyebrow:'04 / READY FOR ITS NEXT CHAPTER',title:'A thoughtful\nway into the world.',body:'After the final review and approval, we arrange launch and handover. Any remaining agreed project balance is handled before release; a full upfront payment leaves no balance for the same scope.',you:'Final review, approval and agreed balance.',us:'Domain, launch checks and handover guidance.',result:'The agreed release, on your own address.',artifact:'THE RELEASE'},
]
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
function useTilt(ref:RefObject<HTMLDivElement|null>){
 useEffect(()=>{
  const node=ref.current;if(!node)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,visible=false,dirty=true,tx=0,ty=0,x=0,y=0,last=0,box=node.getBoundingClientRect()
  function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
  function render(time:number){frame=0;if(!visible||document.hidden)return;const dt=last&&time-last<100?time-last:16.67;last=time;const a=reduced.matches?1:1-Math.exp(-dt/65);x+=(tx-x)*a;y+=(ty-y)*a;node!.style.setProperty('--look-x',x.toFixed(3)+'deg');node!.style.setProperty('--look-y',y.toFixed(3)+'deg');if(Math.abs(tx-x)+Math.abs(ty-y)>.015)wake()}
  function move(e:PointerEvent){if(e.pointerType!=='mouse'||reduced.matches)return;if(dirty){box=node!.getBoundingClientRect();dirty=false}tx=clamp((e.clientX-box.left)/box.width-.5,-.5,.5)*12;ty=clamp((e.clientY-box.top)/box.height-.5,-.5,.5)*-10;wake()}
  function leave(){tx=0;ty=0;wake()}
  function invalidate(){dirty=true}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}else wake()}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;node!.dataset.visible=String(visible);if(visible){dirty=true;last=0;wake()}else{cancelAnimationFrame(frame);frame=0;last=0}},{threshold:.05})
  observer.observe(node);node.addEventListener('pointermove',move,{passive:true});node.addEventListener('pointerleave',leave,{passive:true});window.addEventListener('scroll',invalidate,{passive:true});window.addEventListener('resize',invalidate,{passive:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',leave)
  return()=>{cancelAnimationFrame(frame);observer.disconnect();node.removeEventListener('pointermove',move);node.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',invalidate);window.removeEventListener('resize',invalidate);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',leave)}
 },[ref])
}
function Mark(){return <svg viewBox="0 0 128 128" fill="currentColor" aria-hidden="true"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg>}
export function IdeaSculpture(){
 const ref=useRef<HTMLDivElement>(null);useTilt(ref)
 return <div ref={ref} className={s.sculpture} aria-label="An idea taking shape: an interactive orbital sculpture" role="img"><div className={s.sculptureGrid}/><div className={s.orbitObject}><div className={s.orbitRing}/><div className={s.orbitRing}/><div className={s.orbitRing}/><div className={s.orbitRing}/><div className={s.orbitCore}><Mark/><i/><i/></div><span className={s.orbitDot}/><span className={s.orbitDot}/><span className={s.orbitDot}/></div><span className={s.orbitCaption}>ONE IDEA. A WORLD OF POSSIBILITIES.</span><span className={s.coordinate}>FORM / FUNCTION / FEELING</span><div className={s.orbitLabels}><span>DEFINE</span><span>DESIGN</span><span>DEVELOP</span><span>LAUNCH</span></div></div>
}
function ProjectArtifact({active}:{active:number}){
 const ref=useRef<HTMLDivElement>(null);useTilt(ref)
 return <div ref={ref} className={s.artifactScene} data-phase={active} role="img" aria-label={['An idea assembled from brief cards','A three-dimensional interface blueprint','A finished website interface with connected features','A finished product surrounded by launch connections'][active]}>
  <div className={s.artifactGrid}/><span className={s.artifactCoordinate}>KORYX / PROJECT STUDY</span>
  <svg className={s.connectionMap} viewBox="0 0 640 450" fill="none" aria-hidden="true"><ellipse cx="321" cy="246" rx="266" ry="150"/><ellipse cx="321" cy="246" rx="210" ry="107"/>{[[72,206],[155,102],[491,111],[561,271],[435,376],[152,361]].map(([x,y],i)=><g key={i}><path d={`M${x} ${y}L321 246`} strokeDasharray="3 7"/><circle cx={x} cy={y} r="5"/><circle cx={x} cy={y} r="15" opacity=".35"/></g>)}<path d="M312 34H332M322 24V44M311 421H331M321 411V431"/></svg>
  <div className={s.pointerTilt}><div className={s.projectObject}>
   <div className={s.briefCard}><span>01 / PROJECT BRIEF</span><h4>An idea worth<br/>making real.</h4><p>People. Purpose. Possibilities.</p><div><i/><i/><i/></div><span>THE START OF SOMETHING.</span></div>
   <div className={s.scopeCard}><span>THE SCOPE</span><div><Check size={12}/><span>Goals & audience</span></div><div><Check size={12}/><span>Pages & features</span></div><div><Check size={12}/><span>Milestones & budget</span></div><i/></div>
   <div className={s.blueprint}><span>02 / INTERFACE STRUCTURE</span><div className={s.blueprintGrid}/><div className={s.blueprintHero}><i/><i/><i/></div><div className={s.blueprintArt}><div/><div/></div><div className={s.blueprintFoot}><i/><i/><i/></div></div>
   <div className={s.productPlane}><div className={s.productNav}><span>YOUR BRAND</span><span>WORK / ABOUT / CONTACT</span></div><div className={s.productHero}><span>AN ORIGINAL PERSPECTIVE.</span><h4>Room for<br/><em>what’s next.</em></h4><p>Thoughtful space. A clear direction.</p><span className={s.productButton}>Explore the possibilities<ArrowUpRight size={9}/></span></div><div className={s.productArt}><div/><div/><div/></div><div className={s.productBottom}><span>CONSIDERED / CONNECTED / CRAFTED</span><ArrowDown size={10}/></div></div>
   <div className={s.codeCard}><Code2 size={15}/><span>INTERFACE<br/>LOGIC<br/>CONNECTIONS</span><i/><i/><i/></div>
   <div className={s.releaseCard}><Globe size={15}/><span>YOUR OWN ADDRESS</span><strong>Ready for its<br/>next chapter.</strong><i/></div>
  </div></div>
  <div className={s.artifactFooter}><span>ILLUSTRATIVE PROJECT / {stages[active].artifact}</span><span>MOVE YOUR POINTER TO EXPLORE</span></div>
 </div>
}
export function ProcessJourney(){
 const [active,setActive]=useState(0),section=useRef<HTMLElement>(null),panel=useRef<HTMLDivElement>(null),progress=useRef<HTMLDivElement>(null),id=useId().replaceAll(':','')
 useEffect(()=>{
  const root=section.current,sticky=panel.current;if(!root||!sticky)return
  let frame=0,visible=false
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  function update(){frame=0;if(!visible||reduced.matches||document.hidden)return;const bounds=root!.getBoundingClientRect(),top=parseFloat(getComputedStyle(sticky!).top)||64,travel=Math.max(1,bounds.height-sticky!.clientHeight),p=clamp((top-bounds.top)/travel,0,1);progress.current?.style.setProperty('--journey-progress',String(p));setActive(Math.min(3,Math.floor(p*4)))}
  function schedule(){if(!frame&&visible)frame=requestAnimationFrame(update)}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0}},{threshold:.01})
  const resizer=new ResizeObserver(schedule);observer.observe(sticky);resizer.observe(sticky);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule)
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule)}
 },[])
 const stage=stages[active]
 return <section ref={section} className={s.journey} id="journey" aria-labelledby="journey-title"><div ref={panel} className={s.journeyPanel}>
  <header className={s.journeyHeader}><div><span className={s.eyebrow}>01 / FOLLOW THE IDEA</span><h2 id="journey-title">From possibility.<br/><span>To presence.</span></h2></div><p>Scroll to watch it take shape.<br/>Or choose a stage to explore.</p></header>
  <div className={s.stageTabs} role="tablist" aria-label="Project process stages">{stages.map((item,i)=><button key={item.name} id={id+'-stage-'+i} role="tab" aria-selected={active===i} aria-controls={id+'-detail'} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?3:(i+(event.key==='ArrowRight'?1:3))%4;setActive(next);document.getElementById(id+'-stage-'+next)?.focus()}}><span>0{i+1}</span>{item.name}<i>{i<active?<Check size={10}/>:<ChevronRight size={10}/>}</i></button>)}</div>
  <div className={s.journeyBody}><ProjectArtifact active={active}/><div className={s.phaseCopy} id={id+'-detail'} role="tabpanel" aria-labelledby={id+'-stage-'+active} tabIndex={0}><span className={s.eyebrow}>{stage.eyebrow}</span><h3>{stage.title.split('\n').map((line,i)=><span key={line}>{i>0&&<br/>}{line}</span>)}</h3><p>{stage.body}</p><div className={s.phaseRoles}><div><span>YOUR PART</span><p>{stage.you}</p></div><div><span>OUR PART</span><p>{stage.us}</p></div></div><div className={s.stageOutcome}><ArrowUpRight size={15}/><span>{stage.result}</span></div></div></div>
  <footer className={s.journeyFooter}><span><ArrowDown size={11}/>SCROLL TO CONTINUE THE STORY</span><div ref={progress}><i/></div><span>0{active+1} / 04</span></footer>
 </div></section>
}
const notes=[{title:'Let it breathe.',body:'More space between the story and the next step.',name:'Apply more breathing room'},{title:'Give it more contrast.',body:'A stronger distinction between the layers.',name:'Apply stronger contrast'},{title:'Make the next step clear.',body:'A visible invitation, in the right place.',name:'Apply a clearer next step'}]
export function ReviewWorkbench(){
 const [changes,setChanges]=useState<boolean[]>([false,false,false]),[mobile,setMobile]=useState(false),[original,setOriginal]=useState(false),[collection,setCollection]=useState(false),id=useId().replaceAll(':','')
 const applied=changes.filter(Boolean).length,space=!original&&changes[0],contrast=!original&&changes[1],action=!original&&changes[2]
 return <div className={s.workbench}><div className={s.reviewControls}><span className={s.eyebrow}>TRY A LITTLE FEEDBACK</span><h3>Small changes.<br/>A considered result.</h3><p>Select a note. Try another.<br/>The preview responds to your choices.</p><div className={s.notes}>{notes.map((note,i)=><button key={note.name} aria-pressed={changes[i]} aria-controls={id+'-preview'} onClick={()=>{setChanges(v=>v.map((selected,index)=>index===i?!selected:selected));setOriginal(false)}} aria-label={note.name}><span className={s.noteNumber}>{changes[i]?<Check size={11}/>:String(i+1).padStart(2,'0')}</span><span><strong>{note.title}</strong><small>{note.body}</small></span><PlusIcon active={changes[i]}/></button>)}</div><div className={s.reviewHint}><MessageSquare size={13}/><p>In your project, feedback is reviewed against the agreed scope before changes are made.</p></div></div>
  <div className={s.previewArea}><div className={s.previewToolbar}><span><i/><i/><i/></span><span>YOUR DESIGN / A WORKING STUDY</span><div aria-label="Preview screen size"><button onClick={()=>setMobile(false)} aria-pressed={!mobile} aria-label="Desktop design preview"><Monitor size={14}/></button><button onClick={()=>setMobile(true)} aria-pressed={mobile} aria-label="Mobile design preview"><Smartphone size={14}/></button></div></div><div className={s.previewStage}><div id={id+'-preview'} className={s.reviewPreview} data-space={space} data-contrast={contrast} data-action={action} data-mobile={mobile}><div className={s.studyNav}><span>FIELDWORK<span>®</span></span><span>SPACES / OBJECTS / IDEAS</span><ArrowUpRight size={12}/></div><div className={s.studyLayout}><div className={s.studyCopy}><span>A LITTLE ROOM FOR POSSIBILITY.</span><h4>A place<br/>for your<br/>{' '}<em>next idea.</em></h4><p>Considered objects.<br/>A different everyday perspective.</p><button className={s.studyAction} onClick={()=>setCollection(v=>!v)} aria-expanded={collection} aria-controls={id+'-collection'}>{collection?'Back to the story':'Explore the collection'}<ArrowUpRight size={12}/></button></div><div className={s.studyArt} aria-hidden="true"><div/><div/><div/><span>FORM / 01</span><i/></div></div><div className={s.studyCollection} id={id+'-collection'} hidden={!collection}>{['Disc','Arc','Pebble'].map((name,i)=><div key={name}><div data-object={i}><i/><i/><i/></div><span>FORM / 0{i+1}</span><strong>{name}</strong></div>)}</div><div className={s.studyFoot}><span>THOUGHTFULLY MADE.</span><span>ROOM TO DISCOVER.</span><ArrowRight size={11}/></div></div></div><div className={s.comparison}><div role="status"><i/>{applied===0?'The starting direction.':`${applied} note${applied===1?'':'s'} applied to the example.`}</div><button onClick={()=>setOriginal(v=>!v)} aria-pressed={original} disabled={applied===0}>{original?'Return to your changes':'Compare with original'}<ArrowRight size={12}/></button></div><p className={s.exampleNote}>Interactive design study. Your choices are local to this example; no project feedback is submitted.</p></div>
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
