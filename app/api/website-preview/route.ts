import {createClient} from '@/lib/supabase/server'
import {isFounder} from '@/lib/workspace'
import {captureHomepage} from '@/lib/previews/capture'
export const runtime='nodejs'
export const maxDuration=60
export async function POST(request:Request){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user||!isFounder(user.id))return new Response('Forbidden',{status:403});if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});let data;try{const raw=await request.text();if(raw.length>1000)throw new Error();data=JSON.parse(raw)}catch{return Response.json({error:'Enter a website domain.'},{status:400})}try{const bytes=await captureHomepage(String(data.url||''));return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'The homepage could not be loaded.'},{status:400})}}
