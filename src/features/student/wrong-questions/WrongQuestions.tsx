import { useNavigate } from 'react-router-dom'

const WRONG = [
  { id: 1, subject: 'Riyaziyyat',      text: 'log₂(8) = ?',                correct: '3',           yours: '2',            date: 'Bu gün'        },
  { id: 2, subject: 'Azərbaycan dili', text: '"Gəlmişdi" felinin zamanı?', correct: 'Uzaq keçmiş', yours: 'Şühudi keçmiş', date: 'Dünən'         },
  { id: 3, subject: 'İngilis dili',    text: '"child" sözünün cəm forması?', correct: 'children',  yours: 'childs',        date: '3 gün əvvəl'   },
  { id: 4, subject: 'Fizika',          text: 'sin(30°) = ?',               correct: '1/2',          yours: '√3/2',         date: '3 gün əvvəl'   },
  { id: 5, subject: 'Riyaziyyat',      text: 'C(5,2) = ?',                 correct: '10',           yours: '20',           date: '1 həftə əvvəl' },
]

const ICONS: Record<string, string> = {
  'Riyaziyyat': '📐', 'Azərbaycan dili': '📖',
  'İngilis dili': '🌍', 'Fizika': '⚡', 'Kimya': '🧪',
}

export default function WrongQuestions() {
  const navigate = useNavigate()

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        Yanlış Suallar
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>
        Spaced repetition — yanlış suallar avtomatik geri qayıdır
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className="badge badge-danger">{WRONG.length} yanlış</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Növbəti təkrar: 3 gün sonra</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {WRONG.map((q, i) => (
          <div key={q.id} className={`card anim-fade-up d${Math.min(i + 1, 5)}`} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{ICONS[q.subject] || '📚'}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {q.subject}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{q.date}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12, lineHeight: 1.5 }}>
              {q.text}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Düzgün: </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{q.correct}</span>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Sizin: </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>{q.yours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={() => navigate('/subjects')}>
        Yanlış Sualları Təkrar Et
      </button>
    </div>
  )
}
