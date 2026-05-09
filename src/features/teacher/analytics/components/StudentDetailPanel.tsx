// @ts-nocheck
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStudentDetail } from '@/hooks/useTeacherAnalytics'
import { usePanels } from '../SlidePanel'

function barColor(v: number) { return v >= 70 ? '#34C759' : v >= 50 ? '#FF9F0A' : '#FF453A' }

interface Props { name: string; uid?: string }

export default function StudentDetailPanel({ name, uid }: Props) {
  const navigate = useNavigate()
  const { clear } = usePanels()
  const { eri, streak, total, avgScore, topicScores, recentResults } = useStudentDetail(name, uid)
  const eriColor   = barColor(eri)
  const maxR       = Math.max(...recentResults.map(r => r.score), 1)
  const weakTopics = topicScores.filter(t => t.score < 55)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 900, color: 'var(--text-on-accent)',
        }}>
          {(name ?? '?')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
            {name}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: eriColor, background: `${eriColor}18`, padding: '2px 8px', borderRadius: 8 }}>
              ERI {eri}
            </span>
            {streak > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#FF9F0A', background: 'rgba(255,159,10,0.12)', padding: '2px 8px', borderRadius: 8 }}>
                🔥 {streak} gün
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 8 }}>
              ✍️ {total} test · ⌀ {avgScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Son 7 nəticə */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Son 7 Nəticə
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 64 }}>
          {recentResults.map((r, i) => {
            const h = Math.max(4, Math.round((r.score / maxR) * 48))
            const c = barColor(r.score)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: c, fontWeight: 700 }}>{r.score}</span>
                <div style={{ width: '100%', height: 48, display: 'flex', alignItems: 'flex-end' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ delay: 0.03 * i, duration: 0.38 }}
                    style={{ width: '100%', borderRadius: '4px 4px 2px 2px', background: `${c}44`, border: `1px solid ${c}88` }}
                  />
                </div>
                <span style={{ fontSize: 7, color: 'var(--text-3)', textAlign: 'center' }}>{r.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mövzu performansı */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Mövzu üzrə Performans
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {topicScores.map((t, i) => {
            const c = barColor(t.score)
            return (
              <div key={t.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.icon} {t.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{t.score}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.score}%` }}
                    transition={{ delay: 0.04 * i, duration: 0.5 }}
                    style={{ height: '100%', borderRadius: 4, background: c }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Zəif mövzular */}
      {weakTopics.length > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,69,58,0.07)', border: '0.5px solid rgba(255,69,58,0.2)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#FF453A', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            ⚠ Zəif Mövzular
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {weakTopics.map(t => (
              <span key={t.name} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.25)', color: '#FF453A' }}>
                {t.icon} {t.name} — {t.score}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: '📝 Tapşırıq', path: '/teacher/tasks',    color: 'var(--primary)' },
          { label: '💬 Mesaj',    path: '/teacher/messages', color: null },
          { label: '👨‍👩‍👧 Valideyn', path: '/teacher/messages', color: null },
        ].map(({ label, path, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { clear(); navigate(path) }}
            style={{
              padding: '10px 6px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: color ? `color-mix(in srgb, ${color} 12%, var(--bg-hover))` : 'var(--bg-hover)',
              border: color ? `0.5px solid color-mix(in srgb, ${color} 28%, var(--border))` : '0.5px solid var(--border)',
              color: color ?? 'var(--text-2)',
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
