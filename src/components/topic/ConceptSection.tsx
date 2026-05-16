'use client'
import { motion } from 'framer-motion'

function parseLine(line: string): { type: 'step' | 'bullet' | 'code' | 'spacer' | 'heading' | 'prose'; content: string; num?: string } {
  if (line === '') return { type: 'spacer', content: '' }
  const stepMatch = line.match(/^(\d+)\.\s+(.+)/)
  if (stepMatch) return { type: 'step', num: stepMatch[1], content: stepMatch[2] }
  if (line.trim().startsWith('•') || line.trim().startsWith('-')) return { type: 'bullet', content: line.replace(/^[\s•\-]+/, '') }
  if (line.match(/^(GET|POST|←|→|HTTP|<|{|}|\/\/|#)/) || line.includes(': ') && line.match(/[A-Z]{2,}/)) return { type: 'code', content: line }
  if (line.endsWith(':') || (line.length < 60 && line.includes('—'))) return { type: 'heading', content: line }
  return { type: 'prose', content: line }
}

export default function ConceptSection({ example }: { example: string }) {
  const lines = example.split('\n')
  const parsed = lines.map(parseLine)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
      className="px-8 py-6">
      <h2 className="text-xs font-semibold tracking-widest uppercase mb-5"
        style={{ color: 'var(--color-text-muted)' }}>The Concept</h2>

      <div className="space-y-1.5">
        {parsed.map((item, i) => {
          if (item.type === 'spacer') return <div key={i} className="h-2" />

          if (item.type === 'step') return (
            <div key={i} className="flex items-start gap-3 py-1">
              <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
                {item.num}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{item.content}</span>
            </div>
          )

          if (item.type === 'bullet') return (
            <div key={i} className="flex items-start gap-2.5 py-0.5 pl-1">
              <span className="flex-shrink-0 w-1 h-1 rounded-full mt-2" style={{ background: 'var(--color-text-muted)' }} />
              <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{item.content}</span>
            </div>
          )

          if (item.type === 'heading') return (
            <p key={i} className="text-sm font-medium pt-2 pb-1" style={{ color: 'var(--color-text-primary)' }}>
              {item.content}
            </p>
          )

          if (item.type === 'code') return (
            <div key={i}
              className="font-mono text-xs leading-relaxed px-3 py-1.5 rounded-md overflow-x-auto"
              style={{ background: 'rgba(0,212,255,0.04)', color: '#A5F3FC', border: '1px solid rgba(0,212,255,0.08)', whiteSpace: 'pre' }}>
              {item.content}
            </div>
          )

          return (
            <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {item.content}
            </p>
          )
        })}
      </div>
    </motion.section>
  )
}
