import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpacedRepetition } from '@/hooks/useAnalytics'
import type { SpacedItem } from '@/lib/analytics'

const SPRING = { type: 'spring', stiffness: 220, damping: 24 }

function retentionColor(r: number) {
  if (r >= 70) return 'var(--success)'
  if (r >= 45) return 'var(--warning)'
  return 'var(--danger)'
}

function urgencyLabel(item: SpacedItem): string {
  const now      = Date.now()
  const diffDays = (item.nextReview - now) / 86_400_000
  if (diffDays < 0)   return 'Gecikmiş'
  if (diffDays < 0.5) return 'Bu gün'
  if (diffDays < 2)   return 'Sabah'
  return `${Math.ceil(diffDays)} gün`
}

function urgencyColor(item: SpacedItem): string {
  const days = (item.nextReview - Date.now()) / 86_400_000
  if (days < 0)   return 'var(--danger)'
  if (days < 0.5) return 'var(--warning)'
  return 'var(--text-3)'
}

interface ReviewModalProps {
  item:     SpacedItem
  onReview: (quality: number) => void
  onClose:  () => void
}

function ReviewModal({ item, onReview, onClose }: ReviewModalProps) {
  const qualities = [
    { q: 1, label: 'Heç bilmirdim',    color: 'var(--danger)' },
    { q: 3, label: 'Çətinliklə bildim', color: 'var(--warning)' },
    { q: 4, label: 'Bildim',           color: 'var(--primary)' },
    { q: 5, label: 'Asanlıqla bildim', color: 'var(--success)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
          borderRadius: 20, padding: 24, width: '100%', maxWidth: 320,
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
          {item.topicName}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 20 }}>{item.subject}</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>Bu mövzunu nə qədər yaxşı bildiyinizi qiymətləndirin:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {qualities.map(q => (
            <button
              key={q.q}
              onClick={() => { onReview(q.q); onClose() }}
              style={{
                padding: '10px 16px', borderRadius: 10, textAlign: 'left',
                background: `color-mix(in srgb, ${q.color} 10%, transparent)`,
                border: `0.5px solid color-mix(in srgb, ${q.color} 40%, transparent)`,
                color: q.color, fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SpacedRepQueue() {
  const { dueToday, overdueCount, markReviewed, isLoading } = useSpacedRepetition()
  const [reviewing, setReviewing] = useState<SpacedItem | null>(null)
  const [reviewed,  setReviewed]  = useState<Set<string>>(new Set())

  const remaining = dueToday.filter(i => !reviewed.has(i.topicId))

  const handleReview = (quality: number) => {
    if (!reviewing) return
    markReviewed(reviewing.topicId, quality)
    setReviewed(prev => new Set([...prev, reviewing.topicId]))
    setReviewing(null)
  }

  return (
    <>
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p className="card-title">Təkrar Növbəsi</p>
            {overdueCount > 0 && (
              <p style={{ fontSize: 10, color: 'var(--danger)', marginTop: 2 }}>
                {overdueCount} gecikmiş mövzu
              </p>
            )}
          </div>
          <span style={{
            fontSize: 20, fontWeight: 900, color: remaining.length > 0 ? 'var(--warning)' : 'var(--success)',
            fontFamily: 'var(--font-heading)',
          }}>
            {remaining.length}
          </span>
        </div>

        {isLoading && <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: 16 }}>Yüklənir…</p>}

        {!isLoading && remaining.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>Bugünkü təkrar tamamdır!</p>
          </motion.div>
        )}

        <AnimatePresence>
          {remaining.map((item, i) => (
            <motion.div
              key={item.topicId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.04, ...SPRING }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid var(--border)',
              }}
            >
              {/* Retention dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: retentionColor(item.retentionRate),
                boxShadow: `0 0 6px ${retentionColor(item.retentionRate)}60`,
              }} />

              {/* Info */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.topicName}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {item.subject} · {item.retentionRate}% saxlanılır
                </p>
              </div>

              {/* Urgency badge */}
              <span style={{ fontSize: 10, fontWeight: 700, color: urgencyColor(item), fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {urgencyLabel(item)}
              </span>

              {/* Review button */}
              <button
                onClick={() => setReviewing(item)}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                  background: 'var(--bg-active)', border: '0.5px solid var(--border-focus)',
                  color: 'var(--primary)', cursor: 'pointer', flexShrink: 0,
                }}
              >
                Yoxla
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {reviewing && (
          <ReviewModal item={reviewing} onReview={handleReview} onClose={() => setReviewing(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
