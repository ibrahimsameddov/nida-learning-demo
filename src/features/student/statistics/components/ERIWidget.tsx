import { motion } from 'framer-motion'
import ERIGauge from './ERIGauge'
import { useERI } from '@/hooks/useAnalytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')   return <span style={{ color: 'var(--success)', fontSize: 13 }}>▲</span>
  if (trend === 'down') return <span style={{ color: 'var(--danger)',  fontSize: 13 }}>▼</span>
  return <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>
}

export default function ERIWidget() {
  const { eri, breakdown, history, trend, isLoading } = useERI()

  if (isLoading) {
    return (
      <div className="card" style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Yüklənir...</span>
      </div>
    )
  }

  const lastHistory = history.slice(-7)
  const maxH        = Math.max(...lastHistory.map(h => h.score), 1)

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      style={{ padding: '20px 20px 16px', overflow: 'hidden', position: 'relative' }}
    >
      {/* Shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'var(--shimmer-line)',
      }} />

      {/* Title */}
      <p className="card-title" style={{ marginBottom: 16 }}>İmtahana Hazırlıq İndeksi</p>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Gauge */}
        <ERIGauge score={eri} size={150} />

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 140 }}>
          {/* Trend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid var(--border)',
          }}>
            <TrendArrow trend={trend} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>
                {trend === 'up' ? 'Yüksəliş trendi' : trend === 'down' ? 'Aşağı trend' : 'Sabit'}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
                Son {lastHistory.length} gün
              </p>
            </div>
          </div>

          {/* Subject highlights */}
          {breakdown && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {breakdown.weakestArea && breakdown.weakestArea !== '—' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>⚠️</span>
                  <span style={{ fontSize: 11, color: 'var(--warning)' }}>Zəif: {breakdown.weakestArea}</span>
                </div>
              )}
              {breakdown.strongestArea && breakdown.strongestArea !== '—' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>✦</span>
                  <span style={{ fontSize: 11, color: 'var(--success)' }}>Güclü: {breakdown.strongestArea}</span>
                </div>
              )}
            </div>
          )}

          {/* Mini sparkline */}
          {lastHistory.length >= 3 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                ERI tarixi
              </p>
              <svg width="100%" height="36" viewBox={`0 0 ${lastHistory.length * 14} 36`} preserveAspectRatio="none">
                {lastHistory.map((h, i) => {
                  const x = i * 14 + 7
                  const y = 30 - (h.score / maxH) * 26
                  return (
                    <g key={i}>
                      {i > 0 && (
                        <line
                          x1={(i - 1) * 14 + 7} y1={30 - (lastHistory[i - 1].score / maxH) * 26}
                          x2={x} y2={y}
                          stroke="var(--primary)" strokeWidth="1.5" opacity="0.7"
                        />
                      )}
                      <circle cx={x} cy={y} r="2.5"
                        fill={i === lastHistory.length - 1 ? 'var(--primary)' : 'rgba(201,168,76,0.4)'} />
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
