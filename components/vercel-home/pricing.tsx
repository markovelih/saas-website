'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Code, Layout, Rocket } from 'lucide-react'

type FeatureRow = {
  label: string
  starter: string | boolean
  business: string | boolean
  enterprise: string | boolean
}

type FeatureSection = {
  eyebrow: string
  title: string
  description: string
  groups: {
    title: string
    rows: FeatureRow[]
  }[]
}

const topPlans = [
  {
    key: 'starter' as const,
    title: 'Starter',
    subtitle: 'Perfect for landing pages, portfolios, and small business websites.',
    price: 'from CA$450',
    button: 'Start Project',
    buttonStyle:
      'border border-white/[0.12] bg-black text-white hover:bg-white/[0.04]',
    features: [
      'Modern responsive design',
      'Up to 5 pages',
      'Basic SEO optimization',
      'Contact form',
      'Mobile-first approach',
      'Fast delivery in 7-14 days',
    ],
  },
  {
    key: 'Business' as const,
    title: 'Pro',
    badge: 'Popular',
    subtitle: 'Full-featured website with CMS, blog, and advanced functionality.',
    price: 'from CA$1,400',
    button: 'Discuss Project',
    buttonStyle: 'bg-[#0A84FF] text-white hover:bg-[#117df0]',
    features: [
      'Everything in Starter',
      'Up to 15 pages',
      'CMS for content management',
      'Blog with categories',
      'Analytics integration',
      'Advanced SEO optimization',
    ],
  },
  {
    key: 'enterprise' as const,
    title: 'Enterprise',
    subtitle:
      'Complex SaaS solutions, custom platforms, and full business process automation.',
    button: 'Get Consultation',
    secondaryButton: 'Request Demo',
    buttonStyle: 'bg-white text-black hover:bg-white/90',
    features: [
      'Everything in Business',
      'Unlimited pages',
      'Custom database',
      'User dashboard / admin panel',
      'Payment integrations',
      'Dedicated support',
    ],
  },
]

const sections: FeatureSection[] = [
  {
    eyebrow: 'Development',
    title: 'Design & UI/UX',
    description: 'Modern design that sets you apart from competitors.',
    groups: [
      {
        title: 'Visual Design',
        rows: [
          { label: 'Unique design', starter: true, business: true, enterprise: true },
          { label: 'Responsive (mobile-first)', starter: true, business: true, enterprise: true },
          { label: 'Animations & micro-interactions', starter: 'Basic', business: 'Advanced', enterprise: 'Premium' },
          { label: 'Custom illustrations', starter: '—', business: 'Up to 5', enterprise: 'Unlimited' },
          { label: 'Figma prototyping', starter: true, business: true, enterprise: true },
          { label: 'Design system / UI Kit', starter: '—', business: true, enterprise: true },
        ],
      },
      {
        title: 'UX & Accessibility',
        rows: [
          { label: 'Conversion optimization', starter: 'Basic', business: 'Advanced', enterprise: 'Full' },
          { label: 'A/B testing', starter: '—', business: '—', enterprise: true },
          { label: 'WCAG accessibility', starter: 'AA', business: 'AA', enterprise: 'AAA' },
          { label: 'Performance audit', starter: true, business: true, enterprise: true },
        ],
      },
    ],
  },
  {
    eyebrow: 'Technologies',
    title: 'Development & Integrations',
    description: 'Cutting-edge tech stack for fast and reliable solutions.',
    groups: [
      {
        title: 'Frontend',
        rows: [
          { label: 'Next.js / React', starter: true, business: true, enterprise: true },
          { label: 'TypeScript', starter: true, business: true, enterprise: true },
          { label: 'Tailwind CSS', starter: true, business: true, enterprise: true },
          { label: 'Framer Motion animations', starter: 'Basic', business: 'Advanced', enterprise: 'Custom' },
        ],
      },
      {
        title: 'Backend & Database',
        rows: [
          { label: 'Headless CMS', starter: '—', business: true, enterprise: true },
          { label: 'Custom backend', starter: '—', business: '—', enterprise: true },
          { label: 'Database', starter: '—', business: 'Supabase / Firebase', enterprise: 'Any' },
          { label: 'API integrations', starter: 'Up to 2', business: 'Up to 5', enterprise: 'Unlimited' },
          { label: 'Payment systems', starter: '—', business: 'Stripe / PayPal', enterprise: 'Any' },
        ],
      },
    ],
  },
  {
    eyebrow: 'Support',
    title: 'Hosting & Maintenance',
    description: 'Reliable hosting and support for your project.',
    groups: [
      {
        title: 'Infrastructure',
        rows: [
          { label: 'Vercel / cloud hosting', starter: true, business: true, enterprise: true },
          { label: 'SSL certificate', starter: true, business: true, enterprise: true },
          { label: 'Global CDN', starter: true, business: true, enterprise: true },
          { label: 'Automatic backups', starter: '—', business: 'Weekly', enterprise: 'Daily' },
        ],
      },
      {
        title: 'Support',
        rows: [
          { label: 'Technical support', starter: 'Email', business: 'Priority', enterprise: '24/7' },
          { label: 'Response time', starter: '48 hours', business: '24 hours', enterprise: '4 hours' },
          { label: 'Updates & patches', starter: '30 days', business: '90 days', enterprise: '12 months' },
          { label: 'Training & onboarding', starter: '1 hour', business: '3 hours', enterprise: 'Unlimited' },
        ],
      },
    ],
  },
]

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-white/70" />
  }

  if (value === false || value === '—') {
    return <span className="text-white/20">—</span>
  }

  return (
    <span className="text-center text-sm leading-6 text-white/70">
      {value}
    </span>
  )
}

