'use client'
import { lazy, Suspense } from 'react'
import SceneBoundary from '@/components/SceneBoundary'

const HeroScene = lazy(() => import('./HeroScene'))

export default function HeroSceneLoader() {
  return (
    <SceneBoundary>
      <Suspense fallback={<div className="w-full h-full" style={{ background: 'var(--color-surface)' }} />}>
        <HeroScene />
      </Suspense>
    </SceneBoundary>
  )
}
