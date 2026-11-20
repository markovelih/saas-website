import 'server-only'
/** Copy this module into the client project. Never import it from a Client Component. */
export async function reportKoryx(input:{kind:'page_view'|'request';status?:number;duration_ms?:number;id?:string;country?:string}){
 const key=process.env.KORYX_TELEMETRY_KEY
 if(!key)return false
 try{const response=await fetch('https://koryx.ca/api/telemetry',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({id:input.id||crypto.randomUUID(),kind:input.kind,country:/^[A-Z]{2}$/.test(input.country||'')?input.country:'ZZ',status:input.status||200,duration_ms:Math.min(120000,Math.max(0,Math.round(input.duration_ms||0)))}),signal:AbortSignal.timeout(1500),cache:'no-store'});return response.ok}catch{return false}
}

// Only trust geography inserted by the hosting platform; never accept a country in a public request body.
export function koryxCountry(request:Request){return process.env.VERCEL==='1'?(request.headers.get('x-vercel-ip-country')||'ZZ').toUpperCase():'ZZ'}
