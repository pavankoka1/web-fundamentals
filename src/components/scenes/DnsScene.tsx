'use client'
import { useEffect, useRef } from 'react'

const NODES = [
  { label: 'Your Browser',    sub: 'checks memory first',    color: '#7DD3FC' },
  { label: 'Your ISP',        sub: 'shared DNS cache',       color: '#A5F3FC' },
  { label: 'Root Directory',  sub: 'finds .com servers',     color: '#BAE6FD' },
  { label: '.com Registry',   sub: 'finds github.com DNS',   color: '#67E8F9' },
  { label: "GitHub's DNS",    sub: 'returns 140.82.x.x',    color: '#A5F3FC' },
]

const CYCLE = 5200

function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)) }

function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function DnsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const t0 = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const N = NODES.length

    function resize() {
      if (!canvas || !wrap) return
      const dpr = window.devicePixelRatio || 1
      const W = wrap.clientWidth
      const H = wrap.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    function frame(ts: number) {
      if (!canvas || !ctx) return
      if (t0.current === 0) t0.current = ts
      const elapsed = ts - t0.current
      const cycFrac = (elapsed % CYCLE) / CYCLE

      // Use CSS size (canvas is DPR-scaled via setTransform)
      const W = wrap!.clientWidth
      const H = wrap!.clientHeight

      // Clear
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#07070E'
      ctx.fillRect(0, 0, W, H)

      // Radial ambient glow
      const cx = W / 2
      const cy = H * 0.35
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5)
      grad.addColorStop(0, 'rgba(125,211,252,0.04)')
      grad.addColorStop(1, 'rgba(125,211,252,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      const pad = Math.max(16, W * 0.025)
      const nodeW = Math.min(140, (W - pad * 2) / N - 10)
      const nodeH = Math.min(54, H * 0.18)
      const nodeY = H * 0.30 - nodeH / 2
      const spacing = (W - pad * 2 - nodeW) / (N - 1)
      const nodeXs = NODES.map((_, i) => pad + i * spacing)

      // Line Y: bottom edge of nodes + 2px
      const lineY = nodeY + nodeH + 2

      // Phase
      const isQuery = cycFrac < 0.5
      const phaseFrac = isQuery ? cycFrac / 0.5 : (cycFrac - 0.5) / 0.5
      const easedFrac = ease(phaseFrac)

      // Which node is glowing
      function glowIntensity(nodeIdx: number, dotFrac: number, forward: boolean) {
        const effectiveFrac = forward ? dotFrac : 1 - dotFrac
        const pos = effectiveFrac * (N - 1)
        const dist = Math.abs(pos - nodeIdx)
        return dist < 0.6 ? Math.max(0, 1 - dist / 0.6) : 0
      }

      // Draw connector line
      const lineX0 = nodeXs[0] + nodeW
      const lineX1 = nodeXs[N - 1]
      ctx.beginPath()
      ctx.moveTo(lineX0, lineY)
      ctx.lineTo(lineX1, lineY)
      ctx.strokeStyle = '#1C1C35'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Draw nodes
      NODES.forEach((node, i) => {
        const nx = nodeXs[i]
        const ny = nodeY
        const r = 4
        const glow = isQuery
          ? glowIntensity(i, easedFrac, true)
          : glowIntensity(i, easedFrac, false)

        // Glow shadow
        if (glow > 0.01) {
          ctx.save()
          ctx.shadowColor = node.color
          ctx.shadowBlur = 18 * glow
          rrPath(ctx, nx, ny, nodeW, nodeH, r)
          ctx.fillStyle = node.color + Math.round(glow * 0x33).toString(16).padStart(2, '0')
          ctx.fill()
          ctx.restore()
        }

        // Node fill
        rrPath(ctx, nx, ny, nodeW, nodeH, r)
        ctx.fillStyle = node.color + '14'
        ctx.fill()

        // Border
        rrPath(ctx, nx, ny, nodeW, nodeH, r)
        ctx.strokeStyle = glow > 0.01
          ? node.color + Math.round(lerp(0x55, 0xCC, glow)).toString(16).padStart(2, '0')
          : node.color + '55'
        ctx.lineWidth = 1
        ctx.stroke()

        // Top accent strip
        rrPath(ctx, nx, ny, nodeW, 3, 2)
        ctx.fillStyle = node.color + (glow > 0.01 ? 'CC' : '88')
        ctx.fill()

        const labelFontSize = Math.max(10, Math.min(13, nodeW / 7))
        const subFontSize = Math.max(8.5, Math.min(11, nodeW / 11))

        // Label
        ctx.fillStyle = glow > 0.01 ? node.color : node.color + 'CC'
        ctx.font = `600 ${labelFontSize}px 'Geist Mono', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.label, nx + nodeW / 2, ny + nodeH * 0.38, nodeW - 8)

        // Sub label
        ctx.fillStyle = '#6B6B8A'
        ctx.font = `${subFontSize}px 'Geist Mono', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.sub, nx + nodeW / 2, ny + nodeH * 0.68, nodeW - 8)
      })

      // Dot position along line
      const dotX = isQuery
        ? lerp(lineX0, lineX1, easedFrac)
        : lerp(lineX1, lineX0, easedFrac)
      const dotY = lineY
      const dotColor = isQuery ? '#FF6B6B' : '#A5F3FC'
      const dotR = 5

      // Trail
      const trailLen = 40
      const trailDir = isQuery ? -1 : 1
      const trailGrad = ctx.createLinearGradient(
        dotX + trailDir * trailLen, dotY,
        dotX, dotY
      )
      trailGrad.addColorStop(0, dotColor + '00')
      trailGrad.addColorStop(1, dotColor + '88')
      ctx.beginPath()
      ctx.moveTo(dotX + trailDir * trailLen, dotY)
      ctx.lineTo(dotX, dotY)
      ctx.strokeStyle = trailGrad
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Dot glow
      ctx.save()
      ctx.shadowColor = dotColor
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
      ctx.restore()

      // Dot label above
      const dotLabel = isQuery ? 'looking up…' : '140.82.x.x ✓'
      ctx.fillStyle = dotColor
      ctx.font = `500 10px 'Geist Mono', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(dotLabel, dotX, dotY - dotR - 4)

      // Bottom legend (last 30px)
      const legendY = H - 15
      ctx.font = `500 11px 'Geist Mono', monospace`
      ctx.textBaseline = 'middle'

      ctx.fillStyle = '#FF6B6B'
      ctx.textAlign = 'left'
      ctx.fillText('● Query', W * 0.05, legendY)

      ctx.fillStyle = '#A5F3FC'
      ctx.textAlign = 'left'
      ctx.fillText('● Response', W * 0.35, legendY)

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className="w-full h-full" style={{ background: '#07070E' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
