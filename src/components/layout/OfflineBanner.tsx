// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkStatus } from '@/lib/native'

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'rgba(255,77,109,0.95)',
            backdropFilter: 'blur(10px)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontSize: 14 }}>📡</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              Offline rejim
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
              Nəticələr bağlantı gələndə avtomatik saxlanacaq
            </p>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
