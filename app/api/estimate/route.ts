import { generateText, Output } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { plannerSchema } from '@/lib/project-planner/schema'
import { buildEstimate, featureCatalog, normalizeFeatures } from '@/lib/project-planner/catalog'
import { signEstimate } from '@/lib/project-planner/signature'
import { koryxAiSystem } from '@/lib/ai/koryx-knowledge'
export const maxDuration=30
const recentRequests=new Map<string,number>()
export async function POST(req:Request){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser()
 if(!user)return Response.json({error:'Sign in to use the AI project planner.'},{status:401})
 if(Number(req.headers.get('content-length')||0)>16000)return Response.json({error:'Brief is too long.'},{status:413})
 let raw:string;try{raw=await req.text();if(raw.length>16000)throw new Error()}catch{return Response.json({error:'Brief is too long.'},{status:413})}
 let parsed;try{parsed=plannerSchema.safeParse(JSON.parse(raw))}catch{return Response.json({error:'Invalid project details.'},{status:400})}
 if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400})
 const input={...parsed.data,features:normalizeFeatures(parsed.data.type,parsed.data.features)}
 const now=Date.now();if(now-(recentRequests.get(user.id)||0)<15000)return Response.json({error:'Wait a few seconds before requesting another review.'},{status:429})
 if(recentRequests.size>1000)for(const [id,time] of recentRequests)if(now-time>60000)recentRequests.delete(id)
 recentRequests.set(user.id,now)
 if(!process.env.AI_GATEWAY_API_KEY)return Response.json({error:'AI review is unavailable right now. Your itemised estimate still works.'},{status:503})
 try{
  const {output}=await generateText({model:process.env.KORYX_ESTIMATE_MODEL||'openai/gpt-4o-mini',maxRetries:0,maxOutputTokens:1600,abortSignal:AbortSignal.timeout(22000),
   output:Output.object({schema:z.object({summary:z.string().max(800),complexity:z.enum(['standard','complex']),questions:z.array(z.string().max(200)).max(3),recommendedFeatures:z.array(z.string()).max(10),deferred:z.array(z.string().max(200)).max(4)})}),
   system:koryxAiSystem('scope'),
   prompt:JSON.stringify({project:input,calculator:buildEstimate(input),catalogue:featureCatalog})})
  if(!output)throw new Error('No output')
  const estimate={...buildEstimate(input,output.complexity),source:'ai' as const,summary:output.summary,questions:output.questions,deferred:output.deferred.map(item=>featureCatalog.find(feature=>feature.id===item.trim())?.title||item)}
  const recommendedFeatures=output.recommendedFeatures.filter(id=>featureCatalog.some(f=>f.id===id))
  return Response.json({estimate,recommendedFeatures,token:signEstimate(user.id,input,estimate)},{headers:{'Cache-Control':'no-store'}})
 }catch(error){
  const failure=error as {name?:string;statusCode?:number;message?:string}
  console.warn('Koryx estimate provider failure',{name:failure.name,status:failure.statusCode,billingRelated:/paid|payment|purchas|billing|credit/i.test(failure.message||''),modelRelated:/model|allowlist/i.test(failure.message||'')})
  return Response.json({error:'AI review could not finish. Try again, or send your brief with the transparent calculator estimate.'},{status:503})}
}
