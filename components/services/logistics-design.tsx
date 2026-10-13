'use client'

import {useEffect,useRef} from 'react'
import type {CSSProperties} from 'react'
import {MoveVertical} from 'lucide-react'
import {FreightTruck} from './freight-truck'
import s from './logistics-design.module.css'

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
const descriptions=[
 {title:'The whole picture.',detail:'Cargo, frame and powertrain — the complete cutaway.',code:'03 / X-RAY'},
 {title:'Between two worlds.',detail:'One line separates the body from the systems inside.',code:'02 / CUTAWAY'},
 {title:'A different perspective.',detail:'Lift the line to look inside. Lower it to restore the exterior.',code:'01 / EXTERIOR'},
]
export function DesignCanvas(){
 const canvas=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),title=useRef<HTMLOutputElement>(null),detail=useRef<HTMLParagraphElement>(null),code=useRef<HTMLSpanElement>(null)
 const position=useRef(370),target=useRef(370),wake=useRef<()=>void>(()=>{})
 useEffect(()=>{
  const root=canvas.current,scene=stage.current;if(!root||!scene)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,visible=false,lastTime=0,dirty=true,dragging=false,lastZone=-1
  let drawTop=0,drawHeight=1
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
  function render(time:number){
   frame=0;if(!visible||document.hidden)return
   const dt=lastTime&&time-lastTime<100?Math.min(time-lastTime,32):16.67;lastTime=time
   position.current+=(target.current-position.current)*(reduced.matches?1:1-Math.exp(-dt/38))
   if(Math.abs(target.current-position.current)<.02)position.current=target.current
   root!.style.setProperty('--scan-y',position.current.toFixed(3))
   const zone=position.current<105?0:position.current<340?1:2
   if(zone!==lastZone){const item=descriptions[zone];if(title.current)title.current.textContent=item.title;if(detail.current)detail.current.textContent=item.detail;if(code.current)code.current.textContent=item.code;lastZone=zone}
   if(Math.abs(target.current-position.current)>.02)schedule()
  }
  function measure(){const truck=scene!.querySelector('[data-freight-truck]')?.getBoundingClientRect();if(truck){drawTop=truck.top;drawHeight=truck.height}dirty=false}
  function move(event:PointerEvent){
   if(event.pointerType!=='mouse'&&!dragging)return
   if(dirty)measure()
   const latest=event.getCoalescedEvents?.().at(-1)||event
   // Store the SVG-space target at input time. Page scrolling never changes it.
   target.current=clamp((latest.clientY-drawTop)/drawHeight*430,70,370)
   schedule()
  }
  function down(event:PointerEvent){
   if(!(event.target instanceof Element)||!event.target.closest('[data-scan-handle]'))return
   event.preventDefault();dragging=true;dirty=true;scene!.setPointerCapture(event.pointerId);move(event)
  }
  function stop(){dragging=false}
  function invalidate(){dirty=true}
  function enter(){dirty=true}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0}else{dirty=true;schedule()}}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){dirty=true;lastTime=0;schedule()}else{cancelAnimationFrame(frame);frame=0;lastTime=0}},{threshold:.01})
  const resizer=new ResizeObserver(invalidate)
  observer.observe(scene);resizer.observe(scene)
  scene.addEventListener('pointermove',move,{passive:true});scene.addEventListener('pointerdown',down);scene.addEventListener('pointerup',stop);scene.addEventListener('pointercancel',stop);scene.addEventListener('pointerenter',enter,{passive:true})
  window.addEventListener('scroll',invalidate,{passive:true});window.addEventListener('resize',invalidate,{passive:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',schedule);wake.current=schedule
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();scene.removeEventListener('pointermove',move);scene.removeEventListener('pointerdown',down);scene.removeEventListener('pointerup',stop);scene.removeEventListener('pointercancel',stop);scene.removeEventListener('pointerenter',enter);window.removeEventListener('scroll',invalidate);window.removeEventListener('resize',invalidate);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',schedule);wake.current=()=>{}}
 },[])
 return <section className={s.lab} id="experience" aria-labelledby="reveal-title"><div ref={canvas} className={s.canvas} style={{'--scan-y':'370'} as CSSProperties}>
  <header className={s.sceneHeader}><span>01 / THE EXPERIENCE</span><span>CRAFTED BY KORYX <i/></span></header>
  <div className={s.sceneIntro}><h2 id="reveal-title">Two worlds.<br/><span>One line.</span></h2><p>Move your mouse to explore.<br/>{' '}On a phone, drag the line.</p></div>
  <div ref={stage} className={s.stage} data-scan-stage tabIndex={0} aria-label="Truck cutaway. Move the mouse or drag the horizontal line on a touch screen. Up and down arrow keys also move the line." onKeyDown={event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();target.current=event.key==='Home'?70:event.key==='End'?370:clamp(target.current+(event.key==='ArrowDown'?18:-18),70,370);wake.current()}}>
   <div className={s.stageGrid} aria-hidden="true"/><div className={s.stageTop}><span>TRANSPORT / INTERACTIVE CUTAWAY</span><span>EXTERIOR ↔ X-RAY</span></div><FreightTruck/><div className={s.horizon} aria-hidden="true"/>
  </div>
  <div className={s.console}><div className={s.telemetry}><span ref={code}>01 / EXTERIOR</span><output ref={title}>A different perspective.</output><p ref={detail}>Lift the line to look inside. Lower it to restore the exterior.</p></div><div className={s.gesture}><MoveVertical size={16}/><span>Lift to reveal. Lower to restore.<small>MOUSE / TOUCH</small></span></div></div>
  <div className={s.sceneFoot}><span>AN ORIGINAL INTERACTIVE STUDY</span><span>ONE LINE / TWO PERSPECTIVES</span></div>
 </div></section>
}
