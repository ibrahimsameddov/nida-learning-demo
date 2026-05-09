import { motion } from 'framer-motion'
import { useLearningProfile } from '@/hooks/useAnalytics'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS  = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

// Optimal study windows — heuristic
const PEAK_HOURS = [8, 9, 10, 15, 16, 17, 18]

function hourActivity(h: number, optimalHour: number): number {
  if (h === optimalHour) return 1
  const dist = Math.min(Math.abs(h - optimalHour), 24 - Math.abs(h - optimalHour))
  return Math.max(0, 1 - dist * 0.2)
}

function hourColor(activity: number): string {
  if (activity >= 0.8) return 'var(--primary)'
  if (activity >= 0.5) return 'color-mix(in srgb, var(--primary) 50%, rgba(255,255,255,0.06))'
  if (activity >= 0.2) return 'rgba(201,168,76,0.15)'
  return 'rgba(255,255,255,0.04)'
}

export default function LearningProfileCard() {
  const { profile, isLoading } = useLearningProfile()

  if (isLoading) return null

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
      <p className="card-title" style={{ marginBottom: 16 }}>Öyrənmə Profili</p>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <MetricBox
          icon="🕐"
          label="Optimal vaxt"
          value={`${profile.optimalHour}:00`}
          sub="Ən yaxşı performans"
          color="var(--primary)"
        />
        <MetricBox
          icon="⏱"
          label="Sessiya uzunluğu"
          value={`${profile.optimalSessionMins} dəq`}
          sub="Optimal diqqət"
          color="var(--accent)"
        />
        <MetricBox
          icon="⚡"
          label="Öyrənmə sürəti"
          value={`${profile.learningVelocity} s/s`}
          sub="Sual/saat"
          color="var(--success)"
        />
        <MetricBox
          icon="🎯"
          label="Üstünlük"
          value={profile.preferredDifficulty === 'easy' ? 'Asan' : profile.preferredDifficulty === 'hard' ? 'Çətin' : 'Orta'}
          sub="Çətinlik səviyyəsi"
          color="var(--warning)"
        />
      </div>

      {/* Hourly heatmap (24 cells) */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Günlük aktivlik profili
        </p>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
          {HOURS.map(h => {
            const act = hourActivity(h, profile.optimalHour)
            const isOptimal = h === profile.optimalHour
            return (
              <div key={h} title={`${h}:00`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: h * 0.02, duration: 0.4, ease: 'easeOut' }}
                  style={{
                    width: '100%', height: 24 + act * 12,
                    borderRadius: 2,
                    background: isOptimal ? 'var(--primary)' : hourColor(act),
                    boxShadow: isOptimal ? '0 0 8px var(--primary)60' : 'none',
                    transformOrigin: 'bottom',
                  }}
                />
                {h % 6 === 0 && (
                  <span style={{ fontSize: 7, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{h}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Best day */}
      <div>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Həftə içi aktivlik
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          {DAYS.map((day, i) => {
            const isBest = i === profile.bestDayOfWeek
            return (
              <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.04, ...{ type: 'spring', stiffness: 260, damping: 20 } }}
                  style={{
                    width: '100%', aspectRatio: '1',
                    borderRadius: 6, marginBottom: 3,
                    background: isBest ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: isBest ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
                    boxShadow: isBest ? '0 0 8px var(--glow-sm)' : 'none',
                  }}
                />
                <span style={{ fontSize: 8, color: isBest ? 'var(--primary)' : 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

function MetricBox({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string; color: string
}) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: `color-mix(in srgb, ${color} 6%, rgba(255,255,255,0.02))`,
      border: `0.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <p style={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{sub}</p>
    </div>
  )
}
