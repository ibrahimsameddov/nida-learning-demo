// @ts-nocheck
import { useNavigate }             from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GroupERIGauge               from './GroupERIGauge'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const STUDENT_NAMES = [
  'Əli H.', 'Nigar M.', 'Rauf C.', 'Leyla S.',
  'Fərid A.', 'Günel T.', 'Murad K.', 'Sevinc O.', 'Tural İ.', 'Aynur B.',
]
const TOPICS = ['Cəbr', 'Həndəsə', 'Triqonometriya', 'Funksiyalar', 'Ehtimal']

function lcg(s: number) { return (((1664525 * (s >>> 0) + 1013904223) >>> 0) / 4294967296) }
function strSeed(str: string) { return [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0 }
function barColor(v: number) { return v >= 70 ? '#34C759' : v >= 50 ? '#FF9F0A' : '#FF453A' }

const RANKS = ['🥇', '🥈', '🥉']

interface Props { group: any | null; onClose: () => void }

export default function GroupDetailModal({ group, onClose }: Props) {
  const navigate = useNavigate()
  if (!group) return null

  const seed  = strSeed(group.name ?? '')
  const eri   = group.eri ?? group.groupERI ?? Math.round(52 + lcg(seed) * 38)
  const count = group.studentCount ?? Math.round(10 + lcg(seed + 1) * 8)

  const students = STUDENT_NAMES.slice(0, Math.min(count, 10))
    .map((name, i) => ({ name, score: Math.round(33 + lcg(seed * 3 + i * 7) * 57) }))
    .sort((a, b) => b.score - a.score)

  const topicAvgs = TOPICS.map((t, i) => ({
    topic: t,
    avg: Math.round(38 + lcg(seed * 5 + i * 9) * 52),
  }))
  const weakTopics = topicAvgs.filter(t => t.avg < 60)

  return (
    <AnimatePresence>
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
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 52 }}
          transition={SPRING}
          style={{
            width: '100%', maxWidth: 520,
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: '20px 20px 16px 16px', overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
          </div>

          <div style={{ padding: '12px 20px 28px', maxHeight: '82vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <GroupERIGauge score={eri} size={68} />
                <div>
                  <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
                    {group.name}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 8 }}>
                      👥 {count} şagird
                    </span>
                    {(group.pendingCount ?? 0) > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'rgba(255,69,58,0.1)', padding: '2px 8px', borderRadius: 8 }}>
                        ⚠ {group.pendingCount} müdaxilə
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-3)', flexShrink: 0 }}>✕</button>
            </div>

            {/* Zəif mövzular */}
            {weakTopics.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,69,58,0.07)', border: '0.5px solid rgba(255,69,58,0.2)', marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#FF453A', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                  ⚠ Zəif Mövzular
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {weakTopics.map(t => (
                    <span key={t.topic} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.25)', color: '#FF453A' }}>
                      {t.topic} — {t.avg}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mövzu ortalamaları */}
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              Mövzu Ortalamaları
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {topicAvgs.map((t, i) => {
                const c = barColor(t.avg)
                return (
                  <div key={t.topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.topic}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{t.avg}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.avg}%` }}
                        transition={{ delay: 0.04 * i, duration: 0.5 }}
                        style={{ height: '100%', borderRadius: 4, background: c }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Şagird sıralaması */}
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              Şagird Sıralaması
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
              {students.map((s, i) => {
                const c = barColor(s.score)
                return (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, flexShrink: 0, width: 22 }}>
                      {RANKS[i] ?? <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{s.name}</span>
                    <div style={{ width: 72, height: 5, borderRadius: 5, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ delay: 0.03 * i, duration: 0.5 }}
                        style={{ height: '100%', borderRadius: 5, background: c }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: 'var(--font-mono)', minWidth: 34, textAlign: 'right' }}>
                      {s.score}%
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '📋 İmtahan Yarat', path: '/teacher/exams',    color: 'var(--primary)' },
                { label: '💬 Qrupa Mesaj',   path: '/teacher/messages', color: null },
              ].map(({ label, path, color }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate(path) }}
                  style={{
                    padding: '12px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
