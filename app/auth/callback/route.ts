import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AUTH_ORIGIN, authDestination } from '@/lib/auth/destination'
import { isFounder } from '@/lib/workspace'
import { googleRegistrationName } from '@/lib/auth/google-registration-name'

function finish(path: string) {
  const response = NextResponse.redirect(new URL(path, AUTH_ORIGIN), 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = authDestination(url.searchParams.get('next'))
  const failed = `/login?auth_error=oauth&redirect=${encodeURIComponent(next)}`
  const code = url.searchParams.get('code')
  if (url.searchParams.has('error') || !code) return finish(failed)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const fullName = googleRegistrationName(data.user)
      if (fullName) {
        // The signup trigger normally copies full_name. Also support Google's
        // newer `name` claim, without replacing a name edited in account settings.
        try {
          const { data: profile, error: readError } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).maybeSingle()
          if (!readError && profile && !profile.full_name?.trim()) {
            const { error: nameError } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id)
            if (nameError) console.warn('Google profile name initialization failed')
          }
        } catch { console.warn('Google profile name initialization failed') }
      }
      return finish(isFounder(data.user.id) ? '/dashboard/admin' : next)
    }
  } catch { /* Never expose provider errors, codes, or tokens to the page. */ }
  return finish(failed)
}
