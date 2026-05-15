'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Topic } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'

export default function TopicNav({ prev, next }: { prev: Topic | null; next: Topic | null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.4 }}
      className="px-8 py-8 flex items-center justify-between gap-4"
      style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem' }}>
      {prev ? (
        <Link href={`/${prev.id}`} className="group flex items-center gap-3 p-4 rounded-xl flex-1 max-w-xs transition-all"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>←</span>
          <div>
            <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Previous</div>
            <div className="text-sm font-medium" style={{ color: phaseColor(prev.phase).accent }}>{prev.title}</div>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={`/${next.id}`} className="group flex items-center gap-3 p-4 rounded-xl flex-1 max-w-xs transition-all text-right justify-end"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div>
            <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Next</div>
            <div className="text-sm font-medium" style={{ color: phaseColor(next.phase).accent }}>{next.title}</div>
          </div>
          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
        </Link>
      ) : <div />}
    </motion.div>
  )
}
