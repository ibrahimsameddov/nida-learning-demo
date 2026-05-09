import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCohortData } from '@/hooks/useAnalytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

export default function CohortChart() {
  const { percentile, cityRank, gradeRank, groupRank, cohort, isLoading } = useCohortData()

  // Build bell-curve histogram (20 bins, 0-100)
  const bins = useMemo(() => {
    const b = Array(20).fill(0)
    cohort.forEach(s => { b[Math.min(19, Math.floor(s / 5))]++ })
    return b
  }, [cohort])

  const maxBin  = Math.max(...bins, 1)
  const W = 300, H = 80

  if (isLoading) return null

  const userBin = Math.min(19, Math.floor(percentile / 5))

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 16 }}>Reytinq Mövqeyi</p>

      {/* Rank pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <RankPill icon="🏙️" label="Şəhər" rank={cityRank}  total={cohort.length} />
        <RankPill icon="📚" label="Sinif" rank={gradeRank} total={Math.round(cohort.length * 0.4)} />
        <RankPill icon="👥" label="Qrup"  rank={groupRank} total={Math.round(cohort.length * 0.08)} />
      </div>

      {/* Percentile hero */}
      <div style={{
        textAlign: 'center', marginBottom: 16, padding: '14px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
      }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, ...SPRING }}
          style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-heading)', color: percentileColor(percentile), lineHeight: 1, marginBottom: 4 }}
        >
          Top {100 - percentile}%
        </motion.div>
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          {cohort.length} şagird arasında {percentile}-ci persentil
        </p>
      </div>

      {/* Distribution histogram */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Bal paylama (anonimləşdirilmiş)
        </p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          {bins.map((count, i) => {
            const barW  = W / bins.length - 2
            const barH  = (count / maxBin) * (H - 8)
            const x     = i * (W / bins.length) + 1
            const y     = H - barH
            const isUser = i === userBin
            return (
              <motion.rect
                key={i}
                x={x} y={y} width={barW} height={barH}
                rx={2}
                fill={isUser ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}
                style={{ filter: isUser ? 'drop-shadow(0 0 6px var(--primary))' : 'none' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.02, duration: 0.5, ease: 'easeOut' }}
                transform={`scale(1 1) translate(0 0)`}
              />
            )
          })}
          {/* User marker line */}
          <line
            x1={userBin * (W / bins.length) + (W / bins.length) / 2}
            y1={0}
            x2={userBin * (W / bins.length) + (W / bins.length) / 2}
            y2={H}
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            opacity="0.8"
          />
        </svg>

        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {[0, 25, 50, 75, 100].map(v => (
            <span key={v} style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <LegendDot color="var(--primary)" label="Sənin mövqeyin" />
        <LegendDot color="rgba(255,255,255,0.1)" label="Digər şagirdlər" />
      </div>
    </motion.div>
  )
}

function percentileColor(p: number): string {
  if (p >= 80) return 'var(--success)'
  if (p >= 60) return 'var(--primary)'
  if (p >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

function RankPill({ icon, label, rank, total }: { icon: string; label: string; rank: number; total: number }) {
  return (
    <div style={{
      flex: 1, minWidth: 80, padding: '8px 10px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, marginBottom: 2 }}>{icon}</p>
      <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>#{rank}</p>
      <p style={{ fontSize: 9, color: 'var(--text-3)' }}>{total} arasında</p>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</span>
    </div>
  )
}
