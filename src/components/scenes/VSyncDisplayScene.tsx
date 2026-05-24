'use client'
import { useEffect, useRef } from 'react'

// Heartbeat of vertical bars — one per frame slot — sweeping left to right.
// Mostly short (idle), occasional taller spikes (active frames).
// A "VSYNC →" pulse glides across at 60Hz cadence. Below the bars, a
// thin meter shows budget consumed for the current frame.

const TEAL = '#7DD3FC'
const MINT = '#A5F3FC'
const CYAN = '#67E8F9'
const SOFT = 'rgba(165, 243, 252, 0.55)'
const DIM  = 'rgba(125, 211, 252, 0.4)'

const BAR_COUNT = 60      // ~1 second of 60Hz history
const FRAME_MS  = 16.66

// Pre-baked deterministic activity pattern (0..1 amplitude).
// Most idle, a few peaks. Stable across cycles so it reads as "rhythm".
const PATTERN = (() => {
  const out: number[] = []
  for (let i = 0; i < BAR_COUNT; i++) {
    let v = 0.18 + 0.04 * Math.sin(i * 0.5)
    // Sparse peaks
    if (i % 11 === 4) v = 0.6
    if (i % 19 === 7) v = 0.78
    if (i % 31 === 12) v = 0.92
    if (i === 23 || i === 41 || i === 53) v = Math.max(v, 0.7)
    out.push(Math.min(1, v))
  }
  return out
})()

export default function VSyncDisplayScene() {
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

    const t0 = performance.now()

    function drawFrame(now: number) {
      const rect = canvas!.getBoundingClientRect()
      const W = rect.width, H = rect.height
      ctx!.clearRect(0, 0, W, H)

      const padL = 32, padR = 32, padT = 40, padB = 60
      const trackW = W - padL - padR
      const trackTop = padT
      const trackH = H - padT - padB - 28   // reserve space for budget bar
      const baselineY = trackTop + trackH

      // Determine sweep position (0..BAR_COUNT, wraps).
      const sweep = ((now - t0) / FRAME_MS) % BAR_COUNT
      const sweepX = padL + (trackW / BAR_COUNT) * sweep

      // 60Hz tick marks every 6 bars
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.08)'
      ctx!.lineWidth = 1
      for (let i = 0; i <= BAR_COUNT; i += 6) {
        const x = padL + (trackW / BAR_COUNT) * i
        ctx!.beginPath()
        ctx!.moveTo(x, trackTop)
        ctx!.lineTo(x, baselineY)
        ctx!.stroke()
      }

      // Baseline
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.2)'
      ctx!.beginPath()
      ctx!.moveTo(padL, baselineY)
      ctx!.lineTo(padL + trackW, baselineY)
      ctx!.stroke()

      // Heartbeat bars. The bar at the sweep position is "live" and grows
      // toward its pattern value; trailing bars are stable; bars ahead are
      // dimmer.
      const barW = trackW / BAR_COUNT
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = PATTERN[i]
        const x = padL + barW * i + barW * 0.18
        const w = barW * 0.64

        // Distance behind the sweep, in bars.
        const behind = (sweep - i + BAR_COUNT) % BAR_COUNT
        const ahead = behind > BAR_COUNT / 2

        let alpha = 0.6
        let color = TEAL
        if (ahead) {
          alpha = 0.18
        } else if (behind < 1) {
          alpha = 1
          color = v > 0.55 ? CYAN : MINT
        } else if (behind < 10) {
          alpha = 0.85 - behind * 0.05
          color = v > 0.55 ? MINT : TEAL
        }

        const barH = Math.max(2, v * trackH)
        const grad = ctx!.createLinearGradient(0, baselineY - barH, 0, baselineY)
        grad.addColorStop(0, color)
        grad.addColorStop(1, 'rgba(125, 211, 252, 0.05)')
        ctx!.save()
        ctx!.globalAlpha = alpha
        ctx!.fillStyle = grad
        ctx!.fillRect(x, baselineY - barH, w, barH)
        // Cap dot for spikes
        if (v > 0.55) {
          ctx!.fillStyle = color
          ctx!.beginPath()
          ctx!.arc(x + w / 2, baselineY - barH - 2, 1.4, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.restore()
      }

      // VSYNC sweep beam — narrow, glowing
      const beamGrad = ctx!.createLinearGradient(sweepX - 24, 0, sweepX + 6, 0)
      beamGrad.addColorStop(0, 'rgba(165, 243, 252, 0)')
      beamGrad.addColorStop(0.85, 'rgba(165, 243, 252, 0.45)')
      beamGrad.addColorStop(1, 'rgba(165, 243, 252, 0.75)')
      ctx!.fillStyle = beamGrad
      ctx!.fillRect(sweepX - 24, trackTop - 6, 28, trackH + 12)

      ctx!.strokeStyle = MINT
      ctx!.lineWidth = 1.3
      ctx!.beginPath()
      ctx!.moveTo(sweepX, trackTop - 8)
      ctx!.lineTo(sweepX, baselineY + 4)
      ctx!.stroke()

      // VSYNC label, riding above the beam
      ctx!.fillStyle = MINT
      ctx!.font = "600 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'bottom'
      const labelX = Math.min(sweepX + 6, padL + trackW - 70)
      ctx!.fillText('VSYNC →', labelX, trackTop - 10)

      // Header
      ctx!.fillStyle = 'rgba(125, 211, 252, 0.55)'
      ctx!.font = "500 9.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('vsync · 60Hz', 24, 16)
      ctx!.textAlign = 'right'
      ctx!.fillStyle = DIM
      ctx!.fillText('16.66 ms / frame', W - 24, 16)

      // Budget meter — represents the current frame's ms used (0..16.66)
      const meterY = baselineY + 18
      const meterH = 4
      ctx!.strokeStyle = 'rgba(125, 211, 252, 0.18)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(padL, meterY, trackW, meterH)

      // Position within frame (frac of 1)
      const frameFrac = ((now - t0) % FRAME_MS) / FRAME_MS
      const w = trackW * frameFrac
      const gradM = ctx!.createLinearGradient(padL, 0, padL + trackW, 0)
      gradM.addColorStop(0, 'rgba(125, 211, 252, 0.6)')
      gradM.addColorStop(0.7, 'rgba(165, 243, 252, 0.85)')
      gradM.addColorStop(1, 'rgba(255, 180, 180, 0.75)') // soft "danger" tail
      ctx!.fillStyle = gradM
      ctx!.fillRect(padL, meterY, w, meterH)

      // Budget caption
      ctx!.fillStyle = DIM
      ctx!.font = "500 8.5px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'top'
      ctx!.fillText('frame budget', padL, meterY + meterH + 5)
      ctx!.textAlign = 'right'
      ctx!.fillText(`${(frameFrac * 16.66).toFixed(1)} ms`, padL + trackW, meterY + meterH + 5)

      // Footer (tiny)
      ctx!.fillStyle = SOFT
      ctx!.font = "500 9px ui-monospace, SFMono-Regular, monospace"
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'bottom'
      ctx!.fillText('miss vsync → dropped frame', W - 24, H - 8)
    }

    if (prefersReduced) {
      drawFrame(t0 + 240)
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
