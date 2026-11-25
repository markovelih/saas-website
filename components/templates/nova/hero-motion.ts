export const HERO_WORDS = ['SAAS', 'PLATFORM', 'NOVA', 'Nova'] as const
export const INTRO_SECONDS = 1.9
export const FIRST_HOLD_SECONDS = 1.3
export const WORD_SECONDS = 2.18
export const TRANSITION_SECONDS = .94

export type Point = {x: number; y: number}
const clamp = (value: number) => Math.max(0, Math.min(1, value))
export function smooth(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

/** Stable samples across resizing and reproducible visual QA. */
export function randomStream(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let n = Math.imul(state ^ state >>> 15, 1 | state)
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n)
    return ((n ^ n >>> 14) >>> 0) / 4294967296
  }
}

export function heroPose(seconds: number, reduced = false) {
  if (reduced) return {from: 2, to: 2, elapsed: 1, mix: 1, phase: 'hold' as const, intro: false, field: 0}
  const time = Math.max(0, seconds)
  if (time < INTRO_SECONDS) return {from: 0, to: 0, elapsed: time, mix: smooth(.2, INTRO_SECONDS, time), phase: 'arrive' as const, intro: true, field: 1}
  const running = time - INTRO_SECONDS - FIRST_HOLD_SECONDS
  if (running < 0) return {from: 0, to: 0, elapsed: WORD_SECONDS + running, mix: 1, phase: 'hold' as const, intro: false, field: 1}
  const step = Math.floor(running / WORD_SECONDS), elapsed = running - step * WORD_SECONDS
  const from = step % HERO_WORDS.length, to = (from + 1) % HERO_WORDS.length
  const mix = 1 - Math.pow(1 - clamp(elapsed / TRANSITION_SECONDS), 3)
  const a = from < 2 ? 1 : .015, b = to < 2 ? 1 : .015
  return {from, to, elapsed, mix, phase: elapsed < TRANSITION_SECONDS ? 'morph' as const : 'hold' as const, intro: false, field: a + (b - a) * smooth(.08, .85, elapsed)}
}

/**
 * Points exchange glyph coordinates in the full-height word plane. Horizontal
 * velocity makes the luminous band; there is no rotation or Y-axis flattening.
 */
export function textParticle(a: Point, b: Point, seed: number, time: number, pose: ReturnType<typeof heroPose>, scale = 1): Point {
  if (pose.field === 0) return {x: b.x, y: b.y}
  let mix = pose.mix
  if (pose.phase === 'morph') {
    const t = clamp((pose.elapsed - seed * .065) / (TRANSITION_SECONDS - .065))
    mix = 1 - Math.pow(1 - t, 3)
  }
  let x = a.x + (b.x - a.x) * mix, y = a.y + (b.y - a.y) * mix
  if (pose.intro) {
    const angle = seed * Math.PI * 26, travel = (1 - pose.mix) * (360 + seed * 660) * scale
    x += Math.cos(angle) * travel; y += Math.sin(angle) * travel * .65
  }
  const turbulence = pose.phase === 'morph' ? Math.sin(Math.PI * mix) : 0
  x += (Math.sin(time * 1.7 + seed * 171) * .55 + Math.sin(seed * 91 + time * 19) * turbulence * 2.2) * scale
  y += (Math.cos(time * 1.4 + seed * 83) * .48 + Math.cos(seed * 57 + time * 17) * turbulence * 2.4) * scale
  return {x, y}
}

/** Dotted waves sweep inward separately from the core's motion trails. */
export function fieldEnvelope(radius: number, seconds: number, pose: ReturnType<typeof heroPose>, extent: number) {
  if (pose.field === 0) return 0
  const local = pose.intro ? seconds : pose.elapsed
  const sweep = pose.intro ? smooth(0, 1.2, local) : smooth(.82, WORD_SECONDS, local)
  const front = extent * Math.exp(-sweep * 3.3)
  const shell = Math.exp(-Math.pow(Math.log(Math.max(radius, 1) / front) / .9, 2))
  const birth = Math.exp(-Math.pow((local - .3) / .36, 2)) * Math.exp(-radius / (extent * .24))
  return Math.min(1, shell * pose.field + birth * .55)
}
