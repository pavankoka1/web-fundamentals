'use client'
import { useEffect, useRef } from 'react'

// Three lanes — baseline (no hint), preload, preconnect.
// Loop ~6s. Demonstrates the *shift* a hint produces on the waterfall.
const CYCLE_MS = 6000

interface Lane {
  label: string
  // Each lane describes its request's segments as fractions of the cycle.
  // For "no hint": [request body only]
  // For "preload": [request body only, but starts earlier]
  // For "preconnect": [DNS, TCP, TLS, request body] — handshake done earlier.
  segments: { start: number; end: number; tone: string; label?: string }[]
}

const C = {
  base: 'rgba(125, 211, 252, 0.45)',   // #7DD3FC
  highlight: '#A5F3FC',
  dns: 'rgba(165, 243, 252, 0.55)',
  tcp: 'rgba(186, 230, 253, 0.7)',
  tls: 'rgba(103, 232, 249, 0.7)',
  body: '#7DD3FC',
  baseDim: 'rgba(125, 211, 252, 0.22)',
  text: 'rgba(165, 243, 252, 0.85)',
  textDim: 'rgba(125, 211, 252, 0.5)',
}

const LANES: Lane[] = [
  {
    label: 'no hint',
    segments: [{ start: 0.62, end: 0.92, tone: C.baseDim, label: 'request' }],
  },
  {
    label: 'preload',
    segments: [{ start: 0.18, end: 0.52, tone: C.body, label: 'request (early)' }],
  },
  {
    label: 'preconnect',
    segments: [
      { start: 0.06, end: 0.14, tone: C.dns, label: 'dns' },
      { start: 0.14, end: 0.22, tone: C.tcp, label: 'tcp' },
      { start: 0.22, end: 0.3,  tone: C.tls, label: 'tls' },
      { start: 0.62, end: 0.85, tone: C.body, label: 'request' },
    ],
  },
]

export default function ResourceHintsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const visibleRef = useRef(true)

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting
    }, { threshold: 0.05 })
    io.observe(canvas)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function drawFrame(progress: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padLeft = 96
      const padRight = 24
      const padTop = 32
      const padBottom = 36
      const trackW = W - padLeft - padRight
      const laneCount = LANES.length
      const laneH = (H - padTop - padBottom) / laneCount

      // Vertical "now" marker
      const nowX = padLeft + trackW * progress
      ctx!.strokeStyle = 'rgba(167, 243, 252, 0.18)'
      ctx!.lineWidth = 1
      ctx!.setLineDash([3, 4])
      ctx!.beginPath()
      ctx!.moveTo(nowX, padTop - 6)
      ctx!.lineTo(nowX, H - padBottom + 6)
      ctx!.stroke()
      ctx!.setLineDash([])

      // Time axis tick marks
      for (let i = 0; i <= 4; i++) {
        const x = padLeft + (trackW * i) / 4
        ctx!.fillStyle = 'rgba(125, 211, 252, 0.18)'
        ctx!.fillRect(x, H - padBottom + 4, 1, 4)
      }
      ctx!.fillStyle = C.textDim
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('time →', padLeft, H - padBottom + 14)

      LANES.forEach((lane, i) => {
        const y = padTop + i * laneH + laneH / 2

        // Label (left)
        ctx!.fillStyle = C.text
        ctx!.font = '500 10px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(lane.label, padLeft - 14, y)

        // Lane baseline
        ctx!.strokeStyle = 'rgba(125, 211, 252, 0.08)'
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.moveTo(padLeft, y)
        ctx!.lineTo(padLeft + trackW, y)
        ctx!.stroke()

        // Segments (only draw the portion before "now")
        const barH = 10
        lane.segments.forEach((seg) => {
          const x0 = padLeft + trackW * seg.start
          const x1 = padLeft + trackW * seg.end
          const visEnd = Math.min(x1, nowX)
          if (visEnd <= x0) return
          ctx!.fillStyle = seg.tone
          ctx!.fillRect(x0, y - barH / 2, visEnd - x0, barH)

          // Subtle accent line at the segment start
          ctx!.strokeStyle = 'rgba(165, 243, 252, 0.55)'
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(x0, y - barH / 2 - 3)
          ctx!.lineTo(x0, y + barH / 2 + 3)
          ctx!.stroke()

          // Inline label if segment is wide enough and complete
          if (seg.label && visEnd === x1 && x1 - x0 > 38) {
            ctx!.fillStyle = 'rgba(7, 7, 14, 0.78)'
            ctx!.font = '500 8.5px ui-monospace, SFMono-Regular, monospace'
            ctx!.textAlign = 'left'
            ctx!.textBaseline = 'middle'
            ctx!.fillText(seg.label, x0 + 4, y)
          }
        })
      })

      // Caption (small mono, bottom-right)
      ctx!.fillStyle = C.textDim
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('hints shift the start, not the size', W - padRight, H - 4)
    }

    if (prefersReduced) {
      drawFrame(1)
      return () => {
        ro.disconnect()
        io.disconnect()
      }
    }

    const t0 = performance.now()
    const tick = (now: number) => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const elapsed = (now - t0) % CYCLE_MS
      const progress = elapsed / CYCLE_MS
      drawFrame(progress)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
