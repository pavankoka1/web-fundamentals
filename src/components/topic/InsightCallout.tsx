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
      <div className="rounded-xl p-6 relative overflow-hidden"
        style={{ background: color.bg, borderLeft: `3px solid ${color.accent}`, border: `1px solid ${color.dim}` }}>
        <div className="absolute top-4 right-4 text-2xl opacity-20" style={{ color: color.accent }}>✦</div>
        <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: color.accent }}>
          Engineer&apos;s Insight
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {insight}
        </p>
      </div>
    </motion.section>
  )
}
