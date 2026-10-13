'use client'

import {useEffect,useId,useRef,useState} from 'react'
import {ArrowRight,ArrowUpRight,Check,Plus,Volume2,VolumeX,X} from 'lucide-react'
import {SpatialRenderer,locations,routeDistance} from './spatial-renderer'
import type {SoundMeter} from './spatial-renderer'
import s from './industry-showcase.module.css'

const sectors=[
 {name:'Spatial design',brand:'OBLIQUE',code:'01',line:'A studio, experienced in three dimensions.',description:'Original three-dimensional forms with a live material and contour view. Rotate the work, change the study and open the project notes.',features:['Original procedural forms','Mouse and touch rotation','Project and material exploration']},
 {name:'Sound & culture',brand:'PHASE',code:'02',line:'A music experience you can see and hear.',description:'An original sound instrument, not an embedded recording. Select a harmonic study, move through its form and play a short piece that shapes the visual.',features:['Evolving sound sculpture','Original eight-second sound studies','Visual response to the generated audio']},
 {name:'Mobility',brand:'AXIS',code:'03',line:'A route becomes a spatial experience.',description:'A route explorer with a rotatable globe, calculated great-circle arcs and a moving signal. Choose two cities to change the journey.',features:['Interactive route selection','Calculated spherical distances','Rotatable globe and route signal']},
]
const forms=[
 {name:'Continuum',type:'A continuous ribbon',text:'A folded ribbon becomes an uninterrupted surface. Rotate it to follow the relationship between its inside and outside.',note:'The form is a spatial study, exploring continuity rather than a construction-ready building.'},
 {name:'Interlace',type:'A woven volume',text:'One path folds back into itself. Light traces the intersecting surfaces as you change the point of view.',note:'An original geometric study of a continuous curved volume, drawn directly in the scene.'},
 {name:'Canopy',type:'An open surface',text:'A surface opens into three lifted edges. The contour view reveals its underlying rhythm and structure.',note:'A concept study for a spatial direction. Engineering, materials and construction are outside this example.'},
]
function SiteNav({brand,tag,action,onAction}:{brand:string;tag:string;action:string;onAction:()=>void}){return <nav className={s.siteNav} aria-label={brand+' website'}><strong>{brand}<span>°</span></strong><span>{tag}</span><button onClick={onAction}>{action}<ArrowUpRight size={13}/></button></nav>}
function SpatialSite(){
 const [form,setForm]=useState(1),[wire,setWire]=useState(false),[notes,setNotes]=useState(false),id=useId().replaceAll(':',''),item=forms[form]
 return <div className={s.site} data-site="oblique">
  <SiteNav brand="OBLIQUE" tag="SPATIAL THINKING / ORIGINAL FORMS" action="The studio" onAction={()=>setNotes(true)}/>
  <div className={s.experienceHero}><div className={s.visual}><SpatialRenderer kind="space" variant={form} wire={wire}/></div><div className={s.heroWords}><span className={s.micro}>SPACE IS A FEELING.</span><h3>Shaped by<br/><span>possibility.</span></h3><p>We explore the space between<br/>a thought and a physical form.</p><button className={s.heroLink} onClick={()=>setNotes(true)}>Inside the work<ArrowUpRight size={15}/></button></div><span className={s.verticalCaption}>ROTATE THE WORK / CHANGE YOUR PERSPECTIVE</span><div className={s.sceneIndex}><span>STUDY / 0{form+1}</span><span>DRAG / SWIPE ACROSS TO ROTATE</span></div><div className={s.viewSwitch} aria-label="Spatial view"><button aria-pressed={!wire} onClick={()=>setWire(false)}>Surface</button><button aria-pressed={wire} onClick={()=>setWire(true)}>Contours</button></div></div>
  <div className={s.studies} aria-label="Spatial studies">{forms.map((study,i)=><button key={study.name} onClick={()=>{setForm(i);setNotes(false)}} aria-pressed={form===i}><span>0{i+1}</span><strong>{study.name}</strong><small>{study.type}</small><ArrowUpRight size={14}/></button>)}</div>
  <div className={s.projectCaption}><div><span className={s.micro}>SELECTED WORK / {item.name.toUpperCase()}</span><p>{item.text}</p></div><button onClick={()=>setNotes(true)} aria-expanded={notes} aria-controls={id+'-notes'}>Open project notes<Plus size={14}/></button></div>
  {notes&&<div className={s.projectNotes} id={id+'-notes'} role="region" aria-label="Spatial project notes"><div><span className={s.micro}>THE WORK / {item.name.toUpperCase()}</span><button onClick={()=>setNotes(false)} aria-label="Close project notes"><X size={15}/></button></div><h4>Form follows<br/>a point of view.</h4><p>{item.note}</p><div className={s.notesColumns}><p><span>01 / EXPLORE</span>Change the study and rotate it from every angle.</p><p><span>02 / LOOK CLOSER</span>Switch to contours to see the geometry beneath the surface.</p><p><span>03 / THE DIRECTION</span>A working spatial experience, shaped specifically for this website.</p></div></div>}
 </div>
}
const soundStudies=[{name:'Drift',caption:'Open harmonics. A slow, suspended movement.',tones:[110,164.81,220]},{name:'Pulse',caption:'A measured rhythm. One form, repeated differently.',tones:[130.81,196,261.63]},{name:'Glass',caption:'Brighter harmonics. A light, shifting structure.',tones:[220,277.18,329.63]}]
function SoundSite(){
 const [study,setStudy]=useState(0),[playing,setPlaying]=useState(false),[message,setMessage]=useState('Sound is off. The visual is yours to explore.')
 const meter=useRef<SoundMeter>(null),audio=useRef<AudioContext|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null)
 useEffect(()=>{function hidden(){if(document.hidden){if(timer.current)clearTimeout(timer.current);meter.current=null;void audio.current?.close();audio.current=null;setPlaying(false);setMessage('Sound is off.')}}document.addEventListener('visibilitychange',hidden);return()=>{document.removeEventListener('visibilitychange',hidden);if(timer.current)clearTimeout(timer.current);meter.current=null;void audio.current?.close();audio.current=null}},[])
 function stop(){if(timer.current)clearTimeout(timer.current);timer.current=null;meter.current=null;void audio.current?.close();audio.current=null;setPlaying(false);setMessage('Sound is off. The visual is yours to explore.')}
 async function play(){
  if(playing){stop();return}
  try{
   const ctx=new AudioContext();audio.current=ctx;await ctx.resume();if(audio.current!==ctx)return
   const analyser=ctx.createAnalyser();analyser.fftSize=256;const master=ctx.createGain();master.gain.value=.45;master.connect(analyser);analyser.connect(ctx.destination)
   const start=ctx.currentTime
   soundStudies[study].tones.forEach((frequency,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);if(study===1){for(let beat=0;beat<14;beat++){const t=start+.3+beat*.5;gain.gain.linearRampToValueAtTime(.038/(i+1),t+.06);gain.gain.linearRampToValueAtTime(.004/(i+1),t+.35)}}else gain.gain.linearRampToValueAtTime(.035/(i+1),start+.6);gain.gain.setTargetAtTime(0,start+7,.18);oscillator.connect(gain);gain.connect(master);oscillator.start(start);oscillator.stop(start+8)})
   const samples=new Uint8Array(analyser.fftSize);meter.current={read:()=>{analyser.getByteTimeDomainData(samples);let sum=0;for(const value of samples)sum+=((value-128)/128)**2;return Math.min(1,Math.sqrt(sum/samples.length)*28)}}
   setPlaying(true);setMessage('Playing '+soundStudies[study].name+' — an original eight-second sound study.')
   timer.current=setTimeout(()=>{meter.current=null;void ctx.close();if(audio.current===ctx)audio.current=null;setPlaying(false);setMessage('Study complete. Choose a different form or listen again.')},8100)
  }catch{setPlaying(false);setMessage('Audio could not start on this browser. You can still explore the visual.');meter.current=null;void audio.current?.close();audio.current=null}
 }
 return <div className={s.site} data-site="phase">
  <SiteNav brand="PHASE" tag="SOUND / FORM / MOVEMENT" action={playing?'Stop sound':'Listen'} onAction={()=>{void play()}}/>
  <div className={s.experienceHero}><div className={s.visual}><SpatialRenderer kind="sound" variant={study} meter={meter}/></div><div className={s.heroWords}><span className={s.micro}>AN INSTRUMENT FOR THE IMAGINATION.</span><h3>Feel the<br/><span>frequency.</span></h3><p>Sound becomes a form.<br/>A form becomes a feeling.</p><button className={s.soundPlay} onClick={()=>{void play()}} aria-pressed={playing} aria-label={playing?'Stop sound study':'Play eight-second sound study'}>{playing?<VolumeX size={15}/>:<Volume2 size={15}/>}<span>{playing?'Stop the study':'Listen to the shape'}</span><i>{playing?'PLAYING':'08 SEC'}</i></button></div><span className={s.verticalCaption}>HARMONICS / A STUDY IN SOUND</span><div className={s.sceneIndex}><span>PHASE / 0{study+1}</span><span>SWIPE ACROSS / CHANGE PERSPECTIVE</span></div><span className={s.soundMark} aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{height:(9+Math.sin(i*.65)**2*24)+'px'}}/>)}</span></div>
  <div className={s.soundChoices} aria-label="Sound studies">{soundStudies.map((item,i)=><button key={item.name} onClick={()=>{stop();setStudy(i)}} aria-pressed={study===i}><span>0{i+1}</span><strong>{item.name}</strong><p>{item.caption}</p><ArrowUpRight size={14}/></button>)}</div>
  <div className={s.soundStatus} role="status"><i data-playing={playing}/>{message}<span>ORIGINAL SYNTHESISED SOUND / NO AUTOPLAY</span></div>
 </div>
}
function MobilitySite(){
 const [from,setFrom]=useState(0),[to,setTo]=useState(2),[detail,setDetail]=useState(false),distance=routeDistance(from,to)
 return <div className={s.site} data-site="axis">
  <SiteNav brand="AXIS" tag="MOVEMENT, WITH PERSPECTIVE." action="Route details" onAction={()=>setDetail(v=>!v)}/>
  <div className={s.experienceHero}><div className={s.visual}><SpatialRenderer kind="route" from={from} to={to}/></div><div className={s.heroWords}><span className={s.micro}>A CONNECTION WORTH EXPLORING.</span><h3>{locations[from].name}<br/><span>to {locations[to].name}.</span></h3><p>One journey.<br/>An entirely different point of view.</p><div className={s.distance}><strong>{distance.toLocaleString('en-CA')}</strong><span>KM / APPROX. GREAT-CIRCLE DISTANCE</span></div></div><span className={s.verticalCaption}>ROTATE THE WORLD / FOLLOW THE CONNECTION</span><div className={s.sceneIndex}><span>AXIS / ROUTE EXPLORER</span><span>SWIPE ACROSS / ROTATE THE GLOBE</span></div></div>
  <div className={s.routePlanner}><label>FROM<select aria-label="Route origin" value={from} onChange={event=>{const value=Number(event.target.value);setFrom(value);if(value===to)setTo((value+1)%locations.length)}}>{locations.map((city,i)=><option key={city.name} value={i}>{city.name}</option>)}</select></label><button aria-label="Reverse selected route" onClick={()=>{setFrom(to);setTo(from)}}><ArrowRight size={17}/></button><label>TO<select aria-label="Route destination" value={to} onChange={event=>setTo(Number(event.target.value))}>{locations.map((city,i)=><option key={city.name} value={i} disabled={i===from}>{city.name}</option>)}</select></label><button className={s.routeDetailsButton} onClick={()=>setDetail(v=>!v)} aria-expanded={detail}>Explore the route<Plus size={14}/></button></div>
  <div className={s.routeSummary} role="status"><span>{locations[from].name} → {locations[to].name}</span><p>A calculated connection on a spherical Earth model. This study illustrates route discovery, not live transport availability.</p></div>
  {detail&&<div className={s.routeDetail}><div><span>THE ORIGIN</span><strong>{locations[from].name}</strong><p>{locations[from].lat.toFixed(2)}° latitude / {locations[from].lon.toFixed(2)}° longitude</p></div><div><span>THE CONNECTION</span><strong>{distance.toLocaleString('en-CA')} km</strong><p>Approximate city-to-city distance on a sphere of radius 6,371 km. Actual transport routes may differ.</p></div><div><span>THE DESTINATION</span><strong>{locations[to].name}</strong><p>{locations[to].lat.toFixed(2)}° latitude / {locations[to].lon.toFixed(2)}° longitude</p></div></div>}
 </div>
}
export function IndustryShowcase(){
 const [active,setActive]=useState(0),id=useId().replaceAll(':',''),sector=sectors[active]
 return <div className={s.showcase}>
  <div className={s.selectorHead}><span>ORIGINAL WEBSITES / THREE DIFFERENT WORLDS</span><span>CHOOSE AN EXPERIENCE<ArrowRight size={11}/></span></div>
  <div className={s.sectors} role="tablist" aria-label="Explore original website experiences">{sectors.map((item,i)=><button key={item.brand} role="tab" id={id+'-tab-'+i} aria-controls={id+'-site'} aria-selected={active===i} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;setActive(next);document.getElementById(id+'-tab-'+next)?.focus()}}><span>{item.code} / {item.name}</span><strong>{item.brand}</strong><ArrowUpRight size={16}/></button>)}</div>
  <div className={s.liveSite} id={id+'-site'} role="tabpanel" aria-labelledby={id+'-tab-'+active} tabIndex={0}><div key={active}>{active===0?<SpatialSite/>:active===1?<SoundSite/>:<MobilitySite/>}</div></div>
  <div className={s.experienceDetails}><div><span className={s.micro}>A WEBSITE WITH ITS OWN LANGUAGE.</span><h4>{sector.line}</h4><p>{sector.description}</p></div><ul>{sector.features.map(item=><li key={item}><Check size={12}/>{item}</li>)}</ul></div>
  <p className={s.disclosure}>Original interactive websites created for the KORYX portfolio. Brands and project content are illustrative. Your project’s content, integrations and launch are agreed separately.</p>
 </div>
}
