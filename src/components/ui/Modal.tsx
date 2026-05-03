import React, { useEffect } from 'react'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  children:  React.ReactNode
  title?:    string
  maxWidth?: number
}

export default function Modal({ open, onClose, children, title, maxWidth = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          border: '0.5px solid var(--border-card)',
          borderRadius: 20, padding: 24,
          width: '100%', maxWidth,
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'scaleIn 0.22s var(--spring)',
        }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-tertiary)' }}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
