import 'server-only'
import {z,ZodError} from 'zod'
import {createClient} from '@/lib/supabase/server'
import {paymentDb} from '@/lib/payments/server'
import {isFounder} from '@/lib/workspace'
import {readBoundedBody,BodyError} from '@/lib/security/request-body'
export class ProjectError extends Error{constructor(message:string,public status=400){super(message)}}
export const bucket='project-private'
export const privateHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}
export async function projectSession(){const sessionDb=await createClient(),{data:{user}}=await sessionDb.auth.getUser();if(!user)throw new ProjectError('Please sign in.',401);return {user,founder:isFounder(user.id),db:paymentDb()}}
export async function projectAccess(id:string,founderOnly=false){z.string().uuid().parse(id);const session=await projectSession();if(founderOnly&&!session.founder)throw new ProjectError('Access denied.',403);const {data:order,error}=await session.db.from('orders').select('id,user_id,business_name,purchase_mode,delivery').eq('id',id).single();if(error||!order||(!session.founder&&order.user_id!==session.user.id))throw new ProjectError('Project not found.',404);return {...session,order}}
export async function sourceAccess(id:string){const session=await projectAccess(id);const {data,error}=await session.db.rpc('koryx_source_entitled',{p_order_id:id});if(error)throw new ProjectError('Source files are temporarily unavailable.',503);if(!data)throw new ProjectError('Source files are available after full payment for a buyout project.',403);return session}
export async function projectResponse(request:Request,fn:()=>Promise<Response>){try{if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==new URL(request.url).origin)throw new ProjectError('Reload this page before trying again.',403);return await fn()}catch(e){return Response.json({error:e instanceof ProjectError?e.message:e instanceof ZodError?'Check the submitted details.':'The project service is temporarily unavailable. Please retry.'},{status:e instanceof ProjectError?e.status:e instanceof ZodError?400:503,headers:privateHeaders})}}
export async function privateBucket(db:ReturnType<typeof paymentDb>){const {data,error}=await db.storage.getBucket(bucket);if(error||!data||data.public)throw new ProjectError('Private project storage is not ready.',503)}
export async function limitedBody(request:Request,max:number){try{return await readBoundedBody(request,max)}catch(error){if(error instanceof BodyError)throw new ProjectError(error.message,error.status);throw error}}
export async function projectJson(request:Request){try{return JSON.parse((await limitedBody(request,16000)).toString('utf8'))}catch(e){if(e instanceof ProjectError)throw e;throw new ProjectError('Invalid request.')}}
