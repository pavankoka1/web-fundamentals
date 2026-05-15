'use client'
import { motion } from 'framer-motion'

export default function CompositingDiagram() {
  const layers = [
    {
      label: '<video> element',
      sublabel: 'GPU decode — never repaints',
      color: '#6B7280',
      y: 28,
      badge: 'GPU composite only',
      badgeColor: '#00E5A0',
    },
    {
      label: 'Sidebar (transform: translateX)',
      sublabel: 'Promoted — own compositing layer',
      color: '#4D9FFF',
      y: 88,
      badge: 'GPU composite only',
      badgeColor: '#00E5A0',
    },
    {
      label: 'Page root layer',
      sublabel: 'Main content — repaints on change',
      color: '#00E5A0',
      y: 148,
      badge: 'repaints on change',
      badgeColor: '#FFB340',
    },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg">

        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
          x="340" y="18" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#6B7280">
          GPU Compositing Layers (z-order, top → bottom)
        </motion.text>

        {layers.map((layer, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.2 }}>
            <rect x="16" y={layer.y} width="560" height="50" rx="8"
              fill="#141420" stroke={`${layer.color}60`} strokeWidth="1.5" />
            {/* Layer label */}
            <text x="30" y={layer.y + 20} fontSize="13" fontFamily="monospace" fill={layer.color} fontWeight="600">
              {layer.label}
            </text>
            <text x="30" y={layer.y + 38} fontSize="10" fontFamily="sans-serif" fill="#6B7280">
              {layer.sublabel}
            </text>
            {/* Badge */}
            <rect x="462" y={layer.y + 12} width="100" height="22" rx="4"
              fill={`${layer.badgeColor}20`} stroke={layer.badgeColor} strokeWidth="1" />
            <text x="512" y={layer.y + 27} textAnchor="middle" fontSize="9" fontFamily="sans-serif"
              fill={layer.badgeColor} fontWeight="700">
              {layer.badge}
            </text>
          </motion.g>
        ))}

        {/* z-level indicator */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <line x1="596" y1="28" x2="596" y2="198" stroke="#1A1A2E" strokeWidth="1.5" />
          <text x="612" y="38" fontSize="10" fontFamily="sans-serif" fill="#6B7280">z: top</text>
          <text x="612" y="198" fontSize="10" fontFamily="sans-serif" fill="#6B7280">z: 0</text>
          <text x="630" y="118" fontSize="10" fontFamily="sans-serif" fill="#6B7280" transform="rotate(-90, 630, 118)">z-order</text>
        </motion.g>

        {/* Note */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          x="340" y="204" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          Memory cost: ~4 bytes × w × h per layer. will-change: transform promotes to own layer.
        </motion.text>
      </svg>
    </div>
  )
}
