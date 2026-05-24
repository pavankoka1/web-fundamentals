'use client'
import { useEffect, useRef } from 'react'

// 8 cols × 4 rows tile grid. A raster cursor lights tiles one-by-one
// (top-left → bottom-right). After the pass, a "scroll" advances the
// viewport, and a band of tiles re-rasterizes.

const TEAL = '#7DD3FC'
const MINT = '#A5F3FC'
const CYAN = '#67E8F9'
const DIM  = 'rgba(125, 211, 252, 0.45)'

const COLS = 8
const ROWS = 4
const TILE_MS  = 90              // per tile
const PASS_MS  = COLS * ROWS * TILE_MS
const SCROLL_PAUSE_MS = 700
const SCROLL_MS = 600
const RERAST_MS  = COLS * 2 * TILE_MS
const CYCLE_MS = PASS_MS + SCROLL_PAUSE_MS + SCROLL_MS + RERAST_MS + 400

export default function TilingRasterizationScene() {
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

    function easeOut(t: number) { return 1 - Math.pow(1 - t, 2) }

    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      // Layout: grid left, scroll indicator right
      const padL = 32
      const padR = 48
      const padT = 44
      const padB = 36
      const indW = 14
      const gridW = W - padL - padR - indW - 16
      const gridH = H - padT - padB
      const tileW = gridW / COLS
      const tileH = gridH / ROWS

      const elapsed = (now - t0) % CYCLE_MS

      // Determine rasterized status per tile (0..1)
      // Plus per-tile "freshness" for fade-in glow.
      const status: number[] = new Array(COLS * ROWS).fill(0)
      const freshness: number[] = new Array(COLS * ROWS).fill(0)

      let scrollOffset = 0    // 0..1, how far the viewport has slid down
      let phaseLabel = 'rasterizing'

      if (elapsed < PASS_MS) {
        // Initial top-to-bottom, left-to-right pass.
        const idx = Math.floor(elapsed / TILE_MS)
        for (let i = 0; i < COLS * ROWS; i++) {
          if (i < idx) status[i] = 1
          else if (i === idx) status[i] = (elapsed % TILE_MS) / TILE_MS
          freshness[i] = Math.max(0, 1 - (idx - i) / 6)
        }
      } else if (elapsed < PASS_MS + SCROLL_PAUSE_MS) {
        // All tiles done, idle hold
        for (let i = 0; i < COLS * ROWS; i++) status[i] = 1
        phaseLabel = 'cached'
      } else if (elapsed < PASS_MS + SCROLL_PAUSE_MS + SCROLL_MS) {
        // Scrolling — keep all tiles "filled" but slide content
        for (let i = 0; i < COLS * ROWS; i++) status[i] = 1
        const p = (elapsed - PASS_MS - SCROLL_PAUSE_MS) / SCROLL_MS
        scrollOffset = easeOut(p)
        phaseLabel = 'scrolling →'
      } else {
        // Re-rasterize the bottom 2 rows (newly exposed)
        scrollOffset = 1
        const sub = elapsed - PASS_MS - SCROLL_PAUSE_MS - SCROLL_MS
        const idx = Math.floor(sub / TILE_MS)
        // Mark top 2 rows as already raster, bottom 2 rows as raster targets
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const i = r * COLS + c
            if (r < 2) {
              status[i] = 1
            } else {
              const localIdx = (r - 2) * COLS + c
              if (localIdx < idx) status[i] = 1
              else if (localIdx === idx) status[i] = (sub % TILE_MS) / TILE_MS
              else status[i] = 0
              freshness[i] = Math.max(0, 1 - (idx - localIdx) / 4)
            }
          }
        }
        phaseLabel = 're-rasterizing (newly visible)'
      }

      // Header
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('tiling · raster', padL, padT - 24)
      ctx!.textAlign = 'right'
      ctx!.fillStyle = phaseLabel.startsWith('re-') ? CYAN : DIM
      ctx!.fillText(phaseLabel, padL + gridW, padT - 24)

      // Grid border
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.18)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(padL, padT, gridW, gridH)

      // Tiles
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c
          const x = padL + c * tileW
          const y = padT + r * tileH
          const s = status[i]
          const f = freshness[i]

          // Background
          ctx!.fillStyle = `rgba(125, 211, 252, ${0.04 + 0.05 * s})`
          ctx!.fillRect(x + 1, y + 1, tileW - 2, tileH - 2)

          // Fill-in animation: rasterized portion sweeps left-to-right inside
          // the tile.
          if (s > 0) {
            const innerW = (tileW - 4) * Math.min(1, s)
            const hot = s < 1
            const fill = hot
              ? `rgba(165, 243, 252, ${0.45 + 0.35 * f})`
              : `rgba(125, 211, 252, ${0.18 + 0.04 * f})`
            ctx!.fillStyle = fill
            ctx!.fillRect(x + 2, y + 2, innerW, tileH - 4)

            // Cursor edge while rasterizing
            if (hot) {
              ctx!.fillStyle = `rgba(165, 243, 252, 0.95)`
              ctx!.fillRect(x + 2 + innerW - 1.5, y + 2, 1.5, tileH - 4)
            }
          }

          // Tile border
          ctx!.strokeStyle = s === 1
            ? `rgba(125, 211, 252, ${0.35 + 0.25 * f})`
            : 'rgba(125, 211, 252, 0.12)'
          ctx!.strokeRect(x + 0.5, y + 0.5, tileW - 1, tileH - 1)
        }
      }

      // Scroll indicator on the right edge — thin track + thumb
      const indX = padL + gridW + 16
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.15)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(indX, padT, indW, gridH)

      const thumbH = gridH * 0.4
      const thumbY = padT + (gridH - thumbH) * scrollOffset
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.4)'
      ctx!.fillRect(indX + 2, thumbY + 2, indW - 4, thumbH - 4)

      // Scroll label
      ctx!.fillStyle = DIM
      ctx!.font = "500 8.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'top'
      ctx!.fillText('scroll', indX + indW / 2, padT + gridH + 6)

      // Footer
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.42)'
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('tiles raster lazily — only what enters the viewport', padL, H - 14)
    }

    if (prefersReduced) {
      drawFrame(t0 + PASS_MS * 0.6)
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
