'use client'

import {useState} from 'react'
import {Bot,User,ShieldCheck,Lock,Check,ArrowRight,Globe,SlidersHorizontal} from 'lucide-react'
import {MotionSurface,SignalPath,KoryxMark} from './motion-primitives'
import {DeliveryGlobe} from '@/components/vercel-home/delivery-globe'
import s from './security-scenes.module.css'

function TrafficScene(){const [burst,setBurst]=useState(true);return <MotionSurface className={s.traffic} label="Illustration of unwanted traffic stopping at a protection boundary">
 <div className={s.sceneToolbar}><span>REQUEST / INSPECTION</span><button aria-pressed={burst} onClick={()=>setBurst(v=>!v)}>{burst?'Mixed traffic':'Verified traffic'}</button></div>
 <div className={s.trafficBoard} data-burst={burst}><svg viewBox="0 0 600 290" aria-hidden="true">{[80,168,256,344,432,520].map((x,i)=>{const allowed=!burst||i===3;return <g key={`${burst}-${x}`}><SignalPath d={`M${x} 62V169`} tone={allowed?'green':'red'} delay={-i*.8} duration={5.5}/>{allowed&&<SignalPath d={`M${x} 176V232`} tone="green" delay={-i*.8-2.6} duration={5.5}/>}<circle cx={x} cy="173" r="3" className={allowed?s.allowedDot:s.blockedDot}/></g>})}</svg>
 <div className={s.requestIcons}>{[0,1,2,3,4,5].map(i=><span key={i} style={{left:`${[80,168,256,344,432,520][i]/6}%`}}>{!burst||i===3?<User size={17}/>:<Bot size={17}/>}</span>)}</div>
 <div className={s.protectionBoundary}><div><Globe size={18}/><span>Network<br/>rules</span></div><div><ShieldCheck size={18}/><span>Request<br/>limits</span></div><div><Lock size={18}/><span>Account<br/>access</span></div></div>
 </div><p className={s.legend}><i/> Verified request <i/> Unwanted traffic stops at the boundary</p>
 </MotionSurface>}

function RulesScene(){const [verified,setVerified]=useState(true);return <MotionSurface className={s.rules} label="Illustrative application request filter">
 <div className={s.sceneToolbar}><span>POLICY / EVALUATION</span><button aria-pressed={verified} onClick={()=>setVerified(v=>!v)}>{verified?'Verified client':'Unknown identity'}</button></div>
 <div className={s.rulesBoard} data-verified={verified}><svg viewBox="0 0 600 310" aria-hidden="true"><SignalPath d="M160 103H224Q257 103 257 147V155H317" tone={verified?'blue':'red'} duration={6}/><SignalPath d="M156 208H225Q258 208 258 174V155H317" tone="red" delay={-3} duration={6}/>{verified&&<SignalPath d="M325 155H425" tone="blue" delay={-2.8} duration={6}/>}</svg>
 <div className={s.ruleTokens}><span><User size={12}/> client.session</span><span className={s.rejected}>unknown.identity</span><span><SlidersHorizontal size={12}/> project.owner</span></div>
 <div className={s.ruleWall}><i/><span>{verified?'POLICY PASSED':'ACCESS LIMITED'}</span></div>
 <div className={s.ruleApp}><div><i/><i/><i/></div><KoryxMark/><small>YOUR PRODUCT</small></div>
 </div><p className={s.legend}>{verified?<><Check size={12}/> Ownership checked. The intended request can continue.</>:<><Lock size={12}/> The request stops here. Private records stay private.</>}</p>
 </MotionSurface>}

function CheckpointScene(){const [verified,setVerified]=useState(false);return <MotionSurface className={s.checkpoint} label="Interactive illustration of an identity checkpoint">
 <div className={s.sceneToolbar}><span>IDENTITY / CHECKPOINT</span><button onClick={()=>setVerified(v=>!v)}>{verified?'Reset demo':'Verify demo identity'}<ArrowRight size={11}/></button></div>
 <div className={s.checkpointBoard} data-verified={verified}><svg viewBox="0 0 600 300" aria-hidden="true">{[84,132,180,228].map((y,i)=><g key={`${verified}-${y}`}><SignalPath d={`M30 ${y}H190`} tone={i%2?'red':'blue'} delay={-i*1.1}/>{verified&&i%2===0&&<SignalPath d={`M416 ${y}H570`} tone="blue" delay={-i*1.1-2.6}/>}</g>)}</svg>
 <div className={s.identityCard}><header><span className={s.checkpointLight}/><strong>Koryx / Identity check</strong><span>···</span></header><div><span className={s.identityIcon}>{verified?<Check size={23}/>:<Lock size={23}/>}</span><p>{verified?'Identity verified. Continue to your own workspace.':'Confirm the identity and permission before sharing private records.'}</p></div><small>{verified?'VERIFIED / INTENDED ACCESS':'ILLUSTRATIVE / AWAITING VERIFICATION'}</small></div>
 </div><p className={s.legend}>A demonstration of access checks, not an actual sign-in or security test.</p>
 </MotionSurface>}

export function SecurityMotionGrid(){return <section className={s.securityGrid} id="protection-layers" aria-label="Protection layers in motion">
 <article><div className={s.copy}><h3>Traffic with a boundary.</h3><p>Provider network rules and application limits have different jobs. The agreed setup filters unwanted requests before sensitive actions.</p></div><TrafficScene/></article>
 <article><div className={s.copy}><h3>Your product. Your rules.</h3><p>Identity and project ownership determine which records a request can reach. Try a verified client and an unknown identity.</p></div><RulesScene/></article>
 <article><div className={s.copy}><h3>Protection, where it belongs.</h3><p>Domain, HTTPS and available provider controls support the launch. We select the configuration for your product and hosting plan.</p></div><MotionSurface className={s.network}><span className={s.networkLabel}>DOMAIN / HTTPS / PROVIDER CONTROLS</span><DeliveryGlobe showMarks={false} multicolor/><p className={s.legend}>Illustrative network routes · configuration depends on your provider.</p></MotionSurface></article>
 <article><div className={s.copy}><h3>Private stays private.</h3><p>A clear identity checkpoint before access to private work. Actual permissions and ownership checks run on the server.</p></div><CheckpointScene/></article>
 </section>}
