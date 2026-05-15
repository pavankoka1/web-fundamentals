'use client'
import { motion } from 'framer-motion'

export default function DnsDiagram() {
  const nodes = [
    { label: 'Browser\nCache', color: '#00E5A0', x: 20 },
    { label: 'OS\nResolver', color: '#6B7280', x: 160 },
    { label: 'Recursive\nNS', color: '#6B7280', x: 300 },
    { label: 'Root +\nTLD NS', color: '#6B7280', x: 440 },
    { label: 'Auth\nNS', color: '#4D9FFF', x: 580 },
  ]

  const timings = ['~0 ms', '~1 ms', '~10 ms', '~50 ms', '~80 ms']

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-dns-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#FF4D6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-dns-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Title */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
          x="350" y="20" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#6B7280">
          DNS Resolution Chain
        </motion.text>

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <rect x={node.x} y="40" width="110" height="56" rx="8" fill="#141420" stroke={`${node.color}80`} strokeWidth="1.5" />
            {node.label.split('\n').map((line, li) => (
              <text key={li} x={node.x + 55} y={65 + li * 16} textAnchor="middle" fontSize="12" fontFamily="sans-serif"
                fill={node.color} fontWeight="600">
                {line}
              </text>
            ))}
          </motion.g>
        ))}

        {/* Arrows — cache miss (left to right, top) */}
        {[0, 1, 2, 3].map((i) => (
          <motion.line key={`miss-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
            x1={nodes[i].x + 110} y1="58" x2={nodes[i + 1].x} y2="58"
            stroke="#FF4D6D" strokeWidth="1.5" markerEnd="url(#arrow-dns-r)" />
        ))}

        {/* Arrows — cache hit (right to left, bottom) */}
        {[0, 1, 2, 3].map((i) => (
          <motion.line key={`hit-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.05 }}
            x1={nodes[i + 1].x} y1="82" x2={nodes[i].x + 110} y2="82"
            stroke="#00E5A0" strokeWidth="1.5" markerEnd="url(#arrow-dns-g)" />
        ))}

        {/* Legend */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          <rect x="230" y="112" width="12" height="3" rx="1" fill="#FF4D6D" />
          <text x="248" y="118" fontSize="11" fontFamily="sans-serif" fill="#FF4D6D">cache miss →</text>
          <rect x="360" y="112" width="12" height="3" rx="1" fill="#00E5A0" />
          <text x="378" y="118" fontSize="11" fontFamily="sans-serif" fill="#00E5A0">← cache hit</text>
        </motion.g>

        {/* Timing labels */}
        {nodes.map((node, i) => (
          <motion.text key={`t-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.05 }}
            x={node.x + 55} y="114" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#6B7280">
            {timings[i]}
          </motion.text>
        ))}

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          x="350" y="148" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          Result cached in OS + browser for TTL seconds. Negative TTL caches NXDOMAIN.
        </motion.text>
      </svg>
    </div>
  )
}
