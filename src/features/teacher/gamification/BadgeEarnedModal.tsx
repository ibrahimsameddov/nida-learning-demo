// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'

const SPRING = { type: 'spring', stiffness: 260, damping: 22 }

export default function BadgeEarnedModal() {
  const badge = useTeacherGamificationStore(s => s.pendingBadge)
  const clear = useTeacherGamificationStore(s => s.clearPendingBadge)

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clear}
          style={{
            position: 'fixed', inset: 0, zIndex: 750,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: 22, padding: '32px 28px', maxWidth: 320, width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <motion.p
              initial={{ scale: 0.3, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...SPRING, delay: 0.1 }}
              style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}
            >
              {badge.icon}
            </motion.p>

            <p style={{ fontSize: 11, fontWeight: 700, color: '#C9952B', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
              Badge Qazandın!
            </p>
            <p style={{ fontSize: 19, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              {badge.label}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.5 }}>
              {badge.description}
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(201,149,43,0.12)', border: '0.5px solid rgba(201,149,43,0.3)',
              borderRadius: 10, padding: '4px 12px', marginBottom: 22,
            }}>
              <span style={{ fontSize: 13 }}>✨</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#C9952B', fontFamily: 'var(--font-mono)' }}>
                +{badge.txReward} TX
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={clear}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
                  color: 'var(--text-2)', cursor: 'pointer',
                }}
              >
                Bağla
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={clear}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  background: 'color-mix(in srgb, var(--primary) 12%, var(--bg-hover))',
                  border: '0.5px solid color-mix(in srgb, var(--primary) 28%, var(--border))',
                  color: 'var(--primary)', cursor: 'pointer',
                }}
              >
                📤 Paylaş
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
