'use client'
import { motion } from 'framer-motion'

export default function V8Diagram() {
  const stages = [
    { label: 'Source\nJS', color: '#6B7280', x: 16 },
    { label: 'Parser\nAST+Scope', color: '#00D4FF', x: 176 },
    { label: 'Ignition\nBytecode', color: '#FFB340', x: 336 },
    { label: 'TurboFan\nJIT IR', color: '#00E5A0', x: 496, glow: true },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-v8" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-v8-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Stages */}
        {stages.map((stage, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.15 }}>
            {stage.glow && (
              <rect x={stage.x - 2} y="28" width="160" height="82" rx="10" fill="none"
                stroke={stage.color} strokeWidth="3" opacity="0.25" />
            )}
            <rect x={stage.x} y="30" width="156" height="78" rx="8" fill="#141420"
              stroke={`${stage.color}70`} strokeWidth="1.5" />
            {stage.label.split('\n').map((line, li) => (
              <text key={li} x={stage.x + 78} y={62 + li * 20} textAnchor="middle"
                fontSize={li === 0 ? 13 : 11} fontFamily="sans-serif"
                fill={li === 0 ? stage.color : '#6B7280'} fontWeight={li === 0 ? '700' : '400'}>
                {line}
              </text>
            ))}
          </motion.g>
        ))}

        {/* Arrows between stages */}
        {[0, 1].map((i) => (
          <motion.line key={`arr-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.15 }}
            x1={stages[i].x + 156} y1="69" x2={stages[i + 1].x} y2="69"
            stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-v8)" />
        ))}

        {/* Hot arrow before TurboFan */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          <line x1="492" y1="69" x2="496" y2="69" stroke="#FF4D6D" strokeWidth="2" markerEnd="url(#arrow-v8-hot)" />
          <rect x="410" y="52" width="72" height="20" rx="4" fill="#FF4D6D20" />
          <text x="446" y="65" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#FF4D6D" fontWeight="700">🔥 hot!</text>
        </motion.g>

        {/* Deopt label */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <rect x="498" y="116" width="152" height="30" rx="6" fill="#FF4D6D15" stroke="#FF4D6D50" strokeWidth="1" />
          <text x="574" y="131" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#FF4D6D">deopt if type changes!</text>
          <text x="574" y="143" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#6B7280">falls back to Ignition</text>
        </motion.g>

        {/* Deopt arrow */}
        <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          x1="574" y1="116" x2="574" y2="108" stroke="#FF4D6D" strokeWidth="1" strokeDasharray="3,2" />

        {/* Notes */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          <text x="340" y="168" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
            Hidden classes (shapes) enable inline caches. Monomorphic IC = fastest path.
          </text>
          <text x="340" y="184" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
            Polymorphic IC (2-4 types) slower. Megamorphic (5+) disables optimization.
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
