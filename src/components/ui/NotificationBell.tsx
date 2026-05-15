import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notificationStore'
import { apiGetMyNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from '@/lib/api'
import type { Notification } from '@/types/models'
import type { NotificationDto } from '@/types/backend'

function dtoToNotification(dto: NotificationDto): Notification {
  const knownTypes = ['exam', 'message', 'permission', 'weekly', 'streak'] as const
  const type = knownTypes.includes(dto.type as any) ? dto.type as Notification['type'] : 'message'
  return {
    id:        String(dto.id),
    userId:    String(dto.userId),
    type,
    title:     dto.title,
    body:      dto.body,
    read:      dto.isRead,
    createdAt: dto.createdAt ?? new Date().toISOString(),
  }
}

const TYPE_ICON: Record<string, string> = {
  exam:       '📝',
  message:    '💬',
  permission: '🔑',
  weekly:     '📊',
  streak:     '🔥',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'İndicə'
  if (mins < 60)  return `${mins} dəq əvvəl`
  if (hours < 24) return `${hours} saat əvvəl`
  return `${days} gün əvvəl`
}

/** Hook: backend notifications fetch + store sync */
export function useNotificationSync() {
  const { add, items } = useNotificationStore()

  useEffect(() => {
    apiGetMyNotifications()
      .then((ns: NotificationDto[]) => {
        ns.forEach((dto: NotificationDto) => {
          const n = dtoToNotification(dto)
          if (!items.find((i: Notification) => i.id === n.id)) add(n)
        })
      })
      .catch(() => {/* silent */})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Bell icon + badge + dropdown panel */
export default function NotificationBell() {
  const [open, setOpen]     = useState(false)
  const panelRef            = useRef<HTMLDivElement>(null)
  const navigate            = useNavigate()

  const { items, unreadCount, markRead, markAllRead } = useNotificationStore()
  const recent = items.slice(0, 10)

  // Sync on mount
  useNotificationSync()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleRead = async (n: Notification) => {
    markRead(n.id)
    await apiMarkNotificationRead(n.id).catch(() => {})
    if (n.type === 'message')    navigate('/messages')
    if (n.type === 'exam')       navigate('/exams')
    if (n.type === 'permission') navigate('/subjects')
    setOpen(false)
  }

  const handleMarkAll = async () => {
    markAllRead()
    await apiMarkAllNotificationsRead().catch(() => {})
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'relative',
          width: 34, height: 34, borderRadius: 9,
          border: '0.5px solid var(--border)',
          background: open
            ? 'rgba(79,135,255,0.12)'
            : 'rgba(128,128,128,0.07)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
          transition: 'background 0.2s',
        }}
        aria-label="Bildirişlər"
      >
        🔔
        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 18, height: 18, borderRadius: 9,
                background: '#ff4d6d',
                border: '1.5px solid var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '0 4px',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 320, maxHeight: 420,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-card)',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
              overflow: 'hidden',
              zIndex: 500,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px 12px',
              borderBottom: '0.5px solid var(--border-card)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Lexend Deca', sans-serif" }}>
                Bildirişlər
                {unreadCount > 0 && (
                  <span style={{
                    marginLeft: 8, padding: '2px 7px', borderRadius: 10,
                    background: 'rgba(255,77,109,0.12)', color: '#ff4d6d',
                    fontSize: 11, fontWeight: 800,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  style={{
                    fontSize: 11, color: 'var(--color-primary)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 600, padding: '2px 6px',
                  }}
                >
                  Hamısını oxu
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', maxHeight: 340 }}>
              {recent.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                    Hələ bildiriş yoxdur
                  </div>
                </div>
              ) : (
                recent.map((n, i) => (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleRead(n)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 16px',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      borderBottom: i < recent.length - 1 ? '0.5px solid var(--border-card)' : 'none',
                      background: !n.read ? 'rgba(79,135,255,0.05)' : 'transparent',
                      cursor: 'pointer', border: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(79,135,255,0.05)' : 'transparent')}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {TYPE_ICON[n.type] ?? '🔔'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: n.read ? 500 : 700,
                        color: 'var(--text-primary)',
                        marginBottom: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        fontSize: 12, color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {n.body}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#4F87FF', flexShrink: 0, marginTop: 4,
                      }} />
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
