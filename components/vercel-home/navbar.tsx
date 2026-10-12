'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown, Menu, X, Globe, Code2, ShoppingBag, CalendarCheck, Layers, Workflow, Search, ShieldCheck } from 'lucide-react'

const serviceLinks = [
  { slug: 'business-websites', label: 'Business websites', desc: 'A distinctive website for your brand', icon: Globe },
  { slug: 'custom-software', label: 'Apps & custom software', desc: 'SaaS, products, and internal tools', icon: Code2 },
  { slug: 'e-commerce', label: 'E-commerce', desc: 'Stores, checkout, and online payments', icon: ShoppingBag },
  { slug: 'appointment-booking', label: 'Booking systems', desc: 'Appointments and scheduling', icon: CalendarCheck },
  { slug: 'client-dashboards', label: 'Dashboards & portals', desc: 'Private workspaces for teams and clients', icon: Layers },
  { slug: 'integrations', label: 'Integrations & features', desc: 'Connect tools and expand your product', icon: Workflow },
  { slug: 'seo-speed', label: 'Performance & SEO', desc: 'Faster pages and technical foundations', icon: Search },
  { slug: 'security', label: 'Security & launch', desc: 'HTTPS, hosting, and access controls', icon: ShieldCheck },
]
const links = [['Work', '/work'], ['Process', '/process'], ['Pricing', '/pricing'], ['FAQ', '/faq']]

export function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduce = useReducedMotion()
  const menuRef = useRef<HTMLDivElement>(null)
  const serviceButton = useRef<HTMLButtonElement>(null)
  const mobileButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prior = document.body.style.overflow
    if (mobileOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prior }
  }, [mobileOpen])
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (mobileOpen) { setMobileOpen(false); mobileButton.current?.focus() }
        else if (servicesOpen) { setServicesOpen(false); serviceButton.current?.focus() }
      }
    }
    function outside(e: PointerEvent) { if (!menuRef.current?.contains(e.target as Node)) setServicesOpen(false) }
    window.addEventListener('keydown', close)
    window.addEventListener('pointerdown', outside)
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('pointerdown', outside) }
  }, [servicesOpen, mobileOpen])
  const close = () => { setServicesOpen(false); setMobileOpen(false) }
  return <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[.08] bg-black/95 backdrop-blur-xl text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center gap-5">
      <Link href="/" aria-label="Koryx home" onClick={close}><Image src="/koryx-logo.png" alt="Koryx" width={160} height={40} priority className="w-[125px] sm:w-[140px] h-auto"/></Link>
      <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 mr-auto ml-6">
        <div ref={menuRef} onMouseLeave={()=>setServicesOpen(false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setServicesOpen(false)}}>
          <button ref={serviceButton} aria-expanded={servicesOpen} aria-controls="services-menu" onMouseEnter={()=>setServicesOpen(true)} onClick={()=>setServicesOpen(!servicesOpen)} className={`px-3 py-2 rounded-lg text-[13px] flex items-center gap-1.5 transition-colors ${servicesOpen?'bg-white/10 text-white':'text-white/65 hover:text-white'}`}>Services <ChevronDown size={12}/></button>
          <AnimatePresence>{servicesOpen&&<motion.div id="services-menu" initial={reduce?false:{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.18}} className="absolute top-16 left-1/2 -translate-x-1/2 w-[760px] pt-2"><div className="bg-[#050505] border border-white/15 rounded-2xl p-6 shadow-2xl"><div className="grid grid-cols-2 gap-x-8 gap-y-2">{serviceLinks.map(item=><Link key={item.slug} href={`/services/${item.slug}`} onClick={close} className="group flex gap-3 p-3 rounded-xl hover:bg-white/[.05] focus-visible:bg-white/[.05]"><div className="border border-white/10 rounded-lg p-2.5 text-white/50 group-hover:text-white group-hover:border-white/30"><item.icon size={19} strokeWidth={1.5}/></div><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-white/40 mt-1">{item.desc}</p></div></Link>)}</div><div className="border-t border-white/10 mt-5 pt-4 flex justify-between text-xs"><Link href="/services" onClick={close} className="text-white/60 hover:text-white">Explore all services →</Link><Link href="/dashboard/new-order" onClick={close} className="text-white">Tell us about your idea →</Link></div></div></motion.div>}</AnimatePresence>
        </div>
        {links.map(([label,href])=><Link key={href} href={href} onMouseEnter={()=>setServicesOpen(false)} className="px-3 py-2 text-[13px] text-white/65 hover:text-white">{label}</Link>)}
      </nav>
      <div className="hidden lg:flex gap-3 items-center"><Link href="/login" className="text-[13px] text-white/60 hover:text-white px-3">Client login</Link><Link href="/dashboard/new-order" className="bg-white rounded-lg px-4 py-2 text-[13px] font-medium text-black flex items-center gap-2 hover:bg-white/90">Start a project <ArrowRight size={13}/></Link></div>
      <button ref={mobileButton} aria-label={mobileOpen?'Close navigation':'Open navigation'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden rounded-lg p-2 border border-white/15">{mobileOpen?<X size={20}/>:<Menu size={20}/>}</button>
    </div>
    <AnimatePresence>{mobileOpen&&<motion.nav id="mobile-navigation" aria-label="Mobile navigation" initial={reduce?false:{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="lg:hidden fixed top-16 inset-x-0 h-[calc(100dvh-64px)] overflow-y-auto bg-black border-t border-white/10 p-6"><Link href="/services" onClick={close} className="text-2xl block mb-5">Services</Link><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">{serviceLinks.map(item=><Link href={`/services/${item.slug}`} key={item.slug} onClick={close} className="flex gap-3 py-2 text-sm text-white/60"><item.icon size={17}/>{item.label}</Link>)}</div>{links.map(([label,href])=><Link href={href} key={href} onClick={close} className="block border-t border-white/10 py-4 text-lg">{label}</Link>)}<div className="grid gap-3 mt-7"><Link onClick={close} href="/dashboard/new-order" className="rounded-lg bg-white text-black py-3 text-center font-medium">Start a project</Link><Link onClick={close} href="/login" className="rounded-lg border border-white/20 py-3 text-center text-white/60">Client login</Link></div></motion.nav>}</AnimatePresence>
  </header>
}
