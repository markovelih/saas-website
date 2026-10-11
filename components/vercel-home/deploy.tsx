'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { GitBranch, Globe, Shield, Slash, Bot, Flame } from 'lucide-react'

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 76 65" fill="currentColor">
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  )
}

function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Vertical center line */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.06]" />
      {/* Horizontal lines */}
      <div className="absolute left-0 top-0 h-px w-full bg-white/[0.06]" />
      {/* Corner crosses */}
      <svg className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 0V16M0 8H16" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
      </svg>
    </div>
  )
}

function SecurityAnimation() {
  const [activeIndex, setActiveIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 6)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const shields = [
    { blocked: true },
    { blocked: true },
    { blocked: true },
    { blocked: false }, // green - allowed
    { blocked: true },
    { blocked: true },
  ]

  return (
    <div className="flex items-end justify-center gap-3 py-4">
      {shields.map((shield, i) => {
        const isActive = i === activeIndex
        const color = shield.blocked ? '#ef4444' : '#22c55e'
        
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              <Shield 
                className="h-5 w-5" 
                style={{ color: isActive ? color : 'rgba(255,255,255,0.3)' }}
                strokeWidth={1.5}
              />
            </motion.div>
            <motion.div
              className="h-10 w-0.5 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                opacity: isActive ? 1 : 0.3,
                scaleY: isActive ? 1 : 0.7,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )
      })}
    </div>
  )
}

function DeploymentCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-lg border border-white/[0.08] bg-black/40 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[13px] text-white/80">your-business.com</p>
          <p className="text-[12px] text-white/40">Production</p>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-white/60">Ready</span>
          </div>
          <span className="text-white/40">3m 16s</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-white/[0.06] pt-3 text-[12px] text-white/40">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5" />
          <span className="font-mono">main</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-white/30">8128e41</span>
        </div>
      </div>
    </motion.div>
  )
}

function CodeBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-5 font-mono text-[13px] leading-relaxed"
    >
      <div className="text-[#c678dd]">&apos;use server&apos;</div>
      <div className="mt-3">
        <span className="text-[#c678dd]">import</span>
        <span className="text-white/80">{' { '}</span>
        <span className="text-[#e5c07b]">revalidateTag</span>
        <span className="text-white/80">{' } '}</span>
        <span className="text-[#c678dd]">from</span>
        <span className="text-[#98c379]">{" 'next/cache'"}</span>
        <span className="text-white/80">;</span>
      </div>
      <div className="mt-4">
        <span className="text-[#c678dd]">export default async function</span>
        <span className="text-[#61afef]"> submit</span>
        <span className="text-white/80">{'() {'}</span>
      </div>
      <div className="pl-4">
        <span className="text-[#c678dd]">await</span>
        <span className="text-[#61afef]"> addPost</span>
        <span className="text-white/80">();</span>
      </div>
      <div className="pl-4">
        <span className="text-[#61afef]">revalidateTag</span>
        <span className="text-white/80">(</span>
        <span className="text-[#98c379]">&apos;posts&apos;</span>
        <span className="text-white/80">, </span>
        <span className="text-[#98c379]">&apos;max&apos;</span>
        <span className="text-white/80">);</span>
      </div>
      <div className="text-white/80">{'}'};</div>
    </motion.div>
  )
}

