'use client'

import {useId,useState} from 'react'
import type {CSSProperties} from 'react'
import {ArrowDown,ArrowRight,ArrowUpRight,Check,ChevronLeft,ChevronRight,Headphones,Layers,Minus,Plus,ShoppingBag,Sun,Moon} from 'lucide-react'
import s from './industry-showcase.module.css'

const concepts=[
 {name:'Architecture',brand:'FORME',domain:'forme.example',tag:'Spaces with a point of view.',description:'A project portfolio with an interactive building study. Explore each level and change the light.',features:['Project exploration','Floor selection','Day / evening scene'],code:'01',type:'PORTFOLIO / SPATIAL DESIGN'},
 {name:'Product commerce',brand:'OBJECT',domain:'object.example',tag:'An object. Every detail.',description:'A product experience with finish selection, an exploded view and a working local shopping bag.',features:['Product configuration','Assembly view','Local shopping bag'],code:'02',type:'COMMERCE / PRODUCT EXPERIENCE'},
 {name:'Appointments',brand:'STILL',domain:'still.example',tag:'A little room for yourself.',description:'A calm service website with a complete appointment selection flow. Choose a session, day and time.',features:['Session selection','Available sample times','Appointment review'],code:'03',type:'SERVICES / APPOINTMENT FLOW'},
]
function Building({floor,night}:{floor:number,night:boolean}){
 const uid=useId().replaceAll(':','')
 return <svg viewBox="0 0 640 520" role="img" aria-label={`Architectural building study, ${floor===-1?'all levels':'level '+(floor+1)}, ${night?'evening':'daylight'}`}>
  <defs><linearGradient id={uid+'-glass'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={night?'#a88c62':'#abb1ad'}/><stop offset="1" stopColor={night?'#514536':'#56645e'}/></linearGradient><radialGradient id={uid+'-ground'}><stop stopColor={night?'#302f2a':'#c8c6ba'}/><stop offset="1" stopColor={night?'#171919':'#e4e2d8'} stopOpacity="0"/></radialGradient></defs>
  <ellipse cx="323" cy="421" rx="258" ry="65" fill={`url(#${uid}-ground)`}/>
  <g className={s.siteGrid} fill="none" stroke={night?'#777b70':'#9c9c90'} strokeWidth=".7" opacity=".22">{Array.from({length:12},(_,i)=><path key={i} d={`M${30+i*44} 336L${272+i*44} 457M${62+i*44} 475L${304+i*44} 354`}/>)}</g>
  <path d="M131 362L338 252L532 345L324 457Z" fill={night?'#3c3c35':'#c4c2b6'}/><path d="M131 362V370L324 465L532 353V345L324 457Z" fill={night?'#252723':'#afafa1'}/>
  {[0,1,2,3].map(level=>{const selected=floor===-1||floor===level,y=352-level*68;return <g key={level} className={s.buildingLevel} style={{opacity:selected?1:.17,transform:floor===level?'translateY(-12px)':'translateY(0)'}}>
   <path d={`M175 ${y-17}L337 ${y-104}L481 ${y-35}L319 ${y+53}Z`} fill={night?'#a19d88':'#eeece0'} stroke={night?'#aaa590':'#b7b7a9'}/>
   <path d={`M175 ${y-17}V${y+37}L319 ${y+108}V${y+53}Z`} fill={`url(#${uid}-glass)`}/>
   <path d={`M319 ${y+53}L481 ${y-35}V${y+20}L319 ${y+108}Z`} fill={night?'#6c604c':'#6f7971'}/>
   {Array.from({length:9},(_,i)=><g key={i}><path d={`M${180+i*16} ${y-13+i*8}V${y+40+i*8}`} stroke={night?'#d8c7a0':'#d8d9cd'} strokeWidth="2"/><path d={`M${324+i*18} ${y+50-i*9.7}V${y+102-i*9.7}`} stroke={night?'#d9c39a':'#b9c3b7'} strokeWidth="2"/></g>)}
   <path d={`M175 ${y+36}L319 ${y+107}L481 ${y+19}V${y+26}L319 ${y+114}L175 ${y+43}Z`} fill={night?'#b5af99':'#e3e0d1'}/>
   <path d={`M175 ${y+13}L319 ${y+84}L481 ${y-4}`} fill="none" stroke={night?'#b0a281':'#a3b1a3'} opacity=".6"/>
   {level===3&&<><path d={`M208 ${y-26}L338 ${y-94}L450 ${y-41}L319 ${y+30}Z`} fill={night?'#47483d':'#c7ccba'}/>{[0,1,2,3,4].map(i=><path key={i} d={`M${256+i*26} ${y-44+i*12}l26-14 15 7-26 14Z`} fill={night?'#565d4b':'#8c9b7f'}/>)}</>}
  </g>})}
  <g stroke={night?'#77796d':'#969888'} fill="none" strokeWidth=".8"><path d="M515 125V358M510 125H520M510 358H520"/><path d="M159 405L296 473M154 400L164 410M291 468L301 478"/></g>
  <g fill={night?'#b4b4a2':'#737b68'} fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="2"><text x="529" y="250" transform="rotate(-90 529 250)">SPATIAL STUDY / 04 LEVELS</text><text x="151" y="447">FORM / LIGHT / LIFE</text></g>
  <g transform="translate(115 340)"><path d="M0 9V42" stroke={night?'#67675b':'#80806c'} strokeWidth="3"/><ellipse cy="0" rx="18" ry="26" fill={night?'#43493b':'#9ba88b'}/><ellipse cx="-6" cy="-7" rx="11" ry="19" fill={night?'#505642':'#a8b395'}/></g>
 </svg>
}
function Architecture(){
 const [floor,setFloor]=useState(-1),[night,setNight]=useState(false),[project,setProject]=useState(0)
 const projects=['The courtyard house.','A place to gather.']
 return <div className={s.architecture} data-evening={night}>
  <nav className={s.conceptNav} aria-label="Architecture example"><strong>FORME<span>®</span></strong><span>ARCHITECTURE & INTERIORS</span><a href="#forme-project">Explore the project<ArrowUpRight size={13}/></a></nav>
  <div className={s.archHero}><div className={s.archCopy}><span className={s.micro}>SPACES, CONSIDERED.</span><h3>Built around<br/>the way<br/>{' '}<em>you live.</em></h3><p>Material, light and a little breathing room. Architecture explored from every angle.</p><a href="#forme-project" className={s.conceptLink}>Inside the project<ArrowDown size={14}/></a><div className={s.archIndex}><span>01 — 02</span><i/><span>FORME / SELECTED WORK</span></div></div>
   <div className={s.archScene}><Building floor={floor} night={night}/><div className={s.lightButtons} aria-label="Scene lighting">{[false,true].map(value=><button key={String(value)} onClick={()=>setNight(value)} aria-pressed={night===value} aria-label={value?'Evening scene':'Daylight scene'}>{value?<Moon size={13}/>:<Sun size={13}/>}</button>)}</div><span className={s.sceneCaption}>A BUILDING STUDY, DRAWN IN CODE.</span></div>
  </div>
  <div className={s.projectBar} id="forme-project"><div><span className={s.micro}>SELECTED PROJECT / {String(project+1).padStart(2,'0')}</span><h4>{projects[project]}</h4><p>{project===0?'A four-level residence around a shared courtyard.':'The same spatial system, explored as a shared studio.'}</p></div><div className={s.floorControls}><span className={s.micro}>EXPLORE THE LEVELS</span><div>{[-1,0,1,2,3].map(value=><button key={value} aria-pressed={floor===value} onClick={()=>setFloor(value)} aria-label={value===-1?'Show all building levels':'Isolate building level '+(value+1)}>{value===-1?<Layers size={12}/>:String(value+1).padStart(2,'0')}</button>)}</div></div><div className={s.projectArrows}><button onClick={()=>{setProject(v=>1-v);setFloor(-1)}} aria-label="Previous architecture project"><ChevronLeft size={17}/></button><button onClick={()=>{setProject(v=>1-v);setFloor(-1)}} aria-label="Next architecture project"><ChevronRight size={17}/></button></div></div>
 </div>
}
function HeadphoneModel({finish,exploded}:{finish:number,exploded:boolean}){
 const id=useId().replaceAll(':',''),metal=finish===0?'#deded8':'#65655f',dark=finish===0?'#7f827c':'#272b28'
 return <svg viewBox="0 0 620 500" role="img" aria-label={`${finish===0?'Silver':'Graphite'} over-ear headphones, ${exploded?'assembly':'assembled'} view`}>
  <defs><linearGradient id={id+'-metal'} x1="0" y1="0" x2="1" y2=".8"><stop stopColor={metal}/><stop offset=".28" stopColor={finish===0?'#f4f4ee':'#aaa9a2'}/><stop offset=".6" stopColor={dark}/><stop offset="1" stopColor={metal}/></linearGradient><linearGradient id={id+'-pad'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#474a46"/><stop offset=".5" stopColor="#191c19"/><stop offset="1" stopColor="#41453f"/></linearGradient><radialGradient id={id+'-shine'}><stop stopColor="#ffffff" stopOpacity=".09"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></radialGradient></defs>
  <circle cx="310" cy="240" r="208" fill={`url(#${id}-shine)`}/>
  <g fill="none" stroke="#a5a89d" opacity=".14"><circle cx="310" cy="245" r="199"/><circle cx="310" cy="245" r="160"/><path d="M60 245H560M310 25V465"/>{Array.from({length:48},(_,i)=><path key={i} d="M310 38V43" transform={`rotate(${i*7.5} 310 245)`}/>)}</g>
  <ellipse cx="310" cy="442" rx="146" ry="18" fill="#000" opacity=".48"/>
  <g className={s.headband} style={{transform:exploded?'translateY(-28px)':'translateY(0)'}}><path d="M164 289V206C164 32 447 32 447 206V286" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="25"/><path d="M170 259V206C170 58 441 58 441 206V259" fill="none" stroke="#30352e" strokeWidth="13"/><path d="M167 217V298M444 217V298" fill="none" stroke={metal} strokeWidth="7"/><path d="M185 130C220 61 396 56 428 132" fill="none" stroke="#fff" strokeWidth="1" opacity=".35"/></g>
  {[0,1].map(side=><g key={side} className={s.earcup} style={{transform:exploded?`translateX(${side?40:-40}px)`:'translateX(0)'}}>
   <g transform={side?'translate(620 0) scale(-1 1)':''}>
    <path d="M159 264L204 257L219 284V360L200 393L157 397L136 367V295Z" fill={`url(#${id}-metal)`} stroke={metal}/>
    <ellipse cx="195" cy="328" rx="42" ry="70" fill={`url(#${id}-pad)`} stroke="#686e62"/>
    <ellipse cx="200" cy="328" rx="28" ry="54" fill="#161a15" stroke="#4c5145"/>
    <ellipse cx="202" cy="328" rx="18" ry="41" fill="#20261d"/>
    <path d="M150 292Q133 328 150 364" fill="none" stroke="#fff" opacity=".27" strokeWidth="2"/>
    <path d="M154 289V367" stroke={dark} strokeWidth="2"/><rect x="149" y="333" width="3" height="15" rx="1.5" fill="#1a2015"/>
    {Array.from({length:7},(_,i)=><circle key={i} cx="147" cy={307+i*3} r=".8" fill="#1f231c"/>)}
   </g>
  </g>)}
  <g className={s.driverDetail} style={{opacity:exploded?1:0}}><path d="M216 327H268M351 327H407" stroke="#a3ad97" strokeWidth=".8" strokeDasharray="3 5"/>{[287,332].map(x=><g key={x}><ellipse cx={x} cy="328" rx="16" ry="43" fill="#343d2d" stroke="#a6af9d"/><ellipse cx={x} cy="328" rx="8" ry="26" fill="none" stroke="#737e68"/>{Array.from({length:8},(_,i)=><path key={i} d={`M${x-10} ${306+i*6}h20`} stroke="#69765c" strokeWidth=".5"/>)}</g>)}<text x="310" y="405" textAnchor="middle" fill="#aab3a3" fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="1.6">DRIVER / CUSHION / HOUSING</text></g>
 </svg>
}
function Commerce(){
 const [finish,setFinish]=useState(0),[exploded,setExploded]=useState(false),[bag,setBag]=useState<[number,number]>([0,0]),[bagOpen,setBagOpen]=useState(false)
 const count=bag[0]+bag[1]
 return <div className={s.commerce}><nav className={s.conceptNav} aria-label="Product shop example"><strong>OBJECT<span>®</span></strong><span>TOOLS FOR EVERYDAY LISTENING.</span><button className={s.bagButton} onClick={()=>setBagOpen(v=>!v)} aria-expanded={bagOpen}><ShoppingBag size={14}/><span>Bag ({count})</span></button></nav>
  <div className={s.productHero}><div className={s.productScene}><HeadphoneModel finish={finish} exploded={exploded}/><span className={s.productCoordinate}>OBJECT / H—01</span><button className={s.assemblyButton} onClick={()=>setExploded(v=>!v)} aria-pressed={exploded}><Layers size={13}/>{exploded?'Bring it together':'Explore the assembly'}</button></div><div className={s.productCopy}><span className={s.micro}>THE LISTENING COLLECTION / 01</span><h3>Less noise.<br/><em>More detail.</em></h3><p>An over-ear headphone concept. A considered silhouette, soft cushions and a finish that feels like you.</p><div className={s.finishPicker}><span>Finish / {finish===0?'Silver':'Graphite'}</span><div>{['Silver','Graphite'].map((name,index)=><button key={name} onClick={()=>setFinish(index)} aria-pressed={finish===index} aria-label={'Select '+name+' finish'} style={{'--finish':index===0?'#c6c7bd':'#444b40'} as CSSProperties}><i/>{name}</button>)}</div></div><button className={s.addBag} onClick={()=>{setBag(v=>v.map((n,i)=>i===finish?n+1:n) as [number,number]);setBagOpen(true)}}>Add to the example bag<Plus size={15}/></button><span className={s.commerceNote}>CONCEPT PRODUCT / NO CHECKOUT OR PAYMENT</span></div></div>
  {bagOpen&&<div className={s.shoppingBag} role="region" aria-label="Example shopping bag"><div><span className={s.micro}>YOUR EXAMPLE BAG</span><strong>{count===0?'A little space for something good.':count+' object'+(count===1?'':'s')+', considered.'}</strong></div>{bag.map((n,i)=>n>0&&<div key={i} className={s.bagItem}><Headphones size={22}/><span>H—01 / {i===0?'Silver':'Graphite'}</span><button aria-label={'Remove one '+(i===0?'Silver':'Graphite')+' headphone'} onClick={()=>setBag(v=>v.map((value,j)=>j===i?Math.max(0,value-1):value) as [number,number])}><Minus size={12}/></button><output aria-label="Quantity">{n}</output><button aria-label={'Add one '+(i===0?'Silver':'Graphite')+' headphone'} onClick={()=>setBag(v=>v.map((value,j)=>j===i?value+1:value) as [number,number])}><Plus size={12}/></button></div>)}<p>Selections stay in this example. No order is placed.</p></div>}
  <div className={s.productFooter}>{[['01','The shape.','An original product model, built from vector geometry.'],['02','The interaction.','Finish and assembly respond directly to your selection.'],['03','The journey.','From exploring the details to reviewing your bag.']].map(([n,title,copy])=><div key={n}><span>{n}</span><h4>{title}</h4><p>{copy}</p></div>)}</div>
 </div>
}
const sessions=[{name:'A first conversation',duration:30,description:'A little space to meet, talk and find your direction.'},{name:'A guided session',duration:60,description:'Set aside a full hour for an unhurried session.'},{name:'A follow-up',duration:45,description:'Return to the conversation and plan the next step.'}]
const days=['Monday','Tuesday','Wednesday','Thursday','Friday']
const sampleSlots=[['09:00','11:00','14:00'],['10:00','13:00','16:00'],['09:30','12:00','15:00'],['10:30','13:30','16:30'],['09:00','11:30','14:30']]
function Appointments(){
 const [session,setSession]=useState(0),[day,setDay]=useState(0),[time,setTime]=useState<string|null>(null),[review,setReview]=useState(false)
 return <div className={s.appointments}><nav className={s.conceptNav} aria-label="Appointment website example"><strong>still<span>®</span></strong><span>A SPACE TO SLOW DOWN.</span><a href="#still-booking">Find your moment<ArrowUpRight size={13}/></a></nav>
  <div className={s.stillHero}><div><span className={s.micro}>THOUGHTFUL SPACE. HUMAN CONNECTION.</span><h3>A moment<br/>that belongs<br/>{' '}<em>to you.</em></h3><p>A considered place for a conversation. Explore a session and make room in your day.</p><a className={s.conceptLink} href="#still-booking">Choose a session<ArrowDown size={14}/></a></div><div className={s.stillArt} aria-hidden="true"><div className={s.orbit}/><div className={s.orbit}/><div className={s.orbit}/><div className={s.pebble}/><div className={s.pebble}/><div className={s.pebble}/><span>PAUSE / BREATHE / BEGIN</span><i/><i/></div></div>
  <div className={s.booking} id="still-booking"><div className={s.bookingIntro}><span className={s.micro}>YOUR NEXT LITTLE STEP</span><h4>Make room.<br/>We’ll take it from here.</h4><p>Choose a sample session and time.<br/>No personal details needed.</p><div className={s.bookingSteps}>{['Session','Time','Review'].map((name,i)=><span key={name} data-complete={i===0||i===1&&!!time||i===2&&review}><i>{i===2&&review?<Check size={11}/>:i+1}</i>{name}</span>)}</div></div><div className={s.bookingForm}>
   <div className={s.sessionButtons} aria-label="Session type">{sessions.map((item,i)=><button key={item.name} aria-pressed={session===i} onClick={()=>{setSession(i);setTime(null);setReview(false)}}><span>{item.name}</span><small>{item.duration} min</small></button>)}</div>
   <p className={s.sessionDescription}>{sessions[session].description}</p>
   <div className={s.dayPicker} aria-label="Sample appointment day">{days.map((name,i)=><button key={name} onClick={()=>{setDay(i);setTime(null);setReview(false)}} aria-pressed={day===i} aria-label={'Select '+name}><span>{name.slice(0,3)}</span><i/></button>)}</div>
   <div className={s.timePicker} aria-label="Sample appointment time">{sampleSlots[day].map(slot=><button key={slot} aria-pressed={time===slot} onClick={()=>{setTime(slot);setReview(false)}}>{slot}</button>)}</div>
   <button className={s.reviewButton} disabled={!time} onClick={()=>setReview(true)}>Review your selection<ArrowRight size={14}/></button>
   <div className={s.bookingStatus} role="status">{review?<><Check size={15}/><span><strong>{sessions[session].name} / {days[day]} at {time}</strong><small>{sessions[session].duration} minutes · Selection reviewed. This is an example; no appointment is booked.</small></span></>:<span>Sample schedule · Times are illustrative, not live availability.</span>}</div>
  </div></div>
 </div>
}
export function IndustryShowcase(){
 const [active,setActive]=useState(0),id=useId().replaceAll(':',''),concept=concepts[active]
 return <div className={s.showcase}>
  <div className={s.sectors} role="tablist" aria-label="Explore website templates">{concepts.map((item,i)=><button key={item.brand} role="tab" id={id+'-tab-'+i} aria-controls={id+'-preview'} aria-selected={active===i} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;setActive(next);document.getElementById(id+'-tab-'+next)?.focus()}}><span>{item.code} / {item.name}</span><strong>{item.brand}</strong><p>{item.tag}</p><ArrowUpRight size={18}/></button>)}</div>
  <div className={s.browser} id={id+'-preview'} role="tabpanel" aria-labelledby={id+'-tab-'+active} tabIndex={0}><div className={s.browserChrome}><span><i/><i/><i/></span><span>{concept.domain}</span><span>INTERACTIVE WEBSITE CONCEPT</span></div><div key={active} className={s.preview}>{active===0?<Architecture/>:active===1?<Commerce/>:<Appointments/>}</div></div>
  <div className={s.conceptDetails}><div><span className={s.micro}>{concept.type}</span><p>{concept.description}</p></div><ul>{concept.features.map(item=><li key={item}><Check size={12}/>{item}</li>)}</ul><span className={s.codeNote}>HTML / CSS / SVG / REACT<br/>ORIGINAL VISUALS. WORKING INTERACTIONS.</span></div>
  <p className={s.disclosure}>Three original website templates to explore. Fictional brands and sample content; bookings and shopping bags stay inside these examples. Your project’s content, integrations and launch are scoped separately.</p>
 </div>
}
