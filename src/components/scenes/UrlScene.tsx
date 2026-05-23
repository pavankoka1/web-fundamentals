'use client'
import { useEffect, useRef } from 'react'

const SEGMENTS = [
  { text: 'https',              label: 'SCHEME',   sub: 'secure & encrypted', color: '#7DD3FC' },
  { text: '://api.github.com', label: 'HOST',     sub: 'the destination server', color: '#A5F3FC' },
  { text: '/users/torvalds',   label: 'PATH',     sub: 'the resource location', color: '#BAE6FD' },
  { text: '?tab=repos',        label: 'QUERY',    sub: 'filter parameters', color: '#67E8F9' },
  { text: '#about',            label: 'FRAGMENT', sub: 'page anchor / section', color: '#94A3B8' },
]

const URL_STRING = 'https://api.github.com/users/torvalds?tab=repos#about'
const CYCLE = 7200 // ms per loop

function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)) }

export default function UrlScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const rafRef    = useRef(0)
  const t0        = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const wrap   = wrapRef.current!
    const ctx    = canvas.getContext('2d')!
    t0.current   = performance.now()

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
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

    function rrPath(x: number, y: number, w: number, h: number, r: number) {
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

    function frame(now: number) {
      const { width: W, height: H } = wrap.getBoundingClientRect()
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#07070E'
      ctx.fillRect(0, 0, W, H)

      // Subtle ambient radial glow
      const glow = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, W * 0.55)
      glow.addColorStop(0, 'rgba(125,211,252,0.05)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      const elapsed = (now - t0.current) % CYCLE
      const tN = elapsed / CYCLE

      // Responsive font — slightly larger on wide screens
      const fontSize = Math.max(11, Math.min(15, W / 44))
      const monoFont = `500 ${fontSize}px 'Geist Mono', 'Fira Mono', monospace`
      ctx.font = monoFont
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'

      // Pre-measure segments (font must be set before this)
      const segWidths = SEGMENTS.map(s => ctx.measureText(s.text).width)
      const totalW    = segWidths.reduce((a, b) => a + b, 0)

      // Assembled URL x positions
      const urlY  = H * 0.40
      const startX = W / 2 - totalW / 2
      const segX: number[] = []
      let runX = startX
      for (let i = 0; i < SEGMENTS.length; i++) {
        segX.push(runX)
        runX += segWidths[i]
      }

      // Spread (chip) positions — single row, evenly distributed with padding
      const chipPad  = 7
      const chipH    = fontSize * 2.4
      const spreadY  = H * 0.34
      const sidePad  = Math.max(12, W * 0.03)
      const innerW   = W - sidePad * 2
      const chipTotalW = segWidths.reduce((a, b) => a + b + chipPad * 2, 0)
      const gap = Math.max(8, (innerW - chipTotalW) / (SEGMENTS.length - 1))
      const spreadX: number[] = []
      let sx = sidePad + chipPad
      for (let i = 0; i < SEGMENTS.length; i++) {
        spreadX.push(sx)
        sx += segWidths[i] + chipPad * 2 + gap
      }

      // ── helpers ────────────────────────────────────────────────────────────

      function drawSegText(x: number, y: number, text: string, color: string, alpha: number, glowAmt: number) {
        if (alpha < 0.01) return
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.font = monoFont
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        if (glowAmt > 0.1) { ctx.shadowColor = color; ctx.shadowBlur = 8 * glowAmt }
        ctx.fillText(text, x, y)
        ctx.restore()
      }

      function drawChip(x: number, y: number, w: number, color: string, alpha: number, glowAmt: number) {
        if (alpha < 0.01) return
        ctx.save()
        ctx.globalAlpha = alpha
        if (glowAmt > 0.1) { ctx.shadowColor = color; ctx.shadowBlur = 14 * glowAmt }
        ctx.fillStyle = color + '1A'
        rrPath(x - chipPad, y - chipH / 2, w + chipPad * 2, chipH, 6)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = color
        ctx.lineWidth = 0.9
        ctx.globalAlpha = alpha * 0.5
        rrPath(x - chipPad, y - chipH / 2, w + chipPad * 2, chipH, 6)
        ctx.stroke()
        ctx.restore()
      }

      function drawLabel(x: number, y: number, w: number, label: string, sub: string, color: string, alpha: number) {
        if (alpha < 0.01 || !label) return
        ctx.save()
        const cx = x + w / 2
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.font = `700 8px monospace`
        ctx.fillText(label, cx, y + chipH / 2 + 5)
        ctx.fillStyle = '#3E3E60'
        ctx.globalAlpha = alpha * 0.85
        ctx.font = `400 7.5px monospace`
        ctx.fillText(sub, cx, y + chipH / 2 + 16)
        ctx.restore()
      }

      // ── PHASE 0 · Typewriter  (0.00 → 0.16) ──────────────────────────────

      if (tN < 0.16) {
        const charsToShow = Math.round((tN / 0.16) * URL_STRING.length)

        let charCount = 0
        for (let i = 0; i < SEGMENTS.length; i++) {
          const segLen = SEGMENTS[i].text.length
          const chars  = Math.max(0, Math.min(segLen, charsToShow - charCount))
          if (chars > 0) {
            ctx.save()
            ctx.fillStyle = '#7878A0'
            ctx.globalAlpha = 0.75
            ctx.font = monoFont
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'left'
            ctx.fillText(SEGMENTS[i].text.slice(0, chars), segX[i], urlY)
            ctx.restore()
          }
          charCount += segLen
        }

        // Blinking cursor
        const typedWidth = ctx.measureText(URL_STRING.slice(0, charsToShow)).width
        if (Math.floor(now / 460) % 2 === 0 && charsToShow < URL_STRING.length) {
          ctx.fillStyle = '#7DD3FC'
          ctx.globalAlpha = 0.85
          ctx.fillRect(startX + typedWidth + 1, urlY - fontSize * 0.6, 1.5, fontSize * 1.2)
          ctx.globalAlpha = 1
        }
      }

      // ── PHASE 1 · Color scan  (0.16 → 0.33) ─────────────────────────────

      else if (tN < 0.33) {
        const scanProg = (tN - 0.16) / 0.17
        const scanX    = startX - 8 + (totalW + 16) * scanProg

        for (let i = 0; i < SEGMENTS.length; i++) {
          const seg      = SEGMENTS[i]
          const segStart = segX[i]
          const scanned  = Math.max(0, Math.min(1, (scanX - segStart) / segWidths[i]))

          // Unscanned portion — dim
          ctx.save()
          ctx.fillStyle = '#7878A0'
          ctx.globalAlpha = 0.5
          ctx.font = monoFont
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'left'
          ctx.fillText(seg.text, segX[i], urlY)
          ctx.restore()

          // Scanned portion — colored with clip
          if (scanned > 0) {
            ctx.save()
            ctx.beginPath()
            ctx.rect(segStart, 0, segWidths[i] * scanned + 2, H)
            ctx.clip()
            ctx.fillStyle = seg.color
            ctx.globalAlpha = 1
            ctx.shadowColor = seg.color
            ctx.shadowBlur = 7
            ctx.font = monoFont
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'left'
            ctx.fillText(seg.text, segX[i], urlY)
            ctx.restore()
          }
        }

        // Scan beam
        ctx.save()
        const beam = ctx.createLinearGradient(scanX - 26, 0, scanX + 10, 0)
        beam.addColorStop(0, 'transparent')
        beam.addColorStop(0.55, 'rgba(125,211,252,0.10)')
        beam.addColorStop(1, 'rgba(125,211,252,0.55)')
        ctx.fillStyle = beam
        ctx.fillRect(scanX - 26, urlY - fontSize * 1.5, 36, fontSize * 3)
        ctx.restore()
      }

      // ── PHASE 2 · Explode to chips  (0.33 → 0.56) ───────────────────────

      else if (tN < 0.56) {
        const explodeProg = (tN - 0.33) / 0.23

        for (let i = 0; i < SEGMENTS.length; i++) {
          const seg     = SEGMENTS[i]
          const stagger = i * 0.055
          const segFrac = ease(Math.max(0, Math.min(1, (explodeProg - stagger) / (1 - stagger * (SEGMENTS.length - 1) / SEGMENTS.length))))

          const px = lerp(segX[i], spreadX[i], segFrac)
          const py = lerp(urlY, spreadY, segFrac)

          // Chip fades in as segment moves
          drawChip(px, py, segWidths[i], seg.color, segFrac * 0.9, segFrac * 0.75)
          drawSegText(px, py, seg.text, seg.color, 0.5 + segFrac * 0.5, segFrac * 0.55)

          // Label appears in the last half of the move
          if (segFrac > 0.55) {
            drawLabel(px, py, segWidths[i], seg.label, seg.sub, seg.color, (segFrac - 0.55) / 0.45)
          }
        }
      }

      // ── PHASE 3 · Hold + gentle float  (0.56 → 0.76) ────────────────────

      else if (tN < 0.76) {
        for (let i = 0; i < SEGMENTS.length; i++) {
          const seg    = SEGMENTS[i]
          const float  = Math.sin(now / 2100 + i * 1.25) * 4
          const px     = spreadX[i]
          const py     = spreadY + float

          drawChip(px, py, segWidths[i], seg.color, 0.88, 0.65)
          drawSegText(px, py, seg.text, seg.color, 1, 0.5)
          drawLabel(px, py, segWidths[i], seg.label, seg.sub, seg.color, 0.92)
        }
      }

      // ── PHASE 4 · Reassemble  (0.76 → 0.92) ─────────────────────────────

      else if (tN < 0.92) {
        const reassProg = (tN - 0.76) / 0.16

        for (let i = 0; i < SEGMENTS.length; i++) {
          const seg     = SEGMENTS[i]
          const stagger = i * 0.04
          const segFrac = ease(Math.max(0, Math.min(1, (reassProg - stagger) / (1 - stagger * (SEGMENTS.length - 1) / SEGMENTS.length))))

          const px = lerp(spreadX[i], segX[i], segFrac)
          const py = lerp(spreadY, urlY, segFrac)

          const chipA  = Math.max(0, 1 - segFrac * 1.6)
          const labelA = Math.max(0, 1 - segFrac * 2.2)

          if (chipA > 0.01) drawChip(px, py, segWidths[i], seg.color, chipA * 0.85, chipA * 0.55)
          drawSegText(px, py, seg.text, seg.color, 0.7 + segFrac * 0.3, (1 - segFrac) * 0.4)
          if (labelA > 0.01) drawLabel(px, py, segWidths[i], seg.label, seg.sub, seg.color, labelA)
        }
      }

      // ── PHASE 5 · Hold as complete URL  (0.92 → 1.0) ────────────────────

      else {
        const holdFade = Math.min(1, (1 - tN) / 0.07)
        for (let i = 0; i < SEGMENTS.length; i++) {
          drawSegText(segX[i], urlY, SEGMENTS[i].text, SEGMENTS[i].color, holdFade, 0.25)
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <div ref={wrapRef} className="w-full h-full" style={{ background: '#07070E' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
