'use client'

import {useEffect, useRef, useState} from 'react'
import s from './process-experience.module.css'

type V3 = [number, number, number]
const TAU = Math.PI * 2
const mix = (a: number, b: number, t: number) => a + (b - a) * t

// The same strands survive every stage. Only their arrangement changes.
// Nothing here is an image, a mock browser, or a pre-rendered animation.
function shape(stage: number, u: number, v: number, time: number): V3 {
  const a = u * TAU, b = v * TAU
  if (stage === 0) {
    const r = 1.13 + .22 * Math.sin(b * 3 + a * 2 + time * .17)
    return [Math.cos(a) * r, Math.sin(a) * r * .65 + Math.cos(b) * .24, Math.sin(b + a * 2) * .38]
  }
  if (stage === 1) {
    const r = .86 + .37 * Math.cos(b)
    return [r * Math.cos(a), r * Math.sin(a), .42 * Math.sin(b) + .46 * Math.sin(a * 2)]
  }
  if (stage === 2) {
    // A continuous, interlaced spatial lattice.
    const r = .8 + .32 * Math.cos(b + a * 3)
    return [Math.cos(a) * r, Math.sin(a) * r, Math.sin(b + a * 3) * .35 + Math.cos(a * 2) * .38]
  }
  const r = .99 + .1 * Math.sin(a * 6 + b * 2 + time * .35)
  const latitude = (v - .5) * Math.PI
  return [r * Math.cos(latitude) * Math.cos(a), r * Math.sin(latitude), r * Math.cos(latitude) * Math.sin(a)]
}

