import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import type { QuizResult } from '../../../types/models'
import { useGamificationStore } from '@/stores/gamificationStore'

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function emoji(pct: number) {
  if (pct >= 90) return '🏆'
  if (pct >= 75) return '🎉'
  if (pct >= 55) return '📊'
  return '💪'
}

function message(pct: number) {
  if (pct >= 90) return 'Əla nəticə! Çox yaxşısınız!'
  if (pct >= 75) return 'Yaxşı nəticə! Davam edin!'
  if (pct >= 55) return 'Orta nəticə. Daha çox məşq lazımdır.'
  return 'Zəif nəticə. Yanlış sualları təkrar edin.'
}

function colorForPct(pct: number) {
  if (pct >= 75) return '#00C9A7'
  if (pct >= 55) return '#F4A261'
  return '#ff4d6d'
}

const SPRING = { type: 'spring', stiffness: 180, damping: 18 }

export default function QuizResult() {
  const navigate          = useNavigate()
  const { sessionId }     = useParams<{ sessionId: string }>()
  const { state }         = useLocation()
  const result            = state?.result as QuizResult | undefined
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)
  const [xpVisible, setXpVisible]       = useState(false)

  const pct        = result?.successRate ?? 0
  const countedPct = useCountUp(pct, 1000)
  const color      = colorForPct(pct)
  const xpEarned   = pct >= 90 ? 50 : pct >= 75 ? 30 : pct >= 55 ? 15 : 5

  // ── Gamification: add XP once per result ─────────────────────────────────
  const addXP      = useGamificationStore(s => s.addXP)
  const xpAdded    = useRef(false)
  useEffect(() => {
    if (!result || xpAdded.current) return
    xpAdded.current = true
    addXP(xpEarned)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  useEffect(() => {
    if (pct >= 75) {
      const t = setTimeout(() => setShowConfetti(true), 300)
      const t2 = setTimeout(() => setShowConfetti(false), 5000)
      return () => { clearTimeout(t); clearTimeout(t2) }
    }
  }, [pct])

  useEffect(() => {
    const t = setTimeout(() => setXpVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  if (!result) {
    return (
      <div className="page-inner" style={{ textAlign: 'center', paddingTop: 60 }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING}
          style={{ fontSize: 52, marginBottom: 12 }}
        >📋</motion.div>
        <p style={{ color: 'var(--text-secondary)' }}>Nəticə tapılmadı.</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/subjects')}>
          Fənlərə Qayıt
        </button>
      </div>
    )
  }

  return (
    <div className="page-inner" style={{ paddingBottom: 32 }}>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={280}
            gravity={0.25}
            colors={['#4F87FF', '#6C63FF', '#00C9A7', '#F4A261', '#ff4d6d', '#fff']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 999, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="hero-card"
        style={{ textAlign: 'center', padding: '36px 24px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${color}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 14 }}
          style={{ fontSize: 56, marginBottom: 16 }}
        >
          {emoji(pct)}
        </motion.div>

        {/* Score number count-up */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, ...SPRING }}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(52px, 15vw, 72px)',
            fontWeight: 900,
            color,
            lineHeight: 1,
            marginBottom: 10,
            textShadow: `0 0 40px ${color}50`,
          }}
        >
          {countedPct}%
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 0 }}
        >
          {message(pct)}
        </motion.p>

        {/* XP Earned badge */}
        <AnimatePresence>
          {xpVisible && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              style={{
                marginTop: 18,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 20,
                background: 'rgba(79,135,255,0.12)',
                border: '0.5px solid rgba(79,135,255,0.3)',
                color: '#4F87FF',
                fontWeight: 800,
                fontSize: 14,
                fontFamily: "'Lexend Deca', sans-serif",
              }}
            >
              ⚡ +{xpEarned} XP qazandınız!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="dash-grid"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...SPRING }}
      >
        <StatCard value={result.correct} label="Düzgün"  color="#00C9A7" delay={0.45} />
        <StatCard value={result.wrong}   label="Yanlış"  color="#ff4d6d" delay={0.50} />
        <StatCard value={result.skipped} label="Keçildi" color="var(--text-tertiary)" delay={0.55} />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="card"
        style={{ padding: '18px 20px' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ...SPRING }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="card-title">Ümumi Nəticə</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color, fontSize: 13 }}>
            {result.correct}/{result.total} sual
          </span>
        </div>
        <div className="progress" style={{ height: 8 }}>
          <motion.div
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}60` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
          <span>⏱ {Math.round(result.timeSpent / 1000 / 60)} dəq {Math.round((result.timeSpent / 1000) % 60)} san</span>
          <span>{result.total} sual</span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, ...SPRING }}
      >
        <button className="btn btn-primary btn-full" onClick={() => navigate('/subjects')}>
          Başqa Fənn Seç
        </button>
        {result.wrong > 0 && (
          <button className="btn btn-ghost btn-full" onClick={() => navigate('/wrong-questions')}>
            🔁 Yanlış Sualları Təkrar Et
          </button>
        )}
        <button className="btn btn-ghost btn-full" onClick={() => navigate('/statistics')}>
          📊 Statistikama Bax
        </button>
      </motion.div>
    </div>
  )
}

function StatCard({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) {
  const counted = useCountUp(value, 800)
  return (
    <motion.div
      className="stat-mini"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 16 }}
    >
      <div className="stat-val" style={{ color }}>{counted}</div>
      <div className="stat-lbl">{label}</div>
    </motion.div>
  )
}
