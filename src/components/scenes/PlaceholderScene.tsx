'use client'
import { useEffect, useRef } from 'react'

interface Props {
  conceptTitle?: string
}

export default function PlaceholderScene({ conceptTitle = 'Visualization' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    })
    ro.observe(canvas)

    const t0 = performance.now()
    const tick = (now: number) => {
      const t = (now - t0) / 1000
      const rect = canvas.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      ctx.clearRect(0, 0, W, H)

      // Subtle accent dot grid that pulses
      const cols = 12
      const rows = 6
      const gapX = W / (cols + 1)
      const gapY = H / (rows + 1)
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const phase = Math.sin(t * 0.6 + (c + r) * 0.18)
          const a = 0.1 + 0.18 * (0.5 + 0.5 * phase)
          ctx.fillStyle = `rgba(125, 211, 252, ${a})`
          ctx.beginPath()
          ctx.arc(c * gapX, r * gapY, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-dim)]">
            visualization
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-[18px] italic text-[color:var(--color-text-muted)]">
            {conceptTitle}
          </div>
        </div>
      </div>
    </div>
  )
}
