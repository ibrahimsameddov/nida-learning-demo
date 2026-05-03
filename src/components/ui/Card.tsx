import React from 'react'

interface CardProps {
  children:   React.ReactNode
  style?:     React.CSSProperties
  accent?:    boolean
  onClick?:   () => void
  className?: string
}

export default function Card({ children, style = {}, accent = false, onClick, className }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={['spring-hover', className].filter(Boolean).join(' ')}
      style={{
        background:   'var(--bg-card)',
        border:       `0.5px solid ${accent ? 'var(--border-accent)' : 'var(--border-card)'}`,
        borderRadius: 'var(--r-lg, 16px)',
        boxShadow:    'var(--shadow-card)',
        cursor:       onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function GlassCard({ children, style = {}, className = '', onClick }: Omit<CardProps, 'accent'>) {
  return (
    <div
      onClick={onClick}
      className={['glass-card', className].filter(Boolean).join(' ')}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      {children}
    </div>
  )
}
