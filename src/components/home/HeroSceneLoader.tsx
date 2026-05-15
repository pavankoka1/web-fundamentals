'use client'
import { lazy, Suspense } from 'react'

const HeroScene = lazy(() => import('./HeroScene'))

export default function HeroSceneLoader() {
  return (
    <Suspense fallback={<div className="w-full h-full" style={{ background: 'var(--color-surface)' }} />}>
      <HeroScene />
    </Suspense>
  )
}
