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
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          {(['bad', 'good'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-1.5 text-xs font-medium transition-all"
              style={{
                background: view === v ? (v === 'bad' ? 'rgba(255,77,109,0.15)' : color.bg) : 'transparent',
                color: view === v ? (v === 'bad' ? '#FF4D6D' : color.accent) : 'var(--color-text-muted)',
              }}>
              {v === 'bad' ? '✗ Slow' : '✓ Fast'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${view === 'bad' ? 'rgba(255,77,109,0.2)' : color.dim}` }}>
        {/* Top accent line */}
        <div className="h-0.5" style={{ background: view === 'bad' ? '#FF4D6D' : color.accent }} />
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: view === 'bad' ? 'rgba(255,77,109,0.06)' : color.bg, borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <span className="text-xs ml-1" style={{ color: view === 'bad' ? 'rgba(255,77,109,0.7)' : color.accent, opacity: 0.7 }}>
            {view === 'bad' ? 'approach.ts — avoid this' : 'approach.ts — prefer this'}
          </span>
        </div>
        {/* Code */}
        <div style={{ background: '#0A0A14', overflowX: 'auto', maxWidth: '100%' }}>
          <pre className="p-5 text-sm leading-7 m-0 min-w-0"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              tabSize: 2,
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}>
            <code>{view === 'bad' ? bad : good}</code>
          </pre>
        </div>
      </div>
    </motion.section>
  )
}
