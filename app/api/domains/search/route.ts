import {createClient} from '@/lib/supabase/server'
import {hostnameSchema} from '@/lib/billing/schema'
import {searchDomains} from '@/lib/domains/search'
const recent=new Map<string,number>()
export async function POST(request:Request){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)return Response.json({error:'Sign in to find a domain.'},{status:401});let raw;try{const text=await request.text();if(text.length>2000)throw new Error();raw=JSON.parse(text)}catch{return Response.json({error:'Enter a domain or short business name.'},{status:400})}
 const term=String(raw.query||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,'');const stem=term.replace(/\s+/g,'-');const domains=stem.includes('.')?[stem]:['.ca','.com','.net','.io','.app','.dev'].map(t=>stem+t)
 if(domains.some(x=>!hostnameSchema.safeParse(x).success))return Response.json({error:'Use letters, numbers and hyphens, such as yourbusiness.ca.'},{status:400})
 if(Date.now()-(recent.get(user.id)||0)<4000)return Response.json({error:'Please wait a moment between searches.'},{status:429});if(recent.size>1000)recent.clear();recent.set(user.id,Date.now())
 try{return Response.json({results:await searchDomains(domains,user.id)},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'Search unavailable.'},{status:503})}
}
