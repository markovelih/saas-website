import {stripeClient} from '@/lib/payments/server'
import {handleStripeEvent} from '@/lib/payments/webhook'
export const runtime='nodejs'
export const maxDuration=60
export async function POST(request:Request){
 const signature=request.headers.get('stripe-signature'),secret=process.env.STRIPE_WEBHOOK_SECRET
 if(!signature||!secret)return new Response('Webhook not configured',{status:400})
 let event;try{event=stripeClient().webhooks.constructEvent(await request.text(),signature,secret)}catch{return new Response('Invalid signature',{status:400})}
 try{await handleStripeEvent(event);return Response.json({received:true})}catch{return new Response('Payment confirmation will be retried',{status:500})}
}
