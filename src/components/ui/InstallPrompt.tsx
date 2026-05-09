// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '@/lib/native'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

export default function InstallPrompt() {
  const { canInstall, isInstalled, isIOS, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  if (isInstalled || dismissed) return null
  if (!canInstall && !isIOS) return null

  return (
    <>
      <AnimatePresence>
        {!dismissed && (canInstall || isIOS) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={SPRING}
            style={{
              position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 8000,
              background: 'var(--bg-elevated)',
              border: '0.5px solid var(--border-strong)',
              borderRadius: 18, padding: '16px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                🎓
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
                  NIDA-nı yüklə
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                  Ana ekranda tez çıxış, offline rejim
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {isIOS ? (
                <button
                  onClick={() => setShowIOS(true)}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: 13 }}
                >
                  Necə yükləmək olar?
                </button>
              ) : (
                <button
                  onClick={() => install()}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: 13 }}
                >
                  Ana ekrana əlavə et
                </button>
              )}
              <button
                onClick={() => setDismissed(true)}
                className="btn btn-ghost"
                style={{ fontSize: 13, padding: '9px 14px' }}
              >
                İndi yox
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS instructions modal */}
      <AnimatePresence>
        {showIOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9700,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
            onClick={() => setShowIOS(false)}
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
                padding: '20px 20px 44px',
                width: '100%', maxWidth: 480,
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
                iPhone-da yükləmə
              </p>
              {[
                { step: '1', icon: '⬆️', text: 'Safari-nin alt panelindəki "Paylaş" düyməsinə bas' },
                { step: '2', icon: '➕', text: '"Ana ekrana əlavə et" seçimini tap' },
                { step: '3', icon: '✅', text: '"Əlavə et" düyməsinə bas — hazırdır!' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(201,168,76,0.12)', border: '0.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    {s.icon}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, paddingTop: 6 }}>{s.text}</p>
                </div>
              ))}
              <button
                onClick={() => { setShowIOS(false); setDismissed(true) }}
                className="btn btn-ghost btn-full"
                style={{ fontSize: 13, marginTop: 8 }}
              >
                Bağla
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
