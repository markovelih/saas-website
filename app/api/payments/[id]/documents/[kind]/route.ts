import {createClient} from '@/lib/supabase/server'
import {billingPdf} from '@/lib/billing/pdf'
import {z} from 'zod'
export const runtime='nodejs'
export async function GET(_request:Request,{params}:{params:Promise<{id:string;kind:string}>}){
 const {id,kind}=await params;if(!z.string().uuid().safeParse(id).success||!['invoice','receipt'].includes(kind))return new Response('Not found',{status:404})
 const db=await createClient(),{data:{user}}=await db.auth.getUser();if(!user)return new Response('Sign in to view your document',{status:401})
 // Owner/founder RLS controls both ledger tables; no service-role bypass for document reads.
 const {data:t}=await db.from('payment_transactions').select('snapshot').eq('id',id).maybeSingle()
 let snapshot=t?.snapshot;if(!snapshot&&kind==='invoice'){const {data:r}=await db.from('payment_requests').select('snapshot').eq('id',id).maybeSingle();snapshot=r?.snapshot}
 if(!snapshot||(kind==='receipt'&&snapshot.settled===false))return new Response('Not found',{status:404})
 const pdf=await billingPdf(snapshot,kind as 'invoice'|'receipt'),number=kind==='invoice'?snapshot.invoice_number:snapshot.receipt_number
 return new Response(new Uint8Array(pdf),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="Koryx-${kind}-${number.replace(/[^A-Za-z0-9-]/g,'')}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})
}
