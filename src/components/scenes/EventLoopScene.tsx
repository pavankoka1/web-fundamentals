'use client'
import { useEffect, useRef } from 'react'

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#08080F',
  surface: '#0E0E1C',
  border:  '#1C1C34',
  brightBorder: '#2A2A48',
  macro:   '#FF6B6B',
  micro:   '#67E8F9',
  render:  '#A5F3FC',
  stack:   '#BAE6FD',
  network: '#7DD3FC',
  text:    '#C4C4E8',
  dimText: '#44446A',
  bright:  '#E8E8FF',
}

const CYCLE = 9200 // ms per loop

// ── Helpers ───────────────────────────────────────────────────────────────────
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)) }
function clamp(x: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, x)) }

// ── Phase splitter (0..1 → phase 0-6 + local progress 0..1) ──────────────────
// Phase 0  0.00–0.20  Macrotask executing on call stack
// Phase 1  0.20–0.35  Creates Promise.then() → microtask queue
// Phase 2  0.35–0.48  Macrotask finishes, call stack empties
// Phase 3  0.48–0.68  ALL microtasks drain
// Phase 4  0.68–0.75  Render frame
// Phase 5  0.75–0.90  Next macrotask from queue
// Phase 6  0.90–1.00  Idle
const BREAKS = [0, 0.20, 0.35, 0.48, 0.68, 0.75, 0.90, 1.0]
function getPhase(t: number): [number, number] {
  for (let i = 0; i < BREAKS.length - 1; i++) {
    if (t < BREAKS[i + 1]) {
      const k = (t - BREAKS[i]) / (BREAKS[i + 1] - BREAKS[i])
      return [i, clamp(k)]
    }
  }
  return [6, 1]
}

// ── Draw a task card ───────────────────────────────────────────────────────────
function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  label: string, sub: string, color: string,
  alpha: number, glow: number, active: boolean,
) {
  if (alpha < 0.01) return
  ctx.save()
  ctx.globalAlpha = alpha

  if (glow > 0.05) { ctx.shadowColor = color; ctx.shadowBlur = 14 * glow }

  // Body
  ctx.fillStyle = active ? `${color}28` : `${color}12`
  rr(ctx, x, y, w, h, 5); ctx.fill()

  // Border
  ctx.strokeStyle = color
  ctx.lineWidth = active ? 1.4 : 0.7
  ctx.globalAlpha = alpha * (active ? 0.9 : 0.4)
  rr(ctx, x, y, w, h, 5); ctx.stroke()

  // Left accent bar
  ctx.shadowBlur = 0
  ctx.globalAlpha = alpha * (active ? 1 : 0.55)
  ctx.fillStyle = color
  rr(ctx, x, y + 4, 3.5, h - 8, 1.5); ctx.fill()

  // Label
  ctx.shadowBlur = 0
  ctx.globalAlpha = alpha
  ctx.fillStyle = active ? C.bright : C.text
  ctx.font = `${active ? 600 : 500} 11.5px 'Geist Mono', monospace`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(label, x + 10, y + (sub ? 7 : (h - 14) / 2))

  if (sub) {
    ctx.font = '400 9.5px monospace'
    ctx.fillStyle = active ? color : C.dimText
    ctx.globalAlpha = alpha * (active ? 0.9 : 0.7)
    ctx.fillText(sub, x + 10, y + h - 14)
  }

  ctx.restore()
}

