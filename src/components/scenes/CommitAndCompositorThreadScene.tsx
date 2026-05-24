'use client'
import { useEffect, useRef } from 'react'

// Two horizontal tracks: Main (top) and Compositor (bottom).
// Cycle: main produces frame packet → commits down to compositor →
// compositor consumes and ships pixels to display → repeat.

const TEAL = '#7DD3FC'
const MINT = '#A5F3FC'
const CYAN = '#67E8F9'
const DIM  = 'rgba(125, 211, 252, 0.45)'

const CYCLE_MS = 3600

// Phase windows (fractions of cycle)
// 0.00–0.25 main builds packet (right-bound)
// 0.25–0.42 commit (packet drops onto compositor track)
// 0.42–0.85 compositor carries packet (right-bound)
// 0.85–1.00 ship + fade

function easeOut(t: number) { return 1 - Math.pow(1 - t, 2) }

export default function CommitAndCompositorThreadScene() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number | null>(null)
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

    function trackBaseline(x: number, y: number, w: number, label: string, sub: string, accent: string) {
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.16)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(x, y)
      ctx!.lineTo(x + w, y)
      ctx!.stroke()

      // Tick marks
      for (let i = 0; i <= 8; i++) {
        const tx = x + (w / 8) * i
        ctx!.fillStyle = 'rgba(125, 211, 252, 0.15)'
        ctx!.fillRect(tx, y - 3, 1, 6)
      }

      ctx!.fillStyle = accent
      ctx!.font = "600 10.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'middle'
      ctx!.fillText(label, x - 14, y - 4)
      ctx!.fillStyle = DIM
      ctx!.font = "500 8.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.fillText(sub, x - 14, y + 9)
    }

    function packet(x: number, y: number, w: number, h: number, alpha: number, hot = false) {
      ctx!.save()
      ctx!.globalAlpha = alpha
      const fill = hot
        ? 'rgba(165, 243, 252, 0.32)'
        : 'rgba(125, 211, 252, 0.18)'
      const stroke = hot ? MINT : TEAL
      ctx!.fillStyle = fill
      ctx!.strokeStyle = stroke
      ctx!.lineWidth = 1.1
      ctx!.beginPath()
      ctx!.rect(x - w / 2, y - h / 2, w, h)
      ctx!.fill()
      ctx!.stroke()

      // little inner mark — represents a layer tree / draw quad
      ctx!.strokeStyle = `rgba(125, 211, 252, 0.65)`
      ctx!.beginPath()
      ctx!.moveTo(x - w / 2 + 5, y - 2)
      ctx!.lineTo(x + w / 2 - 5, y - 2)
      ctx!.moveTo(x - w / 2 + 5, y + 3)
      ctx!.lineTo(x + w / 2 - 6, y + 3)
      ctx!.stroke()
      ctx!.restore()
    }

    function display(x: number, y: number, on: boolean, intensity: number) {
      // A small monitor icon on the right
      const w = 36, h = 22
      ctx!.fillStyle = on ? `rgba(165, 243, 252, ${0.22 + intensity * 0.4})` : 'rgba(125, 211, 252, 0.08)'
      ctx!.strokeStyle = on ? MINT : TEAL
      ctx!.lineWidth = 1.2
      ctx!.beginPath()
      ctx!.rect(x - w / 2, y - h / 2, w, h)
      ctx!.fill()
      ctx!.stroke()
      // Stand
      ctx!.beginPath()
      ctx!.moveTo(x - 6, y + h / 2 + 4)
      ctx!.lineTo(x + 6, y + h / 2 + 4)
      ctx!.stroke()
      // Inner scanline
      if (on) {
        ctx!.fillStyle = `rgba(165, 243, 252, ${intensity * 0.7})`
        ctx!.fillRect(x - w / 2 + 4, y - 3, w - 8, 1.4)
      }
      ctx!.fillStyle = DIM
      ctx!.font = "500 8.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'top'
      ctx!.fillText('display', x, y + h / 2 + 10)
    }

    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padL = 96
      const padR = 64
      const trackW = W - padL - padR
      const yMain = H * 0.38
      const yComp = H * 0.74

      trackBaseline(padL, yMain, trackW, 'Main', 'js · style · layout · paint', TEAL)
      trackBaseline(padL, yComp, trackW, 'Compositor', 'raster · draw quads · gpu', CYAN)

      // Display icon
      display(padL + trackW + 30, yComp, true, 0.5 + 0.5 * Math.sin(now / 300))

      const tN = ((now - t0) % CYCLE_MS) / CYCLE_MS

      const pktW = 56
      const pktH = 22

      // Phase 1 — main builds (0..0.25)
      if (tN < 0.25) {
        const p = easeOut(tN / 0.25)
        const x = padL + 24 + (trackW * 0.5) * p
        // Growing intensity dot at left (incoming work)
        ctx!.fillStyle = `rgba(125, 211, 252, ${0.4 + 0.4 * Math.sin(now / 120)})`
        ctx!.beginPath()
        ctx!.arc(padL + 8, yMain, 3 + Math.sin(now / 180) * 0.6, 0, Math.PI * 2)
        ctx!.fill()
        packet(x, yMain, pktW, pktH, 0.7 + 0.3 * p)
        // Label
        ctx!.fillStyle = DIM
        ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'bottom'
        ctx!.fillText('building frame', x, yMain - pktH / 2 - 6)
      }

      // Phase 2 — commit (0.25..0.42) — packet drops from main to compositor
      else if (tN < 0.42) {
        const p = (tN - 0.25) / 0.17
        const ep = easeOut(p)
        const x = padL + 24 + trackW * 0.5
        const y = yMain + (yComp - yMain) * ep
        // Vertical "commit" beam
        const grad = ctx!.createLinearGradient(0, yMain, 0, yComp)
        grad.addColorStop(0, 'rgba(165, 243, 252, 0)')
        grad.addColorStop(0.5, `rgba(165, 243, 252, ${0.4 * (1 - p)})`)
        grad.addColorStop(1, 'rgba(165, 243, 252, 0)')
        ctx!.fillStyle = grad
        ctx!.fillRect(x - 14, yMain - 2, 28, yComp - yMain + 4)
        packet(x, y, pktW, pktH, 1, true)

        // "commit" label
        ctx!.fillStyle = MINT
        ctx!.font = "600 10px ui-monospace, SFMono-Regular, monospace"
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'middle'
        ctx!.fillText('commit ↓', x + pktW / 2 + 12, (yMain + yComp) / 2)
      }

      // Phase 3 — compositor carries (0.42..0.85)
      else if (tN < 0.85) {
        const p = easeOut((tN - 0.42) / 0.43)
        const x = padL + 24 + trackW * 0.5 + (trackW * 0.5 - 24) * p
        packet(x, yComp, pktW, pktH, 1)
        ctx!.fillStyle = DIM
        ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'bottom'
        ctx!.fillText('rasterizing', x, yComp - pktH / 2 - 6)
      }

      // Phase 4 — ship (0.85..1)
      else {
        const p = (tN - 0.85) / 0.15
        const x = padL + trackW
        // packet shrinks into the display
        const scale = 1 - p * 0.85
        packet(x, yComp, pktW * scale, pktH * scale, 1 - p * 0.6, true)
        // bright flash on display
        ctx!.fillStyle = `rgba(165, 243, 252, ${0.5 * (1 - p)})`
        ctx!.beginPath()
        ctx!.arc(padL + trackW + 30, yComp, 24 + p * 12, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Header
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('commit · main → compositor', 24, 16)

      // Footer
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.42)'
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('two threads, one handoff per frame', W - 24, H - 18)
    }

    if (prefersReduced) {
      drawFrame(t0 + CYCLE_MS * 0.33)
      return () => { ro.disconnect(); io.disconnect() }
    }

    const tick = (now: number) => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      drawFrame(now)
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
