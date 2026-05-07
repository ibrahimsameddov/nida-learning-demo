import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate }      from 'react-router-dom'
import { useQueryClient }              from '@tanstack/react-query'
import { MATH_QUESTIONS, MathQ }      from '../../../lib/mathQuestions'
import { MATH_CHAPTERS }              from '../../../lib/mathTopics'
import { dbSaveTestResult }           from '../../../lib/db'
import { Button }                     from '../../../components/ui/Button'


function findTopic(topicId: string) {
  for (const ch of MATH_CHAPTERS) {
    const t = ch.topics.find(t => t.id === topicId)
    if (t) return { topic: t, chapter: ch }
  }
  return null
}

interface DoneData {
  correct:      number
  total:        number
  pct:          number
  wrongQs:      MathQ[]
  remainingQs:  MathQ[]
  saveError:    string | null
}

export default function MathQuiz() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate    = useNavigate()
  const qc          = useQueryClient()

  const allQuestions = MATH_QUESTIONS[topicId!] ?? []
  const meta         = findTopic(topicId!)

  // activeQs — cavablanacaq aktiv suallar (tam, yalnız səhvlər, yaxud qalan)
  const [activeQs,      setActiveQs]      = useState<MathQ[]>(allQuestions)
  const [idx,           setIdx]           = useState(0)
  const [answers,       setAnswers]       = useState<boolean[]>([])
  const [pendingChoice, setPendingChoice] = useState<number | null>(null)
  const [doneData,      setDoneData]      = useState<DoneData | null>(null)
  const [saving,        setSaving]        = useState(false)
  const [elapsed,       setElapsed]       = useState(0)
  const timerRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const totalStart = useRef(Date.now())

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  const currentQ = activeQs[idx]
  const progress = activeQs.length > 0 ? (idx / activeQs.length) * 100 : 0

  // 1-ci addım: variantı seç (vurgulan, hələ qeyd edilmir)
  const handleSelect = (i: number) => {
    setPendingChoice(i)
  }

  // 2-ci addım: "Təsdiqlə" düyməsi ilə cavabı qeyd et
  const handleConfirm = () => {
    if (pendingChoice === null) return
    const correct    = pendingChoice === currentQ.correctIndex
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)
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

    // Hansı suallar səhv cavablandı
    const wrongQs: MathQ[] = qs.filter((_, i) => finalAnswers[i] === false)
    // Hansı suallar cavabsız qaldı (yalnız tam sual siyahısı üçün mənalıdır)
    const answeredIds = new Set(qs.slice(0, total).map(q => q.id))
    const remainingQs: MathQ[] = allQuestions.filter(q => !answeredIds.has(q.id))

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
      setDoneData({ correct, total, pct: percent, wrongQs, remainingQs, saveError })
    }
  }



  const startSession = (qs: MathQ[]) => {
    setActiveQs(qs)
    setIdx(0)
    setAnswers([])
    setPendingChoice(null)
    setDoneData(null)
    setElapsed(0)
    totalStart.current = Date.now()
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  // No questions
  if (allQuestions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <p style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Bu mövzu üçün hələ sual yoxdur</p>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>{meta?.topic.title}</p>
        <Button onClick={() => navigate('/subjects/math')}>← Geri qayıt</Button>
      </div>
    )
  }

  // ── Nəticə ekranı ────────────────────────────────────────────────────────
  if (doneData) {
    const { correct, total, pct, wrongQs, remainingQs, saveError } = doneData
    const color = pct >= 75 ? 'var(--success)' : pct >= 55 ? 'var(--warning)' : 'var(--danger)'

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card anim-fade-up" style={{ width: '100%', maxWidth: 420, padding: '28px 24px' }}>

          {/* Save xətası varsa göstər */}
          {saveError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, fontSize: 12,
              background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.4)',
              color: 'var(--danger)', lineHeight: 1.5 }}>
              <strong>⚠️ Xəta:</strong> {saveError}<br/>
              <span style={{ opacity: 0.7 }}>Statistika yadda saxlanılmadı. Firebase Console-da Firestore Security Rules-u yoxlayın.</span>
            </div>
          )}

          {/* Başlıq */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>
              {pct >= 75 ? '🏆' : pct >= 55 ? '👍' : '📚'}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>
              {meta?.topic.title}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Test başa çatdı</p>
          </div>

          {/* Nəticə rəqəmləri */}
          <div style={{ fontSize: 44, fontWeight: 800, color, textAlign: 'center', fontFamily: 'monospace', marginBottom: 6 }}>
            {pct}%
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {correct} düzgün</span>
            {total - correct > 0 && (
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>✗ {total - correct} səhv</span>
            )}
            {remainingQs.length > 0 && (
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>⏭ {remainingQs.length} qalan</span>
            )}
          </div>
          <div className="progress" style={{ height: 6, marginBottom: 24 }}>
            <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
          </div>

          {/* Seçimlər */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Davam et — yalnız cavabsız suallar varsa */}
            {remainingQs.length > 0 && (
              <Button fullWidth size="lg" onClick={() => startSession(remainingQs)}>
                ▶ Davam et  ({remainingQs.length} sual)
              </Button>
            )}

            {/* Yalnız səhvlər — yalnız səhv varsa */}
            {wrongQs.length > 0 && (
              <Button fullWidth size="lg" onClick={() => startSession(wrongQs)}
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
                ✗ Səhvləri işlə  ({wrongQs.length} sual)
              </Button>
            )}

            {/* Sıfırdan başla */}
            <Button fullWidth variant="secondary" onClick={() => startSession(allQuestions)}>
              ↺ Sıfırdan başla
            </Button>

            {/* Statistika — həmişə görünür */}
            <Button fullWidth variant="secondary" onClick={() => navigate('/statistics')}
              style={{ background: 'rgba(0,229,160,0.1)', borderColor: 'rgba(0,229,160,0.4)', color: 'var(--success)' }}>
              📊 Statistikaya keç
            </Button>

            {/* Əsas səhifə */}
            <Button fullWidth variant="ghost" onClick={() => navigate('/subjects/math')}>
              ← Mövzu siyahısına qayıt
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz ekranı ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-hero)' }}>
        <button
          onClick={() => navigate('/subjects/math')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 20, lineHeight: 1 }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <span style={{ fontSize: 10 }}>⏱</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{formatTime(elapsed)}</span>
        </div>
      </header>

      <div style={{ height: 3, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
      </div>

      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <div style={{ borderRadius: 12, padding: 16, marginBottom: 20, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Riyaziyyat
          </p>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', lineHeight: 1.6 }}>
            {currentQ.text}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQ.options.map((opt, i) => {
            const isSelected = pendingChoice === i
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '13px 16px',
                  borderRadius: 10,
                  border: isSelected ? '1.5px solid var(--primary)' : '0.5px solid var(--border)',
                  background: isSelected ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
                  cursor: 'pointer', fontSize: 14, color: 'var(--text-1)',
                  transition: 'border-color 0.15s, background 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                  background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  color: isSelected ? '#fff' : 'var(--text-3)',
                  border: isSelected ? 'none' : '0.5px solid var(--border)',
                  transition: 'all 0.15s',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      </main>

      <footer style={{ padding: '12px 16px 28px', maxWidth: 520, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Əsas: Təsdiqlə */}
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

        {/* Erkən bitirmə — ən azı 1 cavab verildikdə */}
        {answers.length > 0 && (
          <Button fullWidth variant="ghost" size="md"
            onClick={() => finishQuiz(answers, activeQs)}
            loading={saving}
          >
            Testi bitir ({answers.length}/{activeQs.length})
          </Button>
        )}
      </footer>
    </div>
  )
}
