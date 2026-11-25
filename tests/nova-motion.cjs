/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the actual motion model. */
const assert = require('node:assert/strict')
const load = require('./helpers/load-typescript.cjs')()
const {HERO_WORDS, heroPose, textParticle, fieldEnvelope, INTRO_SECONDS, FIRST_HOLD_SECONDS, WORD_SECONDS, TRANSITION_SECONDS} = load('components/templates/nova/hero-motion.ts')
const start = INTRO_SECONDS + FIRST_HOLD_SECONDS
assert.deepEqual(HERO_WORDS, ['SAAS', 'PLATFORM', 'NOVA', 'Nova'])
assert.equal(heroPose(.5).phase, 'arrive')
assert.equal(heroPose(INTRO_SECONDS + .5).phase, 'hold')
for (let step = 0; step < 12; step++) {
  const morph = heroPose(start + step * WORD_SECONDS + .2)
  const hold = heroPose(start + step * WORD_SECONDS + TRANSITION_SECONDS + .1)
  assert.equal(morph.from, step % 4)
  assert.equal(morph.to, (step + 1) % 4)
  assert.equal(morph.phase, 'morph')
  assert.equal(hold.phase, 'hold')
  const target = {x: 85, y: -24}, point = textParticle({x: -100, y: 30}, target, .37, 10, hold)
  assert.ok(Math.hypot(point.x - target.x, point.y - target.y) < 1, 'Settled points breathe within one pixel, without blurring the glyph.')
}
// The earlier false fold squashed this entire horizontal stroke down to y=0.
for (let t = .03; t < TRANSITION_SECONDS; t += .03) {
  const pose = heroPose(start + t), point = textParticle({x: -120, y: 25}, {x: 180, y: 25}, .4, start + t, pose)
  assert.ok(point.y > 21 && point.y < 29, 'The morph must preserve the full-height text plane, not rotate it edge-on.')
}
const a = {x: -100, y: 12}, b = {x: 100, y: 12}
const p1 = textParticle(a, b, .37, start + .18, heroPose(start + .18))
const p2 = textParticle(a, b, .37, start + .22, heroPose(start + .22))
assert.ok(Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y) * 8, 'The long luminous strokes follow predominantly horizontal point velocities.')
const fixed = heroPose(100, true)
assert.equal(fixed.to, 2)
assert.equal(fixed.field, 0)
for (const time of [0, 1, 50, 100]) assert.deepEqual(textParticle(a, b, .37, time, fixed), b, 'Reduced motion is genuinely static.')
assert.equal(fieldEnvelope(200, 100, fixed, 1000), 0)
const early = {...heroPose(start + 1), elapsed: 1, field: 1}
const late = {...early, elapsed: 2}
assert.ok(fieldEnvelope(800, 1, early, 1000) > fieldEnvelope(800, 2, late, 1000))
assert.ok(fieldEnvelope(60, 2, late, 1000) > fieldEnvelope(60, 1, early, 1000), 'The bright dotted shell travels from the outside inward.')
for (let i = 0; i < 6000; i++) {
  const time = i / 120, pose = heroPose(time), p = textParticle(a, b, .73, time, pose)
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y))
  assert.ok(pose.mix >= 0 && pose.mix <= 1 && pose.to >= 0 && pose.to < 4)
}
console.log('PASS: four-state cadence, full-height horizontal morph, velocity trails, stable point holds, inward wave and static reduced motion.')
