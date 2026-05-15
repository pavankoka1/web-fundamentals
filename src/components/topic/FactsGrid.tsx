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
      <h2 className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'var(--color-text-muted)' }}>Key Facts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topic.facts.map(([label, value], i) => (
          <motion.div key={label}
            initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-lg p-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="text-xs font-mono font-semibold mb-1.5" style={{ color: color.accent }}>
              {label}
            </div>
            <div className="text-sm leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
              {value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
