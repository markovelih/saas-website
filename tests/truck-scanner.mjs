import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import ts from 'typescript'
const source=await fs.readFile(new URL('../lib/interaction/truck-scanner.ts',import.meta.url),'utf8')
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,testModule={exports:{}}
new Function('module','exports',js)(testModule,testModule.exports)
const {TRUCK_VIEW,pointerScanY,settleScan}=testModule.exports
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} differs from ${expected}`)
const matrix={a:.6,b:0,c:0,d:.6,e:28,f:200}
near(pointerScanY(450,347,matrix),245)
// Same relative pointer position after a page scroll: the SVG translation changes, not the result.
near(pointerScanY(450,147,{...matrix,f:0}),245)
// Wide screens and portrait letterboxing must map the line to the same SVG boundary.
near(pointerScanY(500,630,{a:2,b:0,c:0,d:2,e:0,f:140}),245)
near(pointerScanY(180,173.5,{a:.3,b:0,c:0,d:.3,e:0,f:100}),245)
near(pointerScanY(0,-100,matrix),TRUCK_VIEW.min)
near(pointerScanY(0,10000,matrix),TRUCK_VIEW.max)
assert.equal(pointerScanY(1,1,{a:0,b:0,c:0,d:0,e:0,f:0}),null)
assert.equal(pointerScanY(1,NaN,matrix),null)
const rotated={a:0,b:2,c:-2,d:0,e:500,f:100}
near(pointerScanY(10,100,rotated),245)
function after(rate){let value=TRUCK_VIEW.max;for(let i=0;i<Math.round(rate*.1);i++)value=settleScan(value,TRUCK_VIEW.min,1000/rate);return value}
assert.ok(Math.abs(after(60)-after(120))<.001,'Refresh rate must not change the animation speed')
assert.equal(settleScan(245,100,8,true),100)
assert.equal(settleScan(245,245,8),245)
assert.equal(settleScan(245.001,245,8),245)
assert.ok(settleScan(245,100,8)<245&&settleScan(245,100,8)>100)
console.log('PASS: scanner pointer transforms, scrolling offsets, letterboxing, clamping, 60/120 Hz damping and reduced motion')

// Exercise the actual component's pointer listeners with touch, mouse, scroll and idle frames.
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url),attributes={},capture=new Set(),clips={exterior:{setAttribute:(key,value)=>attributes['exterior-'+key]=value},interior:{setAttribute:(key,value)=>attributes['interior-'+key]=value}}
const scene=Object.assign(new EventTarget(),{setAttribute:(key,value)=>attributes[key]=value,getBoundingClientRect:()=>({top:0}),setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id)})
const svg={querySelector:selector=>selector.includes('exterior')?clips.exterior:clips.interior,getScreenCTM:()=>({a:1,b:0,c:0,d:1,e:0,f:0})},beam={style:{}},text=()=>({textContent:''})
const refs=[scene,svg,beam,text(),text(),text(),TRUCK_VIEW.initial,TRUCK_VIEW.initial,()=>{}].map(current=>({current}))
let refIndex=0,effect,intersection,frameId=0,clock=0
const frames=new Map()
globalThis.document=Object.assign(new EventTarget(),{hidden:false})
globalThis.matchMedia=()=>Object.assign(new EventTarget(),{matches:false})
globalThis.requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId}
globalThis.cancelAnimationFrame=id=>frames.delete(id)
globalThis.IntersectionObserver=class{constructor(callback){intersection=callback}observe(){}disconnect(){}}
globalThis.ResizeObserver=class{observe(){}disconnect(){}}
const component=ts.transpileModule(await fs.readFile(new URL('../components/services/logistics-design.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText
const mounted={exports:{}}
const stubs={'react':{useRef:()=>refs[refIndex++],useEffect:callback=>effect=callback},'lucide-react':{MoveVertical:()=>null},'./freight-truck':{FreightTruck:()=>null},'@/lib/interaction/truck-scanner':testModule.exports,'./logistics-design.module.css':{default:{}}}
new Function('require','module','exports',component)(name=>Object.hasOwn(stubs,name)?stubs[name]:require(name),mounted,mounted.exports)
mounted.exports.DesignCanvas();const cleanup=effect();intersection([{isIntersecting:true}])
function drain(){let steps=0;while(frames.size){assert.ok(++steps<1000,'Animation must settle and stop');const pending=[...frames.values()];frames.clear();clock+=1000/120;for(const callback of pending)callback(clock)}}
function pointer(type,values){const event=new Event(type);Object.assign(event,{pointerType:'mouse',pointerId:1,button:0,isPrimary:true,clientX:600,clientY:245,movementX:0,movementY:0,...values});scene.dispatchEvent(event);drain()}
drain();assert.equal(Number(attributes['exterior-height']),245,'Initial line starts through the truck, not under it')
pointer('pointermove',{clientY:330,movementY:20});assert.equal(Number(attributes['exterior-height']),330)
pointer('pointermove',{clientY:440});assert.equal(Number(attributes['exterior-height']),330,'Synthetic zero-motion mouse event must not move the line')
document.dispatchEvent(new Event('scroll'));drain();assert.equal(Number(attributes['exterior-height']),330)
pointer('pointermove',{pointerType:'touch',pointerId:7,clientY:100});assert.equal(Number(attributes['exterior-height']),330,'Touch needs an active drag')
pointer('pointerdown',{pointerType:'touch',pointerId:7,clientY:210});assert.equal(Number(attributes['exterior-height']),210);assert.ok(capture.has(7),'Touch anywhere in the truck captures the drag')
pointer('pointermove',{pointerType:'touch',pointerId:7,clientY:90});assert.equal(Number(attributes['interior-y']),90);assert.equal(Number(attributes['interior-height']),390);assert.equal(beam.style.transform,'translate3d(0,90px,0)')
pointer('pointerup',{pointerType:'touch',pointerId:7});assert.equal(capture.has(7),false)
pointer('pointermove',{pointerType:'touch',pointerId:7,clientY:400});assert.equal(Number(attributes['exterior-height']),90)
pointer('pointerdown',{pointerType:'touch',pointerId:9,clientY:180});pointer('pointercancel',{pointerType:'touch',pointerId:9});assert.equal(capture.has(9),false);pointer('pointermove',{pointerType:'touch',pointerId:9,clientY:400});assert.equal(Number(attributes['exterior-height']),180)
assert.equal(frames.size,0,'No autonomous animation when input stops')
cleanup();console.log('PASS: actual scanner component starts centered, follows mouse/touch, ignores scroll-only events and releases idle/cancelled gestures')
