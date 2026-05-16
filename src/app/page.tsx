import type { Metadata } from 'next'
import Link from 'next/link'
import TopNav from '@/components/layout/TopNav'
import PhaseGrid from '@/components/home/PhaseGrid'
import ConceptCards from '@/components/home/ConceptCards'
import HeroSceneLoader from '@/components/home/HeroSceneLoader'

export const metadata: Metadata = {
  title: 'Trace — From URL to Pixel',
  description: 'Trace the full journey of a web request. 16 concepts from URL parsing to GPU compositing, explained with interactive WebGL animations and plain-English insights.',
}

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="pt-12">
        {/* Hero */}
        <section className="relative h-[88vh] min-h-[560px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-70">
            <HeroSceneLoader />
          </div>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center bottom, transparent 30%, var(--color-bg) 75%)'
          }} />
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
              16 concepts · 5 phases · WebGL animations
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.04em', lineHeight: '1' }}>
              From URL{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #4D9FFF 50%, #00E5A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                to Pixel
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              What actually happens when you type a URL and press Enter?
              16 concepts, traced from network handshake to the final pixel
              painted on your screen — in plain English.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/url-parsing"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-100"
                style={{ background: '#00D4FF', color: '#000' }}>
                Start the trace →
              </Link>
              <Link href="#concepts"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                Browse All 16
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
            <div className="w-px h-8 animate-pulse" style={{ background: 'var(--color-text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>scroll</span>
          </div>
        </section>

        <PhaseGrid />

        <div id="concepts">
          <ConceptCards />
        </div>

        <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            trace — from URL to pixel.
          </p>
        </footer>
      </main>
    </>
  )
}
