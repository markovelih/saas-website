'use client'

import { useEffect, useRef } from 'react'

const logos = [
  { name: 'Websites', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z' },
  { name: 'E-commerce', svg: 'M15.5 2.1L14 3.6C13.3 3.2 12.6 3 12 3c-2.8 0-5 2.2-5 5v1H5l-1 12h16l-1-12h-2V8c0-2.8-2.2-5-5-5-.2 0-.4 0-.5.1zM12 5c1.7 0 3 1.3 3 3v1H9V8c0-1.7 1.3-3 3-3z' },
  { name: 'SaaS', svg: 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 4a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z' },
  { name: 'Dashboards', svg: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { name: 'Client Portals', svg: 'M4 4h16v2H4zm0 7h16v2H4zm0 7h16v2H4z' },
  { name: 'Booking Systems', svg: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' },
  { name: 'Integrations', svg: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zm7.07 6.93l-1.02-1.02 8.04-8.04 1.02 1.02-8.04 8.04z' },
  { name: 'Automation', svg: 'M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305z' },
]

export function LogoCloud() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let x = 0
    let animFrame = 0

    const step = () => {
      x -= 0.5
      const half = track.scrollWidth / 2
      if (Math.abs(x) >= half) x = 0
      track.style.transform = `translateX(${x}px)`
      animFrame = requestAnimationFrame(step)
    }

    animFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  const allLogos = [...logos, ...logos]

  return (
    <section className="py-20 border-t border-white/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center">
        <p className="vercel-section-label">Custom websites, applications, and software for your business</p>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-black to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-black to-transparent" />

        <div ref={trackRef} className="flex gap-16 items-center" style={{ width: 'max-content' }}>
          {allLogos.map((logo, i) => (
            <div key={i} className="flex items-center gap-3 text-white/30 hover:text-white/60 transition-colors duration-300 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d={logo.svg} />
              </svg>
              <span className="text-[15px] font-semibold tracking-tight">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
