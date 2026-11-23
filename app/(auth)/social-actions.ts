'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AUTH_ORIGIN, authDestination, isSocialProvider } from '@/lib/auth/destination'
import { socialProviders } from '@/lib/auth/social-providers'

export async function startSocialSignIn(_previous: { error: string }, formData: FormData): Promise<{ error: string }> {
  const provider = formData.get('provider')
  if (!isSocialProvider(provider)) return { error: 'Please choose Google.' }
  const enabled = await socialProviders()
  if (!enabled[provider]) return { error: 'This sign-in option is not available yet. Please use email.' }
  const next = authDestination(formData.get('redirect'))
  const callback = new URL('/auth/callback', AUTH_ORIGIN)
  callback.searchParams.set('next', next)
  let destination: string | undefined
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    })
    if (error || !data.url) return { error: 'We could not connect. Please try again or sign in with email.' }
    destination = data.url
  } catch { return { error: 'Connection interrupted. Please try again.' } }
  redirect(destination)
}
