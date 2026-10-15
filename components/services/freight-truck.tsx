'use client'

import {memo,useId,type Ref} from 'react'
import {TRUCK_VIEW} from '@/lib/interaction/truck-scanner'
import s from './logistics-design.module.css'

// A single side plane and one consistent depth vector (+26, -12).
// Every near-side wheel shares the same centerline, diameter and circular projection.
const wheels=[190,268,790,868,1045]
const trailerSide='M78 112H838V343H78Z'
const trailerRoof='M78 112L104 100H864L838 112Z'
const trailerEnd='M838 112L864 100V331L838 343Z'
const cabSide='M916 356V233Q918 208 930 179L943 157Q950 147 963 147H1026Q1041 147 1050 162L1081 208V349L1090 356V374H1084A39 39 0 0 0 1006 374H916Z'
const cabFront='M1081 208L1107 196L1131 254V354L1107 374H1084A39 39 0 0 0 1081 349Z'
const cabRoof='M943 157L969 145H1052L1076 150L1107 196L1081 208L1050 162Q1041 147 1026 147H963Q950 147 943 157Z'
const sideGlass='M936 190H1009L1040 239H925L929 211Z'
const frontGlass='M1053 187L1079 175L1116 248L1082 259Z'
const urlFor=(id:string,name:string)=>`url(#${id}-${name})`

