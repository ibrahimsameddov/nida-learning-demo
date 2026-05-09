import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizSession, useSubmitAnswer, useCompleteQuiz } from './hooks/useQuiz'
import { useAdaptiveEngine, thetaToLevel, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from './hooks/useAdaptiveEngine'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/ui/Skeleton'
import type { QuizAnswer } from '../../../types/models'
import { cn } from '../../../lib/utils'
import { haptic, requestWakeLock, lockPortrait, unlockOrientation } from '../../../lib/native'

const SHAKE = {
  animate: { x: [0, -10, 10, -8, 8, -4, 4, 0] },
  transition: { duration: 0.45, ease: 'easeInOut' },
}
const PULSE_GREEN = {
  animate: { scale: [1, 1.04, 1] },
  transition: { duration: 0.35, ease: 'easeOut' },
}

const Q_DIFF_META = {
  easy:   { emoji: '🟢', label: 'Asan',  color: '#4CAF50' },
  medium: { emoji: '🟡', label: 'Orta',  color: '#FFB74D' },
  hard:   { emoji: '🔴', label: 'Çətin', color: '#ef5350' },
}

function DifficultyMeter({ level, color }: { level: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2.5 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          animate={{ background: i <= level ? color : 'rgba(255,255,255,0.22)' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ width: 3, height: 5 + i * 2.5, borderRadius: 1.5 }}
        />
      ))}
    </div>
  )
}

