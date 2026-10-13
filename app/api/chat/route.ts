import {generateText} from 'ai'
import {z} from 'zod'
import {createClient} from '@/lib/supabase/server'
import {koryxAiSystem} from '@/lib/ai/koryx-knowledge'
export const maxDuration=30
const requests=new Map<string,number>()
const schema=z.object({mode:z.enum(['chat','brief']).default('chat'),messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().trim().min(1).max(5000)})).min(1).max(10)})
export async function POST(request:Request){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)return Response.json({error:'Sign in to ask Koryx AI.'},{status:401});let input;try{const raw=await request.text();if(raw.length>18000)throw new Error();input=schema.safeParse(JSON.parse(raw))}catch{return Response.json({error:'Your message is too long.'},{status:400})}if(!input.success)return Response.json({error:'Enter a message of up to 5,000 characters.'},{status:400});if(!process.env.AI_GATEWAY_API_KEY)return Response.json({error:'AI is temporarily unavailable.'},{status:503});if(Date.now()-(requests.get(user.id)||0)<6000)return Response.json({error:'Wait a few seconds before your next question.'},{status:429});if(requests.size>1000)requests.clear();requests.set(user.id,Date.now());
 try{const result=await generateText({model:process.env.KORYX_CHAT_MODEL||'openai/gpt-4o-mini',messages:input.data.messages,system:koryxAiSystem(input.data.mode),maxOutputTokens:1400,maxRetries:0,abortSignal:AbortSignal.timeout(22000)});return Response.json({reply:result.text},{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({error:'AI could not finish. Please try again shortly.'},{status:503})}}
