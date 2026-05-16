'use client'
import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { topics } from '@/data/topics'
import MouseEye from '@/components/MouseEye'

function TraceLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Signal path: three nodes connected by a route */}
      <circle cx="3" cy="11" r="2.5" fill="#00D4FF" />
      <circle cx="11" cy="5" r="2" fill="#00D4FF" opacity="0.7" />
      <circle cx="19" cy="11" r="2.5" fill="#00D4FF" />
      <circle cx="11" cy="17" r="1.5" fill="#00D4FF" opacity="0.4" />
      <path d="M5.5 11 L9 5.5" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M13 5.5 L16.5 11" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M5.5 11 L9.5 16.5" stroke="#00D4FF" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M12.5 16.5 L16.5 11" stroke="#00D4FF" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      {/* Animated pulse dot in center */}
      <circle cx="11" cy="11" r="1.5" fill="#00D4FF" opacity="0.9" />
    </svg>
  )
}

export default function TopNav() {
  const { visited } = useProgress()
  const pct = Math.round((visited.size / topics.length) * 100)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6"
      style={{ background: 'rgba(8,8,15,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--color-border)' }}>
      <Link href="/" className="flex items-center gap-2.5 group">
        <TraceLogo />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          trace
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-4">
        {pct > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-px rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00D4FF, #00E5A0)' }} />
            </div>
            <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{pct}%</span>
          </div>
        )}
        <MouseEye />
      </div>
    </header>
  )
}
