'use client'
import { motion } from 'framer-motion'

export default function PaintDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-paint" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#FFB340" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Render tree node */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="12" y="24" width="196" height="148" rx="8" fill="#141420" stroke="#6B728040" strokeWidth="1.5" />
          <text x="110" y="46" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#6B7280" fontWeight="700">Render Tree Node</text>
          <line x1="22" y1="52" x2="198" y2="52" stroke="#1A1A2E" strokeWidth="1" />
          <text x="22" y="70" fontSize="10" fontFamily="monospace" fill="#6B7280">background: #1A1A2E</text>
          <text x="22" y="88" fontSize="10" fontFamily="monospace" fill="#6B7280">border: 2px solid #333</text>
          <text x="22" y="106" fontSize="10" fontFamily="monospace" fill="#6B7280">color: #F0F0FF</text>
          <text x="22" y="124" fontSize="10" fontFamily="monospace" fill="#6B7280">font-size: 14px</text>
          <text x="22" y="142" fontSize="10" fontFamily="monospace" fill="#6B7280">box-shadow: 0 2px 8px</text>
          <text x="22" y="160" fontSize="10" fontFamily="monospace" fill="#6B7280">border-radius: 8px</text>
        </motion.g>

        {/* Arrow 1 */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <line x1="208" y1="98" x2="240" y2="98" stroke="#FFB340" strokeWidth="2" markerEnd="url(#arrow-paint)" />
        </motion.g>

        {/* Display list box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <rect x="242" y="24" width="196" height="148" rx="8" fill="#141420" stroke="#FFB34060" strokeWidth="1.5" />
          <text x="340" y="46" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#FFB340" fontWeight="700">Display List</text>
          <line x1="252" y1="52" x2="428" y2="52" stroke="#1A1A2E" strokeWidth="1" />
          <text x="252" y="70" fontSize="10" fontFamily="monospace" fill="#FFB340">drawRect(x,y,w,h,fill)</text>
          <text x="252" y="88" fontSize="10" fontFamily="monospace" fill="#FFB340">drawBorder(…)</text>
          <text x="252" y="106" fontSize="10" fontFamily="monospace" fill="#FFB340">drawText("Hello", …)</text>
          <text x="252" y="124" fontSize="10" fontFamily="monospace" fill="#FFB340">drawShadow(…)</text>
          <text x="252" y="142" fontSize="10" fontFamily="monospace" fill="#FFB340">clipRRect(rx=8)</text>
        </motion.g>

        {/* Arrow 2 */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          <line x1="438" y1="98" x2="470" y2="98" stroke="#FFB340" strokeWidth="2" markerEnd="url(#arrow-paint)" />
        </motion.g>

        {/* GPU box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <rect x="472" y="24" width="196" height="148" rx="8" fill="#141420" stroke="#4D9FFF60" strokeWidth="1.5" />
          <text x="570" y="46" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#4D9FFF" fontWeight="700">GPU Rasterize + Composite</text>
          <line x1="482" y1="52" x2="658" y2="52" stroke="#1A1A2E" strokeWidth="1" />
          <text x="482" y="70" fontSize="10" fontFamily="monospace" fill="#4D9FFF">Tile 256×256 px</text>
          <text x="482" y="88" fontSize="10" fontFamily="monospace" fill="#4D9FFF">Upload to GPU texture</text>
          <text x="482" y="106" fontSize="10" fontFamily="monospace" fill="#4D9FFF">Composite layers</text>
          <text x="482" y="124" fontSize="10" fontFamily="monospace" fill="#4D9FFF">Transform via GPU</text>
          <text x="482" y="142" fontSize="10" fontFamily="monospace" fill="#00E5A0">→ Screen pixels</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          x="340" y="188" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          Dirty region tracking repaints only changed tiles. Compositor thread runs on GPU independently.
        </motion.text>
      </svg>
    </div>
  )
}