export default function Quiz() {
  const { sessionId }   = useParams<{ sessionId: string }>()
  const navigate        = useNavigate()
  const { data: session, isLoading } = useQuizSession(sessionId!)
  const submitAnswer    = useSubmitAnswer(sessionId!)
  const completeQuiz    = useCompleteQuiz(sessionId!)

  const adaptive = useAdaptiveEngine()

  const [selected,    setSelected]    = useState<string | null>(null)
  const [revealed,    setRevealed]    = useState(false)
  const [elapsed,     setElapsed]     = useState(0)
  const [violations,  setViolations]  = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const timerRef        = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startRef        = useRef(Date.now())
  const violationsRef   = useRef(0)
  const completeQuizRef = useRef<() => Promise<any>>()
  const wakeLockRef     = useRef<any>(null)
  const MAX_VIOLATIONS  = 3

  // Acquire wake lock + portrait lock on mount
  useEffect(() => {
    lockPortrait().catch(() => {})
    requestWakeLock().then(wl => { wakeLockRef.current = wl }).catch(() => {})
    return () => {
      unlockOrientation()
      wakeLockRef.current?.release?.().catch?.(() => {})
    }
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useBeforeUnload(
    useCallback((e) => {
      if (!revealed) { e.preventDefault(); e.returnValue = '' }
    }, [revealed])
  )

  completeQuizRef.current = () => completeQuiz.mutateAsync()

  useEffect(() => {
    const onHide = async () => {
      if (!document.hidden) return
      violationsRef.current += 1
      const count = violationsRef.current
      setViolations(count)
      if (count >= MAX_VIOLATIONS) {
        try {
          const result = await completeQuizRef.current!()
          navigate(`/quiz/${sessionId}/result`, { state: { result } })
        } catch { navigate('/') }
      } else {
        setShowWarning(true)
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [navigate, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !session) return <DashboardSkeleton />

  const currentQ   = session.questions[session.currentIndex]
  const progress   = (session.currentIndex / session.questions.length) * 100
  const qDiff      = Q_DIFF_META[(currentQ?.difficulty ?? 'medium') as keyof typeof Q_DIFF_META]
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  }

  const handleSelect = (optionId: string) => {
    if (!revealed) {
      haptic.selection()
      setSelected(optionId)
    }
  }

  const handleReveal = () => {
    if (!selected) return
    const isCorrect = currentQ?.options.find(o => o.id === selected)?.isCorrect ?? false
    setRevealed(true)
    setAnswerState(isCorrect ? 'correct' : 'wrong')
    clearInterval(timerRef.current)
    adaptive.recordAnswer(currentQ?.difficulty, isCorrect)
    if (isCorrect) haptic.quizCorrect()
    else           haptic.quizWrong()
  }

  const handleNext = async () => {
    if (!selected || !currentQ) return
    const answer: QuizAnswer = {
      questionId: currentQ.id,
      selectedId: selected,
      isCorrect:  currentQ.options.find(o => o.id === selected)?.isCorrect ?? false,
      timeSpent:  elapsed,
      skipped:    false,
    }
    await submitAnswer.mutateAsync(answer)
    setSelected(null)
    setRevealed(false)
    setAnswerState('idle')
    setElapsed(0)
    startRef.current = Date.now()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 1000)
  }

  const handleComplete = async () => {
    const result = await completeQuiz.mutateAsync()
    navigate(`/quiz/${sessionId}/result`, { state: { result } })
  }

  const isLast = session.currentIndex === session.questions.length - 1

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Topbar */}
      <header
        className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 glass"
        style={{ background: 'var(--bg-hero)' }}
      >
        {/* Left: subject + adaptive level */}
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {currentQ?.subjectId} · Sual {session.currentIndex + 1}/{session.questions.length}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <DifficultyMeter level={adaptive.level} color={adaptive.color} />
            <AnimatePresence mode="wait">
              <motion.span
                key={adaptive.level}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: 9, fontWeight: 700, color: adaptive.color,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                  textTransform: 'uppercase', lineHeight: 1,
                }}
              >
                {adaptive.label}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: violations + timer */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {violations > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 20,
              background: 'rgba(255,77,109,0.18)', border: '0.5px solid rgba(255,77,109,0.35)',
            }}>
              <span style={{ fontSize: 11, color: '#ff4d6d', fontWeight: 700 }}>
                ⚠️ {violations}/{MAX_VIOLATIONS}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill"
               style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <span className="text-xs">⏱</span>
            <span className="text-sm font-mono font-medium">{formatTime(elapsed)}</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div style={{ height: 3, background: 'var(--border-card)' }}>
        <div
          className="h-full transition-all duration-500 ease-smooth"
          style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
        />
      </div>

      {/* Sual */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="rounded-lg p-4 mb-5 glass"
            style={{ border: '0.5px solid var(--border-card)' }}
          >
            {/* Subject + difficulty chip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {currentQ?.subjectId?.toUpperCase()}
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 700, color: qDiff.color,
                fontFamily: 'var(--font-mono)',
              }}>
                {qDiff.emoji} {qDiff.label}
              </span>
            </div>

            {/* Adaptive micro-copy — appears after first answer is recorded */}
            {adaptive.answered > 0 && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  fontSize: 10, color: adaptive.color, marginBottom: 8,
                  fontStyle: 'italic', opacity: 0.85,
                }}
              >
                ✦ Bu sual sənin üçün seçildi
              </motion.p>
            )}

            <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {currentQ?.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Variantlar */}
        <div className="space-y-2.5" role="radiogroup" aria-label="Cavab variantları">
          <AnimatePresence mode="wait">
            {currentQ?.options.map((opt) => {
              const isSelected = selected === opt.id
              const isCorrect  = revealed && opt.isCorrect
              const isWrong    = revealed && isSelected && !opt.isCorrect
              const shakeThis  = isWrong && answerState === 'wrong'
              const pulseThis  = isCorrect && answerState === 'correct'

              return (
                <motion.button
                  key={opt.id}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(opt.id)}
                  disabled={revealed}
                  animate={shakeThis ? SHAKE.animate : pulseThis ? PULSE_GREEN.animate : {}}
                  transition={shakeThis ? SHAKE.transition : pulseThis ? PULSE_GREEN.transition : {}}
                  whileHover={!revealed ? { scale: 1.015 } : {}}
                  whileTap={!revealed ? { scale: 0.97 } : {}}
                  className={cn(
                    `w-full text-left px-4 py-3 rounded-md text-sm
                     border transition-colors duration-300
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-[var(--color-primary)]
                     disabled:cursor-default`,
                    isCorrect  && 'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]',
                    isWrong    && 'border-[var(--color-danger)]  bg-[var(--color-danger)]/10  text-[var(--color-danger)]',
                    isSelected && !revealed && 'border-[var(--border-focus)] bg-[var(--color-glow)]',
                    !isSelected && !isCorrect && !isWrong && 'border-[var(--border-card)] bg-[var(--bg-card)]',
                  )}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isCorrect && <span style={{ fontSize: 16 }}>✓</span>}
                    {isWrong   && <span style={{ fontSize: 16 }}>✗</span>}
                    {opt.text}
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Açıqlama */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-md text-sm leading-relaxed"
            style={{
              background: selected && currentQ?.options.find(o => o.id === selected)?.isCorrect
                ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
                : 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
              border: `0.5px solid ${
                selected && currentQ?.options.find(o => o.id === selected)?.isCorrect
                  ? 'var(--color-success)'
                  : 'var(--color-danger)'
              }`,
              color: 'var(--text-primary)',
            }}
          >
            {selected && currentQ?.options.find(o => o.id === selected)?.isCorrect
              ? '✅ Düzgün cavab!'
              : `❌ Yanlış. Düzgün cavab: ${currentQ?.options.find(o => o.isCorrect)?.text}`
            }
          </motion.div>
        )}
      </main>

      {/* Düymələr */}
      <footer className="px-4 pb-6 pt-3 space-y-2.5 max-w-lg mx-auto w-full">
        {!revealed ? (
          <Button fullWidth size="lg" onClick={handleReveal} disabled={!selected}>
            Yoxla
          </Button>
        ) : isLast ? (
          <Button fullWidth size="lg" onClick={handleComplete} loading={completeQuiz.isPending}>
            Testi bitir
          </Button>
        ) : (
          <Button fullWidth size="lg" onClick={handleNext} loading={submitAnswer.isPending}>
            Növbəti sual →
          </Button>
        )}
        <Button fullWidth variant="ghost" size="md" onClick={handleComplete}>
          Testi dayandır
        </Button>
      </footer>

      {/* Screen-lock warning overlay */}
      {showWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: `0.5px solid ${violations >= MAX_VIOLATIONS - 1 ? 'rgba(255,77,109,0.4)' : 'rgba(244,162,97,0.35)'}`,
            borderRadius: 20, padding: 28, maxWidth: 320, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 8 }}>
              Xəbərdarlıq!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
              İmtahan zamanı pəncərədən çıxmaq qadağandır.
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700, marginBottom: 20, padding: '10px 16px', borderRadius: 10,
              color:      violations >= MAX_VIOLATIONS - 1 ? '#ff4d6d' : '#F4A261',
              background: violations >= MAX_VIOLATIONS - 1 ? 'rgba(255,77,109,0.1)' : 'rgba(244,162,97,0.1)',
              border:     `0.5px solid ${violations >= MAX_VIOLATIONS - 1 ? 'rgba(255,77,109,0.25)' : 'rgba(244,162,97,0.25)'}`,
            }}>
              {MAX_VIOLATIONS - violations} xəbərdarlıq qaldı — davam etsəniz imtahan avtomatik bitəcək.
            </div>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                border: 'none', color: '#fff', cursor: 'pointer',
                fontFamily: "'Lexend Deca', sans-serif",
              }}
            >Davam Et</button>
          </div>
        </div>
      )}
    </div>
  )
}
