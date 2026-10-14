import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { KoryxPrism } from './koryx-prism'
import s from './hero-layout.module.css'

export function Hero() {
  return (
    <section className="relative bg-black pt-20" aria-labelledby="home-hero-title">
      <div className={s.shell}>
        <svg
          className="pointer-events-none absolute -bottom-[8px] -right-[8px] z-[999] h-4 w-4 text-white/90"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
          <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg
          className="pointer-events-none absolute -left-[8px] -top-[8px] z-[999] h-4 w-4 text-white/90"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
          <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className={s.copy}>
          <div className={s.eyebrow}>
            <Sparkles className="h-3.5 w-3.5" />
            Design & development, done for you
            <ArrowRight className="h-3.5 w-3.5" />
          </div>

          <h1 id="home-hero-title" className={`site-hero-heading ${s.heading}`}>
            Websites. Apps.
            <br />
            Custom software.
            <br />
            Built for you.
          </h1>

          <p className={s.description}>
            Tell us what your business needs. Koryx designs, develops, and launches
            your website or application — with every detail built around you.
          </p>

          <div className={s.actions}>
            <Link href="/dashboard/new-order" className={s.primary}>
              <svg viewBox="0 0 128 128" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M27 83V104L98 27H77ZM63 84L79 101H99L76 73Z" />
              </svg>
              Start Your Project
            </Link>
            <Link href="#services" className={s.secondary}>
              View Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <KoryxPrism />
      </div>
    </section>
  )
}
