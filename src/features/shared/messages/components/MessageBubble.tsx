// @ts-nocheck
import { motion } from 'framer-motion'
import ContextCard from './ContextCard'
import type { ContextType, ContextData } from '@/lib/messaging'

const SPRING = { type: 'spring', stiffness: 280, damping: 26 }

function fmtTime(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return 'İndi'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} dəq`
  if (diffMs < 86_400_000) return d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

interface Props {
  text:          string
  sentAt:        string
  isMine:        boolean
  senderName?:   string
  senderInitial?: string
  contextType?:  ContextType
  contextData?:  ContextData
  readBy?:       string[]
  isRead?:       boolean
  onContextAction?: () => void
}

export default function MessageBubble({
  text, sentAt, isMine, senderName, senderInitial,
  contextType, contextData, readBy, isRead, onContextAction,
}: Props) {
  const hasContext = contextType && contextType !== 'none' && contextData

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: isMine ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={SPRING}
      style={{
        display: 'flex',
        flexDirection: isMine ? 'row-reverse' : 'row',
        gap: 8,
        alignItems: 'flex-end',
        maxWidth: '85%',
        alignSelf: isMine ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Avatar (only for others) */}
      {!isMine && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color: '#1a1200',
        }}>
          {senderInitial ?? '?'}
        </div>
      )}

      <div style={{ maxWidth: '100%' }}>
        {/* Sender name */}
        {!isMine && senderName && (
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3, fontWeight: 700, paddingLeft: 2 }}>
            {senderName}
          </p>
        )}

        {/* Bubble */}
        <div style={{
          padding: hasContext ? '10px 12px' : '9px 13px',
          borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isMine
            ? 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, var(--accent)))'
            : 'var(--bg-elevated)',
          border: isMine ? 'none' : '0.5px solid var(--border-card)',
          maxWidth: 300,
        }}>
          <p style={{
            fontSize: 13, lineHeight: 1.55,
            color: isMine ? '#1a1200' : 'var(--text-1)',
            wordBreak: 'break-word',
          }}>
            {text}
          </p>

          {/* Context card */}
          {hasContext && (
            <ContextCard
              type={contextType}
              data={contextData}
              onAction={onContextAction}
            />
          )}
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 3,
          justifyContent: isMine ? 'flex-end' : 'flex-start',
          paddingRight: isMine ? 2 : 0,
          paddingLeft: isMine ? 0 : 2,
        }}>
          <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {fmtTime(sentAt)}
          </span>
          {isMine && (
            <span style={{ fontSize: 10, color: isRead ? 'var(--primary)' : 'var(--text-3)' }}>
              {isRead ? '✓✓' : (readBy?.length ? '✓✓' : '✓')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
