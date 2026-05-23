'use client'

import { useEffect, useRef } from 'react'

const CYCLE = 6000

function ease(t: number) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t }
function lerp(a: number, b: number, t: number) { return a+(b-a)*Math.max(0,Math.min(1,t)) }
function clamp(x: number, lo=0, hi=1) { return Math.max(lo,Math.min(hi,x)) }

const MESSAGES = [
  { label:'GET /users/torvalds', sub:'HTTP/1.1 request', color:'#7DD3FC', dir:'right', t0:0.00, t1:0.36 },
  { label:'200 OK',              sub:'HTML response',    color:'#A5F3FC', dir:'left',  t0:0.46, t1:0.82 },
]

export default function HttpScene() {
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
      grad.addColorStop(0, 'rgba(125,211,252,0.04)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Layout
      const LX = Math.max(W*0.20, 90)
      const RX = Math.min(W*0.80, W-90)
      const BOX_H = Math.max(42, Math.min(54, H*0.15))
      const BOX_W = Math.min(120, (RX-LX)*0.30)
      const BOX_TOP = 22

      const processing = tN > 0.36 && tN < 0.46

      const leftSending = MESSAGES.some(m => m.dir==='right' && tN >= m.t0 && tN < m.t1)
      const rightSending = MESSAGES.some(m => m.dir==='left' && tN >= m.t0 && tN < m.t1)

      function drawBox(cx: number, label: string, sub: string, color: string, sending: boolean, glowing: boolean) {
        const x = cx - BOX_W/2
        const y = BOX_TOP
        ctx.save()
        if (sending || glowing) {
          ctx.shadowColor = color
          ctx.shadowBlur = 12
        }
        ctx.fillStyle = color+'14'
        ctx.strokeStyle = (sending || glowing) ? color : color+'55'
        ctx.lineWidth = (sending || glowing) ? 2 : 1
        ctx.beginPath()
        ctx.roundRect(x, y, BOX_W, BOX_H, 6)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, y, BOX_W, 3, [3,3,0,0])
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.fillStyle = '#E8E8F0'
        ctx.font = '700 13px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, cx, y + BOX_H*0.42)
        ctx.restore()

        ctx.save()
        ctx.fillStyle = '#44446A'
        ctx.font = '9.5px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sub, cx, y + BOX_H*0.72)
        ctx.restore()
      }

      drawBox(LX, 'BROWSER', 'your device', '#7DD3FC', leftSending,  false)
      drawBox(RX, 'SERVER',  'github.com',  '#A5F3FC', rightSending, processing)

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

      const lifeH = lifeBot - lifeTop
      const msgYs = MESSAGES.map((_, i) => lifeTop + lifeH * (i+1) / (MESSAGES.length+1))

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

      // Processing pause indicator
      if (processing) {
        const phase = (tN - 0.36) / (0.46 - 0.36)
        const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 6)
        ctx.save()
        ctx.globalAlpha = 0.3 + pulse * 0.4
        ctx.fillStyle = '#A5F3FC'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('processing…', RX, H * 0.55)
        ctx.restore()
      }

      // Status
      if (tN > 0.85 && tN < 0.97) {
        const phase = (tN - 0.85) / (0.97 - 0.85)
        const alpha = Math.sin(phase * Math.PI)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowColor = '#A5F3FC'
        ctx.shadowBlur = 12
        ctx.fillStyle = '#A5F3FC'
        ctx.font = '700 14px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('200 OK — page received', W/2, H - 24)
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
