'use client'
import { useEffect, useRef } from 'react'

// 5 lanes: HIGHEST → LOWEST. Packets drop from top, slot into their priority lane,
// then slide left on a slow conveyor. The "highest" lane drains faster (carried first).

const LANES = [
  { key: 'HIGHEST', speed: 80, color: '#A5F3FC' }, // brightest
  { key: 'HIGH',    speed: 60, color: '#7DD3FC' },
  { key: 'MEDIUM',  speed: 44, color: '#67E8F9' },
  { key: 'LOW',     speed: 30, color: '#BAE6FD' },
  { key: 'LOWEST',  speed: 18, color: 'rgba(186, 230, 253, 0.55)' },
]

interface Packet {
  lane: number
  x: number      // current x (px)
  y: number      // current y (px) — animates from spawn to lane
  targetY: number
  spawnedAt: number
  settled: boolean
  size: number
}

export default function ResourceLoadingPrioritiesScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const visibleRef = useRef(true)
  const packetsRef = useRef<Packet[]>([])
  const lastSpawnRef = useRef(0)

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

    function laneGeometry() {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      const padLeft = 90
      const padRight = 24
      const padTop = 20
      const padBottom = 18
      const trackW = W - padLeft - padRight
      const laneH = (H - padTop - padBottom) / LANES.length
      return { W, H, padLeft, padRight, padTop, padBottom, trackW, laneH }
    }

    function drawFrame(dtMs: number) {
      const { W, H, padLeft, padTop, trackW, laneH } = laneGeometry()
      ctx!.clearRect(0, 0, W, H)

      // Lane backgrounds + labels
      LANES.forEach((lane, i) => {
        const y = padTop + i * laneH
        ctx!.fillStyle = i % 2 === 0
          ? 'rgba(125, 211, 252, 0.025)'
          : 'rgba(125, 211, 252, 0.012)'
        ctx!.fillRect(padLeft, y, trackW, laneH - 4)

        // Lane label
        ctx!.fillStyle = i === 0
          ? 'rgba(165, 243, 252, 0.85)'
          : 'rgba(125, 211, 252, 0.5)'
        ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(lane.key, padLeft - 12, y + laneH / 2)

        // Lane left/right edges
        ctx!.fillStyle = 'rgba(125, 211, 252, 0.18)'
        ctx!.fillRect(padLeft, y + (laneH - 4) / 2, 2, 1)
      })

      // Drain edge marker (left)
      ctx!.strokeStyle = 'rgba(165, 243, 252, 0.22)'
      ctx!.lineWidth = 1
      ctx!.setLineDash([2, 3])
      ctx!.beginPath()
      ctx!.moveTo(padLeft, padTop - 4)
      ctx!.lineTo(padLeft, H - 12)
      ctx!.stroke()
      ctx!.setLineDash([])

      // Move + draw packets
      const dt = dtMs / 1000
      const surviving: Packet[] = []
      for (const p of packetsRef.current) {
        // Settle in lane (y animation)
        if (!p.settled) {
          const dy = p.targetY - p.y
          if (Math.abs(dy) < 0.6) {
            p.y = p.targetY
            p.settled = true
          } else {
            p.y += dy * Math.min(1, dt * 6)
          }
        } else {
          // Slide left
          const speed = LANES[p.lane].speed
          p.x -= speed * dt
        }

        if (p.x < padLeft - 12) continue
        surviving.push(p)

        // Draw packet
        const color = LANES[p.lane].color
        // Glow halo
        ctx!.save()
        ctx!.shadowColor = '#A5F3FC'
        ctx!.shadowBlur = p.settled ? 6 : 10
        ctx!.fillStyle = color
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()

        // Trailing comet
        if (p.settled) {
          const trailGrad = ctx!.createLinearGradient(p.x, p.y, p.x + 22, p.y)
          trailGrad.addColorStop(0, 'rgba(125, 211, 252, 0)')
          trailGrad.addColorStop(1, 'rgba(165, 243, 252, 0.4)')
          ctx!.strokeStyle = trailGrad
          ctx!.lineWidth = 1.5
          ctx!.beginPath()
          ctx!.moveTo(p.x + 4, p.y)
          ctx!.lineTo(p.x + 22, p.y)
          ctx!.stroke()
        }
      }
      packetsRef.current = surviving
    }

    function spawn(now: number) {
      const { padLeft, trackW, padTop, laneH } = laneGeometry()
      // Weighted: higher priority more frequent (real-world: highest = HTML/CSS = many)
      const weights = [4, 5, 4, 2, 1]
      const total = weights.reduce((a, b) => a + b, 0)
      let pick = Math.random() * total
      let lane = 0
      for (let i = 0; i < weights.length; i++) {
        if (pick < weights[i]) { lane = i; break }
        pick -= weights[i]
      }
      const targetY = padTop + lane * laneH + (laneH - 4) / 2
      const spawnX = padLeft + trackW - 12 - Math.random() * 18
      packetsRef.current.push({
        lane,
        x: spawnX,
        y: -8,
        targetY,
        spawnedAt: now,
        settled: false,
        size: 3.5 + Math.random() * 1.5,
      })
    }

    if (prefersReduced) {
      // Static snapshot: one packet per lane mid-track
      const { padLeft, trackW, padTop, laneH } = laneGeometry()
      for (let i = 0; i < LANES.length; i++) {
        packetsRef.current.push({
          lane: i,
          x: padLeft + trackW * 0.5,
          y: padTop + i * laneH + (laneH - 4) / 2,
          targetY: padTop + i * laneH + (laneH - 4) / 2,
          spawnedAt: 0,
          settled: true,
          size: 4,
        })
      }
      drawFrame(0)
      return () => {
        ro.disconnect()
        io.disconnect()
      }
    }

    let last = performance.now()
    const tick = (now: number) => {
      if (!visibleRef.current) {
        last = now
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const dt = now - last
      last = now
      if (now - lastSpawnRef.current > 280) {
        spawn(now)
        lastSpawnRef.current = now
      }
      drawFrame(dt)
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
