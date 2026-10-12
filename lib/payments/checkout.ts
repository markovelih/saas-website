import type Stripe from 'stripe'
import {SITE} from './server'
// Tax collection is disabled until the merchant registers and the ledger supports
// exclusive tax separately from the agreed project price. Never infer liability
// or fabricate rates from the customer's country.
export function embeddedOptions(returnPath:string):Pick<Stripe.Checkout.SessionCreateParams,'ui_mode'|'return_url'|'redirect_on_completion'|'billing_address_collection'|'automatic_tax'|'allowed_payment_method_types'|'branding_settings'>{
 return {ui_mode:'embedded_page',return_url:SITE+returnPath,redirect_on_completion:'if_required',billing_address_collection:'required',automatic_tax:{enabled:false},allowed_payment_method_types:['card'],branding_settings:{display_name:'Koryx',background_color:'#ffffff',button_color:'#171717',border_style:'rounded',font_family:'inter'}}
}
export async function resumeEmbeddedSession(stripe:Stripe,sessionId:string){
 const session=await stripe.checkout.sessions.retrieve(sessionId)
 if(session.status==='complete')throw new Error('Your payment is being confirmed. Refresh shortly.')
 if(session.status==='open'&&session.ui_mode==='embedded_page'&&session.client_secret)return session.client_secret
 // Safely retire an old hosted checkout before creating its in-site replacement.
 if(session.status==='open')await stripe.checkout.sessions.expire(session.id)
 return null
}
export function checkoutCustomer(details:Stripe.Checkout.Session.CustomerDetails|null){
 const a=details?.address
 return {...(details?.name?{name:details.name.slice(0,100)}:{}),...(a?{address:[a.line1,a.line2,a.city,a.state,a.postal_code,a.country].filter(Boolean).join(', ').slice(0,500)}:{})}
}
