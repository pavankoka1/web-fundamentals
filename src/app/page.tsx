import type { Metadata } from 'next'
import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'
import PhaseGrid from '@/components/home/PhaseGrid'
import ConceptCards from '@/components/home/ConceptCards'
import HeroSceneLoader from '@/components/home/HeroSceneLoader'

export const metadata: Metadata = {
  title: 'Web Fundamentals — Under the Hood',
  description: 'Web Fundamentals: how the web actually works, under the hood. 17 concepts from URL to the final pixel on screen — DNS, TCP, TLS, HTTP, rendering, frame budgets, and more. Interactive animations, plain English.',
}

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="pt-12">
        {/* Hero — animation zone then text zone, never overlapping */}
        <section className="flex flex-col overflow-hidden">

          {/* ── Animation zone: full-width, own space ── */}
          <div className="relative w-full flex-shrink-0" style={{ height: '38vh', minHeight: '260px' }}>
            <HeroSceneLoader />
            {/* Fade bottom edge into background */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{
              height: '80px',
              background: 'linear-gradient(to bottom, transparent, var(--color-bg))',
            }} />
          </div>

          {/* ── Text zone: directly below animation, no overlap ── */}
          <div className="flex flex-col items-center text-center px-6 pb-16 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-7"
              style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: '#00D4FF', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.06em' }}>
              17 concepts · 5 phases · interactive animations
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-5 max-w-3xl"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.04em', lineHeight: '1.05' }}>
              From URL{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #4D9FFF 50%, #00E5A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                to Screen
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 leading-relaxed max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              What actually happens when you type a URL and press Enter?
              17 concepts, traced from network handshake to the final pixel
              painted on your screen — in plain English.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/url-parsing"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-100"
                style={{ background: '#00D4FF', color: '#000' }}>
                Start learning →
              </Link>
              <Link href="#concepts"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                Browse All 17
              </Link>
            </div>
          </div>

        </section>

        <PhaseGrid />

        <div id="concepts">
          <ConceptCards />
        </div>

        <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            web fundamentals — under the hood.
          </p>
        </footer>
      </main>
    </>
  )
}
