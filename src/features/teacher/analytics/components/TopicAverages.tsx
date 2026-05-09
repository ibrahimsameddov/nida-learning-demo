// @ts-nocheck
import { useState }                from 'react'
import { useNavigate }             from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const TOPICS = [
  { name: 'Cəbr',           icon: '🔢', avg: 62, trend: +4, weak: 5, note: 'Binom teorem ən çətin mövzudur' },
  { name: 'Həndəsə',        icon: '📐', avg: 75, trend: +2, weak: 2, note: 'Bu ay əhəmiyyətli irəliləyiş var' },
  { name: 'Triqonometriya', icon: '〰️', avg: 48, trend: -6, weak: 8, note: 'Tənliklər bölməsindən çoxu keçmir' },
  { name: 'Funksiyalar',    icon: '📈', avg: 55, trend: +1, weak: 6, note: 'Mürəkkəb funksiyalar çətin gəlir' },
  { name: 'Ehtimal',        icon: '🎲', avg: 71, trend: +8, weak: 3, note: 'Kombinatorika bölməsi yaxşılaşıb' },
  { name: 'Loqarifmlər',   icon: '📊', avg: 67, trend: -2, weak: 4, note: 'Hesablama səhvləri hələ çoxdur' },
]

function barColor(v: number) { return v >= 70 ? '#34C759' : v >= 50 ? '#FF9F0A' : '#FF453A' }

// ── Topic detail bottom-sheet ──────────────────────────────────────────────────

function TopicDetailModal({ topic, onClose }) {
  const navigate = useNavigate()
  if (!topic) return null

  const color = barColor(topic.avg)
  const total = 14
  const dist = [
    { range: '90–100%', count: Math.max(0, Math.round((total - topic.weak) * 0.35)), c: '#30D158' },
    { range: '70–89%',  count: Math.max(0, Math.round((total - topic.weak) * 0.55)), c: '#34C759' },
    { range: '50–69%',  count: Math.max(0, Math.round(topic.weak * 0.5)),            c: '#FF9F0A' },
    { range: '0–49%',   count: Math.max(0, Math.round(topic.weak * 0.5)),            c: '#FF453A' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'var(--bg-overlay)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 44 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 44 }}
        transition={SPRING}
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: '20px 20px 16px 16px', padding: '12px 20px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              {topic.icon} {topic.name}
            </p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '2px 9px', borderRadius: 8 }}>
                ⌀ {topic.avg}%
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 8, background: topic.trend > 0 ? 'rgba(52,199,89,0.12)' : 'rgba(255,69,58,0.12)', color: topic.trend > 0 ? '#34C759' : '#FF453A' }}>
                {topic.trend > 0 ? '↑' : '↓'} {Math.abs(topic.trend)}% bu ay
              </span>
              {topic.weak > 4 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF453A', background: 'rgba(255,69,58,0.1)', padding: '2px 9px', borderRadius: 8 }}>
                  ⚠ {topic.weak} şagird zəif
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-3)' }}>✕</button>
        </div>

        {/* Qeyd */}
        <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)', marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>💡 {topic.note}</p>
        </div>

        {/* Nəticə paylanması */}
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Nəticə Paylanması ({total} şagird)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {dist.map((d, i) => (
            <div key={d.range} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 64 }}>{d.range}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 6, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.count / total) * 100}%` }}
                  transition={{ delay: 0.06 * i, duration: 0.5 }}
                  style={{ height: '100%', borderRadius: 6, background: d.c }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.c, minWidth: 20, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {d.count}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: '📝 Tapşırıq Yarat', path: '/teacher/tasks',    color: 'var(--primary)' },
            { label: '📋 İmtahan Yarat',  path: '/teacher/exams',    color: null },
          ].map(({ label, path, color: c }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { onClose(); navigate(path) }}
              style={{
                padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: c ? `color-mix(in srgb, ${c} 12%, var(--bg-hover))` : 'var(--bg-hover)',
                border: c ? `0.5px solid color-mix(in srgb, ${c} 28%, var(--border))` : '0.5px solid var(--border)',
                color: c ?? 'var(--text-2)',
              }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TopicAverages() {
  const [selected, setSelected] = useState<any>(null)

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
            Mövzu Ortalaması
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Hər mövzu üzrə qrup statistikası · tıkla → detal
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TOPICS.map((t, i) => {
            const color = barColor(t.avg)
            return (
              <motion.div
                key={t.name}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(t)}
                style={{ cursor: 'pointer', borderRadius: 8, padding: '2px 0' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</span>
                    {t.weak > 5 && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#FF453A', background: 'rgba(255,69,58,0.1)', padding: '1px 6px', borderRadius: 6 }}>
                        {t.weak} zəif
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: t.trend > 0 ? 'rgba(52,199,89,0.12)' : 'rgba(255,69,58,0.12)', color: t.trend > 0 ? '#34C759' : '#FF453A' }}>
                      {t.trend > 0 ? '↑' : '↓'} {Math.abs(t.trend)}%
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-mono)', minWidth: 32, textAlign: 'right' }}>
                      {t.avg}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 5, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.avg}%` }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.6 }}
                    style={{ height: '100%', borderRadius: 5, background: color }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <TopicDetailModal topic={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
