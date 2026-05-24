'use client'
import { useEffect, useRef } from 'react'

// Top: HTML token stream with a parser cursor.
// Token kinds: text | sync-script | defer-script
// When cursor reaches sync-script: cursor halts; bottom panel runs an "execute" pulse.
// Defer scripts are skipped during parsing — they fire at the very end.

type Kind = 'text' | 'sync' | 'defer'
interface Token {
  text: string
  kind: Kind
  // Pause duration in cycle progress for sync (e.g. 0.08 = 8% of cycle hold)
  hold?: number
}

const TOKENS: Token[] = [
  { text: '<html>',          kind: 'text' },
  { text: '<head>',          kind: 'text' },
  { text: '<title>',         kind: 'text' },
  { text: '…',               kind: 'text' },
  { text: '</title>',        kind: 'text' },
  { text: '<script defer>',  kind: 'defer' },
  { text: '<script>',        kind: 'sync', hold: 0.14 },
  { text: '<body>',          kind: 'text' },
  { text: '<h1>',            kind: 'text' },
  { text: '</h1>',           kind: 'text' },
  { text: '<p>',             kind: 'text' },
  { text: '</p>',            kind: 'text' },
  { text: '</body>',         kind: 'text' },
  { text: '</html>',         kind: 'text' },
]

const CYCLE_MS = 7000