function PlanButton({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-between rounded-full px-5 text-[15px] font-medium transition ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="ml-4 h-4 w-4" />
    </Link>
  )
}

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-black px-4 pb-20 pt-12 text-white md:pb-28">
      {/* Vercel-style grid background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1100px] border-x border-white/[0.08]">
        <svg
  className="pointer-events-none absolute -left-[8px] -top-[8px] z-20 h-4 w-4 text-white/75"
  viewBox="0 0 16 16"
  fill="none"
  aria-hidden="true"
>
  <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
  <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
</svg>
        <div className="border-b border-t border-white/[0.08] px-6 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[36px] font-semibold tracking-[-0.06em] md:text-[64px] md:leading-[1.02]">
              Transparent pricing for your project.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-white/50 md:text-[17px] md:leading-8">
              From simple landing pages to complex SaaS platforms — choose the plan that fits your needs.
            </p>
          </div>
        </div>

        <div className="grid border-b border-white/[0.08] md:grid-cols-3">
          {topPlans.map((plan, index) => (
            <div
              key={plan.key}
              className={`relative border-white/[0.08] px-6 pb-8 pt-10 md:px-8 ${
                index !== topPlans.length - 1 ? 'md:border-r' : ''
              } ${plan.key === 'Business' ? 'bg-white/[0.02]' : ''}`}
            >
              {plan.badge && (
                <div className="absolute left-0 top-0 rounded-br-lg bg-white px-4 py-2 text-sm font-medium text-black">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-[22px] font-semibold">{plan.title}</h3>
              <p className="mt-4 text-[15px] leading-8 text-white/55">{plan.subtitle}</p>
              <p className="mt-2 text-[18px] font-medium text-white">{plan.price}</p>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-[3px]">
                      <Check className="h-4 w-4 text-white/75" />
                    </div>
                    <p className="text-[15px] leading-7 text-white/65">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <PlanButton href="/contact" className={plan.buttonStyle}>
                  {plan.button}
                </PlanButton>

                {plan.secondaryButton && (
                  <Link
                    href="/contact"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] bg-black px-5 text-[15px] font-medium text-white/80 transition hover:bg-white/[0.04]"
                  >
                    {plan.secondaryButton}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Flexible Payment Section */}
        <div className="border-b border-white/[0.08] px-6 py-12 md:px-10">
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
  <svg
  className="pointer-events-none absolute -right-[28px] -top-[72px] z-20 h-4 w-4 text-white/75"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
    <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
  </svg>
            <div>
              <h3 className="text-[18px] font-semibold tracking-[-0.03em] md:text-[22px]">
                Flexible payment terms.
                <span className="font-normal text-white/55">
                  {' '}
                  50% upfront, 50% on completion. Option to split payments into milestones for larger projects.
                </span>
              </h3>

              <Link
                href="/contact"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] bg-black px-5 text-[15px] font-medium text-white/80 transition hover:bg-white/[0.04] md:w-fit"
              >
                Learn more
              </Link>
            </div>

            {/* Budget Visualization - Clean Vercel-style bars */}
            <div className="relative h-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
              {/* Grid background */}
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
              
              {/* Top line with label */}
              <div className="absolute left-6 top-4 rounded-full border border-[#0A84FF] bg-[#0A84FF]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#72AEFF]">
  Budget
