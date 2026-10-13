'use client'

import {useState} from 'react'
import {ArrowRight,Check,ShoppingBag} from 'lucide-react'
import {MotionSurface} from './motion-primitives'
import s from './commerce-scan.module.css'

export function CommerceScan(){const [scanned,setScanned]=useState(false);return <MotionSurface className={s.scanSection} interactive pointerRegion="[data-scan-region]" label="Interactive product scanning concept"><div className={s.scanCopy}><span>DETAILS THAT RESPOND</span><h2>Every product.<br/>A clear next step.</h2><p>A good purchase flow makes a choice feel effortless — from the first product detail to a useful confirmation.</p><small>Interactive commerce concept. No purchase is made.</small></div><div className={s.scanStage} data-scanned={scanned}><div className={s.scanLabel}>KORYX / COMMERCE EXPERIENCE</div><div className={s.productCode} data-scan-region><span>Your<br/>next object.</span><div className={s.barcode} aria-hidden="true">{Array.from({length:42},(_,i)=><i key={i} style={{width:`${[1,3,1,2,4,1,2][i%7]}px`}}/>)}</div><div className={s.scanBeam}/><small>EXPERIENCE / 01.24</small></div><button type="button" onClick={()=>setScanned(v=>!v)}>{scanned?<Check size={13}/>:<ShoppingBag size={13}/>} {scanned?'Reset product demo':'Scan sample product'}<ArrowRight size={12}/></button><div className={s.scanResult} role="status"><span>{scanned?'PRODUCT RECOGNISED':'EXPLORE THE DETAILS'}</span><strong>{scanned?'A thoughtful object. Ready to explore.':'Move across the code, or scan the sample.'}</strong></div></div></MotionSurface>}
