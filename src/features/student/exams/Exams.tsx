// @ts-nocheck
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetSinaqExamsForStudent, apiSaveSinaqAttempt, apiGetMySinaqAttempt } from '@/lib/api'
import { MATH_QUESTIONS } from '@/lib/mathQuestions'
import { MATH_CHAPTERS } from '@/lib/mathTopics'
import { SPRING } from '@/lib/motion'
import { CardSkeleton } from '@/components/ui/Skeleton'

const TOPIC_TITLE: Record<string, string> = Object.fromEntries(
  MATH_CHAPTERS.flatMap(ch => ch.topics.map(t => [t.id, t.title]))
)

function examStatus(exam: any): 'upcoming' | 'active' | 'ended' {
  const now   = Date.now()
  const start = exam.startDate?.seconds ? exam.startDate.seconds * 1000 : new Date(exam.startDate ?? 0).getTime()
  const end   = exam.endDate?.seconds   ? exam.endDate.seconds * 1000   : new Date(exam.endDate   ?? 0).getTime()
  if (now < start) return 'upcoming'
  if (now <= end)  return 'active'
  return 'ended'
}

function fmtDateTime(ts: any) {
  if (!ts) return '—'
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleString('az-AZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getQuestionsForExam(topicIds: string[], difficulty: string) {
  const all: any[] = []
  for (const tid of topicIds) {
    const qs = MATH_QUESTIONS[tid] ?? []
    switch (difficulty) {
      case 'asan':    all.push(...qs.slice(0, 3)); break
      case 'orta':    all.push(...qs.slice(1, 4)); break
      case 'cetin':   all.push(...qs.slice(2));    break
      case 'qarisiq': all.push(...shuffle(qs));    break
      default:        all.push(...qs)
    }
  }
  return difficulty === 'qarisiq' ? shuffle(all) : all
}

const DIFF_LABEL: Record<string, string> = { asan: '🟢 Asan', orta: '🟡 Orta', cetin: '🔴 Çətin', qarisiq: '🎲 Qarışıq' }

// ─── Countdown timer hook ─────────────────────────────────────────────────────
function useCountdown(seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const expiredRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!expiredRef.current) { expiredRef.current = true; onExpire() }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return remaining
}

function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = Math.max(0, remaining / total)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const color = pct > 0.5 ? '#00C9A7' : pct > 0.25 ? '#F4A261' : '#ff4d6d'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Qalan vaxt</span>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 4, transition: 'width 1s linear, background 0.5s' }} />
      </div>
    </div>
  )
}

