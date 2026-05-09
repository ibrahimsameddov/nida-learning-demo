// @ts-nocheck
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'
import { RANKS } from '@/types/teacherGamification'

const SPRING = { type: 'spring', stiffness: 260, damping: 22 }

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: -50 + Math.random() * 200,
    delay: Math.random() * 0.5,
    color: ['#C9952B', '#FFD060', '#E24B4A', '#7F77DD', '#378ADD'][i % 5],
    size: 6 + Math.random() * 8,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `calc(50% + ${p.x}px)`, opacity: 1, rotate: 0 }}
          animate={{ y: 340, opacity: 0, rotate: 360 * (p.id % 2 === 0 ? 1 : -1) }}
          transition={{ duration: 1.8 + Math.random() * 0.8, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute', top: 0, width: p.size, height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}

export default function RankUpModal() {
  const pendingRankUp = useTeacherGamificationStore(s => s.pendingRankUp)
  const clear         = useTeacherGamificationStore(s => s.clearPendingRankUp)

  const rankInfo = RANKS.find(r => r.rank === pendingRankUp)

  return (
    <AnimatePresence>
      {rankInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 800,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={clear}
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: `1px solid ${rankInfo.color}44`,
              borderRadius: 24, padding: '36px 32px', maxWidth: 360, width: '90%',
              boxShadow: `0 0 60px ${rankInfo.color}33`,
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Glow ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 24,
              background: `radial-gradient(ellipse at 50% 0%, ${rankInfo.color}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <motion.p
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING, delay: 0.15 }}
              style={{ fontSize: 72, lineHeight: 1, marginBottom: 18 }}
            >
              {rankInfo.icon}
            </motion.p>

            <p style={{ fontSize: 11, fontWeight: 700, color: rankInfo.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
              Yeni Rütbə
            </p>

            <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
              {rankInfo.label}
            </p>

            <div style={{ background: 'var(--bg-hover)', borderRadius: 14, padding: '14px 16px', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                Yeni İmtiyazlar
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rankInfo.privileges.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ color: rankInfo.color, fontSize: 12 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{p}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={clear}
              style={{
                width: '100%', padding: '13px', borderRadius: 14, fontSize: 13, fontWeight: 700,
                background: `linear-gradient(135deg, ${rankInfo.color}, ${rankInfo.color}cc)`,
                border: 'none', color: '#fff', cursor: 'pointer',
                boxShadow: `0 4px 20px ${rankInfo.color}44`,
              }}
            >
              🎉 Davam Et
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
