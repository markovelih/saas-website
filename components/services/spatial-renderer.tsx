'use client'

import {useEffect,useRef,useState} from 'react'
import type {MutableRefObject} from 'react'
import s from './industry-showcase.module.css'

type V3=[number,number,number]
type Mesh={positions:number[];normals:number[];triangles:number[];lines:number[];points:number[];route:number[]}
export const locations=[{name:'Vancouver',lat:49.2827,lon:-123.1207},{name:'Toronto',lat:43.6532,lon:-79.3832},{name:'London',lat:51.5074,lon:-.1278},{name:'Tokyo',lat:35.6762,lon:139.6503}]
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]]
const scale=(a:V3,n:number):V3=>a.map(v=>v*n) as V3
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const normalize=(a:V3):V3=>scale(a,1/(Math.hypot(...a)||1))
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
export const cityVector=(index:number):V3=>{const p=locations[index],lat=p.lat*Math.PI/180,lon=p.lon*Math.PI/180;return [Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)]}
export function routeDistance(from:number,to:number){return Math.round(Math.acos(Math.max(-1,Math.min(1,dot(cityVector(from),cityVector(to)))))*6371)}
function surface(mode:number,u:number,v:number):V3{
 const a=u*Math.PI*2,w=(v-.5)*1.1
 if(mode===0){const r=1.1+w*Math.cos(a);return [r*Math.cos(a),w*Math.sin(a),r*Math.sin(a)]}
 if(mode===1){const centre=(t:number):V3=>{const r=1+.35*Math.cos(3*t);return [r*Math.cos(2*t),.62*Math.sin(3*t),r*Math.sin(2*t)]};const p=centre(a),tangent=normalize(sub(centre(a+.001),centre(a-.001))),n=normalize(cross(tangent,[0,1,0])),b=cross(tangent,n),c=v*Math.PI*2;return add(p,add(scale(n,.19*Math.cos(c)),scale(b,.19*Math.sin(c))))}
 const r=.25+v*1.4;return [r*Math.cos(a),.28*r*r*Math.cos(a*3)+.12*Math.sin(a*5),r*Math.sin(a)]
}
function soundSurface(mode:number,u:number,v:number):V3{
 const a=u*Math.PI*2,b=v*Math.PI*2,r=.92+.25*Math.cos(b*(mode+2)+a*3)
 return [r*Math.cos(a),.75*Math.sin(b)+.22*Math.sin(a*(mode+2)),r*Math.sin(a)+.22*Math.cos(b*3+a)]
}
function geometry(kind:'space'|'sound'|'route',mode:number,from:number,to:number):Mesh{
 const mesh:Mesh={positions:[],normals:[],triangles:[],lines:[],points:[],route:[]}
 if(kind==='route'){
  const cols=72,rows=36
  for(let i=0;i<=rows;i++){const lat=-Math.PI/2+i/rows*Math.PI;for(let j=0;j<=cols;j++){const lon=j/cols*Math.PI*2,p:V3=[1.35*Math.cos(lat)*Math.sin(lon),1.35*Math.sin(lat),1.35*Math.cos(lat)*Math.cos(lon)];mesh.positions.push(...p);mesh.normals.push(...normalize(p));const k=i*(cols+1)+j;mesh.points.push(k);if(j<cols&&i%4===0)mesh.lines.push(k,k+1);if(i<rows&&j%6===0)mesh.lines.push(k,k+cols+1)}}
  const a=cityVector(from),b=cityVector(to),angle=Math.acos(Math.max(-1,Math.min(1,dot(a,b)))),sin=Math.sin(angle)
  for(let i=0;i<=140;i++){const t=i/140,p=sin>.001?add(scale(a,Math.sin((1-t)*angle)/sin),scale(b,Math.sin(t*angle)/sin)):a,q=scale(normalize(p),1.36+.3*Math.sin(Math.PI*t));const index=mesh.positions.length/3;mesh.positions.push(...q);mesh.normals.push(...normalize(q));if(i)mesh.route.push(index-1,index)}
  return mesh
 }
 const cols=kind==='space'?128:100,rows=kind==='space'?44:56,fn=kind==='space'?surface:soundSurface
 for(let i=0;i<=cols;i++)for(let j=0;j<=rows;j++){const u=i/cols,v=j/rows,p=fn(mode,u,v),du=sub(fn(mode,u+.0001,v),fn(mode,u-.0001,v)),dv=sub(fn(mode,u,v+.0001),fn(mode,u,v-.0001)),n=normalize(cross(du,dv));mesh.positions.push(...p);mesh.normals.push(...n);const k=i*(rows+1)+j;if(i<cols&&j<rows){mesh.triangles.push(k,k+1,k+rows+1,k+1,k+rows+2,k+rows+1);if(j%2===0)mesh.lines.push(k,k+rows+1);if(i%4===0)mesh.lines.push(k,k+1)}}
 return mesh
}
const vertex=`
precision mediump float;
attribute vec3 aPosition; attribute vec3 aNormal;
uniform mat4 uMatrix; uniform mat4 uModel; uniform float uTime; uniform float uKind; uniform float uEnergy; uniform float uPointSize;
varying vec3 vNormal; varying vec3 vPosition; varying float vPulse;
void main(){vec3 p=aPosition; if(uKind>0.5&&uKind<1.5){float wave=sin(p.y*5.0+uTime*.8+p.x*2.0);p+=aNormal*(wave*.045+uEnergy*.38);p.y+=sin(p.x*4.0+uTime*.65)*.045;}vec4 world=uModel*vec4(p,1.0);vNormal=normalize((uModel*vec4(aNormal,0.0)).xyz);vPosition=world.xyz;vPulse=sin(p.y*7.0+uTime*1.2+p.x*3.0);gl_Position=uMatrix*vec4(p,1.0);gl_PointSize=uPointSize;}`
const fragment=`
precision mediump float;uniform float uStyle;uniform float uKind;uniform float uEnergy;
varying vec3 vNormal;varying vec3 vPosition;varying float vPulse;
void main(){vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 light=normalize(vec3(-.6,.9,1.4));float diffuse=abs(dot(n,light));float fresnel=pow(1.0-abs(n.z),2.6);float spec=pow(max(dot(reflect(-light,n),normalize(vec3(.3,.1,3.0)-vPosition)),0.0),38.0);vec3 reflection=reflect(normalize(vPosition-vec3(0.0,0.0,4.65)),n);float band=smoothstep(.9,.99,sin(reflection.x*5.0+reflection.y*3.0));float tone=.045+diffuse*.3+fresnel*.38+spec*.6+band*.25;float alpha=1.0;
if(uStyle>0.5&&uStyle<1.5){tone=.38+abs(n.z)*.52;alpha=.35+abs(n.z)*.58;if(uKind>0.5&&uKind<1.5){tone=.48+(vPulse*.5+.5)*.45+uEnergy*.3;alpha=.3+abs(n.z)*.65;}}
if(uStyle>1.5&&uStyle<2.5){tone=.55;alpha=.12+max(n.z,0.0)*.55;}
if(uStyle>2.5){tone=.98;alpha=.35+max(n.z,0.0)*.65;}
gl_FragColor=vec4(vec3(tone)*vec3(1.0,.99,.965),alpha);}`
function multiply(a:Float32Array,b:Float32Array){const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out}
function modelMatrix(x:number,y:number){const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y);return multiply(new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]),new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1]))}
function projection(aspect:number){const f=2.25,near=.1,far=30,depth=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*depth,-1,0,0,2*far*near*depth,0])}
export type SoundMeter={read:()=>number}|null
export function SpatialRenderer({kind,variant=0,wire=false,from=0,to=2,meter}:{kind:'space'|'sound'|'route';variant?:number;wire?:boolean;from?:number;to?:number;meter?:MutableRefObject<SoundMeter>}){
 const ref=useRef<HTMLCanvasElement>(null),orientation=useRef<{x:number;y:number}|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false})
  const mesh=geometry(kind,variant,from,to)
  if(!gl){canvas.dataset.renderer='fallback';const ctx=canvas.getContext('2d');if(ctx){const bounds=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(bounds.width));canvas.height=Math.max(1,Math.round(bounds.height));ctx.fillStyle='#050505';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#99988f';ctx.lineWidth=.65;for(let i=0;i<mesh.lines.length;i+=2){const a=mesh.lines[i]*3,b=mesh.lines[i+1]*3;ctx.beginPath();ctx.moveTo(canvas.width/2+mesh.positions[a]*canvas.height*.19,canvas.height/2-mesh.positions[a+1]*canvas.height*.19);ctx.lineTo(canvas.width/2+mesh.positions[b]*canvas.height*.19,canvas.height/2-mesh.positions[b+1]*canvas.height*.19);ctx.stroke()}}return}
  const shaders:WebGLShader[]=[],buffers:WebGLBuffer[]=[]
  function compile(type:number,source:string){const shader=gl!.createShader(type);if(!shader)return null;gl!.shaderSource(shader,source);gl!.compileShader(shader);if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)){console.error('Spatial shader compilation failed:',gl!.getShaderInfoLog(shader));gl!.deleteShader(shader);return null}shaders.push(shader);return shader}
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram()
  if(!vs||!fs||!program)return
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.error('Spatial shader linking failed:',gl.getProgramInfoLog(program));return}gl.useProgram(program)
  const bindAttribute=(name:string,values:number[])=>{const buffer=gl.createBuffer();if(!buffer)return;buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0)}
  bindAttribute('aPosition',mesh.positions);bindAttribute('aNormal',mesh.normals)
  const indices=(values:number[])=>{const buffer=gl.createBuffer();if(!buffer)return null;buffers.push(buffer);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(values),gl.STATIC_DRAW);return buffer}
  const triangles=indices(mesh.triangles),lines=indices(mesh.lines),points=indices(mesh.points),route=indices(mesh.route)
  const uniforms=Object.fromEntries(['uMatrix','uModel','uTime','uKind','uEnergy','uPointSize','uStyle'].map(name=>[name,gl.getUniformLocation(program,name)]))
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(.0196,.0196,.0196,1)
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,visible=false,dirty=true,dragging=false,lastX=0,lastY=0,startX=0,startY=0,touchMode:'pending'|'rotate'|'scroll'='pending',clock=0,lastTime=0
  let x=orientation.current?.x??(kind==='space'?-.38:.12),y=orientation.current?.y??(kind==='space'?-.6:0),tx=x,ty=y,width=1,height=1,dpr=1
  if(kind==='route'){const centre=normalize(add(cityVector(from),cityVector(to)));y=-Math.atan2(centre[0],centre[2]);x=Math.asin(centre[1]);tx=x;ty=y}
  function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
  function render(time:number){
   frame=0;if(!visible||document.hidden)return
   const dt=lastTime&&time-lastTime<100?Math.min(time-lastTime,32):16.67;lastTime=time;if(!reduced.matches)clock+=dt/1000
   if(dirty){const bounds=canvas!.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);dpr=Math.min(devicePixelRatio,1.8);canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);gl!.viewport(0,0,canvas!.width,canvas!.height);dirty=false}
   const ease=reduced.matches?1:1-Math.exp(-dt/70);x+=(tx-x)*ease;y+=(ty-y)*ease;orientation.current={x,y}
   const model=modelMatrix(x,y),view=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-4.65,1]),matrix=multiply(projection(width/height),multiply(view,model)),energy=meter?.current?.read()||0
   gl!.clear(gl!.COLOR_BUFFER_BIT|gl!.DEPTH_BUFFER_BIT);gl!.uniformMatrix4fv(uniforms.uModel,false,model);gl!.uniformMatrix4fv(uniforms.uMatrix,false,matrix);gl!.uniform1f(uniforms.uTime,clock);gl!.uniform1f(uniforms.uKind,kind==='sound'?1:kind==='route'?2:0);gl!.uniform1f(uniforms.uEnergy,energy);gl!.uniform1f(uniforms.uPointSize,dpr*(kind==='route'?1.65:1.2))
   function draw(buffer:WebGLBuffer|null,count:number,primitive:number,style:number){if(!buffer||!count)return;gl!.uniform1f(uniforms.uStyle,style);gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER,buffer);gl!.drawElements(primitive,count,gl!.UNSIGNED_SHORT,0)}
   if(kind==='space'&&!wire){gl!.enable(gl!.POLYGON_OFFSET_FILL);gl!.polygonOffset(1,1);draw(triangles,mesh.triangles.length,gl!.TRIANGLES,0);gl!.disable(gl!.POLYGON_OFFSET_FILL)}
   if(kind==='space'&&wire||kind==='sound'||kind==='route')draw(lines,mesh.lines.length,gl!.LINES,1)
   if(kind==='route'){draw(points,mesh.points.length,gl!.POINTS,2);draw(route,mesh.route.length,gl!.LINES,3);gl!.uniform1f(uniforms.uPointSize,dpr*4.5);gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER,route);gl!.drawElements(gl!.POINTS,1,gl!.UNSIGNED_SHORT,Math.floor((clock*.12%1)*140)*4)}
   canvas!.dataset.renderer='webgl';canvas!.dataset.vertices=String(mesh.positions.length/3)
   if(!reduced.matches&&kind!=='space'||Math.abs(tx-x)+Math.abs(ty-y)>.001)wake()
  }
  function down(event:PointerEvent){dragging=true;lastX=startX=event.clientX;lastY=startY=event.clientY;touchMode='pending';canvas!.setPointerCapture(event.pointerId)}
  function move(event:PointerEvent){if(dragging){if(event.pointerType!=='mouse'){if(touchMode==='pending'){const dx=Math.abs(event.clientX-startX),dy=Math.abs(event.clientY-startY);if(Math.max(dx,dy)<6)return;touchMode=dx>dy?'rotate':'scroll'}if(touchMode==='scroll')return}ty+=(event.clientX-lastX)*.008;tx=clamp(tx+(event.clientY-lastY)*.008,-1.3,1.3);lastX=event.clientX;lastY=event.clientY}else if(event.pointerType==='mouse'&&kind!=='route'){const box=canvas!.getBoundingClientRect();ty=-.6+(event.clientX-box.left)/box.width*.75;tx=-.3+((event.clientY-box.top)/box.height-.5)*.4}else return;wake()}
  function stop(){dragging=false}
  function resize(){dirty=true;wake()}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0}else wake()}
  function lost(event:Event){event.preventDefault();cancelAnimationFrame(frame);frame=0;canvas!.dataset.renderer='recovering'}
  function restored(){setRevision(value=>value+1)}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){dirty=true;lastTime=0;wake()}else{cancelAnimationFrame(frame);frame=0;lastTime=0}},{threshold:.01}),resizer=new ResizeObserver(resize)
  observer.observe(canvas);resizer.observe(canvas);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',resize)
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',stop);canvas.removeEventListener('pointercancel',stop);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',resize);buffers.forEach(buffer=>gl.deleteBuffer(buffer));shaders.forEach(shader=>gl.deleteShader(shader));gl.deleteProgram(program)}
 },[kind,variant,wire,from,to,meter,revision])
 return <canvas ref={ref} className={s.spatialCanvas} aria-label={kind==='space'?'Interactive three-dimensional form. Drag to rotate.':kind==='sound'?'A moving sound sculpture. Drag to change its perspective.':'Interactive globe with the selected route. Drag to rotate.'} role="img"/>
}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
