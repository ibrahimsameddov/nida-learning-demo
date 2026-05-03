import { useState, useEffect } from 'react'
import { useNavigate }        from 'react-router-dom'
import { apiGetMyStatistics } from '@/lib/api'

const ALL_SUBJECTS = [
  { id: 'RIYAZIYYAT',      label: 'Riyaziyyat',      icon: '📐' },
  { id: 'AZERBAYCAN_DILI', label: 'Azərbaycan dili',  icon: '📖' },
  { id: 'INGILIS_DILI',    label: 'İngilis dili',      icon: '🌍' },
  { id: 'FIZIKA',          label: 'Fizika',            icon: '⚡' },
  { id: 'KIMYA',           label: 'Kimya',             icon: '🧪' },
  { id: 'BIOLOGIYA',       label: 'Biologiya',         icon: '🌿' },
  { id: 'TARIX',           label: 'Tarix',             icon: '🏛️' },
  { id: 'COGRAFIYA',       label: 'Coğrafiya',         icon: '🌏' },
]

function colorForPct(pct: number) {
  if (pct >= 75) return 'var(--success)'
  if (pct >= 55) return 'var(--warning)'
  return 'var(--danger)'
}

export default function Subjects() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    apiGetMyStatistics().then(setStats).catch(() => {})
  }, [])

  const subjectMap: Record<string, number> = {}
  ;(stats?.subjectStats ?? []).forEach((s: any) => {
    subjectMap[s.subject] = Math.round(s.averagePercent ?? 0)
  })

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        Fənlər
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
        Fənni seç, test başla
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ALL_SUBJECTS.map((s, i) => {
          const pct = subjectMap[s.label] ?? 0
          return (
            <div
              key={s.id}
              className={`subject-card anim-fade-up d${Math.min(i + 1, 5)}`}
              onClick={() => s.id === 'RIYAZIYYAT' ? navigate('/subjects/math') : navigate(`/quiz/${s.id.toLowerCase()}-session`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="subject-icon">{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{s.label}</span>
                  {pct > 0 && (
                    <span className="font-mono" style={{ fontSize: 12, color: colorForPct(pct), fontWeight: 700 }}>{pct}%</span>
                  )}
                </div>
                {pct > 0 ? (
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${pct}%`, background: colorForPct(pct) }} />
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Hələ test edilməyib</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
