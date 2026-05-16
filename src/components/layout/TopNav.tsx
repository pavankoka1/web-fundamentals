'use client'
import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { topics } from '@/data/topics'
import MouseEye from '@/components/MouseEye'

function WFLogo() {
  return (
    <svg width="52" height="22" viewBox="0 0 52 22" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="wfg" x1="0" y1="0" x2="52" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00D4FF" stopOpacity="0.95" />
          <stop offset="62%"  stopColor="#00D4FF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.07" />
        </linearGradient>
      </defs>
      {/* Sine wave — 1.5 cycles fading right */}
      <path
        d="M3 11 C6 11 7 3 10 3 C13 3 14 19 17 19 C20 19 21 3 24 3 C27 3 28 19 31 19 C34 19 35 3 38 3 C41 3 42 11 45 11 C47 11 48 11 49 11"
        stroke="url(#wfg)" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Glow pass */}
      <path
        d="M3 11 C6 11 7 3 10 3 C13 3 14 19 17 19 C20 19 21 3 24 3 C27 3 28 19 31 19 C34 19 35 3 38 3 C41 3 42 11 45 11 C47 11 48 11 49 11"
        stroke="#00D4FF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.06"
      />
      {/* Node dots — protocol checkpoints */}
      <circle cx="3"  cy="11" r="2.8" fill="#00D4FF" opacity="0.95" />
      <circle cx="10" cy="3"  r="2.2" fill="#00D4FF" opacity="0.65" />
      <circle cx="24" cy="3"  r="1.8" fill="#00D4FF" opacity="0.40" />
      <circle cx="38" cy="3"  r="1.4" fill="#00D4FF" opacity="0.22" />
    </svg>
  )
}

export default function TopNav() {
  const { visited } = useProgress()
  const pct = Math.round((visited.size / topics.length) * 100)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6"
      style={{
        background: 'rgba(6,6,12,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 group" aria-label="Web Fundamentals home">
        <WFLogo />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Editorial wordmark — option 3 */}
          <span style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '10px',
            fontWeight: 500,
            color: '#00D4FF',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.65,
            lineHeight: 1,
          }}>
            web
          </span>
          <span style={{
            fontFamily: 'var(--font-geist-sans)',
            fontSize: '11.5px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#40405C',
            lineHeight: 1,
          }}>
            fundamentals
          </span>
          {/* Thin cyan divider */}
          <div style={{
            height: '1px',
            width: '100%',
            background: 'linear-gradient(90deg, #00D4FF44, transparent)',
            marginTop: '2px',
          }} />
        </div>
      </Link>

      {/* Right side */}
      <div className="hidden md:flex items-center gap-5">
        {pct > 0 && (
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-full overflow-hidden"
              style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00D4FF, #00E5A0)' }}
              />
            </div>
            <span
              className="tabular-nums"
              style={{ fontSize: '11px', color: '#35354E', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.04em' }}
            >
              {pct}%
            </span>
          </div>
        )}
        <MouseEye />
      </div>
    </header>
  )
}
