// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Intervention } from '@/lib/classroomIntelligence'
import InterventionActionSheet from './InterventionActionSheet'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const TYPE_META: Record<string, { icon: string; label: string }> = {
  low_score:        { icon: '📉', label: 'Aşağı Nəticə'   },
  inactive:         { icon: '😴', label: 'Fəalsızlıq'     },
  group_weak:       { icon: '👥', label: 'Qrup Zəifliyi'  },
  streak_broken:    { icon: '🔥', label: 'Seriya Qırıldı' },
  exam_approaching: { icon: '📋', label: 'İmtahan Yaxın'  },
}

const PRIORITY_COLOR: Record<string, string> = {
  critical:  'var(--danger)',
  important: 'var(--warning)',
  info:      'var(--primary)',
}

interface Props {
  intervention: Intervention
  onAction:     (id: string, actionType: string) => void
  onDismiss:    (id: string) => void
}

export default function InterventionCard({ intervention, onAction, onDismiss }: Props) {
  const [showSheet, setShowSheet] = useState(false)
  const meta     = TYPE_META[intervention.type]    ?? { icon: '⚠️', label: intervention.type }
  const priColor = PRIORITY_COLOR[intervention.priority] ?? 'var(--text-3)'
  const names    = intervention.affectedStudents.map(s => s.name.split(' ')[0]).join(', ')

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={SPRING}
        style={{
          background: 'var(--bg-card)',
          border: `0.5px solid color-mix(in srgb, ${priColor} 30%, var(--border-card))`,
          borderRadius: 14,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Priority stripe */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: priColor, borderRadius: '14px 0 0 14px',
        }} />

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingLeft: 6 }}>
          {/* Icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `color-mix(in srgb, ${priColor} 10%, var(--bg-elevated))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {meta.icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: priColor, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                {meta.label}
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {new Date(intervention.createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {intervention.topicName && (
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 3 }}>
                {intervention.topicName}
              </p>
            )}

            <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.5 }}>
              {buildDescription(intervention)}
            </p>

            {/* Affected students */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {intervention.affectedStudents.slice(0, 5).map(s => (
                <span key={s.uid} style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)',
                  color: 'var(--text-2)', fontWeight: 600,
                }}>
                  {s.name.split(' ')[0]}
                </span>
              ))}
              {intervention.affectedStudents.length > 5 && (
                <span style={{ fontSize: 10, color: 'var(--text-3)', padding: '2px 4px' }}>
                  +{intervention.affectedStudents.length - 5}
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowSheet(true)}
                style={{
                  flex: 1, padding: '7px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: `color-mix(in srgb, ${priColor} 15%, var(--bg-elevated))`,
                  border: `0.5px solid color-mix(in srgb, ${priColor} 40%, transparent)`,
                  color: priColor, cursor: 'pointer',
                }}
              >
                Tədbir gör
              </button>
              <button
                onClick={() => onDismiss(intervention.id)}
                style={{
                  padding: '7px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: 'transparent', border: '0.5px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer',
                }}
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSheet && (
          <InterventionActionSheet
            intervention={intervention}
            onAction={(actionType) => {
              onAction(intervention.id, actionType)
              setShowSheet(false)
            }}
            onClose={() => setShowSheet(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function buildDescription(i: Intervention): string {
  if (i.type === 'low_score') {
    const scores = i.triggerData.scores ?? []
    return `${i.affectedStudents.length} şagird ${i.topicName ?? i.subject} mövzusunda ardıcıl ${scores.map(s => s + '%').join(', ')} nəticə göstərib (hədd: ${i.triggerData.threshold}%)`
  }
  if (i.type === 'inactive') {
    return `${i.affectedStudents.length} şagird ${i.triggerData.inactiveDays}+ gündür fəal deyil`
  }
  if (i.type === 'group_weak') {
    return `Qrup ortalama ${i.triggerData.groupAverage}% — ${i.topicName ?? i.subject} mövzusunda hədd (${i.triggerData.threshold}%) altında`
  }
  if (i.type === 'streak_broken') {
    return `${i.affectedStudents.length} şagirdin öyrənmə seriyası qırılıb`
  }
  return `${i.affectedStudents.length} şagird`
}
