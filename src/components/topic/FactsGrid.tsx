'use client'
import { motion } from 'framer-motion'
import type { Topic } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'

export default function FactsGrid({ topic }: { topic: Topic }) {
  const color = phaseColor(topic.phase)
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
      className="px-8 py-6">
      <h2 className="text-xs font-semibold tracking-widest uppercase mb-5"
        style={{ color: 'var(--color-text-muted)' }}>Key Facts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topic.facts.map(([label, value], i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-xl p-4 group"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-start gap-2 mb-2">
              <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: color.accent }} />
              <div className="text-sm font-semibold leading-snug" style={{ color: color.accent }}>
                {label}
              </div>
            </div>
            <div className="text-sm leading-relaxed pl-3" style={{ color: 'var(--color-text-secondary)' }}>
              {value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
