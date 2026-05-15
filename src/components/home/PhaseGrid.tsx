'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PHASES, topics, getTopicsByPhase } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'

const PHASE_ICONS: Record<string, string> = {
  Network: '⟳',
  Browser: '◈',
  Render: '▦',
  Execute: '⚡',
  Optimize: '◎',
}

export default function PhaseGrid() {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Five phases. Sixteen concepts.
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Every concept in the modern web request lifecycle, explained visually.
        </p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PHASES.map((phase, i) => {
          const color = phaseColor(phase)
          const phaseTopics = getTopicsByPhase(phase)
          const firstTopic = phaseTopics[0]
          return (
            <motion.div key={phase}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <Link href={`/${firstTopic.id}`}
                className="block p-5 rounded-xl group transition-all duration-200 hover:scale-[1.02]"
                style={{ background: color.bg, border: `1px solid ${color.dim}` }}>
                <div className="text-2xl mb-3" style={{ color: color.accent }}>{PHASE_ICONS[phase]}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: color.accent }}>{phase}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {phaseTopics.length} topics
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
