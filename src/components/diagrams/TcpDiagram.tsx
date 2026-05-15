'use client'
import { motion } from 'framer-motion'

export default function TcpDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-tcp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Column headers */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="60" y="12" width="100" height="32" rx="6" fill="#141420" stroke="#00E5A080" strokeWidth="1.5" />
          <text x="110" y="32" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#00E5A0" fontWeight="700">Client</text>

          <rect x="520" y="12" width="100" height="32" rx="6" fill="#141420" stroke="#4D9FFF80" strokeWidth="1.5" />
          <text x="570" y="32" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#4D9FFF" fontWeight="700">Server</text>
        </motion.g>

        {/* Vertical timelines */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <line x1="110" y1="44" x2="110" y2="185" stroke="#1A1A2E" strokeWidth="2" strokeDasharray="6,4" />
          <line x1="570" y1="44" x2="570" y2="185" stroke="#1A1A2E" strokeWidth="2" strokeDasharray="6,4" />
        </motion.g>

        {/* SYN arrow */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <line x1="110" y1="70" x2="570" y2="100" stroke="#00E5A0" strokeWidth="2" markerEnd="url(#arrow-tcp)" />
          <rect x="270" y="60" width="140" height="22" rx="4" fill="#141420" />
          <text x="340" y="75" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="#00E5A0">SYN seq=0</text>
        </motion.g>

        {/* SYN-ACK arrow */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <line x1="570" y1="110" x2="110" y2="140" stroke="#4D9FFF" strokeWidth="2" markerEnd="url(#arrow-tcp)" />
          <rect x="270" y="108" width="140" height="22" rx="4" fill="#141420" />
          <text x="340" y="123" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="#4D9FFF">SYN-ACK</text>
        </motion.g>

        {/* ACK arrow */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <line x1="110" y1="150" x2="570" y2="180" stroke="#00E5A0" strokeWidth="2" markerEnd="url(#arrow-tcp)" />
          <rect x="270" y="152" width="140" height="22" rx="4" fill="#141420" />
          <text x="340" y="167" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="#00E5A0">ACK</text>
        </motion.g>

        {/* 1 RTT brace */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          <line x1="610" y1="70" x2="610" y2="185" stroke="#FFB340" strokeWidth="1.5" />
          <line x1="605" y1="70" x2="615" y2="70" stroke="#FFB340" strokeWidth="1.5" />
          <line x1="605" y1="185" x2="615" y2="185" stroke="#FFB340" strokeWidth="1.5" />
          <text x="640" y="132" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#FFB340">1 RTT</text>
        </motion.g>

        {/* Note */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          <text x="340" y="205" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
            TCP Slow Start begins after handshake — initial cwnd = 10 segments
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
