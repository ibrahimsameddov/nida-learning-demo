// @ts-nocheck
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'

export default function TXToast() {
  const pending = useTeacherGamificationStore(s => s.pendingTXToast)
  const clear   = useTeacherGamificationStore(s => s.clearPendingTXToast)

  useEffect(() => {
    if (!pending) return
    const t = setTimeout(clear, 2200)
    return () => clearTimeout(t)
  }, [pending, clear])

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          key={pending.earnedAt ?? Date.now()}
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -28, scale: 1 }}
          exit={{ opacity: 0, y: -56, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            position: 'fixed', top: 80, right: 24, zIndex: 900,
            background: 'linear-gradient(135deg, #C9952B, #FFD060)',
            borderRadius: 14, padding: '10px 18px',
            boxShadow: '0 6px 28px rgba(201,149,43,0.45)',
            display: 'flex', alignItems: 'center', gap: 8,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 18 }}>✨</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#1a1000', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              +{pending.amount} TX
            </p>
            <p style={{ fontSize: 10, color: 'rgba(26,16,0,0.65)', marginTop: 2 }}>{pending.reason}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
