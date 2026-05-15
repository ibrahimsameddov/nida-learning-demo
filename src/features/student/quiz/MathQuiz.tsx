import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate }      from 'react-router-dom'
import { useQueryClient }              from '@tanstack/react-query'
import { motion, AnimatePresence }     from 'framer-motion'
import { MATH_QUESTIONS, MathQ }       from '../../../lib/mathQuestions'
import { MATH_CHAPTERS }               from '../../../lib/mathTopics'
import { dbSaveTestResult }            from '../../../lib/api'
import { Button }                      from '../../../components/ui/Button'
import {
  useGamificationStore,
  rollMultiplier,
  multiplierMeta,
} from '../../../stores/gamificationStore'

function findTopic(topicId: string) {
  for (const ch of MATH_CHAPTERS) {
    const t = ch.topics.find(t => t.id === topicId)
    if (t) return { topic: t, chapter: ch }
  }
  return null
}

interface DoneData {
  correct:     number
  total:       number
  pct:         number
  wrongQs:     MathQ[]
  remainingQs: MathQ[]
  saveError:   string | null
  earnedXP:    number
  multiplier:  number
}

type Phase = 'picking' | 'revealed'

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 26 }

// ── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({
  label, letter, phase, isPending, isCorrect, isWrong, onClick,
}: {
  label: string; letter: string; phase: Phase
  isPending: boolean; isCorrect: boolean; isWrong: boolean
  onClick: () => void
}) {
  let bg      = 'var(--bg-card)'
  let border  = '0.5px solid var(--border)'
  let lBg     = 'rgba(255,255,255,0.07)'
  let lColor  = 'var(--text-3)'
  let color   = 'var(--text-1)'

  if (phase === 'picking' && isPending) {
    bg     = 'rgba(0,212,255,0.08)'
    border = '1.5px solid var(--primary)'
    lBg    = 'var(--primary)'
    lColor = '#fff'
  } else if (phase === 'revealed' && isCorrect) {
    bg     = 'rgba(5,150,105,0.10)'
    border = '1.5px solid var(--success)'
    lBg    = 'var(--success)'
    lColor = '#fff'
    color  = 'var(--success)'
  } else if (phase === 'revealed' && isWrong) {
    bg     = 'rgba(220,38,38,0.08)'
    border = '1.5px solid var(--danger)'
    lBg    = 'var(--danger)'
    lColor = '#fff'
    color  = 'var(--danger)'
  }

  return (
    <motion.button
      whileHover={phase === 'picking' ? { scale: 1.015 } : {}}
      whileTap={phase === 'picking' ? { scale: 0.98 } : {}}
      onClick={phase === 'picking' ? onClick : undefined}
      style={{
        width: '100%', textAlign: 'left', padding: '13px 16px',
        borderRadius: 12, border, background: bg,
        cursor: phase === 'picking' ? 'pointer' : 'default',
        fontSize: 14, color,
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, fontFamily: 'monospace',
        background: lBg, color: lColor,
        border: lBg === 'rgba(255,255,255,0.07)' ? '0.5px solid var(--border)' : 'none',
        transition: 'all 0.15s',
      }}>
        {letter}
      </span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{label}</span>
      {phase === 'revealed' && isCorrect && <span style={{ fontSize: 16 }}>✓</span>}
      {phase === 'revealed' && isWrong   && <span style={{ fontSize: 16 }}>✗</span>}
    </motion.button>
  )
}

