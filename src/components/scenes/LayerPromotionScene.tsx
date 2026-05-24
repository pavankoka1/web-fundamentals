'use client'
import { useEffect, useRef } from 'react'

// Flat plane with five tile elements. One tile (#3) has `will-change: transform`
// and periodically promotes — lifting up onto its own layer above the rest —
// then demotes back into the base layer. Shown in isometric.

const TEAL = '#7DD3FC'
const MINT = '#A5F3FC'
const CYAN = '#67E8F9'
const SOFT = 'rgba(165, 243, 252, 0.55)'
const DIM  = 'rgba(125, 211, 252, 0.4)'

const CYCLE_MS = 4800
// 0.00–0.18 idle, 0.18–0.40 promote, 0.40–0.70 hovering above (drifting),
// 0.70–0.92 demote, 0.92–1 idle

const TILES = [
  { id: 'A', sub: 'div'        },
  { id: 'B', sub: 'div'        },
  { id: 'C', sub: 'will-change', promoted: true },
  { id: 'D', sub: 'div'        },
  { id: 'E', sub: 'div'        },
]

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export default function LayerPromotionScene() {
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

    // Isometric helper: y is "up" off the plane, returns 2D point.
    function iso(x: number, y: number, z: number) {
      return { px: x + z * 0.55, py: -y * 0.85 + z * 0.3 }
    }

    function drawPlane(cx: number, cy: number, w: number, h: number, lift: number, depth: number, label: string, alpha = 1) {
      // Lift means y in iso space — pre-translate.
      const a = iso(0, lift, 0)
      const ox = cx + a.px
      const oy = cy + a.py

      // Plane outline (parallelogram)
      const p1 = iso(-w / 2, 0, -depth / 2)
      const p2 = iso( w / 2, 0, -depth / 2)
      const p3 = iso( w / 2, 0,  depth / 2)
      const p4 = iso(-w / 2, 0,  depth / 2)

      ctx!.save()
      ctx!.globalAlpha = alpha
      ctx!.fillStyle = `rgba(125, 211, 252, ${0.05 + lift * 0.04})`
      ctx!.strokeStyle = `rgba(125, 211, 252, ${0.45 + lift * 0.25})`
      ctx!.lineWidth = 1.1
      ctx!.beginPath()
      ctx!.moveTo(ox + p1.px, oy + p1.py)
      ctx!.lineTo(ox + p2.px, oy + p2.py)
      ctx!.lineTo(ox + p3.px, oy + p3.py)
      ctx!.lineTo(ox + p4.px, oy + p4.py)
      ctx!.closePath()
      ctx!.fill()
      ctx!.stroke()

      // Shadow line directly under the plane (only when lifted)
      if (lift > 0.1) {
        const s1 = iso(-w / 2, 0, -depth / 2)
        const s3 = iso( w / 2, 0,  depth / 2)
        const baseY = cy
        ctx!.strokeStyle = `rgba(125, 211, 252, ${0.18 * lift})`
        ctx!.setLineDash([2, 3])
        ctx!.beginPath()
        ctx!.moveTo(cx + s1.px, baseY + s1.py)
        ctx!.lineTo(cx + s3.px, baseY + s3.py)
        ctx!.stroke()
        ctx!.setLineDash([])
      }

      // Label
      ctx!.fillStyle = `rgba(125, 211, 252, ${0.55 + lift * 0.25})`
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'middle'
      ctx!.fillText(label, ox + p1.px + 6, oy + p1.py - 2)
      ctx!.restore()
    }

    function drawTile(planeCx: number, planeCy: number, offX: number, lift: number, label: string, sub: string, isPromoted: boolean, promotion: number) {
      const w = 36, h = 26
      const iY = lift + (isPromoted ? promotion * 26 : 0)
      const drift = isPromoted && promotion > 0.5 ? Math.sin(performance.now() / 320) * 1.6 * promotion : 0
      const a = iso(offX + drift, iY, 0)
      const cx = planeCx + a.px
      const cy = planeCy + a.py

      // Body
      const fill = isPromoted && promotion > 0.15
        ? `rgba(165, 243, 252, ${0.16 + promotion * 0.18})`
        : 'rgba(125, 211, 252, 0.10)'
      const stroke = isPromoted && promotion > 0.15
        ? `rgba(165, 243, 252, ${0.7 + promotion * 0.3})`
        : TEAL
      ctx!.fillStyle = fill
      ctx!.strokeStyle = stroke
      ctx!.lineWidth = isPromoted ? 1.3 : 1
      ctx!.beginPath()
      ctx!.rect(cx - w / 2, cy - h / 2, w, h)
      ctx!.fill()
      ctx!.stroke()

      ctx!.fillStyle = isPromoted && promotion > 0.4 ? CYAN : TEAL
      ctx!.font = "600 11px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillText(label, cx, cy - 3)

      ctx!.fillStyle = isPromoted ? SOFT : DIM
      ctx!.font = "500 7.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.fillText(sub, cx, cy + 8)

      return { cx, cy }
    }

    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const tN = ((now - t0) % CYCLE_MS) / CYCLE_MS
      let promotion = 0
      if (tN < 0.18) promotion = 0
      else if (tN < 0.4) promotion = easeInOut((tN - 0.18) / 0.22)
      else if (tN < 0.7) promotion = 1
      else if (tN < 0.92) promotion = 1 - easeInOut((tN - 0.7) / 0.22)
      else promotion = 0

      const planeW = Math.min(380, W * 0.72)
      const planeD = 110
      const planeCx = W / 2
      const planeCy = H / 2 + 20

      // Base plane
      drawPlane(planeCx, planeCy, planeW, planeD, 0, planeD, 'base layer')

      // Promoted ghost plane (appears when promotion > ~0.05)
      if (promotion > 0.03) {
        const ghostLiftY = 30 * promotion
        drawPlane(planeCx, planeCy - ghostLiftY * 0.3, 78, 50, ghostLiftY, 50, 'own layer', 0.7 + promotion * 0.3)
      }

      // Tiles laid across the plane
      const tileOffsets = [-planeW * 0.36, -planeW * 0.18, 0, planeW * 0.18, planeW * 0.36]
      for (let i = 0; i < TILES.length; i++) {
        const t = TILES[i]
        drawTile(planeCx, planeCy, tileOffsets[i], 0, t.id, t.sub, !!t.promoted, t.promoted ? promotion : 0)
      }

      // Header
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('layer promotion', 24, 16)

      // Status label, swapping with promotion state
      ctx!.textAlign = 'right'
      const status = promotion < 0.05 ? 'idle' : promotion < 0.99 ? (tN < 0.5 ? 'promoting…' : 'demoting…') : 'on its own layer'
      ctx!.fillStyle = promotion > 0.3 ? CYAN : DIM
      ctx!.fillText(status, W - 24, 16)

      // Footer
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.42)'
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('will-change → composited apart from peers', 24, H - 18)
    }

    if (prefersReduced) {
      drawFrame(t0 + CYCLE_MS * 0.55)
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
