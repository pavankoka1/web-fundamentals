'use client'
import { motion } from 'framer-motion'

export default function SwDiagram() {
  const states = [
    { label: 'register', color: '#6B7280' },
    { label: 'installing', color: '#FFB340' },
    { label: 'waiting', color: '#4D9FFF' },
    { label: 'activating', color: '#00D4FF' },
    { label: 'active', color: '#00E5A0' },
  ]

  const codeLines = [
    { text: "self.addEventListener('fetch', e => {", color: '#F0F0FF' },
    { text: "  e.respondWith(", color: '#F0F0FF' },
    { text: "    caches.match(e.request).then(cached => {", color: '#4D9FFF' },
    { text: "      if (cached) return cached;          // cache hit", color: '#00E5A0' },
    { text: "      return fetch(e.request).then(res => {", color: '#FFB340' },
    { text: "        cache.put(e.request, res.clone());", color: '#FFB340' },
    { text: "        return res;", color: '#FFB340' },
    { text: "      });", color: '#F0F0FF' },
    { text: "    })", color: '#F0F0FF' },
    { text: "  );", color: '#F0F0FF' },
    { text: "});", color: '#F0F0FF' },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-sw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Title */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
          x="340" y="18" textAnchor="middle" fontSize="12" fontFamily="sans-serif" fill="#6B7280">
          Service Worker Lifecycle
        </motion.text>

        {/* State boxes */}
        {states.map((state, i) => {
          const x = 14 + i * 132
          return (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.1 }}>
              <rect x={x} y="28" width="118" height="36" rx="8" fill="#141420" stroke={`${state.color}70`} strokeWidth="1.5" />
              <text x={x + 59} y="51" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
                fill={state.color} fontWeight="700">{state.label}</text>
            </motion.g>
          )
        })}

        {/* Arrows between states */}
        {[0, 1, 2, 3].map((i) => (
          <motion.line key={`arr-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
            x1={14 + i * 132 + 118} y1="46" x2={14 + (i + 1) * 132} y2="46"
            stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-sw)" />
        ))}

        {/* Fetch intercept code box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <rect x="14" y="80" width="652" height="134" rx="8" fill="#141420" stroke="#4D9FFF30" strokeWidth="1.5" />
          <text x="24" y="98" fontSize="10" fontFamily="sans-serif" fill="#4D9FFF" fontWeight="700">Fetch Intercept — Cache-First Strategy</text>
          <line x1="14" y1="104" x2="666" y2="104" stroke="#1A1A2E" strokeWidth="1" />
        </motion.g>

        {/* Code lines */}
        {codeLines.map((line, i) => (
          <motion.text key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.04 }}
            x="24" y={118 + i * 12} fontSize="9.5" fontFamily="monospace" fill={line.color}>
            {line.text}
          </motion.text>
        ))}

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          x="340" y="222" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          skipWaiting() + clients.claim() activates immediately. postMessage() bridges page ↔ worker.
        </motion.text>
      </svg>
    </div>
  )
}