</div>
              {/* Bars - evenly spaced */}
              <div className="absolute bottom-6 left-6 right-6 flex h-[120px] items-end justify-between gap-2">
                {[30, 50, 70, 90, 100, 100, 100, 100].map((heightPercent, i) => (
                  <motion.div
                    key={i}
                    className={`w-full rounded-t-lg border ${
                      i >= 4
                        ? 'border-[#0A84FF] bg-[#0A84FF]/10'
                        : 'border-white/[0.12] bg-white/[0.02]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    initial={{ height: '20%', opacity: 0.5 }}
                    animate={{
                      height: [`${heightPercent * 0.3}%`, `${heightPercent}%`, `${heightPercent * 0.85}%`, `${heightPercent}%`],
                      opacity: [0.5, 1, 0.8, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Development Process Section */}
        <div className="border-b border-white/[0.08] px-6 py-12 md:px-10">
          <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            {/* Process Visualization - Clean 4 steps */}
            <div className="relative h-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
              {/* Grid background */}
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Process steps - 4 equal columns */}
              <div className="absolute inset-6 flex items-end gap-4">
                {[
                  { label: 'Design', height: 100 },
                  { label: 'Code', height: 75 },
                  { label: 'Test', height: 50 },
                  { label: 'Launch', height: 30 },
                ].map((step, i) => (
                  <div key={step.label} className="flex h-full flex-1 flex-col justify-end">
                    <motion.div
                      className="relative flex w-full items-end justify-center rounded-lg border border-[#0A84FF] bg-[#0A84FF]/10"
                      style={{ height: `${step.height}%` }}
                      initial={{ height: '20%', opacity: 0.5 }}
                      animate={{
                        height: [`${step.height * 0.4}%`, `${step.height}%`, `${step.height * 0.8}%`, `${step.height}%`],
                        opacity: [0.5, 1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                      }}
                    >
                      <span className="absolute bottom-3 rounded border border-[#0A84FF] bg-[#0A84FF]/20 px-2 py-1 text-[11px] font-medium text-[#72AEFF]">
                        {step.label}
                      </span>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold tracking-[-0.03em] md:text-[22px]">
                Clear development process.
                <span className="font-normal text-white/55">
                  {' '}
                  From brief to launch — you always know exactly where your project stands.
                </span>
              </h3>

              <Link
                href="/contact"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] bg-black px-5 text-[15px] font-medium text-white/80 transition hover:bg-white/[0.04] md:w-fit"
              >
                Learn about process
              </Link>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="sticky top-14 z-20 border-b border-white/[0.08] bg-black/95 backdrop-blur">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr]">
                <div className="border-r border-white/[0.08] px-6 py-5 text-[14px] text-white/55">
                  {"What's included"}
                </div>

                <div className="border-r border-white/[0.08] px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold">Starter</span>
                    <Link
                      href="/contact"
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/[0.12] bg-black px-4 text-[14px] font-medium text-white/80 transition hover:bg-white/[0.04]"
                    >
                      Start
                    </Link>
                  </div>
                </div>

                <div className="border-r border-white/[0.08] px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold">Business</span>
                    <Link
                      href="/contact"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-[#0A84FF] px-4 text-[14px] font-medium text-white transition hover:bg-[#117df0]"
                    >
                      Discuss
                    </Link>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold">Enterprise</span>
                    <Link
                      href="/contact"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[14px] font-medium text-black transition hover:bg-white/90"
                    >
                      Consult
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {sections.map((section) => (
              <div key={section.title} className="border-b border-white/[0.08]">
                <div className="border-b border-white/[0.08] px-8 py-12 md:px-10">
                  <p className="font-mono text-[13px] text-white/35">{section.eyebrow}</p>
                  <h3 className="mt-3 flex items-center gap-2 text-[22px] font-semibold tracking-[-0.03em]">
                    {section.title === 'Design & UI/UX' && <Layout className="h-5 w-5 text-white/70" />}
                    {section.title === 'Development & Integrations' && <Code className="h-5 w-5 text-white/70" />}
                    {section.title === 'Hosting & Maintenance' && <Rocket className="h-5 w-5 text-white/70" />}
                    {section.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[17px] leading-8 text-white/50">
                    {section.description}
                  </p>
                </div>

                {section.groups.map((group) => (
                  <div key={group.title}>
                    <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-white/[0.08]">
                      <div className="border-r border-white/[0.08] px-6 py-5">
                        <p className="text-[15px] font-semibold text-white">{group.title}</p>
                      </div>
                      <div className="border-r border-white/[0.08]" />
                      <div className="border-r border-white/[0.08]" />
                      <div />
                    </div>

                    {group.rows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-white/[0.08] last:border-b-0"
                      >
                        <div className="border-r border-white/[0.08] px-6 py-4">
                          <p className="text-[15px] leading-7 text-white/82">{row.label}</p>
                        </div>

                        <div className="flex items-center justify-center border-r border-white/[0.08] px-6 py-4 text-center">
                          <CellValue value={row.starter} />
                        </div>

                        <div className="flex items-center justify-center border-r border-white/[0.08] px-6 py-4 text-center">
                          <CellValue value={row.business} />
                        </div>

                        <div className="flex items-center justify-center px-6 py-4 text-center">
                          <CellValue value={row.enterprise} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Bottom sticky header */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div className="border-r border-white/[0.08] px-6 py-5 text-[15px] text-white/55">
                {"What's included"}
              </div>

              <div className="border-r border-white/[0.08] px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold">Starter</span>
                  <Link
                    href="/contact"
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white/[0.12] bg-black px-4 text-[14px] font-medium text-white/80 transition hover:bg-white/[0.04]"
                  >
                    Start
                  </Link>
                </div>
              </div>

              <div className="border-r border-white/[0.08] px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold">Business</span>
                  <Link
                    href="/contact"
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[#0A84FF] px-4 text-[14px] font-medium text-white transition hover:bg-[#117df0]"
                  >
                    Discuss
                  </Link>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold">Enterprise</span>
                  <Link
                    href="/contact"
                    className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[14px] font-medium text-black transition hover:bg-white/90"
                  >
                    Consult
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
