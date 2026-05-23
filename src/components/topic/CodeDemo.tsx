'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'

interface Props {
  bad: string
  good: string
  label: string
}

export default function CodeDemo({ bad, good, label }: Props) {
  const [view, setView] = useState<'bad' | 'good'>('bad')
  const isBad = view === 'bad'

  const accentColor = isBad ? 'var(--color-negative)' : 'var(--color-accent)'
  const accentSoft = isBad ? 'var(--color-negative-soft)' : 'var(--color-accent-soft)'

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(0.06)}
      className="mt-20"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between mb-4"
      >
        <h2
          className="font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          {label}
        </h2>
        <div className="flex border border-[color:var(--color-border)]">
          {(['bad', 'good'] as const).map((v) => {
            const active = view === v
            const vIsBad = v === 'bad'
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors"
                style={{
                  background: active
                    ? vIsBad
                      ? 'var(--color-negative-soft)'
                      : 'var(--color-accent-soft)'
                    : 'transparent',
                  color: active
                    ? vIsBad
                      ? 'var(--color-negative)'
                      : 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                  borderLeft: v === 'good' ? '1px solid var(--color-border)' : 'none',
                }}
              >
                {vIsBad ? '✗ Slow' : '✓ Fast'}
              </button>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
      >
        <div
          className="h-px"
          style={{ background: accentColor, opacity: 0.4 }}
        />
        <div
          className="flex items-center gap-2 px-5 py-2 border-b border-[color:var(--color-border)]"
          style={{ background: accentSoft }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: accentColor }}
          >
            {isBad ? 'approach.ts — avoid this' : 'approach.ts — prefer this'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <pre
            className="p-6 m-0 font-mono text-[13px] leading-[1.7] text-[color:var(--color-text-primary)]"
            style={{ tabSize: 2, whiteSpace: 'pre' }}
          >
            <code>{isBad ? bad : good}</code>
          </pre>
        </div>
      </motion.div>
    </motion.section>
  )
}
