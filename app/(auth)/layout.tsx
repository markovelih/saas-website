import type { Metadata } from 'next'
import { SocialAuthProvider } from '@/components/auth/social-sign-in'
import { socialProviders } from '@/lib/auth/social-providers'

export const metadata: Metadata = { robots: { index: false, follow: false } }
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SocialAuthProvider providers={await socialProviders()}>{children}</SocialAuthProvider>
}
