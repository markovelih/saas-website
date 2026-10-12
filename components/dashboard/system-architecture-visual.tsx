'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Code2, Globe2, Sparkles, UploadCloud } from 'lucide-react'

const steps = [
  { label: 'Brief received', value: 'Done' },
  { label: 'Design system', value: 'In progress' },
  { label: 'Development', value: 'Next' },
  { label: 'Launch', value: 'Queued' },
]

const codeLines = [
  '<KoryxProject status="active">',
  '  strategy: conversion-first',
  '  stack: Next.js + Supabase',
  '  delivery: premium build',
  '</KoryxProject>',
]

export function SystemArchitectureVisual() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_55%_90%,rgba(168,85,247,0.16),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative border-b border-white/[0.08] px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
              Live client workspace
            </div>

            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
              Project Command Center
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-white/45">
              Track your website from first brief to launch — design, code, files, updates, and delivery status in one premium workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-black/40 px-3 py-1.5 text-xs text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            Build in progress
          </div>
        </div>
      </div>

      <div className="relative grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.1] bg-black/55 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Website redesign</p>
                <p className="mt-1 text-xs text-white/40">Koryx production flow</p>
              </div>

              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                Active
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: '18%' }}
                animate={{ width: ['18%', '64%', '48%', '72%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3"
                >
                  <p className="text-[11px] text-white/35">{step.label}</p>
                  <p className="mt-1 text-sm font-medium text-white">{step.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: UploadCloud, title: 'Files', text: 'Upload brand assets' },
              { icon: Code2, title: 'Build', text: 'Premium coded pages' },
              { icon: Globe2, title: 'Launch', text: 'Deploy-ready website' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-black">
                  <item.icon className="h-5 w-5 text-white/80" />
                </div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-white/40">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.1] bg-black/70 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            <span className="ml-3 text-xs text-white/35">project.tsx</span>
          </div>

          <div className="space-y-3 font-mono text-sm">
            {codeLines.map((line, index) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.18, repeat: Infinity, repeatDelay: 6 }}
                className="flex gap-3"
              >
                <span className="w-5 text-right text-white/20">{index + 1}</span>
                <span className={index === 1 ? 'text-blue-300' : index === 2 ? 'text-purple-300' : index === 3 ? 'text-emerald-300' : 'text-white/70'}>
                  {line}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {['SEO structure', 'Responsive layout', 'Speed optimization'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm text-white/65">{item}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/25" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
