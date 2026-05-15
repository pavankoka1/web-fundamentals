'use client'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: 'var(--color-surface)' }} />,
})

export default function HeroSceneLoader() {
  return <HeroScene />
}
