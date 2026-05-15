'use client'
import { motion } from 'framer-motion'

export default function ConceptSection({ example }: { example: string }) {
  const lines = example.split('\n')
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
      className="px-8 py-6">
      <h2 className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'var(--color-text-muted)' }}>The Concept</h2>
      <div className="rounded-xl p-5 font-mono text-sm leading-relaxed"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {lines.map((line, i) => {
          const isComment = line.trim().startsWith('//')  || line.trim().startsWith('#') || line.trim().startsWith('•')
          const isCode = line.includes('→') || line.match(/[{}();]/)
          return (
            <div key={i} className={`${line === '' ? 'h-3' : ''}`}
              style={{ color: isComment ? 'var(--color-text-muted)' : isCode ? '#A5F3FC' : 'var(--color-text-primary)' }}>
              {line || ' '}
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
