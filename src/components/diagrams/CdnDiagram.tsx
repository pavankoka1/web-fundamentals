'use client'
import { motion } from 'framer-motion'

export default function CdnDiagram() {
  const pops = [
    { label: 'PoP — Europe', sublabel: 'Frankfurt · anycast', x: 60, color: '#00E5A0' },
    { label: 'PoP — US-West', sublabel: 'San Jose · anycast', x: 270, color: '#00E5A0' },
    { label: 'PoP — Asia', sublabel: 'Tokyo · anycast', x: 480, color: '#00E5A0' },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 215" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-cdn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4D9FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Origin server */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="240" y="12" width="200" height="52" rx="8" fill="#141420" stroke="#4D9FFF60" strokeWidth="1.5" />
          <text x="340" y="36" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#4D9FFF" fontWeight="700">Origin Server</text>
          <text x="340" y="54" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">api.example.com · 1 region</text>
        </motion.g>

        {/* Origin shield badge */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <rect x="448" y="22" width="96" height="20" rx="4" fill="#FFB34020" stroke="#FFB34060" strokeWidth="1" />
          <text x="496" y="36" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#FFB340">Origin Shield ↑</text>
        </motion.g>

        {/* Arrows from origin to PoPs */}
        {pops.map((pop, i) => (
          <motion.line key={`arr-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
            x1="340" y1="64" x2={pop.x + 95} y2="118"
            stroke="#4D9FFF" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrow-cdn)" />
        ))}

        {/* PoP boxes */}
        {pops.map((pop, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.12 }}>
            {/* Glow */}
            <rect x={pop.x - 2} y="116" width="194" height="64" rx="10" fill="none"
              stroke={pop.color} strokeWidth="2" opacity="0.2" />
            <rect x={pop.x} y="118" width="190" height="60" rx="8" fill="#141420"
              stroke={`${pop.color}70`} strokeWidth="1.5" />
            <text x={pop.x + 95} y="142" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
              fill={pop.color} fontWeight="700">{pop.label}</text>
            <text x={pop.x + 95} y="160" textAnchor="middle" fontSize="10" fontFamily="sans-serif"
              fill="#6B7280">{pop.sublabel}</text>
          </motion.g>
        ))}

        {/* Notes */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <text x="340" y="198" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
            Anycast BGP routes users to nearest PoP. Surrogate-Key / Cache-Tag enables targeted purge.
          </text>
          <text x="340" y="212" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
            Origin Shield collapses revalidation requests — only one PoP forwards to origin per miss.
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
