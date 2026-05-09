// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePanels } from '../SlidePanel'
import { useActivityData } from '@/hooks/useTeacherAnalytics'
import type { Period } from '@/hooks/useTeacherAnalytics'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

// ── Day popup ──────────────────────────────────────────────────────────────────

function DayPopup({ day }: { day: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={SPRING}
      style={{
        position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)',
        borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        minWidth: 148, whiteSpace: 'nowrap',
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
        {day.label} — {day.count} test
      </p>
      <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>⏰ Pik saat: {day.peakHour}</p>
      <p style={{ fontSize: 10, color: 'var(--text-3)' }}>📖 Əsas mövzu: {day.topTopic}</p>
    </motion.div>
  )
}

// ── Full analysis panel ────────────────────────────────────────────────────────

function ActivityAnalysisContent({ days, total }: { days: any[]; total: number }) {
  const maxCount = Math.max(...days.map(d => d.count), 1)
  const activeDays = days.filter(d => d.count > 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI chips */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Bu həftə</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{total}</p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>test tamamlandı</p>
        </div>
        <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Günlük ort.</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#34C759', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {Math.round(total / Math.max(activeDays, 1))}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>test/gün</p>
        </div>
      </div>

      {/* Day breakdown */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Günlük Bölgü
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {days.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11, minWidth: 34,
                fontWeight: d.isToday ? 700 : 400,
                color: d.isToday ? 'var(--primary)' : 'var(--text-3)',
              }}>
                {d.label}
              </span>
              <div style={{ flex: 1, height: 6, borderRadius: 6, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: d.count ? `${(d.count / maxCount) * 100}%` : '0%' }}
                  transition={{ delay: 0.04 * i, duration: 0.5 }}
                  style={{
                    height: '100%', borderRadius: 6,
                    background: d.isToday ? 'var(--primary)' : d.isFuture ? 'transparent' : 'rgba(79,135,255,0.5)',
                  }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', minWidth: 28, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {d.count || '–'}
              </span>
              {d.count > 0 && (
                <span style={{ fontSize: 9, color: 'var(--text-3)', minWidth: 44 }}>{d.peakHour}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top topics */}
      <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Ən Aktiv Günlər
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[...days]
            .filter(d => d.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((d, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(79,135,255,0.1)', border: '0.5px solid rgba(79,135,255,0.25)', color: 'var(--primary)' }}>
                {d.label} — {d.count} test
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props { period: Period; groupId: string }

export default function WeeklyActivityChart({ period, groupId }: Props) {
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const { push } = usePanels()
  const { days, total } = useActivityData(period, groupId)
  const maxCount = Math.max(...days.map(d => d.count), 1)

  const openAnalysis = () => push({
    id:       'activity-analysis',
    title:    'Aktivlik Analizi',
    subtitle: `${total} test · Bu həftə`,
    content:  <ActivityAnalysisContent days={days} total={total} />,
  })

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <motion.button
            whileHover={{ opacity: 0.78 }} whileTap={{ scale: 0.97 }}
            onClick={openAnalysis}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
              Həftəlik Aktivlik ↗
            </p>
          </motion.button>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Sütunu tıkla → gün detalı</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--primary)',
          background: 'rgba(79,135,255,0.1)', padding: '3px 8px', borderRadius: 8, fontFamily: 'var(--font-mono)',
        }}>
          Σ {total}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
        {days.map((d, i) => {
          const h = d.count ? Math.max(6, Math.round((d.count / maxCount) * 62)) : 0
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
              <AnimatePresence>
                {activeDay === i && d.count > 0 && <DayPopup day={d} />}
              </AnimatePresence>
              <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.55, ease: 'easeOut' }}
                  whileHover={{ opacity: 0.84 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveDay(activeDay === i ? null : i)}
                  style={{
                    width: '100%', borderRadius: '5px 5px 3px 3px',
                    cursor: d.count > 0 ? 'pointer' : 'default',
                    background: d.isToday
                      ? 'linear-gradient(180deg, #6EA3FF 0%, var(--primary) 100%)'
                      : d.isFuture
                        ? 'var(--bg-hover)'
                        : 'rgba(79,135,255,0.28)',
                    boxShadow: d.isToday ? '0 0 14px rgba(79,135,255,0.38)' : 'none',
                  }}
                />
              </div>
              <span style={{
                fontSize: 9, fontWeight: d.isToday ? 700 : 400,
                color: d.isToday ? 'var(--primary)' : 'var(--text-3)',
              }}>
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