export function ProcessField({active = 0, hero = false}: {active?: number; hero?: boolean}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef(active)
  const wake = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {target.current = active; wake.current?.()}, [active])
  useEffect(() => {
    const node = canvas.current, parent = node?.parentElement
    if (!node || !parent) return
    const context = node.getContext('2d')
    if (!context) return
    const ctx = context, element = node, host = parent
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let width = 1, height = 1, ratio = 1, frame = 0, visible = false, last = 0, time = 0
    let ink = '#eee', line = '#333', tx = 0, ty = 0, px = 0, py = 0, moving = false
    let box = host.getBoundingClientRect(), dirty = true
    const weights = [0, 0, 0, 0]; weights[target.current] = 1

    function schedule() {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    wake.current = schedule
    function theme() {
      const style = getComputedStyle(host)
      ink = style.getPropertyValue('--ink').trim() || '#eee'
      line = style.getPropertyValue('--line').trim() || '#333'
      schedule()
    }
    function resize() {
      box = host.getBoundingClientRect(); dirty = false
      width = box.width; height = box.height; ratio = Math.min(devicePixelRatio || 1, 1.75)
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio)
      schedule()
    }
    function project(x: number, y: number, z: number): V3 {
      const ay = .3 + px * .55 + time * .075, ax = -.4 + py * .4
      const x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = z * Math.cos(ay) - x * Math.sin(ay)
      const y1 = y * Math.cos(ax) - z1 * Math.sin(ax), z2 = y * Math.sin(ax) + z1 * Math.cos(ax)
      const perspective = 3.5 / (3.5 - z2), scale = Math.min(width * .33, height * .36)
      return [width * .5 + x1 * scale * perspective, height * .49 + y1 * scale * perspective, z2]
    }
    function draw(stamp: number) {
      frame = 0; if (!visible || document.hidden) return
      const dt = last ? Math.min(40, stamp - last) : 16.67; last = stamp
      if (!reduced.matches) time += dt / 1000
      const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 230)
      moving = false
      for (let k = 0; k < 4; k++) {
        const goal = k === target.current ? 1 : 0
        weights[k] = mix(weights[k], goal, ease)
        if (Math.abs(weights[k] - goal) > .001) moving = true
      }
      px = mix(px, tx, 1 - Math.exp(-dt / 85)); py = mix(py, ty, 1 - Math.exp(-dt / 85))
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = line; ctx.lineWidth = .6; ctx.globalAlpha = .6
      // Open registration marks, not a containing frame.
      ctx.beginPath()
      for (const y of [height * .18, height * .82]) {
        ctx.moveTo(width * .5 - 5, y); ctx.lineTo(width * .5 + 5, y)
        ctx.moveTo(width * .5, y - 5); ctx.lineTo(width * .5, y + 5)
      }
      ctx.stroke()
      const strands = width < 450 ? 42 : 60, segments = 96
      ctx.strokeStyle = ink
      for (let j = 0; j < strands; j++) {
        const v = (j + .5) / strands
        ctx.beginPath(); let depth = 0
        for (let i = 0; i <= segments; i++) {
          const u = i / segments
          let x = 0, y = 0, z = 0
          for (let k = 0; k < 4; k++) {
            if (weights[k] < .0001) continue
            const point = shape(k, u, v, time)
            x += point[0] * weights[k]; y += point[1] * weights[k]; z += point[2] * weights[k]
          }
          const point = project(x, y, z)
          depth += point[2]
          if (i === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1])
        }
        ctx.globalAlpha = .18 + .34 * (depth / (segments + 1) + 1) / 2 + (j % 9 === 0 ? .25 : 0)
        ctx.lineWidth = j % 9 === 0 ? 1.2 : .65; ctx.stroke()
        // Travelling points make the strands legible as one connected system.
        const u = ((time * .035 + j * .037) % 1 + 1) % 1
        let x = 0, y = 0, z = 0
        for (let k = 0; k < 4; k++) {
          if (weights[k] < .0001) continue
          const p = shape(k, u, v, time); x += p[0] * weights[k]; y += p[1] * weights[k]; z += p[2] * weights[k]
        }
        if (j % 6 === 0) {
          const point = project(x, y, z)
          ctx.globalAlpha = .65; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(point[0], point[1], 1.6, 0, TAU); ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (!reduced.matches || moving || Math.abs(px - tx) + Math.abs(py - ty) > .001) schedule()
    }
    function pointer(event: PointerEvent) {
      if (reduced.matches || (event.pointerType !== 'mouse' && event.buttons === 0)) return
      if (dirty) {box = host.getBoundingClientRect(); dirty = false}
      tx = ((event.clientX - box.left) / box.width - .5) * 2
      ty = ((event.clientY - box.top) / box.height - .5) * 2
      schedule()
    }
    function reset() {tx = 0; ty = 0; schedule()}
    function invalidate() {dirty = true}
    function visibility() {if (document.hidden) {cancelAnimationFrame(frame); frame = 0; last = 0} else schedule()}
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {last = 0; schedule()} else {cancelAnimationFrame(frame); frame = 0; last = 0}
    }, {threshold: .01})
    const resizer = new ResizeObserver(resize)
    const themes = new MutationObserver(theme)
    observer.observe(host); resizer.observe(host); themes.observe(document.documentElement, {attributes: true, attributeFilter: ['data-workspace-theme']})
    host.addEventListener('pointermove', pointer, {passive: true}); host.addEventListener('pointerleave', reset); host.addEventListener('pointerup', reset); host.addEventListener('pointercancel', reset)
    window.addEventListener('scroll', invalidate, {passive: true}); document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', reset)
    theme(); resize(); setReady(true)
    return () => {
      cancelAnimationFrame(frame); wake.current = null; observer.disconnect(); resizer.disconnect(); themes.disconnect()
      host.removeEventListener('pointermove', pointer); host.removeEventListener('pointerleave', reset); host.removeEventListener('pointerup', reset); host.removeEventListener('pointercancel', reset)
      window.removeEventListener('scroll', invalidate); document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', reset)
    }
  }, [])

  const labels = ['Possibility / a field of ideas', 'Direction / a continuous form', 'Connection / an interlaced system', 'Presence / ready to go out into the world']
  return <div className={hero ? s.heroField : s.processField} data-living-geometry data-phase={active}>
    <canvas ref={canvas} role="img" aria-label={labels[active]} />
    {!ready && <svg className={s.fieldFallback} viewBox="0 0 400 300" aria-hidden="true">{Array.from({length: 24}, (_, i) => <ellipse key={i} cx="200" cy="150" rx={100 + i} ry={20 + i * 3.5} transform={`rotate(${i * 3} 200 150)`} />)}</svg>}
    <span className={s.fieldLabel}>{hero ? 'AN IDEA, IN MOTION.' : ['01 / POSSIBILITY', '02 / DIRECTION', '03 / CONNECTION', '04 / PRESENCE'][active]}</span>
    <span className={s.fieldHint}>MOVE OR TOUCH TO EXPLORE</span>
  </div>
}

