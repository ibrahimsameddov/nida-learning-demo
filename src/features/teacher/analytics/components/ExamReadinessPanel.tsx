// @ts-nocheck
import { motion } from 'framer-motion'
import { usePanels } from '../SlidePanel'
import { useExamReadiness } from '@/hooks/useTeacherAnalytics'
import StudentDetailPanel from './StudentDetailPanel'

function barColor(v: number) { return v >= 70 ? '#34C759' : v >= 50 ? '#FF9F0A' : '#FF453A' }

// ── Exam detail slide content ──────────────────────────────────────────────────

function ExamDetailContent({ exam }: { exam: any }) {
  const { push } = usePanels()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(52,199,89,0.08)', border: '0.5px solid rgba(52,199,89,0.2)' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#34C759', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {exam.readyCount}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Hazır şagird</p>
        </div>
        <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,69,58,0.08)', border: '0.5px solid rgba(255,69,58,0.2)' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#FF453A', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {exam.atRiskCount}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Riskdə olan</p>
        </div>
      </div>

      {/* Student readiness list */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Şagird Hazırlığı · tıkla → profil
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exam.students.map((s: any, i: number) => {
            const c = barColor(s.readiness)
            return (
              <motion.div
                key={s.name}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => push({
                  id:      `student-${s.name}`,
                  title:   s.name,
                  subtitle: 'Şagird profili',
                  content: <StudentDetailPanel name={s.name} />,
                })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{s.name}</span>
                <div style={{ width: 80, height: 5, borderRadius: 5, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.readiness}%` }}
                    transition={{ delay: 0.03 * i, duration: 0.5 }}
                    style={{ height: '100%', borderRadius: 5, background: c }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: c, fontFamily: 'var(--font-mono)', minWidth: 34, textAlign: 'right' }}>
                  {s.readiness}%
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bulk action */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        style={{
          padding: '12px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'color-mix(in srgb, var(--primary) 12%, var(--bg-hover))',
          border: '0.5px solid color-mix(in srgb, var(--primary) 28%, var(--border))',
          color: 'var(--primary)',
        }}
      >
        📝 Riskdəkilərə Toplu Tapşırıq Göndər ({exam.atRiskCount} nəfər)
      </motion.button>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

interface Props { groupId: string }

export default function ExamReadinessPanel({ groupId }: Props) {
  const { push } = usePanels()
  const exams    = useExamReadiness(groupId)

  return (
    <div className="card">
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
          İmtahan Hazırlığı
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Şagird hazırlıq səviyyəsi · tıkla → detal</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exams.map((exam, i) => {
          const readyPct = Math.round((exam.readyCount / exam.totalStudents) * 100)
          const color    = barColor(readyPct)
          return (
            <motion.div
              key={exam.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => push({
                id:       `exam-${exam.id}`,
                title:    exam.name,
                subtitle: `${exam.daysLeft} gün qaldı · ${exam.totalStudents} şagird`,
                content:  <ExamDetailContent exam={exam} />,
              })}
              style={{
                cursor: 'pointer', borderRadius: 10, padding: '10px 12px',
                background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{exam.name}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#FF9F0A', background: 'rgba(255,159,10,0.1)', padding: '1px 7px', borderRadius: 6 }}>
                      ⏱ {exam.daysLeft} gün
                    </span>
                    {exam.atRiskCount > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#FF453A', background: 'rgba(255,69,58,0.1)', padding: '1px 7px', borderRadius: 6 }}>
                        ⚠ {exam.atRiskCount} riskdə
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color, fontFamily: 'var(--font-mono)' }}>
                  {readyPct}%
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 5, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readyPct}%` }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.6 }}
                  style={{ height: '100%', borderRadius: 5, background: color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
