'use client'
import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { topics } from '@/data/topics'

export default function TopNav() {
  const { visited } = useProgress()
  const pct = Math.round((visited.size / topics.length) * 100)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6"
      style={{ background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
      <Link href="/" className="flex items-center gap-2 group">
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--color-network)', color: '#000' }}>W</span>
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Web Internals
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-4">
        {pct > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'var(--color-network)' }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{pct}%</span>
          </div>
        )}
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md transition-colors"
          style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          GitHub
        </a>
      </div>
    </header>
  )
}
