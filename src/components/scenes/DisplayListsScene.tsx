'use client'
import { useEffect, useRef } from 'react'

// Paint commands accumulate top-down into an ordered list, then flush.
// Each row: index + opcode. A cursor sits just below the last command.

const OPS = [
  'save()',
  'translate(8, 0)',
  'fillRect 0 0 320 24',
  'setShadow(blur=12)',
  'drawText "Hello"',
  'clip(rect)',
  'fillRect 0 0 160 80',
  'drawImage(thumb)',
  'restore()',
  'compose()',
]

const APPEND_MS  = 220   // ms per command append
const HOLD_MS    = 700   // hold once full
const FLUSH_MS   = 340   // sweep flush
const CURSOR_MS  = 480   // blink period

const TEAL  = '#7DD3FC'
const MINT  = '#A5F3FC'
const CYAN  = '#67E8F9'
const DIM   = 'rgba(125, 211, 252, 0.36)'
const MUTED = 'rgba(125, 211, 252, 0.18)'

export default function DisplayListsScene() {
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

    const cycle = APPEND_MS * OPS.length + HOLD_MS + FLUSH_MS
    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padL = 36
      const padT = 30
      const rowH = Math.max(16, Math.min(22, (H - padT * 2) / (OPS.length + 1)))
      const colW = Math.min(W - padL * 2, 460)
      const leftX = (W - colW) / 2

      const elapsed = (now - t0) % cycle
      const appendDur = APPEND_MS * OPS.length

      let shown = OPS.length
      let cursorRow = OPS.length
      let flushFrac = 0
      if (elapsed < appendDur) {
        shown = Math.floor(elapsed / APPEND_MS)
        cursorRow = shown
      } else if (elapsed < appendDur + HOLD_MS) {
        shown = OPS.length
        cursorRow = OPS.length
      } else {
        flushFrac = (elapsed - appendDur - HOLD_MS) / FLUSH_MS
        shown = OPS.length
        cursorRow = OPS.length
      }

      // Header: "Display List" + count
      ctx!.font = "600 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.textBaseline = 'alphabetic'
      ctx!.textAlign = 'left'
      ctx!.fillText('display list', leftX, padT - 12)
      ctx!.textAlign = 'right'
      ctx!.fillStyle = DIM
      ctx!.fillText(`${shown} / ${OPS.length}`, leftX + colW, padT - 12)

      // Header rule
      ctx!.strokeStyle = MUTED
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(leftX, padT - 6)
      ctx!.lineTo(leftX + colW, padT - 6)
      ctx!.stroke()

      // Rows
      ctx!.font = "500 11.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textBaseline = 'middle'
      for (let i = 0; i < OPS.length; i++) {
        if (i >= shown) break
        const y = padT + i * rowH + rowH / 2

        // Flush sweep: rows fade out left-to-right with stagger.
        let alpha = 1
        if (flushFrac > 0) {
          const local = Math.max(0, Math.min(1, flushFrac * 1.6 - i * 0.06))
          alpha = 1 - local
          if (alpha <= 0.02) continue
        }

        // Newest row flashes briefly.
        const justAppended = i === shown - 1 && elapsed < appendDur
        const flash = justAppended
          ? Math.max(0, 1 - (elapsed - i * APPEND_MS) / APPEND_MS)
          : 0

        // Row tint
        ctx!.globalAlpha = alpha
        if (flash > 0.05) {
          ctx!.fillStyle = `rgba(165, 243, 252, ${0.08 * flash})`
          ctx!.fillRect(leftX, y - rowH / 2 + 1, colW, rowH - 2)
        }

        // Index
        ctx!.textAlign = 'right'
        ctx!.fillStyle = i === shown - 1 ? MINT : DIM
        ctx!.fillText(String(i).padStart(2, '0'), leftX + 28, y)

        // Opcode
        ctx!.textAlign = 'left'
        ctx!.fillStyle = i === shown - 1 ? CYAN : TEAL
        ctx!.fillText(OPS[i], leftX + 44, y)

        // Subtle separator
        ctx!.globalAlpha = alpha * 0.4
        ctx!.strokeStyle = MUTED
        ctx!.beginPath()
        ctx!.moveTo(leftX + 44, y + rowH / 2 - 1)
        ctx!.lineTo(leftX + colW, y + rowH / 2 - 1)
        ctx!.stroke()
        ctx!.globalAlpha = 1
      }

      // Cursor: a blinking caret at the next-write position.
      if (flushFrac === 0) {
        const cy = padT + cursorRow * rowH + rowH / 2
        const blinkOn = Math.floor(now / CURSOR_MS) % 2 === 0
        if (blinkOn) {
          ctx!.fillStyle = MINT
          ctx!.fillRect(leftX + 44, cy - rowH * 0.35, 2, rowH * 0.7)
        }
        ctx!.textAlign = 'left'
        ctx!.fillStyle = DIM
        ctx!.font = "500 10px ui-monospace, SFMono-Regular, monospace"
        ctx!.fillText('▌ next', leftX + 52, cy + rowH * 0.05)
      } else {
        // Flush bar sweeping across.
        const sweepX = leftX + colW * Math.min(1, flushFrac * 1.6)
        const grad = ctx!.createLinearGradient(sweepX - 80, 0, sweepX, 0)
        grad.addColorStop(0, 'rgba(125, 211, 252, 0)')
        grad.addColorStop(1, 'rgba(125, 211, 252, 0.35)')
        ctx!.fillStyle = grad
        ctx!.fillRect(leftX, padT - 6, sweepX - leftX, OPS.length * rowH + 12)
        ctx!.fillStyle = 'rgba(165, 243, 252, 0.85)'
        ctx!.fillRect(sweepX, padT - 6, 1.5, OPS.length * rowH + 12)

        ctx!.font = "600 9.5px ui-monospace, SFMono-Regular, monospace"
        ctx!.fillStyle = MINT
        ctx!.textAlign = 'left'
        ctx!.fillText('flush →', leftX, padT + OPS.length * rowH + 16)
      }

      // Footer caption
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.fillStyle = DIM
      ctx!.textAlign = 'right'
      ctx!.fillText('paint → display list → raster', leftX + colW, padT + OPS.length * rowH + 16)
    }

    if (prefersReduced) {
      drawFrame(t0 + APPEND_MS * OPS.length + 100)
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
