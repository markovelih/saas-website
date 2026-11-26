import {GlyphFlow, HERO_WORDS, SIMULATION_HZ, type Point} from './hero-motion'

/** Sample the glyph plane only, rather than scanning/shuffling the whole screen. */
function sampleGlyph(word: string, cx: number, cy: number, stride: number): Point[] {
  const canvas = document.createElement('canvas')
  canvas.width = 720; canvas.height = 150
  const ink = canvas.getContext('2d', {willReadFrequently: true})
  if (!ink) return []
  ink.font = '700 100px Arial, Helvetica, sans-serif'
  ink.textAlign = 'center'; ink.textBaseline = 'middle'; ink.fillStyle = '#fff'
  ink.fillText(word, 360, 75)
  const pixels = ink.getImageData(0, 0, 720, 150).data, points: Point[] = []
  // Preserve the stagger of a flattened pixel scan. Repeating one X phase in
  // every row created vertical gaps through the letter strokes.
  for (let y = 0; y < 150; y++) for (let x = (y * 2) % stride; x < 720; x += stride) {
    if (pixels[(y * 720 + x) * 4 + 3] > 0) points.push({x: cx + x - 360, y: cy + y - 75})
  }
  return points
}

/** Stateful light trails: the background is the history of the glyph particles. */
export function createHeroRenderer(ctx: CanvasRenderingContext2D, width: number, height: number, initialSeconds = 0) {
  const scale = Math.max(.4, Math.min(.84, width / 2376))
  const planeWidth = width / scale, planeHeight = height / scale
  const glyphs = HERO_WORDS.map(word => sampleGlyph(word, planeWidth / 2, planeHeight * .41, width < 600 ? 8 : 6))
  let flow = new GlyphFlow(planeWidth, planeHeight, glyphs, Math.floor(initialSeconds * SIMULATION_HZ))
  let lastSeconds = initialSeconds, fraction = 0, wasReduced = false
  const buckets = Array.from({length: 17}, () => [] as number[])

  function clear() {ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height)}
  function paintStep() {
    // Persistence belongs to the same moving lights, not an independent starfield.
    ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fillRect(0, 0, width, height)
    for (const bucket of buckets) bucket.length = 0
    for (let i = 0; i < flow.points.length; i++) buckets[Math.min(16, Math.round(flow.points[i].light * 16))].push(i)
    const size = 2 * scale
    for (let b = 0; b < buckets.length; b++) {
      if (!buckets[b].length) continue
      const light = Math.round(b / 16 * 255)
      ctx.fillStyle = `rgb(${light},${light},${light})`
      // Paint each light separately: merging them into one path loses the
      // accumulated brightness where subpixel light trails overlap.
      for (const i of buckets[b]) {
        const point = flow.points[i]
        ctx.fillRect(point.x * scale, point.y * scale, size, size)
      }
    }
  }
  clear()

  return {
    draw(seconds: number, reduced: boolean) {
      if (reduced) {
        clear(); ctx.beginPath()
        for (const point of glyphs[3]) ctx.rect(point.x * scale, point.y * scale, 2 * scale, 2 * scale)
        ctx.fillStyle = '#fff'; ctx.fill()
        wasReduced = true; lastSeconds = seconds
        return {word: 'NOVA', phase: 'hold', particles: glyphs[3].length, exiting: 0}
      }
      if (wasReduced || seconds < lastSeconds) {
        flow = new GlyphFlow(planeWidth, planeHeight, glyphs, Math.floor(seconds * SIMULATION_HZ))
        clear(); fraction = 0; lastSeconds = seconds; wasReduced = false
      }
      // Bound catch-up work after a long main-thread stall. Hidden tabs are paused
      // by the component, and 30/60/120-Hz displays all use the same physics clock.
      fraction = Math.min(8, fraction + Math.max(0, seconds - lastSeconds) * SIMULATION_HZ)
      lastSeconds = seconds
      while (fraction >= 1) {flow.step(); paintStep(); fraction--}
      let exiting = 0, arrived = 0
      for (const point of flow.points) {
        if (point.departing) exiting++
        else if (Math.hypot(point.x - point.targetX, point.y - point.targetY) < 12) arrived++
      }
      const active = flow.points.length - exiting
      return {word: HERO_WORDS[flow.word], phase: active && arrived / active > .8 ? 'hold' : 'forming', particles: flow.points.length, exiting}
    },
  }
}
