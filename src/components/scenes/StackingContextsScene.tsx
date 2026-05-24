'use client'
import { useEffect, useRef } from 'react'

// Isometric stack of overlapping boxes. A parent box "A (opacity 0.9)" creates
// a stacking context — its child "A·1 (z:9999)" tries to lift above sibling
// box "B (z:5)" outside the context, but it can never escape the parent's
// boundary. Demonstrated by the child rising, bouncing against an invisible
// ceiling at the parent's top, and settling back.

const TEAL = '#7DD3FC'
const MINT = '#A5F3FC'
const CYAN = '#67E8F9'
const SOFT = 'rgba(186, 230, 253, 0.6)'

const CYCLE_MS = 5200

// Isometric projection. Inputs are abstract (x, y, z) — y is "up", z is
// "depth into screen". We squish y to suggest perspective.
function iso(x: number, y: number, z: number) {
  return { px: x + z * 0.45, py: -y * 0.78 + z * 0.32 }
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export default function StackingContextsScene() {
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

    function drawBox(
      cx: number, cy: number, w: number, h: number, depth: number,
      stroke: string, fill: string, label: string, sub?: string,
      labelColor = TEAL,
    ) {
      // Front face
      ctx!.fillStyle = fill
      ctx!.strokeStyle = stroke
      ctx!.lineWidth = 1.2
      ctx!.beginPath()
      ctx!.rect(cx - w / 2, cy - h / 2, w, h)
      ctx!.fill()
      ctx!.stroke()

      // Iso side + top edges (just suggestive, no shading)
      const sx = depth * 0.45
      const sy = -depth * 0.32
      ctx!.beginPath()
      // Top
      ctx!.moveTo(cx - w / 2, cy - h / 2)
      ctx!.lineTo(cx - w / 2 + sx, cy - h / 2 + sy)
      ctx!.lineTo(cx + w / 2 + sx, cy - h / 2 + sy)
      ctx!.lineTo(cx + w / 2, cy - h / 2)
      // Right
      ctx!.moveTo(cx + w / 2, cy - h / 2)
      ctx!.lineTo(cx + w / 2 + sx, cy - h / 2 + sy)
      ctx!.lineTo(cx + w / 2 + sx, cy + h / 2 + sy)
      ctx!.lineTo(cx + w / 2, cy + h / 2)
      ctx!.globalAlpha = 0.45
      ctx!.stroke()
      ctx!.globalAlpha = 1

      // Label
      ctx!.fillStyle = labelColor
      ctx!.font = "600 11px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText(label, cx - w / 2 + 8, cy - h / 2 + 7)
      if (sub) {
        ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
        ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
        ctx!.fillText(sub, cx - w / 2 + 8, cy - h / 2 + 22)
      }
    }

    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const cxBase = W / 2
      const cyBase = H / 2 + 8

      const tN = ((now - t0) % CYCLE_MS) / CYCLE_MS
      // Child rises 0→1 over first half, bounces, then settles.
      let lift = 0
      if (tN < 0.4) {
        lift = easeInOut(tN / 0.4)
      } else if (tN < 0.5) {
        // hit ceiling, slight squash
        lift = 1 - 0.06 * Math.sin(((tN - 0.4) / 0.1) * Math.PI)
      } else if (tN < 0.85) {
        lift = 1 - easeInOut((tN - 0.5) / 0.35)
      }
      const ceilingFlash = tN >= 0.36 && tN < 0.55
        ? Math.max(0, 1 - (tN - 0.36) / 0.19)
        : 0

      // Layout: B (sibling) on the right, A (parent context) on the left.
      // Project both to iso, draw far-to-near in painter's order.
      const boxW = Math.min(170, (W - 80) * 0.32)
      const boxH = Math.min(118, H * 0.42)

      // Parent A: shifted slightly left + back, depth 16
      const A = iso(-90, 0, 0)
      const Acx = cxBase + A.px
      const Acy = cyBase + A.py

      // Sibling B: shifted right, slightly forward, depth 16
      const B = iso(80, -10, -18)
      const Bcx = cxBase + B.px
      const Bcy = cyBase + B.py

      // Child A·1 inside parent A — base y = parent's top minus child height,
      // rises by up to "lift * available headroom inside parent".
      const childW = boxW * 0.6
      const childH = boxH * 0.4
      const headroom = boxH * 0.42
      const childBaseY = Acy + boxH * 0.18
      const childY = childBaseY - lift * headroom

      // Painter order: deeper first.
      drawBox(
        Acx, Acy, boxW, boxH, 16,
        TEAL,
        'rgba(125, 211, 252, 0.06)',
        'A (opacity: 0.9)',
        'creates stacking ctx',
        TEAL,
      )

      // Inside parent: dotted ceiling line indicating boundary
      ctx!.save()
      ctx!.strokeStyle = `rgba(165, 243, 252, ${0.35 + ceilingFlash * 0.5})`
      ctx!.lineWidth = 1
      ctx!.setLineDash([3, 3])
      ctx!.beginPath()
      ctx!.moveTo(Acx - boxW / 2 + 6, Acy - boxH / 2 + 36)
      ctx!.lineTo(Acx + boxW / 2 - 6, Acy - boxH / 2 + 36)
      ctx!.stroke()
      ctx!.setLineDash([])
      if (ceilingFlash > 0.1) {
        ctx!.fillStyle = `rgba(165, 243, 252, ${ceilingFlash})`
        ctx!.font = "600 9px ui-monospace, SFMono-Regular, monospace"
        ctx!.textAlign = 'right'
        ctx!.fillText('boundary', Acx + boxW / 2 - 8, Acy - boxH / 2 + 28)
      }
      ctx!.restore()

      // Sibling B (drawn behind child visually, but its z-axis would normally
      // mean child should appear above — the demonstration is that it can't).
      drawBox(
        Bcx, Bcy, boxW, boxH, 16,
        SOFT,
        'rgba(186, 230, 253, 0.08)',
        'B (z-index: 5)',
        'outside the context',
        SOFT,
      )

      // Child A·1 — drawn last, but visually trapped under sibling B's top.
      // To convey "trapped", we clip the child to parent A's rect.
      ctx!.save()
      ctx!.beginPath()
      ctx!.rect(Acx - boxW / 2, Acy - boxH / 2, boxW, boxH)
      ctx!.clip()
      drawBox(
        Acx, childY, childW, childH, 10,
        MINT,
        'rgba(165, 243, 252, 0.18)',
        'A·1 (z: 9999)',
        'wants to escape',
        CYAN,
      )
      ctx!.restore()

      // Annotate the relationship with a hairline link from child label up to
      // the parent's top-right corner, dimming as child rises.
      ctx!.save()
      ctx!.strokeStyle = `rgba(125, 211, 252, ${0.18 + 0.18 * (1 - lift)})`
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(Acx + childW / 2, childY)
      ctx!.lineTo(Acx + boxW / 2 + 14, Acy - boxH / 2 - 12)
      ctx!.stroke()
      ctx!.restore()

      // Header caption (top-left, small)
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('stacking contexts', 24, 20)

      // Footer (bottom-right, small)
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.42)'
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('child z-index is local to its parent context', W - 24, H - 18)
    }

    if (prefersReduced) {
      drawFrame(t0 + CYCLE_MS * 0.45)
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
