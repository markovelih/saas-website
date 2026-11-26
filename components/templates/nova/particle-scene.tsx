'use client'

import {useEffect, useRef} from 'react'
import s from './nova.module.css'
import {createHeroRenderer} from './hero-renderer'


/** The entire scene is drawn locally: no video, tracking, WebGL or asset requests. */
export function ParticleScene({variant='hero'}:{variant?:'hero'|'orbit'}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const el=canvas.current, ctx=el?.getContext('2d',{alpha:false})
    if(!el||!ctx)return
    const node=el, context=ctx, motion=matchMedia('(prefers-reduced-motion: reduce)')
    let width=0,height=0,frame=0,last=0,time=0,paintDue=0,visible=false,disposed=false
    let hero:ReturnType<typeof createHeroRenderer>|undefined

    function resize(){
      const rect=node.getBoundingClientRect();width=rect.width;height=rect.height
      if(!width||!height)return
      const dpr=Math.min(devicePixelRatio||1,1.75)
      node.width=Math.round(width*dpr);node.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0)
      if(variant==='hero')hero=createHeroRenderer(context,width,height,time)
      if(motion.matches)draw()
    }
    function draw(){
      if(variant==='orbit'){
        context.fillStyle='#000';context.fillRect(0,0,width,height)
        // A shallow, rotating bowl of fine curved trails, as in the reference footer.
        for(let i=0;i<155;i++){
          const seed=((i*73)%157)/157,other=((i*43)%151)/151,phase=(time*.09+((i*97)%163)/163)%1
          const trail=.045+seed*.14
          context.beginPath()
          for(let j=0;j<=18;j++){
            const t=phase+j/18*trail
            if(t>1)break
            const x=width/2+(t-.5)*width*(1.02+other*.32)+(seed-.5)*width*.09
            const y=height*.03+Math.sin(t*Math.PI)*height*(.73+seed*.27)+(other-.5)*(t-.5)*height*.24
            if(!j)context.moveTo(x,y);else context.lineTo(x,y)
          }
          context.strokeStyle=`rgba(255,255,255,${.1+seed*.42})`;context.lineWidth=.55+other*.3;context.stroke()
        }
        return
      }
      if(!hero)return
      const state=hero.draw(time,motion.matches)
      if(node.dataset.word!==state.word)node.dataset.word=state.word
      if(node.dataset.phase!==state.phase)node.dataset.phase=state.phase
    }

    function tick(now:number){
      frame=0;if(disposed||!visible||document.hidden||motion.matches)return
      const elapsed=Math.max(0,(now-(last||now))/1000);last=now;time+=elapsed
      // ProMotion screens should not double the raster work. Motion uses real time.
      if(now>=paintDue){draw();paintDue+=1000/60;if(paintDue<now)paintDue=now+1000/60}
      frame=requestAnimationFrame(tick)
    }
    function start(){if(disposed)return;if(frame)cancelAnimationFrame(frame);frame=0;last=0;paintDue=0;if(motion.matches)draw();else if(visible&&!document.hidden)frame=requestAnimationFrame(tick)}
    resize();draw();node.dataset.ready='true'
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()},{rootMargin:'80px'})
    const sizes=new ResizeObserver(()=>{resize();start()});observer.observe(node);sizes.observe(node)
    document.addEventListener('visibilitychange',start);motion.addEventListener('change',start)
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();document.removeEventListener('visibilitychange',start);motion.removeEventListener('change',start)}
  },[variant])
  return <div className={variant==='hero'?s.scene:s.orbit} aria-hidden="true"><canvas ref={canvas} className={s.canvas}/>{variant==='hero'&&<span className={s.wordFallback}>NOVA</span>}</div>
}
