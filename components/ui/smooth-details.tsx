'use client'

import { useEffect, useRef, type DetailsHTMLAttributes, type MouseEvent } from 'react'

/** Native, server-rendered disclosures with reversible height animations. */
export function SmoothDetails({ children, open = false, onClick, onToggle, ...props }: DetailsHTMLAttributes<HTMLDetailsElement>) {
  const element = useRef<HTMLDetailsElement>(null)
  const expanded = useRef(open)
  const heightAnimation = useRef<Animation | null>(null)
  const contentAnimations = useRef<Animation[]>([])
  const baseline = useRef<{ height: string; overflow: string } | null>(null)

  useEffect(() => {
    const details = element.current
    details?.querySelector('summary')?.setAttribute('aria-expanded', String(details.open))
    return () => {
      heightAnimation.current?.cancel()
      contentAnimations.current.forEach(animation => animation.cancel())
    }
  }, [])

  function toggle(event: MouseEvent<HTMLDetailsElement>) {
    onClick?.(event)
    const details = element.current
    const summary = (event.target as Element).closest('summary')
    if (event.defaultPrevented || !details || summary?.parentElement !== details) return
    // Native activation remains available without JS, animation support, or motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof details.animate !== 'function') return
    event.preventDefault()

    const expanding = !expanded.current
    const interrupted = heightAnimation.current !== null
    const start = details.getBoundingClientRect().height
    const content = Array.from(details.children).filter(child => child !== summary) as HTMLElement[]
    const appearance = content.map(child => {
      const style = getComputedStyle(child)
      return { opacity: interrupted ? style.opacity : expanding ? '0' : '1', transform: interrupted ? style.transform : expanding ? 'translateY(-6px)' : 'none' }
    })
    baseline.current ??= { height: details.style.height, overflow: details.style.overflow }
    heightAnimation.current?.cancel()
    contentAnimations.current.forEach(animation => animation.cancel())
    expanded.current = expanding
    details.dataset.expanded = String(expanding)
    summary.setAttribute('aria-expanded', String(expanding))

    // Measure the native end state, retaining the answer while it animates shut.
    details.style.height = 'auto'
    details.open = expanding
    const end = details.getBoundingClientRect().height
    details.open = true
    details.style.height = `${start}px`
    details.style.overflow = 'hidden'
    const timing = { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' as const }
    contentAnimations.current = content.map((child, index) => child.animate([
      appearance[index],
      { opacity: expanding ? '1' : '0', transform: expanding ? 'translateY(0)' : 'translateY(-6px)' },
    ], { ...timing, duration: expanding ? 360 : 240 }))
    const animation = details.animate([{ height: `${start}px` }, { height: `${end}px` }], timing)
    heightAnimation.current = animation
    animation.onfinish = () => {
      if (heightAnimation.current !== animation) return
      details.open = expanding
      details.style.height = baseline.current?.height ?? ''
      details.style.overflow = baseline.current?.overflow ?? ''
      baseline.current = null
      heightAnimation.current = null
      animation.cancel()
      contentAnimations.current.forEach(item => item.cancel())
      contentAnimations.current = []
    }
  }

  return <details {...props} ref={element} open={open} data-smooth-details data-expanded={open} onClick={toggle} onToggle={event => {
    if (!heightAnimation.current) {
      expanded.current = event.currentTarget.open
      event.currentTarget.dataset.expanded = String(expanded.current)
      event.currentTarget.querySelector('summary')?.setAttribute('aria-expanded', String(expanded.current))
    }
    onToggle?.(event)
  }}>{children}</details>
}
