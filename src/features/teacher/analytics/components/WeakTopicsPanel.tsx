// @ts-nocheck
import { motion } from 'framer-motion'
import type { WeakTopic } from '@/lib/classroomIntelligence'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

interface Props { topics: WeakTopic[] }

export default function WeakTopicsPanel({ topics }: Props) {
  if (!topics.length) return null

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 14 }}>
        📉 Zəif Mövzular
        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
          {topics.length}
        </span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topics.slice(0, 6).map((t, i) => {
          const color = t.groupAverage < 35 ? 'var(--danger)' : 'var(--warning)'
          return (
            <motion.div
              key={t.topicId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.topicName}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    {t.subject} · {t.affectedStudents.length} şagird
                  </p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color, fontFamily: 'var(--font-heading)', marginLeft: 10, flexShrink: 0 }}>
                  {t.groupAverage}%
                </span>
              </div>
              <div className="progress" style={{ height: 4 }}>
                <motion.div
                  className="progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${t.groupAverage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.06 }}
                  style={{ background: color }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                {t.affectedStudents.slice(0, 4).map(s => (
                  <span key={s.uid} style={{
                    fontSize: 9, padding: '1px 7px', borderRadius: 20,
                    background: `color-mix(in srgb, ${color} 8%, var(--bg-elevated))`,
                    border: `0.5px solid color-mix(in srgb, ${color} 20%, transparent)`,
                    color: 'var(--text-3)',
                  }}>
                    {s.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