// ── Explanation panel ─────────────────────────────────────────────────────────
function ExplanationPanel({ text, isCorrect }: { text: string; isCorrect: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      transition={{ ...SPRING, delay: 0.1 }}
      style={{
        borderRadius: 12, padding: '12px 14px',
        background: isCorrect ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.07)',
        border: `1px solid ${isCorrect ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'}`,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{isCorrect ? '💡' : '📖'}</span>
      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </motion.div>
  )
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({
  meta, doneData,
  onContinue, onWrongs, onRestart, onStats, onBack,
}: {
  meta: ReturnType<typeof findTopic>
  doneData: DoneData
  onContinue: (qs: MathQ[]) => void
  onWrongs:   (qs: MathQ[]) => void
  onRestart:  () => void
  onStats:    () => void
  onBack:     () => void
}) {
  const { correct, total, pct, wrongQs, remainingQs, saveError, earnedXP, multiplier } = doneData
  const color = pct >= 75 ? 'var(--success)' : pct >= 55 ? 'var(--warning)' : 'var(--danger)'
  const mulMeta = multiplierMeta(multiplier)

  const [countPct, setCountPct] = useState(0)
  const [countXP,  setCountXP]  = useState(0)
  useEffect(() => {
    let p = 0
    const t1 = setInterval(() => {
      p += Math.ceil(pct / 40)
      if (p >= pct) { setCountPct(pct); clearInterval(t1) }
      else setCountPct(p)
    }, 25)
    return () => clearInterval(t1)
  }, [pct])
  useEffect(() => {
    let x = 0
    const t2 = setInterval(() => {
      x += Math.ceil(earnedXP / 40)
      if (x >= earnedXP) { setCountXP(earnedXP); clearInterval(t2) }
      else setCountXP(x)
    }, 25)
    return () => clearInterval(t2)
  }, [earnedXP])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 24, padding: '28px 24px', boxShadow: 'var(--shadow-card)' }}>

          {saveError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, fontSize: 12,
              background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.4)', color: 'var(--danger)', lineHeight: 1.5 }}>
              <strong>⚠️ Xəta:</strong> {saveError}
            </div>
          )}

          {/* Score */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>
              {pct >= 75 ? '🏆' : pct >= 55 ? '👍' : '📚'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 4 }}>
              {meta?.topic.title}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Test başa çatdı</p>
          </div>

          {/* Big percent */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 56, fontWeight: 900, color, textAlign: 'center', lineHeight: 1, marginBottom: 8 }}>
            {countPct}%
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {correct} düzgün</span>
            {total - correct > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>✗ {total - correct} səhv</span>}
            {remainingQs.length > 0 && <span style={{ color: 'var(--warning)', fontWeight: 600 }}>⏭ {remainingQs.length} qalan</span>}
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              style={{ height: '100%', background: color, borderRadius: 99, boxShadow: `0 0 10px ${color}60` }}
            />
          </div>

          {/* XP reward */}
          <div style={{
            borderRadius: 14, padding: '14px 18px', marginBottom: 20,
            background: 'var(--hero-panel)', border: '1px solid var(--hero-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,149,43,0.4), transparent)' }} />
            <div>
              <p style={{ fontSize: 10, color: 'var(--hero-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Qazanılan XP</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 26, color: 'var(--accent)', lineHeight: 1 }}>
                +{countXP} XP
              </p>
            </div>
            {multiplier > 1 && (
              <div style={{
                padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                background: `${mulMeta.color}20`, border: `1.5px solid ${mulMeta.color}40`,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 18, lineHeight: 1, marginBottom: 3 }}>{mulMeta.emoji}</p>
                <p style={{ fontSize: 10, fontWeight: 800, color: mulMeta.color, whiteSpace: 'nowrap' }}>
                  {multiplier}× {mulMeta.label}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {remainingQs.length > 0 && (
              <Button fullWidth size="lg" onClick={() => onContinue(remainingQs)}>
                ▶ Davam et ({remainingQs.length} sual)
              </Button>
            )}
            {wrongQs.length > 0 && (
              <Button fullWidth size="lg" onClick={() => onWrongs(wrongQs)}
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
                ✗ Səhvləri işlə ({wrongQs.length} sual)
              </Button>
            )}
            <Button fullWidth variant="secondary" onClick={onRestart}>
              ↺ Sıfırdan başla
            </Button>
            <Button fullWidth variant="secondary" onClick={onStats}
              style={{ background: 'rgba(0,229,160,0.1)', borderColor: 'rgba(0,229,160,0.4)', color: 'var(--success)' }}>
              📊 Statistikaya keç
            </Button>
            <Button fullWidth variant="ghost" onClick={onBack}>
              ← Mövzu siyahısına qayıt
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MathQuiz() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate    = useNavigate()
  const qc          = useQueryClient()
  const addXP       = useGamificationStore(s => s.addXP)

  const allQuestions = MATH_QUESTIONS[topicId!] ?? []
  const meta         = findTopic(topicId!)

  const [activeQs,       setActiveQs]       = useState<MathQ[]>(allQuestions)
  const [idx,            setIdx]            = useState(0)
  const [answers,        setAnswers]        = useState<boolean[]>([])
  const [pendingChoice,  setPendingChoice]  = useState<number | null>(null)
  const [phase,          setPhase]          = useState<Phase>('picking')
  const [confirmedChoice,setConfirmedChoice]= useState<number | null>(null)
  const [confirmedOk,    setConfirmedOk]    = useState(false)
  const [doneData,       setDoneData]       = useState<DoneData | null>(null)
  const [saving,         setSaving]         = useState(false)
  const [elapsed,        setElapsed]        = useState(0)

  const timerRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const totalStart = useRef(Date.now())
  const xpAdded    = useRef(false)

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  const currentQ = activeQs[idx]
  const progress = activeQs.length > 0 ? ((idx + (phase === 'revealed' ? 1 : 0)) / activeQs.length) * 100 : 0

  // Step 1 — select option
  const handleSelect = (i: number) => {
    if (phase === 'revealed') return
    setPendingChoice(i)
  }

  // Step 2 — confirm: freeze answer, reveal feedback
  const handleConfirm = () => {
    if (pendingChoice === null || phase === 'revealed') return
    const isCorrect = pendingChoice === currentQ.correctIndex
    setConfirmedChoice(pendingChoice)
    setConfirmedOk(isCorrect)
    setPhase('revealed')
    setPendingChoice(null)
  }

  // Step 3 — advance to next question
  const handleAdvance = () => {
    const newAnswers = [...answers, confirmedOk]
    setAnswers(newAnswers)
    setPhase('picking')
    setConfirmedChoice(null)
    setPendingChoice(null)
    if (idx + 1 >= activeQs.length) {
      finishQuiz(newAnswers, activeQs)
    } else {
      setIdx(idx + 1)
    }
  }

  const finishQuiz = async (finalAnswers: boolean[], qs: MathQ[]) => {
    clearInterval(timerRef.current)
    const correct   = finalAnswers.filter(Boolean).length
    const total     = finalAnswers.length
    const percent   = total > 0 ? Math.round((correct / total) * 100) : 0
    const timeSpent = Math.round((Date.now() - totalStart.current) / 1000)

    const wrongQs:     MathQ[] = qs.filter((_, i) => finalAnswers[i] === false)
    const answeredIds  = new Set(qs.slice(0, total).map(q => q.id))
    const remainingQs: MathQ[] = allQuestions.filter(q => !answeredIds.has(q.id))

    // Award XP exactly once
    let earnedXP   = 0
    let multiplier = 1
    if (!xpAdded.current) {
      xpAdded.current = true
      const baseXP = Math.max(30, Math.round(percent * 1.5))
      multiplier   = rollMultiplier()
      earnedXP     = Math.round(baseXP * multiplier)
      addXP(earnedXP)
    }

    setSaving(true)
    let saveError: string | null = null
    try {
      await dbSaveTestResult({
        subject:     'Riyaziyyat',
        topicId:     topicId!,
        topicName:   meta?.topic.title ?? topicId!,
        percent,
        total,
        correct,
        wrong:       total - correct,
        skipped:     allQuestions.length - total,
        timeSpent,
        completedAt: new Date().toISOString(),
      })
    } catch (e) {
      saveError = e instanceof Error ? e.message : String(e)
    } finally {
      qc.invalidateQueries({ queryKey: ['my-statistics'], exact: false })
      qc.invalidateQueries({ queryKey: ['my-results'],    exact: false })
      setSaving(false)
      setDoneData({ correct, total, pct: percent, wrongQs, remainingQs, saveError, earnedXP, multiplier })
    }
  }

  const startSession = (qs: MathQ[]) => {
    setActiveQs(qs)
    setIdx(0)
    setAnswers([])
    setPendingChoice(null)
    setPhase('picking')
    setConfirmedChoice(null)
    setDoneData(null)
    setElapsed(0)
    xpAdded.current = false
    totalStart.current = Date.now()
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  // ── No questions ─────────────────────────────────────────────────────────────
  if (allQuestions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
        <p style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Bu mövzu üçün hələ sual yoxdur</p>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>{meta?.topic.title}</p>
        <Button onClick={() => navigate('/subjects/math')}>← Geri qayıt</Button>
      </div>
    )
  }

  // ── Result screen ────────────────────────────────────────────────────────────
  if (doneData) {
    return (
      <ResultScreen
        meta={meta}
        doneData={doneData}
        onContinue={qs => startSession(qs)}
        onWrongs={qs   => startSession(qs)}
        onRestart={() => startSession(allQuestions)}
        onStats={() => navigate('/statistics')}
        onBack={() => navigate('/subjects/math')}
      />
    )
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-hero)' }}>
        <button
          onClick={() => navigate('/subjects/math')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 20, lineHeight: 1, flexShrink: 0 }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📐 {meta?.topic.title}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Sual {idx + 1}/{activeQs.length} · {answers.length} cavablandı
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: 'white', flexShrink: 0 }}>
          <span style={{ fontSize: 10 }}>⏱</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{formatTime(elapsed)}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ height: '100%', background: 'var(--primary)' }}
        />
      </div>

      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 520, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${idx}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={SPRING}
          >
            <div style={{ borderRadius: 14, padding: 18, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Riyaziyyat · Sual {idx + 1}
              </p>

              {/* Image (if any) */}
              {currentQ.image && (
                <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img
                    src={currentQ.image}
                    alt="Sual diaqramı"
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 240, objectFit: 'contain', background: '#fff' }}
                  />
                </div>
              )}

              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', lineHeight: 1.7 }}>
                {currentQ.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`opts-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 9 }}
          >
            {currentQ.options.map((opt, i) => (
              <OptionBtn
                key={i}
                label={opt}
                letter={String.fromCharCode(65 + i)}
                phase={phase}
                isPending={pendingChoice === i}
                isCorrect={phase === 'revealed' && i === currentQ.correctIndex}
                isWrong={phase === 'revealed' && confirmedChoice === i && i !== currentQ.correctIndex}
                onClick={() => handleSelect(i)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Explanation (shown after reveal) */}
        <AnimatePresence>
          {phase === 'revealed' && currentQ.explanation && (
            <ExplanationPanel
              key={`exp-${idx}`}
              text={currentQ.explanation}
              isCorrect={confirmedOk}
            />
          )}
        </AnimatePresence>

        {/* Correct/wrong micro-toast when no explanation */}
        <AnimatePresence>
          {phase === 'revealed' && !currentQ.explanation && (
            <motion.div
              key={`micro-${idx}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '10px 14px', borderRadius: 10,
                background: confirmedOk ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
                border: `1px solid ${confirmedOk ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'}`,
                fontSize: 13, fontWeight: 700,
                color: confirmedOk ? 'var(--success)' : 'var(--danger)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {confirmedOk ? '✓ Düzgün cavab!' : '✗ Yanlış cavab'}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer buttons */}
      <footer style={{ padding: '12px 16px 32px', maxWidth: 520, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {phase === 'picking' ? (
          <>
            <Button
              fullWidth size="lg"
              onClick={handleConfirm}
              disabled={pendingChoice === null}
              style={{
                background: pendingChoice !== null ? 'var(--primary)' : undefined,
                opacity: pendingChoice !== null ? 1 : 0.45,
                transition: 'opacity 0.2s, background 0.2s',
              }}
            >
              {pendingChoice !== null ? '✓ Təsdiqlə' : 'Variant seçin'}
            </Button>
            {answers.length > 0 && (
              <Button fullWidth variant="ghost" size="md"
                onClick={() => finishQuiz(answers, activeQs)}
                loading={saving}
              >
                Testi bitir ({answers.length}/{activeQs.length})
              </Button>
            )}
          </>
        ) : (
          <Button
            fullWidth size="lg"
            onClick={handleAdvance}
            style={{ background: 'var(--primary)' }}
          >
            {idx + 1 < activeQs.length ? 'Davam et →' : saving ? 'Yadda saxlanılır...' : '✓ Bitir'}
          </Button>
        )}
      </footer>
    </div>
  )
}
