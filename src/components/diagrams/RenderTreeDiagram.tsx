'use client'
import { motion } from 'framer-motion'

export default function RenderTreeDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-rt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4D9FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* DOM Tree column */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="12" y="12" width="180" height="170" rx="8" fill="#141420" stroke="#4D9FFF30" strokeWidth="1.5" />
          <text x="102" y="34" textAnchor="middle" fontSize="12" fontFamily="sans-serif" fill="#4D9FFF" fontWeight="700">DOM</text>
          <text x="28" y="56" fontSize="11" fontFamily="monospace" fill="#F0F0FF">html</text>
          <text x="40" y="76" fontSize="11" fontFamily="monospace" fill="#F0F0FF">├── head</text>
          <text x="52" y="94" fontSize="11" fontFamily="monospace" fill="#6B7280">│   └── style</text>
          <text x="40" y="112" fontSize="11" fontFamily="monospace" fill="#F0F0FF">└── body</text>
          <text x="52" y="130" fontSize="11" fontFamily="monospace" fill="#F0F0FF">    ├── div</text>
          <text x="64" y="148" fontSize="11" fontFamily="monospace" fill="#FF4D6D">    │  └── span*</text>
          <text x="64" y="164" fontSize="11" fontFamily="monospace" fill="#6B7280">    └── p</text>
        </motion.g>

        {/* display:none badge */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <rect x="14" y="152" width="120" height="16" rx="3" fill="#FF4D6D20" stroke="#FF4D6D50" strokeWidth="1" />
          <text x="74" y="163" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#FF4D6D">* display: none</text>
        </motion.g>

        {/* CSSOM column */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x="250" y="12" width="180" height="170" rx="8" fill="#141420" stroke="#FFB34030" strokeWidth="1.5" />
          <text x="340" y="34" textAnchor="middle" fontSize="12" fontFamily="sans-serif" fill="#FFB340" fontWeight="700">CSSOM</text>
          <text x="266" y="60" fontSize="11" fontFamily="monospace" fill="#6B7280">body {'{  margin: 0 }'}</text>
          <text x="266" y="80" fontSize="11" fontFamily="monospace" fill="#6B7280">div {'{  flex }'}</text>
          <text x="266" y="100" fontSize="11" fontFamily="monospace" fill="#FF4D6D">span {'{  display: none }'}</text>
          <text x="266" y="120" fontSize="11" fontFamily="monospace" fill="#6B7280">p {'{  color: #333 }'}</text>
          <text x="266" y="144" fontSize="11" fontFamily="monospace" fill="#4D9FFF">::before {'{  content }'}</text>
          <text x="266" y="160" fontSize="11" fontFamily="monospace" fill="#4D9FFF">::after {'{  content }'}</text>
        </motion.g>

        {/* Arrows from DOM+CSSOM to Render Tree */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <line x1="192" y1="80" x2="488" y2="80" stroke="#4D9FFF" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-rt)" />
          <line x1="430" y1="100" x2="488" y2="100" stroke="#4D9FFF" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arrow-rt)" />
        </motion.g>

        {/* Render Tree column */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <rect x="490" y="12" width="180" height="170" rx="8" fill="#141420" stroke="#00E5A030" strokeWidth="1.5" />
          <text x="580" y="34" textAnchor="middle" fontSize="12" fontFamily="sans-serif" fill="#00E5A0" fontWeight="700">Render Tree</text>
          <text x="506" y="58" fontSize="11" fontFamily="monospace" fill="#F0F0FF">RenderView</text>
          <text x="518" y="78" fontSize="11" fontFamily="monospace" fill="#F0F0FF">└── RenderBody</text>
          <text x="530" y="98" fontSize="11" fontFamily="monospace" fill="#F0F0FF">    ├── RenderDiv</text>
          <text x="542" y="116" fontSize="11" fontFamily="monospace" fill="#FF4D6D">    │  ✕ span (hidden)</text>
          <text x="530" y="134" fontSize="11" fontFamily="monospace" fill="#F0F0FF">    ├── ::before</text>
          <text x="530" y="152" fontSize="11" fontFamily="monospace" fill="#F0F0FF">    ├── RenderP</text>
          <text x="530" y="170" fontSize="11" fontFamily="monospace" fill="#F0F0FF">    └── ::after</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          x="340" y="200" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          display:none nodes excluded. visibility:hidden nodes remain in tree. Pseudo-elements included.
        </motion.text>
      </svg>
    </div>
  )
}
