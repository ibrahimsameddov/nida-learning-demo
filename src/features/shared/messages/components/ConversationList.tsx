// @ts-nocheck
import { motion } from 'framer-motion'
import { ConversationListSkeleton } from '@/components/ui/Skeleton'

function fmtTime(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return 'İndi'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} dəq`
  if (diffMs < 86_400_000) return d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

interface Conversation {
  id:       string
  label:    string
  lastMsg:  string
  lastTime: string
  unread?:  number
  mode?:    'direct' | 'group'
}

interface Props {
  conversations: Conversation[]
  selectedId?:   string
  onSelect:      (id: string) => void
  isLoading?:    boolean
}

export default function ConversationList({ conversations, selectedId, onSelect, isLoading }: Props) {
  if (isLoading) return <ConversationListSkeleton />

  if (!conversations.length) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 700 }}>Söhbət yoxdur</p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Yeni mesaj göndərin</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {conversations.map((conv, i) => {
        const initial = (conv.label ?? '?').charAt(0).toUpperCase()
        const active  = conv.id === selectedId
        const isGroup = conv.mode === 'group'

        return (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(conv.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', cursor: 'pointer', textAlign: 'left', width: '100%',
              background: active ? 'var(--bg-active)' : 'transparent',
              border: 'none',
              borderBottom: '0.5px solid var(--border)',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: isGroup ? 12 : '50%', flexShrink: 0,
              background: isGroup
                ? 'linear-gradient(135deg, var(--accent), var(--primary))'
                : 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, var(--success)))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isGroup ? 16 : 15, fontWeight: 900,
              color: '#1a1200',
            }}>
              {isGroup ? '👥' : initial}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <p style={{ fontSize: 13, fontWeight: active ? 900 : 700, color: active ? 'var(--primary)' : 'var(--text-1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {conv.label}
                </p>
                <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 8 }}>
                  {fmtTime(conv.lastTime)}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.lastMsg}
              </p>
            </div>

            {/* Unread badge */}
            {(conv.unread ?? 0) > 0 && (
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900, color: '#1a1200',
              }}>
                {conv.unread}
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
