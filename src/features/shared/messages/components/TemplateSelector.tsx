// @ts-nocheck
import { motion } from 'framer-motion'
import type { DraftTemplate } from '@/lib/messaging'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const TEMPLATES: Array<{ id: DraftTemplate; icon: string; label: string; desc: string }> = [
  { id: 'monthly_summary', icon: '📊', label: 'Aylıq Xülasə',       desc: 'Valideynə aylıq hesabat' },
  { id: 'exam_reminder',   icon: '📋', label: 'İmtahan Xatırlatma', desc: 'İmtahan tarixini xatırlat' },
  { id: 'low_score_alert', icon: '📉', label: 'Aşağı Nəticə',       desc: 'Zəif mövzu bildirişi' },
  { id: 'streak_broken',   icon: '🔥', label: 'Seriya Pozuldu',     desc: 'Həvəsləndirmə mesajı' },
  { id: 'task_reminder',   icon: '📖', label: 'Tapşırıq Xatırlatma',desc: 'Ev tapşırığı xatırlatması' },
  { id: 'exam_result',     icon: '🏆', label: 'İmtahan Nəticəsi',   desc: 'Nəticəni valideynlə paylaş' },
  { id: 'welcome',         icon: '👋', label: 'Xoş Gəldin',         desc: 'Yeni şagirdə salamlama' },
  { id: 'custom',          icon: '✏️', label: 'Öz şablonun',        desc: 'Boş başlayıb özün yaz' },
]

interface Props {
  onSelect: (template: DraftTemplate) => void
  onClose:  () => void
}

export default function TemplateSelector({ onSelect, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9400,
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
          padding: '16px 16px 36px',
          width: '100%', maxWidth: 480,
          maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 14 }}>
          Şablon seç
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TEMPLATES.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
                textAlign: 'left', width: '100%',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{t.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{t.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
