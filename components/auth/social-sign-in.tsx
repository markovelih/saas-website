'use client'

import { createContext, Suspense, useActionState, useContext, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { startSocialSignIn } from '@/app/(auth)/social-actions'
import type { SocialProviders } from '@/lib/auth/destination'

const Providers = createContext<SocialProviders>({ google: false })
export function SocialAuthProvider({ providers, children }: { providers: SocialProviders; children: ReactNode }) {
  return <Providers.Provider value={providers}>{children}</Providers.Provider>
}

function GoogleIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59A5.99 5.99 0 0 1 12 5.96Z"/></svg>
}

export function SocialSignIn({ registration = false }: { registration?: boolean }) {
  return <Suspense fallback={null}><SocialSignInContent registration={registration} /></Suspense>
}

function SocialSignInContent({ registration }: { registration: boolean }) {
  const providers = useContext(Providers)
  const [state, action, pending] = useActionState(startSocialSignIn, { error: '' })
  const query = useSearchParams()
  const destination = query.get('redirect') || '/dashboard'
  const callbackError = query.get('auth_error') === 'oauth'
  const available = providers.google
  return <>
    {callbackError && <p role="alert" className="mb-5 text-sm leading-6 text-destructive">Sign-in was cancelled or the link expired. Please try again, or continue with email.</p>}
    {available && <div className="mt-4 border-t border-border pt-4">
      <form action={action} className="grid gap-3" aria-label="Sign in with your existing account">
        <input type="hidden" name="redirect" value={destination} />
        <button name="provider" value="google" disabled={pending} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-[#0a0a0a] text-base font-medium text-[#ededed] transition-colors hover:bg-[#141414] disabled:opacity-60">
          {pending ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>
      </form>
      {state.error && <p role="alert" className="mt-3 text-sm leading-6 text-destructive">{state.error}</p>}
      {registration && <p className="mt-3 text-xs leading-5 text-muted-foreground">Continuing creates your Koryx account if needed. You agree to our <Link className="underline" href="/terms">Terms</Link> and acknowledge our <Link className="underline" href="/privacy">Privacy Policy</Link>.</p>}
    </div>}
  </>
}
