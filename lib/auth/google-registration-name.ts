import type { User } from '@supabase/supabase-js'

/** The provider's display name, never a name guessed from the email address. */
export function googleRegistrationName(user: Pick<User, 'app_metadata' | 'identities'>): string | null {
  if (user.app_metadata?.provider !== 'google') return null
  const identity = user.identities?.find(item => item.provider === 'google')?.identity_data
  if (!identity) return null
  const clean = (value: unknown) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  return clean(identity.full_name) || clean(identity.name) || [clean(identity.given_name), clean(identity.family_name)].filter(Boolean).join(' ') || null
}
