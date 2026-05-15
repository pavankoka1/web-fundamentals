'use client'
import { motion } from 'framer-motion'

export default function LayoutDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg">

        {/* Margin box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="90" y="18" width="500" height="174" rx="10" fill="#6B728015" stroke="#6B728060" strokeWidth="2" />
          <text x="112" y="36" fontSize="11" fontFamily="sans-serif" fill="#6B7280">margin</text>
          <text x="400" y="36" fontSize="10" fontFamily="monospace" fill="#6B7280">top: 24px  |  right: 24px</text>
        </motion.g>

        {/* Border box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <rect x="114" y="42" width="452" height="128" rx="8" fill="#FFB34012" stroke="#FFB34070" strokeWidth="2" />
          <text x="134" y="60" fontSize="11" fontFamily="sans-serif" fill="#FFB340">border</text>
          <text x="400" y="60" fontSize="10" fontFamily="monospace" fill="#FFB340">2px solid #ccc</text>
        </motion.g>

        {/* Padding box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x="136" y="66" width="408" height="80" rx="6" fill="#4D9FFF12" stroke="#4D9FFF70" strokeWidth="2" />
          <text x="156" y="84" fontSize="11" fontFamily="sans-serif" fill="#4D9FFF">padding</text>
          <text x="400" y="84" fontSize="10" fontFamily="monospace" fill="#4D9FFF">16px all sides</text>
        </motion.g>

        {/* Content box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <rect x="158" y="90" width="364" height="44" rx="4" fill="#00E5A018" stroke="#00E5A070" strokeWidth="2" />
          <text x="340" y="117" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#00E5A0" fontWeight="700">
            content  (364 × 44 px)
          </text>
        </motion.g>

        {/* Labels on sides */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <text x="340" y="172" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">bottom padding 16px</text>
          <text x="340" y="188" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#FFB340">bottom border 2px</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          x="340" y="204" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          box-sizing: border-box — width includes padding + border. Default content-box excludes them.
        </motion.text>
      </svg>
    </div>
  )
}
