'use client'

import {useEffect,useRef} from 'react'
import type {CSSProperties,ReactNode,PointerEvent} from 'react'
import s from './motion.module.css'

export function MotionSurface({children,className='',interactive=false,label}:{children:ReactNode;className?:string;interactive?:boolean;label?:string}){
 const ref=useRef<HTMLDivElement>(null)
 const frame=useRef(0)
 useEffect(()=>{
  const el=ref.current;if(!el)return
  let visible=false
  const update=()=>{el.dataset.motionRunning=String(visible&&!document.hidden);el.dataset.running=el.dataset.motionRunning}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()},{threshold:.01})
  observer.observe(el);document.addEventListener('visibilitychange',update)
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);cancelAnimationFrame(frame.current)}
 },[])
 function move(event:PointerEvent<HTMLDivElement>){
  if(!interactive||event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
  const el=event.currentTarget,rect=el.getBoundingClientRect()
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))
  cancelAnimationFrame(frame.current)
  frame.current=requestAnimationFrame(()=>{el.style.setProperty('--pointer-x',`${x*100}%`);el.style.setProperty('--pointer-y',`${y*100}%`);el.style.setProperty('--rotate-x',`${(0.5-y)*8}deg`);el.style.setProperty('--rotate-y',`${(x-0.5)*10}deg`)})
 }
 function leave(){cancelAnimationFrame(frame.current);const el=ref.current;if(el){el.style.setProperty('--rotate-x','0deg');el.style.setProperty('--rotate-y','0deg')}}
 return <div ref={ref} className={`${s.surface} ${className}`} data-motion-running="false" data-running="false" onPointerMove={move} onPointerLeave={leave} aria-label={label}>{children}</div>
}

export function SignalPath({d,tone='blue',delay=0,duration=6,active=true,wire=true}:{d:string;tone?:'blue'|'cyan'|'violet'|'amber'|'green'|'red';delay?:number;duration?:number;active?:boolean;wire?:boolean}){
 return <g className={s.signal} data-tone={tone} data-active={active} style={{'--signal-duration':`${duration}s`,'--signal-delay':`${delay}s`} as CSSProperties}>
  {wire&&<path d={d} className={s.wire}/>}
  <g className={s.packet}><path d={d} pathLength="1" className={s.halo}/><path d={d} pathLength="1" className={s.trail}/><path d={d} pathLength="1" className={s.tip}/></g>
 </g>
}

export function KoryxMark(){return <svg viewBox="0 0 128 128" fill="currentColor" aria-hidden="true"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg>}
