import {fieldEnvelope, HERO_WORDS, heroPose, Point, randomStream, textParticle} from './hero-motion'

type Dot = {seed: number; size: number}
type Ray = {angle: number; bend: number; twist: number; offset: number; alpha: number; originX: number; originY: number}

function sampleWord(word: string, font: number, count: number, random: () => number): Point[] {
  const sample = document.createElement('canvas')
  sample.width = 760; sample.height = 180
  const ink = sample.getContext('2d', {willReadFrequently: true})
  if (!ink) return Array.from({length: count}, () => ({x: 0, y: 0}))
  ink.fillStyle = '#fff'
  ink.font = `600 ${font}px Arial, Helvetica, sans-serif`
  ink.textAlign = 'center'; ink.textBaseline = 'alphabetic'
  const metrics = ink.measureText(word), baseline = 90 + metrics.actualBoundingBoxAscent / 2
  ink.fillText(word, 380, baseline)
  const data = ink.getImageData(0, 0, 760, 180).data, points: Point[] = []
  for (let y = 10; y < 170; y++) for (let x = 10; x < 750; x++) {
    if (data[(y * 760 + x) * 4 + 3] > 150) points.push({x: x - 380, y: y - 90})
  }
  // Repeating the old, small sampling grid made the letters almost solid.
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [points[i], points[j]] = [points[j], points[i]]
  }
  return Array.from({length: count}, (_, i) => {
    const p = points[i % points.length] || {x: 0, y: 0}
    return {x: p.x + (random() - .5) * .8, y: p.y + (random() - .5) * .8}
  }).sort((a, b) => a.y - b.y)
}

