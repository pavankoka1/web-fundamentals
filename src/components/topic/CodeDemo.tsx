'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Phase } from '@/lib/phaseColors'
import { phaseColor } from '@/lib/phaseColors'

interface Props {
  bad: string
  good: string
  label: string
  phase: Phase
}

export default function CodeDemo({ bad, good, label, phase }: Props) {
  const [view, setView] = useState<'bad' | 'good'>('bad')
  const color = phaseColor(phase)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </h2>
        <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          {(['bad', 'good'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: view === v ? (v === 'bad' ? '#2A0A0A' : color.bg) : 'transparent',
                color: view === v ? (v === 'bad' ? '#FF4D6D' : color.accent) : 'var(--color-text-muted)',
              }}>
              {v === 'bad' ? '✗ Slow' : '✓ Fast'}
            </button>
          ))}
        </div>
      </div>
      <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: view === 'bad' ? '#FF4D6D' : color.accent }} />
        <pre className="p-5 text-sm leading-relaxed overflow-x-auto"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
          <code>{view === 'bad' ? bad : good}</code>
        </pre>
      </div>
    </motion.section>
  )
}
