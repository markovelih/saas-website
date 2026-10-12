import {redirect,notFound} from 'next/navigation'
import Link from 'next/link'
import {z} from 'zod'
import {createClient} from '@/lib/supabase/server'
import {PayInvoice} from '@/components/payments/client-payments'
import {stripeReady} from '@/lib/payments/server'
import s from '@/components/workspace/workspace.module.css'
export default async function PaymentPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{checkout?:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const db=await createClient(),{data:{user}}=await db.auth.getUser();if(!user)redirect('/login?redirect='+encodeURIComponent('/pay/'+id))
 const {data:r}=await db.from('payment_requests').select('*').eq('id',id).eq('user_id',user.id).single();if(!r)notFound();const query=await searchParams
 return <main className={`${s.shell} !max-w-2xl mx-auto px-5 py-16`}><Link className="text-xs text-white/50" href="/">Koryx / Secure payment</Link><section className={`${s.panel} mt-6`}>{query.checkout==='success'&&r.status==='open'&&<p role="status" className={`${s.message} mb-5`}>Your payment is being confirmed. Refresh shortly; a receipt will arrive by email after confirmation.</p>}<PayInvoice request={r} configured={stripeReady()}/></section></main>
}
