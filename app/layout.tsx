import type { Metadata, Viewport } from 'next'
import { publicSearchPages, siteUrl } from '@/lib/seo'
import { OrganizationData } from '@/components/seo/structured-data'
import { Geist, Geist_Mono, Montserrat } from 'next/font/google'
import {PrivacyControls} from '@/components/legal/cookie-preferences'
import {ThemeProvider,SiteToaster} from '@/components/theme-provider'
import './globals.css'
import {AssistantProvider} from '@/components/ai/assistant-provider'
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
  title: publicSearchPages['/'].title,
  description: publicSearchPages['/'].description,
  authors: [{ name: 'Koryx' }],
  metadataBase: new URL(siteUrl),
  verification: { google: 'HqyPNrhbt-asXvr_pn_3Gr-oKibXtO8sRIBXy3GqOPA' },
  applicationName:'Koryx',
  appleWebApp:{capable:true,title:'Koryx',statusBarStyle:'default'},
  icons: {
    icon: [{ url: '/brand/favicon.png', type: 'image/png', sizes: '96x96' }],
    shortcut: '/brand/favicon.ico',
    apple: [{ url: '/brand/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: publicSearchPages['/'].title,
    description: publicSearchPages['/'].description,
    siteName: 'Koryx',
    locale: 'en_CA',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit:'cover',
  interactiveWidget:'resizes-content',
  
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${roundedFont.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider attribute="data-workspace-theme" defaultTheme="system" enableSystem enableColorScheme storageKey="koryx-theme" disableTransitionOnChange><AssistantProvider><SiteTypography>{children}</SiteTypography></AssistantProvider>
        <SiteToaster/>
        <PrivacyControls/><OrganizationData/></ThemeProvider>
      </body>
    </html>
  )
}
