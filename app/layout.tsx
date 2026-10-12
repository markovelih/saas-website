import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import {SiteTypography} from '@/components/site-typography'

const roundedFont=Montserrat({subsets:['latin','cyrillic'],variable:'--font-koryx-rounded',display:'swap'})

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Koryx | Custom Websites, Apps & Software',
  description: 'Order a custom website, SaaS application, or software for your business. Koryx handles design, development, integrations, and launch.',
  keywords: ['web development', 'web design', 'custom websites', 'e-commerce', 'digital agency'],
  authors: [{ name: 'Koryx' }],
  metadataBase: new URL('https://koryx.ca'),
  icons: { icon: [{ url: '/icon.svg?v=2', type: 'image/svg+xml' }], apple: '/icon.svg?v=2' },
  openGraph: {
    title: 'Koryx | Custom Websites, Apps & Software',
    description: 'Custom websites, applications, and software built for your business.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${roundedFont.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <SiteTypography>{children}</SiteTypography>
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: 'oklch(0.12 0 0)',
              border: '1px solid oklch(0.25 0 0)',
              color: 'oklch(0.98 0 0)',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
