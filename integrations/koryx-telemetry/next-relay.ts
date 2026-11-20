// Copy to app/api/koryx-activity/route.ts in the CLIENT project.
import {after} from 'next/server'
import {reportKoryx,koryxCountry} from './server' // Adjust this local import after copying.
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response(null,{status:403})
 // This public relay accepts only a small page-view event. It cannot set a project,
 // a key, a request status, arbitrary counts or an external destination.
 const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400});let body='';try{while(true){const {done,value}=await reader.read();if(done)break;body+=new TextDecoder().decode(value);if(body.length>100){await reader.cancel();return new Response(null,{status:400})}}}finally{reader.releaseLock()}
 let id:string;try{const value=JSON.parse(body);if(typeof value.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id))throw new Error();id=value.id}catch{return new Response(null,{status:400})}
 after(()=>reportKoryx({id,kind:'page_view',country:koryxCountry(request)}).then(()=>{}))
 return new Response(null,{status:202,headers:{'Cache-Control':'no-store'}})
}