type TypeOptions = {space: boolean; contrast: boolean; alignment: boolean}
type Stroke = {y: number; points: number[]}

export function TypeField({space, contrast, alignment}: TypeOptions) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const options = useRef<TypeOptions>({space, contrast, alignment})
  const wake = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {options.current = {space, contrast, alignment}; wake.current?.()}, [space, contrast, alignment])
  useEffect(() => {
    const node = canvas.current, parent = node?.parentElement
    if (!node || !parent) return
    const context = node.getContext('2d'), stencil = document.createElement('canvas'), mask = stencil.getContext('2d', {willReadFrequently: true})
    if (!context || !mask) return
    const ctx = context, glyph = mask, host = parent, element = node
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let width = 1, height = 1, ratio = 1, ink = '#eee', frame = 0, visible = false, last = 0, time = 0
    let disposed = false
    let strokes: Stroke[] = [], px = -1000, py = -1000, tx = -1000, ty = -1000, pointerOn = false, radius = 0
    let amount = [0, 0, 0], box = host.getBoundingClientRect(), dirty = true
    function schedule() {if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw)}
    wake.current = schedule
    function build() {
      box = host.getBoundingClientRect(); dirty = false; width = box.width; height = box.height
      ratio = Math.min(devicePixelRatio || 1, 1.75); element.width = Math.round(width * ratio); element.height = Math.round(height * ratio)
      stencil.width = Math.round(width); stencil.height = Math.round(height)
      glyph.clearRect(0, 0, width, height)
      const family = getComputedStyle(host).fontFamily
      let fontSize = Math.min(width * .215, height * .39)
      glyph.font = `650 ${fontSize}px ${family}`
      const limit = width * .9, measured = glyph.measureText('MATTER.').width
      if (measured > limit) {fontSize *= limit / measured; glyph.font = `650 ${fontSize}px ${family}`}
      glyph.textAlign = 'center'; glyph.textBaseline = 'middle'; glyph.fillStyle = '#fff'
      glyph.fillText('MAKE IT', width * .5, height * .5 - fontSize * .49)
      glyph.fillText('MATTER.', width * .5, height * .5 + fontSize * .49)
      const image = glyph.getImageData(0, 0, stencil.width, stencil.height).data
      strokes = []; const step = width < 450 ? 3 : 3.5
      for (let y = 0; y < stencil.height; y += step) {
        let run: number[] = []
        for (let x = 0; x < stencil.width; x += 3) {
          const inside = image[(Math.floor(y) * stencil.width + x) * 4 + 3] > 70
          if (inside) run.push(x)
          if ((!inside || x + 3 >= stencil.width) && run.length) {
            if (run.length > 1) strokes.push({y, points: run})
            run = []
          }
        }
      }
      schedule()
    }
    function theme() {ink = getComputedStyle(host).getPropertyValue('--ink').trim() || '#eee'; schedule()}
    function draw(stamp: number) {
      frame = 0; if (!visible || document.hidden) return
      const dt = last ? Math.min(40, stamp - last) : 16.67; last = stamp
      if (!reduced.matches) time += dt / 1000
      const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 180)
      const targets = [options.current.space, options.current.contrast, options.current.alignment].map(Number)
      let changing = false
      amount = amount.map((value, i) => {const next = mix(value, targets[i], ease); if (Math.abs(next - targets[i]) > .001) changing = true; return next})
      px = mix(px, tx, ease); py = mix(py, ty, ease); radius = mix(radius, pointerOn && !reduced.matches ? Math.min(width * .23, 125) : 0, ease)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = ink
      const spacing = 1 + amount[0] * .09, amplitude = (1 - amount[2] * .9) * Math.min(8, width * .018)
      // Thin contours extrude the letterforms directly into the surrounding space.
      for (let layer = 3; layer >= 0; layer--) {
        ctx.lineWidth = layer ? .55 : .8 + amount[1] * .65
        ctx.globalAlpha = layer ? .1 + amount[1] * .04 : .64 + amount[1] * .31
        ctx.beginPath()
        for (const stroke of strokes) {
          for (let i = 0; i < stroke.points.length; i++) {
            const originalX = stroke.points[i], originalY = stroke.y
            let x = width * .5 + (originalX - width * .5) * (1 - amount[0] * .055)
            let y = height * .5 + (originalY - height * .5) * spacing
            const wave = Math.sin(originalX * .025 + originalY * .018 + time * .75)
            y += wave * amplitude; x += Math.cos(originalY * .026 + time * .45) * amplitude * .35
            const dx = x - px, dy = y - py, distance = Math.sqrt(dx * dx + dy * dy)
            const lens = radius ? Math.max(0, 1 - distance / radius) : 0
            const push = lens * lens * 26
            x += dx / (distance || 1) * push + layer * (5 + lens * 6)
            y += dy / (distance || 1) * push + layer * (5 + lens * 6)
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (!reduced.matches || changing) schedule()
    }
    function pointer(event: PointerEvent) {
      if (reduced.matches || (event.pointerType !== 'mouse' && event.buttons === 0)) return
      if (dirty) {box = host.getBoundingClientRect(); dirty = false}
      const x = event.clientX - box.left, y = event.clientY - box.top
      if (!pointerOn) {px = x; py = y}
      tx = x; ty = y; pointerOn = true; schedule()
    }
    function reset() {pointerOn = false; schedule()}
    function invalidate() {dirty = true}
    function visibility() {if (document.hidden) {cancelAnimationFrame(frame); frame = 0; last = 0} else schedule()}
    const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; if (visible) {last = 0; schedule()} else {cancelAnimationFrame(frame); frame = 0; last = 0}}, {threshold: .01})
    const resizer = new ResizeObserver(build), themes = new MutationObserver(theme)
    observer.observe(host); resizer.observe(host); themes.observe(document.documentElement, {attributes: true, attributeFilter: ['data-workspace-theme']})
    host.addEventListener('pointermove', pointer, {passive: true}); host.addEventListener('pointerleave', reset); host.addEventListener('pointerup', reset); host.addEventListener('pointercancel', reset)
    window.addEventListener('scroll', invalidate, {passive: true}); document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', reset)
    theme(); build(); setReady(true)
    void document.fonts.ready.then(() => {if (!disposed && element.isConnected) build()})
    return () => {
      disposed = true; cancelAnimationFrame(frame); wake.current = null; observer.disconnect(); resizer.disconnect(); themes.disconnect()
      host.removeEventListener('pointermove', pointer); host.removeEventListener('pointerleave', reset); host.removeEventListener('pointerup', reset); host.removeEventListener('pointercancel', reset)
      window.removeEventListener('scroll', invalidate); document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', reset)
    }
  }, [])

  return <div className={s.typeField} data-type-field data-space={space} data-contrast={contrast} data-alignment={alignment}>
    <canvas ref={canvas} role="img" aria-label="Make it matter. A living typographic study: space, contrast and alignment respond to your choices." />
    {!ready && <span className={s.typeFallback} aria-hidden="true">MAKE IT<br/>MATTER.</span>}
    <span className={s.fieldLabel}>KORYX / LIVING TYPE</span><span className={s.fieldHint}>MOVE OR TOUCH THE LETTERS</span>
  </div>
}
