import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Montserrat } from 'next/font/google'
import {PrivacyControls} from '@/components/legal/cookie-preferences'
import {ThemeProvider,SiteToaster} from '@/components/theme-provider'
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
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '96x96' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
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
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${roundedFont.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider attribute="data-workspace-theme" defaultTheme="system" enableSystem enableColorScheme storageKey="koryx-theme" disableTransitionOnChange><SiteTypography>{children}</SiteTypography>
        <SiteToaster/>
        <PrivacyControls/></ThemeProvider>
      </body>
    </html>
  )
}
