'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Topic } from '@/data/topics'
import { TOPIC_STEP_MAP } from '@/data/topics'
import { stepByNumber } from '@/lib/steps'
import { fadeUp, stagger } from '@/lib/motion'

function topicHref(topic: Topic): string {
  const stepInfo = TOPIC_STEP_MAP[topic.id]
  if (!stepInfo) return `/${topic.id}`
  const step = stepByNumber(stepInfo.step)
  if (!step) return `/${topic.id}`
  return `/steps/${step.slug}/${topic.id}`
}

function NavCard({ topic, direction }: { topic: Topic; direction: 'prev' | 'next' }) {
  const stepInfo = TOPIC_STEP_MAP[topic.id]
  const step = stepInfo ? stepByNumber(stepInfo.step) : undefined
  const isPrev = direction === 'prev'

  return (
    <motion.div variants={fadeUp} className="flex-1">
      <Link
        href={topicHref(topic)}
        className={`group block border border-[color:var(--color-border)] px-6 py-5 transition-colors hover:border-[color:var(--color-accent-line)] hover:bg-[color:var(--color-accent-soft)] ${isPrev ? 'text-left' : 'text-right'}`}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
          {isPrev ? 'Previous' : 'Next'}
        </div>
        <div
          className={`mt-2 flex items-center gap-2 font-[family-name:var(--font-display)] text-[18px] text-[color:var(--color-text-primary)] ${isPrev ? '' : 'justify-end'}`}
        >
          {isPrev && (
            <span className="transition-transform group-hover:-translate-x-0.5 text-[color:var(--color-accent)]">
              ←
            </span>
          )}
          <span className="truncate">{topic.title}</span>
          {!isPrev && (
            <span className="transition-transform group-hover:translate-x-0.5 text-[color:var(--color-accent)]">
              →
            </span>
          )}
        </div>
        {step && (
          <div className="mt-1 text-[12px] text-[color:var(--color-text-secondary)]">
            Step {String(step.step).padStart(2, '0')} · {step.arrow}
          </div>
        )}
      </Link>
    </motion.div>
  )
}

export default function TopicNav({ prev, next }: { prev: Topic | null; next: Topic | null }) {
  return (
    <motion.nav
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(0.06)}
      className="mt-20 pt-10 border-t border-[color:var(--color-border)] flex flex-col sm:flex-row items-stretch gap-3"
    >
      {prev ? <NavCard topic={prev} direction="prev" /> : <div className="flex-1" />}
      {next ? <NavCard topic={next} direction="next" /> : <div className="flex-1" />}
    </motion.nav>
  )
}
