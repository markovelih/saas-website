import 'server-only'
import Stripe from 'stripe'
import {createClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
export function paymentDb(){return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})}
export function stripeClient(){if(!process.env.STRIPE_SECRET_KEY)throw new Error('Card payments are not configured yet.');return new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2,timeout:12000})}
export const stripeReady=()=>Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET)
export const SITE='https://koryx.ca'
