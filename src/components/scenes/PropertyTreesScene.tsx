'use client'
import { useEffect, useRef } from 'react'

// Property tree: root node fans out to five property-type branches.
// Each branch has two sub-children. A change "pulse" flashes a branch,
// then propagates down its sub-children — illustrating inheritance.

const TEAL = '#7DD3FC'
const MINT = '#A5F3FC'
const CYAN = '#67E8F9'
const DIM  = 'rgba(125, 211, 252, 0.45)'

const BRANCHES = [
  { id: 'transform', label: 'Transform', sub: 'matrix3d' },
  { id: 'clip',      label: 'Clip',      sub: 'rect' },
  { id: 'effect',    label: 'Effect',    sub: 'filter' },
  { id: 'opacity',   label: 'Opacity',   sub: '0.0–1.0' },
  { id: 'scroll',    label: 'Scroll',    sub: 'offsetY' },
]

const PULSE_MS = 950
const CYCLE_MS = PULSE_MS * BRANCHES.length

export default function PropertyTreesScene() {
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

    function nodePill(cx: number, cy: number, w: number, h: number, label: string, sub: string, intensity: number) {
      const a = 0.25 + intensity * 0.55
      ctx!.fillStyle = `rgba(125, 211, 252, ${0.06 + intensity * 0.18})`
      ctx!.strokeStyle = `rgba(125, 211, 252, ${a})`
      ctx!.lineWidth = 1
      ctx!.beginPath()
      const r = h / 2
      ctx!.moveTo(cx - w / 2 + r, cy - h / 2)
      ctx!.lineTo(cx + w / 2 - r, cy - h / 2)
      ctx!.arc(cx + w / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2)
      ctx!.lineTo(cx - w / 2 + r, cy + h / 2)
      ctx!.arc(cx - w / 2 + r, cy, r, Math.PI / 2, -Math.PI / 2)
      ctx!.closePath()
      ctx!.fill()
      ctx!.stroke()

      ctx!.fillStyle = intensity > 0.4 ? CYAN : TEAL
      ctx!.font = "600 10.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillText(label, cx, cy - 5)

      ctx!.fillStyle = `rgba(165, 243, 252, ${0.4 + intensity * 0.4})`
      ctx!.font = "500 8.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.fillText(sub, cx, cy + 8)
    }

    function edge(x1: number, y1: number, x2: number, y2: number, intensity: number) {
      ctx!.strokeStyle = `rgba(125, 211, 252, ${0.18 + intensity * 0.5})`
      ctx!.lineWidth = intensity > 0.3 ? 1.4 : 1
      ctx!.beginPath()
      // Soft curve
      const my = (y1 + y2) / 2
      ctx!.moveTo(x1, y1)
      ctx!.bezierCurveTo(x1, my, x2, my, x2, y2)
      ctx!.stroke()
    }

    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const elapsed = (now - t0) % CYCLE_MS
      const activeIdx = Math.floor(elapsed / PULSE_MS)
      const localT = (elapsed % PULSE_MS) / PULSE_MS
      // localT: 0..0.45 highlight branch parent, 0.4..0.9 propagate to leaves, 0.9..1 fade

      const padX = 32
      const rowRootY = 40
      const rowBranchY = H * 0.5
      const rowLeafY = H - 56

      const branchPillW = Math.min(96, (W - padX * 2) / BRANCHES.length - 8)
      const branchPillH = 30
      const leafPillW = branchPillW * 0.78
      const leafPillH = 24
      const rootPillW = 96
      const rootPillH = 30

      const branchXs = BRANCHES.map((_, i) => {
        const colW = (W - padX * 2) / BRANCHES.length
        return padX + colW * (i + 0.5)
      })

      // Header
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('property trees', 24, 16)
      ctx!.textAlign = 'right'
      ctx!.fillStyle = DIM
      ctx!.fillText(`updating: ${BRANCHES[activeIdx].label}`, W - 24, 16)

      // Edges first (so nodes overdraw)
      for (let i = 0; i < BRANCHES.length; i++) {
        const intensityRoot = i === activeIdx ? Math.max(0, 1 - localT * 1.8) : 0
        edge(W / 2, rowRootY + rootPillH / 2, branchXs[i], rowBranchY - branchPillH / 2, intensityRoot)
        // To leaves
        const leafIntensity = i === activeIdx ? Math.max(0, Math.min(1, (localT - 0.3) * 1.8)) : 0
        const leafLx = branchXs[i] - leafPillW * 0.55
        const leafRx = branchXs[i] + leafPillW * 0.55
        edge(branchXs[i], rowBranchY + branchPillH / 2, leafLx, rowLeafY - leafPillH / 2, leafIntensity)
        edge(branchXs[i], rowBranchY + branchPillH / 2, leafRx, rowLeafY - leafPillH / 2, leafIntensity)
      }

      // Root
      const rootIntensity = Math.max(0, 1 - localT * 2.4)
      nodePill(W / 2, rowRootY, rootPillW, rootPillH, 'Root', 'frame', rootIntensity)

      // Branches
      for (let i = 0; i < BRANCHES.length; i++) {
        const isActive = i === activeIdx
        const intensity = isActive ? Math.max(0, 1 - Math.abs(localT - 0.2) * 2.2) : 0
        nodePill(branchXs[i], rowBranchY, branchPillW, branchPillH, BRANCHES[i].label, BRANCHES[i].sub, intensity)

        // Leaves
        const leafIntensity = isActive ? Math.max(0, Math.min(1, (localT - 0.35) * 2.4)) : 0
        const leafLx = branchXs[i] - leafPillW * 0.55
        const leafRx = branchXs[i] + leafPillW * 0.55
        nodePill(leafLx, rowLeafY, leafPillW, leafPillH, 'child·a', 'inherits', leafIntensity)
        nodePill(leafRx, rowLeafY, leafPillW, leafPillH, 'child·b', 'inherits', leafIntensity)
      }

      // Propagation dot — small mote travels from root → branch → leaf
      if (localT < 0.95) {
        const segT = localT
        let dx = W / 2, dy = rowRootY + rootPillH / 2
        if (segT < 0.45) {
          // root → branch
          const k = segT / 0.45
          dx = W / 2 + (branchXs[activeIdx] - W / 2) * k
          dy = rowRootY + rootPillH / 2 + (rowBranchY - branchPillH / 2 - (rowRootY + rootPillH / 2)) * k
        } else if (segT < 0.9) {
          // branch → leaf (pick left leaf for the visible mote)
          const k = (segT - 0.45) / 0.45
          const leafLx = branchXs[activeIdx] - leafPillW * 0.55
          dx = branchXs[activeIdx] + (leafLx - branchXs[activeIdx]) * k
          dy = rowBranchY + branchPillH / 2 + (rowLeafY - leafPillH / 2 - (rowBranchY + branchPillH / 2)) * k
        } else {
          dx = branchXs[activeIdx] - leafPillW * 0.55
          dy = rowLeafY - leafPillH / 2
        }
        ctx!.fillStyle = CYAN
        ctx!.shadowColor = MINT
        ctx!.shadowBlur = 10
        ctx!.beginPath()
        ctx!.arc(dx, dy, 3, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.shadowBlur = 0
      }

      // Footer
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.42)'
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('changes flow down → children inherit', 24, H - 18)
    }

    if (prefersReduced) {
      drawFrame(t0 + PULSE_MS * 0.5)
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
