'use client'
import { motion } from 'framer-motion'
import type { Phase } from '@/lib/phaseColors'
import { phaseColor } from '@/lib/phaseColors'

export default function InsightCallout({ insight, phase }: { insight: string; phase: Phase }) {
  const color = phaseColor(phase)
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
      className="px-8 py-4">
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: color.bg, borderLeft: `3px solid ${color.accent}`, border: `1px solid ${color.dim}` }}>
        {/* Decorative glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color.accent}18 0%, transparent 70%)` }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base" style={{ color: color.accent }}>✦</span>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: color.accent }}>
              Engineer&apos;s Insight
            </div>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            {insight}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
