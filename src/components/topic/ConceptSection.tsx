'use client'
import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/motion'

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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(0.04)}
      className="mt-16"
    >
      <motion.h2
        variants={fadeUp}
        className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]"
      >
        The Concept
      </motion.h2>

      <div className="space-y-1.5">
        {parsed.map((item, i) => {
          if (item.type === 'spacer') return <div key={i} className="h-2" />

          if (item.type === 'step') return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-start gap-3 py-1"
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-mono font-medium flex items-center justify-center mt-0.5 text-[color:var(--color-text-primary)] border border-[color:var(--color-accent)]"
              >
                {item.num}
              </span>
              <span
                className="font-[family-name:var(--font-display)] text-[16px] leading-[1.65] text-[color:var(--color-text-primary)] max-w-[58ch]"
              >
                {item.content}
              </span>
            </motion.div>
          )

          if (item.type === 'bullet') return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-start gap-2.5 py-0.5 pl-1"
            >
              <span
                className="flex-shrink-0 w-1 h-1 rounded-full mt-[10px] bg-[color:var(--color-text-muted)]"
              />
              <span className="text-[14px] leading-[1.65] text-[color:var(--color-text-secondary)] max-w-[58ch]">
                {item.content}
              </span>
            </motion.div>
          )

          if (item.type === 'heading') return (
            <motion.p
              key={i}
              variants={fadeUp}
              className="font-[family-name:var(--font-display)] text-[15px] pt-3 pb-1 text-[color:var(--color-text-primary)]"
            >
              {item.content}
            </motion.p>
          )

          if (item.type === 'code') return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="font-mono text-[12px] leading-relaxed px-3 py-1.5 overflow-x-auto border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-accent)]"
              style={{ whiteSpace: 'pre' }}
            >
              {item.content}
            </motion.div>
          )

          return (
            <motion.p
              key={i}
              variants={fadeUp}
              className="text-[14px] leading-[1.65] text-[color:var(--color-text-secondary)] max-w-[58ch]"
            >
              {item.content}
            </motion.p>
          )
        })}
      </div>
    </motion.section>
  )
}
