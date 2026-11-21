import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {createHmac,timingSafeEqual} from 'node:crypto'
import {partsOf} from './protocol.mjs'

const headers={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Type':'application/json; charset=utf-8'}
export function requestSignature(key,method,url,time,nonce){const u=new URL(url);return createHmac('sha256',key).update([method,u.pathname,u.search,time,nonce].join('\n')).digest('hex')}
export function authorized(request,key,now=Date.now()){
 if(!key||key.length<32)return false
 const time=request.headers.get('x-koryx-time')||'',nonce=request.headers.get('x-koryx-nonce')||'',signature=request.headers.get('x-koryx-signature')||''
 if(!/^\d{13}$/.test(time)||Math.abs(now-Number(time))>60000||!/^[a-f0-9-]{36}$/.test(nonce)||!/^[a-f0-9]{64}$/.test(signature))return false
 return timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(requestSignature(key,request.method,request.url,time,nonce),'hex'))
}
export function createRelay({load,key=()=>process.env.KORYX_SOURCE_RELAY_KEY,now=()=>Date.now()}){return async function GET(request){
 const secret=key();if(!authorized(request,secret,now()))return new Response('{"error":"Unauthorized"}',{status:401,headers})
 let snapshot;try{snapshot=await load()}catch{return new Response('{"error":"Source unavailable"}',{status:503,headers})}
 if(!snapshot||snapshot.unavailable)return new Response('{"error":"Source unavailable"}',{status:503,headers})
 const url=new URL(request.url),parts=partsOf(snapshot.files),part=url.searchParams.get('part');let payload
 if(part===null){payload={protocol:1,version:snapshot.version,commit:snapshot.commit,excluded_count:snapshot.excluded_count,parts:parts.length,files:snapshot.files.map(({path,size,sha256,mime})=>({path,size,sha256,mime}))}}
 else{if(url.searchParams.get('version')!==snapshot.version)return new Response('{"error":"Version changed"}',{status:409,headers});if(!/^(0|[1-9]\d{0,3})$/.test(part)||Number(part)>=parts.length)return new Response('{"error":"Part not found"}',{status:404,headers});payload={protocol:1,version:snapshot.version,part:Number(part),files:parts[Number(part)]}}
 const body=JSON.stringify(payload),signature=createHmac('sha256',secret).update(request.headers.get('x-koryx-nonce')+'\n'+body).digest('hex')
 return new Response(body,{headers:{...headers,'X-Koryx-Response-Signature':signature}})
}}
let snapshot
export const GET=createRelay({load:async()=>snapshot||(snapshot=JSON.parse(await readFile(join(process.cwd(),'.koryx-source','snapshot.json'),'utf8')))})
