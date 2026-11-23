import 'server-only'
import type { SocialProviders } from './destination'

/** Public Auth settings contain availability, never provider credentials. */
export async function socialProviders(): Promise<SocialProviders> {
  const disabled = { google: false }
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!origin || !key) return disabled
  try {
    const response = await fetch(`${origin}/auth/v1/settings`, {
      headers: { apikey: key }, next: { revalidate: 60 }, signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) return disabled
    const settings = await response.json()
    return { google: settings?.external?.google === true }
  } catch { return disabled }
}
