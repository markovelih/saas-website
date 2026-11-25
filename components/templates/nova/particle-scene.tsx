'use client'

import {useEffect, useRef} from 'react'
import s from './nova.module.css'
import {HERO_WORDS,heroPose,textParticle} from './hero-motion'

type Point = {x:number; y:number}
type Particle = Point & {seed:number; size:number}


/** The entire scene is drawn locally: no video, tracking, WebGL or asset requests. */
export function ParticleScene({variant='hero'}:{variant?:'hero'|'orbit'}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const el=canvas.current, ctx=el?.getContext('2d',{alpha:false})
    if(!el||!ctx)return
    const node=el, context=ctx, motion=matchMedia('(prefers-reduced-motion: reduce)')
    let width=0,height=0,frame=0,last=0,time=0,visible=false,disposed=false
    let targets:Point[][]=[],particles:Particle[]=[]
    const pointer={x:0,y:0},sparks=Array.from({length:95},(_,i)=>({seed:((i*71)%97)/97,angle:i*2.39996323})),stars=Array.from({length:620},(_,i)=>({angle:i*2.39996323,radius:.18+((i*73)%277)/220,z:((i*193)%1200)+1,seed:((i*37)%100)/100}))
    function resize(){
      const rect=node.getBoundingClientRect();width=rect.width;height=rect.height
      if(!width||!height)return
      const dpr=Math.min(devicePixelRatio||1,1.75)
      node.width=Math.round(width*dpr);node.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0)
      if(variant==='hero'){
        const sample=document.createElement('canvas');sample.width=640;sample.height=160
        const ink=sample.getContext('2d',{willReadFrequently:true});if(!ink)return
        const font=Math.min(72,Math.max(42,width*.052)),step=width<600?3:2
        targets=HERO_WORDS.map(word=>{
          ink.clearRect(0,0,640,160);ink.fillStyle='#fff';ink.font=`750 ${font}px Arial, sans-serif`;ink.textAlign='center';ink.textBaseline='middle';ink.fillText(word,320,80)
          const data=ink.getImageData(0,0,640,160).data,points:Point[]=[]
          for(let y=10;y<150;y+=step)for(let x=30;x<610;x+=step)if(data[(y*640+x)*4+3]>140)points.push({x:x-320,y:y-80})
          // A stable spatial shuffle avoids every dot moving in the same stripe.
          return points.sort((a,b)=>Math.sin(a.x*12.9898+a.y*78.233)-Math.sin(b.x*12.9898+b.y*78.233))
        })
        const count=width<600?1500:3000
        particles=Array.from({length:count},(_,i)=>{const t=targets[0][i%targets[0].length];return {x:t.x,y:t.y,seed:(i*.6180339)%1,size:1.05+(i%4)*.22}})
      }
      if(motion.matches)draw(0)
    }
    function draw(dt:number){
      context.fillStyle='#000';context.fillRect(0,0,width,height)
      if(variant==='orbit'){
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
      const cx=width/2,cy=height*.43,zoom=Math.min(width,height)*1.1,pose=heroPose(time,motion.matches)
      // A travelling shell of curved dots alternates with sparse flight trails.
      const wave=(time/2.35)%1,waveRadius=(1-wave)*Math.max(width,height)*.85
      for(const star of stars){
        if(!motion.matches){star.z-=dt*(170+star.seed*210);if(star.z<22)star.z+=1180}
        const theta=star.angle+Math.sin(time*.5+star.seed*9)*.09
        const sx=Math.cos(theta)*star.radius*width*.7,sy=Math.sin(theta)*star.radius*height*.9
        const x=cx+sx/star.z*zoom,y=cy+sy/star.z*zoom
        if(x< -100||x>width+100||y< -100||y>height+100)continue
        const distance=Math.hypot(x-cx,y-cy),ring=Math.exp(-Math.pow((distance-waveRadius)/(Math.min(width,height)*.22),2))
        const alpha=(.07+ring*.68+pose.mesh*.13)*(1-star.z/1700),trail=90+star.seed*210
        const endX=cx+sx/(star.z+trail)*zoom,endY=cy+sy/(star.z+trail)*zoom,bend=Math.sin(star.seed*30+time*.4)*12
        context.beginPath();context.moveTo(x,y);context.quadraticCurveTo((x+endX)/2+bend,(y+endY)/2-bend,endX,endY)
        context.strokeStyle=`rgba(255,255,255,${alpha})`;context.lineWidth=.6;context.setLineDash([.85,3]);context.stroke();context.setLineDash([])
      }
      if(!targets.length||!particles.length)return
      const from=targets[pose.from],to=targets[pose.to]
      const threadPoints:Point[]=[]
      // Analytic positions keep the fold/hold timing identical at 30, 60 or 120 Hz.
      for(let i=0;i<particles.length;i++){
        const p=particles[i],a=from[i%from.length],b=to[i%to.length]
        const point=textParticle(a,b,p.seed,time,pose)
        let tx=point.x,ty=point.y
        const dx=tx-pointer.x,dy=ty-pointer.y,distance=Math.hypot(dx,dy)
        if(distance<62&&distance>1&&pose.phase==='hold'){tx+=dx/distance*(62-distance)*.12;ty+=dy/distance*(62-distance)*.12}
        const drift=motion.matches?0:.18
        tx+=Math.sin(time*1.3+p.seed*80)*drift;ty+=Math.cos(time+p.seed*50)*drift
        p.x=tx;p.y=ty
        context.fillStyle=`rgba(255,255,255,${.58+p.seed*.42})`;context.fillRect(cx+tx,cy+ty,p.size,p.size)
        if(i%23===0)threadPoints.push({x:tx,y:ty})
      }
      if(pose.mesh>.025&&!motion.matches){
        // The fine connecting filaments are part of the word transition itself.
        for(let i=0;i<(width<600?60:sparks.length);i++){
          const spark=sparks[i],anchor=from[(i*43)%from.length],next=to[(i*43)%to.length]
          const baseX=anchor.x+(next.x-anchor.x)*pose.mix,baseY=(anchor.y+(next.y-anchor.y)*pose.mix)*Math.cos(pose.angle)
          const radius=pose.mesh*(35+spark.seed*215),angle=spark.angle+time*.15
          const x=baseX+Math.cos(angle)*radius,y=baseY+Math.sin(angle)*radius*.7
          threadPoints.push({x,y})
          const tail=pose.mesh*(7+spark.seed*27)
          context.beginPath();context.moveTo(cx+x,cy+y);context.lineTo(cx+x+Math.cos(angle)*tail,cy+y+Math.sin(angle)*tail)
          context.strokeStyle=`rgba(255,255,255,${pose.mesh*(.2+spark.seed*.5)})`;context.lineWidth=.55;context.stroke()
          context.fillStyle=`rgba(255,255,255,${pose.mesh*.7})`;context.fillRect(cx+x,cy+y,.8,.8)
        }
        let connections=0;const maxConnections=width<600?200:340
        for(let i=0;i<threadPoints.length&&connections<maxConnections;i++){
          const a=threadPoints[i];let linked=0
          for(let j=i+1;j<threadPoints.length&&linked<3&&connections<maxConnections;j++){
            const b=threadPoints[j],d=Math.hypot(a.x-b.x,a.y-b.y)
            if(d>12&&d<82){
              context.beginPath();context.moveTo(cx+a.x,cy+a.y);context.lineTo(cx+b.x,cy+b.y)
              context.strokeStyle=`rgba(255,255,255,${pose.mesh*(1-d/100)*.75})`;context.lineWidth=.6;context.stroke();linked++;connections++
            }
          }
        }
      }
      const word=HERO_WORDS[pose.mix>.5?pose.to:pose.from]
      if(node.dataset.word!==word)node.dataset.word=word
      if(node.dataset.phase!==pose.phase)node.dataset.phase=pose.phase
    }

    function tick(now:number){
      frame=0;if(disposed||!visible||document.hidden||motion.matches)return
      const elapsed=Math.max(0,(now-(last||now))/1000);last=now;time+=elapsed;draw(Math.min(elapsed,.05));frame=requestAnimationFrame(tick)
    }
    function start(){if(disposed)return;if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(motion.matches)draw(0);else if(visible&&!document.hidden)frame=requestAnimationFrame(tick)}
    function move(e:PointerEvent){const r=node.getBoundingClientRect();pointer.x=e.clientX-r.left-width/2;pointer.y=e.clientY-r.top-height*.43}
    function leave(){pointer.x=10000;pointer.y=10000}
    leave();resize();draw(0);node.dataset.ready='true'
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()},{rootMargin:'80px'})
    const sizes=new ResizeObserver(()=>{resize();start()});observer.observe(node);sizes.observe(node)
    node.addEventListener('pointermove',move);node.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',start);motion.addEventListener('change',start)
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();node.removeEventListener('pointermove',move);node.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',start);motion.removeEventListener('change',start)}
  },[variant])
  return <div className={variant==='hero'?s.scene:s.orbit} aria-hidden="true"><canvas ref={canvas} className={s.canvas}/>{variant==='hero'&&<span className={s.wordFallback}>NOVA</span>}</div>
}
