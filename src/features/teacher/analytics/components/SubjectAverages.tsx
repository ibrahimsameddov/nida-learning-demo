// @ts-nocheck
import { motion } from 'framer-motion'

const SUBJECTS = [
  { name: 'Riyaziyyat',   icon: '📐', avg: 62, trend: +4  },
  { name: 'Azərb. dili', icon: '📖', avg: 75, trend: +2  },
  { name: 'Fizika',       icon: '⚡', avg: 48, trend: -6  },
  { name: 'Kimya',        icon: '🧪', avg: 55, trend: +1  },
  { name: 'Biologiya',    icon: '🌿', avg: 71, trend: +8  },
  { name: 'Tarix',        icon: '🏛️', avg: 67, trend: -2  },
]

function barColor(avg: number) {
  if (avg >= 70) return '#34C759'
  if (avg >= 50) return '#FF9F0A'
  return '#FF453A'
}

export default function SubjectAverages() {
  return (
    <div className="card">
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
          Fənn Ortalaması
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Hər fənn üzrə qrup statistikası</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {SUBJECTS.map((s, i) => {
          const color = barColor(s.avg)
          return (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                    background: s.trend > 0 ? 'rgba(52,199,89,0.12)' : 'rgba(255,69,58,0.12)',
                    color:      s.trend > 0 ? '#34C759'               : '#FF453A',
                  }}>
                    {s.trend > 0 ? '↑' : '↓'} {Math.abs(s.trend)}%
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-mono)', minWidth: 32, textAlign: 'right' }}>
                    {s.avg}%
                  </span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 5, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.avg}%` }}
                  transition={{ delay: 0.07 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 5, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
