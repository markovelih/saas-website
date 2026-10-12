'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface LightBeamProps {
  delay?: number
  duration?: number
  path: { x: string[]; y: string[] }
  color: string
  className?: string
}

function LightBeam({ delay = 0, duration = 4, path, color, className = '' }: LightBeamProps) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        x: path.x,
        y: path.y,
        opacity: [0, 0.75, 0.75, 0],
        scale: [0.75, 1, 1, 0.75],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={`pointer-events-none absolute z-10 h-[2px] w-[150px] ${className}`}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, white, ${color}, transparent)`,
          boxShadow: `0 0 18px 1px ${color}`,
          filter: 'blur(0.35px)',
        }}
      />
      <div
        className="absolute inset-0 h-full w-full rounded-full blur-[10px] opacity-30"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  )
}

export function CdnGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0 overflow-hidden [perspective:1000px]"
        style={{
          maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 88%)',
        }}
      >
        <div className="absolute left-1/2 top-[50%] h-[850px] w-[1450px] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(58deg)] [transform-style:preserve-3d] max-md:h-[720px] max-md:w-[980px]">
          <div
            className="absolute inset-[-35%] opacity-[0.34] max-md:opacity-[0.42]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.34) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.34) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }}
          />

          <div className="absolute inset-0 mix-blend-screen">
            <LightBeam
              color="#38bdf8"
              path={{ x: ['8%', '45%', '75%'], y: ['78%', '50%', '28%'] }}
              duration={4.2}
              delay={0}
              className="-skew-x-[24deg]"
            />

            <LightBeam
              color="#34d399"
              path={{ x: ['78%', '55%', '28%'], y: ['20%', '40%', '62%'] }}
              duration={4.8}
              delay={0.8}
              className="-skew-x-[24deg]"
            />

            <LightBeam
              color="#60a5fa"
              path={{ x: ['86%', '62%', '38%'], y: ['48%', '52%', '58%'] }}
              duration={4.4}
              delay={1.6}
              className="-skew-x-[24deg]"
            />
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-[49%] h-[440px] w-[780px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.92)_48%,transparent_72%)] max-md:h-[500px] max-md:w-[92vw]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.18)_58%,#000_100%)]" />
    </div>
  )
}
