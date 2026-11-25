export const HERO_WORDS=['SAAS','PLATFORM','NOVA','Nova'] as const
export const INTRO_SECONDS=2.1
export const FIRST_HOLD_SECONDS=1.2
export const WORD_SECONDS=2.2
export const TRANSITION_SECONDS=.62

const clamp=(n:number)=>Math.max(0,Math.min(1,n))
export function smooth(start:number,end:number,value:number){const t=clamp((value-start)/(end-start));return t*t*(3-2*t)}

/** Reference motion: fold edge-on, exchange in a luminous ribbon, unfold, hold. */
export function heroPose(seconds:number,reduced=false){
  if(reduced)return {from:2,to:2,mix:1,angle:0,scatter:0,mesh:0,arrival:1,phase:'hold' as const}
  const time=Math.max(0,seconds)
  if(time<INTRO_SECONDS){
    const arrival=smooth(0,1.1,time),unfold=smooth(1.35,INTRO_SECONDS,time)
    return {from:0,to:0,mix:0,angle:(1-unfold)*Math.PI/2,scatter:Math.sin(Math.PI*time/INTRO_SECONDS),mesh:Math.sin(Math.PI*time/INTRO_SECONDS),arrival,phase:time<1.1?'arrive' as const:time<1.35?'ribbon' as const:'rebuild' as const}
  }
  if(time<INTRO_SECONDS+FIRST_HOLD_SECONDS)return {from:0,to:0,mix:1,angle:0,scatter:0,mesh:0,arrival:1,phase:'hold' as const}
  const running=time-INTRO_SECONDS-FIRST_HOLD_SECONDS,step=Math.floor(running/WORD_SECONDS),local=running-step*WORD_SECONDS
  const from=step%HERO_WORDS.length,to=(from+1)%HERO_WORDS.length
  if(local>=TRANSITION_SECONDS)return {from:to,to,mix:1,angle:0,scatter:0,mesh:.2*(1-smooth(TRANSITION_SECONDS,.9,local)),arrival:1,phase:'hold' as const}
  return {
    from,to,mix:smooth(.14,.36,local),
    angle:local<.28?-Math.PI/2*smooth(0,.18,local):Math.PI/2*(1-smooth(.28,TRANSITION_SECONDS,local)),
    scatter:Math.sin(Math.PI*local/TRANSITION_SECONDS),mesh:Math.sin(Math.PI*local/TRANSITION_SECONDS),arrival:1,
    phase:local<.18?'collapse' as const:local<.32?'ribbon' as const:'rebuild' as const,
  }
}

export function textParticle(a:{x:number;y:number},b:{x:number;y:number},seed:number,time:number,pose:ReturnType<typeof heroPose>){
  const depth=Math.sin(seed*371.7)*23*pose.scatter
  const localY=a.y+(b.y-a.y)*pose.mix
  const perspective=620/(620+localY*Math.sin(pose.angle)+depth)
  const travel=(1-pose.arrival)*(650+seed*650),heading=seed*Math.PI*2*13
  return {
    x:((a.x+(b.x-a.x)*pose.mix)*(1+pose.scatter*.05)+Math.sin(seed*913+time*12)*pose.scatter*8)*perspective+Math.cos(heading)*travel,
    y:(localY*Math.cos(pose.angle)+Math.sin(seed*719+time*9)*pose.scatter*13)*perspective+Math.sin(heading)*travel*.6,
  }
}
