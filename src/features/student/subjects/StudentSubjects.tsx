// @ts-nocheck
import { useNavigate }                    from 'react-router-dom'
import { motion }                         from 'framer-motion'
import FloatingOrbs                       from '@/components/ui/FloatingOrbs'
import { Sidebar }                        from '@/components/layout/Sidebar'
import { Topbar }                         from '@/components/layout/GlassTopbar'
import { BottomNav }                      from '@/components/layout/BottomNav'
import { SPRING }                         from '@/lib/motion'
import { getExamData }                    from '@/types/examData'
import { useAuthStore }                   from '@/stores/authStore'
import { useHoverPrefetch, prefetch }     from '@/lib/performance'

// Map subject titles to design-system tokens
const SUBJ_TOKENS: Record<string, { color: string; bg: string }> = {
  'Riyaziyyat':       { color: 'var(--subject-math)',    bg: 'var(--subject-math-bg)'    },
  'Azərbaycan dili':  { color: 'var(--subject-lang)',    bg: 'var(--subject-lang-bg)'    },
  'Xarici dil':       { color: 'var(--subject-lang)',    bg: 'var(--subject-lang-bg)'    },
  'Fizika':           { color: 'var(--subject-physics)', bg: 'var(--subject-physics-bg)' },
  'Kimya':            { color: 'var(--subject-chem)',    bg: 'var(--subject-chem-bg)'    },
  'Biologiya':        { color: 'var(--subject-chem)',    bg: 'var(--subject-chem-bg)'    },
  'Tarix':            { color: 'var(--subject-history)', bg: 'var(--subject-history-bg)' },
  'Coğrafiya':        { color: 'var(--subject-history)', bg: 'var(--subject-history-bg)' },
}
const subjTokens = (title: string, fallback: string) =>
  SUBJ_TOKENS[title] ?? { color: fallback, bg: `color-mix(in srgb, ${fallback} 12%, transparent)` }

function SubjectButton({ subj, examColor, onClick }) {
  const { onMouseEnter: prefetchIn, onMouseLeave: prefetchOut } =
    useHoverPrefetch(() => prefetch.subjectTopics(subj.key))
  const { color, bg } = subjTokens(subj.title, examColor)

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      onMouseEnter={prefetchIn}
      onMouseLeave={prefetchOut}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '18px 12px', borderRadius: 'var(--radius-xl)', cursor: 'pointer',
        background: 'var(--bg-card)',
        border: `1.5px solid ${color}20`,
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
        minHeight: 100,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      <span style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, background: bg,
        border: `1.5px solid ${color}25`,
      }}>{subj.icon}</span>
      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-1)', lineHeight: 1.3 }}>
        {subj.title}
      </span>
      {subj.topics?.length > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700, color,
          background: bg, padding: '2px 7px',
          borderRadius: 'var(--radius-pill)',
        }}>
          {subj.topics.reduce((s, t) => s + (t.qCount ?? 0), 0)} sual
        </span>
      )}
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
        background: 'var(--bg-card)', border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-2xl)', padding: '20px 18px',
        borderTop: `3px solid ${exam.color}`,
        boxShadow: 'var(--shadow-card)',
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
              examColor={exam.color}
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
