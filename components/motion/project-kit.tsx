'use client'

import {useId,useState} from 'react'
import Link from 'next/link'
import {ArrowRight,Check,Globe,FileText} from 'lucide-react'
import {MotionSurface,KoryxMark} from './motion-primitives'
import s from './project-kit.module.css'

export function ProjectKit(){const [open,setOpen]=useState(false);const id=useId();return <section className={s.kitSection} id="handover">
 <div className={s.kitCopy}><span>THE FINISH IS PART OF THE EXPERIENCE</span><h2>Your next chapter.<br/>Ready to open.</h2><p>A website is more than a link. The agreed project, review notes and practical handover should feel like one considered whole.</p><Link href="/process">Explore how we work <ArrowRight size={15}/></Link><small>Interactive handover concept · explore the details.</small></div>
 <MotionSurface className={s.kitStage} interactive label="Interactive Koryx project handover kit"><div className={s.stageLabel}><span>KORYX / PROJECT EDITION</span><span>MOVE / OPEN / EXPLORE</span></div>
  <div className={s.kitPerspective} data-open={open}><div className={s.book}>
   <div className={s.pageEdges}/>
   <div className={s.insidePage} id={id} aria-hidden={!open}><div className={s.paperHeading}><KoryxMark/><span>THE PROJECT,<br/>CONSIDERED.</span></div><span className={s.paperGrid}/><div className={s.roundStamp}><Check size={20}/><strong>REVIEWED</strong><small>WITH YOU / FOR YOU</small></div><div className={s.squareStamp}><Globe size={19}/><strong>DOMAIN / CONNECTED</strong><span>READY FOR THE NEXT CHAPTER</span></div><div className={s.smallStamp}><FileText size={17}/><span>HANDOVER<br/>NOTES</span></div><small className={s.paperFoot}>KORYX / ILLUSTRATIVE PROJECT KIT</small></div>
   <div className={s.projectSheet} aria-hidden={!open}><span>YOUR PROJECT / THE ESSENTIALS</span><strong>Idea → Launch</strong><div>{['Project brief','Approved direction','Launch notes','Your next steps'].map((label,i)=><p key={label}><small>0{i+1}</small>{label}<Check size={10}/></p>)}</div><div className={s.sheetBarcode}/><small>MADE AROUND YOUR BUSINESS</small></div>
   <div className={s.cover}><div className={s.coverFront}><span>KORYX<br/>PROJECT<br/>EDITION</span><KoryxMark/><strong>Your next<br/>chapter.</strong><small>DESIGNED / DEVELOPED / CONNECTED</small><i className={s.coverLight}/></div><div className={s.coverBack}><KoryxMark/><span>DETAILS MAKE<br/>THE DIFFERENCE.</span></div></div>
  </div></div>
  <button type="button" className={s.kitButton} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}>{open?'Close project kit':'Open project kit'}<ArrowRight size={13}/></button>
 </MotionSurface>
 </section>}
