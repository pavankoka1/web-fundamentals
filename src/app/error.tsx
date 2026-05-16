'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: 'var(--color-text-muted)' }}>Something went wrong</p>
        <h1 className="text-2xl font-bold mb-4">Page failed to load</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button onClick={reset}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--color-network)', color: '#000' }}>
          Try again
        </button>
      </div>
    </div>
  )
}