function SecurityFeatures() {
  const features = [
    { icon: Shield, label: 'Accounts', sublabel: 'Authentication' },
    { icon: Flame, label: 'Private data', sublabel: 'Permissions' },
    { icon: Bot, label: 'Forms', sublabel: 'Validation' },
  ]

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {features.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
          className="rounded-lg border border-white/[0.08] bg-black/40 p-3"
        >
          <f.icon className="mb-2 h-4 w-4 text-white/50" strokeWidth={1.5} />
          <p className="text-[12px] font-medium text-white/80">{f.label}</p>
          <p className="text-[11px] text-white/40">{f.sublabel}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function Deploy() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [deployState, setDeployState] = useState<'building' | 'deployed'>('building')

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setDeployState('deployed'), 1500)
      return () => clearTimeout(timer)
    }
  }, [isInView])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black py-24">
      {/* Background grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6">
        {/* Main section - Deploy once, scale everywhere */}
        <div className="relative border-x border-white/[0.06]">
          <GridLines />
          
          {/* Header */}
          <div className="border-b border-white/[0.06] py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[36px] font-bold tracking-tight text-white sm:text-[48px]"
            >
              From your idea to a working product.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mt-4 max-w-md text-[16px] text-white/50"
            >
              Koryx handles design, development, and launch for your business.
            </motion.p>

            {/* Deployed button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 inline-flex"
            >
              <div className="relative">
                <motion.div
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.12] bg-white px-6 py-3"
                  animate={{
                    boxShadow: deployState === 'deployed' 
                      ? '0 0 30px rgba(255,255,255,0.15)' 
                      : '0 0 0px rgba(255,255,255,0)',
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <VercelLogo className="h-4 w-4 text-black" />
                  <span className="text-[15px] font-semibold text-black">
                    {deployState === 'deployed' ? 'Deployed.' : 'Deploying...'}
                  </span>
                </motion.div>
                {/* Connecting line down */}
                <div className="absolute left-1/2 top-full h-10 w-px -translate-x-1/2 bg-white/[0.1]" />
              </div>
            </motion.div>
          </div>

          {/* Two column features */}
          <div className="grid md:grid-cols-2">
            {/* Review before launch */}
            <div className="border-b border-r border-white/[0.06] p-8 md:border-b-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 flex items-center gap-2 text-[13px] text-white/40">
                  <GitBranch className="h-4 w-4" strokeWidth={1.5} />
                  <span>Review before launch</span>
                </div>
                <p className="text-[18px] leading-relaxed text-white/80">
                  Follow your project and{' '}
                  <span className="font-semibold text-white">review working previews</span>{' '}
                  before your website goes live.
                </p>
              </motion.div>
              <div className="mt-6">
                <DeploymentCard />
              </div>
            </div>

            {/* Launch and hosting */}
            <div className="border-b border-white/[0.06] p-8 md:border-b-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="mb-4 flex items-center gap-2 text-[13px] text-white/40">
                  <Globe className="h-4 w-4" strokeWidth={1.5} />
                  <span>Launch and hosting</span>
                </div>
                <p className="text-[18px] leading-relaxed text-white/80">
                  <span className="font-semibold text-white">Your domain, connected and ready</span>
                  , with deployment and hosting configured for your finished project.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Second row of features */}
          <div className="grid border-t border-white/[0.06] md:grid-cols-2">
            {/* Framework-aware */}
            <div className="border-b border-r border-white/[0.06] p-8 md:border-b-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 flex items-center gap-2 text-[13px] text-white/40">
                  <Slash className="h-4 w-4" strokeWidth={1.5} />
                  <span>Custom development</span>
                </div>
                <p className="text-[18px] leading-relaxed text-white/80">
                  <span className="font-semibold text-white">We build clean, maintainable code</span>{' '}
                  for your website, dashboard, integrations, or SaaS application.
                </p>
              </motion.div>
              <div className="mt-6">
                <CodeBlock />
              </div>
            </div>

            {/* Built-in security */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="mb-4 flex items-center gap-2 text-[13px] text-white/40">
                  <Shield className="h-4 w-4" strokeWidth={1.5} />
                  <span>Built-in security</span>
                </div>
                <p className="text-[18px] leading-relaxed text-white/80">
                  <span className="font-semibold text-white">Secure accounts and private data</span>{' '}
                  with access controls designed for your business.
                </p>
              </motion.div>
              <SecurityAnimation />
              <SecurityFeatures />
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-t border-white/[0.06] py-16 text-center">
            <GridLines />
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[32px] font-bold tracking-tight text-white sm:text-[40px]"
            >
              Built for your business. Ready to launch.
            </motion.h3>
          </div>
        </div>
      </div>
    </section>
  )
}
