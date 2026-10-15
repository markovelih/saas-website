import {createClient} from '@/lib/supabase/server'
import {documentResponse} from '@/lib/billing/document-response'
import {z} from 'zod'
import {NextResponse} from 'next/server'
export const runtime='nodejs'
export async function GET(request:Request,{params}:{params:Promise<{id:string;kind:string}>}){const {id,kind}=await params;if(!z.string().uuid().safeParse(id).success||!['invoice','receipt'].includes(kind))return new Response('Not found',{status:404});const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.redirect(new URL('/login?redirect='+encodeURIComponent('/dashboard/orders/'+id),request.url));const {data:p}=await db.from('project_payments').select('id,order_id,user_id,snapshot,created_at').eq('order_id',id).maybeSingle();let snapshot=p?.snapshot;if(!snapshot&&kind==='invoice'){const {data:i}=await db.from('project_invoices').select('snapshot').eq('order_id',id).order('created_at',{ascending:false}).limit(1).maybeSingle();snapshot=i?.snapshot}if(!snapshot)return new Response('Not found',{status:404});return documentResponse(request,snapshot,kind as 'invoice'|'receipt')}
