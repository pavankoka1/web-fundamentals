'use client'
import { useEffect, useRef } from 'react'

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  raf:    '#7DD3FC',
  style:  '#A5F3FC',
  layout: '#BAE6FD',
  paint:  '#67E8F9',
  commit: '#A5F3FC',
  jankJs: '#FF6B6B',
  budget: 'rgba(255,107,107,0.5)',
  slotBg: 'rgba(255,255,255,0.02)',
  slotBorder: 'rgba(255,255,255,0.05)',
  text:   'rgba(180,180,220,0.6)',
  dimText: 'rgba(120,120,160,0.45)',
}

// Phase definitions: [label, color, normalMs]
const PHASES: [string, string, number][] = [
  ['rAF / JS', C.raf,    4.2],
  ['Style',    C.style,  1.1],
  ['Layout',   C.layout, 1.8],
  ['Paint',    C.paint,  1.0],
  ['Commit',   C.commit, 0.5],
]

const BUDGET_MS  = 16.67
const JANK_JS_MS = 21.0          // jank frame: JS overflows
const NORMAL_TOTAL_MS = PHASES.reduce((s, p) => s + p[2], 0) // ~8.6ms

const JANK_EVERY  = 7            // every 7th frame index is jank
const SCROLL_FPS  = 1.2          // frames scroll per second

