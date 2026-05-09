import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSpacedRepetition } from '@/hooks/useAnalytics'
import { generateForgettingPoints } from '@/lib/analytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }
const W = 300, H = 120

export default function ForgettingCurve() {
  const { items } = useSpacedRepetition()
  const [selected, setSelected] = useState<string | null>(null)

  const topItems = items.slice(0, 8)
  const activeItem = topItems.find(i => i.topicId === selected) ?? topItems[0]

  if (!activeItem) {
    return (
      <div className="card" style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Məlumat yoxdur</p>
      </div>
    )
  }

  const stability = Math.max(1, (activeItem.retentionRate / 100) * 14)
  const points    = generateForgettingPoints(activeItem.lastStudied, stability, 28)

  const todayIdx  = Math.round((Date.now() - activeItem.lastStudied) / 86_400_000)
  const todayPt   = points[Math.min(todayIdx, points.length - 1)]

  // SVG path
  const pathData = points.map((p, i) => {
    const x = (i / (points.length - 1)) * W
    const y = H - (p.retention / 100) * (H - 10) - 2
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Area fill
  const areaData = pathData + ` L ${W} ${H + 2} L 0 ${H + 2} Z`

  // Next review marker
  const reviewIdx = Math.round((activeItem.nextReview - activeItem.lastStudied) / 86_400_000)
  const reviewX   = Math.min(1, reviewIdx / (points.length - 1)) * W
  const reviewPt  = points[Math.min(reviewIdx, points.length - 1)]
  const reviewY   = reviewPt ? H - (reviewPt.retention / 100) * (H - 10) - 2 : H / 2

  // Today marker
  const todayX = Math.min(1, todayIdx / (points.length - 1)) * W
  const todayY = todayPt ? H - (todayPt.retention / 100) * (H - 10) - 2 : H / 2

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p className="card-title">Unutma Əyrisi</p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Ebbinghaus modeli</p>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 900, color: activeItem.retentionRate >= 60 ? 'var(--primary)' : 'var(--danger)',
          fontFamily: 'var(--font-heading)',
        }}>
          {activeItem.retentionRate}% saxlanılır
        </div>
      </div>

      {/* Topic selector */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        {topItems.map(item => (
          <button
            key={item.topicId}
            onClick={() => setSelected(item.topicId)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
              background: (selected ?? topItems[0]?.topicId) === item.topicId ? 'var(--bg-active)' : 'rgba(255,255,255,0.04)',
              border: `0.5px solid ${(selected ?? topItems[0]?.topicId) === item.topicId ? 'var(--border-focus)' : 'var(--border)'}`,
              color: (selected ?? topItems[0]?.topicId) === item.topicId ? 'var(--primary)' : 'var(--text-2)',
              cursor: 'pointer',
            }}
          >
            {item.topicName.slice(0, 16)}{item.topicName.length > 16 ? '…' : ''}
          </button>
        ))}
      </div>

      {/* Chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis guidelines */}
        {[25, 50, 75].map(v => {
          const y = H - (v / 100) * (H - 10)
          return <line key={v} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
        })}

        {/* Area */}
        <path d={areaData} fill="url(#curve-fill)" />

        {/* Curve line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Today marker */}
        {todayIdx < points.length && (
          <g>
            <line x1={todayX} y1="0" x2={todayX} y2={H} stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" />
            <circle cx={todayX} cy={todayY} r="4" fill="var(--warning)" />
          </g>
        )}

        {/* Review marker */}
        {reviewIdx < points.length && reviewIdx > todayIdx && (
          <g>
            <line x1={reviewX} y1="0" x2={reviewX} y2={H} stroke="var(--success)" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" />
            <circle cx={reviewX} cy={reviewY} r="4" fill="var(--success)" />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <LegendDot color="var(--warning)" label="Bu gün" />
        <LegendDot color="var(--success)" label="Növbəti təkrar" />
      </div>
    </motion.div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</span>
    </div>
  )
}
