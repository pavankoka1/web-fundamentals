'use client'
import { motion } from 'framer-motion'

export default function UrlDiagram() {
  const segments = [
    { label: 'https', x: 16, width: 68, color: '#00D4FF', desc: 'Protocol', detail: 'Encrypted\ntransport' },
    { label: '://api.github.com', x: 84, width: 164, color: '#4D9FFF', desc: 'Host', detail: 'DNS lookup\nresolves IP' },
    { label: '/users/torvalds', x: 248, width: 148, color: '#F0F0FF', desc: 'Path', detail: 'Resource\nidentifier' },
    { label: '?tab=repos', x: 396, width: 104, color: '#FFB340', desc: 'Query', detail: 'Key=value\nparams' },
    { label: '#about', x: 500, width: 72, color: '#6B7280', desc: 'Fragment', detail: 'Client-only\nanchor' },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 700 160" xmlns="http://www.w3.org/2000/svg">
        {/* Address bar background */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="8" y="12" width="684" height="40" rx="8" fill="#141420" stroke="#1A1A2E" strokeWidth="1.5" />
        </motion.g>

        {/* Segments in address bar */}
        {segments.map((seg, i) => (
          <motion.g key={seg.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <rect x={seg.x} y="16" width={seg.width} height="32" rx="4" fill={`${seg.color}20`} />
            <text x={seg.x + seg.width / 2} y="36" textAnchor="middle" fontSize="12" fontFamily="monospace" fill={seg.color} fontWeight="600">
              {seg.label}
            </text>
          </motion.g>
        ))}

        {/* Info boxes below */}
        {segments.map((seg, i) => (
          <motion.g key={`box-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}>
            {/* Connector line */}
            <line x1={seg.x + seg.width / 2} y1="58" x2={seg.x + seg.width / 2} y2="74" stroke={seg.color} strokeWidth="1" strokeDasharray="3,2" />
            <rect x={seg.x} y="74" width={seg.width} height="72" rx="6" fill="#141420" stroke={`${seg.color}50`} strokeWidth="1" />
            <text x={seg.x + seg.width / 2} y="92" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill={seg.color} fontWeight="700">
              {seg.desc}
            </text>
            {seg.detail.split('\n').map((line, li) => (
              <text key={li} x={seg.x + seg.width / 2} y={110 + li * 16} textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
                {line}
              </text>
            ))}
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
