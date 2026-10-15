'use client'

import {useEffect,useRef} from 'react'
import {MoveVertical} from 'lucide-react'
import {FreightTruck} from './freight-truck'
import {TRUCK_VIEW,clampScan,pointerScanY,settleScan} from '@/lib/interaction/truck-scanner'
import s from './logistics-design.module.css'

const descriptions=[
 {title:'The whole picture.',detail:'Cargo, chassis and powertrain. Revealed beneath the surface.',code:'03 / X-RAY'},
 {title:'Between two worlds.',detail:'One continuous line. The exterior above. The engineering below.',code:'02 / CUTAWAY'},
 {title:'A different perspective.',detail:'Move the line up to look inside. Move down to restore the exterior.',code:'01 / EXTERIOR'},
]
export function DesignCanvas(){
 const stage=useRef<HTMLDivElement>(null),truck=useRef<SVGSVGElement>(null),beam=useRef<HTMLDivElement>(null)
 const title=useRef<HTMLOutputElement>(null),detail=useRef<HTMLParagraphElement>(null),code=useRef<HTMLSpanElement>(null)
 const position=useRef<number>(TRUCK_VIEW.initial),target=useRef<number>(TRUCK_VIEW.initial),wake=useRef<()=>void>(()=>{})
 useEffect(()=>{
  const scene=stage.current,svg=truck.current,line=beam.current
  if(!scene||!svg||!line)return
  const exterior=svg.querySelector<SVGRectElement>('[data-exterior-clip]'),interior=svg.querySelector<SVGRectElement>('[data-interior-clip]')
  if(!exterior||!interior)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,visible=false,lastTime=0,activePointer:number|null=null,lastZone=-1,lastPercent=-1
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
  function render(time:number){
   frame=0;if(!visible||document.hidden)return
   const elapsed=lastTime?time-lastTime:16.67;lastTime=time
   position.current=settleScan(position.current,target.current,elapsed,reduced.matches)
   const y=position.current,matrix=svg!.getScreenCTM(),bounds=scene!.getBoundingClientRect()
   // Read geometry before writes. Both layers and the line share exactly the same boundary.
   exterior!.setAttribute('height',y.toFixed(3))
   interior!.setAttribute('y',y.toFixed(3));interior!.setAttribute('height',(TRUCK_VIEW.height-y).toFixed(3))
   line!.style.top='0';if(matrix)line!.style.transform=`translate3d(0,${matrix.d*y+matrix.f-bounds.top}px,0)`
   const percent=Math.round((TRUCK_VIEW.max-y)/(TRUCK_VIEW.max-TRUCK_VIEW.min)*100)
   if(percent!==lastPercent){scene!.setAttribute('aria-valuenow',String(percent));lastPercent=percent}
   const zone=y<105?0:y<365?1:2
   if(zone!==lastZone){const item=descriptions[zone];if(title.current)title.current.textContent=item.title;if(detail.current)detail.current.textContent=item.detail;if(code.current)code.current.textContent=item.code;lastZone=zone}
   if(position.current!==target.current)schedule()
   else lastTime=0
  }
  function move(event:PointerEvent){
   if(event.pointerType!=='mouse'&&activePointer!==event.pointerId)return
   // Browsers can dispatch a zero-motion pointer event when scrolling under a stationary mouse.
   if(event.pointerType==='mouse'&&activePointer===null&&event.movementX===0&&event.movementY===0)return
   const point=event.getCoalescedEvents?.().at(-1)||event,matrix=svg!.getScreenCTM()
   if(!matrix)return
   const y=pointerScanY(point.clientX,point.clientY,matrix)
   if(y===null)return
   target.current=y;schedule()
  }
  function down(event:PointerEvent){
   if(!event.isPrimary||event.button!==0)return
   activePointer=event.pointerId;scene!.setPointerCapture(event.pointerId);move(event)
  }
  function stop(event:PointerEvent){if(activePointer===event.pointerId){activePointer=null;if(scene!.hasPointerCapture(event.pointerId))scene!.releasePointerCapture(event.pointerId)}}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0}else schedule()}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){lastTime=0;schedule()}else{cancelAnimationFrame(frame);frame=0;lastTime=0}},{threshold:.01})
  const resizer=new ResizeObserver(schedule)
  observer.observe(scene);resizer.observe(scene)
  scene.addEventListener('pointermove',move,{passive:true});scene.addEventListener('pointerdown',down);scene.addEventListener('pointerup',stop);scene.addEventListener('pointercancel',stop);scene.addEventListener('lostpointercapture',stop)
  // Scrolling never changes the scan target. A stationary cursor does not animate the scene.
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',schedule);wake.current=schedule
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();scene.removeEventListener('pointermove',move);scene.removeEventListener('pointerdown',down);scene.removeEventListener('pointerup',stop);scene.removeEventListener('pointercancel',stop);scene.removeEventListener('lostpointercapture',stop);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',schedule);wake.current=()=>{}}
 },[])
 return <section className={s.lab} id="experience" aria-labelledby="reveal-title"><div className={s.canvas}>
  <header className={s.sceneHeader}><span>01 / THE EXPERIENCE</span><span>CRAFTED BY KORYX <i/></span></header>
  <div className={s.sceneIntro}><h2 id="reveal-title">Two worlds.<br/><span>One line.</span></h2><p>Move your cursor. See beneath the surface.<br/><span className={s.touchHint}>On a phone, move your finger across the truck.</span></p></div>
  <div ref={stage} className={s.stage} data-scan-stage tabIndex={0} role="slider" aria-orientation="vertical" aria-label="Truck X-ray scanner. Move the cursor or drag with your finger. Arrow keys also move the line." aria-valuemin={0} aria-valuemax={100} aria-valuenow={51} onKeyDown={event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();target.current=event.key==='Home'?TRUCK_VIEW.max:event.key==='End'?TRUCK_VIEW.min:clampScan(target.current+(event.key==='ArrowDown'?14:-14));wake.current()}}>
   <div className={s.stageGrid} aria-hidden="true"/><div className={s.stageTop}><span>TRANSPORT / INTERACTIVE CUTAWAY</span><span>EXTERIOR ↔ X-RAY</span></div><FreightTruck svgRef={truck}/><div ref={beam} className={s.scanBeam} aria-hidden="true"/><div className={s.horizon} aria-hidden="true"/>
  </div>
  <div className={s.console}><div className={s.telemetry}><span ref={code}>02 / CUTAWAY</span><output ref={title}>Between two worlds.</output><p ref={detail}>One continuous line. The exterior above. The engineering below.</p></div><div className={s.gesture}><MoveVertical size={16}/><span>Lift to reveal. Lower to restore.<small>CURSOR / TOUCH / ARROW KEYS</small></span></div></div>
  <div className={s.sceneFoot}><span>AN ORIGINAL INTERACTIVE STUDY</span><span>ONE LINE / TWO PERSPECTIVES</span></div>
 </div></section>
}
