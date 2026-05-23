'use client'
import { motion } from 'framer-motion'
import type { Topic } from '@/data/topics'
import { stagger, fadeUp } from '@/lib/motion'

export default function FactsGrid({ topic }: { topic: Topic }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(0.05)}
      className="mt-20"
    >
      <motion.h2
        variants={fadeUp}
        className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]"
      >
        Key Facts
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--color-border)] border border-[color:var(--color-border)]">
        {topic.facts.map(([label, value]) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="px-5 py-4 bg-[color:var(--color-surface)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                {label}
              </div>
            </div>
            <div className="text-[14px] leading-[1.6] text-[color:var(--color-text-primary)]">
              {value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
