// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shareResult } from '@/lib/native'
import { haptic } from '@/lib/native'

interface Props {
  title:    string
  text:     string
  score?:   number
  subject?: string
  style?:   React.CSSProperties
  label?:   string
}

export default function ShareButton({ title, text, score, subject, style, label = 'Paylaş' }: Props) {
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    haptic.light()
    const usedNative = await shareResult({ title, text, score, subject })
    if (!usedNative) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handle}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700,
        background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)',
        color: 'var(--text-2)', ...style,
      }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="copied" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ color: 'var(--success)', fontWeight: 800 }}>
            ✓ Kopyalandı
          </motion.span>
        ) : (
          <motion.span key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            ↗ {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
