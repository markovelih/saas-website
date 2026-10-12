import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Estimate, PlannerInput } from './catalog'
function secret(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Server estimate signing is unavailable');return key}
export function signEstimate(userId:string,input:PlannerInput,estimate:Estimate){
 const payload=Buffer.from(JSON.stringify({userId,input,estimate,expires:Date.now()+60*60*1000})).toString('base64url')
 return payload+'.'+createHmac('sha256',secret()).update(payload).digest('base64url')
}
export function verifyEstimate(token:string,userId:string,input:PlannerInput):Estimate|null{
 try{const [payload,signature]=token.split('.');if(!payload||!signature)return null
 const expected=createHmac('sha256',secret()).update(payload).digest();const received=Buffer.from(signature,'base64url');if(expected.length!==received.length||!timingSafeEqual(expected,received))return null
 const data=JSON.parse(Buffer.from(payload,'base64url').toString());if(data.userId!==userId||data.expires<Date.now()||JSON.stringify(data.input)!==JSON.stringify(input))return null
 return data.estimate}catch{return null}
}
