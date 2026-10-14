export type StudioView = 'board' | 'list' | 'clients' | 'billing'

export function studioView(value: string | null | undefined): StudioView {
  return value === 'list' || value === 'clients' || value === 'billing' ? value : 'board'
}

export function studioHref(view: StudioView) {
  return view === 'board' ? '/dashboard/admin' : `/dashboard/admin?view=${view}`
}

// These are views of data already loaded into the founder's panel, not pages.
export function isStudioViewHref(href: string) {
  return ['/dashboard/admin', '/dashboard/admin?view=list', '/dashboard/admin?view=clients', '/dashboard/admin?view=billing'].includes(href)
}
