import type {SVGProps} from 'react'
/** The same two paths as public/icon.svg, with currentColor for light/dark surfaces. */
export function KoryxMark({size=20,...props}:SVGProps<SVGSVGElement>&{size?:number}){
 return <svg width={size} height={size} viewBox="20 20 88 90" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></svg>
}