export default function ScriptsDuringParsingScene() {
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

    // Pre-compute per-token progress slot. Sync holds expand a slot.
    function computeSlots() {
      const baseUnit = 1
      const slots: { start: number; end: number }[] = []
      let cursor = 0
      let total = 0
      for (const tk of TOKENS) {
        const w = baseUnit + (tk.kind === 'sync' ? (tk.hold ?? 0.1) * 10 : 0)
        total += w
      }
      for (const tk of TOKENS) {
        const w = baseUnit + (tk.kind === 'sync' ? (tk.hold ?? 0.1) * 10 : 0)
        const start = cursor / total
        const end = (cursor + w) / total
        slots.push({ start, end })
        cursor += w
      }
      return slots
    }

    const slots = computeSlots()

    function drawFrame(progress: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padX = 24
      const parserY = H * 0.32
      const execPanelTop = H * 0.55
      const execPanelH = H * 0.32

      // Top label
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('HTML PARSER', padX, 14)

      // Compute laid-out token positions (left → right)
      ctx!.font = '500 12px ui-monospace, SFMono-Regular, monospace'
      const gap = 8
      let x = padX
      const positions: { x: number; w: number }[] = []
      for (const tk of TOKENS) {
        const w = ctx!.measureText(tk.text).width
        positions.push({ x, w })
        x += w + gap
      }
      // Scale to fit
      const totalW = x - padX
      const availW = W - padX * 2
      const scale = availW / totalW
      const scaledX = (i: number) => padX + (positions[i].x - padX) * scale
      const scaledW = (i: number) => positions[i].w * scale

      // Active token index
      let activeIdx = 0
      for (let i = 0; i < slots.length; i++) {
        if (progress >= slots[i].start && progress < slots[i].end) {
          activeIdx = i
          break
        }
        if (progress >= slots[i].end) activeIdx = i
      }
      const slot = slots[activeIdx]
      const intoSlot = (progress - slot.start) / (slot.end - slot.start)

      // Draw tokens
      TOKENS.forEach((tk, i) => {
        const tx = scaledX(i)
        const tw = scaledW(i)
        const visited = i < activeIdx
        const isActive = i === activeIdx

        let color: string
        if (tk.kind === 'sync') {
          color = isActive ? '#A5F3FC' : visited ? 'rgba(165, 243, 252, 0.7)' : 'rgba(165, 243, 252, 0.3)'
        } else if (tk.kind === 'defer') {
          color = visited ? 'rgba(186, 230, 253, 0.45)' : 'rgba(186, 230, 253, 0.25)'
        } else {
          color = isActive
            ? 'rgba(165, 243, 252, 0.95)'
            : visited
              ? 'rgba(125, 211, 252, 0.75)'
              : 'rgba(125, 211, 252, 0.32)'
        }

        // Underline for kind
        if (tk.kind === 'sync' || tk.kind === 'defer') {
          const ulY = parserY + 8
          ctx!.strokeStyle = tk.kind === 'sync'
            ? 'rgba(165, 243, 252, 0.55)'
            : 'rgba(186, 230, 253, 0.4)'
          ctx!.lineWidth = 1
          ctx!.setLineDash(tk.kind === 'defer' ? [2, 3] : [])
          ctx!.beginPath()
          ctx!.moveTo(tx, ulY)
          ctx!.lineTo(tx + tw, ulY)
          ctx!.stroke()
          ctx!.setLineDash([])
        }

        ctx!.fillStyle = color
        ctx!.font = '500 12px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(tk.text, tx, parserY)
      })

      // Cursor — sits at the current token's left edge, with subtle pulse when on sync
      const cursorTok = TOKENS[activeIdx]
      const cursorX = scaledX(activeIdx) + scaledW(activeIdx) * Math.min(1, intoSlot * 1.05)
      const isPaused = cursorTok.kind === 'sync'
      const pulse = isPaused ? 0.5 + 0.5 * Math.sin(progress * Math.PI * 32) : 0
      ctx!.fillStyle = `rgba(165, 243, 252, ${0.75 + pulse * 0.25})`
      ctx!.fillRect(cursorX, parserY - 10, 2, 20)
      // halo
      if (isPaused) {
        ctx!.fillStyle = `rgba(165, 243, 252, ${0.08 + pulse * 0.08})`
        ctx!.fillRect(cursorX - 6, parserY - 14, 14, 28)
      }

      // Execution panel
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.18)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(padX, execPanelTop, W - padX * 2, execPanelH)
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('JS EXECUTION', padX + 8, execPanelTop + 8)

      // Sync execution pulse — vertical bars during sync token
      if (isPaused) {
        const barCount = 12
        const barAreaW = W - padX * 2 - 16
        const barW = barAreaW / barCount
        for (let b = 0; b < barCount; b++) {
          const phase = (progress * 12 + b * 0.4) % 1
          const h = (Math.sin(phase * Math.PI) * 0.7 + 0.3) * (execPanelH * 0.45)
          const bx = padX + 8 + b * barW + 1
          const by = execPanelTop + execPanelH / 2 - h / 2
          ctx!.fillStyle = 'rgba(165, 243, 252, 0.7)'
          ctx!.fillRect(bx, by, barW - 2, h)
        }
        // Label
        ctx!.fillStyle = '#A5F3FC'
        ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'top'
        ctx!.fillText('parser blocked', W - padX - 8, execPanelTop + 8)
      } else if (progress > 0.95) {
        // Defer executes near the end — show a small pulse
        const pulseAmt = (progress - 0.95) / 0.05
        const barCount = 6
        const barAreaW = (W - padX * 2 - 16) * 0.4
        const barW = barAreaW / barCount
        for (let b = 0; b < barCount; b++) {
          const phase = (b * 0.5 + progress * 8) % 1
          const h = (Math.sin(phase * Math.PI) * 0.6 + 0.3) * (execPanelH * 0.4) * pulseAmt
          const bx = padX + 8 + b * barW + 1
          const by = execPanelTop + execPanelH / 2 - h / 2
          ctx!.fillStyle = 'rgba(186, 230, 253, 0.6)'
          ctx!.fillRect(bx, by, barW - 2, h)
        }
        ctx!.fillStyle = 'rgba(186, 230, 253, 0.85)'
        ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'top'
        ctx!.fillText('defer fires (parse done)', W - padX - 8, execPanelTop + 8)
      } else {
        ctx!.fillStyle = 'rgba(125, 211, 252, 0.3)'
        ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'top'
        ctx!.fillText('idle', W - padX - 8, execPanelTop + 8)
      }
    }

    if (prefersReduced) {
      drawFrame(slots[6].start + (slots[6].end - slots[6].start) * 0.5)
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
