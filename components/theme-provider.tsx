'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes'
import {Toaster} from 'sonner'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function SiteToaster(){const {resolvedTheme}=useTheme();return <Toaster position="top-right" theme={resolvedTheme==='light'?'light':'dark'} toastOptions={{style:{background:'var(--card)',border:'1px solid var(--border)',color:'var(--foreground)'}}}/>}
