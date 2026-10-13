'use client'
import {useState} from 'react'
import {ArrowUpRight,Check} from 'lucide-react'
import s from './website-experience.module.css'

const phases={
  Design:{number:'01',title:'A visual language of your own.',body:'Typography, composition and motion, shaped around your brand. Every screen feels like it belongs.',points:['Visual direction','Responsive composition','Purposeful interaction']},
  Build:{number:'02',title:'Every layer works together.',body:'The interface, the behaviour and the foundation. Designed together, developed as one considered experience.',points:['Working pages and flows','Connected forms and features','Performance and accessibility']},
  Launch:{number:'03',title:'From a preview to your presence.',body:'Review the agreed work, test the important journeys and launch with a practical handover.',points:['Your review and approval','Domain and launch checks','Access and handover']},
}
export function InterfaceLayers(){
  const [phase,setPhase]=useState<keyof typeof phases>('Design')
  const item=phases[phase]
  return <div className={s.craftExperience} data-phase={phase}>
    <div className={s.layerScene} aria-hidden="true">
      <div className={s.layerGuides}/><span className={s.layerCoordinate}>THE ANATOMY OF AN EXPERIENCE</span>
      <div className={s.assembly}>
        <div className={s.foundation}><span>03 / FOUNDATION</span><div className={s.foundationGrid}/><div className={s.foundationCore}><svg viewBox="0 0 128 128" fill="currentColor"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg></div><div className={s.foundationFoot}><span>STRUCTURE</span><span>CONNECTION</span><span>RELEASE</span></div></div>
        <div className={s.behaviour}><span>02 / BEHAVIOUR</span><svg viewBox="0 0 400 230" fill="none"><path d="M40 112H130V65H270V112H360M130 112V172H270V112M200 65V172" stroke="currentColor"/><circle cx="40" cy="112" r="7"/><circle cx="360" cy="112" r="7"/><rect x="177" y="90" width="46" height="46"/></svg><div className={s.behaviourFoot}>INPUT → RESPONSE → OUTCOME</div></div>
        <div className={s.interfacePlane}><div className={s.planeNav}><span>KORYX / YOUR BRAND</span><span>01 — 03 ↗</span></div><div className={s.planeCopy}><span>A CONSIDERED PRESENCE</span><strong>A feeling.<br/>A direction.</strong><i/><i/></div><div className={s.planeArt}><div/><div/><svg viewBox="0 0 128 128" fill="currentColor"><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg></div><div className={s.planeFoot}><span>MADE AROUND YOU</span><ArrowUpRight size={12}/></div></div>
      </div>
      <span className={s.stackLabel}>DESIGN<br/>BEHAVIOUR<br/>FOUNDATION</span>
    </div>
    <div className={s.craftControl}><div className={s.phaseButtons} role="group" aria-label="Explore the website creation stages">{(Object.keys(phases) as (keyof typeof phases)[]).map(name=><button key={name} aria-pressed={phase===name} onClick={()=>setPhase(name)}>{name}<span>{phases[name].number}</span></button>)}</div><div className={s.phaseCopy} aria-live="polite"><span>{item.number} / THE CRAFT</span><h3>{item.title}</h3><p>{item.body}</p><ul>{item.points.map(point=><li key={point}><Check size={13}/>{point}</li>)}</ul></div></div>
  </div>
}
