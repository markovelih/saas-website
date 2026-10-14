import s from './koryx-prism.module.css'

const mainPath='M27 83V104L98 27H77Z'
const wingPath='M63 84L79 101H99L76 73Z'

export function KoryxPrism(){
 const id='koryx-home-signature'
 return <div className={s.scene} data-koryx-prism role="img" aria-label="Koryx brand mark in coloured light and fine contour lines. A static optical composition.">
  <div className={s.spectrum}/>
  <svg className={s.field} viewBox="0 0 1200 440" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
   <defs>
    <pattern id={id+'-grid'} width="110" height="110" patternUnits="userSpaceOnUse"><path d="M110 0H0V110" stroke="#a1b0bb" strokeOpacity=".18" strokeWidth="1"/></pattern>
    <linearGradient id={id+'-rays'} x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="#000" stopOpacity="0"/><stop offset=".2" stopColor="#000" stopOpacity=".9"/><stop offset="1" stopColor="#000"/></linearGradient>
    <linearGradient id={id+'-contour'} x1="76" y1="27" x2="53" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="var(--prism-contour)" stopOpacity="1"/><stop offset=".5" stopColor="var(--prism-contour)" stopOpacity=".9"/><stop offset="1" stopColor="var(--prism-contour)" stopOpacity=".5"/></linearGradient>
    <linearGradient id={id+'-shine'} x1="28" y1="90" x2="96" y2="31" gradientUnits="userSpaceOnUse"><stop stopColor="var(--prism-reflection)" stopOpacity=".85"/><stop offset=".3" stopColor="var(--prism-reflection)" stopOpacity=".06"/><stop offset=".65" stopColor="var(--prism-reflection)" stopOpacity=".1"/><stop offset="1" stopColor="var(--prism-reflection)" stopOpacity=".95"/></linearGradient>
    <radialGradient id={id+'-ray-fade'} cx="600" cy="237" r="285" gradientUnits="userSpaceOnUse"><stop stopColor="#000"/><stop offset=".28" stopColor="#000"/><stop offset="1" stopColor="#fff"/></radialGradient>
    <mask id={id+'-ray-mask'} maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="440"><rect width="1200" height="440" fill={`url(#${id}-ray-fade)`}/></mask>
    <filter id={id+'-shadow'} x="-50%" y="-50%" width="200%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
   </defs>
   <rect width="1200" height="440" fill={`url(#${id}-grid)`}/>
   <g mask={`url(#${id}-ray-mask)`} stroke={`url(#${id}-rays)`} strokeWidth=".9">
    {Array.from({length:108},(_,i)=>{const t=i/107,y=18+t*440,left=653-190*Math.min(t/.73,1),right=733-140*Math.sin(t*Math.PI);return <g key={i}><path d={`M-20 ${y}L${left.toFixed(2)} ${(91+t*292).toFixed(2)}`}/><path d={`M1220 ${y}L${right.toFixed(2)} ${(91+t*281).toFixed(2)}`}/></g>})}
   </g>
   <g transform="translate(600 237) scale(3.8) translate(-63 -65.5)">
    <g className={s.shadow} transform="translate(0 2)" filter={`url(#${id}-shadow)`}><path d={mainPath+' '+wingPath} fill="#000000"/></g>
    <path className={s.face} d={mainPath+' '+wingPath}/>
    <g stroke={`url(#${id}-contour)`} strokeWidth=".2">
     {Array.from({length:44},(_,i)=><path key={'main'+i} d={mainPath} strokeOpacity={Math.pow(1-i/44,2.5)} transform={`translate(57.25 60.25) scale(${1-i*.0215}) translate(-57.25 -60.25)`}/>)}
     {Array.from({length:32},(_,i)=><path key={'wing'+i} d={wingPath} strokeOpacity={Math.pow(1-i/32,2.5)} transform={`translate(79.25 89.75) scale(${1-i*.029}) translate(-79.25 -89.75)`}/>)}
    </g>
    <path d={mainPath+' '+wingPath} stroke="var(--prism-edge-ink)" strokeOpacity=".9" strokeWidth=".5"/><path d={mainPath+' '+wingPath} stroke={`url(#${id}-shine)`} strokeWidth=".7"/>
   </g>
  </svg>
  <div className={s.vignette}/>
 </div>
}
