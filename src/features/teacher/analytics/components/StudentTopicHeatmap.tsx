// @ts-nocheck
import { motion } from 'framer-motion'

const STUDENT_NAMES = ['Əli H.', 'Nigar M.', 'Rauf C.', 'Leyla S.', 'Fərid A.', 'Günel T.', 'Murad K.']
const SUBJECTS      = ['Riyaz.', 'Fizika', 'Kimya', 'Bio.', 'Tarix', 'Coğraf.']

function lcg(s: number) {
  return (((1664525 * (s >>> 0) + 1013904223) >>> 0) / 4294967296)
}

function scoreFor(si: number, ti: number, gSeed: number): number {
  const s = (si * 17 + ti * 11 + gSeed * 5 + 3) >>> 0
  return Math.round(32 + lcg(s) * 56)
}

function cellStyle(score: number) {
  if (score >= 70) return { bg: 'rgba(52,199,89,0.16)',  fg: '#34C759', border: 'rgba(52,199,89,0.32)' }
  if (score >= 50) return { bg: 'rgba(255,159,10,0.16)', fg: '#FF9F0A', border: 'rgba(255,159,10,0.32)' }
  return               { bg: 'rgba(255,69,58,0.16)',   fg: '#FF453A', border: 'rgba(255,69,58,0.32)' }
}

interface Props {
  groups:        any[]
  activeGroupId: string
  onGroupChange: (id: string) => void
}

export default function StudentTopicHeatmap({ groups = [], activeGroupId, onGroupChange }: Props) {
  const gSeed = Math.max(groups.findIndex(g => g.id === activeGroupId), 0) + 1

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
            Şagird × Mövzu
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Kim harada zəifdir — bir baxışda</p>
        </div>
        {groups.length > 1 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => onGroupChange(g.id)}
                style={{
                  padding: '4px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  background: g.id === activeGroupId ? 'var(--bg-active)' : 'transparent',
                  border: g.id === activeGroupId ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
                  color: g.id === activeGroupId ? 'var(--primary)' : 'var(--text-3)',
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: '3px 3px', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'left', paddingRight: 10, fontWeight: 600, paddingBottom: 4 }}>
                Şagird
              </th>
              {SUBJECTS.map(s => (
                <th key={s} style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center', fontWeight: 600, padding: '0 1px 4px', whiteSpace: 'nowrap' }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUDENT_NAMES.map((student, si) => (
              <tr key={student}>
                <td style={{ fontSize: 11, color: 'var(--text-2)', paddingRight: 10, whiteSpace: 'nowrap', fontWeight: 600, paddingTop: 2, paddingBottom: 2 }}>
                  {student}
                </td>
                {SUBJECTS.map((_, ti) => {
                  const score = scoreFor(si, ti, gSeed)
                  const { bg, fg, border } = cellStyle(score)
                  return (
                    <td key={ti} style={{ padding: '1px' }}>
                      <motion.div
                        whileHover={{ scale: 1.18, zIndex: 10 }}
                        title={`${student} — ${SUBJECTS[ti]}: ${score}%`}
                        style={{
                          width: 34, height: 26, borderRadius: 7,
                          background: bg, border: `1px solid ${border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800, color: fg,
                          fontFamily: 'var(--font-mono)', cursor: 'default', position: 'relative',
                        }}
                      >
                        {score}
                      </motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, paddingTop: 4, borderTop: '0.5px solid var(--border)' }}>
        {[
          { label: '70+ Yaxşı', color: '#34C759' },
          { label: '50–69 Orta', color: '#FF9F0A' },
          { label: '<50 Zəif', color: '#FF453A' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: `${l.color}28`, border: `1px solid ${l.color}55` }} />
            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
