import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import Confetti                        from 'react-confetti'
import {
  useGamificationStore,
  getLevelInfo,
  rollMultiplier,
  multiplierMeta,
} from '@/stores/gamificationStore'
import { useAuth } from '@/features/auth/store/authContext'

const SPRING = { type: 'spring', stiffness: 200, damping: 18 }

// ─── XP Bar ───────────────────────────────────────────────────────────────────

export function XPBar() {
  const xp = useGamificationStore(s => s.xp)
  const { level, color, progress, label } = getLevelInfo(xp)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: `${color}22`, border: `1.5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, color, fontFamily: 'var(--font-mono)', flexShrink: 0,
      }}>
        {level}
      </div>
      <div style={{ flex: 1, minWidth: 60, maxWidth: 100 }}>
        <div style={{ height: 5, borderRadius: 10, background: 'var(--bg-hover)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 10, background: `linear-gradient(90deg, ${color}, ${color}99)`, boxShadow: `0 0 6px ${color}60` }}
          />
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2, whiteSpace: 'nowrap' }}>
          {label} · {xp.toLocaleString()} XP
        </div>
      </div>
    </div>
  )
}

// ─── Streak Badge ─────────────────────────────────────────────────────────────

export function StreakBadge() {
  const streak      = useGamificationStore(s => s.streak)
  const streakDanger = useGamificationStore(s => s.streakDanger)
  if (streak < 1) return null

  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={SPRING}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20,
        background: streakDanger ? 'var(--danger-bg)' : 'var(--warning-bg)',
        border: `0.5px solid ${streakDanger ? 'color-mix(in srgb, var(--danger) 30%, transparent)' : 'color-mix(in srgb, var(--warning) 30%, transparent)'}`,
        cursor: 'default',
      }}
      title={`${streak} günlük seriya${streakDanger ? ' — təhlükədədir!' : ''}`}
    >
      <motion.span
        animate={streakDanger ? { scale: [1, 1.35, 1] } : { scale: [1, 1.2, 1] }}
        transition={{ duration: streakDanger ? 0.8 : 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 14, lineHeight: 1 }}
      >
        {streakDanger ? '⚠️' : '🔥'}
      </motion.span>
      <span style={{
        fontSize: 13, fontWeight: 800,
        color: streakDanger ? 'var(--danger)' : 'var(--warning)',
        fontFamily: 'var(--font-mono)',
      }}>
        {streak}
      </span>
    </motion.div>
  )
}

// ─── Badge Modal ──────────────────────────────────────────────────────────────

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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={clearBadge}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1,   rotate: 0,   opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '0.5px solid rgba(255,215,0,0.3)',
              borderRadius: 24, padding: '40px 32px', maxWidth: 320, width: '100%',
              textAlign: 'center', boxShadow: '0 0 60px rgba(255,215,0,0.15)',
            }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 52, marginBottom: 12 }}>✨</motion.div>
            <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: 56, marginBottom: 16 }}>
              {badge.icon}
            </motion.div>
            <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Yeni Nailiyyət!</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>{badge.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 24 }}>{badge.description}</div>
            <button onClick={clearBadge} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, #FFD700, #F4A261)', border: 'none', color: '#1a1a1a', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}>
              🎉 Əla!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Level Up Modal ───────────────────────────────────────────────────────────

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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={clearLvl}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.3, y: 40, opacity: 0 }}
            animate={{ scale: 1,   y: 0,   opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: `0.5px solid ${levelInfo.color}50`,
              borderRadius: 24, padding: '44px 32px', maxWidth: 320, width: '100%',
              textAlign: 'center', boxShadow: `0 0 80px ${levelInfo.color}25`,
            }}
          >
            <div style={{ fontSize: 14, color: levelInfo.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Səviyyə Atladı!</div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `${levelInfo.color}20`, border: `3px solid ${levelInfo.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 32, fontWeight: 900,
                color: levelInfo.color, fontFamily: 'var(--font-mono)',
              }}
            >{level}</motion.div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>{levelInfo.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>Yeni səviyyəyə çatdınız! Davam edin! 🚀</div>
            <button onClick={clearLvl} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}99)`, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}>
              💪 Davam Et!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Streak Danger Toast (Fogg BM — Trigger) ─────────────────────────────────
// Shows when user hasn't logged in for exactly 2 days.
// Motivation trigger: urgency + streak preservation instinct.

export function StreakDangerToast() {
  const streakDanger = useGamificationStore(s => s.streakDanger)
  const streak       = useGamificationStore(s => s.streak)
  const [dismissed, setDismissed] = useState(false)

  const dismiss = () => {
    setDismissed(true)
    useGamificationStore.setState(s => ({ ...s, streakDanger: false }))
  }

  useEffect(() => {
    if (!streakDanger) return
    // vibrate for physical trigger (mobile)
    navigator.vibrate?.([60, 40, 120])
    const t = setTimeout(dismiss, 8000)
    return () => clearTimeout(t)
  }, [streakDanger])

  const visible = streakDanger && !dismissed

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y: 80, opacity: 0 }}
          transition={SPRING}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bnav-h) + 12px)',
            left: 16, right: 16,
            zIndex: 9000,
            maxWidth: 420,
            margin: '0 auto',
            borderRadius: 18,
            padding: '14px 18px',
            background: 'var(--bg-card)',
            border: '1px solid color-mix(in srgb, var(--danger) 35%, transparent)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px color-mix(in srgb, var(--danger) 12%, transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* Animated flame */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 32, flexShrink: 0 }}
          >
            🔥
          </motion.div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--danger)', marginBottom: 2, fontFamily: 'var(--font-heading)' }}>
              Serianız təhlükədədir!
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--warning)' }}>{streak} günlük</span> serianızı saxlamaq üçün bu gün bir test həll edin!
            </div>
          </div>

          {/* Pulse ring progress indicator */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 color-mix(in srgb, var(--danger) 40%, transparent)', '0 0 0 8px transparent'] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--danger-bg)',
                border: '2px solid var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, cursor: 'pointer',
              }}
              onClick={dismiss}
            >
              ✕
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Welcome Back Modal (Fogg BM — Motivation + Variable Reward) ──────────────
// Shows when user returns after 3+ days away.
// Combines: surprise bonus (variable reward) + social warmth.

export function WelcomeBackModal() {
  const welcomeBackBonus = useGamificationStore(s => s.welcomeBackBonus)
  const claimWelcomeBack = useGamificationStore(s => s.claimWelcomeBack)
  const { userProfile }  = useAuth()
  const [claimed, setClaimed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const firstName = (userProfile?.displayName || userProfile?.fullName || 'Şagird').split(' ')[0]

  const handleClaim = () => {
    setClaimed(true)
    setShowConfetti(true)
    navigator.vibrate?.([50, 30, 80, 30, 150])
    setTimeout(() => {
      claimWelcomeBack()
      setShowConfetti(false)
    }, 2000)
  }

  return (
    <AnimatePresence>
      {welcomeBackBonus && !claimed && (
        <>
          {showConfetti && (
            <Confetti
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={['var(--primary)', '#FFD700', '#F4A261', '#00E5A0']}
              style={{ position: 'fixed', inset: 0, zIndex: 10001, pointerEvents: 'none' }}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'var(--bg-overlay)', backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{ scale: 1,   y: 0,   opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                borderRadius: 28, padding: '40px 32px',
                maxWidth: 340, width: '100%', textAlign: 'center',
                boxShadow: '0 0 80px var(--glow-sm), 0 24px 60px rgba(0,0,0,0.5)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer top */}
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'var(--shimmer-line)' }} />

              {/* Background glow */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 60%)',
              }} />

              {/* Eagle emoji — comeback badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 60, marginBottom: 16, position: 'relative' }}
              >
                🦅
              </motion.div>

              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
                Xoş Gəldin Geri!
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
                {firstName}! 👋
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 24 }}>
                Özlədik sizi! Qayıtdığınız üçün sürpriz bonus qazandınız.
              </div>

              {/* Bonus XP display */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 20, marginBottom: 28,
                  background: 'var(--bg-active)',
                  border: '1px solid var(--border-focus)',
                  boxShadow: '0 0 24px var(--glow-sm)',
                }}
              >
                <span style={{ fontSize: 26 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    +{welcomeBackBonus}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>BONUS XP</div>
                </div>
              </motion.div>

              <button
                onClick={handleClaim}
                className="btn btn-primary btn-full"
                style={{ fontSize: 14, padding: '14px', borderRadius: 14 }}
              >
                🎁 XP-ni Al!
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── XP Multiplier Reveal (Fogg BM — Variable Ratio Reinforcement) ───────────
// Shows immediately after a test. Slot machine effect creates dopamine anticipation.
// Duolingo model: unpredictable reward magnitude → higher engagement & retention.

interface MultiplierRevealProps {
  baseXP:    number
  onReveal:  (finalXP: number, multiplier: number) => void
}

export function XPMultiplierReveal({ baseXP, onReveal }: MultiplierRevealProps) {
  const multiplier = useRef(rollMultiplier())
  const setPending = useGamificationStore(s => s.setPendingMultiplier)
  const [displayVal, setDisplayVal] = useState<number>(1)
  const [phase, setPhase]           = useState<'spin' | 'reveal'>('spin')
  const finalMultiplier             = multiplier.current
  const finalXP                     = Math.round(baseXP * finalMultiplier)
  const meta                        = multiplierMeta(finalMultiplier)
  const isSpecial                   = finalMultiplier > 1

  useEffect(() => {
    setPending(finalMultiplier)
    const REEL = [2, 1.5, 3, 1, 2, 1.5, 1, 3, 1.5, 2, 1, finalMultiplier]
    let i      = 0
    let delay  = 70

    const tick = () => {
      setDisplayVal(REEL[i])
      i++
      if (i < REEL.length) {
        delay = Math.min(delay * 1.22, 380)
        setTimeout(tick, delay)
      } else {
        setPhase('reveal')
        if (isSpecial) navigator.vibrate?.([40, 20, 80, 20, 120])
        setTimeout(() => onReveal(finalXP, finalMultiplier), 2200)
      }
    }
    setTimeout(tick, 100)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={SPRING}
      style={{
        borderRadius: 20,
        padding: '20px 24px',
        background: phase === 'reveal' && isSpecial
          ? `linear-gradient(135deg, color-mix(in srgb, ${meta.color} 10%, var(--bg-card)), var(--bg-card))`
          : 'var(--bg-card)',
        border: `1px solid ${phase === 'reveal' && isSpecial ? `color-mix(in srgb, ${meta.color} 35%, transparent)` : 'var(--border)'}`,
        boxShadow: phase === 'reveal' && isSpecial ? `0 0 32px color-mix(in srgb, ${meta.color} 18%, transparent)` : 'none',
        textAlign: 'center',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Label row */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
        {phase === 'spin' ? '🎰 XP Multiplikator' : `${meta.emoji} ${meta.label}`}
      </div>

      {/* Multiplier display — slot reel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12, overflow: 'hidden', height: 64 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-3)' }}>×</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayVal}
            initial={{ y: phase === 'spin' ? -30 : 0, opacity: phase === 'spin' ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.08 }}
            style={{
              fontSize: 52,
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: phase === 'reveal' ? meta.color : 'var(--text-2)',
              lineHeight: 1,
              display: 'block',
              textShadow: phase === 'reveal' && isSpecial ? `0 0 24px ${meta.color}80` : 'none',
            }}
          >
            {displayVal}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Reveal: XP calculation */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...SPRING }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 30,
              background: 'var(--bg-active)',
              border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>+{baseXP}</span>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>×</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: meta.color, fontFamily: 'var(--font-mono)' }}>{finalMultiplier}</span>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>=</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: meta.color, fontFamily: 'var(--font-mono)' }}>+{finalXP} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer line for special multipliers */}
      {phase === 'reveal' && isSpecial && (
        <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }} />
      )}
    </motion.div>
  )
}

// ─── Streak check hook — app açılışında çağrılır ──────────────────────────────

export function useStreakCheck() {
  const checkStreakStatus = useGamificationStore(s => s.checkStreakStatus)
  const checkStreak       = useGamificationStore(s => s.checkStreak)

  useEffect(() => {
    // Order matters: check status BEFORE updating streak
    checkStreakStatus()
    checkStreak()
  }, [checkStreakStatus, checkStreak])
}
