/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the actual particle engine. */
const assert = require('node:assert/strict')
const load = require('./helpers/load-typescript.cjs')()
const {GlyphFlow, HERO_WORDS, WORD_TICKS, SIMULATION_HZ} = load('components/templates/nova/hero-motion.ts')
const small = Array.from({length: 40}, (_, i) => ({x: 470 + i, y: 210 + i % 4 * 5}))
const wide = Array.from({length: 120}, (_, i) => ({x: 400 + i, y: 205 + i % 5 * 5}))
const field = new GlyphFlow(1000, 600, [small, wide, small, small])
assert.deepEqual(HERO_WORDS, ['Nova', 'SAAS', 'PLATFORM', 'NOVA'])
assert.equal(WORD_TICKS / SIMULATION_HZ, 240 / 110)
assert.ok(field.points.length > 0 && field.points.length < small.length, 'The first lights arrive progressively rather than appearing as a complete word.')
assert.ok(field.points.every(p => Math.hypot(p.x - 500, p.y - 300) >= 799.9), 'Lights are born beyond the visible scene and travel into the letters.')
for (let i = 0; i < 220; i++) field.step()
const before = new Map(field.points.map(p => [p.id, {...p}]))
field.retarget(1)
for (const p of field.points) {
  const old = before.get(p.id)
  if (!old) continue
  assert.deepEqual([p.x, p.y, p.vx, p.vy, p.light], [old.x, old.y, old.vx, old.vy, old.light], 'A word change must preserve the exact light identity, position, velocity and brightness.')
}
assert.ok(field.points.length > before.size, 'A wider word receives additional incoming lights.')
const pool = new Map(field.points.map(p => [p.id, {...p}]))
field.retarget(2)
const exits = field.points.filter(p => p.departing)
assert.ok(exits.length > 0, 'A narrower word releases its surplus lights into the outgoing wave.')
for (const p of exits) {
  const old = pool.get(p.id)
  assert.deepEqual([p.x, p.y, p.vx, p.vy, p.light], [old.x, old.y, old.vx, old.vy, old.light])
  assert.equal(p.lightTo, 0)
}
const firstExit = {...exits[0]}
field.step()
const continued = field.points.find(p => p.id === firstExit.id)
if (continued) {
  assert.ok(Math.hypot(continued.x - firstExit.x, continued.y - firstExit.y) > 0, 'Departures actually fly, rather than fading in place.')
  assert.ok(continued.light <= firstExit.light)
}
const arrival = new GlyphFlow(1000, 600, [small])
for (let i = 0; i < 220; i++) arrival.step()
assert.ok(arrival.points.filter(p => Math.hypot(p.x - p.targetX, p.y - p.targetY) < 8).length > arrival.points.length * .7, 'The same incoming lights must converge into recognizable letter coordinates.')
const cycle = new GlyphFlow(1000, 600, [small, wide, small, small])
for (let i = 1; i <= WORD_TICKS * 9; i++) {
  cycle.step()
  assert.equal(cycle.word, Math.floor(i / WORD_TICKS) % 4)
  assert.ok(cycle.points.length <= wide.length, 'The shared pool remains bounded across cycles.')
  for (const p of cycle.points) assert.ok(Number.isFinite(p.x + p.y + p.vx + p.vy + p.light))
}
console.log('PASS: light identity and momentum continuity, incoming glyph formation, real outgoing waves, fade continuity, word timing and bounded shared population.')
