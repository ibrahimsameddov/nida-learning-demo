// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReportDetailModal from './ReportDetailModal'

const SPRING = { type: 'spring', stiffness: 220, damping: 22 }

interface Props {
  report:    any
  onMarkRead: (id: string) => void
}

export default function WeeklyReportCard({ report, onMarkRead }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const data   = report.data ?? {}
  const isNew  = !report.isRead

  const weekLabel = report.weekStart
    ? new Date(report.weekStart).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }) +
      ' – ' +
      new Date(report.weekEnd).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
    : 'Bu həftə'

  const avgColor = (data.avgScore ?? 0) >= 75 ? 'var(--success)' : (data.avgScore ?? 0) >= 55 ? 'var(--warning)' : 'var(--danger)'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        onClick={() => {
          setShowDetail(true)
          if (isNew) onMarkRead(report.id)
        }}
        style={{
          background: 'var(--bg-card)',
          border: isNew ? '0.5px solid var(--primary)' : '0.5px solid var(--border-card)',
          borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
          boxShadow: isNew ? '0 0 12px var(--glow-sm)' : 'none',
        }}
      >
        {isNew && (
          <div style={{
            position: 'absolute', top: 10, right: 12,
            width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)',
            boxShadow: '0 0 8px var(--primary)',
          }} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              📋 Həftəlik Hesabat
            </p>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
              {weekLabel}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: avgColor, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {data.avgScore ?? 0}%
            </p>
            <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>ORTALAMA</p>
          </div>
        </div>

        {report.generatedText && (
          <p style={{
            fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {report.generatedText}
          </p>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Chip label={`${data.testsCompleted ?? 0} test`} />
          {data.bestSubject && <Chip label={`✦ ${data.bestSubject}`} color="var(--success)" />}
          {data.streakStatus === 'new_record' && <Chip label="🏆 Rekord" color="var(--warning)" />}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <ReportDetailModal report={report} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

function Chip({ label, color = 'var(--text-3)' }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
      background: `color-mix(in srgb, ${color} 10%, var(--bg-elevated))`,
      border: `0.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
      color,
    }}>
      {label}
    </span>
  )
}
