'use client'

import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import type { ComponentProps } from 'react'
import { isStudioViewHref } from '@/lib/workspace-navigation'

function NavigationHint() {
  const { pending } = useLinkStatus()
  return <LoaderCircle aria-hidden="true" size={12} className={`ml-auto shrink-0 motion-safe:animate-spin ${pending ? 'opacity-60' : 'hidden'}`} />
}

export function WorkspaceNavigationLink({ children, href, onNavigate, localStudioViews = false, ...props }: ComponentProps<typeof Link> & { localStudioViews?: boolean }) {
  const pathname = usePathname()
  const localView = localStudioViews && pathname === '/dashboard/admin' && typeof href === 'string' && isStudioViewHref(href)

  return <Link {...props} href={href} prefetch={localView ? false : true} onNavigate={event => {
    if (localView && document.querySelector('[data-studio-panel]')) {
      event.preventDefault()
      if (window.location.pathname + window.location.search !== href) window.history.pushState(null, '', href as string)
    }
    onNavigate?.(event)
  }}>{children}<NavigationHint /></Link>
}
