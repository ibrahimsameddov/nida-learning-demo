// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import {
  apiGetGroupHomeworks, apiGetMyHomeworkAttempts, apiSaveHomeworkAttempt,
  apiGetGroupsByStudentUid,
} from '@/lib/api'
import { MATH_QUESTIONS } from '@/lib/mathQuestions'
import { SPRING } from '@/lib/motion'
import { HomeworkSkeleton } from '@/components/ui/Skeleton'

function fmt(ts: any) {
  if (!ts) return '—'
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function HomeworkQuiz({ homework, attemptNumber, onDone, onClose }: any) {
  const questions = MATH_QUESTIONS[homework.topicId] ?? []
  const [idx,     setIdx]     = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [wrongQs, setWrongQs] = useState<any[]>([])
  const [saving,  setSaving]  = useState(false)
  const startRef = useRef(Date.now())

  if (questions.length === 0) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>
      Bu mövzu üçün sual yoxdur.
      <button onClick={onClose} style={{ display: 'block', margin: '16px auto 0', padding: '8px 20px', borderRadius: 10, background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', color: 'var(--text-1)', cursor: 'pointer' }}>
        Bağla
      </button>
    </div>
  )

  const q = questions[idx]

  const handleAnswer = async (choiceIdx: number) => {
    const correct = choiceIdx === q.correctIndex
    const newAnswers = [...answers, correct]
    const newWrong   = correct ? wrongQs : [...wrongQs, {
      id:            q.id,
      question:      q.text,
      correctAnswer: q.options[q.correctIndex],
      studentAnswer: q.options[choiceIdx],
    }]

    if (idx + 1 < questions.length) {
      setAnswers(newAnswers)
      setWrongQs(newWrong)
      setIdx(i => i + 1)
    } else {
      // Done
      const total   = newAnswers.length
      const correct = newAnswers.filter(Boolean).length
      const percent = Math.round((correct / total) * 100)
      setSaving(true)
      try {
        await apiSaveHomeworkAttempt({
          homeworkId:    homework.id,
          groupId:       homework.groupId,
          topicId:       homework.topicId,
          attemptNumber,
          percent,
          correct,
          total,
          wrongQuestions: newWrong,
          completedAt:   new Date().toISOString(),
        })
        onDone({ percent, correct, total, wrongQuestions: newWrong })
      } catch {
        onDone({ percent, correct, total, wrongQuestions: newWrong })
      } finally { setSaving(false) }
    }
  }

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: '#4F87FF', width: `${((idx) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{idx + 1}/{questions.length}</span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.5, marginBottom: 20 }}>
        {q.text}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((choice: string, i: number) => (
          <button key={i} onClick={() => !saving && handleAnswer(i)}
            style={{
              width: '100%', textAlign: 'left', padding: '13px 16px', borderRadius: 12,
              border: '0.5px solid var(--border)', background: 'var(--bg-secondary)',
              color: 'var(--text-1)', cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F87FF'; e.currentTarget.style.background = 'rgba(79,135,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)' }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-3)', marginRight: 10 }}>
              {String.fromCharCode(65 + i)})
            </span>
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Result ────────────────────────────────────────────────────────────────────
function AttemptResult({ result, attemptNumber, repeatLimit, onRetry, onClose }: any) {
  const passed   = result.percent >= 80
  const canRetry = attemptNumber < repeatLimit

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>
        {passed ? '🎉' : '📚'}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: passed ? '#00C9A7' : '#F4A261', marginBottom: 4 }}>
        {result.percent}%
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>
        {result.correct}/{result.total} düzgün · {attemptNumber}-ci cəhd
      </div>
      {!passed && result.wrongQuestions?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
          {result.wrongQuestions.length} səhv cavab
        </div>
      )}

      {result.wrongQuestions?.length > 0 && (
        <div style={{ textAlign: 'left', marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Səhv cavablar
          </div>
          {result.wrongQuestions.map((wq: any, i: number) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 6, background: 'rgba(255,77,109,0.06)', border: '0.5px solid rgba(255,77,109,0.2)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-1)', marginBottom: 4 }}>{wq.question}</div>
              <div style={{ fontSize: 11, color: '#ff4d6d' }}>Sənin cavabın: <b>{wq.studentAnswer}</b></div>
              <div style={{ fontSize: 11, color: '#00C9A7', marginTop: 2 }}>Düzgün: <b>{wq.correctAnswer}</b></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
          color: 'var(--text-3)', cursor: 'pointer',
        }}>Bağla</button>
        {canRetry && (
          <button onClick={onRetry} style={{
            flex: 2, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 800,
            background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
            border: 'none', color: '#fff', cursor: 'pointer',
            fontFamily: "'Lexend Deca', sans-serif",
          }}>
            🔄 Yenidən cəhd et ({repeatLimit - attemptNumber} qalıb)
          </button>
        )}
      </div>
    </div>
  )
}

// ── HomeworkModal ─────────────────────────────────────────────────────────────
function HomeworkModal({ homework, onClose }: any) {
  const [myAttempts, setMyAttempts] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [quizActive, setQuizActive] = useState(false)
  const [result,     setResult]     = useState<any>(null)

  useEffect(() => {
    apiGetMyHomeworkAttempts(homework.id)
      .then(a => setMyAttempts(Array.isArray(a) ? a.sort((x, y) => x.attemptNumber - y.attemptNumber) : []))
      .catch(() => setMyAttempts([]))
      .finally(() => setLoading(false))
  }, [homework.id])

  const attemptsDone = myAttempts.length
  const canStart     = attemptsDone < homework.repeatLimit
  const nextAttempt  = attemptsDone + 1
  const bestPercent  = myAttempts.length ? Math.max(...myAttempts.map(a => a.percent)) : null

  const handleDone = (res: any) => {
    setResult(res)
    setQuizActive(false)
    setMyAttempts(prev => [...prev, { attemptNumber: nextAttempt, ...res }])
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && !quizActive && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={SPRING}
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 22, padding: '22px 20px',
          maxHeight: '90dvh', overflowY: 'auto',
        }}
      >
        {!quizActive && !result && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-1)' }}>
                  {homework.topicTitle}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                  {homework.subject} · {homework.repeatLimit}x təkrar
                </div>
              </div>
              <button onClick={onClose} style={{
                width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
                color: 'var(--text-3)', fontSize: 16,
              }}>✕</button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>Yüklənir...</div>
            ) : (
              <>
                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
                    <span>Cəhdlər</span>
                    <span>{attemptsDone}/{homework.repeatLimit}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 6, background: '#4F87FF',
                      width: `${(attemptsDone / homework.repeatLimit) * 100}%`, transition: 'width 0.4s',
                    }} />
                  </div>
                </div>

                {/* Past attempts */}
                {myAttempts.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Keçmiş cəhdlər
                    </div>
                    {myAttempts.map(a => (
                      <div key={a.id ?? a.attemptNumber} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 10, marginBottom: 6,
                        background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
                      }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{a.attemptNumber}-ci cəhd</span>
                        <span style={{ flex: 1 }} />
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          background: a.percent >= 80 ? 'rgba(0,201,167,0.12)' : 'rgba(244,162,97,0.12)',
                          color: a.percent >= 80 ? '#00C9A7' : '#F4A261',
                        }}>{a.percent}%</span>
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{fmt(a.completedAt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {canStart ? (
                  <button
                    onClick={() => setQuizActive(true)}
                    style={{
                      width: '100%', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
                      background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                      border: 'none', color: '#fff', cursor: 'pointer',
                      fontFamily: "'Lexend Deca', sans-serif",
                    }}
                  >
                    {attemptsDone === 0 ? '▶ Başla' : `🔄 ${nextAttempt}-ci cəhd`}
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(0,201,167,0.06)', border: '0.5px solid rgba(0,201,167,0.2)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#00C9A7' }}>✅ Tamamlandı</div>
                    {bestPercent !== null && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Ən yaxşı nəticə: {bestPercent}%</div>}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {quizActive && !result && (
          <HomeworkQuiz
            homework={homework}
            attemptNumber={nextAttempt}
            onDone={handleDone}
            onClose={() => setQuizActive(false)}
          />
        )}

        {result && (
          <AttemptResult
            result={result}
            attemptNumber={myAttempts.length}
            repeatLimit={homework.repeatLimit}
            onRetry={() => { setResult(null); setQuizActive(true) }}
            onClose={onClose}
          />
        )}
      </motion.div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentHomework() {
  const user = useAuthStore(s => s.user)
  const [homeworks, setHomeworks] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState<any>(null)

  useEffect(() => {
    const studentUid = (user as any)?.id
    if (!studentUid) { setLoading(false); return }

    apiGetGroupsByStudentUid(studentUid)
      .then(async (groups: any[]) => {
        if (!groups.length) return []
        const all = await Promise.all(groups.map(g => apiGetGroupHomeworks(g.id)))
        return all.flat()
      })
      .then(hw => setHomeworks(Array.isArray(hw) ? hw : []))
      .catch(() => setHomeworks([]))
      .finally(() => setLoading(false))
  }, [(user as any)?.id])

  return (
    <div className="page-inner anim-fade-up">
      <AnimatePresence>
        {selected && (
          <HomeworkModal homework={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
          📝 Ev Tapşırıqları
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Müəllimin təyin etdiyi tapşırıqlar</p>
      </div>

      {loading ? (
        <HomeworkSkeleton />
      ) : homeworks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Tapşırıq yoxdur</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Müəllim tapşırıq təyin etdikdə burada görünəcək</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {homeworks.map((hw, i) => (
            <motion.div
              key={hw.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ...SPRING }}
            >
              <HomeworkCard homework={hw} onClick={() => setSelected(hw)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function HomeworkCard({ homework, onClick }: any) {
  const [myAttempts, setMyAttempts] = useState<any[]>([])
  useEffect(() => {
    apiGetMyHomeworkAttempts(homework.id)
      .then(a => setMyAttempts(Array.isArray(a) ? a : []))
      .catch(() => {})
  }, [homework.id])

  const done       = myAttempts.length
  const total      = homework.repeatLimit
  const best       = done ? Math.max(...myAttempts.map(a => a.percent)) : null
  const completed  = done >= total

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 16px',
        background: completed ? 'rgba(0,201,167,0.05)' : 'var(--bg-card)',
        border: `0.5px solid ${completed ? 'rgba(0,201,167,0.25)' : 'var(--border)'}`,
        borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { if (!completed) e.currentTarget.style.borderColor = '#4F87FF' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = completed ? 'rgba(0,201,167,0.25)' : 'var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3, lineHeight: 1.3 }}>
            {homework.topicTitle}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{homework.subject}</div>
        </div>
        {best !== null && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, flexShrink: 0,
            background: best >= 80 ? 'rgba(0,201,167,0.12)' : 'rgba(244,162,97,0.12)',
            color: best >= 80 ? '#00C9A7' : '#F4A261',
          }}>{best}%</span>
        )}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>
          <span>{completed ? '✅ Tamamlandı' : `${done}/${total} cəhd`}</span>
          <span>{total}x təkrar</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: completed ? '#00C9A7' : '#4F87FF',
            width: `${Math.min((done / total) * 100, 100)}%`,
            transition: 'width 0.4s',
          }} />
        </div>
      </div>
    </motion.button>
  )
}
