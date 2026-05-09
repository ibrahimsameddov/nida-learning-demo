// @ts-nocheck
import { motion } from 'framer-motion'
import type { ContextType, ContextData } from '@/lib/messaging'
import { contextMeta } from '@/lib/messaging'

interface Props {
  type:       ContextType
  data:       ContextData
  onAction?:  () => void
  actionLabel?: string
}

export default function ContextCard({ type, data, onAction, actionLabel }: Props) {
  const meta = contextMeta(type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        border: `0.5px solid color-mix(in srgb, ${meta.color} 25%, var(--border))`,
        background: `color-mix(in srgb, ${meta.color} 6%, var(--bg-elevated))`,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px',
        borderBottom: `0.5px solid color-mix(in srgb, ${meta.color} 15%, transparent)`,
        background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
      }}>
        <span style={{ fontSize: 13 }}>{meta.icon}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: meta.color, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
          {data.title}
        </p>

        {data.subject && (
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{data.subject}</p>
        )}

        {/* Result specific */}
        {type === 'result' && data.score != null && data.total != null && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                {data.score}/{data.total}
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-heading)',
                color: (data.percent ?? 0) >= 75 ? 'var(--success)' : (data.percent ?? 0) >= 55 ? 'var(--warning)' : 'var(--danger)' }}>
                {data.percent ?? Math.round((data.score / data.total) * 100)}%
              </span>
            </div>
            <div className="progress" style={{ height: 4 }}>
              <div className="progress-bar" style={{
                width: `${data.percent ?? Math.round((data.score / data.total) * 100)}%`,
                background: (data.percent ?? 0) >= 75 ? 'var(--success)' : (data.percent ?? 0) >= 55 ? 'var(--warning)' : 'var(--danger)',
              }} />
            </div>
          </div>
        )}

        {/* Deadline */}
        {data.dueDate && (
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>
            Son tarix: {new Date(data.dueDate).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
          </p>
        )}

        {/* Exam date */}
        {data.examDate && (
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>
            İmtahan tarixi: {new Date(data.examDate).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
          </p>
        )}

        {/* Action */}
        {onAction && (
          <button
            onClick={onAction}
            style={{
              fontSize: 11, fontWeight: 700, color: meta.color, cursor: 'pointer',
              background: 'none', border: 'none', padding: 0, marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {actionLabel ?? 'Ətraflı bax'} →
          </button>
        )}
      </div>
    </motion.div>
  )
}
