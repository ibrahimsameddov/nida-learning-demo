import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { useQuizSession, useSubmitAnswer, useCompleteQuiz } from './hooks/useQuiz'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/ui/Skeleton'
import type { QuizAnswer } from '../../../types/models'
import { cn } from '../../../lib/utils'

export default function Quiz() {
  const { sessionId }   = useParams<{ sessionId: string }>()
  const navigate        = useNavigate()
  const { data: session, isLoading } = useQuizSession(sessionId!)
  const submitAnswer    = useSubmitAnswer(sessionId!)
  const completeQuiz    = useCompleteQuiz(sessionId!)

  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [elapsed,  setElapsed]  = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startRef = useRef(Date.now())

  // Sayaç
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Səhifəni tərk etməmə xəbərdarlığı
  useBeforeUnload(
    useCallback((e) => {
      if (!revealed) {
        e.preventDefault()
        e.returnValue = ''
      }
    }, [revealed])
  )

  if (isLoading || !session) return <DashboardSkeleton />

  const currentQ  = session.questions[session.currentIndex]
  const progress  = (session.currentIndex / session.questions.length) * 100
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  }

  const handleSelect = (optionId: string) => {
    if (revealed) return
    setSelected(optionId)
  }

  const handleReveal = () => {
    if (!selected) return
    setRevealed(true)
    clearInterval(timerRef.current)
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Topbar */}
      <header
        className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 glass"
        style={{ background: 'var(--bg-hero)' }}
      >
        <div className="flex-1">
          <p className="text-xs text-white/50">{currentQ?.subjectId} · Sual {session.currentIndex + 1}/{session.questions.length}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill"
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
        <div
          className="rounded-lg p-4 mb-5 glass"
          style={{ border: '0.5px solid var(--border-card)' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
            {currentQ?.subjectId?.toUpperCase()}
          </p>
          <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {currentQ?.text}
          </p>
        </div>

        {/* Variantlar */}
        <div className="space-y-2.5" role="radiogroup" aria-label="Cavab variantları">
          {currentQ?.options.map((opt) => {
            const isSelected = selected === opt.id
            const isCorrect  = revealed && opt.isCorrect
            const isWrong    = revealed && isSelected && !opt.isCorrect

            return (
              <button
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(opt.id)}
                disabled={revealed}
                className={cn(
                  `w-full text-left px-4 py-3 rounded-md text-sm
                   border transition-all duration-300 ease-[var(--spring)]
                   transform-gpu will-change-transform
                   hover:scale-[1.01] active:scale-[0.98]
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-[var(--color-primary)]
                   disabled:cursor-default`,
                  isCorrect  && 'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]',
                  isWrong    && 'border-[var(--color-danger)]  bg-[var(--color-danger)]/10  text-[var(--color-danger)]',
                  isSelected && !revealed && 'border-[var(--border-focus)] bg-[var(--color-glow)]',
                  !isSelected && !isCorrect && !isWrong && 'border-[var(--border-card)] bg-[var(--bg-card)]',
                )}
              >
                {opt.text}
              </button>
            )
          })}
        </div>

        {/* Açıqlama */}
        {revealed && (
          <div
            className="mt-4 p-4 rounded-md text-sm leading-relaxed"
            style={{
              background: selected && currentQ?.options.find(o => o.id === selected)?.isCorrect
                ? 'var(--color-success)' + '15'
                : 'var(--color-danger)' + '15',
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
          </div>
        )}
      </main>

      {/* Düymələr */}
      <footer className="px-4 pb-6 pt-3 space-y-2.5 max-w-lg mx-auto w-full">
        {!revealed ? (
          <Button
            fullWidth
            size="lg"
            onClick={handleReveal}
            disabled={!selected}
          >
            Yoxla
          </Button>
        ) : isLast ? (
          <Button
            fullWidth
            size="lg"
            onClick={handleComplete}
            loading={completeQuiz.isPending}
          >
            Testi bitir
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            onClick={handleNext}
            loading={submitAnswer.isPending}
          >
            Növbəti sual →
          </Button>
        )}
        <Button
          fullWidth
          variant="ghost"
          size="md"
          onClick={handleComplete}
        >
          Testi dayandır
        </Button>
      </footer>
    </div>
  )
}
