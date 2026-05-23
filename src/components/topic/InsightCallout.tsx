'use client'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'

export default function InsightCallout({ insight }: { insight: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      className="mt-20"
    >
      <div
        className="relative overflow-hidden border-l-2 border-[color:var(--color-accent-line)] pl-8 pr-6 py-7"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at top left, var(--color-accent-soft) 0%, transparent 60%)',
        }}
      >
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[16px] text-[color:var(--color-accent)]">✦</span>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
              Engineer&apos;s Insight
            </div>
          </div>
          <p className="font-[family-name:var(--font-display)] text-[18px] italic leading-relaxed text-[color:var(--color-text-primary)] max-w-[52ch]">
            {insight}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
