// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveSession } from '@/hooks/useFamilyLearning'

const SPRING = { type: 'spring', stiffness: 240, damping: 22 }

interface Props { childUid: string; childName: string }

export default function LiveSessionWatcher({ childUid, childName }: Props) {
  const [showRequest, setShowRequest] = useState(false)
  const { session, isLoading, requestWatch } = useLiveSession(childUid)
  const first = childName.split(' ')[0]

  if (isLoading) return null

  if (session?.allowedByStudent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
        style={{
          padding: '14px 16px', borderRadius: 14,
          background: 'rgba(0,229,160,0.07)', border: '0.5px solid rgba(0,229,160,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 22 }}>👁️</span>
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)',
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
              Canlı Seans — İzləyirsən
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
              {first} hal-hazırda quiz həll edir
            </p>
          </div>
        </div>

        {(session.currentQuestion != null) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <LiveStat label="Sual" value={`${session.currentQuestion}/${session.totalQuestions ?? '?'}`} />
            {session.currentScore != null && (
              <LiveStat
                label="Cari Nəticə"
                value={`${session.currentScore}%`}
                color={session.currentScore >= 60 ? 'var(--success)' : 'var(--warning)'}
              />
            )}
            {session.subject && <LiveStat label="Fənn" value={session.subject} />}
          </div>
        )}
      </motion.div>
    )
  }

  if (session && !session.allowedByStudent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '12px 14px', borderRadius: 14,
          background: 'rgba(255,179,71,0.07)', border: '0.5px solid rgba(255,179,71,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>⏳</span>
        <p style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 700 }}>
          {first}-dən icazə gözlənilir…
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowRequest(true)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>👁️</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Canlı Seans İzlə</p>
          <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{first} quiz həll edərkən izləmək üçün</p>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>›</span>
      </motion.button>

      <AnimatePresence>
        {showRequest && (
          <LiveRequestModal
            childName={first}
            onConfirm={() => {
              requestWatch(`session_${childUid}_${Date.now()}`)
              setShowRequest(false)
            }}
            onClose={() => setShowRequest(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function LiveRequestModal({ childName, onConfirm, onClose }: {
  childName: string; onConfirm: () => void; onClose: () => void
}) {
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
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
          border: '0.5px solid var(--border-card)',
          padding: '20px 20px 40px',
          width: '100%', maxWidth: 480,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
          Canlı İzləmə
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
          {childName} quiz həll edərkən nəticələrini canlı izləmək üçün sorğu göndəriləcək. {childName} icazə verdikdən sonra görünəcək.
        </p>
        <button onClick={onConfirm} className="btn btn-primary btn-full" style={{ fontSize: 14, marginBottom: 8 }}>
          Sorğu Göndər
        </button>
        <button onClick={onClose} className="btn btn-ghost btn-full" style={{ fontSize: 13 }}>
          Ləğv et
        </button>
      </motion.div>
    </motion.div>
  )
}

function LiveStat({ label, value, color = 'var(--text-1)' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center',
      background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(0,229,160,0.15)',
    }}>
      <p style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>{value}</p>
    </div>
  )
}
