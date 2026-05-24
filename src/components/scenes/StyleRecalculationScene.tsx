'use client'
import { useEffect, useRef } from 'react'

// DOM tree: 1 root + descendants. Mutation hits one node; dirty bits radiate
// down to descendants. Subtree marks "dirty" then resolves to clean. Cycles.

interface Node {
  id: number
  parent: number | null
  depth: number
  // Layout positions (computed at resize)
  x: number
  y: number
}

const TREE: Omit<Node, 'x' | 'y'>[] = [
  { id: 0, parent: null, depth: 0 }, // root
  { id: 1, parent: 0, depth: 1 },
  { id: 2, parent: 0, depth: 1 },
  { id: 3, parent: 0, depth: 1 },
  { id: 4, parent: 1, depth: 2 },
  { id: 5, parent: 1, depth: 2 },
  { id: 6, parent: 2, depth: 2 },
  { id: 7, parent: 2, depth: 2 },
  { id: 8, parent: 3, depth: 2 },
  { id: 9, parent: 4, depth: 3 },
  { id: 10, parent: 6, depth: 3 },
  { id: 11, parent: 6, depth: 3 },
  { id: 12, parent: 8, depth: 3 },
]

const MUTATION_NODE = 2 // pick a mid-tree node so the subtree below it marks dirty
const CYCLE_MS = 5200

// Compute descendants of a node
function descendantsOf(id: number): number[] {
  const out: number[] = []
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    for (const n of TREE) {
      if (n.parent === cur) {
        out.push(n.id)
        stack.push(n.id)
      }
    }
  }
  return out
}

const DIRTY_SET = new Set([MUTATION_NODE, ...descendantsOf(MUTATION_NODE)])

export default function StyleRecalculationScene() {
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

    function layoutNodes(): Node[] {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      const padTop = 36
      const padBottom = 28
      const padX = 24
      const maxDepth = Math.max(...TREE.map(n => n.depth))
      const levelH = (H - padTop - padBottom) / maxDepth
      // Group nodes by depth for x-distribution
      const byDepth: Record<number, typeof TREE> = {}
      TREE.forEach(n => {
        if (!byDepth[n.depth]) byDepth[n.depth] = []
        byDepth[n.depth].push(n)
      })
      const positioned: Node[] = []
      for (const n of TREE) {
        const peers = byDepth[n.depth]
        const idxInLevel = peers.indexOf(n)
        const availW = W - padX * 2
        const x = padX + ((idxInLevel + 1) / (peers.length + 1)) * availW
        const y = padTop + n.depth * levelH
        positioned.push({ ...n, x, y })
      }
      return positioned
    }

    function drawFrame(progress: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const nodes = layoutNodes()
      const nodeById = new Map(nodes.map(n => [n.id, n]))

      // Header
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('STYLE INVALIDATION', 24, 14)

      // Phases of one cycle:
      //  0.0 - 0.1: mutation strike at MUTATION_NODE
      //  0.1 - 0.5: dirty wave propagates down by depth
      //  0.5 - 0.75: subtree held dirty
      //  0.75 - 1.0: resolves back to clean
      const mutationActive = progress < 0.1
      const waveProgress = Math.max(0, Math.min(1, (progress - 0.1) / 0.4))
      const subtreeMaxDepth = Math.max(...Array.from(DIRTY_SET).map(id => TREE.find(n => n.id === id)!.depth))
      const minDirtyDepth = TREE.find(n => n.id === MUTATION_NODE)!.depth
      const waveDepth = minDirtyDepth + waveProgress * (subtreeMaxDepth - minDirtyDepth + 0.5)
      const resolving = progress > 0.75 ? (progress - 0.75) / 0.25 : 0

      function nodeDirtyLevel(id: number): number {
        if (!DIRTY_SET.has(id)) return 0
        const node = TREE.find(n => n.id === id)!
        if (mutationActive && id === MUTATION_NODE) return 1
        if (node.depth > waveDepth) return 0
        const ramp = Math.max(0, Math.min(1, waveDepth - node.depth + 0.4))
        return Math.max(0, ramp - resolving)
      }

      // Edges
      for (const n of nodes) {
        if (n.parent == null) continue
        const p = nodeById.get(n.parent)!
        const childDirty = nodeDirtyLevel(n.id)
        const parentDirty = nodeDirtyLevel(p.id)
        const edgeDirty = Math.min(childDirty, parentDirty)
        const baseAlpha = 0.18
        ctx!.strokeStyle = edgeDirty > 0.05
          ? `rgba(165, 243, 252, ${baseAlpha + 0.55 * edgeDirty})`
          : `rgba(125, 211, 252, ${baseAlpha})`
        ctx!.lineWidth = edgeDirty > 0.05 ? 1.4 : 1
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(n.x, n.y)
        ctx!.stroke()
      }

      // Nodes
      for (const n of nodes) {
        const dirty = nodeDirtyLevel(n.id)
        const isMutation = n.id === MUTATION_NODE
        const baseR = 4.5

        // Mutation halo
        if (isMutation && mutationActive) {
          const t = progress / 0.1
          const haloR = baseR + t * 20
          ctx!.strokeStyle = `rgba(165, 243, 252, ${1 - t})`
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, haloR, 0, Math.PI * 2)
          ctx!.stroke()
        }

        // Dirty halo
        if (dirty > 0.05) {
          ctx!.fillStyle = `rgba(165, 243, 252, ${0.12 * dirty})`
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, baseR + 6, 0, Math.PI * 2)
          ctx!.fill()
        }

        // Node fill
        const fillAlpha = dirty > 0.05 ? 0.85 + 0.15 * dirty : 0.4
        ctx!.fillStyle = dirty > 0.05
          ? `rgba(165, 243, 252, ${fillAlpha})`
          : `rgba(125, 211, 252, ${fillAlpha})`
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, baseR, 0, Math.PI * 2)
        ctx!.fill()

        // Outline for mutation source
        if (isMutation) {
          ctx!.strokeStyle = 'rgba(165, 243, 252, 0.85)'
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, baseR + 1.5, 0, Math.PI * 2)
          ctx!.stroke()
        }
      }

      // Status caption
      const captionY = H - 14
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textBaseline = 'middle'
      ctx!.textAlign = 'left'
      let caption = 'idle'
      let color = 'rgba(125, 211, 252, 0.45)'
      if (mutationActive) { caption = 'classList change → mark dirty'; color = '#A5F3FC' }
      else if (waveProgress < 1) { caption = 'invalidating subtree'; color = '#A5F3FC' }
      else if (resolving < 1 && resolving > 0) { caption = 'recompute styles'; color = 'rgba(165, 243, 252, 0.7)' }
      else if (waveProgress >= 1 && resolving === 0) { caption = 'subtree marked dirty'; color = 'rgba(165, 243, 252, 0.7)' }
      ctx!.fillStyle = color
      ctx!.fillText(caption, 24, captionY)
    }

    if (prefersReduced) {
      drawFrame(0.35)
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