// ── Draw a zone panel ──────────────────────────────────────────────────────────
function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  title: string, color: string, active: boolean,
) {
  ctx.save()

  if (active) { ctx.shadowColor = color; ctx.shadowBlur = 10 }
  ctx.fillStyle = C.surface
  rr(ctx, x, y, w, h, 8); ctx.fill()
  ctx.shadowBlur = 0

  ctx.strokeStyle = active ? color : C.border
  ctx.lineWidth = active ? 1.2 : 0.8
  ctx.globalAlpha = active ? 0.7 : 1
  rr(ctx, x, y, w, h, 8); ctx.stroke()

  // Top accent strip
  ctx.globalAlpha = active ? 0.7 : 0.35
  ctx.fillStyle = color
  rr(ctx, x + 1, y + 1, w - 2, 3, 1); ctx.fill()

  // Title
  ctx.globalAlpha = 1
  ctx.fillStyle = active ? color : C.dimText
  ctx.font = `600 9px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, x + w / 2, y + 14)
  ctx.restore()
}

// ── Arrow ─────────────────────────────────────────────────────────────────────
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, alpha: number,
) {
  if (alpha < 0.02) return
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4])
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 9 * Math.cos(angle - 0.45), y2 - 9 * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - 9 * Math.cos(angle + 0.45), y2 - 9 * Math.sin(angle + 0.45))
  ctx.closePath(); ctx.fill()
  ctx.restore()
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EventLoopScene() {
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
      canvas.width  = W * dpr; canvas.height = H * dpr
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    function frame(now: number) {
      const { width: W, height: H } = wrap.getBoundingClientRect()

      // ── Background ────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)

      const elapsed = (now - t0.current) % CYCLE
      const tN = elapsed / CYCLE
      const [phase, pk] = getPhase(tN)

      // ── Layout constants (responsive) ─────────────────────────────────────
      const PAD  = Math.max(10, W * 0.025)
      const TY   = 28                    // top of panels
      const BOT  = H - 36               // bottom of panels
      const PH   = BOT - TY             // panel height

      // Three columns: [Call Stack] [Event Loop] [Queues]
      const totalW  = W - PAD * 2
      const stackW  = totalW * 0.30
      const loopW   = totalW * 0.18
      const queuesW = totalW - stackW - loopW - PAD * 2

      const stackX  = PAD
      const loopX   = stackX + stackW + PAD
      const queuesX = loopX + loopW + PAD

      const microH  = PH * 0.44
      const macroH  = PH - microH - 6
      const microY  = TY
      const macroY  = TY + microH + 6

      // Task card dimensions
      const CW = stackW - 18           // card width in stack
      const CH = Math.min(36, PH * 0.13) // card height

      // Stack slots (grow upward from bottom)
      function stackSlotY(n: number) { return BOT - (n + 1) * (CH + 4) - 2 }

      // Queue card width inside the queues panel
      const QW = queuesW - 16

      // Micro queue slots
      function micSlotY(n: number) { return microY + 26 + n * (CH + 4) }

      // Macro queue slots
      function macSlotY(n: number) { return macroY + 26 + n * (CH + 4) }

      // ── Panel active states ───────────────────────────────────────────────
      const stackActive  = phase === 0 || phase === 3 || phase === 5
      const microActive  = phase === 1 || phase === 3
      const macroActive  = phase === 5
      const renderActive = phase === 4

      // ── Draw panels ───────────────────────────────────────────────────────
      drawPanel(ctx, stackX, TY, stackW, PH, 'CALL STACK', C.stack, stackActive)
      drawPanel(ctx, queuesX, microY, queuesW, microH, '⚡ MICROTASK QUEUE   (Promises)', C.micro, microActive)
      drawPanel(ctx, queuesX, macroY, queuesW, macroH, 'MACROTASK QUEUE   (setTimeout / events)', C.macro, macroActive)

      // ── Event Loop spinner ────────────────────────────────────────────────
      const lCX = loopX + loopW / 2
      const lCY = TY + PH / 2
      const lR  = Math.min(loopW, PH) * 0.35

      const spin = (now / 1400) * Math.PI * 2
      const pulse = 0.88 + Math.sin(now / 700) * 0.12

      // Outer ring
      ctx.save()
      ctx.beginPath(); ctx.arc(lCX, lCY, lR * pulse, 0, Math.PI * 2)
      ctx.strokeStyle = C.network; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.25; ctx.stroke()
      // Inner ring
      ctx.beginPath(); ctx.arc(lCX, lCY, lR * 0.58 * pulse, 0, Math.PI * 2)
      ctx.strokeStyle = C.network; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.12; ctx.stroke()
      // Spinning dot
      ctx.globalAlpha = 0.9; ctx.shadowColor = C.network; ctx.shadowBlur = 8
      ctx.fillStyle = C.network
      ctx.beginPath()
      ctx.arc(lCX + Math.cos(spin) * lR * pulse, lCY + Math.sin(spin) * lR * pulse, 3.5, 0, Math.PI * 2)
      ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1
      // Label
      ctx.fillStyle = C.network; ctx.globalAlpha = 0.6
      ctx.font = `700 ${Math.max(8, lR * 0.35)}px monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('EVENT', lCX, lCY - lR * 0.22)
      ctx.fillText('LOOP',  lCX, lCY + lR * 0.22)
      ctx.restore()

      // ── ────────── ANIMATED CONTENT ──────────────────────────────────────

      // ── PHASE 0: Macrotask executing ──────────────────────────────────────
      // Call stack shows: onClick() + console.log() inside it
      const p0stackAlpha = phase < 3 ? 1 : phase === 3 && pk < 0.15 ? 1 - pk / 0.15 : 0
      const p0inner      = phase === 0 && pk > 0.2 ? Math.min(1, (pk - 0.2) / 0.3) : phase > 0 && phase < 3 ? 1 : 0

      drawCard(ctx, stackX + 9, stackSlotY(0), CW, CH,
        'onClick()', 'macrotask executing', C.macro, p0stackAlpha, phase === 0 ? 0.7 : 0.2, phase === 0)
      drawCard(ctx, stackX + 9, stackSlotY(1), CW, CH,
        'console.log()', 'synchronous call', C.stack, p0inner * p0stackAlpha, 0.1, false)

      // Macro queue — static waiting tasks
      const mq0alpha = phase < 5 ? 1 : phase === 5 ? Math.max(0, 1 - pk / 0.35) : 0
      const mq1alpha = phase < 5 ? 0.55 : phase === 5 ? 0.55 : 0.55
      drawCard(ctx, queuesX + 8, macSlotY(0), QW, CH,
        'setTimeout(fn, 0)', 'waiting to run', C.macro, mq0alpha, 0.05, false)
      drawCard(ctx, queuesX + 8, macSlotY(1), QW, CH,
        'click event', 'UI event callback', C.macro, 0.45, 0, false)
      drawCard(ctx, queuesX + 8, macSlotY(2), QW, CH,
        'fetch() callback', 'I/O complete', C.macro, 0.28, 0, false)

      // ── PHASE 1: Promise.then → microtask queue ───────────────────────────
      // Three microtasks animate in
      const mic0a = phase >= 1 ? (phase === 1 ? ease(clamp(pk / 0.45)) : 1) : 0
      const mic1a = phase >= 1 ? (phase === 1 ? ease(clamp((pk - 0.3) / 0.4)) : 1) : 0
      const mic2a = phase >= 1 ? (phase === 1 ? ease(clamp((pk - 0.55) / 0.35)) : 1) : 0

      // Arrow: call stack → micro queue during phase 1
      drawArrow(ctx,
        stackX + stackW / 2, stackSlotY(0),
        queuesX + QW / 2, micSlotY(0) + CH / 2,
        C.micro, phase === 1 ? Math.sin(pk * Math.PI) * 0.7 : 0,
      )

      // Microtask 0
      {
        let mx = queuesX + 8, my = micSlotY(0), ma = mic0a, mg = 0.1, mact = false, mw = QW
        if (phase === 3) {
          if (pk < 0.20) {
            const f = ease(pk / 0.20)
            mx = lerp(queuesX + 8, stackX + 9, f); my = lerp(micSlotY(0), stackSlotY(0), f)
            mw = lerp(QW, CW, f); mg = f * 0.8
          }
          else if (pk < 0.38) { mx = stackX + 9; my = stackSlotY(0); mact = true; mg = 0.9; mw = CW }
          else                { ma = Math.max(0, 1 - (pk - 0.38) * 8); mx = stackX + 9; my = stackSlotY(0); mw = CW }
        }
        drawCard(ctx, mx, my, mw, CH, 'Promise.then()', 'microtask', C.micro, ma, mg, mact)
      }

      // Microtask 1 — drains after mic0
      {
        let mx = queuesX + 8, my = micSlotY(phase >= 3 && pk > 0.15 ? 0 : 1), ma = mic1a, mg = 0.1, mact = false, mw = QW
        if (phase === 3) {
          if (pk < 0.35)      { my = micSlotY(1) }
          else if (pk < 0.50) {
            const f = ease((pk - 0.35) / 0.15)
            mx = lerp(queuesX + 8, stackX + 9, f); my = lerp(micSlotY(0), stackSlotY(0), f)
            mw = lerp(QW, CW, f); mg = f * 0.8
          }
          else if (pk < 0.65) { mx = stackX + 9; my = stackSlotY(0); mact = true; mg = 0.9; mw = CW }
          else                { ma = Math.max(0, 1 - (pk - 0.65) * 7); mx = stackX + 9; my = stackSlotY(0); mw = CW }
        }
        if (phase < 4) drawCard(ctx, mx, my, mw, CH, '.then(updateUI)', 'microtask', C.micro, ma, mg, mact)
      }

      // Microtask 2 — drains last
      {
        let mx = queuesX + 8, my = micSlotY(2), ma = mic2a, mg = 0.1, mact = false, mw = QW
        if (phase === 3) {
          if (pk < 0.55)      { my = micSlotY(phase >= 3 && pk > 0.35 ? 1 : 2) }
          else if (pk < 0.68) {
            const f = ease((pk - 0.55) / 0.13)
            mx = lerp(queuesX + 8, stackX + 9, f); my = lerp(micSlotY(0), stackSlotY(0), f)
            mw = lerp(QW, CW, f); mg = f * 0.8
          }
          else if (pk < 0.82) { mx = stackX + 9; my = stackSlotY(0); mact = true; mg = 0.9; mw = CW }
          else                { ma = Math.max(0, 1 - (pk - 0.82) * 6); mx = stackX + 9; my = stackSlotY(0); mw = CW }
        }
        if (phase < 4) drawCard(ctx, mx, my, mw, CH, 'queueMicrotask()', 'microtask', C.micro, ma, mg, mact)
      }

      // ── PHASE 3 label: "Drain ALL micro tasks first!" ────────────────────
      if (phase === 3) {
        const la = Math.min(1, pk * 5) * Math.min(1, (1 - pk) * 8)
        ctx.save()
        ctx.globalAlpha = la
        ctx.fillStyle = C.micro; ctx.shadowColor = C.micro; ctx.shadowBlur = 12
        ctx.font = `700 ${Math.max(10, CH * 0.38)}px monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('ALL microtasks run BEFORE', lCX, lCY - lR * 0.55)
        ctx.fillText('next macrotask or render!', lCX, lCY + lR * 0.55)
        ctx.restore()
      }

      // ── PHASE 4: Render frame flash ───────────────────────────────────────
      if (phase === 4) {
        const ra = Math.sin(pk * Math.PI)
        ctx.save()
        ctx.globalAlpha = ra * 0.18
        ctx.shadowColor = C.render; ctx.shadowBlur = 24
        rr(ctx, stackX + 2, TY + 2, stackW - 4, PH - 4, 7)
        ctx.fillStyle = C.render; ctx.fill()
        ctx.shadowBlur = 0; ctx.globalAlpha = ra
        ctx.fillStyle = C.render
        ctx.font = `700 ${Math.max(12, CH * 0.45)}px monospace`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('🎨 Render Frame', stackX + stackW / 2, TY + PH / 2)
        ctx.restore()
      }

      // ── PHASE 5: Next macrotask enters call stack ─────────────────────────
      if (phase === 5) {
        const moveFrac = clamp(pk / 0.35)
        const f   = ease(moveFrac)
        const tx  = lerp(queuesX + 8, stackX + 9, f)
        const ty  = lerp(macSlotY(0), stackSlotY(0), f)
        const tw  = lerp(QW, CW, f)
        const act = pk > 0.42 && pk < 0.88
        const ta  = pk > 0.88 ? Math.max(0, 1 - (pk - 0.88) * 8) : 1
        drawCard(ctx, tx, ty, tw, CH, 'setTimeout(fn, 0)', 'macrotask', C.macro, ta, act ? 0.85 : 0.3, act)
      }

      // ── Status bar ────────────────────────────────────────────────────────
      const SY = BOT + 20
      type StatusEntry = [string, string]
      const statuses: StatusEntry[] = [
        [`● Macrotask running — call stack is busy`, C.macro],
        [`→ Promise.then() added to microtask queue`, C.micro],
        [`✓ Macrotask done — call stack empty`, C.stack],
        [`⚡ Draining ALL microtasks before next macrotask or render`, C.micro],
        [`🎨 Browser renders the frame`, C.render],
        [`● Next macrotask picked from queue`, C.macro],
        [`◌ Idle — waiting for next event`, C.dimText],
      ]
      const [stText, stColor] = statuses[phase]
      const stAlpha = phase === 6 ? clamp(1 - pk * 3) : 1

      ctx.save()
      ctx.globalAlpha = stAlpha
      ctx.fillStyle = stColor as string
      ctx.font = '500 10.5px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(stText as string, W / 2, SY)
      ctx.restore()

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <div ref={wrapRef} className="w-full h-full" style={{ background: C.bg }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
