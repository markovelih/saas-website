import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Koryx | Premium Web Development Agency',
  description: 'We build exceptional websites for ambitious brands. Custom web development, e-commerce solutions, and digital experiences that convert.',
  keywords: ['web development', 'web design', 'custom websites', 'e-commerce', 'digital agency'],
  authors: [{ name: 'Koryx' }],
  openGraph: {
    title: 'Koryx | Premium Web Development Agency',
    description: 'We build exceptional websites for ambitious brands.',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
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
