'use client'
import { motion } from 'framer-motion'

export default function TlsDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-tls-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#FFB340" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-tls-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4D9FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-tls-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <line x1="110" y1="44" x2="110" y2="190" stroke="#1A1A2E" strokeWidth="2" strokeDasharray="6,4" />
          <line x1="570" y1="44" x2="570" y2="190" stroke="#1A1A2E" strokeWidth="2" strokeDasharray="6,4" />
        </motion.g>

        {/* ClientHello */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <line x1="110" y1="72" x2="570" y2="100" stroke="#FFB340" strokeWidth="2" markerEnd="url(#arrow-tls-a)" />
          <rect x="240" y="58" width="200" height="24" rx="4" fill="#141420" />
          <text x="340" y="74" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#FFB340">ClientHello + key_share</text>
        </motion.g>

        {/* ServerHello+Cert+Finished */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <line x1="570" y1="112" x2="110" y2="148" stroke="#4D9FFF" strokeWidth="2" markerEnd="url(#arrow-tls-b)" />
          <rect x="220" y="110" width="240" height="36" rx="4" fill="#141420" />
          <text x="340" y="124" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#4D9FFF">ServerHello + Certificate</text>
          <text x="340" y="140" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#4D9FFF">+ CertVerify + Finished</text>
        </motion.g>

        {/* Client Finished */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <line x1="110" y1="160" x2="570" y2="188" stroke="#00E5A0" strokeWidth="2" markerEnd="url(#arrow-tls-g)" />
          <rect x="240" y="162" width="200" height="22" rx="4" fill="#141420" />
          <text x="340" y="177" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#00E5A0">Finished + HTTP data</text>
        </motion.g>

        {/* 1 RTT brace */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          <line x1="612" y1="72" x2="612" y2="190" stroke="#FFB340" strokeWidth="1.5" />
          <line x1="607" y1="72" x2="617" y2="72" stroke="#FFB340" strokeWidth="1.5" />
          <line x1="607" y1="190" x2="617" y2="190" stroke="#FFB340" strokeWidth="1.5" />
          <text x="645" y="135" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#FFB340">1 RTT</text>
        </motion.g>

        {/* Note */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          <text x="340" y="212" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
            TLS 1.3 — ECDHE key exchange provides forward secrecy. 0-RTT resumption available.
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