export const FreightTruck=memo(function FreightTruck({svgRef}:{svgRef?:Ref<SVGSVGElement>}){
 const id=useId().replaceAll(':',''),url=(name:string)=>urlFor(id,name)
 return <svg ref={svgRef} className={s.truck} data-freight-truck viewBox="0 0 1200 480" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Silver Koryx semi-truck with accurately aligned wheels and a blue engineering cutaway below the scan line">
  <defs>
   <linearGradient id={id+'-aluminium'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d9dcde"/><stop offset=".16" stopColor="#bdc0c3"/><stop offset=".5" stopColor="#a2a5a8"/><stop offset=".84" stopColor="#c3c6c8"/><stop offset="1" stopColor="#878b8e"/></linearGradient>
   <linearGradient id={id+'-roof'} x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#f2f3f3"/><stop offset="1" stopColor="#a2a5a8"/></linearGradient>
   <linearGradient id={id+'-end'}><stop stopColor="#74797d"/><stop offset="1" stopColor="#474c50"/></linearGradient>
   <linearGradient id={id+'-cab'} x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#e2e4e5"/><stop offset=".48" stopColor="#b1b5b8"/><stop offset="1" stopColor="#72787c"/></linearGradient>
   <linearGradient id={id+'-front'}><stop stopColor="#81878b"/><stop offset=".6" stopColor="#a4aaad"/><stop offset="1" stopColor="#5b6267"/></linearGradient>
   <linearGradient id={id+'-glass'} x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#455057"/><stop offset=".35" stopColor="#242d33"/><stop offset="1" stopColor="#101619"/></linearGradient>
   <linearGradient id={id+'-window-shine'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e8eef0" stopOpacity=".19"/><stop offset=".7" stopColor="#e8eef0" stopOpacity="0"/></linearGradient>
   <linearGradient id={id+'-tank'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3c4246"/><stop offset=".22" stopColor="#a4a9ad"/><stop offset=".52" stopColor="#737a7f"/><stop offset="1" stopColor="#30363a"/></linearGradient>
   <radialGradient id={id+'-tire'}><stop stopColor="#414449"/><stop offset=".57" stopColor="#17191b"/><stop offset=".79" stopColor="#101213"/><stop offset=".93" stopColor="#2b2e30"/><stop offset="1" stopColor="#101213"/></radialGradient>
   <linearGradient id={id+'-rim'} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#dce0e2"/><stop offset=".32" stopColor="#90989d"/><stop offset=".6" stopColor="#c8ced1"/><stop offset="1" stopColor="#525c62"/></linearGradient>
   <linearGradient id={id+'-xray'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#082d4c" stopOpacity=".2"/><stop offset="1" stopColor="#075394" stopOpacity=".27"/></linearGradient>
   <radialGradient id={id+'-blue-rim'}><stop stopColor="#72d2ff" stopOpacity=".35"/><stop offset="1" stopColor="#082b4c" stopOpacity=".2"/></radialGradient>
   <filter id={id+'-shadow'} x="-10%" y="-150%" width="120%" height="400%"><feGaussianBlur stdDeviation="8"/></filter>
   <pattern id={id+'-grille-mesh'} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V4" stroke="#677278" strokeWidth=".45" opacity=".5"/></pattern>
   <clipPath id={id+'-skin'} clipPathUnits="userSpaceOnUse"><rect data-exterior-clip width="1200" height={TRUCK_VIEW.initial}/></clipPath>
   <clipPath id={id+'-scan'} clipPathUnits="userSpaceOnUse"><rect data-interior-clip y={TRUCK_VIEW.initial} width="1200" height={480-TRUCK_VIEW.initial}/></clipPath>
   <path id={id+'-side'} d={trailerSide}/><path id={id+'-cab-side'} d={cabSide}/><path id={id+'-cab-front'} d={cabFront}/>
  </defs>
  <ellipse cx="608" cy="425" rx="524" ry="9" fill="#020305" opacity=".8" filter={url('shadow')}/>
  <g clipPath={url('skin')}>
   {/* Chassis is behind the body and the wheels, all on the same ground plane. */}
   <path d="M100 344H910L1110 352V379H101Z" fill="#252a2d" stroke="#454c51"/>
   <path d="M102 347H898V354H102Z" fill="#747b7f"/>
   <path d="M745 348H925V358H745Z" fill="#949a9e"/>
   <path d="M740 337H840L850 346H740Z" fill="#3c4449"/>
   <rect x="370" y="359" width="123" height="31" rx="6" fill={url('tank')} stroke="#8e969b" strokeWidth="1.1"/>
   <path d="M389 360V388M474 360V388" stroke="#c4c9cc" strokeWidth="4"/>
   <path d="M328 348V396H335V351M564 348V396H571V351" fill="none" stroke="#4c5358" strokeWidth="5"/>
   <rect x="113" y="355" width="13" height="35" fill="#363c40"/><rect x="306" y="355" width="9" height="37" fill="#363c40"/>
   <path d="M148 380V372A42 42 0 0 1 232 372M226 380V372A42 42 0 0 1 310 372M748 380V372A42 42 0 0 1 832 372M826 380V372A42 42 0 0 1 910 372" fill="none" stroke="#40484e" strokeWidth="7"/>
   {/* Trailer: parallel side rails, one depth vector and fine, neutral metal corrugation. */}
   <path d={trailerRoof} fill={url('roof')} stroke="#bfc5c8"/>
   <use href={'#'+id+'-side'} fill={url('aluminium')} stroke="#d2d6d8"/>
   <path d={trailerEnd} fill={url('end')} stroke="#969fa4"/>
   <path d="M87 120H829V333H87Z" fill="none" stroke="#fff" opacity=".22"/>
   {Array.from({length:55},(_,i)=>{const x=96+i*13.3;return <g key={i}><path d={`M${x} 123V329`} stroke="#fff" opacity=".12"/><path d={`M${x+2} 123V329`} stroke="#2c3338" opacity=".16"/></g>})}
   <path d="M80 114H836M82 340H836" stroke="#e7eaec" strokeWidth="3"/>
   <path d="M81 335H837" stroke="#5c646a" strokeWidth="2"/>
   <path d="M843 126L857 119V325L843 332Z" fill="none" stroke="#c6cdd1" opacity=".35"/>
   {[116,328,540,748,820].map(x=><rect key={x} x={x} y="335" width="11" height="3" rx="1" fill="#d1d5d7"/>)}
   <path d="M136 202L159 179H169L136 212ZM147 203L158 214H168L152 198Z" fill="#edf0f1"/>
   <text x="187" y="210" fill="#edf0f1" fontSize="28" fontWeight="500" fontFamily="Arial,sans-serif" letterSpacing="5">KORYX</text>
   <text x="138" y="230" fill="#6e787e" fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="2.6">FREIGHT / PRECISION IN MOTION</text>
   <path d="M716 151H792M716 159H765" stroke="#e9edef" opacity=".45" strokeWidth="1.2"/>
   {/* Tractor cab: side, roof and front are independent, consistently aligned faces. */}
   <path d={cabRoof} fill={url('roof')} stroke="#c5cbcf" strokeWidth="1"/>
   <use href={'#'+id+'-cab-side'} fill={url('cab')} stroke="#b8c0c5" strokeWidth="1.2" strokeLinejoin="round"/>
   <use href={'#'+id+'-cab-front'} fill={url('front')} stroke="#909ba1" strokeWidth="1" strokeLinejoin="round"/>
   <path d="M954 153H1027L1044 169H942Z" fill="#d0d5d8" stroke="#a1aaaf" strokeWidth=".8"/>
   <path d={sideGlass} fill={url('glass')} stroke="#545f66" strokeWidth="2.5" strokeLinejoin="round"/>
   <path d="M941 193H1006L1033 234H930Z" fill={url('window-shine')}/>
   <path d="M984 190V238" stroke="#7c878f" strokeWidth="3.5"/>
   <path d="M935 244H1044L1058 269V328H935Z" fill="none" stroke="#667279" strokeWidth="1"/>
   <path d="M935 246V326M943 250H1040" stroke="#e4e9ec" opacity=".24"/>
   <rect x="1004" y="260" width="23" height="5" rx="2.5" fill="#404b53"/><path d="M1008 259H1025" stroke="#cbd3d7" opacity=".5"/>
   <path d={frontGlass} fill={url('glass')} stroke="#66737b" strokeWidth="2" strokeLinejoin="round"/>
   <path d="M1059 191L1078 183L1107 240L1087 246Z" fill={url('window-shine')}/>
   <path d="M1086 246L1103 229M1098 242L1110 227" stroke="#0b1115" strokeWidth="2"/>
   <path d="M1079 265L1125 248" stroke="#c4cdd2" opacity=".65"/>
   {/* The grille slats follow the exact same front-plane slope; no crossed polygons. */}
   <path d="M1085 280L1125 266V321L1085 335Z" fill="#11181d" stroke="#5b6871" strokeWidth="1.5"/>
   <path d="M1088 282L1122 270V319L1088 331Z" fill={url('grille-mesh')}/>
   {Array.from({length:7},(_,i)=><path key={i} d={`M1088 ${285+i*6.4}L1122 ${273+i*6.4}`} stroke="#77838b" strokeWidth="1.3"/>)}
   <path d="M1101 278V325" stroke="#222e36" strokeWidth="2"/>
   <path d="M1094 297L1106 293V299L1094 303Z" fill="#c2cbd0"/>
   <path d="M1086 340L1129 325V346L1107 365H1089Z" fill="#626e76" stroke="#a4b0b7"/>
   <path d="M1087 343L1105 337V342L1087 348ZM1110 335L1125 330V335L1110 340Z" fill="#edf3f6"/>
   <path d="M1095 356L1117 346" stroke="#1f2a32" strokeWidth="4"/>
   <path d="M1098 356L1110 351V355L1098 360Z" fill="#a5b0b8"/>
   <path d="M921 339H984V367H921Z" fill="#58656d" stroke="#9ba7ae"/>
   <path d="M927 346H980M927 356H980" stroke="#d4dce0" strokeWidth="2.5"/>
   <path d="M925 360H979" stroke="#26333b" strokeWidth="1"/>
   <path d="M1044 210L1058 207V229L1047 232" fill="none" stroke="#303e47" strokeWidth="3"/>
   <rect x="1049" y="205" width="14" height="30" rx="3" fill="#28343c" stroke="#98a6af"/>
   <path d="M1120 219L1136 214V239L1129 242" fill="none" stroke="#6e7d86" strokeWidth="2"/>
   <path d="M1011 373A34 34 0 0 1 1079 373" fill="none" stroke="#5b6871" strokeWidth="8"/>
   <path d="M1012 367A34 34 0 0 1 1078 367" fill="none" stroke="#a8b4bc" strokeWidth="2"/>
   {wheels.map(x=><g key={x}>
    <circle cx={x+4} cy="382" r="35" fill="#090c0e"/>
    <circle cx={x} cy="384" r="34" fill={url('tire')} stroke="#3c464e" strokeWidth="1.3"/>
    <circle cx={x} cy="384" r="30" fill="none" stroke="#565e64" strokeWidth=".65" opacity=".6"/>
    <circle cx={x} cy="384" r="21.8" fill={url('rim')} stroke="#b3bec5" strokeWidth=".8"/>
    <circle cx={x} cy="384" r="17.6" fill="#4b5861" stroke="#84939e" strokeWidth="1"/>
    <circle cx={x} cy="384" r="13.8" fill={url('rim')}/>
    {Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <g key={i}><circle cx={x+Math.cos(a)*17} cy={384+Math.sin(a)*17} r="2.7" fill="#19242c"/><circle cx={x+Math.cos(a)*9.1} cy={384+Math.sin(a)*9.1} r="1.25" fill="#dce5eb"/></g>})}
    <circle cx={x} cy="384" r="6.5" fill="#616f79" stroke="#c7d1d8" strokeWidth=".9"/>
    <path d={`M${x-24} 363Q${x} 348 ${x+23} 363`} fill="none" stroke="#b2bcc3" opacity=".22" strokeWidth="1.2"/>
   </g>)}
  </g>
  <g clipPath={url('scan')} className={s.xrayLayer} fill={url('xray')} stroke="#45b6f7" strokeWidth="1.2" strokeLinejoin="round">
   <path d={trailerRoof}/><use href={'#'+id+'-side'}/><path d={trailerEnd}/>
   <path d="M86 123H830V332H86Z" fill="none" strokeOpacity=".4"/>
   {Array.from({length:19},(_,i)=>{const x=102+i*39;return <path key={i} d={`M${x} 112V341M${x} 112L${x+26} 100`} fill="none" strokeOpacity=".32"/>})}
   <path d="M80 177H837M80 283H837M80 333H837" fill="none" strokeOpacity=".45"/>
   {/* Two cargo rows, visible tie-downs and a continuous trailer floor. */}
   {Array.from({length:9},(_,i)=>{const x=105+i*79;return <g key={i} stroke="#67caff" strokeWidth=".95">
    <path d={`M${x} 254l12-7h53v68l-12 7h-53ZM${x} 254h53v68M${x+53} 254l12-7`} fill="#0963aa" fillOpacity=".3"/>
    <path d={`M${x+18} 255V321M${x+35} 255V321M${x} 325h65M${x+6} 326v6M${x+32} 326v6M${x+58} 326v6`} fill="none" strokeOpacity=".7"/>
    {i%3!==2&&<path d={`M${x+3} 194l10-6h50v48l-10 6h-50ZM${x+3} 194h50v48M${x+53} 194l10-6`} fill="#0c70b7" fillOpacity=".25"/>}
    <path d={`M${x+10} 224h7m-3.5-3.5v7M${x+25} 283h8m-4-4v8`} fill="none" stroke="#b1e6ff"/>
   </g>})}
   <path d="M93 343H914L1107 352V378H100ZM101 359H910M322 350V396H334M564 350V396H573" fill="none" strokeWidth="1.5"/>
   <path d="M370 359H493V390H370ZM389 359V390M474 359V390" fill="#094574" fillOpacity=".45"/>
   <use href={'#'+id+'-cab-side'}/><use href={'#'+id+'-cab-front'}/><path d={cabRoof}/>
   <path d={sideGlass} fill="#061a2b" fillOpacity=".5"/><path d={frontGlass} fill="#061a2b" fillOpacity=".5"/>
   <path d="M984 190V239M935 245H1044L1058 269V328H935ZM1081 261L1127 245M1085 280L1125 266V321L1085 335Z" fill="none" strokeOpacity=".6"/>
   {/* Engine block, cooling pack, hoses, seats, suspension and driveline. */}
   <g stroke="#7dd3ff" strokeWidth="1.1">
    <path d="M1004 286L1017 279L1060 288V329L1047 336L1004 326ZM1004 286L1047 297L1060 288M1047 297V336" fill="#0a6bab" fillOpacity=".6"/>
    {[0,1,2,3,4,5].map(i=><path key={i} d={`M${1011+i*6} ${284+i*1.5}l-3 14 5 2 3-14Z`} fill="#269bda" fillOpacity=".5"/>)}
    <path d="M1082 286L1102 279V328L1082 335Z" fill="#105484" fillOpacity=".5"/>
    {Array.from({length:6},(_,i)=><path key={i} d={`M1086 ${289+i*7}L1098 ${285+i*7}`} strokeOpacity=".7"/>)}
    <circle cx="1073" cy="314" r="12" fill="none"/><path d="M1073 302V326M1061 314H1085M1003 307H984V332H1024M1028 333V355H892" fill="none" strokeWidth="1.8"/>
    <path d="M941 211V240H962V216M939 241H967V249H937M973 215L986 211L993 234L980 239ZM950 251V272" fill="none" strokeWidth="1.8"/>
    <path d="M761 365H890M889 367H1009" fill="none" strokeWidth="3"/>
    {wheels.map(x=><g key={x}><path d={`M${x-21} 353l5-7 6 14 6-14 6 14 5-7M${x-30} 378H${x+30}`} fill="none"/><circle cx={x} cy="384" r="34" fill={url('blue-rim')}/><circle cx={x} cy="384" r="22" fill="none"/><circle cx={x} cy="384" r="9" fill="#1586c6" fillOpacity=".3"/>{[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return <path key={i} d={`M${x+Math.cos(a)*10} ${384+Math.sin(a)*10}L${x+Math.cos(a)*21} ${384+Math.sin(a)*21}`} strokeOpacity=".65"/>})}</g>)}
   </g>
   <path d="M310 371H736M734 361H1000" fill="none" stroke="#189be9" strokeWidth="1.3" strokeDasharray="5 7"/>
  </g>
 </svg>
})
