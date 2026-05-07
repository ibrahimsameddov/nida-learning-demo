// @ts-nocheck
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sidebar }   from '@/components/layout/Sidebar'
import { Topbar }    from '@/components/layout/GlassTopbar'
import { BottomNav } from '@/components/layout/BottomNav'

const SUBJECT_ICONS: Record<string, string> = {
  'Riyaziyyat':        '📐',
  'Azərbaycan dili':   '📝',
  'Rus dili':          '🇷🇺',
  'İngilis dili':      '🇬🇧',
  'Fizika':            '⚡',
  'Kimya':             '🧪',
  'Biologiya':         '🧬',
  'Tarix':             '🏛️',
  'Coğrafiya':         '🌍',
  'Ədəbiyyat':         '📚',
  'İnformatika':       '💻',
}

const EXAM_LABELS: Record<string, string> = {
  buraxilis: 'Buraxılış İmtahanı',
  qebul:     'Qəbul İmtahanı',
}

export default function TopicQuizPage() {
  const navigate          = useNavigate()
  const [params]          = useSearchParams()
  const exam              = params.get('exam') ?? ''
  const subject           = params.get('subject') ?? ''
  const icon              = SUBJECT_ICONS[subject] ?? '📖'

  // Math has its own topic-selection page
  useEffect(() => {
    if (subject === 'Riyaziyyat') {
      navigate('/subjects/math', { replace: true })
    }
  }, [subject, navigate])

  if (subject === 'Riyaziyyat') return null

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>

          <div style={{
            width: 72, height: 72, borderRadius: 20, marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          }}>{icon}</div>

          <h1 style={{
            fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800,
            fontSize: 22, color: 'var(--text-1)', marginBottom: 6, textAlign: 'center',
          }}>{subject}</h1>

          {exam && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999,
              background: 'rgba(79,135,255,0.12)', color: '#4F87FF', marginBottom: 32,
            }}>{EXAM_LABELS[exam] ?? exam}</span>
          )}

          <div style={{
            textAlign: 'center', padding: '32px 24px', maxWidth: 360,
            background: 'var(--bg-card)', borderRadius: 20,
            border: '0.5px solid var(--border)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🚀</div>
            <div style={{
              fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700,
              fontSize: 16, color: 'var(--text-1)', marginBottom: 8,
            }}>
              Testlər hazırlanır
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
              {subject} fənni üzrə testlər tezliklə əlavə olunacaq.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 24, padding: '11px 28px', borderRadius: 12,
              border: '0.5px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Geri
          </button>

        </div>
      </main>
    </div>
  )
}
