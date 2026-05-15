'use client'
import { motion } from 'framer-motion'

export default function HttpDiagram() {
  const reqHeaders = [
    'Host: api.github.com',
    'Accept: application/json',
    'Authorization: Bearer ...',
    'Accept-Encoding: gzip, br',
  ]
  const resHeaders = [
    'Content-Type: application/json',
    'Cache-Control: public, max-age=60',
    'ETag: "abc123"',
    'X-RateLimit-Remaining: 58',
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg">

        {/* Left panel — Request */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="12" y="12" width="314" height="185" rx="8" fill="#141420" stroke="#00E5A030" strokeWidth="1.5" />
          {/* Header bar */}
          <rect x="12" y="12" width="314" height="34" rx="8" fill="#00E5A020" />
          <rect x="12" y="34" width="314" height="12" fill="#00E5A020" />
          <text x="22" y="34" fontSize="12" fontFamily="monospace" fill="#00E5A0" fontWeight="700">GET /users/torvalds HTTP/1.1</text>
        </motion.g>

        {/* Request headers */}
        {reqHeaders.map((h, i) => (
          <motion.text key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.1 }}
            x="22" y={62 + i * 20} fontSize="11" fontFamily="monospace" fill="#6B7280">
            {h}
          </motion.text>
        ))}

        {/* Right panel — Response */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <rect x="354" y="12" width="314" height="185" rx="8" fill="#141420" stroke="#4D9FFF30" strokeWidth="1.5" />
          {/* Header bar */}
          <rect x="354" y="12" width="314" height="34" rx="8" fill="#4D9FFF20" />
          <rect x="354" y="34" width="314" height="12" fill="#4D9FFF20" />
          <text x="364" y="34" fontSize="12" fontFamily="monospace" fill="#4D9FFF" fontWeight="700">HTTP/1.1 200 OK</text>
        </motion.g>

        {resHeaders.map((h, i) => (
          <motion.text key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.1 }}
            x="364" y={62 + i * 20} fontSize="11" fontFamily="monospace" fill="#6B7280">
            {h}
          </motion.text>
        ))}

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <line x1="354" y1="148" x2="668" y2="148" stroke="#1A1A2E" strokeWidth="1" />
          <text x="364" y="164" fontSize="11" fontFamily="monospace" fill="#FFB340">{'{  "login": "torvalds", "id": 1024… }'}</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          x="340" y="214" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          HTTP/2 multiplexes streams; HTTP/3 uses QUIC (UDP) — eliminates HoL blocking entirely
        </motion.text>
      </svg>
    </div>
  )
}
