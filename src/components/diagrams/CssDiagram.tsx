'use client'
import { motion } from 'framer-motion'

export default function CssDiagram() {
  const rules = [
    {
      selector: '#intro p',
      property: 'color: red',
      specificity: '(1,0,1)',
      score: '101',
      badge: 'WINS',
      badgeColor: '#00E5A0',
      boxColor: '#00E5A0',
      glow: true,
    },
    {
      selector: '.section p',
      property: 'color: blue',
      specificity: '(0,1,1)',
      score: '011',
      badge: 'LOSES',
      badgeColor: '#FF4D6D',
      boxColor: '#FF4D6D',
      glow: false,
    },
    {
      selector: 'p',
      property: 'color: green',
      specificity: '(0,0,1)',
      score: '001',
      badge: 'LOSES',
      badgeColor: '#FF4D6D',
      boxColor: '#FF4D6D',
      glow: false,
    },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg">

        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
          x="340" y="22" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#6B7280">
          CSS Cascade — Specificity Wins
        </motion.text>

        {rules.map((rule, i) => {
          const x = 18 + i * 222
          return (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.2 }}>
              {/* Glow filter for winner */}
              {rule.glow && (
                <rect x={x - 2} y="33" width="216" height="138" rx="10" fill="none"
                  stroke={rule.boxColor} strokeWidth="3" opacity="0.3" />
              )}
              <rect x={x} y="35" width="212" height="134" rx="8" fill="#141420"
                stroke={`${rule.boxColor}60`} strokeWidth="1.5" />

              {/* Selector */}
              <text x={x + 10} y="58" fontSize="14" fontFamily="monospace" fill="#F0F0FF" fontWeight="700">
                {rule.selector}
              </text>
              <line x1={x + 10} y1="65" x2={x + 202} y2="65" stroke="#1A1A2E" strokeWidth="1" />

              {/* Property */}
              <text x={x + 10} y="85" fontSize="12" fontFamily="monospace" fill="#FFB340">
                {rule.property}
              </text>

              {/* Specificity */}
              <text x={x + 10} y="108" fontSize="10" fontFamily="sans-serif" fill="#6B7280">Specificity</text>
              <rect x={x + 10} y="114" width="80" height="24" rx="4" fill="#0F0F1A" stroke="#1A1A2E" strokeWidth="1" />
              <text x={x + 50} y="130" textAnchor="middle" fontSize="13" fontFamily="monospace" fill={rule.boxColor} fontWeight="700">
                {rule.specificity}
              </text>

              {/* Badge */}
              <rect x={x + 132} y="114" width="68" height="24" rx="4" fill={`${rule.badgeColor}25`} stroke={rule.badgeColor} strokeWidth="1" />
              <text x={x + 166} y="130" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill={rule.badgeColor} fontWeight="700">
                {rule.badge}
              </text>
            </motion.g>
          )
        })}

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          x="340" y="196" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          Selectors matched right-to-left for performance. !important overrides specificity entirely.
        </motion.text>
      </svg>
    </div>
  )
}
