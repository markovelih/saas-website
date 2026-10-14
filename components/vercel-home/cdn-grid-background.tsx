'use client'

import {useEffect,useId,useRef,useState} from 'react'
import s from './grid-light.module.css'

export function CdnGridBackground(){
 const id=useId().replace(/:/g,'')
 const ref=useRef<HTMLDivElement>(null)
 const grid=useRef<SVGSVGElement>(null)
 const [cells,setCells]=useState({x:34,y:20})
 useEffect(()=>{const el=ref.current,svg=grid.current;if(!el||!svg)return;let visible=false;const update=()=>{el.dataset.running=String(visible&&!document.hidden)};const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()});intersection.observe(el);const resize=new ResizeObserver(([entry])=>{setCells({x:Math.floor(entry.contentRect.width/72),y:Math.floor(entry.contentRect.height/72)})});resize.observe(svg);document.addEventListener('visibilitychange',update);return()=>{intersection.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',update)}},[])
 const x=cells.x,y=cells.y
 const paths=[`M72 216H576V360H936`,`M${(x-1)*72} 288H${(x-7)*72}V648H${(x-11)*72}`,`M144 ${(y-4)*72}H720V${(y-7)*72}H1080`,`M${(x-2)*72} ${(y-3)*72}H${(x-9)*72}V${(y-6)*72}H${(x-13)*72}`,`M0 648H360V864H792`]
 return <div ref={ref} data-running="false" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true"><div className="absolute inset-0 overflow-hidden [perspective:1000px]" style={{maskImage:'radial-gradient(circle at 50% 50%, black 20%, transparent 88%)',WebkitMaskImage:'radial-gradient(circle at 50% 50%, black 20%, transparent 88%)'}}><div className="absolute left-1/2 top-[50%] h-[850px] w-[1450px] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(58deg)] [transform-style:preserve-3d] max-md:h-[720px] max-md:w-[980px]"><svg ref={grid} className={s.grid} width="100%" height="100%"><defs><pattern id={`grid-${id}`} width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" className={s.gridLine}/></pattern></defs><rect width="100%" height="100%" fill={`url(#grid-${id})`}/>{paths.map((d,i)=><g key={d} className={s.trail} style={{animationDelay:`-${i*3.1}s`}}><path d={d} pathLength="1" className={s.glow}/><path d={d} pathLength="1" className={s.core}/><path d={d} pathLength="1" className={s.tip}/></g>)}</svg></div></div><div className="absolute left-1/2 top-[49%] h-[440px] w-[780px] -translate-x-1/2 -translate-y-1/2 site-grid-center max-md:h-[500px] max-md:w-[92vw]"/><div className="absolute inset-0 site-grid-edge"/></div>
}
