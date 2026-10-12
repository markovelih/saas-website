'use server'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies,headers } from 'next/headers'
import {createHmac} from 'node:crypto'
import {sendMail} from '@/lib/billing/mail'
import {brandedEmail,escapeHtml} from '@/lib/billing/email'
import { redirect } from 'next/navigation'
import {isFounder} from '@/lib/workspace'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}


function safeDestination(raw:string){
 try { const url=new URL(raw,'https://koryx.ca');if(url.origin==='https://koryx.ca'&&(['/dashboard/new-order','/dashboard/orders','/dashboard/ai','/dashboard/renewals'].includes(url.pathname)||/^\/dashboard\/orders\/[a-f0-9-]{36}$/.test(url.pathname)||/^\/pay\/[a-f0-9-]{36}$/.test(url.pathname)))return url.pathname+url.search } catch {}
 return '/dashboard'
}

export async function register(formData:FormData):Promise<{error?:string;confirmation?:boolean;email?:string}>{
 const fullName=String(formData.get('fullName')||'').trim(),email=String(formData.get('email')||'').trim().toLowerCase(),password=String(formData.get('password')||'')
 if(fullName.length<2||fullName.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||password.length<8||password.length>128)return {error:'Enter your name, a valid email and a password of 8–128 characters.'}
 if(!process.env.RESEND_API_KEY)return {error:'Registration email is temporarily unavailable. Please try again later.'}
 const requestHeaders=await headers(),ip=requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';const hash=(v:string)=>createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update('signup/'+v).digest('hex')
 const [ipLimit,emailLimit]=await Promise.all([supabaseAdmin.rpc('koryx_auth_email_limit',{p_key:hash(ip),p_limit:10,p_seconds:3600}),supabaseAdmin.rpc('koryx_auth_email_limit',{p_key:hash(email),p_limit:3,p_seconds:900})]);if(ipLimit.error||emailLimit.error||!ipLimit.data||!emailLimit.data)return {error:'Please wait before requesting another confirmation email.'}
 const {data,error}=await supabaseAdmin.auth.admin.generateLink({type:'signup',email,password,options:{data:{full_name:fullName}}})
 if(error||!data.user||!data.properties?.email_otp)return {error:'This email could not be registered. If you already have an account, sign in or use the confirmation code you received.'}
 const otp=data.properties.email_otp
 const {error:profileError}=await supabaseAdmin.from('profiles').update({full_name:fullName,email,phone_code:String(formData.get('phoneCode')||'').slice(0,8),phone:String(formData.get('phone')||'').slice(0,20),country:String(formData.get('country')||'').slice(0,80)}).eq('id',data.user.id)
 if(profileError)return {error:'Your account details could not be saved. Please contact support@koryx.ca.'}
 const html=brandedEmail(`<h1 style="font-size:28px;margin-top:32px">Welcome to Koryx.</h1><p>Hi ${escapeHtml(fullName)}, confirm your email to open your client workspace.</p><p style="color:#666">Enter this confirmation code on the registration page:</p><p style="font-size:34px;letter-spacing:6px;font-weight:bold;padding:22px;background:#f0f0f2;border-radius:12px;color:#111">${escapeHtml(otp)}</p><p style="font-size:13px;color:#666">The code expires according to your account security settings and can be used once. If you did not request a Koryx account, you can ignore this email.</p>`)
 const result=await sendMail({to_address:email,from_address:'support@koryx.ca',subject:'Confirm your Koryx account',html,snapshot:null,documents:'none'},'koryx-signup/'+hash(data.properties.hashed_token))
 if(result.error)return {confirmation:true,email,error:'The email request was not confirmed. Check your inbox for the code, or wait and request another one.'}
 return {confirmation:true,email}
}
export async function verifyRegistration(formData:FormData){
 const email=String(formData.get('email')||'').trim().toLowerCase(),token=String(formData.get('token')||'').trim();if(!/^\d{6,8}$/.test(token))return {error:'Enter the confirmation code from your email.'}
 const supabase=await createSupabaseClient();const {data,error}=await supabase.auth.verifyOtp({email,token,type:'email'});if(error||!data.user)return {error:'The code is invalid or expired. Please check it or request another code.'}
 redirect(isFounder(data.user.id)?'/dashboard/admin':safeDestination(String(formData.get('redirect')||'/dashboard/new-order')))
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  if(data.user&&isFounder(data.user.id))redirect('/dashboard/admin')
  redirect(safeDestination(String(formData.get('redirect')||'')))
}

export async function logout() {
  const supabase = await createSupabaseClient()
  await supabase.auth.signOut()

  redirect('/login')
}
