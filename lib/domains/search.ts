import 'server-only'
import {createHmac,timingSafeEqual} from 'node:crypto'
import {domainRetail} from '@/lib/billing/pricing'
export type DomainQuote={hostname:string;available:boolean;price:number|null;renewal_price:number|null;currency:'CAD';premium?:boolean;token?:string}
export async function searchDomains(domains:string[],userId:string):Promise<DomainQuote[]>{
 const [lookup,fx]=await Promise.all([
  fetch('https://api.vercel.com/v1/registrar/domains/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domains}),signal:AbortSignal.timeout(12000)}),
  fetch('https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1',{next:{revalidate:21600},signal:AbortSignal.timeout(8000)})
 ])
 if(!lookup.ok||!fx.ok)throw new Error('Domain search is temporarily unavailable. Please retry.')
 const data=await lookup.json(),rates=await fx.json();const observation=rates.observations?.at(-1);const rate=Number(observation?.FXUSDCAD?.v)
 if(!Number.isFinite(rate)||rate<.5||rate>3||Date.now()-Date.parse(observation.d)>10*86400000)throw new Error('Current CAD prices could not be verified. Please retry later.')
 return domains.map(hostname=>{const found=data.results?.find((r:{domain:string})=>r.domain===hostname);if(!found||typeof found.available!=='boolean')throw new Error('Incomplete domain availability response.')
  const price=found.available&&Number.isFinite(found.price)?domainRetail(found.price*rate):null,renewal=found.available&&Number.isFinite(found.renewalPrice)?domainRetail(found.renewalPrice*rate):null
  const quote:DomainQuote={hostname,available:found.available,price,renewal_price:renewal,currency:'CAD',premium:Boolean(found.premium)}
  if(quote.available&&price!==null){const payload=Buffer.from(JSON.stringify({userId,hostname,price,renewal_price:renewal,expires:Date.now()+3600000})).toString('base64url');quote.token=payload+'.'+createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update('domain/'+payload).digest('base64url')}
  return quote
 })
}
export function verifyDomainQuote(token:string,userId:string){try{const [payload,sig]=token.split('.');const expected=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update('domain/'+payload).digest();const got=Buffer.from(sig,'base64url');if(got.length!==expected.length||!timingSafeEqual(expected,got))return null;const data=JSON.parse(Buffer.from(payload,'base64url').toString());if(data.userId!==userId||data.expires<Date.now())return null;return {hostname:String(data.hostname),price:Number(data.price),renewal_price:data.renewal_price===null?null:Number(data.renewal_price)}}catch{return null}}
