'use client'
import { motion } from 'framer-motion'
import type { Topic } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'

export default function TopicHero({ topic }: { topic: Topic }) {
  const color = phaseColor(topic.phase)
  return (
    <div className="relative pt-10 pb-8 px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: color.bg, color: color.accent, border: `1px solid ${color.dim}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.accent }} />
            {topic.phase}
          </span>
          <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {String(topic.order).padStart(2, '0')} / 16
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-none"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
          {topic.title}
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          {topic.subtitle}
        </p>
      </motion.div>
    </div>
  )
}
