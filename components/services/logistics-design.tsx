'use client'

import {useEffect,useId,useRef,useState} from 'react'
import type {CSSProperties} from 'react'
import {ArrowDown,Eye,MoveHorizontal,ScanLine} from 'lucide-react'
import {FreightTruck} from './freight-truck'
import s from './logistics-design.module.css'

const descriptions=[
  {title:'The load.',detail:'Cargo, bracing and the space behind the surface.',code:'01 / CARGO'},
  {title:'The foundation.',detail:'Frame, axles and suspension. The structure underneath.',code:'02 / CHASSIS'},
  {title:'The driving force.',detail:'Engine, cooling and the systems inside the cab.',code:'03 / POWERTRAIN'},
]
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))

export function DesignCanvas(){
  const [enabled,setEnabled]=useState(true)
  const timeline=useRef<HTMLElement>(null)
  const canvas=useRef<HTMLDivElement>(null)
  const stage=useRef<HTMLDivElement>(null)
  const range=useRef<HTMLInputElement>(null)
  const title=useRef<HTMLOutputElement>(null)
  const detail=useRef<HTMLParagraphElement>(null)
  const code=useRef<HTMLSpanElement>(null)
  const progress=useRef<HTMLDivElement>(null)
  const position=useRef(120)
  const keyboardTarget=useRef(120)
  const wake=useRef<()=>void>(()=>{})
  const inputMode=useRef<'scroll'|'pointer'|'keyboard'>('scroll')
  const rangeId=useId()

  useEffect(()=>{
    const rootNode=canvas.current,sceneNode=stage.current,sectionNode=timeline.current
    if(!rootNode||!sceneNode||!sectionNode)return
    const root=rootNode,scene=sceneNode,section=sectionNode
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame=0,visible=false,lastTime=0,dirty=true,scrollDirty=true,dragging=false
    let pointerX=0,drawLeft=0,drawWidth=1,stickyTop=64
    let scrollTarget=120,lastZone=-1,lastPercent=-1,lastProgress=-1
    function schedule(){
      if(!frame&&visible&&!document.hidden&&enabled)frame=requestAnimationFrame(render)
    }
    function render(time:number){
      frame=0
      if(!visible||document.hidden||!enabled)return
      // Layout reads are batched here; pointer events only update the target.
      if(dirty){
        const truck=scene.querySelector('[data-freight-truck]')?.getBoundingClientRect()
        if(truck){drawLeft=truck.left;drawWidth=truck.width}
        stickyTop=Number.parseFloat(getComputedStyle(root).top)||64
        dirty=false
      }
      if(scrollDirty){
        const bounds=section.getBoundingClientRect()
        const travel=Math.max(1,bounds.height-root.clientHeight)
        const p=clamp((stickyTop-bounds.top)/travel,0,1)
        scrollTarget=70+p*600
        if(Math.abs(p-lastProgress)>.001){
          progress.current?.style.setProperty('--reveal-progress',String(p))
          lastProgress=p
        }
        scrollDirty=false
      }
      const target=inputMode.current==='pointer'
        ?clamp((pointerX-drawLeft)/drawWidth*960-125,0,710)
        :inputMode.current==='keyboard'?keyboardTarget.current:scrollTarget
      const elapsed=lastTime?time-lastTime:0
      const dt=elapsed>0&&elapsed<100?Math.min(elapsed,32):1000/60
      lastTime=time
      const alpha=reduced.matches?1:1-Math.exp(-dt/42)
      position.current+= (target-position.current)*alpha
      if(Math.abs(target-position.current)<.03)position.current=target
      root.style.setProperty('--scan-x',position.current.toFixed(3))
      const pct=Math.round(position.current/7.1)
      if(pct!==lastPercent&&range.current){
        range.current.value=String(pct)
        lastPercent=pct
      }
      const zone=position.current>595?2:position.current>435?1:0
      if(zone!==lastZone){
        const item=descriptions[zone]
        if(title.current)title.current.textContent=item.title
        if(detail.current)detail.current.textContent=item.detail
        if(code.current)code.current.textContent=item.code
        range.current?.setAttribute('aria-valuetext',item.title)
        lastZone=zone
      }
      if(Math.abs(target-position.current)>.03)schedule()
    }
    function move(event:PointerEvent){
      if(event.pointerType!=='mouse'&&!dragging)return
      const latest=event.getCoalescedEvents?.().at(-1)||event
      pointerX=latest.clientX
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
  },[enabled])

  return <section ref={timeline} className={s.lab} id="experience" aria-labelledby="reveal-title">
    <div ref={canvas} className={s.canvas} data-view={enabled?'Scan':'Exterior'} style={{'--scan-x':'120'} as CSSProperties}>
      <header className={s.sceneHeader}><span>01 / THE EXPERIENCE</span><span>CRAFTED BY KORYX <i/></span></header>
      <div className={s.sceneIntro}><h2 id="reveal-title">There’s more<br/><span>beneath the surface.</span></h2><p>Move across the truck.<br/> Or scroll to reveal.</p></div>
      <div ref={stage} className={s.stage} data-scan-stage>
        <div className={s.stageGrid} aria-hidden="true"/>
        <div className={s.stageTop}><span>TRANSPORT / DESIGN STUDY</span><span>EXTERIOR + INTERIOR</span></div>
        <FreightTruck/>
        <div className={s.horizon} aria-hidden="true"/>
        <span className={s.stageCorner} aria-hidden="true"/>
        <span className={s.stageCorner} aria-hidden="true"/>
      </div>
      <div className={s.console}>
        <div className={s.telemetry}><span ref={code}>01 / CARGO</span><output ref={title}>The load.</output><p ref={detail}>Cargo, bracing and the space behind the surface.</p></div>
        <div className={s.controls}><button onClick={()=>setEnabled(value=>!value)} aria-pressed={enabled} aria-label="Toggle truck scanner">{enabled?<ScanLine size={15}/>:<Eye size={15}/>}<span>{enabled?'Scanner on':'Exterior'}</span></button><div className={s.scanControl}><label htmlFor={rangeId}><MoveHorizontal size={13}/><span>Move to inspect</span></label><input ref={range} id={rangeId} type="range" min="0" max="100" defaultValue="17" disabled={!enabled} aria-label="Truck scan position" onChange={event=>{inputMode.current='keyboard';keyboardTarget.current=Number(event.target.value)*7.1;wake.current()}}/></div></div>
      </div>
      <div className={s.scrollCue}><span><ArrowDown size={11}/>KEEP SCROLLING TO REVEAL</span><div ref={progress} className={s.progress}><i/></div><span>DESIGN / MOTION / DEVELOPMENT</span></div>
    </div>
  </section>
}
