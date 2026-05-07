import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamificationStore, getLevelInfo } from '@/stores/gamificationStore'

/** XP progress bar — header'da gösterilir */
export function XPBar() {
  const xp = useGamificationStore(s => s.xp)
  const { level, color, progress, label } = getLevelInfo(xp)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      {/* Level badge */}
      <div
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `${color}22`,
          border: `1.5px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color,
          fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}
      >
        {level}
      </div>

      {/* Progress bar */}
      <div style={{ flex: 1, minWidth: 60, maxWidth: 100 }}>
        <div style={{
          height: 5, borderRadius: 10,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 10,
              background: `linear-gradient(90deg, ${color}, ${color}99)`,
              boxShadow: `0 0 6px ${color}60`,
            }}
          />
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2, whiteSpace: 'nowrap' }}>
          {label} · {xp.toLocaleString()} XP
        </div>
      </div>
    </div>
  )
}

/** Streak badge — header'da gösterilir */
export function StreakBadge() {
  const streak = useGamificationStore(s => s.streak)
  if (streak < 1) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20,
        background: 'rgba(244,162,97,0.12)',
        border: '0.5px solid rgba(244,162,97,0.3)',
        cursor: 'default',
      }}
      title={`${streak} günlük seriya`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 14, lineHeight: 1 }}
      >
        🔥
      </motion.span>
      <span style={{ fontSize: 13, fontWeight: 800, color: '#F4A261', fontFamily: "'JetBrains Mono', monospace" }}>
        {streak}
      </span>
    </motion.div>
  )
}

/** Yeni rozet kazanıldı — tam ekran modal */
export function BadgeModal() {
  const badge      = useGamificationStore(s => s.pendingBadge)
  const clearBadge = useGamificationStore(s => s.clearPendingBadge)

  useEffect(() => {
    if (!badge) return
    const t = setTimeout(clearBadge, 4500)
    return () => clearTimeout(t)
  }, [badge, clearBadge])

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearBadge}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1,   rotate: 0,   opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '0.5px solid rgba(255,215,0,0.3)',
              borderRadius: 24, padding: '40px 32px',
              maxWidth: 320, width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(255,215,0,0.15)',
            }}
          >
            {/* Sparkle ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 52, marginBottom: 12 }}
            >
              ✨
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 56, marginBottom: 16 }}
            >
              {badge.icon}
            </motion.div>

            <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              Yeni Nailiyyət!
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Lexend Deca', sans-serif", marginBottom: 6 }}>
              {badge.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              {badge.description}
            </div>
            <button
              onClick={clearBadge}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, #FFD700, #F4A261)',
                border: 'none', color: '#1a1a1a', cursor: 'pointer',
                fontFamily: "'Lexend Deca', sans-serif",
              }}
            >
              🎉 Əla!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Level up kutlama modalı */
export function LevelUpModal() {
  const level     = useGamificationStore(s => s.pendingLevelUp)
  const clearLvl  = useGamificationStore(s => s.clearPendingLevelUp)
  const levelInfo = level ? getLevelInfo(level * 500) : null

  useEffect(() => {
    if (!level) return
    const t = setTimeout(clearLvl, 5000)
    return () => clearTimeout(t)
  }, [level, clearLvl])

  return (
    <AnimatePresence>
      {level && levelInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearLvl}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.3, y: 40, opacity: 0 }}
            animate={{ scale: 1,   y: 0,   opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: `0.5px solid ${levelInfo.color}50`,
              borderRadius: 24, padding: '44px 32px',
              maxWidth: 320, width: '100%',
              textAlign: 'center',
              boxShadow: `0 0 80px ${levelInfo.color}25`,
            }}
          >
            <div style={{ fontSize: 14, color: levelInfo.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Səviyyə Atladı!
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `${levelInfo.color}20`,
                border: `3px solid ${levelInfo.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32, fontWeight: 900,
                color: levelInfo.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {level}
            </motion.div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Lexend Deca', sans-serif", marginBottom: 6 }}>
              {levelInfo.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Yeni səviyyəyə çatdınız! Davam edin! 🚀
            </div>
            <button
              onClick={clearLvl}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}99)`,
                border: 'none', color: '#fff', cursor: 'pointer',
                fontFamily: "'Lexend Deca', sans-serif",
              }}
            >
              💪 Davam Et!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Streak check hook — her uygulama açılışında çağrılır */
export function useStreakCheck() {
  const checkStreak = useGamificationStore(s => s.checkStreak)
  useEffect(() => { checkStreak() }, [checkStreak])
}
