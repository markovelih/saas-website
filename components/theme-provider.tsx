'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes'
import {usePathname} from 'next/navigation'
import {Toaster} from 'sonner'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const path=usePathname();const forced=path.startsWith('/dashboard')||path.startsWith('/admin')?'dark':props.forcedTheme
  return <NextThemesProvider {...props} forcedTheme={forced}>{children}</NextThemesProvider>
}

export function SiteToaster(){const {resolvedTheme,forcedTheme}=useTheme();return <Toaster position="top-right" theme={(forcedTheme||resolvedTheme)==='light'?'light':'dark'} toastOptions={{style:{background:'var(--card)',border:'1px solid var(--border)',color:'var(--foreground)'}}}/>}