export default function FrameBudgetScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const rafRef    = useRef(0)
  const t0Ref     = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current!
    const wrap   = wrapRef.current!
    const ctx    = canvas.getContext('2d')!
    let dpr = 1

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      const { width: W, height: H } = wrap.getBoundingClientRect()
      canvas.width  = W * dpr
      canvas.height = H * dpr
      canvas.style.width  = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    function draw(now: number) {
      if (t0Ref.current < 0) t0Ref.current = now

      const { width: W, height: H } = wrap.getBoundingClientRect()
      if (!W || !H) { rafRef.current = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, W, H)

      // ── Layout constants ──────────────────────────────────────────────────
      const elapsed = (now - t0Ref.current) / 1000  // seconds

      const TITLE_H  = 36
      const LEGEND_H = 38
      const PAD_X    = 16
      const ZONE_Y   = TITLE_H
      const ZONE_H   = H - TITLE_H - LEGEND_H
      const ZONE_BOT = ZONE_Y + ZONE_H

      // Budget line sits at 65% down the frame zone
      const BUDGET_Y = ZONE_Y + ZONE_H * 0.65

      const N_VISIBLE   = 9
      const GAP         = 4
      const SLOT_W      = (W - PAD_X * 2 - GAP * (N_VISIBLE - 1)) / N_VISIBLE
      const SLOT_H      = ZONE_H
      const SLOT_TOP    = ZONE_Y

      // ── Title ─────────────────────────────────────────────────────────────
      ctx.save()
      ctx.fillStyle = C.text
      ctx.font = '500 11px "Geist Mono", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('60 Hz — one frame every 16.67ms', W / 2, TITLE_H / 2)
      ctx.restore()

      // ── Scroll offset ─────────────────────────────────────────────────────
      // scrollOffset goes from 0 to 1 over (1/SCROLL_FPS) seconds
      const scrollOffset = (elapsed * SCROLL_FPS) % 1  // 0..1 fraction of one slot

      // The "first" frame index visible on the left (integer)
      const baseFrameIdx = Math.floor(elapsed * SCROLL_FPS)

      // ── Draw frame slots ──────────────────────────────────────────────────
      // We draw N_VISIBLE + 1 slots to cover the scroll gap on the right
      for (let i = 0; i <= N_VISIBLE; i++) {
        const frameIdx = baseFrameIdx + i

        // X position of this slot, shifted left by scroll fraction
        const slotX = PAD_X + (i - scrollOffset) * (SLOT_W + GAP)

        // Clip to canvas bounds (skip fully off-screen)
        if (slotX + SLOT_W < 0 || slotX > W) continue

        // Determine slot type
        const isJank    = frameIdx % JANK_EVERY === 0 && frameIdx > 0
        const isDropped = (frameIdx - 1) % JANK_EVERY === 0 && frameIdx > 1

        // ── Slot background ───────────────────────────────────────────────
        ctx.save()
        if (isDropped) {
          ctx.fillStyle = 'rgba(255,107,107,0.06)'
        } else {
          ctx.fillStyle = C.slotBg
        }
        ctx.fillRect(slotX, SLOT_TOP, SLOT_W, SLOT_H)

        ctx.strokeStyle = isDropped ? 'rgba(255,107,107,0.15)' : C.slotBorder
        ctx.lineWidth = 1
        ctx.strokeRect(slotX + 0.5, SLOT_TOP + 0.5, SLOT_W - 1, SLOT_H - 1)
        ctx.restore()

        if (isDropped) {
          // ── Dropped frame ─────────────────────────────────────────────
          ctx.save()
          ctx.fillStyle = 'rgba(255,107,107,0.55)'
          ctx.font = '700 10px "Geist Mono", monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('DROPPED', slotX + SLOT_W / 2, SLOT_TOP + SLOT_H / 2)
          ctx.restore()
        } else {
          // ── Phase bars stack UP from budget line ──────────────────────
          const totalMs   = isJank ? (JANK_JS_MS + NORMAL_TOTAL_MS - PHASES[0][2]) : NORMAL_TOTAL_MS
          // pxPerMs: map ms to pixels, using the zone below budget as reference
          // normal: NORMAL_TOTAL_MS should fit in ~60% of slot height
          const availPx   = ZONE_H * 0.58   // comfortable height for normal frame
          const pxPerMs   = availPx / NORMAL_TOTAL_MS

          let curY = BUDGET_Y  // start at budget line, grow upward (subtract)

          for (let pi = PHASES.length - 1; pi >= 0; pi--) {
            const [label, color, ms] = PHASES[pi]
            const barMs   = isJank && pi === 0 ? JANK_JS_MS : ms
            const barH    = barMs * pxPerMs
            const barY    = curY - barH
            const barColor = isJank && pi === 0 ? C.jankJs : color

            // Shadow/glow for jank overflow bar
            if (isJank && pi === 0) {
              ctx.save()
              ctx.shadowColor = C.jankJs
              ctx.shadowBlur  = 14
            } else {
              ctx.save()
            }

            ctx.fillStyle = barColor
            ctx.globalAlpha = 0.85
            ctx.fillRect(slotX + 2, barY, SLOT_W - 4, barH)
            ctx.restore()

            // Small phase label inside bar (if bar tall enough)
            if (barH > 13) {
              ctx.save()
              ctx.fillStyle = 'rgba(255,255,255,0.75)'
              ctx.font = `500 ${Math.min(9, barH * 0.45)}px "Geist Mono", monospace`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(label, slotX + SLOT_W / 2, barY + barH / 2)
              ctx.restore()
            }

            curY = barY
          }

          // ── LONG TASK label above jank bar ────────────────────────────
          if (isJank) {
            const topBarY = curY  // top of the rAF/JS bar (overflow zone)
            ctx.save()
            ctx.fillStyle = C.jankJs
            ctx.font      = '700 8.5px "Geist Mono", monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.shadowColor = C.jankJs
            ctx.shadowBlur  = 6
            ctx.fillText('LONG TASK', slotX + SLOT_W / 2, topBarY - 3)
            ctx.restore()
          }

          // ── Frame index label at bottom of slot ───────────────────────
          ctx.save()
          ctx.fillStyle = C.dimText
          ctx.font      = '400 8px "Geist Mono", monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(`#${frameIdx}`, slotX + SLOT_W / 2, ZONE_BOT - 3)
          ctx.restore()
        }
      }

      // ── Budget line (drawn on top of slots) ───────────────────────────────
      ctx.save()
      ctx.strokeStyle = C.budget
      ctx.lineWidth   = 1.5
      ctx.setLineDash([8, 5])
      ctx.beginPath()
      ctx.moveTo(PAD_X, BUDGET_Y)
      ctx.lineTo(W - PAD_X, BUDGET_Y)
      ctx.stroke()
      ctx.setLineDash([])

      // Budget label on the right
      ctx.fillStyle = 'rgba(255,107,107,0.7)'
      ctx.font      = '500 9.5px "Geist Mono", monospace'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('16.67ms budget', W - PAD_X - 4, BUDGET_Y - 3)
      ctx.restore()

      // ── Legend ────────────────────────────────────────────────────────────
      const legendY    = H - LEGEND_H + 10
      const BOX        = 9
      const ITEM_GAP   = 6
      const items      = [...PHASES, ['JANK', C.jankJs, 0]] as [string, string, number][]

      // Calculate total legend width to center it
      const itemWidths = items.map(([label]) => {
        ctx.font = '400 9px "Geist Mono", monospace'
        return BOX + 4 + ctx.measureText(label).width + ITEM_GAP * 2
      })
      const totalLegendW = itemWidths.reduce((a, b) => a + b, 0)
      let lx = (W - totalLegendW) / 2

      for (let i = 0; i < items.length; i++) {
        const [label, color] = items[i]
        ctx.save()
        ctx.fillStyle = color as string
        ctx.globalAlpha = 0.8
        ctx.fillRect(lx, legendY + 1, BOX, BOX)
        ctx.globalAlpha = 1
        ctx.fillStyle = C.text
        ctx.font = '400 9px "Geist Mono", monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(label as string, lx + BOX + 4, legendY)
        ctx.restore()
        lx += itemWidths[i]
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className="w-full h-full" style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
