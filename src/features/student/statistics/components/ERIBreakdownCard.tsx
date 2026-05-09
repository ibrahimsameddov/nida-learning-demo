import { motion } from 'framer-motion'
import { useERI } from '@/hooks/useAnalytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

interface WeightRow { label: string; score: number; weight: string; color: string }

function ComponentRow({ row, delay }: { row: WeightRow; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, ...SPRING }}
      style={{ marginBottom: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{row.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{row.weight}</span>
          <span style={{ fontSize: 12, color: row.color, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{row.score}</span>
        </div>
      </div>
      <div className="progress" style={{ height: 5 }}>
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${row.score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: delay + 0.1 }}
          style={{ background: row.color, boxShadow: `0 0 6px ${row.color}40` }}
        />
      </div>
    </motion.div>
  )
}

export default function ERIBreakdownCard() {
  const { eri, breakdown, isLoading } = useERI()

  if (isLoading || !breakdown) return null

  const rows: WeightRow[] = [
    { label: 'Ümumi Ortalama',    score: breakdown.avgScore,      weight: '30%', color: 'var(--primary)' },
    { label: '7 Günlük Trend',    score: breakdown.trendScore,    weight: '25%', color: 'var(--accent)' },
    { label: 'Fənn Balansı',      score: breakdown.balanceScore,  weight: '20%', color: '#4FC3F7' },
    { label: 'Öyrənmə Sürəti',    score: breakdown.velocityScore, weight: '15%', color: 'var(--success)' },
    { label: 'Streak',            score: breakdown.streakScore,   weight: '10%', color: 'var(--warning)' },
  ]

  const subjectEntries = Object.entries(breakdown.bySubject)

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 18 }}>ERI Komponentləri</p>

      {rows.map((row, i) => (
        <ComponentRow key={row.label} row={row} delay={i * 0.05} />
      ))}

      {subjectEntries.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Fənn üzrə ERI
          </p>
          {subjectEntries.map(([subject, score], i) => (
            <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject}</span>
              <div style={{ width: 80 }}>
                <div className="progress" style={{ height: 4 }}>
                  <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.04 }}
                    style={{ background: score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)' }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-1)', width: 28, textAlign: 'right' }}>{score}</span>
            </div>
          ))}
        </>
      )}
    </motion.div>
  )
}
