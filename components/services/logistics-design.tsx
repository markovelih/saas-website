'use client'

import {useEffect,useRef} from 'react'
import type {CSSProperties} from 'react'
import {ArrowDown,MoveVertical} from 'lucide-react'
import {FreightTruck} from './freight-truck'
import s from './logistics-design.module.css'

const descriptions=[
  {title:'Beneath the body.',detail:'Roof supports, cabin and the structure behind the surface.',code:'01 / STRUCTURE'},
  {title:'The working interior.',detail:'Secured cargo and a cutaway of the powertrain.',code:'02 / INTERIOR'},
  {title:'The foundation.',detail:'Frame, axles and suspension. The structure underneath.',code:'03 / CHASSIS'},
]
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))

export function DesignCanvas(){
  const timeline=useRef<HTMLElement>(null)
  const canvas=useRef<HTMLDivElement>(null)
  const stage=useRef<HTMLDivElement>(null)
  const title=useRef<HTMLOutputElement>(null)
  const detail=useRef<HTMLParagraphElement>(null)
  const code=useRef<HTMLSpanElement>(null)
  const progress=useRef<HTMLDivElement>(null)
  const position=useRef(180)
  const keyboardTarget=useRef(180)
  const wake=useRef<()=>void>(()=>{})
  const inputMode=useRef<'scroll'|'pointer'|'keyboard'>('scroll')

  useEffect(()=>{
    const rootNode=canvas.current,sceneNode=stage.current,sectionNode=timeline.current
    if(!rootNode||!sceneNode||!sectionNode)return
    const root=rootNode,scene=sceneNode,section=sectionNode
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame=0,visible=false,lastTime=0,dirty=true,scrollDirty=true,dragging=false
    let pointerY=0,drawTop=0,drawHeight=1,stickyTop=64
    let scrollTarget=180,lastZone=-1,lastProgress=-1
    function schedule(){
      if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render)
    }
    function render(time:number){
      frame=0
      if(!visible||document.hidden)return
      // Layout reads are batched here; pointer events only update the target.
      if(dirty){
        const truck=scene.querySelector('[data-freight-truck]')?.getBoundingClientRect()
        if(truck){drawTop=truck.top;drawHeight=truck.height}
        stickyTop=Number.parseFloat(getComputedStyle(root).top)||64
        dirty=false
      }
      if(scrollDirty){
        const bounds=section.getBoundingClientRect()
        const travel=Math.max(1,bounds.height-root.clientHeight)
        const p=clamp((stickyTop-bounds.top)/travel,0,1)
        scrollTarget=85+p*245
        if(Math.abs(p-lastProgress)>.001){
          progress.current?.style.setProperty('--reveal-progress',String(p))
          lastProgress=p
        }
        scrollDirty=false
      }
      const target=inputMode.current==='pointer'
        ?clamp((pointerY-drawTop)/drawHeight*430,80,335)
        :inputMode.current==='keyboard'?keyboardTarget.current:scrollTarget
      const elapsed=lastTime?time-lastTime:0
      const dt=elapsed>0&&elapsed<100?Math.min(elapsed,32):1000/60
      lastTime=time
      const alpha=reduced.matches?1:1-Math.exp(-dt/42)
      position.current+= (target-position.current)*alpha
      if(Math.abs(target-position.current)<.03)position.current=target
      root.style.setProperty('--scan-y',position.current.toFixed(3))
      const zone=position.current>285?2:position.current>185?1:0
      if(zone!==lastZone){
        const item=descriptions[zone]
        if(title.current)title.current.textContent=item.title
        if(detail.current)detail.current.textContent=item.detail
        if(code.current)code.current.textContent=item.code
        lastZone=zone
      }
      if(Math.abs(target-position.current)>.03)schedule()
    }
    function move(event:PointerEvent){
      if(event.pointerType!=='mouse'&&!dragging)return
      const latest=event.getCoalescedEvents?.().at(-1)||event
      pointerY=latest.clientY
      inputMode.current='pointer'
      schedule()
    }
    function down(event:PointerEvent){
      if(event.pointerType==='mouse')return
      dragging=true
      scene.setPointerCapture(event.pointerId)
      move(event)
    }
    function stop(){dragging=false}
    function enter(){dirty=true;schedule()}
    function scroll(){
      inputMode.current='scroll'
      dirty=true;scrollDirty=true
      schedule()
    }
    function resize(){dirty=true;scrollDirty=true;schedule()}
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0}else{dirty=true;scrollDirty=true;schedule()}}
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting
      if(visible){dirty=true;scrollDirty=true;lastTime=0;schedule()}
      else{cancelAnimationFrame(frame);frame=0;lastTime=0}
    },{threshold:.01})
    const resizer=new ResizeObserver(resize)
    observer.observe(scene);resizer.observe(scene)
    scene.addEventListener('pointermove',move,{passive:true})
    scene.addEventListener('pointerdown',down)
    scene.addEventListener('pointerup',stop)
    scene.addEventListener('pointercancel',stop)
    scene.addEventListener('pointerenter',enter,{passive:true})
    window.addEventListener('scroll',scroll,{passive:true})
    window.addEventListener('resize',resize,{passive:true})
    document.addEventListener('visibilitychange',visibility)
    reduced.addEventListener('change',resize)
    wake.current=schedule
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect()
      scene.removeEventListener('pointermove',move);scene.removeEventListener('pointerdown',down)
      scene.removeEventListener('pointerup',stop);scene.removeEventListener('pointercancel',stop)
      scene.removeEventListener('pointerenter',enter)
      window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize)
      document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',resize)
      wake.current=()=>{}
    }
  },[])

  return <section ref={timeline} className={s.lab} id="experience" aria-labelledby="reveal-title">
    <div ref={canvas} className={s.canvas} style={{'--scan-y':'180'} as CSSProperties}>
      <header className={s.sceneHeader}><span>01 / THE EXPERIENCE</span><span>CRAFTED BY KORYX <i/></span></header>
      <div className={s.sceneIntro}><h2 id="reveal-title">There’s more<br/><span>beneath the surface.</span></h2><p>Move up or down.<br/> Or scroll to reveal.</p></div>
      <div ref={stage} className={s.stage} data-scan-stage tabIndex={0} aria-label="Truck scanner. Move your pointer vertically, scroll, or use the up and down arrow keys." onKeyDown={event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();inputMode.current='keyboard';keyboardTarget.current=event.key==='Home'?80:event.key==='End'?335:clamp(position.current+(event.key==='ArrowDown'?18:-18),80,335);wake.current()}}>
        <div className={s.stageGrid} aria-hidden="true"/>
        <div className={s.stageTop}><span>TRANSPORT / DESIGN STUDY</span><span>EXTERIOR + INTERIOR</span></div>
        <FreightTruck/>
        <div className={s.horizon} aria-hidden="true"/>
        <span className={s.stageCorner} aria-hidden="true"/>
        <span className={s.stageCorner} aria-hidden="true"/>
      </div>
      <div className={s.console}>
        <div className={s.telemetry}><span ref={code}>01 / STRUCTURE</span><output ref={title}>Beneath the body.</output><p ref={detail}>Roof supports, cabin and the structure behind the surface.</p></div>
        <div className={s.gesture}><MoveVertical size={16}/><span>A movement. A different perspective.<small>POINTER / SCROLL / ARROW KEYS</small></span></div>
      </div>
      <div className={s.scrollCue}><span><ArrowDown size={11}/>KEEP SCROLLING TO REVEAL</span><div ref={progress} className={s.progress}><i/></div><span>DESIGN / MOTION / DEVELOPMENT</span></div>
    </div>
  </section>
}
