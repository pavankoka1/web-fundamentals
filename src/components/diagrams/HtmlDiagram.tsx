'use client'
import { motion } from 'framer-motion'

export default function HtmlDiagram() {
  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-html" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#FFB340" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* HTML Source box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
          <rect x="12" y="20" width="188" height="168" rx="8" fill="#141420" stroke="#6B728050" strokeWidth="1.5" />
          <text x="106" y="42" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#6B7280" fontWeight="700">HTML Source</text>
          <text x="22" y="62" fontSize="10" fontFamily="monospace" fill="#4D9FFF">&lt;html&gt;</text>
          <text x="30" y="78" fontSize="10" fontFamily="monospace" fill="#4D9FFF">&lt;head&gt;</text>
          <text x="38" y="94" fontSize="10" fontFamily="monospace" fill="#6B7280">&lt;link rel="stylesheet"&gt;</text>
          <text x="30" y="110" fontSize="10" fontFamily="monospace" fill="#4D9FFF">&lt;/head&gt;</text>
          <text x="30" y="126" fontSize="10" fontFamily="monospace" fill="#4D9FFF">&lt;body&gt;</text>
          <text x="38" y="142" fontSize="10" fontFamily="monospace" fill="#6B7280">&lt;p&gt;Hello&lt;/p&gt;</text>
          <text x="38" y="158" fontSize="10" fontFamily="monospace" fill="#FF4D6D">&lt;script src="…"&gt;</text>
          <text x="30" y="174" fontSize="10" fontFamily="monospace" fill="#4D9FFF">&lt;/body&gt;</text>
        </motion.g>

        {/* BLOCKS badge */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <rect x="132" y="150" width="72" height="18" rx="4" fill="#FF4D6D30" stroke="#FF4D6D" strokeWidth="1" />
          <text x="168" y="163" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#FF4D6D" fontWeight="700">⏸ BLOCKS!</text>
        </motion.g>

        {/* Arrow to tokenizer */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <line x1="200" y1="104" x2="242" y2="104" stroke="#FFB340" strokeWidth="2" markerEnd="url(#arrow-html)" />
        </motion.g>

        {/* Tokenizer box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="244" y="68" width="144" height="72" rx="8" fill="#141420" stroke="#FFB34080" strokeWidth="1.5" />
          <text x="316" y="96" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#FFB340" fontWeight="700">Tokenizer</text>
          <text x="316" y="114" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">start tag · end tag</text>
          <text x="316" y="128" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">text · attribute</text>
        </motion.g>

        {/* Arrow to DOM tree */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <line x1="388" y1="104" x2="430" y2="104" stroke="#4D9FFF" strokeWidth="2" markerEnd="url(#arrow-html)" />
        </motion.g>

        {/* DOM tree box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <rect x="432" y="20" width="236" height="168" rx="8" fill="#141420" stroke="#4D9FFF80" strokeWidth="1.5" />
          <text x="550" y="42" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#4D9FFF" fontWeight="700">DOM Tree</text>
          <text x="454" y="62" fontSize="11" fontFamily="monospace" fill="#4D9FFF">Document</text>
          <text x="466" y="80" fontSize="11" fontFamily="monospace" fill="#4D9FFF">└── html</text>
          <text x="478" y="98" fontSize="11" fontFamily="monospace" fill="#4D9FFF">├── head</text>
          <text x="492" y="114" fontSize="11" fontFamily="monospace" fill="#6B7280">│   └── link</text>
          <text x="478" y="130" fontSize="11" fontFamily="monospace" fill="#4D9FFF">└── body</text>
          <text x="492" y="146" fontSize="11" fontFamily="monospace" fill="#6B7280">    ├── p</text>
          <text x="492" y="162" fontSize="11" fontFamily="monospace" fill="#FF4D6D">    └── script</text>
          <text x="492" y="178" fontSize="11" fontFamily="monospace" fill="#6B7280">        └── #text</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          x="340" y="208" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          Parser-blocking scripts stall tokenization until the script executes. Use async/defer to avoid.
        </motion.text>
      </svg>
    </div>
  )
}
