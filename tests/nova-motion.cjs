/* eslint-disable @typescript-eslint/no-require-imports -- Load the actual animation model. */
const assert=require('node:assert/strict'),load=require('./helpers/load-typescript.cjs')()
const {HERO_WORDS,heroPose,textParticle,INTRO_SECONDS,FIRST_HOLD_SECONDS,WORD_SECONDS,TRANSITION_SECONDS}=load('components/templates/nova/hero-motion.ts')
assert.deepEqual(HERO_WORDS,['SAAS','PLATFORM','NOVA','Nova'])
const start=INTRO_SECONDS+FIRST_HOLD_SECONDS
assert.equal(heroPose(.2).phase,'arrive')
assert.equal(heroPose(1.2).phase,'ribbon')
assert.equal(heroPose(2).phase,'rebuild')
assert.equal(heroPose(2.5).phase,'hold')
assert.equal(heroPose(start+.08).phase,'collapse')
assert.equal(heroPose(start+.25).phase,'ribbon')
assert.equal(heroPose(start+.48).phase,'rebuild')
for(let i=0;i<8;i++){
 const pose=heroPose(start+i*WORD_SECONDS+TRANSITION_SECONDS+.1)
 assert.equal(pose.phase,'hold');assert.equal(pose.to,(i+1)%4)
 const a={x:-100,y:30},b={x:85,y:-24},p=textParticle(a,b,.37,500,pose)
 assert.deepEqual(p,b,'The settled word holds its precise glyph coordinates; it must not keep drifting between words.')
}
const band=heroPose(start+.25)
assert.ok(Math.abs(Math.cos(band.angle))<1e-10,'The transition must fold fully edge-on, not cross-fade two glyphs.')
for(let i=0;i<100;i++){
 const p=textParticle({x:-120,y:30},{x:190,y:-30},i/100,start+.25,band)
 assert.ok(Math.abs(p.y)<15,'The brightest transition stays in a thin horizontal ribbon.')
}
const fixed=heroPose(100,true)
assert.equal(fixed.to,2);assert.equal(fixed.phase,'hold');assert.equal(fixed.mesh,0);assert.equal(fixed.scatter,0)
for(let frame=0;frame<2000;frame++){
 const seconds=frame/60,pose=heroPose(seconds),p=textParticle({x:-200,y:35},{x:200,y:-35},.73,seconds,pose)
 assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(pose.mix>=0&&pose.mix<=1);assert.ok(pose.to>=0&&pose.to<4)
}
console.log('PASS: four reference word states, intro, 0.62s edge-on ribbon/unfold, 2.2s cadence, precise settled glyphs, bounded projections and reduced-motion pose. No external calls.')
