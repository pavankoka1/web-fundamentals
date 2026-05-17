'use client'
import { motion } from 'framer-motion'

const PHASES = [
  { label: 'rAF / JS',  color: '#00D4FF', ms: 4.2 },
  { label: 'Style',     color: '#4D9FFF', ms: 1.1 },
  { label: 'Layout',    color: '#A78BFA', ms: 1.8 },
  { label: 'Paint',     color: '#FFB340', ms: 1.0 },
  { label: 'Commit',    color: '#00E5A0', ms: 0.5 },
]

const JANK_PHASES = [
  { label: 'rAF / JS',  color: '#FF4D6D', ms: 21.0 },
  { label: 'Style',     color: '#4D9FFF', ms: 1.1 },
  { label: 'Layout',    color: '#A78BFA', ms: 1.8 },
  { label: 'Paint',     color: '#FFB340', ms: 1.0 },
  { label: 'Commit',    color: '#00E5A0', ms: 0.5 },
]

const BUDGET_MS = 16.67
const VW = 720
const VH = 220
const PAD_X = 40
const BAR_TOP = 32
const BAR_BOT = 170
const BAR_H = BAR_BOT - BAR_TOP
const BUDGET_Y = BAR_TOP + BAR_H * 0.6    // budget line position
const OVERFLOW_Y = BAR_TOP + 6            // top cap for overflow bars
const SLOT_COUNT = 5
const SLOT_W = 110
const GAP = 10
const TOTAL_W = SLOT_COUNT * SLOT_W + (SLOT_COUNT - 1) * GAP
const START_X = (VW - TOTAL_W) / 2

// convert ms to pixels (within budget zone)
const msToH = (ms: number) => Math.min((ms / BUDGET_MS) * (BUDGET_Y - BAR_TOP), BUDGET_Y - OVERFLOW_Y)

// Frame definitions: 5 slots
const FRAMES = [
  { type: 'normal',  label: '#1' },
  { type: 'normal',  label: '#2' },
  { type: 'jank',    label: '#3 Long Task' },
  { type: 'dropped', label: '#4 Dropped' },
  { type: 'normal',  label: '#5' },
]

export default function FrameDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} xmlns="http://www.w3.org/2000/svg">

        {/* Budget line */}
        <line
          x1={PAD_X - 8} y1={BUDGET_Y}
          x2={VW - PAD_X + 8} y2={BUDGET_Y}
          stroke="rgba(255,77,77,0.55)" strokeWidth="1.5"
          strokeDasharray="7 5"
        />
        <text x={PAD_X - 10} y={BUDGET_Y - 4} textAnchor="end"
          fontSize="9" fontFamily="monospace" fill="rgba(255,100,100,0.75)" fontWeight="500">
          16.67ms
        </text>

        {/* Frame slots */}
        {FRAMES.map((frame, fi) => {
          const x = START_X + fi * (SLOT_W + GAP)
          const phases = frame.type === 'jank' ? JANK_PHASES : PHASES
          const isDropped = frame.type === 'dropped'
          const isJank = frame.type === 'jank'

          return (
            <motion.g key={fi} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * fi, duration: 0.4 }}>

              {/* Slot background */}
              <rect x={x} y={BAR_TOP} width={SLOT_W} height={BAR_BOT - BAR_TOP} rx="4"
                fill={isDropped ? 'rgba(255,50,50,0.06)' : 'rgba(255,255,255,0.02)'}
                stroke={isJank ? 'rgba(255,77,109,0.3)' : 'rgba(255,255,255,0.06)'}
                strokeWidth="1"
              />

              {isDropped ? (
                <>
                  <text x={x + SLOT_W / 2} y={BUDGET_Y - (BUDGET_Y - BAR_TOP) / 2 + 4}
                    textAnchor="middle" fontSize="10" fontFamily="monospace"
                    fill="rgba(255,80,80,0.45)" fontWeight="700">
                    DROPPED
                  </text>
                </>
              ) : (
                <>
                  {/* Phase bars stacking bottom-up from budget line */}
                  {(() => {
                    let cumMs = 0
                    return phases.map((ph, pi) => {
                      const phH = msToH(ph.ms)
                      const phY = BUDGET_Y - msToH(cumMs) - phH
                      cumMs += ph.ms
                      return (
                        <rect key={pi}
                          x={x + 2} y={phY}
                          width={SLOT_W - 4} height={phH}
                          fill={ph.color} opacity={0.82} rx="2"
                        />
                      )
                    })
                  })()}

                  {/* Jank overflow indicator */}
                  {isJank && (
                    <>
                      <text x={x + SLOT_W / 2} y={OVERFLOW_Y + 2}
                        textAnchor="middle" fontSize="8.5" fontFamily="monospace"
                        fill="#FF4D6D" fontWeight="700">
                        LONG TASK
                      </text>
                      {/* overflow arrow */}
                      <line x1={x + SLOT_W / 2} y1={OVERFLOW_Y + 14} x2={x + SLOT_W / 2} y2={BAR_TOP + 2}
                        stroke="rgba(255,77,109,0.4)" strokeWidth="1" strokeDasharray="3 2" />
                    </>
                  )}
                </>
              )}

              {/* Frame label */}
              <text x={x + SLOT_W / 2} y={BAR_BOT + 14}
                textAnchor="middle" fontSize="9" fontFamily="monospace"
                fill={isDropped ? 'rgba(255,80,80,0.5)' : isJank ? '#FF4D6D' : 'rgba(150,150,200,0.6)'}>
                {frame.label}
              </text>
            </motion.g>
          )
        })}

        {/* Title */}
        <text x={VW / 2} y={VH - 10} textAnchor="middle"
          fontSize="10" fontFamily="monospace" fill="rgba(140,140,180,0.5)">
          60 Hz display — 16.67ms frame budget
        </text>

        {/* Legend */}
        {PHASES.map((ph, i) => {
          const legendX = PAD_X + i * 128
          const legendY = BAR_BOT + 28
          return (
            <g key={i}>
              <rect x={legendX} y={legendY} width={10} height={8} rx="2" fill={ph.color} opacity={0.85} />
              <text x={legendX + 14} y={legendY + 7} fontSize="9" fontFamily="monospace"
                fill="rgba(150,150,200,0.65)">
                {ph.label}
              </text>
            </g>
          )
        })}

        {/* VSync markers */}
        {[START_X - 8, START_X + TOTAL_W + 8].map((vx, i) => (
          <g key={i}>
            <line x1={vx} y1={BAR_TOP - 4} x2={vx} y2={BUDGET_Y + 8}
              stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x={vx} y={BAR_TOP - 8} textAnchor="middle"
              fontSize="8" fontFamily="monospace" fill="rgba(200,200,220,0.35)">
              VSync
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