/** Used by the real hero and the deterministic visual comparison harness. */
export function createHeroRenderer(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const mobile = width < 600, font = Math.min(84, Math.max(40, width * .043))
  const scale = font / 66, random = randomStream(71023), count = mobile ? 1000 : 1850
  const targets = HERO_WORDS.map(word => sampleWord(word, font, count, random))
  const dots: Dot[] = Array.from({length: count}, () => ({seed: random(), size: (.95 + random() * .7) * Math.max(.78, scale)}))
  const rays: Ray[] = Array.from({length: mobile ? 105 : 184}, () => ({angle: random() * Math.PI * 2, bend: (random() - .5) * .8, twist: random() * Math.PI * 2, offset: random(), alpha: .45 + random() * .55, originX: (random() - .5) * font * 2.3, originY: (random() - .5) * font * .65}))
  const free = Array.from({length: mobile ? 100 : 220}, () => ({angle: random() * Math.PI * 2, seed: random(), radius: random(), speed: .2 + random() * .6}))
  const positions = new Float32Array(count * 2), previous = new Float32Array(count * 2)
  const cx = width / 2, cy = height * .41, extent = Math.hypot(width, height) * .65

  function pointAt(index: number, seconds: number, pose: ReturnType<typeof heroPose>) {
    const dot = dots[index]
    return textParticle(targets[pose.from][index], targets[pose.to][index], dot.seed, seconds, pose, scale)
  }

  return {
    draw(seconds: number, reduced: boolean, pointer: Point = {x: 10000, y: 10000}) {
      const pose = heroPose(seconds, reduced), pastTime = Math.max(0, seconds - .14), pastPose = heroPose(pastTime, reduced)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height)
      if (!reduced) {
        // Constant dot spacing is important: perspective-spaced sprites left gaps
        // of tens of pixels at the edges, unlike the reference's fine filaments.
        ctx.setLineDash([.15 * Math.max(.8, scale), 3.6 * Math.max(.8, scale)])
        ctx.lineCap = 'round'
        if (pose.field >= .1 || pose.phase !== 'hold') for (const ray of rays) {
          const endAngle = ray.angle + Math.sin(seconds * .35 + ray.twist) * ray.bend
          const gradient = ctx.createLinearGradient(cx, cy, cx + Math.cos(endAngle) * extent * 1.15, cy + Math.sin(endAngle) * extent * .82)
          for (const stop of [0, .04, .1, .22, .4, .65, 1]) {
            const radius = Math.max(1, extent * stop)
            const envelope = fieldEnvelope(radius, seconds, pose, extent)
            const alpha = Math.min(.95, (.008 + Math.pow(envelope, 1.5) * 1.6) * ray.alpha * (1 - stop * .85))
            gradient.addColorStop(stop, `rgba(255,255,255,${stop === 0 ? 0 : alpha})`)
          }
          ctx.beginPath()
          const start = (18 + ray.offset * 25) * scale
          for (let j = 0; j <= 32; j++) {
            const radius = start + (extent - start) * j / 32
            const bend = Math.sin(Math.log(radius / (30 * scale)) * 1.3 + seconds * .35 + ray.twist) * ray.bend
            const theta = ray.angle + bend
            const x = cx + ray.originX + Math.cos(theta) * radius * 1.15, y = cy + ray.originY + Math.sin(theta) * radius * .82
            if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
          }
          ctx.lineDashOffset = -seconds * 55 - ray.offset * 12
          ctx.lineWidth = (.8 + ray.offset * .45) * Math.max(.8, Math.min(1.1, scale))
          ctx.strokeStyle = gradient; ctx.stroke()
        }
        ctx.setLineDash([]); ctx.lineCap = 'butt'
        ctx.beginPath()
        for (const p of free) {
          const age = (seconds * p.speed * .4 + p.radius) % 1
          const radius = (32 + Math.pow(age, 1.8) * extent) * scale
          const angle = p.angle + Math.sin(seconds * .2 + p.seed * 9) * .12
          const x = cx + Math.cos(angle) * radius, y = cy + Math.sin(angle) * radius * .8
          const length = (7 + age * age * 65) * scale
          ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length * .8)
        }
        ctx.lineWidth = .6; ctx.strokeStyle = `rgba(255,255,255,${.035 + pose.field * .39})`; ctx.stroke()
      }

      for (let i = 0; i < count; i++) {
        const p = pointAt(i, seconds, pose), old = reduced ? p : pointAt(i, pastTime, pastPose)
        let x = p.x, y = p.y
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy)
        if (!reduced && pose.phase === 'hold' && distance > 1 && distance < 44) {
          x += dx / distance * (44 - distance) * .07; y += dy / distance * (44 - distance) * .07
        }
        positions[i * 2] = x; positions[i * 2 + 1] = y
        previous[i * 2] = old.x; previous[i * 2 + 1] = old.y
      }
      if (!reduced) {
        // Actual point velocities make the horizontal web visible in the reference.
        ctx.beginPath()
        for (let i = 0; i < count; i++) {
          const x = positions[i * 2], y = positions[i * 2 + 1]
          let dx = previous[i * 2] - x, dy = previous[i * 2 + 1] - y
          const length = Math.hypot(dx, dy)
          if (length < 1.4 * scale) continue
          const cap = Math.min(1, 64 * scale / length); dx *= cap; dy *= cap
          ctx.moveTo(cx + x, cy + y); ctx.lineTo(cx + x + dx, cy + y + dy)
        }
        ctx.lineWidth = .55 * scale; ctx.strokeStyle = 'rgba(255,255,255,.62)'; ctx.stroke()
        ctx.beginPath()
        for (let i = 0; i < free.length; i += pose.phase === 'hold' ? 3 : 1) {
          const p = free[i], anchorIndex = (i * 73) % count
          const x = positions[anchorIndex * 2], y = positions[anchorIndex * 2 + 1]
          const radius = (18 + p.radius * 65) * scale, angle = p.angle + seconds * p.speed
          const endX = x + Math.cos(angle) * radius, endY = y + Math.sin(angle) * radius * .7
          ctx.moveTo(cx + x, cy + y); ctx.lineTo(cx + endX, cy + endY)
        }
        ctx.lineWidth = .45 * Math.max(.8, scale)
        ctx.strokeStyle = `rgba(255,255,255,${.12 + (pose.phase === 'morph' ? Math.sin(Math.PI * pose.mix) * .32 : .07)})`; ctx.stroke()
      }
      for (let b = 0; b < 3; b++) {
        ctx.beginPath()
        for (let i = b; i < count; i += 3) {
          const x = cx + positions[i * 2], y = cy + positions[i * 2 + 1], radius = dots[i].size / 2
          ctx.rect(x - radius, y - radius, radius * 2, radius * 2)
        }
        ctx.fillStyle = `rgba(255,255,255,${.8 + b * .1})`; ctx.fill()
      }
      return {word: HERO_WORDS[pose.mix > .5 ? pose.to : pose.from], phase: pose.phase, particles: count, rays: rays.length}
    },
  }
}
