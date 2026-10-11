'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { CdnGridBackground } from './cdn-grid-background'

export function Hero() {
  return (
    <section className="relative min-h-screen bg-black pt-24">
      <CdnGridBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col items-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-2 mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.035] px-4 py-2 text-[13px] text-white/55 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Premium web development for ambitious brands
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.div>

        <div className="relative z-20 w-full max-w-[720px] overflow-visible border border-white/[0.08] bg-black/70 px-5 py-12 shadow-[0_0_90px_rgba(255,255,255,0.035)] backdrop-blur-[2px] md:px-12 md:py-16">
          <svg
  className="pointer-events-none absolute -bottom-[8px] -right-[8px] z-[999] h-4 w-4 text-white/75"
  viewBox="0 0 16 16"
  fill="none"
  aria-hidden="true"
>
  <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
  <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
</svg>

          <svg
  className="pointer-events-none absolute -left-[8px] -top-[8px] z-[999] h-4 w-4 text-white/75"
  viewBox="0 0 16 16"
  fill="none"
  aria-hidden="true"
>
  <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
  <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
</svg>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-[48px] font-bold leading-[0.98] tracking-[-0.055em] text-transparent sm:text-[70px] md:text-[82px]"
          >
            Build & deploy
            <br />
            the best web
            <br />
            experiences
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-8 max-w-[620px] text-[15px] leading-7 text-white/48 md:text-[17px]"
          >
            Koryx designs and builds premium websites, SaaS applications, and custom software
            for your business — from the first idea to a complete launch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-7 text-[15px] font-semibold text-black transition hover:scale-[1.02] sm:w-auto"
            >
              Start Project
            </a>

            <a
              href="#services"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/[0.13] bg-black/45 px-7 text-[15px] font-medium text-white/75 transition hover:bg-white/[0.07] sm:w-auto"
            >
              View Services
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          <p className="mt-7 text-[13px] text-white/25">
            Custom code · Premium UI · Built for conversion
          </p>
        </div>
      </div>
    </section>
  )
}
