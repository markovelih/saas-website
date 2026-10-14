'use client'

import { useFounderLanguage } from '@/components/manager/language'

export default function WorkspaceLoading() {
  const { t } = useFounderLanguage()
  return <div role="status" aria-live="polite" aria-busy="true" className="max-w-[1400px]">
    <p className="text-sm text-white/50 mb-8">{t('Loading your workspace…')}</p>
    <div aria-hidden="true" className="space-y-6">
      <div className="h-8 w-2/5 rounded bg-white/[.06]" />
      <div className="h-3 w-3/5 rounded bg-white/[.04]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map(i => <div key={i} className="h-24 border border-white/[.07] rounded-lg bg-white/[.025]" />)}
      </div>
      <div className="h-48 border border-white/[.07] rounded-lg bg-white/[.025]" />
    </div>
  </div>
}
