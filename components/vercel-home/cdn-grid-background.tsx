'use client'

import {useEffect,useId,useRef,useState} from 'react'
import s from './grid-light.module.css'

export function CdnGridBackground(){
 const id=useId().replace(/:/g,''),ref=useRef<HTMLDivElement>(null),grid=useRef<SVGSVGElement>(null)
 const [size,setSize]=useState({width:1450,height:850,cell:64})
 useEffect(()=>{
  const el=ref.current,svg=grid.current;if(!el||!svg)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let visible=false,frame=0,position={x:0,y:0},pointerActive=false
  const update=()=>{el.dataset.running=String(visible&&!document.hidden)}
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();if(!visible){cancelAnimationFrame(frame);frame=0}})
  intersection.observe(el)
  const resize=new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect;setSize({width,height,cell:width<700?48:64})})
  resize.observe(svg)
  function paint(){frame=0;el!.style.setProperty('--grid-focus-x',position.x+'px');el!.style.setProperty('--grid-focus-y',position.y+'px')}
  function move(event:PointerEvent){if(!visible||document.hidden||reduced.matches||event.pointerType!=='mouse')return;const bounds=el!.getBoundingClientRect();pointerActive=event.clientY>=bounds.top&&event.clientY<=bounds.bottom;el!.dataset.pointer=String(pointerActive);if(!pointerActive)return;position={x:event.clientX-bounds.left,y:event.clientY-bounds.top};if(!frame)frame=requestAnimationFrame(paint)}
  function reset(){el!.dataset.pointer='false';pointerActive=false;cancelAnimationFrame(frame);frame=0}
  function visibility(){update();if(document.hidden)reset()}
  function motionPreference(){if(reduced.matches)reset()}
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('blur',reset);document.documentElement.addEventListener('pointerleave',reset);document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motionPreference)
  return()=>{intersection.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);window.removeEventListener('blur',reset);document.documentElement.removeEventListener('pointerleave',reset);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motionPreference)}
 },[])
 const cell=size.cell,x=Math.ceil(size.width/cell),y=Math.ceil(size.height/cell),cx=Math.floor(x/2),cy=Math.floor(y/2)
 const paths=[`M0 ${cell*2}H${cell*(cx-2)}V${cell*4}H${cell*(cx+3)}`,`M${cell*x} ${cell*3}H${cell*(cx+4)}V${cell*(cy+2)}H${cell*(cx+1)}`,`M${cell} ${cell*(y-2)}H${cell*(cx-3)}V${cell*(cy-1)}H${cell*(cx+2)}`,`M${cell*(x-1)} ${cell*(y-1)}H${cell*(cx+3)}V${cell*(cy+1)}H${cell*(cx-1)}`]
 return <div ref={ref} data-running="false" data-pointer="false" className={s.background} aria-hidden="true">
  <svg ref={grid} className={s.grid} width="100%" height="100%"><defs><pattern id={`grid-${id}`} width={cell} height={cell} patternUnits="userSpaceOnUse"><path d={`M${cell} 0H0V${cell}`} className={s.gridLine}/></pattern><pattern id={`focus-${id}`} width={cell} height={cell} patternUnits="userSpaceOnUse"><path d={`M${cell} 0H0V${cell}`} className={s.focusLine}/><circle cx="0" cy="0" r="2" className={s.focusPoint}/></pattern></defs><rect width="100%" height="100%" fill={`url(#grid-${id})`}/><rect className={s.focusGrid} width="100%" height="100%" fill={`url(#focus-${id})`}/>{paths.map((d,i)=><g key={d} className={s.trail} style={{animationDelay:`-${i*2.7}s`}}><path d={d} pathLength="1" className={s.glow}/><path d={d} pathLength="1" className={s.core}/><path d={d} pathLength="1" className={s.tip}/></g>)}</svg>
  <div className={s.edge}/>
 </div>
}
