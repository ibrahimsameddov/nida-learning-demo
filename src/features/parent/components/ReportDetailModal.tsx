// @ts-nocheck
import { motion } from 'framer-motion'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

interface Props { report: any; onClose: () => void }

export default function ReportDetailModal({ report, onClose }: Props) {
  const data = report.data ?? {}
  const avgColor = (data.avgScore ?? 0) >= 75 ? 'var(--success)' : (data.avgScore ?? 0) >= 55 ? 'var(--warning)' : 'var(--danger)'

  const weekLabel = report.weekStart
    ? new Date(report.weekStart).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long' }) +
      ' – ' +
      new Date(report.weekEnd).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long' })
    : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9600,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
          border: '0.5px solid var(--border-card)',
          padding: '20px 20px 40px',
          width: '100%', maxWidth: 480,
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
              Həftəlik Hesabat
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{weekLabel}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: avgColor, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {data.avgScore ?? 0}%
            </p>
          </div>
        </div>

        {/* Generated text */}
        {report.generatedText && (
          <div style={{
            padding: '14px', borderRadius: 12, marginBottom: 18,
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.7 }}>{report.generatedText}</p>
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 18 }}>
          <StatBox label="Test sayı"    value={data.testsCompleted ?? 0}               color="var(--primary)" />
          <StatBox label="Öyrənmə vaxtı" value={`${Math.round((data.timeSpentMinutes ?? 0) / 60 * 10) / 10} saat`} color="var(--accent)" />
          <StatBox label="Ən yaxşı fənn"  value={data.bestSubject ?? '—'}              color="var(--success)" />
          <StatBox label="Zəif fənn"    value={data.weakestSubject ?? '—'}             color="var(--danger)"  />
        </div>

        {/* Streak */}
        {data.streakStatus && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderRadius: 12, marginBottom: 14,
            background: data.streakStatus === 'new_record' ? 'rgba(255,179,71,0.08)' :
                        data.streakStatus === 'broken'     ? 'rgba(255,77,109,0.08)' : 'rgba(0,229,160,0.08)',
            border: `0.5px solid ${
              data.streakStatus === 'new_record' ? 'rgba(255,179,71,0.25)' :
              data.streakStatus === 'broken'     ? 'rgba(255,77,109,0.25)' : 'rgba(0,229,160,0.25)'
            }`,
          }}>
            <span style={{ fontSize: 20 }}>
              {data.streakStatus === 'new_record' ? '🏆' : data.streakStatus === 'broken' ? '💔' : '🔥'}
            </span>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>
              {data.streakStatus === 'new_record' ? 'Yeni ardıcıllıq rekoru qırıldı!' :
               data.streakStatus === 'broken'     ? 'Bu həftə seriya qırıldı' : 'Ardıcıl öyrənmə davam edir'}
            </p>
          </div>
        )}

        {/* Milestone */}
        {data.milestoneAchieved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderRadius: 12, background: 'rgba(201,168,76,0.08)',
            border: '0.5px solid rgba(201,168,76,0.25)',
          }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
              "{data.milestoneAchieved}" nailiyyəti qazanıldı!
            </p>
          </div>
        )}

        <button onClick={onClose} className="btn btn-ghost btn-full" style={{ marginTop: 16, fontSize: 13 }}>
          Bağla
        </button>
      </motion.div>
    </motion.div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
    }}>
      <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 3, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>{value}</p>
    </div>
  )
}
