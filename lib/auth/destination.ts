export const AUTH_ORIGIN = 'https://koryx.ca'

/** Only known application destinations may survive the OAuth round trip. */
export function authDestination(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//') || /[\\\r\n]/.test(raw)) return '/dashboard'
  try {
    const url = new URL(raw, AUTH_ORIGIN)
    const paths = ['/dashboard', '/dashboard/new-order', '/dashboard/orders', '/dashboard/ai', '/dashboard/renewals']
    if (url.origin === AUTH_ORIGIN && (paths.includes(url.pathname) || /^\/dashboard\/orders\/[a-f0-9-]{36}$/.test(url.pathname) || /^\/pay\/[a-f0-9-]{36}$/.test(url.pathname))) return url.pathname + url.search
  } catch { /* Fall back to the account's own dashboard. */ }
  return '/dashboard'
}

export type SocialProvider = 'google'
export type SocialProviders = Record<SocialProvider, boolean>
export function isSocialProvider(value: unknown): value is SocialProvider {
  return value === 'google'
}
