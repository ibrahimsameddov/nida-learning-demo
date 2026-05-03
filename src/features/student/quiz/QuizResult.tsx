import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { QuizResult } from '../../../types/models'

function emoji(pct: number) {
  if (pct >= 90) return '🏆'
  if (pct >= 75) return '🎉'
  if (pct >= 55) return '📊'
  return '💪'
}

function message(pct: number) {
  if (pct >= 90) return 'Əla nəticə! Çox yaxşısınız!'
  if (pct >= 75) return 'Yaxşı nəticə! Davam edin!'
  if (pct >= 55) return 'Orta nəticə. Daha çox məşq lazımdır.'
  return 'Zəif nəticə. Yanlış sualları təkrar edin.'
}

function colorForPct(pct: number) {
  if (pct >= 75) return 'var(--success, #10b981)'
  if (pct >= 55) return 'var(--warning, #f59e0b)'
  return 'var(--danger, #f43f5e)'
}

export default function QuizResult() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { state }     = useLocation()
  const result        = state?.result as QuizResult | undefined

  if (!result) {
    return (
      <div className="page-inner" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <p style={{ color: 'var(--text-3)' }}>Nəticə tapılmadı.</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/subjects')}>
          Fənlərə Qayıt
        </button>
      </div>
    )
  }

  const pct   = result.successRate
  const color = colorForPct(pct)

  return (
    <div className="page-inner anim-fade-up">

      {/* Score hero */}
      <div
        className="hero-card"
        style={{ textAlign: 'center', padding: '32px 24px', animation: 'fadeIn 0.4s ease' }}
      >
        <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji(pct)}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 52, fontWeight: 900, color, marginBottom: 8 }}>
          {pct}%
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{message(pct)}</p>
      </div>

      {/* Stats grid */}
      <div className="dash-grid">
        <StatCard value={result.correct} label="Düzgün"  color="var(--success, #10b981)" />
        <StatCard value={result.wrong}   label="Yanlış"  color="var(--danger, #f43f5e)"  />
        <StatCard value={result.skipped} label="Keçildi" color="var(--text-3)"            />
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="card-title">Ümumi Nəticə</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color, fontSize: 13 }}>
            {result.correct}/{result.total} sual
          </span>
        </div>
        <div className="progress" style={{ height: 8 }}>
          <div
            className="progress-bar"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color})`, boxShadow: 'none', transition: 'width 0.9s ease' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
          <span>⏱ {Math.round(result.timeSpent / 1000 / 60)} dəq {Math.round((result.timeSpent / 1000) % 60)} san</span>
          <span>{result.total} sual</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/subjects')}>
          Başqa Fənn Seç
        </button>
        {result.wrong > 0 && (
          <button className="btn btn-ghost btn-full" onClick={() => navigate('/wrong-questions')}>
            🔁 Yanlış Sualları Təkrar Et
          </button>
        )}
        <button className="btn btn-ghost btn-full" onClick={() => navigate('/statistics')}>
          📊 Statistikama Bax
        </button>
      </div>

    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="stat-mini">
      <div className="stat-val" style={{ color }}>{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}
