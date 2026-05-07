import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-base)',
        textAlign: 'center',
      }}
    >
      {/* Floating orbs background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '15%', left: '10%',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,135,255,0.12) 0%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: '20%', right: '10%',
            width: 250, height: 250, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,201,167,0.10) 0%, transparent 70%)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(80px, 20vw, 140px)',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #4F87FF, #6C63FF, #00C9A7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
            userSelect: 'none',
          }}
        >
          404
        </motion.div>

        {/* Emoji bounce */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
          style={{ fontSize: 52, marginBottom: 20 }}
        >
          🧭
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 10,
          }}
        >
          Səhifə tapılmadı
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            maxWidth: 300,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: '0.5px solid var(--border-card)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Lexend Deca', sans-serif",
              transition: 'transform 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ← Geri
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Lexend Deca', sans-serif",
              transition: 'transform 0.15s, opacity 0.15s',
              boxShadow: '0 4px 20px rgba(79,135,255,0.35)',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🏠 Ana Səhifə
          </button>
        </motion.div>
      </div>
    </div>
  )
}
