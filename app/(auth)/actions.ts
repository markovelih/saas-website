'use server'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
 try { const url=new URL(raw,'https://koryx.ca');if(url.origin==='https://koryx.ca'&&['/dashboard/new-order','/dashboard/orders'].includes(url.pathname))return url.pathname+url.search } catch {}
 return '/dashboard'
}

export async function register(formData: FormData) {
  const fullName = String(formData.get('fullName') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const phoneCode = String(formData.get('phoneCode') || '')
  const phone = String(formData.get('phone') || '')
  const country = String(formData.get('country') || '')

  if (!fullName || !email || !password) {
    return { error: 'Please fill in all required fields' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return { error: error.message }
  }

  const user = data.user

  if (!user) {
    return { error: 'User was not created' }
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: fullName,
      email,
      phone_code: phoneCode,
      phone,
      country,
    })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  const destination=safeDestination(String(formData.get('redirect')||'/dashboard/new-order'))
  redirect('/login?redirect='+encodeURIComponent(destination))
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  redirect(safeDestination(String(formData.get('redirect')||'')))
}

export async function logout() {
  const supabase = await createSupabaseClient()
  await supabase.auth.signOut()

  redirect('/login')
}
