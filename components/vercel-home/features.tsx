'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Eye, Settings, Upload, Menu, GitBranch, Globe, Shield, Zap, BarChart3 } from 'lucide-react'

// Grid background with plus signs at intersections
function GridBackground() {
  // 5 vertical lines with equal spacing (0%, 25%, 50%, 75%, 100% of inner area with 15% padding)
  const verticalPositions = [15, 32.5, 50, 67.5, 85]
  // 4 horizontal lines with equal spacing
  const horizontalPositions = [15, 38.33, 61.67, 85]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Vertical lines */}
        {verticalPositions.map((x) => (
          <line
            key={`v-${x}`}
            x1={`${x}%`}
            y1="0"
            x2={`${x}%`}
            y2="100%"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Horizontal lines */}
        {horizontalPositions.map((y) => (
          <line
            key={`h-${y}`}
            x1="0"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Plus signs at each intersection */}
        {verticalPositions.map((x) =>
          horizontalPositions.map((y) => (
            <g key={`plus-${x}-${y}`}>
              {/* Horizontal stroke of plus */}
              <line
                x1={`calc(${x}% - 4px)`}
                y1={`${y}%`}
                x2={`calc(${x}% + 4px)`}
                y2={`${y}%`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Vertical stroke of plus */}
              <line
                x1={`${x}%`}
                y1={`calc(${y}% - 4px)`}
                x2={`${x}%`}
                y2={`calc(${y}% + 4px)`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))
        )}
      </svg>
    </div>
  )
}

// Animated chart component
function AnimatedChart({ color, delay = 0 }: { color: string; delay?: number }) {
  const points = [
    { x: 0, y: 80 },
    { x: 60, y: 65 },
    { x: 120, y: 70 },
    { x: 180, y: 45 },
    { x: 240, y: 55 },
    { x: 300, y: 35 },
    { x: 360, y: 25 },
    { x: 420, y: 15 },
  ]

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <motion.svg
      viewBox="0 0 420 100"
      className="w-full h-full"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((y) => (
        <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {[0, 60, 120, 180, 240, 300, 360, 420].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <motion.path
        d={`${pathD} L 420 100 L 0 100 Z`}
        fill={`url(#gradient-${color})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: delay + 0.3 }}
      />

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      />

      {/* Dots */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: delay + 0.1 * i }}
        />
      ))}
    </motion.svg>
  )
}

// Toolbar component like Vercel
function ToolbarDemo() {
  return (
    <motion.div
      className="flex items-center gap-1 rounded-full border border-white/10 bg-black/80 px-2 py-1.5 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
        <MessageSquare className="h-4 w-4 text-white/70" />
      </button>
      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
        <GitBranch className="h-4 w-4 text-white/70" />
      </button>
      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
        <Eye className="h-4 w-4 text-white/70" />
      </button>
      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
        <Settings className="h-4 w-4 text-white/70" />
      </button>
      <div className="mx-1 h-5 w-px bg-white/10" />
      <div className="flex -space-x-1.5">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 ring-2 ring-black" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 ring-2 ring-black" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 ring-2 ring-black" />
      </div>
      <div className="mx-1 h-5 w-px bg-white/10" />
      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
        <Upload className="h-4 w-4 text-white/70" />
      </button>
      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
        <Menu className="h-4 w-4 text-white/70" />
      </button>
    </motion.div>
  )
}

// PR List item
function PRItem({ title, branch, time, user, status, delay }: {
  title: string
  branch: string
  time: string
  user: string
  status: 'active' | 'resolved' | 'partial'
  delay: number
}) {
  return (
    <motion.div
      className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <GitBranch className="h-4 w-4 text-white/50" />
        </div>
        <div className={`h-2 w-2 rounded-full ${status === 'active' ? 'bg-blue-400' : status === 'resolved' ? 'bg-green-400' : 'bg-yellow-400'}`} />
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-white/40">
            <span className="font-mono text-blue-400">{branch}</span>
            <span className="mx-1.5">·</span>
            {time}
            <span className="mx-1.5">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-4 w-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
              {user}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/40">
        {status === 'active' && <span className="text-white/60">Comment</span>}
        {status === 'partial' && (
          <span className="flex items-center gap-1">
            <span className="text-white/60">4/5 Resolved</span>
            <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          </span>
        )}
        {status === 'resolved' && (
          <span className="flex items-center gap-1 text-green-400">
            5/5 Resolved
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
    </motion.div>
  )
}

// Analytics card
function AnalyticsCard() {
  const sources = [
    { name: 'google.com', icon: 'G', color: 'bg-white', visitors: '259,010' },
    { name: 'vercel.com', icon: '▲', color: 'bg-white', visitors: '132,821' },
    { name: 'x.com', icon: 'X', color: 'bg-white', visitors: '51,280' },
    { name: 'ycombinator.com', icon: 'Y', color: 'bg-orange-500', visitors: '27,102' },
  ]

  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] bg-black/40 p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-white/50">Top Sources</span>
        <span className="text-xs text-white/30">Visitors</span>
      </div>
      <div className="space-y-3">
        {sources.map((source, i) => (
          <motion.div
            key={source.name}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${source.color} text-black`}>
                {source.icon}
              </div>
              <span className="text-sm text-white/70">{source.name}</span>
            </div>
            <span className="font-mono text-sm text-white/50">{source.visitors}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// App Logs component
function AppLogs() {
  const logs = [
    { time: '24:59', type: 'fn', method: 'GET', status: '200', path: '/app/front/ap...' },
    { time: '24:52', type: 'rt', method: 'GET', status: '200', path: '/status/api' },
    { time: '24:50', type: 'fn', method: 'GET', status: '200', path: '/docs' },
    { time: '24:43', type: 'rt', method: 'GET', status: '200', path: '/api/jwt' },
  ]

  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] bg-black/40 p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">App Logs</span>
        <span className="font-mono text-xs text-white/30">13:39</span>
      </div>
      <div className="space-y-2">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: 0.4 + i * 0.1 }}
          >
            <span className="font-mono text-white/30">{log.time}</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50">{log.type}</span>
            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] text-blue-400">{log.method}</span>
            <span className="rounded bg-green-500/20 px-1.5 py-0.5 font-mono text-[10px] text-green-400">{log.status}</span>
            <span className="truncate font-mono text-white/40">{log.path}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Code block component
function CodeBlock({ code, highlightLines = [] }: { code: string; highlightLines?: number[] }) {
  const lines = code.trim().split('\n')

  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/60"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${highlightLines.includes(i) ? 'bg-yellow-500/10 -mx-4 px-4 border-l-2 border-yellow-500' : ''}`}
          >
            <code>
              {line.split(/(\b(?:import|from|export|default|async|function|await|return|const)\b|'[^']*'|"[^"]*"|\{|\}|\(|\)|=>|;)/g).map((part, j) => {
                if (['import', 'from', 'export', 'default', 'async', 'function', 'await', 'return', 'const'].includes(part)) {
                  return <span key={j} className="text-pink-400">{part}</span>
                }
                if (part.startsWith("'") || part.startsWith('"')) {
                  return <span key={j} className="text-green-400">{part}</span>
                }
                if (['{', '}', '(', ')', '=>', ';'].includes(part)) {
                  return <span key={j} className="text-white/40">{part}</span>
                }
                return <span key={j} className="text-white/80">{part}</span>
              })}
            </code>
          </div>
        ))}
      </pre>
    </motion.div>
  )
}

