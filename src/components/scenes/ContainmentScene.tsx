'use client'
import { useEffect, useRef } from 'react'

// Two side-by-side panels:
//   LEFT  — "no contain": child resize jitters siblings + parent
//   RIGHT — "contain: layout": child resize only changes child; siblings stable
//
// A slider beneath each panel oscillates child width. On the left, the parent
// stretches and siblings reflow. On the right, the parent stays fixed; child
// changes within its own box only.

const CYCLE_MS = 4200

function ease(t: number): number {
  // Smooth in/out
  return 0.5 - 0.5 * Math.cos(Math.PI * t)
}

export default function ContainmentScene() {
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

    function drawPanel(opts: {
      x: number; y: number; w: number; h: number;
      title: string;
      contain: boolean;
      childPct: number; // 0..1 of natural child width
    }) {
      const { x, y, w, h, title, contain, childPct } = opts

      // Panel frame
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.18)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(x + 0.5, y + 0.5, w, h)

      // Title
      ctx!.fillStyle = 'rgba(165, 243, 252, 0.75)'
      ctx!.font = '500 9px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText(title, x + 10, y + 10)

      // Layout area inside panel
      const innerPadTop = 32
      const innerPadBottom = 26
      const innerPadX = 14
      const innerY = y + innerPadTop
      const innerX = x + innerPadX
      const innerW = w - innerPadX * 2
      const innerH = h - innerPadTop - innerPadBottom

      // Three boxes stacked vertically: sibling, parent (with child), sibling
      // Parent's height depends on child if no contain; fixed if contain.
      const siblingH = 18
      const baseParentH = innerH - siblingH * 2 - 16
      const childMinW = innerW * 0.25
      const childMaxW = innerW * 0.85
      const childW = childMinW + (childMaxW - childMinW) * childPct
      // child height oscillates with width (sim'd content reflow) if no contain
      const baseChildH = 28
      const childH = contain ? baseChildH : baseChildH + (childW / innerW) * 22

      let parentH: number
      if (contain) {
        parentH = baseParentH
      } else {
        // Parent stretches around child when no contain
        parentH = Math.max(baseParentH, childH + 24)
      }

      // Sibling top
      const sibTopY = innerY
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.18)'
      ctx!.fillRect(innerX, sibTopY, innerW, siblingH)
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.35)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(innerX + 0.5, sibTopY + 0.5, innerW - 1, siblingH - 1)

      // Parent box
      const parentY = sibTopY + siblingH + 8
      ctx!.fillStyle = contain
        ? 'rgba(165, 243, 252, 0.08)'
        : 'rgba(125, 211, 252, 0.08)'
      ctx!.fillRect(innerX, parentY, innerW, parentH)
      ctx!.strokeStyle = contain
        ? 'rgba(165, 243, 252, 0.55)'
        : 'rgba(125, 211, 252, 0.45)'
      ctx!.lineWidth = 1
      if (contain) ctx!.setLineDash([])
      else ctx!.setLineDash([])
      ctx!.strokeRect(innerX + 0.5, parentY + 0.5, innerW - 1, parentH - 1)
      ctx!.setLineDash([])

      // Parent label (top-left of parent)
      ctx!.fillStyle = contain
        ? 'rgba(165, 243, 252, 0.8)'
        : 'rgba(125, 211, 252, 0.7)'
      ctx!.font = '500 8.5px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText(contain ? 'contain: layout' : 'no containment', innerX + 6, parentY + 5)

      // Child box centered horizontally in parent
      const childX = innerX + (innerW - childW) / 2
      const childY = parentY + (parentH - childH) / 2 + 4
      ctx!.fillStyle = '#7DD3FC'
      ctx!.globalAlpha = 0.9
      ctx!.fillRect(childX, childY, childW, childH)
      ctx!.globalAlpha = 1
      ctx!.strokeStyle = '#A5F3FC'
      ctx!.lineWidth = 1
      ctx!.strokeRect(childX + 0.5, childY + 0.5, childW - 1, childH - 1)

      // Sibling bottom
      const sibBotY = parentY + parentH + 8
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.18)'
      ctx!.fillRect(innerX, sibBotY, innerW, siblingH)
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.35)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(innerX + 0.5, sibBotY + 0.5, innerW - 1, siblingH - 1)

      // Show "relayout" tag near siblings for the no-contain side
      if (!contain) {
        // Pulse intensity tied to child movement velocity (approx via childPct derivative-ish)
        // Use a sin pulse based on time for simplicity
        const t = performance.now() / 800
        const pulse = 0.5 + 0.5 * Math.sin(t)
        ctx!.fillStyle = `rgba(165, 243, 252, ${0.3 + 0.5 * pulse})`
        ctx!.font = '500 8px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'middle'
        ctx!.fillText('relayout', innerX + innerW - 4, sibBotY + siblingH / 2)
      } else {
        ctx!.fillStyle = 'rgba(165, 243, 252, 0.65)'
        ctx!.font = '500 8px ui-monospace, SFMono-Regular, monospace'
        ctx!.textAlign = 'right'
        ctx!.textBaseline = 'middle'
        ctx!.fillText('stable', innerX + innerW - 4, sibBotY + siblingH / 2)
      }

      // Slider track at bottom showing child width
      const sliderY = y + h - 14
      const sliderTrackX = x + 14
      const sliderTrackW = w - 28
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.25)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(sliderTrackX, sliderY)
      ctx!.lineTo(sliderTrackX + sliderTrackW, sliderY)
      ctx!.stroke()
      const knobX = sliderTrackX + sliderTrackW * childPct
      ctx!.fillStyle = '#A5F3FC'
      ctx!.beginPath()
      ctx!.arc(knobX, sliderY, 3, 0, Math.PI * 2)
      ctx!.fill()
      // slider label
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = '500 8px ui-monospace, SFMono-Regular, monospace'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('child width', sliderTrackX, sliderY - 6)
    }

    function drawFrame(progress: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padX = 20
      const padTop = 18
      const padBottom = 14
      const gutter = 14
      const panelW = (W - padX * 2 - gutter) / 2
      const panelH = H - padTop - padBottom

      // Child width oscillates as a triangle wave eased
      const triangle = progress < 0.5 ? progress * 2 : (1 - progress) * 2
      const childPct = ease(triangle)

      drawPanel({
        x: padX,
        y: padTop,
        w: panelW,
        h: panelH,
        title: 'WITHOUT CONTAINMENT',
        contain: false,
        childPct,
      })

      drawPanel({
        x: padX + panelW + gutter,
        y: padTop,
        w: panelW,
        h: panelH,
        title: 'WITH CONTAINMENT',
        contain: true,
        childPct,
      })
    }

    if (prefersReduced) {
      drawFrame(0.5)
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
