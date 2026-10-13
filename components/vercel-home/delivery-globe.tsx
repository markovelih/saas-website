'use client'

import {useEffect, useId, useRef} from 'react'
import type {CSSProperties} from 'react'
import s from './delivery-globe.module.css'

const centre = 240
const bottom = 238
const height = 210
const radii = [-204, -158, -110, -56, 0, 56, 110, 158, 204]
const levels = [78, 128, 178, 228]
type Point = readonly [number, number]

// All routes use the very same ellipse geometry as the wireframe.
function point([meridian, level]: Point) {
  const y = levels[level]
  const x = centre + radii[meridian] * Math.sqrt(1 - ((bottom - y) / height) ** 2)
  return [Number(x.toFixed(3)), y] as const
}
function route(points: readonly Point[]) {
  return points.map((p, index) => {
    const [x, y] = point(p)
    if (!index) return `M${x} ${y}`
    const previous = points[index - 1]
    if (p[1] === previous[1]) return `H${x}`
    const radius = radii[p[0]]
    if (!radius) return `V${y}`
    const sweep = (radius > 0) === (p[1] > previous[1]) ? 1 : 0
    return `A${Math.abs(radius)} ${height} 0 0 ${sweep} ${x} ${y}`
  }).join(' ')
}

const nodes: Point[] = [[4, 0], [1, 1], [3, 1], [7, 1], [5, 2], [3, 3], [7, 3]]
const journeys: {points: Point[]; duration: number; delay: number}[] = [
  {points: [[0, 3], [0, 2], [1, 2], [1, 1], [3, 1]], duration: 5.8, delay: -1.6},
  {points: [[1, 1], [2, 1], [2, 0], [4, 0]], duration: 6.4, delay: -3.5},
  {points: [[4, 0], [5, 0], [5, 1], [7, 1]], duration: 6.1, delay: -.2},
  {points: [[3, 1], [3, 2], [3, 3]], duration: 5.3, delay: -2.7},
  {points: [[5, 2], [7, 2], [7, 3]], duration: 5.7, delay: -4.1},
  {points: [[8, 3], [8, 2], [6, 2], [5, 2]], duration: 6.7, delay: -1.1},
  {points: [[7, 1], [6, 1], [6, 2], [5, 2]], duration: 6.3, delay: -4.7},
]

export function DeliveryGlobe() {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, '')
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let visible = false
    const update = () => {element.dataset.running = String(visible && !document.hidden)}
    const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; update()}, {threshold: .05})
    observer.observe(element)
    document.addEventListener('visibilitychange', update)
    return () => {observer.disconnect(); document.removeEventListener('visibilitychange', update)}
  }, [])

  return <div ref={ref} className={s.scene} data-running="false">
    <svg viewBox="0 0 480 270" role="img" aria-label="Koryx global delivery network: light signals travel along a curved globe between Koryx logos" className={s.globe}>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white"/><stop offset=".75" stopColor="white"/><stop offset="1" stopColor="black"/></linearGradient>
        <mask id={`${id}-mask`}><rect width="480" height="250" fill={`url(#${id}-fade)`}/></mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g className={s.grid}>
          {[56, 110, 158, 204].map(radius => <path key={radius} d={`M${centre - radius} ${bottom} A${radius} ${height} 0 0 1 ${centre + radius} ${bottom}`}/>)}
          <path d={`M${centre} ${bottom - height}V${bottom}`}/>
          {levels.slice(0, 3).map(y => {
            const extent = 204 * Math.sqrt(1 - ((bottom - y) / height) ** 2)
            return <path key={y} d={`M${centre - extent} ${y}H${centre + extent}`}/>
          })}
        </g>
        <g fill="none" className={s.signals}>
          {journeys.map(({points, duration, delay}, index) => <g key={index} style={{'--duration': `${duration}s`, '--delay': `${delay}s`} as CSSProperties}>
            <path d={route(points)} pathLength="1" className={s.halo}/>
            <path d={route(points)} pathLength="1" className={s.trail}/>
            <path d={route(points)} pathLength="1" className={s.head}/>
          </g>)}
        </g>
      </g>
      {nodes.map((position, index) => {
        const [x, y] = point(position)
        return <g key={index} transform={`translate(${x} ${y})`} className={s.node}>
          <circle r="13" className={s.ripple} style={{animationDelay: `${-index * .83}s`}}/>
          <g className={s.face}><circle r="9.5" className={s.disc}/>
          <path className={s.mark} transform="translate(-7 -7) scale(.11)" d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z"/></g>
        </g>
      })}
    </svg>
  </div>
}