// ─── Exam Quiz ────────────────────────────────────────────────────────────────
function ExamQuiz({ exam, onDone }: any) {
  const questions = useMemo(() => getQuestionsForExam(exam.topicIds ?? [], exam.difficulty ?? 'orta'), [exam])
  const totalSeconds = (exam.timeLimit ?? 45) * 60
  const startedAt = useRef(new Date().toISOString())
  const startTs = useRef(Date.now())

  const [idx,      setIdx]      = useState(0)
  const [answers,  setAnswers]  = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)
  const [saving,   setSaving]   = useState(false)

  const handleExpire = useCallback(() => { if (!submitted) handleSubmit(true) }, [submitted])
  const remaining = useCountdown(totalSeconds, handleExpire)

  const q = questions[idx]

  const handleSelect = (optIdx: number) => {
    if (submitted) return
    setAnswers(prev => { const a = [...prev]; a[idx] = optIdx; return a })
  }

  const handleSubmit = async (auto = false) => {
    if (submitted) return
    setSubmitted(true)
    setSaving(true)
    try {
      const completedAt = new Date().toISOString()
      const timeSpent   = Math.round((Date.now() - startTs.current) / 1000)
      const wrongQuestions: any[] = []
      let correct = 0
      questions.forEach((qq: any, i: number) => {
        const chosen = answers[i]
        if (chosen === qq.correctIndex) { correct++ }
        else {
          wrongQuestions.push({
            id:            qq.id,
            question:      qq.text,
            correctAnswer: qq.options[qq.correctIndex],
            studentAnswer: chosen !== null ? qq.options[chosen] : 'Cavabsız',
          })
        }
      })
      const total   = questions.length
      const percent = total > 0 ? Math.round((correct / total) * 100) : 0
      await apiSaveSinaqAttempt({
        examId: exam.id, groupId: exam.groupId,
        startedAt: startedAt.current, completedAt, timeSpent, percent, correct, total, wrongQuestions,
      })
      onDone({ correct, total, percent, wrongQuestions, timeSpent })
    } catch { /* silent */ }
    finally { setSaving(false) }
  }

  if (!q) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TimerBar remaining={remaining} total={totalSeconds} />

      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span>Sual {idx + 1} / {questions.length}</span>
        <span>{answers.filter(a => a !== null).length} cavablandı</span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 20 }}>
        {questions.map((_: any, i: number) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: 22, height: 22, borderRadius: 6, cursor: 'pointer', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === idx ? '#4F87FF' : answers[i] !== null ? 'rgba(0,201,167,0.2)' : 'rgba(255,255,255,0.06)',
              color: i === idx ? '#fff' : answers[i] !== null ? '#00C9A7' : 'var(--text-3)',
              border: `1px solid ${i === idx ? '#4F87FF' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >{i + 1}</div>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '16px', marginBottom: 14, fontSize: 14, color: 'var(--text-1)', lineHeight: 1.5, fontWeight: 600 }}>
          {q.text}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt: string, i: number) => {
            const sel = answers[idx] === i
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  padding: '12px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  border: `1.5px solid ${sel ? '#4F87FF' : 'var(--border-card)'}`,
                  background: sel ? 'rgba(79,135,255,0.1)' : 'var(--bg-card)',
                  color: sel ? '#4F87FF' : 'var(--text-2)',
                  fontSize: 13, fontWeight: sel ? 700 : 400, transition: 'all 0.15s',
                }}
              >
                <span style={{ marginRight: 10, fontWeight: 700, color: sel ? '#4F87FF' : 'var(--text-3)' }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        {idx > 0 && (
          <button onClick={() => setIdx(idx - 1)}
            style={{ flex: 1, padding: '11px', borderRadius: 11, fontSize: 13, fontWeight: 700, background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
            ← Əvvəlki
          </button>
        )}
        {idx < questions.length - 1 ? (
          <button onClick={() => setIdx(idx + 1)}
            style={{ flex: 2, padding: '11px', borderRadius: 11, fontSize: 13, fontWeight: 700, background: 'rgba(79,135,255,0.15)', border: 'none', color: '#4F87FF', cursor: 'pointer' }}>
            Növbəti →
          </button>
        ) : (
          <button onClick={() => handleSubmit(false)} disabled={saving}
            style={{
              flex: 2, padding: '11px', borderRadius: 11, fontSize: 13, fontWeight: 800,
              background: saving ? 'rgba(79,135,255,0.35)' : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
              border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Lexend Deca',sans-serif",
            }}>
            {saving ? 'Göndərilir...' : '✓ Bitir'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Exam Result ──────────────────────────────────────────────────────────────
function ExamResult({ result, exam, onClose }: any) {
  const { correct, total, percent, wrongQuestions, timeSpent } = result
  const [showWrong, setShowWrong] = useState(false)

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{percent >= 75 ? '🏆' : percent >= 50 ? '👍' : '📚'}</div>
      <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'monospace', color: percent >= 75 ? '#00C9A7' : percent >= 50 ? '#F4A261' : '#ff4d6d', marginBottom: 4 }}>
        {percent}%
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>{correct}/{total} düzgün · {Math.round(timeSpent / 60)} dəq</div>

      {wrongQuestions?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowWrong(p => !p)}
            style={{ padding: '9px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(255,77,109,0.08)', border: '0.5px solid rgba(255,77,109,0.25)', color: '#ff4d6d', cursor: 'pointer' }}>
            {showWrong ? '▲ Yanlışları Gizlə' : `▼ ${wrongQuestions.length} Yanlış Cavab`}
          </button>
          <AnimatePresence>
            {showWrong && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                  {wrongQuestions.map((wq: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,77,109,0.05)', border: '0.5px solid rgba(255,77,109,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>{wq.question}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,77,109,0.1)', color: '#ff4d6d' }}>✗ {wq.studentAnswer}</span>
                        <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>✓ {wq.correctAnswer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <button onClick={onClose}
        style={{ width: '100%', padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
        Bağla
      </button>
    </div>
  )
}

// ─── Exam Modal ───────────────────────────────────────────────────────────────
function ExamModal({ exam, onClose }: any) {
  const [phase,  setPhase]  = useState<'info' | 'quiz' | 'result'>('info')
  const [result, setResult] = useState<any>(null)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
      onClick={e => phase === 'info' && e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={SPRING}
        style={{ width: '100%', maxWidth: 520, maxHeight: '92dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '0.5px solid rgba(79,135,255,0.2)', borderRadius: '20px 20px 16px 16px', padding: 24, overflow: 'hidden' }}>

        {phase === 'info' && (
          <>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 16 }}>Sinaq İmtahanı</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-2)' }}>
                <span>{DIFF_LABEL[exam.difficulty] ?? exam.difficulty}</span>
                <span>⏱ {exam.timeLimit} dəqiqə</span>
                <span>📚 {exam.topicIds?.length} mövzu</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                Mövzular: {exam.topicIds?.slice(0, 3).map((id: string) => TOPIC_TITLE[id] || id).join(', ')}{exam.topicIds?.length > 3 ? ` +${exam.topicIds.length - 3}` : ''}
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,77,109,0.06)', border: '0.5px solid rgba(255,77,109,0.15)', fontSize: 12, color: '#ff4d6d', fontWeight: 600 }}>
                ⚠️ Yalnız 1 cəhd hüququnuz var. Başladıqdan sonra geri dönmək olmaz.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>İmtina et</button>
              <button onClick={() => setPhase('quiz')}
                style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg, #4F87FF, #6C63FF)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'Lexend Deca',sans-serif" }}>
                ▶ Başla
              </button>
            </div>
          </>
        )}

        {phase === 'quiz' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ExamQuiz exam={exam} onDone={(r: any) => { setResult(r); setPhase('result') }} />
          </div>
        )}

        {phase === 'result' && result && (
          <ExamResult result={result} exam={exam} onClose={onClose} />
        )}
      </motion.div>
    </div>
  )
}

// ─── Exam Card ────────────────────────────────────────────────────────────────
function ExamCard({ exam, myAttempt, onStart }: any) {
  const status = examStatus(exam)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
      style={{ background: 'var(--bg-card)', border: `0.5px solid ${status === 'active' && !myAttempt ? 'rgba(0,201,167,0.25)' : 'var(--border-card)'}`, borderRadius: 16, padding: 16 }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
            📋 {exam.topicIds?.length} mövzu · {DIFF_LABEL[exam.difficulty] ?? exam.difficulty}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>⏱ {exam.timeLimit} dəqiqə</div>
        </div>
        {myAttempt ? (
          <span style={{ padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>Tamamlandı</span>
        ) : status === 'active' ? (
          <span style={{ padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: 'rgba(0,201,167,0.12)', color: '#00C9A7' }}>Aktiv</span>
        ) : status === 'upcoming' ? (
          <span style={{ padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: 'rgba(244,162,97,0.12)', color: '#F4A261' }}>Gözləyir</span>
        ) : (
          <span style={{ padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: 'rgba(255,77,109,0.1)', color: '#ff4d6d' }}>Bitib</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-3)', marginBottom: 12, flexWrap: 'wrap' }}>
        <span>▶ {fmtDateTime(exam.startDate)}</span>
        <span>■ {fmtDateTime(exam.endDate)}</span>
      </div>

      {myAttempt && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(167,139,250,0.06)', border: '0.5px solid rgba(167,139,250,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{myAttempt.correct}/{myAttempt.total} düzgün</span>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: myAttempt.percent >= 75 ? '#00C9A7' : myAttempt.percent >= 50 ? '#F4A261' : '#ff4d6d' }}>
            {myAttempt.percent}%
          </span>
        </div>
      )}

      {!myAttempt && status === 'active' && (
        <button onClick={onStart}
          style={{ width: '100%', padding: '10px', borderRadius: 11, fontWeight: 700, fontSize: 13, background: 'linear-gradient(135deg, #4F87FF, #6C63FF)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'Lexend Deca',sans-serif" }}>
          ▶ İmtahana Başla
        </button>
      )}
      {!myAttempt && status === 'ended' && (
        <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,77,109,0.06)', border: '0.5px solid rgba(255,77,109,0.15)', fontSize: 12, color: '#ff4d6d', textAlign: 'center' }}>
          İmtahan vaxtı bitib — daxil olmaq mümkün deyil
        </div>
      )}
      {!myAttempt && status === 'upcoming' && (
        <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(244,162,97,0.06)', border: '0.5px solid rgba(244,162,97,0.15)', fontSize: 12, color: '#F4A261', textAlign: 'center' }}>
          İmtahan başlamamışdır — {fmtDateTime(exam.startDate)} tarixindən girə bilərsiniz
        </div>
      )}
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StudentExams() {
  const [exams,    setExams]    = useState<any[]>([])
  const [attempts, setAttempts] = useState<Record<string, any>>({})
  const [loading,  setLoading]  = useState(true)
  const [active,   setActive]   = useState<any>(null)

  useEffect(() => {
    apiGetSinaqExamsForStudent()
      .then(async (list: any[]) => {
        setExams(list)
        // Load my attempt for each exam
        const pairs = await Promise.all(list.map(async e => {
          const att = await apiGetMySinaqAttempt(e.id).catch(() => null)
          return [e.id, att] as [string, any]
        }))
        setAttempts(Object.fromEntries(pairs.filter(([, v]) => v !== null)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDone = (examId: string) => {
    apiGetMySinaqAttempt(examId).then(att => {
      if (att) setAttempts(prev => ({ ...prev, [examId]: att }))
    }).catch(() => {})
    setActive(null)
  }

  const upcoming  = exams.filter(e => examStatus(e) === 'upcoming')
  const activeEx  = exams.filter(e => examStatus(e) === 'active')
  const endedEx   = exams.filter(e => examStatus(e) === 'ended')

  if (loading) {
    return (
      <div className="page-inner">
        <CardSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="page-inner">
      <h2 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)', marginBottom: 4 }}>
        Sinaq İmtahanları
      </h2>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
        Müəllim tərəfindən təşkil edilmiş imtahanlar
      </p>

      {exams.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Hələ imtahan yoxdur</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Müəllim sinaq imtahanı təyin etdikdən sonra burada görünəcək.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeEx.length > 0 && (
            <section>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>● Aktiv İmtahanlar</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeEx.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, ...SPRING }}
                  >
                    <ExamCard exam={e} myAttempt={attempts[e.id]} onStart={() => setActive(e)} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#F4A261', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>⏰ Gözləyən İmtahanlar</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(e => (
                  <ExamCard key={e.id} exam={e} myAttempt={attempts[e.id]} onStart={() => {}} />
                ))}
              </div>
            </section>
          )}
          {endedEx.length > 0 && (
            <section>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>✓ Bitmiş İmtahanlar</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {endedEx.map(e => (
                  <ExamCard key={e.id} exam={e} myAttempt={attempts[e.id]} onStart={() => {}} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <ExamModal exam={active} onClose={() => handleDone(active.id)} />
        )}
      </AnimatePresence>
    </div>
  )
}
