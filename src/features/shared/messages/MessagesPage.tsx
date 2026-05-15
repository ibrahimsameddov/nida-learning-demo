// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { apiGetSentMessages, apiGetReceivedMessages, apiSendMessage, apiMarkMessageRead } from '@/lib/api'
import { haptic } from '@/lib/native'
import ConversationList from './components/ConversationList'
import MessageBubble    from './components/MessageBubble'
import DraftComposer    from './components/DraftComposer'
import QuickReplyBar    from './components/QuickReplyBar'

const SPRING = { type: 'spring', stiffness: 280, damping: 28 }

function normaliseMsg(msg: any, myBackendId: number) {
  // Adapt MessageDto → internal shape expected by conversation components
  const isSent = msg.fromId === myBackendId
  const peerId = isSent ? (msg.toId ?? msg.to) : (msg.fromId ?? msg.from)
  return {
    ...msg,
    to:       String(peerId ?? msg.to ?? msg.id),
    toLabel:  msg.toLabel ?? msg.toFullName ?? msg.fromFullName ?? String(peerId ?? ''),
    text:     msg.content ?? msg.text ?? '',
    isSent,
  }
}

function buildConversations(msgs: any[], myBackendId: number) {
  const map = new Map<string, any>()
  const normalised = msgs
    .map(m => normaliseMsg(m, myBackendId))
    .sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? ''))
  for (const msg of normalised) {
    const key = msg.to
    if (!map.has(key)) {
      map.set(key, {
        id: key, label: msg.toLabel,
        mode: msg.mode ?? 'direct',
        lastMsg: msg.text, lastTime: msg.sentAt ?? '',
        messages: [],
      })
    }
    map.get(key).messages.push(msg)
  }
  return Array.from(map.values()).sort((a, b) => b.lastTime.localeCompare(a.lastTime))
}

// ── Conversation thread ────────────────────────────────────────────────────────

function ConversationThread({
  conversation,
  myUid,
  onSend,
  onBack,
}: {
  conversation: any
  myUid:        string
  onSend:       (to: string, toLabel: string, text: string) => void
  onBack?:      () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages.length])

  const handleQuickReply = (text: string) => {
    onSend(conversation.id, conversation.label, text)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thread header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        borderBottom: '0.5px solid var(--border)', background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: 'var(--text-2)', padding: '2px 6px 2px 0' }}>
            ‹
          </button>
        )}
        <div style={{
          width: 32, height: 32, borderRadius: conversation.mode === 'group' ? 10 : '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: conversation.mode === 'group' ? 14 : 13, fontWeight: 900, color: '#1a1200',
          flexShrink: 0,
        }}>
          {conversation.mode === 'group' ? '👥' : (conversation.label ?? '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{conversation.label}</p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
            {conversation.mode === 'group' ? 'Qrup mesajı' : 'Birbaşa mesaj'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(conversation.messages ?? []).slice().reverse().map((msg: any, i: number) => (
          <MessageBubble
            key={msg.id ?? i}
            text={msg.text}
            sentAt={msg.sentAt ?? msg.createdAt}
            isMine={msg.teacherUid === myUid || msg.fromRole === 'teacher' || !msg.fromRole}
            senderName={msg.fromName}
            senderInitial={(msg.fromName ?? msg.toLabel ?? '?').charAt(0).toUpperCase()}
            contextType={msg.contextType}
            contextData={msg.contextData}
            isRead={!!(msg.readBy?.length)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <QuickReplyBar onSelect={handleQuickReply} />

      {/* Composer */}
      <DraftComposer
        onSend={(text) => onSend(conversation.id, conversation.label, text)}
        recipientName={conversation.label}
      />
    </div>
  )
}

// ── Main MessagesPage ─────────────────────────────────────────────────────────

interface Props {
  /** Override to provide external conversations (e.g. teacher-specific data) */
  conversations?: any[]
  isLoading?:     boolean
  onSendMessage?: (to: string, toLabel: string, text: string, mode: string) => Promise<any>
  /** If true, show back button in thread (mobile) */
  mobileThread?:  boolean
}

export default function MessagesPage({
  conversations: externalConversations,
  isLoading: externalLoading,
  onSendMessage,
  mobileThread,
}: Props) {
  const myUid        = useAuthStore(s => s.user?.id ?? '')
  const myBackendId  = useAuthStore(s => s.backendId ?? -1)
  const qc           = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileView, setMobileView]  = useState<'list' | 'thread'>('list')

  // Internal messages (fallback when no external source) — fetch both directions
  const { data: allMsgs = [], isLoading: internalLoading } = useQuery({
    queryKey:  ['all-messages', myUid],
    enabled:   !externalConversations && !!myUid,
    staleTime: 60_000,
    queryFn:   async () => {
      const [sent, received] = await Promise.all([
        apiGetSentMessages().catch(() => []),
        apiGetReceivedMessages().catch(() => []),
      ])
      // Deduplicate by id
      const seen = new Set<number>()
      return [...sent, ...received].filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
    },
  })

  const sendMutation = useMutation({
    mutationFn: async ({ to, toLabel, text, mode }: any) => {
      if (onSendMessage) return onSendMessage(to, toLabel, text, mode)
      return apiSendMessage({ toId: Number(to), content: text, mode: mode ?? 'direct' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-messages', myUid] })
    },
  })

  const conversations = externalConversations ?? buildConversations(allMsgs, myBackendId)
  const isLoading     = externalLoading ?? internalLoading
  const selected      = conversations.find(c => c.id === selectedId) ?? null

  const handleSelect = (id: string) => {
    haptic.selection()
    setSelectedId(id)
    setMobileView('thread')
    // Mark unread messages in this conversation as read
    const conv = conversations.find((c: any) => c.id === id)
    if (conv) {
      conv.messages
        .filter((m: any) => !m.isSent && !m.isRead)
        .forEach((m: any) => apiMarkMessageRead(m.id).catch(() => {}))
    }
  }

  const handleSend = (to: string, toLabel: string, text: string) => {
    sendMutation.mutate({ to, toLabel, text, mode: 'direct' })
  }

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Conversation list */}
      <AnimatePresence>
        {(isDesktop || mobileView === 'list') && (
          <motion.div
            key="list"
            initial={isDesktop ? false : { x: 0 }}
            exit={isDesktop ? undefined : { x: '-100%' }}
            style={{
              width: isDesktop ? 280 : '100%',
              borderRight: isDesktop ? '0.5px solid var(--border)' : 'none',
              overflowY: 'auto', flexShrink: 0,
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--border)' }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
                Mesajlar
              </p>
            </div>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId ?? ''}
              onSelect={handleSelect}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thread panel */}
      <AnimatePresence>
        {(isDesktop || mobileView === 'thread') && (
          <motion.div
            key="thread"
            initial={isDesktop ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={isDesktop ? undefined : { x: '100%' }}
            transition={SPRING}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {selected ? (
              <ConversationThread
                conversation={selected}
                myUid={myUid}
                onSend={handleSend}
                onBack={!isDesktop ? () => setMobileView('list') : undefined}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 32 }}>💬</p>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Söhbət seçin</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
