'use client'
import { useEffect, useRef } from 'react'

// Two side-by-side trees:
//   LEFT:  DOM tree (all nodes)
//   RIGHT: Layout tree (subset — display:none nodes faded out)
// Animate connection lines that "filter" DOM nodes into layout nodes.
// Hidden DOM nodes have no corresponding layout node — drawn dimmed with no line.

interface TreeNode {
  id: number
  parent: number | null
  depth: number
  hidden?: boolean
}

const DOM_TREE: TreeNode[] = [
  { id: 0, parent: null, depth: 0 },
  { id: 1, parent: 0, depth: 1 },
  { id: 2, parent: 0, depth: 1 },
  { id: 3, parent: 0, depth: 1, hidden: true },  // display:none
  { id: 4, parent: 1, depth: 2 },
  { id: 5, parent: 1, depth: 2 },
  { id: 6, parent: 2, depth: 2 },
  { id: 7, parent: 2, depth: 2, hidden: true },  // display:none
  { id: 8, parent: 4, depth: 3 },
]

const CYCLE_MS = 6000

interface Positioned extends TreeNode {
  x: number
  y: number
}

export default function LayoutTreeConstructionScene() {
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

    function layoutTree(originX: number, halfW: number, padTop: number, padBottom: number): Positioned[] {
      const rect = canvas!.getBoundingClientRect()
      const H = rect.height
      const maxDepth = Math.max(...DOM_TREE.map(n => n.depth))
      const levelH = (H - padTop - padBottom) / Math.max(1, maxDepth)
      const byDepth: Record<number, TreeNode[]> = {}
      DOM_TREE.forEach(n => {
        if (!byDepth[n.depth]) byDepth[n.depth] = []
        byDepth[n.depth].push(n)
      })
      return DOM_TREE.map(n => {
        const peers = byDepth[n.depth]
        const idxInLevel = peers.indexOf(n)
        const x = originX + ((idxInLevel + 1) / (peers.length + 1)) * halfW
        const y = padTop + n.depth * levelH
        return { ...n, x, y }
      })
    }

    function drawTree(nodes: Positioned[], opts: { isLayout: boolean; revealProgress: number; label: string; labelX: number }) {
      const { isLayout, revealProgress, label, labelX } = opts
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      // Title
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText(label, labelX, 14)

      // Edges
      for (const n of nodes) {
        if (n.parent == null) continue
        const p = nodeMap.get(n.parent)!
        if (isLayout && (n.hidden || p.hidden)) continue
        ctx!.strokeStyle = isLayout
          ? `rgba(165, 243, 252, ${0.35 * revealProgress})`
          : 'rgba(125, 211, 252, 0.22)'
        ctx!.lineWidth = isLayout ? 1.2 : 1
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(n.x, n.y)
        ctx!.stroke()
      }

      // Nodes
      for (const n of nodes) {
        const baseR = 4.5
        if (isLayout) {
          if (n.hidden) {
            // Faded ghost — not part of layout tree
            ctx!.fillStyle = 'rgba(125, 211, 252, 0.1)'
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, baseR - 1, 0, Math.PI * 2)
            ctx!.fill()
            ctx!.strokeStyle = 'rgba(125, 211, 252, 0.25)'
            ctx!.lineWidth = 0.8
            ctx!.setLineDash([2, 2])
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, baseR + 1, 0, Math.PI * 2)
            ctx!.stroke()
            ctx!.setLineDash([])
          } else {
            const a = 0.4 + 0.5 * revealProgress
            ctx!.fillStyle = `rgba(165, 243, 252, ${a})`
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, baseR, 0, Math.PI * 2)
            ctx!.fill()
            // glow
            if (revealProgress > 0.05) {
              ctx!.fillStyle = `rgba(165, 243, 252, ${0.12 * revealProgress})`
              ctx!.beginPath()
              ctx!.arc(n.x, n.y, baseR + 5, 0, Math.PI * 2)
              ctx!.fill()
            }
          }
        } else {
          // DOM side — show hidden nodes with dashed ring
          if (n.hidden) {
            ctx!.fillStyle = 'rgba(125, 211, 252, 0.35)'
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, baseR, 0, Math.PI * 2)
            ctx!.fill()
            ctx!.strokeStyle = 'rgba(125, 211, 252, 0.55)'
            ctx!.lineWidth = 0.8
            ctx!.setLineDash([2, 2])
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, baseR + 2, 0, Math.PI * 2)
            ctx!.stroke()
            ctx!.setLineDash([])
          } else {
            ctx!.fillStyle = 'rgba(125, 211, 252, 0.75)'
            ctx!.beginPath()
            ctx!.arc(n.x, n.y, baseR, 0, Math.PI * 2)
            ctx!.fill()
          }
        }
      }
    }

    function drawFrame(progress: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padX = 28
      const gutter = 16
      const halfW = (W - padX * 2 - gutter) / 2

      const padTop = 36
      const padBottom = 28

      const domNodes = layoutTree(padX, halfW, padTop, padBottom)
      const layoutNodes = layoutTree(padX + halfW + gutter, halfW, padTop, padBottom)

      drawTree(domNodes, {
        isLayout: false,
        revealProgress: 1,
        label: 'DOM TREE',
        labelX: padX,
      })

      drawTree(layoutNodes, {
        isLayout: true,
        revealProgress: progress,
        label: 'LAYOUT TREE',
        labelX: padX + halfW + gutter,
      })

      // Filter lines: DOM node → Layout node
      // Reveal them in order based on progress
      const filterPairs = DOM_TREE.filter(n => !n.hidden)
      const revealCount = Math.floor(progress * filterPairs.length * 1.05)
      for (let i = 0; i < Math.min(revealCount, filterPairs.length); i++) {
        const n = filterPairs[i]
        const fromNode = domNodes.find(d => d.id === n.id)!
        const toNode = layoutNodes.find(d => d.id === n.id)!
        const lineProgress = Math.min(1, (progress * filterPairs.length - i))
        const x0 = fromNode.x
        const y0 = fromNode.y
        const x1 = fromNode.x + (toNode.x - fromNode.x) * lineProgress
        const y1 = fromNode.y + (toNode.y - fromNode.y) * lineProgress
        ctx!.strokeStyle = 'rgba(165, 243, 252, 0.32)'
        ctx!.lineWidth = 0.8
        ctx!.setLineDash([3, 4])
        ctx!.beginPath()
        ctx!.moveTo(x0, y0)
        ctx!.lineTo(x1, y1)
        ctx!.stroke()
        ctx!.setLineDash([])
        // arrowhead at tip
        if (lineProgress > 0.95) {
          ctx!.fillStyle = 'rgba(165, 243, 252, 0.7)'
          ctx!.beginPath()
          ctx!.arc(x1, y1, 1.6, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      // Caption
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('display:none nodes are filtered out', W / 2, H - 8)
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
      const progress = ((now - t0) % CYCLE_MS) / CYCLE_MS
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
