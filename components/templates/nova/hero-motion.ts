export const HERO_WORDS = ['Nova', 'SAAS', 'PLATFORM', 'NOVA'] as const
export const SIMULATION_HZ = 110
export const WORD_TICKS = 240
export const WORD_SECONDS = WORD_TICKS / SIMULATION_HZ
export type Point = {x: number; y: number}

export function randomStream(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let n = Math.imul(state ^ state >>> 15, 1 | state)
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n)
    return ((n ^ n >>> 14) >>> 0) / 4294967296
  }
}

export type LightPoint = {
  id: number
  x: number; y: number; vx: number; vy: number
  targetX: number; targetY: number
  speed: number; force: number; fadeRate: number
  light: number; lightFrom: number; lightTo: number; blend: number
  departing: boolean
}

/**
 * Arrival steering and persistence studied from the public LeLo reference:
 * https://v0.app/templates/RjIZayM2Jjj (nikhilsbuilds).
 * One persistent population owns every visible light, including the arrivals,
 * letter strokes and departing waves. Retargeting never changes a position or
 * velocity. A point steers and brakes itself into its next glyph coordinate.
 */
export class GlyphFlow {
  readonly points: LightPoint[] = []
  tick = 0
  word = 0
  private nextId = 0
  private readonly random: () => number

  constructor(readonly width: number, readonly height: number, readonly glyphs: readonly Point[][], initialTick = 0, seed = 71023) {
    this.random = randomStream(seed)
    this.tick = initialTick
    this.retarget(Math.floor(initialTick / WORD_TICKS) % glyphs.length)
  }

  private perimeter(): Point {
    const angle = this.random() * Math.PI * 2, radius = (this.width + this.height) / 2
    return {x: this.width / 2 + Math.cos(angle) * radius, y: this.height / 2 + Math.sin(angle) * radius}
  }

  private tint(point: LightPoint, destination: number) {
    point.lightFrom = point.light
    point.lightTo = destination
    point.blend = 0
  }

  retarget(word: number) {
    this.word = word
    const coordinates = [...this.glyphs[word]]
    for (let i = coordinates.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1)); [coordinates[i], coordinates[j]] = [coordinates[j], coordinates[i]]
    }
    // New glyph area fills progressively from outside. Existing lights are reused
    // first, including those still returning from an earlier departure.
    const required = coordinates.length
    const admitted = required > this.points.length ? this.points.length + Math.ceil((required - this.points.length) / 2) : required
    for (let i = 0; i < admitted; i++) {
      let point = this.points[i]
      if (!point) {
        const start = this.perimeter(), speed = 4 + this.random() * 6
        point = {id: this.nextId++, x: start.x, y: start.y, vx: 0, vy: 0,
          targetX: 0, targetY: 0, speed, force: speed * .05,
          fadeRate: .0025 + this.random() * .0275,
          light: 0, lightFrom: 0, lightTo: 1, blend: 0, departing: false}
        this.points.push(point)
      }
      point.targetX = coordinates[i].x; point.targetY = coordinates[i].y
      point.departing = false
      this.tint(point, 1)
    }
    for (let i = admitted; i < this.points.length; i++) {
      const point = this.points[i]
      if (point.departing) continue
      const exit = this.perimeter()
      point.targetX = exit.x; point.targetY = exit.y
      point.departing = true
      this.tint(point, 0)
    }
  }

  step() {
    let retained = 0
    for (const point of this.points) {
      const dx = point.targetX - point.x, dy = point.targetY - point.y, distance = Math.hypot(dx, dy)
      const desiredSpeed = point.speed * Math.min(1, distance / 100)
      const k = distance > 1e-8 ? desiredSpeed / distance : 0
      const steerX = dx * k - point.vx, steerY = dy * k - point.vy
      const steering = Math.hypot(steerX, steerY)
      if (steering > 1e-8) {
        point.vx += steerX / steering * point.force
        point.vy += steerY / steering * point.force
      }
      point.x += point.vx; point.y += point.vy
      point.blend = Math.min(1, point.blend + point.fadeRate)
      point.light = point.lightFrom + (point.lightTo - point.lightFrom) * point.blend
      if (point.departing && (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height)) continue
      this.points[retained++] = point
    }
    this.points.length = retained
    this.tick++
    if (this.tick % WORD_TICKS === 0) this.retarget((this.word + 1) % this.glyphs.length)
  }
}
