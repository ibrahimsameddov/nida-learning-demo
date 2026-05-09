import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizSession, useSubmitAnswer, useCompleteQuiz } from './hooks/useQuiz'
import { useAdaptiveEngine, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from './hooks/useAdaptiveEngine'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/ui/Skeleton'
import type { QuizAnswer } from '../../../types/models'
import { cn } from '../../../lib/utils'

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

export default function TopicQuiz() {
  const { sessionId }   = useParams<{ sessionId: string }>()
  const navigate        = useNavigate()
  const { data: session, isLoading } = useQuizSession(sessionId!)
  const submitAnswer    = useSubmitAnswer(sessionId!)
  const completeQuiz    = useCompleteQuiz(sessionId!)

  const adaptive = useAdaptiveEngine()

  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [elapsed,  setElapsed]  = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startRef = useRef(Date.now())

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useBeforeUnload(
    useCallback((e) => {
      if (!revealed) { e.preventDefault(); e.returnValue = '' }
    }, [revealed])
  )

  if (isLoading || !session) return <DashboardSkeleton />

  const currentQ   = session.questions[session.currentIndex]
  const progress   = (session.currentIndex / session.questions.length) * 100
  const qDiff      = Q_DIFF_META[(currentQ?.difficulty ?? 'medium') as keyof typeof Q_DIFF_META]
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  }

  const handleSelect = (optionId: string) => { if (!revealed) setSelected(optionId) }

  const handleReveal = () => {
    if (!selected) return
    const isCorrect = currentQ?.options.find(o => o.id === selected)?.isCorrect ?? false
    setRevealed(true)
    clearInterval(timerRef.current)
    adaptive.recordAnswer(currentQ?.difficulty, isCorrect)
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

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill flex-shrink-0"
             style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <span className="text-xs">⏱</span>
          <span className="text-sm font-mono font-medium">{formatTime(elapsed)}</span>
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

            {/* Adaptive micro-copy */}
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
          {currentQ?.options.map((opt) => {
            const isSelected = selected === opt.id
            const isCorrect  = revealed && opt.isCorrect
            const isWrong    = revealed && isSelected && !opt.isCorrect

            return (
              <motion.button
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(opt.id)}
                disabled={revealed}
                whileHover={!revealed ? { scale: 1.015 } : {}}
                whileTap={!revealed ? { scale: 0.97 } : {}}
                className={cn(
                  `w-full text-left px-4 py-3 rounded-md text-sm
                   border transition-all duration-300 ease-[var(--spring)]
                   transform-gpu will-change-transform
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
    </div>
  )
}
