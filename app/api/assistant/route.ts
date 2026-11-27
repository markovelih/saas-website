import {streamText,toUIMessageStream,createUIMessageStreamResponse} from 'ai'
import {createClient} from '@supabase/supabase-js'
import {createHmac} from 'node:crypto'
import {assistantRequest} from '@/lib/ai/conversation'
import {koryxAiSystem} from '@/lib/ai/koryx-knowledge'
import {readBoundedBody,BodyError} from '@/lib/security/request-body'
import type {Database} from '@/lib/supabase/types'
export const maxDuration=30
const privateHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}
const fail=(error:string,status:number)=>Response.json({error},{status,headers:privateHeaders})
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return fail('Please open Ask AI on Koryx to continue.',403)
 if(!request.headers.get('content-type')?.startsWith('application/json'))return fail('Send a text message to continue.',415)
 let input
 try{input=assistantRequest.safeParse(JSON.parse((await readBoundedBody(request,64000)).toString('utf8')))}catch(error){return fail('That message is too long or could not be read.',error instanceof BodyError?error.status:400)}
 if(!input.success)return fail('Write a message of up to 5,000 characters.',400)
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL
 if(!key||!url||!(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN))return fail('Koryx AI is taking a short break. Please try again soon.',503)
 const db=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
 const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'
 const hash=(scope:string)=>createHmac('sha256',key).update('public-assistant/'+scope).digest('hex')
 try{
  const checks=await Promise.all([
   db.rpc('koryx_auth_email_limit',{p_key:hash('short/'+ip),p_limit:20,p_seconds:600}),
   db.rpc('koryx_auth_email_limit',{p_key:hash('day/'+ip),p_limit:80,p_seconds:86400}),
  ])
  if(checks.some(result=>result.error))return fail('Koryx AI is temporarily unavailable. Please try again soon.',503)
  if(checks.some(result=>!result.data))return fail('A quick breather 🙂 Please try again later, or reach us at support@koryx.ca.',429)
  const daily=await db.rpc('koryx_auth_email_limit',{p_key:hash('daily-total'),p_limit:1000,p_seconds:86400})
  if(daily.error||!daily.data)return fail('Koryx AI is busy today. Please try again later or contact support@koryx.ca.',503)
  const result=streamText({model:process.env.KORYX_CHAT_MODEL||'openai/gpt-4o-mini',instructions:koryxAiSystem('chat'),messages:input.data.messages,maxOutputTokens:1400,maxRetries:0,abortSignal:AbortSignal.any([request.signal,AbortSignal.timeout(25000)]),onError:()=>{}})
  return createUIMessageStreamResponse({headers:privateHeaders,stream:toUIMessageStream({stream:result.stream,sendReasoning:false,sendSources:false,onError:()=> 'Koryx AI could not finish that answer. Please try again.'})})
 }catch{return fail('Koryx AI could not finish. Please try again soon.',503)}
}
