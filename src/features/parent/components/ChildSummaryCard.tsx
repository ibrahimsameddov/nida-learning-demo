// @ts-nocheck
import { motion } from 'framer-motion'

const SPRING = { type: 'spring', stiffness: 220, damping: 22 }

function trendArrow(pct: number) {
  if (pct > 5)  return { icon: '↑', color: 'var(--success)', label: 'İrəliləyiş var' }
  if (pct < -5) return { icon: '↓', color: 'var(--danger)',  label: 'Geridə qalır'   }
  return               { icon: '→', color: 'var(--warning)', label: 'Sabit'           }
}

function streakLabel(days: number): string {
  if (days === 0) return 'Bu həftə girmədi'
  if (days === 1) return 'Dünən aktiv idi'
  if (days <= 3)  return `${days} günlük seriya`
  return `${days} günlük seriya 🔥`
}

interface Props {
  child: any
  onPress?: () => void
}

export default function ChildSummaryCard({ child, onPress }: Props) {
  const stats = child.stats ?? {}
  const avg   = stats.averagePercent ?? 0
  const trend = trendArrow(0)
  const streak = stats.currentStreak ?? 0
  const tests  = stats.totalTests ?? 0

  const performanceLabel = avg >= 80 ? 'Əla nəticə' : avg >= 65 ? 'Yaxşı gedir' : avg >= 50 ? 'Orta səviyyə' : 'Diqqət tələb edir'
  const performanceColor = avg >= 80 ? 'var(--success)' : avg >= 65 ? 'var(--primary)' : avg >= 50 ? 'var(--warning)' : 'var(--danger)'

  const initial = (child.fullName ?? child.name ?? '?').charAt(0).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      onClick={onPress}
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-card)',
        borderRadius: 18, padding: '18px 16px',
        cursor: onPress ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Shimmer top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--shimmer-line)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 900, color: '#1a1200', fontFamily: 'var(--font-heading)',
        }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
            {child.fullName ?? child.name ?? 'Şagird'}
          </p>
          <p style={{ fontSize: 11, color: performanceColor, fontWeight: 700, marginTop: 2 }}>
            {performanceLabel}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: performanceColor, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
            {avg}%
          </p>
          <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            ORTALAMA
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress" style={{ height: 5, marginBottom: 14 }}>
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${avg}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ background: performanceColor }}
        />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 6 }}>
        <StatPill label="Test" value={`${tests}`} color="var(--primary)" />
        <StatPill label="Seriya" value={streakLabel(streak)} color={streak >= 3 ? 'var(--warning)' : 'var(--text-3)'} />
        <StatPill label="Trend" value={trend.label} color={trend.color} />
      </div>

      {/* Subject breakdown */}
      {(stats.subjectStats ?? []).length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fənn üzrə
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(stats.subjectStats ?? []).slice(0, 3).map((s: any) => (
              <div key={s.subject} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', width: 90, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.subject}
                </span>
                <div className="progress" style={{ flex: 1, height: 4 }}>
                  <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.averagePercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                    style={{ background: s.averagePercent >= 75 ? 'var(--success)' : s.averagePercent >= 55 ? 'var(--warning)' : 'var(--danger)' }}
                  />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, width: 32, textAlign: 'right', flexShrink: 0,
                  color: s.averagePercent >= 75 ? 'var(--success)' : s.averagePercent >= 55 ? 'var(--warning)' : 'var(--danger)',
                  fontFamily: 'var(--font-mono)' }}>
                  {s.averagePercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center',
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
    }}>
      <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 10, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</p>
    </div>
  )
}
