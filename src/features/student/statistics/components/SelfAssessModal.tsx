import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMetacognition } from '@/hooks/useAnalytics'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

interface Props {
  sessionId: string
  topicId:   string
  topicName: string
  onClose:   () => void
}

export function SelfAssessModal({ sessionId, topicId, topicName, onClose }: Props) {
  const [perceived, setPerceived] = useState(70)
  const [submitted, setSubmitted] = useState(false)
  const { addSelfAssessment } = useMetacognition()

  const handleSubmit = () => {
    addSelfAssessment({
      sessionId,
      topicId,
      perceivedScore: perceived,
      actualScore:    0,  // will be updated after quiz result
      delta:          0,
      completedAt:    Date.now(),
    })
    setSubmitted(true)
    setTimeout(onClose, 1200)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9600,
          background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0,
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
            padding: '24px 20px 36px',
            width: '100%', maxWidth: 480,
          }}
        >
          {!submitted ? (
            <>
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

              <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4, textAlign: 'center' }}>
                Özünü qiymətləndir
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                "{topicName}" mövzusundan <strong style={{ color: 'var(--text-2)' }}>neçə faiz gözləyirsən?</strong>
              </p>

              {/* Score display */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <motion.div
                  key={perceived}
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    fontSize: 56, fontWeight: 900, color: scoreColor(perceived),
                    fontFamily: 'var(--font-heading)', lineHeight: 1,
                    textShadow: `0 0 30px ${scoreColor(perceived)}40`,
                  }}
                >
                  {perceived}%
                </motion.div>
                <p style={{ fontSize: 12, color: scoreColor(perceived), fontWeight: 700, marginTop: 4 }}>
                  {scoreLabel(perceived)}
                </p>
              </div>

              {/* Slider */}
              <div style={{ marginBottom: 24, padding: '0 4px' }}>
                <input
                  type="range" min={0} max={100} step={5} value={perceived}
                  onChange={e => setPerceived(Number(e.target.value))}
                  style={{ width: '100%', accentColor: scoreColor(perceived), cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>0%</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>50%</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>100%</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-full"
                style={{ fontSize: 14 }}
              >
                Başla — {perceived}% Gözləyirəm
              </button>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-full"
                style={{ fontSize: 13, marginTop: 8 }}
              >
                Ötür
              </button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>🧠</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
                Qeydə alındı!
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                Nəticədən sonra müqayisə görünəcək
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function scoreColor(s: number): string {
  if (s >= 80) return 'var(--success)'
  if (s >= 60) return 'var(--primary)'
  if (s >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

function scoreLabel(s: number): string {
  if (s >= 80) return 'Əla nəticə gözləyirəm'
  if (s >= 60) return 'Yaxşı nəticə gözləyirəm'
  if (s >= 40) return 'Orta nəticə gözləyirəm'
  return 'Çətin olacaq'
}
