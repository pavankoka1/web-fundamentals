'use client'
import { motion } from 'framer-motion'

export default function CacheDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-cache-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-cache-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-cache-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4D9FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Request box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="270" y="10" width="140" height="36" rx="8" fill="#141420" stroke="#6B728060" strokeWidth="1.5" />
          <text x="340" y="33" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#F0F0FF" fontWeight="600">Request</text>
        </motion.g>

        {/* Arrow down to first diamond */}
        <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          x1="340" y1="46" x2="340" y2="68" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-cache-b)" />

        {/* Diamond 1: in cache & fresh? */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <polygon points="340,68 420,95 340,122 260,95" fill="#141420" stroke="#4D9FFF60" strokeWidth="1.5" />
          <text x="340" y="91" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#4D9FFF">In cache &amp;</text>
          <text x="340" y="105" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#4D9FFF">max-age fresh?</text>
        </motion.g>

        {/* YES branch — left */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <line x1="260" y1="95" x2="130" y2="95" stroke="#00E5A0" strokeWidth="1.5" markerEnd="url(#arrow-cache-g)" />
          <text x="198" y="88" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#00E5A0">YES</text>
          <rect x="30" y="72" width="100" height="46" rx="8" fill="#00E5A018" stroke="#00E5A060" strokeWidth="1.5" />
          <text x="80" y="92" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#00E5A0" fontWeight="700">Serve from</text>
          <text x="80" y="108" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#00E5A0" fontWeight="700">Cache</text>
        </motion.g>

        {/* NO branch — down */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <line x1="340" y1="122" x2="340" y2="148" stroke="#FF4D6D" strokeWidth="1.5" markerEnd="url(#arrow-cache-r)" />
          <text x="352" y="138" fontSize="10" fontFamily="sans-serif" fill="#FF4D6D">NO</text>
        </motion.g>

        {/* Diamond 2: Has ETag? */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <polygon points="340,148 420,175 340,202 260,175" fill="#141420" stroke="#4D9FFF60" strokeWidth="1.5" />
          <text x="340" y="171" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#4D9FFF">Has ETag /</text>
          <text x="340" y="185" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#4D9FFF">Last-Modified?</text>
        </motion.g>

        {/* YES branch right — 304 */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          <line x1="420" y1="175" x2="490" y2="175" stroke="#00E5A0" strokeWidth="1.5" markerEnd="url(#arrow-cache-g)" />
          <text x="452" y="168" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#00E5A0">YES</text>
          <rect x="492" y="152" width="138" height="46" rx="8" fill="#00E5A018" stroke="#00E5A060" strokeWidth="1.5" />
          <text x="561" y="172" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#00E5A0" fontWeight="700">304 Not Modified</text>
          <text x="561" y="188" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">use cached body</text>
        </motion.g>

        {/* NO branch left — 200 */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <line x1="260" y1="175" x2="130" y2="175" stroke="#FF4D6D" strokeWidth="1.5" markerEnd="url(#arrow-cache-r)" />
          <text x="198" y="168" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#FF4D6D">NO</text>
          <rect x="30" y="152" width="100" height="46" rx="8" fill="#FF4D6D18" stroke="#FF4D6D60" strokeWidth="1.5" />
          <text x="80" y="172" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#FF4D6D" fontWeight="700">200 OK</text>
          <text x="80" y="188" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">full response</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          x="340" y="222" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          Cache-Control: immutable skips revalidation for versioned assets. stale-while-revalidate serves stale + fetches fresh.
        </motion.text>
      </svg>
    </div>
  )
}
