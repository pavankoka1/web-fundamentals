'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { topics, PHASES, type Topic } from '@/data/topics'
import { phaseColor } from '@/lib/phaseColors'
import { useProgress } from '@/hooks/useProgress'

function TopicLink({ topic, isActive, isVisited }: { topic: Topic; isActive: boolean; isVisited: boolean }) {
  const color = phaseColor(topic.phase)
  return (
    <Link
      href={`/${topic.id}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-150 group"
      style={{
        background: isActive ? color.bg : 'transparent',
        color: isActive ? color.accent : 'var(--color-text-secondary)',
        borderLeft: `2px solid ${isActive ? color.accent : 'transparent'}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
        style={{ background: isVisited ? color.accent : isActive ? color.accent : 'var(--color-border-bright)' }} />
      <span className="truncate leading-snug">{topic.title}</span>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { visited } = useProgress()
  const currentSlug = pathname.replace('/', '')

  return (
    <aside className="fixed left-0 top-12 bottom-0 w-56 overflow-y-auto py-4 hidden lg:block"
      style={{ background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)' }}>
      <nav className="space-y-4 px-2">
        {PHASES.map(phase => {
          const color = phaseColor(phase)
          const phaseTopics = topics.filter(t => t.phase === phase)
          return (
            <div key={phase}>
              <div className="px-3 mb-1 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: color.accent }}>
                  {phase}
                </span>
              </div>
              <div className="space-y-0.5">
                {phaseTopics.map(topic => (
                  <TopicLink
                    key={topic.id}
                    topic={topic}
                    isActive={topic.id === currentSlug}
                    isVisited={visited.has(topic.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
