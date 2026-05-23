'use client'
import { useEffect, useRef } from 'react'

interface Props {
  conceptTitle?: string
}

export default function PlaceholderScene({ conceptTitle = 'Concept' }: Props) {
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

      // Drifting horizontal lines — gentle motion accent that hints at flow
      // without committing to a specific topic.
      const numLines = 5
      for (let i = 0; i < numLines; i++) {
        const y = H * (0.18 + (i / (numLines - 1)) * 0.64)
        const offsetX = Math.sin(t * 0.25 + i * 0.7) * (W * 0.15)
        const alpha = 0.04 + 0.06 * Math.sin(t * 0.4 + i * 1.1)
        const gradient = ctx.createLinearGradient(0, y, W, y)
        gradient.addColorStop(0, `rgba(125, 211, 252, 0)`)
        gradient.addColorStop(0.5, `rgba(125, 211, 252, ${alpha + 0.04})`)
        gradient.addColorStop(1, `rgba(125, 211, 252, 0)`)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(offsetX, y)
        ctx.lineTo(W + offsetX, y)
        ctx.stroke()
      }

      // Pulsing accent dot grid (denser than before).
      const cols = 14
      const rows = 7
      const gapX = W / (cols + 1)
      const gapY = H / (rows + 1)
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const phase = Math.sin(t * 0.6 + (c + r) * 0.18)
          const a = 0.08 + 0.16 * (0.5 + 0.5 * phase)
          ctx.fillStyle = `rgba(125, 211, 252, ${a})`
          ctx.beginPath()
          ctx.arc(c * gapX, r * gapY, 1.5, 0, Math.PI * 2)
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
        <div className="text-center px-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--color-text-dim)]">
            in motion
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 28px rgba(125, 211, 252, 0.18)',
            }}
            className="mt-3 text-[22px] italic text-[color:var(--color-text-secondary)]"
          >
            {conceptTitle}
          </div>
        </div>
      </div>
    </div>
  )
}
