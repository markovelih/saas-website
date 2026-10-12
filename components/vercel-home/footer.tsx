import Image from 'next/image'
import Link from 'next/link'
import { Github, Mail } from 'lucide-react'

const footerLinks = {
  Products: [
    ['Business Websites', '/services/business-websites'], ['Web Applications', '/#services'],
    ['SaaS Platforms', '/#services'], ['E-commerce', '/#services'],
    ['Client Portals', '/services/client-dashboards'], ['Automation', '/#workflow'],
  ],
  Services: [
    ['Web Design', '/services/business-websites'], ['Custom Development', '/#services'],
    ['Booking Systems', '/services/appointment-booking'], ['Dashboards', '/services/client-dashboards'],
    ['Integrations', '/#workflow'], ['SEO & Speed', '/services/seo-speed'],
  ],
  Resources: [
    ['Our Process', '/#workflow'], ['Pricing', '/pricing'], ['FAQ', '/#testimonials'],
    ['Start a Project', '/register'], ['Client Login', '/login'],
  ],
  Koryx: [
    ['Our Services', '/#services'], ['Discuss Your Idea', '/register'],
    ['Client Dashboard', '/dashboard'], ['Project Questions', '/#testimonials'],
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] relative overflow-hidden">
      <div className="relative py-20 border-b border-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(255,255,255,0.05) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 vercel-grid-bg opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight vercel-gradient-text mb-5">Start building today</h2>
          <p className="text-white/45 text-[16px] mb-8">
            Tell Koryx what your business needs. We design and build your website, application, or custom software, with a clear scope before work begins.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="vercel-btn-white text-[15px] px-7 py-3 rounded-lg justify-center">
              Start Project
            </Link>
            <a href="#services" className="vercel-btn-outline text-[15px] px-7 py-3 rounded-lg justify-center">
              View Services
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-5 inline-flex items-center">
  <Image
    src="/koryx-logo.png"
    alt="Koryx logo"
    width={140}
    height={36}
    className="h-auto w-[120px] object-contain"
  />
</Link>
            <p className="text-[13px] text-white/35 leading-relaxed mb-5">
              Premium web experiences for ambitious brands that want to look serious online.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com/tyomka0123-design/saas-website" aria-label="Koryx website source on GitHub" className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="/register" aria-label="Start a project with Koryx" className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[13px] text-white/40 hover:text-white/80 transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-10 mt-10 border-t border-white/[0.06] gap-4">
          <p className="text-[12px] text-white/25">© {new Date().getFullYear()} Koryx. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            <span className="text-[12px] text-white/25">Custom development · Canada / Remote</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
