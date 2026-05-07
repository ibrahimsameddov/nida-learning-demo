// @ts-nocheck
import { useNavigate }  from 'react-router-dom'
import { motion }       from 'framer-motion'
import FloatingOrbs     from '@/components/ui/FloatingOrbs'
import { Sidebar }      from '@/components/layout/Sidebar'
import { Topbar }       from '@/components/layout/GlassTopbar'
import { BottomNav }    from '@/components/layout/BottomNav'
import { SPRING }       from '@/lib/motion'
import { getExamData }  from '@/types/examData'
import { useAuthStore } from '@/stores/authStore'

function SubjectButton({ subj, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '18px 10px', borderRadius: 16, cursor: 'pointer',
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid var(--border)',
        textAlign: 'center', transition: 'border-color 0.2s, background 0.2s',
        minHeight: 90,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.background  = `color-mix(in srgb, ${color} 8%, rgba(255,255,255,0.03))`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background  = 'rgba(255,255,255,0.03)'
      }}
    >
      <span style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        background: `color-mix(in srgb, ${color} 15%, rgba(255,255,255,0.04))`,
        border: `1px solid ${color}33`,
      }}>{subj.icon}</span>
      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)', lineHeight: 1.3 }}>
        {subj.title}
      </span>
    </motion.button>
  )
}

function ExamSection({ exam, navigate, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1,  y: 0  }}
      transition={{ ...SPRING, delay }}
      style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border)',
        borderRadius: 20, padding: '20px 18px',
        borderTop: `2px solid ${exam.color}`,
      }}
    >
      {/* Başlıq */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          background: `color-mix(in srgb, ${exam.color} 18%, rgba(255,255,255,0.05))`,
          border: `1px solid ${exam.color}44`,
          boxShadow: `0 0 12px ${exam.color}22`,
        }}>{exam.icon}</div>
        <div>
          <div style={{
            fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800,
            fontSize: 15, color: 'var(--text-1)',
          }}>{exam.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            {exam.subjects.length > 0
              ? `${exam.subjects.length} fənn`
              : 'Fənn yoxdur'}
          </div>
        </div>
      </div>

      {/* Fənlər */}
      {exam.subjects.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 12px',
          background: 'rgba(255,255,255,0.02)', borderRadius: 14,
          border: '0.5px dashed var(--border)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            {exam.id === 'qebul'
              ? 'İxtisas qrubu seçilməyib'
              : 'Tezliklə əlavə olunacaq'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: exam.subjects.length === 1 ? '1fr' : '1fr 1fr',
          gap: 8,
        }}>
          {exam.subjects.map(subj => (
            <SubjectButton
              key={subj.key}
              subj={subj}
              color={exam.color}
              onClick={() => navigate(
                `/topic-quiz?exam=${exam.id}&subject=${encodeURIComponent(subj.title)}`
              )}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function StudentSubjects() {
  const navigate       = useNavigate()
  const user           = useAuthStore(s => s.user)
  const foreignLang    = (user as any)?.foreignLang    ?? 'english'
  const specialtyGroup = (user as any)?.specialtyGroup ?? ''
  const examData       = getExamData(foreignLang, specialtyGroup)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <FloatingOrbs />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={SPRING}
          >
            <h1 style={{
              fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800,
              fontSize: 22, color: 'var(--text-1)', marginBottom: 4,
            }}>Fənlər</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
              Fənn seçin — test dərhal başlayır
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {examData.map((exam, i) => (
              <ExamSection
                key={exam.id}
                exam={exam}
                navigate={navigate}
                delay={0.08 * i}
              />
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
