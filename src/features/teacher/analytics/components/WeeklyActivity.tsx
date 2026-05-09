// @ts-nocheck
import { motion } from 'framer-motion'

const DAYS = ['B.E.', 'Ç.A.', 'Çər.', 'C.A.', 'Cüm.', 'Şnb.', 'Bazar']

function lcg(s: number) {
  return (((1664525 * (s >>> 0) + 1013904223) >>> 0) / 4294967296)
}

export default function WeeklyActivity() {
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 3600 * 1000))

  const counts = DAYS.map((_, i) => {
    if (i > todayIdx) return 0
    return Math.round(8 + lcg(weekSeed * 7 + i) * 38)
  })
  const total  = counts.reduce((a, b) => a + b, 0)
  const maxVal = Math.max(...counts, 1)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
            Həftəlik Aktivlik
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Bu həftə test sayı</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
          Σ {total}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 100 }}>
        {DAYS.map((day, i) => {
          const count   = counts[i]
          const isToday = i === todayIdx
          const isFuture = i > todayIdx
          const barH = isFuture ? 0 : Math.max(4, Math.round((count / maxVal) * 72))

          return (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{
                fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: isToday ? 800 : 500,
                color: isToday ? 'var(--primary)' : isFuture ? 'var(--border)' : 'var(--text-2)',
              }}>
                {isFuture ? '·' : count}
              </span>
              <div style={{ width: '100%', height: 72, display: 'flex', alignItems: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barH }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: 'easeOut' }}
                  style={{
                    width: '100%', borderRadius: '5px 5px 3px 3px',
                    background: isToday
                      ? 'linear-gradient(180deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 55%, transparent) 100%)'
                      : isFuture
                      ? 'var(--bg-hover)'
                      : 'rgba(79,135,255,0.28)',
                    boxShadow: isToday ? '0 0 10px var(--glow-sm)' : 'none',
                  }}
                />
              </div>
              <span style={{
                fontSize: 9, fontWeight: isToday ? 800 : 500,
                color: isToday ? 'var(--primary)' : 'var(--text-3)',
              }}>
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
