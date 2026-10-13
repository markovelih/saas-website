'use client'

import {useEffect,useRef,useState} from 'react'
import type {CSSProperties,PointerEvent} from 'react'
import {ArrowUpRight,Box,ChevronRight,MoveHorizontal,Pause,Play,ScanLine,Truck} from 'lucide-react'
import {MotionSurface} from '@/components/motion/motion-primitives'
import {FreightTruck} from './freight-truck'
import s from './logistics-design.module.css'

type View='Exterior'|'Scan'|'X-ray'
const zones=[{name:'Cargo hold',code:'01 / PAYLOAD',text:'A closer look at the load. Pallets, bracing and space.'},{name:'Chassis',code:'02 / STRUCTURE',text:'The frame beneath the body. Axles, suspension and fuel system.'},{name:'Powertrain',code:'03 / ENGINE',text:'Under the cab. Engine, cooling and the systems that keep it moving.'}]

export function DesignCanvas(){
  const [view,setView]=useState<View>('Scan')
  const [playing,setPlaying]=useState(true)
  const [zone,setZone]=useState(0)
  const root=useRef<HTMLDivElement>(null)
  const stage=useRef<HTMLDivElement>(null)
  const range=useRef<HTMLInputElement>(null)
  const holdUntil=useRef(0)
  const dragging=useRef(false)
  const visible=useRef(false)
  const current=useRef(48)

  function apply(percent:number){
    const p=Math.max(0,Math.min(100,percent))
    current.current=p
    root.current?.style.setProperty('--scan-x',String(p*7.1))
    if(range.current)range.current.value=String(Math.round(p))
    setZone(p>78?2:p>62?1:0)
  }
  useEffect(()=>{
    const el=stage.current;if(!el)return
    const observer=new IntersectionObserver(([entry])=>{visible.current=entry.isIntersecting},{threshold:.05})
    observer.observe(el)
    return()=>observer.disconnect()
  },[])
  useEffect(()=>{
    if(!playing||view!=='Scan')return
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame=0,last=0,phase=Math.asin(Math.max(-1,Math.min(1,(current.current-50)/43)))
    function tick(time:number){
      const delta=last?Math.min(time-last,80):0;last=time
      if(visible.current&&!document.hidden&&!reduced.matches&&!dragging.current&&time>holdUntil.current){
        phase+=delta/4600
        const p=50+Math.sin(phase)*43
        current.current=p
        root.current?.style.setProperty('--scan-x',String(p*7.1))
        if(range.current)range.current.value=String(Math.round(p))
        setZone(p>78?2:p>62?1:0)
      }
      frame=requestAnimationFrame(tick)
    }
    frame=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(frame)
  },[playing,view])
  function move(event:PointerEvent<HTMLDivElement>){
    if(view!=='Scan'||(event.pointerType!=='mouse'&&!dragging.current))return
    const bounds=event.currentTarget.querySelector('[data-freight-truck]')?.getBoundingClientRect();if(!bounds)return
    holdUntil.current=performance.now()+6500
    apply((((event.clientX-bounds.left)/bounds.width)*960-125)/7.1)
  }
  function down(event:PointerEvent<HTMLDivElement>){
    if(view!=='Scan')return
    dragging.current=true
    if(event.pointerType!=='mouse')event.currentTarget.setPointerCapture(event.pointerId)
    move(event)
  }
  function stop(){dragging.current=false;holdUntil.current=performance.now()+3500}
  const active=zones[zone]
  return <MotionSurface className={s.lab} label="Custom logistics website with an interactive truck X-ray">
    <div className={s.labBar}><span><i/>01 / THE DESIGN STUDIO</span><span>BUILT TO INTERACT.</span></div>
    <div ref={root} className={s.website} data-view={view} data-playing={playing} style={{'--scan-x':'340.8'} as CSSProperties}>
      <header className={s.siteNav}><span className={s.brand}><svg viewBox="0 0 36 24" aria-hidden="true"><path d="M0 24 14 0h8L8 24Zm14 0L28 0h8L22 24Z" fill="currentColor"/></svg>MONO<span>FREIGHT</span></span><span className={s.navCaption}>GOING FURTHER.<br/>TOGETHER.</span><button onClick={()=>{setView('Scan');stage.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'})}}>Explore the fleet <ArrowUpRight size={14}/></button></header>
      <div className={s.heroCopy}><div><span className={s.kicker}><i/>PRECISION IN EVERY MILE.</span><h3>Beyond the road.<br/><em>Into the details.</em></h3></div><div className={s.heroAside}><p>Extraordinary journeys start<br/>with what’s under the surface.</p><span><ScanLine size={14}/>Move to see what moves us.</span></div></div>
      <div ref={stage} className={s.stage} onPointerMove={move} onPointerDown={down} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={()=>{if(!dragging.current)holdUntil.current=performance.now()+2500}}>
        <div className={s.stageGrid} aria-hidden="true"/><span className={s.backgroundType} aria-hidden="true">BUILT TO MOVE</span>
        <div className={s.stageTop}><span>FLEET / 001</span><span><i/>{view==='Exterior'?'EXTERIOR VIEW':view==='X-ray'?'FULL SYSTEM VIEW':'LIVE X-RAY SCANNER'}</span></div>
        <FreightTruck/>
        <div className={s.road} aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
        <div className={s.telemetry}><span><i/>SYSTEM IN FOCUS</span><strong>{view==='Exterior'?'The complete picture.':view==='X-ray'?'Every layer. Revealed.':active.name}</strong><small>{view==='Scan'?active.code:'MONO / ENGINEERED TO MOVE'}</small></div>
        <div className={s.dragHint}><MoveHorizontal size={20}/><span>{view==='Scan'?'MOVE / DRAG TO EXPLORE':'SWITCH TO SCAN TO EXPLORE'}</span></div>
      </div>
      <div className={s.console}>
        <div className={s.viewTabs} role="group" aria-label="Truck viewing mode">{(['Exterior','Scan','X-ray'] as const).map(value=><button key={value} aria-pressed={view===value} onClick={()=>setView(value)}>{value==='Exterior'?<Truck size={12}/>:value==='Scan'?<ScanLine size={12}/>:<Box size={12}/>}<span>{value}</span></button>)}</div>
        <div className={s.scanControl}><label htmlFor="freight-scan-position">SCAN POSITION</label><input ref={range} id="freight-scan-position" aria-label="Truck scan position" type="range" min="0" max="100" defaultValue="48" disabled={view!=='Scan'} onChange={event=>{holdUntil.current=performance.now()+10000;apply(Number(event.target.value))}}/><button aria-label={playing?'Pause automatic truck scan':'Resume automatic truck scan'} aria-pressed={!playing} disabled={view!=='Scan'} onClick={()=>setPlaying(value=>!value)}>{playing?<Pause size={13}/>:<Play size={13}/>}</button></div>
      </div>
      <div className={s.siteFooter}><div><span>01 / ROAD FREIGHT</span><strong>The road is only<br/>half the story.</strong></div><div><span>02 / BUILT FOR VISIBILITY</span><p>{view==='Scan'?active.text:'A custom visual experience. Explore the vehicle from the outside in.'}</p></div><span className={s.footerMark}><ArrowUpRight size={27}/></span></div>
    </div>
    <div className={s.labFooter}><span><ChevronRight size={12}/>Custom design. Real interaction.</span><span>ILLUSTRATIVE LOGISTICS CONCEPT / KORYX</span></div>
  </MotionSurface>
}
