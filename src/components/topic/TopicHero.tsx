'use client'
import { motion } from 'framer-motion'
import type { Topic } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'

export default function TopicHero({ topic }: { topic: Topic }) {
  const color = phaseColor(topic.phase)
  return (
    <div className="relative pt-8 pb-6 px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4"
          style={{ background: color.bg, color: color.accent, border: `1px solid ${color.dim}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.accent }} />
          {topic.phase}
        </span>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-bold tabular-nums" style={{ color: color.accent, opacity: 0.3 }}>
            {String(topic.order).padStart(2, '0')}
          </span>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {topic.title}
          </h1>
        </div>
        <p className="text-base max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          {topic.subtitle}
        </p>
      </motion.div>
    </div>
  )
}
