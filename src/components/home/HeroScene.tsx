'use client'
import { useEffect, useRef } from 'react'

const STAGES = [
  { label: 'URL',    color: '#00D4FF', wy:  0.00 },
  { label: 'DNS',    color: '#4D9FFF', wy: -0.65 },
  { label: 'TCP',    color: '#A78BFA', wy:  0.55 },
  { label: 'TLS',    color: '#FFB340', wy: -0.80 },
  { label: 'HTTP',   color: '#00E5A0', wy:  0.45 },
  { label: 'Render', color: '#FF6B6B', wy: -0.55 },
  { label: 'Screen', color: '#00D4FF', wy:  0.00 },
]

const N        = STAGES.length
const HOP_MS   = 1050
const PAUSE_MS = 550
const UNIT_MS  = HOP_MS + PAUSE_MS
const CYCLE_MS = N * UNIT_MS
const TRAIL    = 26

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function hex2rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; rgb: [number,number,number] }
type TrailPt   = { x: number; y: number; rgb: [number,number,number] }

export default function HeroScene() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const wrapRef      = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number>(0)
  const t0Ref        = useRef<number>(-1)
  const trailRef     = useRef<TrailPt[]>([])
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0

    function resize() {
      const dpr = window.devicePixelRatio || 1
      W = wrap.clientWidth
      H = wrap.clientHeight
      canvas.width  = W * dpr
      canvas.height = H * dpr
      canvas.style.width  = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      spawnParticles()
    }

    function spawnParticles() {
      particlesRef.current = Array.from({ length: 32 }, () => {
        const stage = STAGES[Math.floor(Math.random() * N)]
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -(Math.random() * 0.35 + 0.08),
          r:  Math.random() * 1.4 + 0.4,
          alpha: Math.random() * 0.18 + 0.04,
          rgb: hex2rgb(stage.color),
        }
      })
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    function nodePos(i: number) {
      const idx  = ((i % N) + N) % N
      const padX = W * 0.07
      const cx   = padX + (idx / (N - 1)) * (W - padX * 2)
      const cy   = H * 0.52 + STAGES[idx].wy * H * 0.26
      return { x: cx, y: cy }
    }

    function radialGlow(x: number, y: number, r: number, rgb: [number,number,number], alpha: number) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      const [rr, gg, bb] = rgb
      g.addColorStop(0,    `rgba(${rr},${gg},${bb},${(alpha * 0.75).toFixed(3)})`)
      g.addColorStop(0.35, `rgba(${rr},${gg},${bb},${(alpha * 0.28).toFixed(3)})`)
      g.addColorStop(1,    `rgba(${rr},${gg},${bb},0)`)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    }

    function frame(now: number) {
      if (t0Ref.current < 0) t0Ref.current = now
      if (!W || !H) { rafRef.current = requestAnimationFrame(frame); return }

      ctx.clearRect(0, 0, W, H)

      const elapsed   = (now - t0Ref.current) % CYCLE_MS
      const seg       = Math.floor(elapsed / UNIT_MS)
      const segFrac   = (elapsed % UNIT_MS) / UNIT_MS
      const hopFrac   = Math.min(segFrac / (HOP_MS / UNIT_MS), 1)
      const inPause   = segFrac > HOP_MS / UNIT_MS
      const pauseFrac = inPause
        ? (segFrac - HOP_MS / UNIT_MS) / (PAUSE_MS / UNIT_MS)
        : 0

      const fromIdx = seg % N
      const toIdx   = (seg + 1) % N
      const from    = nodePos(fromIdx)
      const to      = nodePos(toIdx)
      const e       = easeInOut(hopFrac)
      const px      = from.x + (to.x - from.x) * e
      const pyL     = from.y + (to.y - from.y) * e
      const arcH    = Math.sin(hopFrac * Math.PI) * Math.min(H * 0.13, 40)
      const py      = inPause ? to.y : pyL - arcH

      // ── Ambient particles ────────────────────────────────────────────────
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W }
        if (p.x < -8) p.x = W + 8
        if (p.x > W + 8) p.x = -8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.alpha.toFixed(3)})`
        ctx.fill()
      }

      // ── Connection lines ─────────────────────────────────────────────────
      for (let i = 0; i < N - 1; i++) {
        const a = nodePos(i), b = nodePos(i + 1)
        const [ra, ga, ba] = hex2rgb(STAGES[i].color)
        const [rb, gb, bb2] = hex2rgb(STAGES[i + 1].color)
        const isActive = i === fromIdx
        const alpha = isActive ? 0.28 : 0.10

        const lg = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        lg.addColorStop(0, `rgba(${ra},${ga},${ba},${alpha.toFixed(3)})`)
        lg.addColorStop(1, `rgba(${rb},${gb},${bb2},${alpha.toFixed(3)})`)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = lg
        ctx.lineWidth   = isActive ? 1.4 : 0.8
        ctx.stroke()
      }

      // Active segment: glowing progress line up to packet position
      if (!inPause) {
        const [rf, gf, bf] = hex2rgb(STAGES[fromIdx].color)
        const [rt, gt, bt] = hex2rgb(STAGES[toIdx].color)
        const lg = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
        lg.addColorStop(0,   `rgba(${rf},${gf},${bf},0.65)`)
        lg.addColorStop(e,   `rgba(${rt},${gt},${bt},0.65)`)
        lg.addColorStop(Math.min(e + 0.001, 1), `rgba(${rt},${gt},${bt},0)`)
        lg.addColorStop(1,   `rgba(${rt},${gt},${bt},0)`)
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = lg
        ctx.lineWidth   = 2
        ctx.stroke()
      }

      // ── Nodes ────────────────────────────────────────────────────────────
      for (let i = 0; i < N; i++) {
        const { x, y } = nodePos(i)
        const rgb       = hex2rgb(STAGES[i].color)
        const [rr, gg, bb] = rgb
        const r         = Math.max(6, W * 0.0048)
        const isArrival = i === toIdx && inPause
        const isDeparture = i === fromIdx && !inPause
        const glowScale = isArrival ? 1.0 : (isDeparture ? 0.7 : 0.45)

        // Outer ambient glow
        radialGlow(x, y, r * 6.5, rgb, glowScale * 0.55)
        // Inner tight glow
        radialGlow(x, y, r * 2.8, rgb, glowScale * 0.9)

        // Staggered arrival pulse rings
        if (isArrival) {
          for (let ring = 0; ring < 3; ring++) {
            const delay = ring * 0.18
            const f = Math.max(0, pauseFrac - delay)
            if (f <= 0) continue
            const scale = 1 + f * 3.8
            const a = (1 - f) * 0.75
            ctx.beginPath()
            ctx.arc(x, y, r * scale, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(${rr},${gg},${bb},${a.toFixed(3)})`
            ctx.lineWidth   = 1.5 - ring * 0.3
            ctx.stroke()
          }
        }

        // Core node with shadow
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle  = `rgb(${rr},${gg},${bb})`
        ctx.shadowBlur  = isArrival ? 22 : 10
        ctx.shadowColor = `rgb(${rr},${gg},${bb})`
        ctx.fill()
        ctx.shadowBlur  = 0

        // Inner highlight
        ctx.beginPath()
        ctx.arc(x, y, r * 0.38, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${isArrival ? 0.95 : 0.5})`
        ctx.fill()

        // Label
        const fs = Math.max(10, Math.min(13, W / 108))
        ctx.font         = `600 ${fs}px 'Geist Mono', ui-monospace, monospace`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'bottom'
        ctx.shadowBlur   = isArrival ? 8 : 4
        ctx.shadowColor  = `rgba(${rr},${gg},${bb},0.9)`
        ctx.fillStyle    = `rgba(${rr},${gg},${bb},${isArrival ? 1 : 0.78})`
        ctx.globalAlpha  = isArrival ? 1 : 0.85
        ctx.fillText(STAGES[i].label, x, y - r - 8)
        ctx.shadowBlur   = 0
        ctx.globalAlpha  = 1
      }

      // ── Packet trail + core ──────────────────────────────────────────────
      const fromRgb = hex2rgb(STAGES[fromIdx].color)
      const toRgb   = hex2rgb(STAGES[toIdx].color)
      const pktRgb  = lerpRgb(fromRgb, toRgb, e)

      trailRef.current.unshift({ x: px, y: py, rgb: pktRgb })
      if (trailRef.current.length > TRAIL) trailRef.current.length = TRAIL

      trailRef.current.forEach((pt, i) => {
        const frac = 1 - (i + 1) / TRAIL
        const tR   = Math.max(1.5, W * 0.003) * frac
        const [cr, cg, cb] = pt.rgb
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, tR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(frac * 0.55).toFixed(3)})`
        ctx.fill()
      })

      // Packet glow layers
      const pR = Math.max(5.5, W * 0.0048)
      radialGlow(px, py, pR * 7,   pktRgb, 0.9)
      radialGlow(px, py, pR * 2.8, [255,255,255], 0.7)

      // Packet core
      ctx.beginPath()
      ctx.arc(px, py, pR, 0, Math.PI * 2)
      ctx.fillStyle  = '#ffffff'
      ctx.shadowBlur  = 22
      ctx.shadowColor = `rgb(${pktRgb[0]},${pktRgb[1]},${pktRgb[2]})`
      ctx.fill()
      ctx.shadowBlur  = 0

      // Ultra-bright center
      ctx.beginPath()
      ctx.arc(px, py, pR * 0.38, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(220,245,255,1)'
      ctx.fill()

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
