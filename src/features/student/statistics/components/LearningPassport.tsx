import { useRef } from 'react'
import { motion } from 'framer-motion'
import { usePassport } from '@/hooks/useAnalytics'
import { useGamificationStore } from '@/stores/gamificationStore'
import { getLevelInfo } from '@/stores/gamificationStore'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

function scoreColor(s: number) {
  if (s >= 80) return 'var(--success)'
  if (s >= 60) return 'var(--primary)'
  if (s >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

export default function LearningPassport() {
  const { passport, isLoading } = usePassport()
  const { xp, streak, longestStreak, badges } = useGamificationStore()
  const { level, label: levelLabel, color: levelColor, progress: levelProgress } = getLevelInfo(xp)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleExport = () => {
    if (!cardRef.current) return
    // Simple text-based export (print dialog)
    window.print()
  }

  if (isLoading || !passport) {
    return (
      <div className="card" style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Pasport hazırlanır…</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      {/* Passport card */}
      <div
        ref={cardRef}
        style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
          border: '0.5px solid var(--border-strong)',
          borderRadius: 20,
          padding: '24px 20px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {/* Background shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--shimmer-line)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `color-mix(in srgb, ${levelColor} 15%, var(--bg-card))`,
            border: `1.5px solid ${levelColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            🎓
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              Öyrənmə Pasportu
            </p>
            <p style={{ fontSize: 11, color: levelColor, fontWeight: 700, marginTop: 2 }}>
              Səviyyə {level} — {levelLabel}
            </p>
          </div>
          {/* XP badge */}
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{xp.toLocaleString()}</p>
            <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>XP</p>
          </div>
        </div>

        {/* Level progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Səviyyə irəliləyişi</span>
            <span style={{ fontSize: 10, color: levelColor, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{levelProgress}%</span>
          </div>
          <div className="progress" style={{ height: 6 }}>
            <motion.div
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              style={{ background: `linear-gradient(90deg, ${levelColor}, color-mix(in srgb, ${levelColor} 60%, var(--primary)))` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <StatBox label="Test"        value={passport.totalTests}           unit=""    color="var(--primary)" />
          <StatBox label="Ortalama"    value={`${passport.avgScore}%`}       unit=""    color={scoreColor(passport.avgScore)} />
          <StatBox label="Ən yaxşı"    value={`${passport.bestScore}%`}      unit=""    color="var(--success)" />
          <StatBox label="Streak"      value={`${streak} gün`}               unit=""    color="var(--warning)" />
          <StatBox label="Rekord"      value={`${longestStreak} gün`}        unit=""    color="var(--accent)" />
          <StatBox label="Saatlər"     value={`${passport.totalHours}s`}     unit=""    color="var(--text-2)" />
        </div>

        {/* Subjects */}
        {passport.subjects.length > 0 && (
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Fənn üzrə nəticələr
            </p>
            {passport.subjects.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{s.tests} test</span>
                <div style={{ width: 70, flexShrink: 0 }}>
                  <div className="progress" style={{ height: 4 }}>
                    <motion.div
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.05 }}
                      style={{ background: scoreColor(s.score) }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: scoreColor(s.score), fontFamily: 'var(--font-mono)', width: 30, textAlign: 'right', flexShrink: 0 }}>{s.score}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Badges row */}
        {badges.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Qazanılmış nişanlar ({badges.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {badges.map(b => (
                <span key={b.id} title={b.description} style={{
                  fontSize: 20, cursor: 'help',
                  filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.3))',
                }}>
                  {b.icon}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generated date */}
        <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 16, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
          {new Date(passport.generatedAt).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        className="btn btn-ghost btn-full"
        style={{ fontSize: 13 }}
      >
        🖨️ Pasportu Çap Et
      </button>
    </motion.div>
  )
}

function StatBox({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <div style={{
      padding: '10px 8px', borderRadius: 10, textAlign: 'center',
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
    }}>
      <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 3, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 900, color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}{unit}</p>
    </div>
  )
}
