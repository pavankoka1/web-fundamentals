'use client'

import { useEffect, useRef } from 'react'

const CYCLE = 6500

function ease(t: number) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t }
function lerp(a: number, b: number, t: number) { return a+(b-a)*Math.max(0,Math.min(1,t)) }
function clamp(x: number, lo=0, hi=1) { return Math.max(lo,Math.min(hi,x)) }

const MESSAGES = [
  { label:'SYN',     sub:'"I want to connect"',  color:'#00D4FF', dir:'right', t0:0.00, t1:0.20 },
  { label:'SYN-ACK', sub:'"OK, I\'m ready"',      color:'#4D9FFF', dir:'left',  t0:0.24, t1:0.44 },
  { label:'ACK',     sub:'"Great, let\'s go!"',   color:'#00E5A0', dir:'right', t0:0.48, t1:0.68 },
]

export default function TcpScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let rafId: number
    const startTime = performance.now()

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
    })
    observer.observe(canvas)

    function draw() {
      const dpr = window.devicePixelRatio || 1
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      const now = performance.now()
      const tN = ((now - startTime) % CYCLE) / CYCLE

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#07070E'
      ctx.fillRect(0, 0, W, H)

      // Radial glow
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.6)
      grad.addColorStop(0, 'rgba(0,212,255,0.04)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Layout
      const LX = Math.max(W*0.20, 90)
      const RX = Math.min(W*0.80, W-90)
      const BOX_H = Math.max(42, Math.min(54, H*0.15))
      const BOX_W = Math.min(120, (RX-LX)*0.30)
      const BOX_TOP = 22

      // Determine which boxes are "sending"
      const leftSending = MESSAGES.some(m => m.dir==='right' && tN >= m.t0 && tN < m.t1)
      const rightSending = MESSAGES.some(m => m.dir==='left' && tN >= m.t0 && tN < m.t1)

      function drawBox(cx: number, label: string, sub: string, color: string, sending: boolean) {
        const x = cx - BOX_W/2
        const y = BOX_TOP
        ctx.save()
        if (sending) {
          ctx.shadowColor = color
          ctx.shadowBlur = 12
        }
        ctx.fillStyle = color+'14'
        ctx.strokeStyle = sending ? color : color+'55'
        ctx.lineWidth = sending ? 2 : 1
        ctx.beginPath()
        ctx.roundRect(x, y, BOX_W, BOX_H, 6)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Accent strip
        ctx.save()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, y, BOX_W, 3, [3,3,0,0])
        ctx.fill()
        ctx.restore()

        // Label
        ctx.save()
        ctx.fillStyle = '#E8E8F0'
        ctx.font = '700 13px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, cx, y + BOX_H*0.42)
        ctx.restore()

        // Sublabel
        ctx.save()
        ctx.fillStyle = '#44446A'
        ctx.font = '9.5px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sub, cx, y + BOX_H*0.72)
        ctx.restore()
      }

      drawBox(LX, 'CLIENT', 'your device', '#00D4FF', leftSending)
      drawBox(RX, 'SERVER', 'github.com',  '#4D9FFF', rightSending)

      // Lifelines
      const lifeTop = BOX_TOP + BOX_H + 4
      const lifeBot = H - 44
      ctx.save()
      ctx.setLineDash([4,4])
      ctx.strokeStyle = '#44446A'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(LX, lifeTop)
      ctx.lineTo(LX, lifeBot)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(RX, lifeTop)
      ctx.lineTo(RX, lifeBot)
      ctx.stroke()
      ctx.restore()

      // Message Y positions
      const lifeH = lifeBot - lifeTop
      const msgYs = MESSAGES.map((_, i) => lifeTop + lifeH * (i+1) / (MESSAGES.length+1))

      // Draw messages
      MESSAGES.forEach((msg, i) => {
        const y = msgYs[i]
        const fromX = msg.dir === 'right' ? LX : RX
        const toX   = msg.dir === 'right' ? RX : LX
        const localRaw = clamp((tN - msg.t0) / (msg.t1 - msg.t0))
        const inFlight = tN >= msg.t0 && tN < msg.t1
        const done = tN >= msg.t1

        // Ghost dashed line
        ctx.save()
        ctx.setLineDash([5,4])
        ctx.strokeStyle = msg.color+'28'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(fromX, y)
        ctx.lineTo(toX, y)
        ctx.stroke()
        ctx.restore()

        if (inFlight) {
          const dotX = lerp(fromX, toX, ease(localRaw))
          ctx.save()
          ctx.shadowColor = msg.color
          ctx.shadowBlur = 8
          ctx.strokeStyle = msg.color
          ctx.lineWidth = 2
          ctx.setLineDash([])
          ctx.beginPath()
          ctx.moveTo(fromX, y)
          ctx.lineTo(dotX, y)
          ctx.stroke()
          ctx.restore()

          ctx.save()
          ctx.shadowColor = msg.color
          ctx.shadowBlur = 14
          ctx.fillStyle = msg.color
          ctx.beginPath()
          ctx.arc(dotX, y, 5.5, 0, Math.PI*2)
          ctx.fill()
          ctx.restore()
        } else if (done) {
          ctx.save()
          ctx.strokeStyle = msg.color
          ctx.lineWidth = 1.5
          ctx.setLineDash([])
          ctx.beginPath()
          ctx.moveTo(fromX, y)
          ctx.lineTo(toX, y)
          ctx.stroke()
          ctx.restore()

          const dir = msg.dir === 'right' ? 1 : -1
          ctx.save()
          ctx.fillStyle = msg.color
          ctx.beginPath()
          ctx.moveTo(toX, y)
          ctx.lineTo(toX - dir*8, y - 5)
          ctx.lineTo(toX - dir*8, y + 5)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }

        const midX = (fromX + toX) / 2
        ctx.save()
        ctx.fillStyle = msg.color
        ctx.font = '700 11px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(msg.label, midX, y - 4)
        ctx.restore()

        ctx.save()
        ctx.fillStyle = '#44446A'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(msg.sub, midX, y + 5)
        ctx.restore()
      })

      // Status
      if (tN > 0.72 && tN < 0.92) {
        const phase = (tN - 0.72) / (0.92 - 0.72)
        const alpha = Math.sin(phase * Math.PI)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowColor = '#00E5A0'
        ctx.shadowBlur = 12
        ctx.fillStyle = '#00E5A0'
        ctx.font = '700 14px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('✓ Connection established', W/2, H - 24)
        ctx.restore()
      }

      ctx.restore()
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width:'100%', height:'100%', display:'block', background:'#07070E' }}
    />
  )
}