// Feature section wrapper
function FeatureSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-b border-white/[0.06] ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {children}
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="services" className="relative bg-black">
      <GridBackground />

      {/* Section 1: Software for your business */}
      <FeatureSection className="py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left content */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[42px] md:leading-[1.15]">
              Software for your business
              <br />
              built from the ground up.
            </h2>
            <p className="mt-6 text-base text-white/50 md:text-lg">
              From premium websites to SaaS and
              <br className="hidden md:block" />
              business dashboards, Koryx turns
              <br className="hidden md:block" />
              your idea into software built for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
              >
                <span className="text-xs">▲</span>
                Start Project
              </a>
              <a
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                Explore Services
              </a>
            </div>
          </motion.div>

          {/* Right - Charts and analytics */}
          <div className="relative">
            {/* Main chart area */}
            <div className="relative h-[300px] overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 p-4 md:h-[400px]">
              {/* Chart background grid */}
              <div className="absolute inset-4 grid grid-cols-8 gap-px">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-l border-white/[0.04]" />
                ))}
              </div>

              {/* Orange chart */}
              <div className="absolute inset-x-4 bottom-20 h-32 md:h-48">
                <AnimatedChart color="#f97316" delay={0} />
              </div>

              {/* Green chart overlay */}
              <div className="absolute inset-x-4 bottom-4 h-24 md:h-36">
                <AnimatedChart color="#22c55e" delay={0.5} />
              </div>

              {/* Tooltip */}
              <motion.div
                className="absolute right-8 top-8 rounded-lg border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <p className="text-xs text-white/50">Example dashboard</p>
                <p className="text-lg font-bold text-white">631,609</p>
                <p className="text-xs text-white/30">Illustrative data</p>
              </motion.div>
            </div>

            {/* Bottom cards */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <AppLogs />
              <AnalyticsCard />
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* Section 2: Keep pushing forward */}
      <FeatureSection className="py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left - Testimonial */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Pink vertical line */}
            <div className="absolute -left-8 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent lg:block" />
            
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
              <p className="text-lg text-white/70 leading-relaxed">
                <span className="text-white/30">&ldquo;</span>
                Your project starts with a clear brief. You review the design and working previews before we launch your finished website or application.
                <span className="text-white/30">&rdquo;</span>
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold tracking-[0.2em] text-white">KORYX</span>
                <svg className="h-5 w-5 text-white/30" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Right - PR list */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold text-white">
                <span className="text-white">Stay involved at every stage.</span>{' '}
                <span className="text-white/50">We share working previews, collect your feedback, and build around the way your business works.</span>
              </h3>
            </motion.div>

            <div className="mt-8 space-y-3">
              <PRItem
                title="Design your business website"
                branch="rf/app-router"
                time="2m ago"
                user="rauno"
                status="active"
                delay={0.2}
              />
              <PRItem
                title="Build your client dashboard"
                branch="21342-banner"
                time="2h ago"
                user="timo"
                status="partial"
                delay={0.3}
              />
              <PRItem
                title="Test and launch your application"
                branch="ff/new-flag"
                time="1d ago"
                user="mrncst"
                status="resolved"
                delay={0.4}
              />
            </div>

            {/* Toolbar */}
            <div className="mt-12 flex justify-center">
              <ToolbarDemo />
            </div>

            <motion.p
              className="mt-6 text-center text-white/50"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className="font-semibold text-white">Your project workspace.</span>{' '}
              Clear progress and feedback.
              <br />
              Review your website before it goes live.
            </motion.p>
          </div>
        </div>
      </FeatureSection>

      {/* Section 3: Track custom events */}
      <FeatureSection className="py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left - Code */}
          <div>
            <motion.div
              className="mb-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <BarChart3 className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/40">Analytics tracking</span>
            </motion.div>

            <motion.h3
              className="mb-6 text-xl font-bold text-white md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Track{' '}
              <span className="text-white">custom events</span>{' '}
              <span className="text-white/50">so you can understand inquiries, signups, and bookings.</span>
            </motion.h3>

            <CodeBlock
              code={`import { track } from '@vercel/analytics';

function SignupButton() {
  return (
    <button
      onClick={() => {
        track('Signup', {
          location: 'Hero'
        });
      }}
    >
`}
              highlightLines={[6, 7, 8, 9]}
            />
          </div>

          {/* Right - Analytics visualization */}
          <div>
            <motion.div
              className="mb-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Globe className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/40">Business analytics</span>
            </motion.div>

            <motion.h3
              className="mb-6 text-xl font-bold text-white md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white">Traffic sources, leads, bookings</span>
              <span className="text-white/50">, and the numbers that matter to your business.</span>
            </motion.h3>

            {/* Analytics dashboard mockup */}
            <motion.div
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/40"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] font-bold text-black">G</div>
                  <span className="text-sm text-white/70">google.com</span>
                </div>
                <span className="text-sm text-white/50">Example visitor report</span>
              </div>

              {/* Colored tabs */}
              <div className="flex border-b border-white/[0.06]">
                {['#ef4444', '#f97316', '#22c55e', '#06b6d4', '#10b981'].map((color, i) => (
                  <div key={i} className="flex-1 py-2" style={{ backgroundColor: `${color}20` }}>
                    <div className="mx-auto h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                ))}
              </div>

              {/* Page stats */}
              <div className="p-4 space-y-2">
                {[
                  { path: '/login', views: '714K' },
                  { path: '/dashboard', views: '521K' },
                  { path: '/new', views: '249K' },
                ].map((page, i) => (
                  <motion.div
                    key={page.path}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  >
                    <span className="font-mono text-sm text-white/60">{page.path}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 rounded-full bg-white/20" style={{ width: `${100 - i * 25}px` }} />
                      <span className="font-mono text-sm text-white/40">{page.views}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </FeatureSection>

      {/* Section 4: Security features */}
      <FeatureSection className="py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left - Framework config */}
          <div>
            <motion.div
              className="mb-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Zap className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/40">Fast, maintainable software</span>
            </motion.div>

            <motion.h3
              className="mb-6 text-xl font-bold text-white md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white">Performance is part</span>{' '}
              <span className="text-white/50">of the build: responsive pages, optimized assets, and a backend designed for your workflow.</span>
            </motion.h3>

            <CodeBlock
              code={`'use server'

import { revalidateTag } from 'next/cache';

export default async function submit() {
  await addPost();
  revalidateTag('posts', 'max');
}`}
              highlightLines={[]}
            />
          </div>

          {/* Right - Security */}
          <div>
            <motion.div
              className="mb-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Shield className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/40">Built-in security</span>
            </motion.div>

            <motion.h3
              className="mb-8 text-xl font-bold text-white md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white">Authentication and permissions</span>{' '}
              <span className="text-white/50">designed around your customers, team, and data.</span>
            </motion.h3>

            {/* Security animation */}
            <motion.div
              className="mb-8 flex justify-center gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Shield className={`h-5 w-5 ${i === 3 ? 'text-white/40' : 'text-white/20'}`} />
                  <motion.div
                    className={`h-12 w-0.5 rounded-full ${i === 3 ? 'bg-green-500' : 'bg-red-500/80'}`}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    style={{ transformOrigin: 'top' }}
                  />
                </div>
              ))}
            </motion.div>

            {/* Security features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, title: 'Accounts', subtitle: 'Authentication' },
                { icon: Globe, title: 'Private data', subtitle: 'Permissions' },
                { icon: Settings, title: 'Forms', subtitle: 'Validation' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                >
                  <feature.icon className="mb-3 h-5 w-5 text-white/40" />
                  <p className="text-sm font-medium text-white">{feature.title}</p>
                  <p className="text-sm text-white/40">{feature.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* Bottom CTA */}
      <div className="border-b border-white/[0.06] py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <motion.h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Your business. Your software. Built by Koryx.
          </motion.h2>
        </div>
      </div>
    </section>
  )
}
