'use client'

import {useEffect, useRef} from 'react'
import s from './nova.module.css'

type Point = {x:number; y:number}
type Particle = Point & {seed:number; size:number}
const words = ['SAAS', 'PLATFORM', 'NOVA']
const ease = (x:number) => x*x*(3-2*x)

/** The entire scene is drawn locally: no video, tracking, WebGL or asset requests. */
export function ParticleScene({variant='hero'}:{variant?:'hero'|'orbit'}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const el=canvas.current, ctx=el?.getContext('2d',{alpha:false})
    if(!el||!ctx)return
    const node=el, context=ctx, motion=matchMedia('(prefers-reduced-motion: reduce)')
    let width=0,height=0,frame=0,last=0,time=0,visible=false,disposed=false
    let targets:Point[][]=[],particles:Particle[]=[]
    const pointer={x:0,y:0},stars=Array.from({length:620},(_,i)=>({angle:i*2.39996323,radius:.18+((i*73)%277)/220,z:((i*193)%1200)+1,seed:((i*37)%100)/100}))
    function resize(){
      const rect=node.getBoundingClientRect();width=rect.width;height=rect.height
      if(!width||!height)return
      const dpr=Math.min(devicePixelRatio||1,1.75)
      node.width=Math.round(width*dpr);node.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0)
      if(variant==='hero'){
        const sample=document.createElement('canvas');sample.width=640;sample.height=160
        const ink=sample.getContext('2d',{willReadFrequently:true});if(!ink)return
        const font=Math.min(72,Math.max(42,width*.052)),step=width<600?3:2
        targets=words.map(word=>{
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
      const cx=width/2,cy=height*.43,zoom=Math.min(width,height)*1.1
      for(const star of stars){
        if(!motion.matches){star.z-=dt*(160+star.seed*180);if(star.z<22)star.z+=1180}
        const sx=Math.cos(star.angle)*star.radius*width*.7,sy=Math.sin(star.angle)*star.radius*height*.9
        const x=cx+sx/star.z*zoom,y=cy+sy/star.z*zoom
        if(x< -100||x>width+100||y< -100||y>height+100)continue
        const alpha=Math.min(.8,.2+(1-star.z/1400)*.6),trail=100+star.seed*230
        context.beginPath();context.moveTo(x,y);context.lineTo(cx+sx/(star.z+trail)*zoom,cy+sy/(star.z+trail)*zoom)
        context.strokeStyle=`rgba(255,255,255,${alpha*.75})`;context.lineWidth=.65;context.setLineDash([1,3]);context.stroke();context.setLineDash([])
        context.fillStyle=`rgba(255,255,255,${alpha})`;context.fillRect(x,y,.8,.8)
      }
      if(!targets.length||!particles.length)return
      const cycle=3.6,phase=time/cycle,index=motion.matches?2:Math.floor(phase)%3,local=phase%1,previous=(index+2)%3
      const morph=motion.matches?1:ease(Math.min(1,local/.32)),burst=Math.sin(Math.min(1,local/.32)*Math.PI)
      const from=targets[previous],to=targets[index]
      const relax=1-Math.exp(-dt*11)
      for(let i=0;i<particles.length;i++){
        const p=particles[i],a=from[i%from.length],b=to[i%to.length]
        const theta=p.seed*Math.PI*12+time*.15
        let tx=a.x+(b.x-a.x)*morph+Math.cos(theta)*burst*(10+p.seed*44),ty=a.y+(b.y-a.y)*morph+Math.sin(theta)*burst*(8+p.seed*35)
        tx+=Math.sin(time*1.1+p.seed*80)*.7;ty+=Math.cos(time*.9+p.seed*50)*.7
        const dx=p.x-pointer.x,dy=p.y-pointer.y,distance=Math.hypot(dx,dy)
        if(distance<75&&distance>1){tx+=dx/distance*(75-distance)*.22;ty+=dy/distance*(75-distance)*.22}
        if(motion.matches){p.x=b.x;p.y=b.y}else{p.x+=(tx-p.x)*relax;p.y+=(ty-p.y)*relax}
        context.fillStyle=`rgba(255,255,255,${.65+p.seed*.35})`;context.fillRect(cx+p.x,cy+p.y,p.size,p.size)
      }
      node.dataset.word=words[index]
    }
    function tick(now:number){
      frame=0;if(disposed||!visible||document.hidden||motion.matches)return
      const dt=Math.min((now-(last||now))/1000,.04);last=now;time+=dt;draw(dt);frame=requestAnimationFrame(tick)
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
