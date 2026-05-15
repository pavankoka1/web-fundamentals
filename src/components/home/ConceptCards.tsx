'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { topics } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'

export default function ConceptCards() {
  return (
    <section className="px-6 py-8 max-w-6xl mx-auto pb-24">
      <motion.h2
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
        className="text-xs font-semibold tracking-widest uppercase mb-6"
        style={{ color: 'var(--color-text-muted)' }}>
        All 16 Concepts
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {topics.map((topic, i) => {
          const color = phaseColor(topic.phase)
          return (
            <motion.div key={topic.id}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}>
              <Link href={`/${topic.id}`}
                className="block p-4 rounded-xl group transition-all duration-200 hover:border-opacity-80"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-lg font-bold tabular-nums" style={{ color: color.accent, opacity: 0.4 }}>
                    {String(topic.order).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide"
                    style={{ background: color.bg, color: color.accent }}>
                    {topic.phase}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1.5 leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                  {topic.title}
                </h3>
                <p className="text-xs leading-snug line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                  {topic.subtitle}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
