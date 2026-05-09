// @ts-nocheck
import { motion } from 'framer-motion'
import type { Intervention } from '@/lib/classroomIntelligence'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const ACTIONS = [
  { type: 'task_sent',    icon: '📖', label: 'Tapşırıq göndər',    desc: 'Zəif mövzu üzrə ev tapşırığı tap'  },
  { type: 'message_sent', icon: '💬', label: 'Mesaj göndər',       desc: 'Şagirdlərə motivasiya mesajı yaz'  },
  { type: 'exam_created', icon: '📋', label: 'Sinaq yarat',        desc: 'Bu mövzu üzrə sınaq imtahanı aç'   },
  { type: 'dismissed',    icon: '✓',  label: 'Nəzərə alındı',      desc: 'Problemdən xəbərdaram, bağla'      },
]

interface Props {
  intervention: Intervention
  onAction:     (actionType: string) => void
  onClose:      () => void
}

export default function InterventionActionSheet({ intervention, onAction, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
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
          padding: '20px 20px 36px',
          width: '100%', maxWidth: 480,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

        <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
          Hansı tədbirə keçmək istəyirsən?
        </p>
        {intervention.topicName && (
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
            {intervention.topicName} · {intervention.affectedStudents.length} şagird
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACTIONS.map(a => (
            <button
              key={a.type}
              onClick={() => onAction(a.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
                textAlign: 'left', width: '100%',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)' }}>{a.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
