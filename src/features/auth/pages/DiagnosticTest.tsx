import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const QUESTIONS = [
  { subject: 'Riyaziyyat',      text: 'log₂(8) = ?',                                        options: ['1','2','3','4'],                                                      correct: 2 },
  { subject: 'Riyaziyyat',      text: 'sin(30°) = ?',                                        options: ['1/2','√2/2','√3/2','1'],                                              correct: 0 },
  { subject: 'Azərbaycan dili', text: '"Gəlmişdi" sözü hansı zamanı ifadə edir?',            options: ['Şühudi keçmiş','Nəqli keçmiş','Uzaq keçmiş','Qeyri-müəyyən keçmiş'], correct: 2 },
  { subject: 'İngilis dili',    text: '"Child" sözünün cəmi hansıdır?',                      options: ['childs','children','childes','childrens'],                             correct: 1 },
  { subject: 'Fizika',          text: 'Işığın boşluqda sürəti (c) təxminən neçədir?',       options: ['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'],                   correct: 1 },
]

const LABELS = ['A', 'B', 'C', 'D']

const PAGE: React.CSSProperties = {
  minHeight: '100dvh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: 16, position: 'relative',
  overflow: 'hidden', background: 'var(--bg-primary)',
}

export default function DiagnosticTest() {
  const navigate = useNavigate()
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers,  setAnswers]  = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [revealed, setRevealed] = useState(false)
  const [done,     setDone]     = useState(false)

  const q      = QUESTIONS[current]
  const isLast = current === QUESTIONS.length - 1

  const choose  = (i: number) => { if (!revealed) setSelected(i) }
  const confirm = () => {
    if (selected === null) return
    const next = [...answers]; next[current] = selected
    setAnswers(next); setRevealed(true)
  }
  const advance = () => {
    if (isLast) { setDone(true) }
    else { setCurrent(c => c + 1); setSelected(null); setRevealed(false) }
  }

  const correct = answers.filter((a, i) => a === QUESTIONS[i].correct).length

  if (done) {
    const pct = Math.round((correct / QUESTIONS.length) * 100)
    return (
      <div style={PAGE}>
        <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {pct >= 70 ? '🎉' : pct >= 40 ? '📊' : '💪'}
          </div>
          <h2 style={{ fontFamily: "'Lexend Deca','Lexend Deca',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>
            Diaqnostika Tamamlandı
          </h2>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 52, fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>
            {pct}%
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>
            {QUESTIONS.length} sualdan {correct} düzgün cavab verdiz.
            {pct >= 70 ? ' Əla başlanğıc!' : ' Planınız hazırlanacaq.'}
          </p>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/onboarding/group')}>
            Davam et →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={PAGE}>
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.3,
        background: 'var(--glow)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.35s ease both' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>
              Diaqnostik Test
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-2)' }}>
              {current + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'var(--border)' }}>
            <div style={{
              height: '100%', borderRadius: 999, background: 'var(--primary)',
              width: `${((current + (revealed ? 1 : 0)) / QUESTIONS.length) * 100}%`,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 8px var(--glow-sm)',
            }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{
          borderRadius: 20, padding: 24, marginBottom: 14,
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 10 }}>
            {q.subject}
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: 20 }}>
            {q.text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, i) => {
              let border = 'var(--border)'
              let bg     = 'rgba(255,255,255,0.02)'
              let color  = 'var(--text-1)'

              if (revealed) {
                if (i === q.correct)                          { border = 'var(--success)'; bg = 'rgba(0,229,160,0.1)'; color = 'var(--success)' }
                else if (i === selected && i !== q.correct)   { border = 'var(--danger)';  bg = 'rgba(255,77,109,0.1)'; color = 'var(--danger)'  }
              } else if (i === selected) {
                border = 'var(--primary)'; bg = 'rgba(0,212,255,0.08)'
              }

              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                    border: `1.5px solid ${border}`, background: bg,
                    cursor: revealed ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: (i === selected || (revealed && i === q.correct)) ? border : 'rgba(255,255,255,0.08)',
                    color: (i === selected || (revealed && i === q.correct)) ? '#fff' : 'var(--text-3)',
                  }}>
                    {LABELS[i]}
                  </span>
                  <span style={{ fontSize: 14, color, flex: 1 }}>{opt}</span>
                  {revealed && i === q.correct && <span style={{ color: 'var(--success)' }}>✓</span>}
                  {revealed && i === selected && i !== q.correct && <span style={{ color: 'var(--danger)' }}>✗</span>}
                </button>
              )
            })}
          </div>
        </div>

        {!revealed ? (
          <button
            className="btn btn-primary btn-full btn-lg"
            disabled={selected === null}
            onClick={confirm}
          >
            Cavabla
          </button>
        ) : (
          <button className="btn btn-primary btn-full btn-lg" onClick={advance}>
            {isLast ? 'Nəticəni gör' : 'Növbəti sual →'}
          </button>
        )}
      </div>
    </div>
  )
}
