'use client'
import { motion } from 'framer-motion'

export default function EventLoopDiagram() {
  const columns = [
    {
      title: 'Macrotask\nQueue',
      color: '#6B7280',
      x: 12,
      items: ['setTimeout cb', 'setInterval cb', 'I/O callback', 'UI events'],
    },
    {
      title: 'Microtask\nQueue',
      color: '#4D9FFF',
      x: 182,
      items: ['Promise.then', 'queueMicrotask', 'MutationObserver', 'await continuations'],
      note: 'ALL drain\nbefore render!',
    },
    {
      title: 'rAF\nCallbacks',
      color: '#FFB340',
      x: 352,
      items: ['animation frame', 'scroll handler', 'resize handler'],
    },
    {
      title: 'Render\n(Browser)',
      color: '#00E5A0',
      x: 522,
      items: ['Style recalc', 'Layout', 'Paint', 'Composite'],
      note: '~16ms\nbudget',
    },
  ]

  return (
    <div style={{ border: '1px solid #1A1A2E', borderRadius: 12, background: '#0F0F1A', padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-el" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {columns.map((col, i) => (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.15 }}>
            <rect x={col.x} y="12" width="158" height="172" rx="8" fill="#141420"
              stroke={`${col.color}50`} strokeWidth="1.5" />
            {/* Title */}
            {col.title.split('\n').map((line, li) => (
              <text key={li} x={col.x + 79} y={36 + li * 16} textAnchor="middle"
                fontSize="12" fontFamily="sans-serif" fill={col.color} fontWeight="700">
                {line}
              </text>
            ))}
            <line x1={col.x + 10} y1="68" x2={col.x + 148} y2="68" stroke="#1A1A2E" strokeWidth="1" />
            {/* Items */}
            {col.items.map((item, j) => (
              <text key={j} x={col.x + 12} y={84 + j * 18} fontSize="10" fontFamily="monospace" fill="#6B7280">
                • {item}
              </text>
            ))}
            {/* Note badge */}
            {col.note && (
              <g>
                <rect x={col.x + 8} y="152" width="142" height="28" rx="4"
                  fill={`${col.color}20`} stroke={col.color} strokeWidth="1" />
                {col.note.split('\n').map((line, li) => (
                  <text key={li} x={col.x + 79} y={165 + li * 14} textAnchor="middle"
                    fontSize="9" fontFamily="sans-serif" fill={col.color} fontWeight="700">
                    {line}
                  </text>
                ))}
              </g>
            )}
          </motion.g>
        ))}

        {/* Order arrows */}
        {[0, 1, 2].map((i) => (
          <motion.g key={`arr-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + i * 0.1 }}>
            <line x1={columns[i].x + 158} y1="98" x2={columns[i + 1].x} y2="98"
              stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-el)" />
            <text x={columns[i].x + 164} y="93" fontSize="9" fontFamily="sans-serif" fill="#6B7280">
              {i + 1}
            </text>
          </motion.g>
        ))}

        {/* Note at bottom */}
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          x="340" y="200" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#6B7280">
          One macrotask per loop tick. Microtasks exhaust before yielding. Long tasks block the render phase.
        </motion.text>
      </svg>
    </div>
  )
}
