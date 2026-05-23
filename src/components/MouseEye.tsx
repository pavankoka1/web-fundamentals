'use client'
import { useEffect, useRef } from 'react'

/**
 * Cursor-following eye. Renders fixed top-right (24px from edges), z-40, pointer-events-none.
 * Iris and accents use the ice-cyan accent (#7DD3FC) to match the Deep Ocean palette.
 */
export function MouseEye() {
  const irisRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const pupil = useRef({ x: 0, y: 0 })
  const blink = useRef({ phase: 'open' as 'open'|'closing'|'opening', t: 0, nextBlink: 0 })

  useEffect(() => {
    const ic = irisRef.current!
    const oc = overlayRef.current!
    const ctx = ic.getContext('2d')!
    const ovx = oc.getContext('2d')!
    const W = 32, H = 32, CX = 16, CY = 16, R = 13
    let rot = 0, rId = 0

    const drawIris = () => {
      ctx.clearRect(0, 0, W, H)
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R)
      g.addColorStop(0, '#e6f6ff')
      g.addColorStop(0.18, '#7DD3FC')
      g.addColorStop(0.45, '#3b8fb8')
      g.addColorStop(0.75, '#0f3045')
      g.addColorStop(1, '#040b14')
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2)
      ctx.fillStyle = g; ctx.fill()
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(rot)
      for (let i = 0; i < 18; i++) {
        ctx.save(); ctx.rotate((i/18)*Math.PI*2)
        ctx.globalAlpha = i%2===0 ? 0.18 : 0.09
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.7
        ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(0, R-2); ctx.stroke()
        ctx.restore()
      }
      ctx.restore()
      rot += 0.003
    }

    const drawOverlay = () => {
      ovx.clearRect(0, 0, W, H)
      const mx = mouse.current.x, my = mouse.current.y
      const dx = mx-0.5, dy = my-0.5
      const a = Math.atan2(dy, dx)
      const s = Math.min(Math.sqrt(dx*dx+dy*dy)*9, 4)
      pupil.current.x += (Math.cos(a)*s - pupil.current.x)*0.18
      pupil.current.y += (Math.sin(a)*s - pupil.current.y)*0.18

      const b = blink.current
      let lid = 0
      if (b.phase==='closing') { b.t=Math.min(b.t+0.1,1); lid=b.t; if(b.t>=1){b.phase='opening'} }
      else if (b.phase==='opening') { b.t=Math.max(b.t-0.07,0); lid=b.t; if(b.t<=0){b.phase='open';b.nextBlink=Date.now()+4000+Math.random()*3000} }
      else { if(b.nextBlink===0) b.nextBlink=Date.now()+2000; if(Date.now()>b.nextBlink){b.phase='closing';b.t=0} }

      ovx.save()
      ovx.beginPath(); ovx.arc(CX,CY,R,0,Math.PI*2); ovx.clip()
      const px=CX+pupil.current.x, py=CY+pupil.current.y, PR=5.5

      // Pupil
      ovx.beginPath(); ovx.arc(px,py,PR,0,Math.PI*2)
      ovx.fillStyle='#000'; ovx.fill()
      // Pupil ring — ice cyan
      ovx.beginPath(); ovx.arc(px,py,PR+0.8,0,Math.PI*2)
      ovx.strokeStyle='rgba(125,211,252,0.35)'; ovx.lineWidth=0.8; ovx.stroke()
      // Highlights
      ovx.beginPath(); ovx.arc(px-2,py-2,1.8,0,Math.PI*2)
      ovx.fillStyle='rgba(255,255,255,0.88)'; ovx.fill()
      ovx.beginPath(); ovx.arc(px+1.5,py-0.8,0.9,0,Math.PI*2)
      ovx.fillStyle='rgba(255,255,255,0.45)'; ovx.fill()

      // Eyelid
      if (lid>0) {
        ovx.fillStyle='#08080F'
        ovx.fillRect(CX-R, CY-R, R*2, (R*2)*lid*1.05)
      }
      ovx.restore()

      // Sclera ring — ice cyan
      ovx.beginPath(); ovx.arc(CX,CY,R,0,Math.PI*2)
      ovx.strokeStyle='rgba(125,211,252,0.25)'; ovx.lineWidth=0.5; ovx.stroke()

      rId = requestAnimationFrame(drawOverlay)
    }

    drawIris()
    const irisTimer = setInterval(drawIris, 33)
    rId = requestAnimationFrame(drawOverlay)

    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX/window.innerWidth, y: e.clientY/window.innerHeight } }
    window.addEventListener('mousemove', onMove)
    return () => { clearInterval(irisTimer); cancelAnimationFrame(rId); window.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <div
      className="pointer-events-none fixed right-6 top-6 z-40"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(125,211,252,0.2), 0 0 8px rgba(125,211,252,0.1)',
      }}
      aria-hidden
    >
      <canvas ref={irisRef} width={32} height={32} className="absolute inset-0" />
      <canvas ref={overlayRef} width={32} height={32} className="absolute inset-0" />
    </div>
  )
}

export default MouseEye
