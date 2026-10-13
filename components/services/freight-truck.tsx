'use client'

import {memo,useId} from 'react'
import s from './logistics-design.module.css'

export const FreightTruck=memo(function FreightTruck(){
  const id=useId().replaceAll(':','')
  const url=(name:string)=>`url(#${id}-${name})`
  const wheels=[{x:175,y:317,r:31},{x:242,y:317,r:31},{x:586,y:317,r:31},{x:645,y:317,r:31},{x:796,y:327,r:35}]
  return <svg className={s.truck} data-freight-truck viewBox="0 0 960 430" role="img" aria-label="Custom truck model: move the scanner to reveal cargo, chassis and engine">
    <defs>
      <linearGradient id={id+'-trailer'} x1="0" y1="0" x2="0.3" y2="1"><stop stopColor="#e1e1e1"/><stop offset=".38" stopColor="#a5a5a5"/><stop offset=".76" stopColor="#6c6c6c"/><stop offset="1" stopColor="#bebebe"/></linearGradient>
      <linearGradient id={id+'-roof'} x1="0" x2="1" y2=".7"><stop stopColor="#f4f4f4"/><stop offset="1" stopColor="#838383"/></linearGradient>
      <linearGradient id={id+'-cab'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e5e5e5"/><stop offset=".38" stopColor="#9f9f9f"/><stop offset=".7" stopColor="#666666"/><stop offset="1" stopColor="#393939"/></linearGradient>
      <linearGradient id={id+'-front'}><stop stopColor="#8a8a8a"/><stop offset="1" stopColor="#383838"/></linearGradient>
      <linearGradient id={id+'-glass'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#757575"/><stop offset=".45" stopColor="#272727"/><stop offset="1" stopColor="#101010"/></linearGradient>
      <radialGradient id={id+'-tire'}><stop stopColor="#454545"/><stop offset=".65" stopColor="#1b1b1b"/><stop offset=".85" stopColor="#101010"/><stop offset="1" stopColor="#2f2f2f"/></radialGradient>
      <radialGradient id={id+'-rim'}><stop stopColor="#e5e5e5"/><stop offset=".45" stopColor="#939393"/><stop offset=".53" stopColor="#414141"/><stop offset=".78" stopColor="#c9c9c9"/><stop offset="1" stopColor="#5e5e5e"/></radialGradient>
      <linearGradient id={id+'-blue'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#168dff" stopOpacity=".2"/><stop offset="1" stopColor="#083f82" stopOpacity=".4"/></linearGradient>
<linearGradient id={id+'-beam'} gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="880" y2="0"><stop stopColor="#49bfff" stopOpacity="0"/><stop offset=".12" stopColor="#8bdeff"/><stop offset=".88" stopColor="#8bdeff"/><stop offset="1" stopColor="#49bfff" stopOpacity="0"/></linearGradient>
      <filter id={id+'-glow'} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5"/></filter>
      <filter id={id+'-shadow'} x="-10%" y="-250%" width="120%" height="600%"><feGaussianBlur stdDeviation="12"/></filter>
      <clipPath id={id+'-scan'}><rect className={s.scanClip} x="0" y="0" width="960" height="430"/></clipPath>
      <mask id={id+'-skin'} maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="430"><rect width="960" height="430" fill="white"/><rect className={s.skinCut} x="0" y="0" width="960" height="430" fill="black"/></mask>
    </defs>
    <ellipse cx="473" cy="365" rx="371" ry="15" fill="#000" opacity=".8" filter={url('shadow')}/>
    <g className={s.exterior} mask={url('skin')}>
      <path d="M116 287H682L828 302V324H111Z" fill="#1f1f1f" stroke="#474747"/>
      <path d="M112 284H670L722 299H112Z" fill="#797979"/>
      <path d="M625 268L694 268L727 303H625Z" fill="#3d3d3d"/>
      <path d="M89 112L142 79H664L644 113Z" fill={url('roof')} stroke="#c0c0c0" strokeWidth="1.2"/>
      <path d="M89 112H644V282H89Z" fill={url('trailer')} stroke="#d6d6d6" strokeWidth="1.2"/>
      <path d="M644 113L664 79V250L644 282Z" fill="#696969" stroke="#ababab"/>
      <path d="M99 122H631V270H99Z" fill="none" stroke="#e6e6e6" opacity=".28"/>
      {Array.from({length:39},(_,i)=><path key={i} d={`M${105+i*13.4} 121V270`} stroke="#161616" strokeWidth="1" opacity=".18"/>)}
      <path d="M96 277H636" stroke="#f3f3f3" opacity=".65" strokeWidth="3"/>
      <path d="M98 119H635" stroke="#fff" opacity=".42" strokeWidth="2"/>
      <text x="136" y="207" fill="#dedede" fontSize="28" fontFamily="Arial,sans-serif" letterSpacing="2">KORYX</text>
      <text x="136" y="227" fill="#b8b8b8" fontSize="8" fontFamily="monospace" letterSpacing="2">TRANSPORT / CONCEPT 01</text>
      <path d="M525 143H614M525 152H575" stroke="#e7e7e7" opacity=".55"/>
      {[108,281,475,623].map(x=><rect key={x} x={x} y="281" width="12" height="4" rx="1" fill="#a2a2a2"/>)}
      <path d="M697 152L725 123H784L832 153L850 226V301L813 314H688V232Z" fill={url('cab')} stroke="#bababa" strokeWidth="1.2"/>
      <path d="M697 152L725 123H784L832 153H765Z" fill={url('roof')}/>
      <path d="M765 154L832 153L850 226L807 247Z" fill={url('front')} stroke="#797979"/>
      <path d="M704 158H758V215H694Z" fill={url('glass')} stroke="#aaaaaa"/>
      <path d="M770 161L825 160L840 216L805 230L770 212Z" fill={url('glass')} stroke="#aaaaaa"/>
      <path d="M706 161H753V168H703Z" fill="#e3e3e3" opacity=".3"/>
      <path d="M780 163L816 165L825 199" fill="none" stroke="#e7e7e7" opacity=".16" strokeWidth="3"/>
      <path d="M687 223H757V293H686Z" fill="none" stroke="#636363"/>
      <path d="M750 158V286M699 222H747" stroke="#d2d2d2" opacity=".3"/>
      <rect x="733" y="232" width="15" height="4" rx="2" fill="#303030"/>
      <path d="M764 218L807 238L849 221V275L808 293L762 270Z" fill={url('front')} stroke="#a0a0a0" strokeWidth=".8"/>
      <path d="M771 230L800 244V267L771 254Z" fill="#5c5c5c"/>
      <path d="M774 234L797 245M774 239L797 250" stroke="#d6d6d6" strokeWidth=".8" opacity=".28"/>
      <path d="M810 242L843 229V266L810 280Z" fill="#171717" stroke="#7e7e7e" strokeWidth="1.5" strokeLinejoin="round"/>
      {Array.from({length:6},(_,i)=><path key={i} d={`M814 ${246+i*5}L840 ${236+i*5}`} stroke="#949494" strokeWidth="1.35"/>)}
      <path d="M826 239V267" stroke="#545454" strokeWidth="1"/>
      <path d="M822 246L831 242V249L822 253Z" fill="#c1c1c1" stroke="#323232" strokeWidth=".7"/>
      <path d="M765 267L807 287L850 269V291L808 310L763 287Z" fill="#707070" stroke="#bababa" strokeWidth=".8"/>
      <path d="M812 286L831 278V284L812 292Z" fill="#efefef"/>
      <path d="M834 277L846 272V278L834 283Z" fill="#cdcdcd"/>
      <path d="M769 274L786 282V287L769 279Z" fill="#dbdbdb"/>
      <path d="M811 299L839 287" stroke="#202020" strokeWidth="4"/>
      <path d="M818 300L830 295V299L818 304Z" fill="#afafaf"/>
      <path d="M768 286L801 302M811 309L847 294" stroke="#dddddd" strokeWidth="1.2" opacity=".65"/>
      <path d="M685 259H720V285H685Z" fill="#4a4a4a"/><path d="M689 269H715M689 279H715" stroke="#ababab" strokeWidth="3"/>
      <path d="M681 173L673 176V206H681M768 172L784 177V198L776 200" fill="#3a3a3a" stroke="#a0a0a0" strokeWidth="2"/>
      <path d="M695 145L706 129H764L779 146Z" fill="#c2c2c2" stroke="#898989"/>
      <path d="M809 241L793 249M833 209L820 200" stroke="#c0c0c0" strokeWidth="1.3"/>
      <path d="M114 299H282V309H114M553 299H676V310H553" fill="#575757" stroke="#999999"/>
      <rect x="348" y="295" width="95" height="24" rx="4" fill="#515151" stroke="#9d9d9d"/>
      <path d="M365 296V318M426 296V318" stroke="#c4c4c4" opacity=".6" strokeWidth="4"/>
      <path d="M310 291V328H318V294M478 291V328H486V294" stroke="#3d3d3d" strokeWidth="6"/>
      {wheels.map(({x,y,r})=><g key={x}><ellipse cx={x+6} cy={y-2} rx={r+3} ry={r} fill="#0c0c0c"/><ellipse cx={x} cy={y} rx={r} ry={r+3} fill={url('tire')} stroke="#545454" strokeWidth="1.3"/><ellipse cx={x} cy={y} rx={r*.6} ry={r*.65} fill={url('rim')}/><ellipse cx={x} cy={y} rx={r*.23} ry={r*.25} fill="#626262" stroke="#cfcfcf"/>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <circle key={i} cx={x+Math.cos(a)*r*.38} cy={y+Math.sin(a)*r*.4} r="2.1" fill="#242424"/>})}<path d={`M${x-r*.7} ${y-r*.6}Q${x} ${y-r*1.04} ${x+r*.65} ${y-r*.5}`} fill="none" stroke="#949494" opacity=".4"/></g>)}
      <path d="M756 310Q795 278 833 305" fill="none" stroke="#949494" strokeWidth="7"/>
    </g>
    <g className={s.xrayLayer} clipPath={url('scan')}>
      <g className={s.blueStructure} fill={url('blue')} stroke="#4abfff" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M89 112L142 79H664V250L644 282H89ZM89 112H644V282M644 113L664 79"/>
        {Array.from({length:14},(_,i)=><path key={i} d={`M${110+i*39} 111V281M${110+i*39} 111L${149+i*37} 80`} opacity=".5"/>)}
        <path d="M89 158H644M89 218H644M100 285H678L823 306V324H109Z" fill="none"/>
        <path d="M697 152L725 123H784L832 153L850 226V301L813 314H688V232Z"/>
        <path d="M704 158H758V215H694ZM770 161L825 160L840 216L805 230L770 212Z" fill="#082440" fillOpacity=".55"/>
        <path d="M765 154V280M765 154L832 153M697 223H757V293H686M807 247V301" fill="none"/>
        <path d="M681 269H838M675 296H822M281 301H548M283 313H549" fill="none" strokeWidth="3"/>
        {wheels.map(({x,y,r})=><g key={x}><ellipse cx={x} cy={y} rx={r} ry={r+3} fill="#072340" fillOpacity=".6"/><ellipse cx={x} cy={y} rx={r*.62} ry={r*.66} fill="none"/><ellipse cx={x} cy={y} rx={r*.22} ry={r*.24} fill="#168dff" fillOpacity=".5"/><path d={`M${x-r} ${y}H${x+r}M${x} ${y-r}V${y+r}`} opacity=".5"/></g>)}
        <path d="M154 295L171 277H248L269 295M562 295L579 277H650L672 295" fill="none"/>
        <path d="M168 315H251M583 315H655M775 326H819" strokeWidth="4"/>
        {[175,242,586,645,796].map(x=><path key={x} d={`M${x-10} 290l4-5 4 10 4-10 4 10 4-5`} fill="none"/>)}
        <path d="M326 292H455V319H326Z" fill="#0a3f72" fillOpacity=".5"/>
        <path d="M337 296V315M349 296V315M432 296V315M444 296V315" strokeWidth="2"/>
        <g className={s.cargo}>
          {Array.from({length:7},(_,i)=>{const x=118+i*70;return <g key={i}><path d={`M${x} 198l13-10h47v54l-13 10h-47ZM${x} 198h47v54M${x+47} 198l13-10`} fill="#0a63af" fillOpacity=".28"/><path d={`M${x} 258h60M${x+5} 259v7M${x+30} 259v7M${x+55} 259v7M${x+20} 202v42M${x+27} 202v42`} stroke="#88d8ff" opacity=".65"/>{i%2===0&&<path d={`M${x+4} 151l13-10h42v42l-13 10h-42ZM${x+4} 151h42v42M${x+46} 151l13-10`} fill="#126eba" fillOpacity=".25"/>}<path d={`M${x+10} 217h12m-6-6v12`} stroke="#b5e7ff" opacity=".7"/></g>})}
        </g>
        <g className={s.engine}>
          <path d="M741 247L757 236L800 247V288L782 300L741 281Z" fill="#126fb6" fillOpacity=".6" strokeWidth="1.4"/>
          <path d="M741 247L782 261L800 247M782 261V300" fill="none"/>
          {[0,1,2,3,4,5].map(i=><path key={i} d={`M${748+i*6} ${244+i*2}l-4 16 8 3 4-16Z`} fill="#2b9cdb" fillOpacity=".45"/>)}
          <path d="M799 272H828V289H808M737 268H726V286H753M762 288V306H692" fill="none" stroke="#a4e0ff" strokeWidth="2"/>
          <ellipse cx="802" cy="280" rx="10" ry="13" fill="none"/><path d="M802 268V292M792 280H812" opacity=".8"/>
          <path d="M707 182V205H724V183M705 205H728V213H702M730 193l13-3 5 13-13 5ZM719 216V238" fill="none" strokeWidth="2"/>
        </g>
        <path d="M114 271H623" stroke="#a9e6ff" strokeWidth="2"/>
        <path d="M722 310H357M626 295H464" stroke="#298cff" strokeWidth="2" strokeDasharray="5 6"/>
      </g>

    </g>
    <g className={s.scanPlane}><path className={s.scanHalo} d="M60 0H890" stroke={url('beam')} strokeWidth="4" filter={url('glow')}/><path className={s.scanEdge} d="M60 0H890" stroke={url('beam')} strokeWidth="1"/><rect data-scan-handle className={s.scanHandle} x="60" y="-60" width="830" height="120" fill="transparent"/><path d="M458 0h44" stroke="#c7efff" strokeWidth="2" strokeLinecap="round" pointerEvents="none"/></g>
  </svg>
})
