// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetAllMyHomeworkAttempts } from '@/lib/api'

const ICONS: Record<string, string> = {
  'Riyaziyyat': '📐', 'Azərbaycan dili': '📝', 'Rus dili': '🇷🇺',
  'İngilis dili': '🇬🇧', 'Fizika': '⚡', 'Kimya': '🧪',
  'Biologiya': '🧬', 'Tarix': '🏛️', 'Coğrafiya': '🌍',
  'Ədəbiyyat': '📚', 'İnformatika': '💻',
}

function fmt(ts: any) {
  if (!ts) return ''
  const d   = new Date(ts)
  const diffD = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diffD === 0) return 'Bu gün'
  if (diffD === 1) return 'Dünən'
  if (diffD < 7)   return `${diffD} gün əvvəl`
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

export default function WrongQuestions() {
  const navigate = useNavigate()
  const [wrongQs,  setWrongQs]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    apiGetAllMyHomeworkAttempts()
      .then(attempts => {
        // Bütün cəhdlərdən yanlış sualları topla, dublikatları id-ə görə sil
        const all: any[] = []
        const seen = new Set<string>()
        for (const att of (attempts ?? [])) {
          const wqs = Array.isArray(att.wrongQuestions) ? att.wrongQuestions : []
          for (const wq of wqs) {
            const key = `${att.topicId ?? ''}_${wq.question}`
            if (!seen.has(key)) {
              seen.add(key)
              all.push({
                key,
                question:      wq.question,
                correctAnswer: wq.correctAnswer,
                studentAnswer: wq.studentAnswer,
                subject:       att.subject ?? 'Riyaziyyat',
                topicId:       att.topicId,
                date:          att.createdAt,
              })
            }
          }
        }
        setWrongQs(all)
      })
      .catch(() => setWrongQs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        Yanlış Suallar
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>
        Ev tapşırığı cəhdlərindən toplanan yanlış cavablar
      </p>

      {!loading && wrongQs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="badge badge-danger">{wrongQs.length} yanlış</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>Yüklənir...</div>
      ) : wrongQs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--bg-card)', borderRadius: 20,
          border: '0.5px solid var(--border)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            Yanlış sual yoxdur
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
            Ev tapşırıqlarını tamamladıqca yanlış cavablar burada görünəcək
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wrongQs.map((q, i) => (
              <div key={q.key} className={`card anim-fade-up d${Math.min(i + 1, 5)}`} style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>{ICONS[q.subject] ?? '📚'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {q.subject}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{fmt(q.date)}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12, lineHeight: 1.5 }}>
                  {q.question}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Düzgün: </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{q.correctAnswer}</span>
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Sizin: </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>{q.studentAnswer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-full"
            style={{ marginTop: 12 }}
            onClick={() => navigate('/subjects')}
          >
            Yanlış Sualları Təkrar Et
          </button>
        </>
      )}
    </div>
  )
}
