// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING } from '@/lib/motion'
import {
  apiGetMyGroups, apiGetSentPermissions, apiRevokePermission,
  apiGetMyNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead,
  apiGetIncomingParentMsgs, apiGetStudentProfile, apiReplyAsTeacher,
  apiGetPermittedStudents, apiGetStudentProfiles, apiGetParentUidsByStudentUid,
  apiTeacherMessageParent, apiTeacherSendDirectMessage,
} from '@/lib/api'
import { dbGetSentMessages, dbSendMessage } from '@/lib/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: any) {
  if (!iso) return ''
  const d = (iso?.seconds) ? new Date(iso.seconds * 1000) : new Date(iso)
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return 'İndi'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} dəq`
  if (diffMs < 86_400_000) return d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

function fmtDate(iso: any) {
  if (!iso) return ''
  const d = iso?.seconds ? new Date(iso.seconds * 1000) : new Date(iso)
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildConversations(sentMessages: any[]) {
  const map = new Map<string, any>()
  const sorted = [...sentMessages].sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))
  for (const msg of sorted) {
    const key = msg.to
    if (!map.has(key)) {
      map.set(key, { id: key, label: msg.toLabel, mode: msg.mode, lastMsg: msg.text, lastTime: msg.sentAt || '', messages: [] })
    }
    map.get(key)!.messages.push(msg)
  }
  return Array.from(map.values()).sort((a, b) => b.lastTime.localeCompare(a.lastTime))
}

function buildParentConversations(msgs: any[]) {
  const map = new Map<string, any>()
  const sorted = [...msgs].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  for (const msg of sorted) {
    const key = `${msg.parentUid}::${msg.childUid}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        parentUid: msg.parentUid,
        childUid:  msg.childUid,
        lastMsg:      msg.text,
        lastTime:     msg.createdAt || '',
        lastFromRole: msg.fromRole,
        messages: [],
      })
    }
    map.get(key)!.messages.push(msg)
  }
  for (const [, conv] of map) {
    conv.messages.sort((a: any, b: any) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  }
  return Array.from(map.values()).sort((a, b) => b.lastTime.localeCompare(a.lastTime))
}

function AvatarCircle({ name, color, size = 40 }: any) {
  const initials = String(name || '?').split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.35), flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #6C63FF))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: Math.round(size * 0.38), color: '#fff',
    }}>{initials}</div>
  )
}

// ─── Messages Tab (conversation list) ────────────────────────────────────────

function MessagesTab({ conversations, onOpenChat, loading }: any) {
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  )
  if (conversations.length === 0) return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '44px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Mesaj tapşanı yoxdur</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>«+ Yaz» düyməsindən ilk mesajı göndərin</div>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {conversations.map((conv: any) => (
        <motion.div
          key={conv.id}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          onClick={() => onOpenChat(conv)}
          whileHover={{ borderColor: 'rgba(79,135,255,0.3)' }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
            background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
            borderRadius: 14, cursor: 'pointer', transition: 'border-color 0.2s',
          }}
        >
          <AvatarCircle name={conv.label} color={conv.mode === 'group' ? '#6C63FF' : '#4F87FF'} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{conv.label}</span>
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                  background: conv.mode === 'group' ? 'rgba(108,99,255,0.15)' : 'rgba(79,135,255,0.15)',
                  color: conv.mode === 'group' ? '#6C63FF' : '#4F87FF',
                }}>{conv.mode === 'group' ? 'qrup' : 'fərdi'}</span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{fmtTime(conv.lastTime)}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conv.lastMsg}
            </div>
          </div>
          <span style={{ color: 'var(--text-3)', fontSize: 16, flexShrink: 0 }}>›</span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({ conv, onBack, onSent }: any) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [conv.messages?.length])

  const handleSend = async () => {
    const t = text.trim()
    if (!t || sending) return
    setSending(true)
    try {
      const msg = await dbSendMessage({ to: conv.id, toLabel: conv.label, mode: conv.mode, text: t })
      onSent(msg)
      setText('')
    } catch { /* ignore */ } finally { setSending(false) }
  }

  const msgsSorted = [...(conv.messages || [])].sort((a: any, b: any) => (a.sentAt || '').localeCompare(b.sentAt || ''))

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 160px)', minHeight: 400 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 14px', borderBottom: '0.5px solid var(--border-card)', marginBottom: 4 }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', color: 'var(--text-1)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >‹</button>
        <AvatarCircle name={conv.label} color={conv.mode === 'group' ? '#6C63FF' : '#4F87FF'} size={38} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{conv.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {conv.mode === 'group' ? 'Qrup söhbəti' : 'Fərdi söhbət'} · {conv.messages?.length ?? 0} mesaj
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgsSorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>İlk mesajı göndərin</div>
          </div>
        ) : (
          msgsSorted.map((msg: any) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '20%' }}>
              <div style={{ background: 'linear-gradient(135deg, #4F87FF, #6C63FF)', color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '10px 14px', maxWidth: '100%' }}>
                <div style={{ fontSize: 13, lineHeight: 1.55 }}>{msg.text}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                  {fmtTime(msg.sentAt)} · ✓
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '0.5px solid var(--border-card)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Mesaj yazın... (Enter = göndər)"
          rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          style={{
            flex: 1, resize: 'none', background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
            borderRadius: 12, padding: '10px 14px', color: 'var(--text-1)',
            fontSize: 13, lineHeight: 1.5, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            padding: '0 18px', borderRadius: 12, border: 'none', flexShrink: 0,
            background: !text.trim() || sending ? 'rgba(79,135,255,0.3)' : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
            color: '#fff', fontWeight: 800, fontSize: 20,
            cursor: !text.trim() || sending ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >{sending ? '…' : '→'}</button>
      </div>
    </motion.div>
  )
}

// ─── Parent Messages Tab ──────────────────────────────────────────────────────

function ParentMsgsTab({ msgs, onOpenChat, loading }: any) {
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const conversations = buildParentConversations(msgs)

  useEffect(() => {
    const uids = [...new Set([
      ...conversations.map((c: any) => c.parentUid),
      ...conversations.map((c: any) => c.childUid),
    ])] as string[]
    if (!uids.length) return
    Promise.all(uids.map(u => apiGetStudentProfile(u).catch(() => null)))
      .then(results => {
        const map: Record<string, any> = {}
        results.forEach((p, i) => { if (p) map[uids[i]] = p })
        setProfiles(map)
      })
  }, [msgs.length])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <span className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  )

  if (conversations.length === 0) return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '44px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍👩‍👧</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Valideyn mesajı yoxdur</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>Valideynlər sizə mesaj göndərəndə burada görünəcək</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {conversations.map((conv: any) => {
        const pName = profiles[conv.parentUid]?.fullName || `Valideyn ···${conv.parentUid.slice(-4)}`
        const cName = profiles[conv.childUid]?.fullName  || `Şagird ···${conv.childUid.slice(-4)}`
        const hasUnreplied = conv.lastFromRole === 'parent'
        return (
          <motion.div
            key={conv.key}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            onClick={() => onOpenChat({ ...conv, pName, cName })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
              background: hasUnreplied ? 'rgba(244,162,97,0.05)' : 'var(--bg-card)',
              border: `0.5px solid ${hasUnreplied ? 'rgba(244,162,97,0.3)' : 'var(--border-card)'}`,
              borderRadius: 14, cursor: 'pointer', transition: 'border-color 0.2s',
            }}
          >
            <AvatarCircle name={pName} color="#F4A261" size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{pName}</span>
                  {hasUnreplied && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F4A261', display: 'inline-block', flexShrink: 0 }} />
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{fmtTime(conv.lastTime)}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>👦 {cName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.lastFromRole === 'teacher' ? '↩ ' : ''}{conv.lastMsg}
              </div>
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: 16, flexShrink: 0 }}>›</span>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Parent Chat View ─────────────────────────────────────────────────────────

function ParentChatView({ conv, onBack, onSent }: any) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [conv.messages?.length])

  const handleSend = async () => {
    const t = text.trim()
    if (!t || sending) return
    setSending(true)
    try {
      const msg = await apiReplyAsTeacher(conv.parentUid, conv.childUid, t)
      onSent(conv.key, msg)
      setText('')
    } catch { /* ignore */ } finally { setSending(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 160px)', minHeight: 400 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 14px', borderBottom: '0.5px solid var(--border-card)', marginBottom: 4 }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', color: 'var(--text-1)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >‹</button>
        <AvatarCircle name={conv.pName} color="#F4A261" size={38} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{conv.pName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>👦 {conv.cName} · {conv.messages?.length ?? 0} mesaj</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {conv.messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Mesaj yoxdur</div>
          </div>
        ) : (
          conv.messages.map((msg: any) => {
            const isTeacher = msg.fromRole === 'teacher'
            return (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: isTeacher ? 'flex-end' : 'flex-start',
                paddingLeft:  isTeacher ? '20%' : 0,
                paddingRight: isTeacher ? 0 : '20%',
              }}>
                <div style={{
                  background: isTeacher ? 'linear-gradient(135deg, #4F87FF, #6C63FF)' : 'rgba(244,162,97,0.12)',
                  border: isTeacher ? 'none' : '0.5px solid rgba(244,162,97,0.3)',
                  color: isTeacher ? '#fff' : 'var(--text-1)',
                  borderRadius: isTeacher ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '10px 14px', maxWidth: '100%',
                }}>
                  <div style={{ fontSize: 13, lineHeight: 1.55 }}>{msg.text}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                    {fmtTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '0.5px solid var(--border-card)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Cavab yazın... (Enter = göndər)"
          rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          style={{
            flex: 1, resize: 'none', background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
            borderRadius: 12, padding: '10px 14px', color: 'var(--text-1)',
            fontSize: 13, lineHeight: 1.5, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            padding: '0 18px', borderRadius: 12, border: 'none', flexShrink: 0,
            background: !text.trim() || sending ? 'rgba(79,135,255,0.3)' : 'linear-gradient(135deg, #F4A261, #E76F51)',
            color: '#fff', fontWeight: 800, fontSize: 20,
            cursor: !text.trim() || sending ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >{sending ? '…' : '→'}</button>
      </div>
    </motion.div>
  )
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────

function RequestsTab({ permissions, setPermissions }: any) {
  const [revoking, setRevoking] = useState<string | null>(null)

  const handleRevoke = async (permId: string) => {
    setRevoking(permId)
    try {
      await apiRevokePermission(permId)
      setPermissions((prev: any[]) => prev.map(p => p.id === permId ? { ...p, status: 'revoked' } : p))
    } catch { /* ignore */ } finally { setRevoking(null) }
  }

  const statusMeta: Record<string, any> = {
    pending:  { label: 'Gözləyir',     color: '#F4A261', bg: 'rgba(244,162,97,0.12)'  },
    granted:  { label: 'Qəbul edildi', color: '#00C9A7', bg: 'rgba(0,201,167,0.12)'   },
    rejected: { label: 'Rədd edildi',  color: '#ff4d6d', bg: 'rgba(255,77,109,0.12)'  },
    revoked:  { label: 'Geri alındı',  color: 'var(--text-3)', bg: 'rgba(255,255,255,0.05)' },
  }

  if (permissions.length === 0) return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '44px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>📨</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Sorğu yoxdur</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        Şagirdlərə göndərdiyiniz giriş sorğuları burada görünəcək
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {permissions.map((perm: any) => {
        const sm = statusMeta[perm.status] ?? statusMeta.pending
        return (
          <motion.div
            key={perm.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '14px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>📚 {perm.subject}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {perm.receiverUniqueId || perm.studentUid || 'Naməlum şagird'}
                </div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, color: sm.color, background: sm.bg, flexShrink: 0 }}>
                {sm.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>📅 {fmtDate(perm.createdAt)}</span>
              {perm.status === 'granted' && (
                <button
                  onClick={() => handleRevoke(perm.id)}
                  disabled={revoking === perm.id}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: 'rgba(255,77,109,0.1)', border: '0.5px solid rgba(255,77,109,0.25)',
                    color: '#ff4d6d', cursor: revoking === perm.id ? 'not-allowed' : 'pointer',
                    opacity: revoking === perm.id ? 0.6 : 1,
                  }}
                >{revoking === perm.id ? '…' : 'Geri al'}</button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── System Tab ───────────────────────────────────────────────────────────────

function SystemTab({ notifications, setNotifications }: any) {
  const unread = notifications.filter((n: any) => !n.read).length

  const markAll = async () => {
    await apiMarkAllNotificationsRead().catch(() => {})
    setNotifications((prev: any[]) => prev.map(n => ({ ...n, read: true })))
  }

  const markOne = async (id: string) => {
    await apiMarkNotificationRead(id).catch(() => {})
    setNotifications((prev: any[]) => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  if (notifications.length === 0) return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '44px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Bildiriş yoxdur</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sistem bildirişləri burada görünəcək</div>
    </div>
  )

  return (
    <div>
      {unread > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            onClick={markAll}
            style={{ fontSize: 11, fontWeight: 600, color: '#4F87FF', background: 'rgba(79,135,255,0.1)', border: '0.5px solid rgba(79,135,255,0.25)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
          >✓ Hamısını oxundu say</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {notifications.map((n: any) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            onClick={() => !n.read && markOne(n.id)}
            style={{
              padding: '13px 16px',
              background: n.read ? 'var(--bg-card)' : 'rgba(79,135,255,0.06)',
              border: `0.5px solid ${n.read ? 'var(--border-card)' : 'rgba(79,135,255,0.2)'}`,
              borderRadius: 14, cursor: n.read ? 'default' : 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F87FF', flexShrink: 0, marginTop: 5 }} />}
              <div style={{ flex: 1 }}>
                {n.title && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{n.title}</div>}
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>{n.body || n.message || n.text || ''}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5 }}>{fmtTime(n.createdAt)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Compose Modal ────────────────────────────────────────────────────────────

function ComposeModal({ groups, onClose, onSent }: any) {
  const [mode,          setMode]          = useState<'direct' | 'group' | 'parent'>('direct')
  const [to,            setTo]            = useState('')
  const [text,          setText]          = useState('')
  const [sending,       setSending]       = useState(false)
  const [err,           setErr]           = useState('')
  const [permStudents,  setPermStudents]  = useState<any[]>([])
  const [selStudent,    setSelStudent]    = useState<any>(null)
  const [parentOpts,    setParentOpts]    = useState<any[]>([])
  const [selParent,     setSelParent]     = useState<any>(null)
  const [loadingPerm,   setLoadingPerm]   = useState(false)

  useEffect(() => {
    if (mode !== 'parent') return
    setLoadingPerm(true)
    apiGetPermittedStudents()
      .then(async (perms: any[]) => {
        const uids = [...new Set(perms.map((p: any) => p.studentUid).filter(Boolean))]
        if (!uids.length) { setPermStudents([]); return }
        const profiles = await apiGetStudentProfiles(uids).catch(() => [])
        setPermStudents((Array.isArray(profiles) ? profiles : []).filter(Boolean).map((p: any) => ({ id: p.id, name: p.fullName || 'Şagird', uniqueId: p.uniqueId })))
      })
      .catch(() => {})
      .finally(() => setLoadingPerm(false))
  }, [mode])

  useEffect(() => {
    if (!selStudent) { setParentOpts([]); setSelParent(null); return }
    apiGetParentUidsByStudentUid(selStudent.id)
      .then((parents: any[]) => {
        setParentOpts(parents)
        setSelParent(parents[0] ?? null)
      })
      .catch(() => setParentOpts([]))
  }, [selStudent])

  const handleSend = async () => {
    const t = text.trim()
    setSending(true); setErr('')
    try {
      if (mode === 'parent') {
        if (!selParent || !selStudent) { setErr('Valideyn seçin'); setSending(false); return }
        if (!t) { setErr('Mesaj boş ola bilməz'); setSending(false); return }
        await apiTeacherMessageParent(selParent.uid, selStudent.id, t)
        onSent({ type: 'parent' })
      } else if (mode === 'direct') {
        const r = to.trim()
        if (!t || !r) { setErr('Alıcı və mesaj boş ola bilməz'); setSending(false); return }
        const msg = await apiTeacherSendDirectMessage(r, t)
        onSent(msg)
      } else {
        const r = to.trim()
        if (!t || !r) { setErr('Alıcı və mesaj boş ola bilməz'); setSending(false); return }
        const label = groups.find((g: any) => g.id === r)?.name ?? r
        const msg = await dbSendMessage({ to: r, toLabel: label, mode, text: t })
        onSent(msg)
      }
    } catch (e: any) {
      setErr(e?.message === 'Şagird tapılmadı' ? 'Şagird tapılmadı — ID və ya email yoxlayın' : 'Göndərmə xətası baş verdi')
    } finally { setSending(false) }
  }

  const MODES = [
    { key: 'direct', icon: '👤', label: 'Şagird' },
    { key: 'group',  icon: '👥', label: 'Qrup'   },
    { key: 'parent', icon: '👨‍👩‍👧', label: 'Valideyn' },
  ]

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }} transition={SPRING}
        style={{ width: '100%', maxWidth: 520, background: 'var(--bg-card)', border: '0.5px solid rgba(79,135,255,0.2)', borderRadius: '20px 20px 16px 16px', padding: 24 }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-1)' }}>Yeni Mesaj</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Mode tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {MODES.map(m => (
              <button key={m.key} onClick={() => { setMode(m.key as any); setTo(''); setSelStudent(null); setSelParent(null) }} style={{
                padding: '9px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                background: mode === m.key ? 'rgba(79,135,255,0.14)' : 'rgba(255,255,255,0.04)',
                border: mode === m.key ? '0.5px solid rgba(79,135,255,0.3)' : '0.5px solid var(--border)',
                color: mode === m.key ? '#4F87FF' : 'var(--text-3)',
                fontFamily: "'Lexend Deca', sans-serif",
              }}>{m.icon} {m.label}</button>
            ))}
          </div>

          {/* Recipient selector */}
          {mode === 'direct' && (
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Şagird ID-si və ya email</label>
              <input className="input" placeholder="ŞAG-XXXXXX və ya email@..." value={to} onChange={e => setTo(e.target.value)} />
            </div>
          )}
          {mode === 'group' && (
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Qrup</label>
              <select className="input" value={to} onChange={e => setTo(e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Qrup seçin...</option>
                {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name} — {g.subject}</option>)}
              </select>
            </div>
          )}
          {mode === 'parent' && (
            <>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Şagird (icazə verilmiş)</label>
                {loadingPerm ? (
                  <div style={{ textAlign: 'center', padding: 10 }}><span className="spinner" style={{ width: 18, height: 18 }} /></div>
                ) : permStudents.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>İcazə verilmiş şagird yoxdur</div>
                ) : (
                  <select className="input" value={selStudent?.id ?? ''} onChange={e => setSelStudent(permStudents.find((s: any) => s.id === e.target.value) ?? null)} style={{ appearance: 'none' }}>
                    <option value="">Şagird seçin...</option>
                    {permStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}{s.uniqueId ? ` (${s.uniqueId})` : ''}</option>)}
                  </select>
                )}
              </div>
              {selStudent && (
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Valideyn</label>
                  {parentOpts.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>Bu şagirdin qeydiyyatlı valideyni yoxdur</div>
                  ) : (
                    <select className="input" value={selParent?.uid ?? ''} onChange={e => setSelParent(parentOpts.find((p: any) => p.uid === e.target.value) ?? null)} style={{ appearance: 'none' }}>
                      {parentOpts.map((p: any) => <option key={p.uid} value={p.uid}>{p.profile?.fullName || `Valideyn ···${p.uid.slice(-4)}`}</option>)}
                    </select>
                  )}
                </div>
              )}
            </>
          )}

          {/* Message */}
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Mesaj</label>
            <textarea
              className="input"
              placeholder="Mesajınızı buraya yazın..."
              value={text}
              onChange={e => setText(e.target.value.slice(0, 500))}
              style={{ minHeight: 100, resize: 'none', lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right', marginTop: 3 }}>{text.length}/500</div>
          </div>

          {err && <div style={{ fontSize: 12, color: '#ff4d6d', padding: '8px 12px', background: 'rgba(255,77,109,0.1)', borderRadius: 8 }}>{err}</div>}

          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
              background: sending ? 'rgba(79,135,255,0.3)' : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
              border: 'none', color: '#fff', fontFamily: "'Lexend Deca', sans-serif",
              cursor: sending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(79,135,255,0.3)',
            }}
          >{sending ? 'Göndərilir...' : '→  Göndər'}</button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'messages', icon: '💬', label: 'Mesajlar'  },
  { key: 'parents',  icon: '👨‍👩‍👧', label: 'Valideyn' },
  { key: 'requests', icon: '📨', label: 'Sorğular'  },
  { key: 'system',   icon: '🔔', label: 'Sistem'    },
]

export default function TeacherMessages() {
  const [tab,           setTab]           = useState('messages')
  const [sentMsgs,      setSentMsgs]      = useState<any[]>([])
  const [groups,        setGroups]        = useState<any[]>([])
  const [permissions,   setPermissions]   = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [parentMsgs,    setParentMsgs]    = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)
  const [chatConv,      setChatConv]      = useState<any | null>(null)
  const [parentChat,    setParentChat]    = useState<any | null>(null)
  const [showCompose,   setShowCompose]   = useState(false)

  useEffect(() => {
    Promise.all([
      dbGetSentMessages().catch(() => []),
      apiGetMyGroups().catch(() => []),
      apiGetSentPermissions().catch(() => []),
      apiGetMyNotifications().catch(() => []),
      apiGetIncomingParentMsgs().catch(() => []),
    ]).then(([msgs, grps, perms, notifs, pMsgs]) => {
      setSentMsgs(Array.isArray(msgs)   ? msgs   : [])
      setGroups(Array.isArray(grps)     ? grps   : [])
      setPermissions(Array.isArray(perms) ? perms : [])
      setNotifications(Array.isArray(notifs) ? notifs : [])
      setParentMsgs(Array.isArray(pMsgs) ? pMsgs : [])
    }).finally(() => setLoading(false))
  }, [])

  const conversations   = buildConversations(sentMsgs)
  const parentConvs     = buildParentConversations(parentMsgs)
  const pendingCount    = permissions.filter(p => p.status === 'pending').length
  const unreadCount     = notifications.filter(n => !n.read).length
  const parentUnreplied = parentConvs.filter(c => c.lastFromRole === 'parent').length

  if (chatConv) {
    return (
      <div className="page-inner">
        <ChatView
          conv={chatConv}
          onBack={() => setChatConv(null)}
          onSent={(msg: any) => {
            setSentMsgs(prev => [msg, ...prev])
            setChatConv((prev: any) => prev ? {
              ...prev,
              messages: [msg, ...(prev.messages ?? [])],
              lastMsg: msg.text, lastTime: msg.sentAt,
            } : null)
          }}
        />
      </div>
    )
  }

  if (parentChat) {
    return (
      <div className="page-inner">
        <ParentChatView
          conv={parentChat}
          onBack={() => setParentChat(null)}
          onSent={(_key: string, msg: any) => {
            setParentMsgs(prev => [...prev, msg])
            setParentChat((prev: any) => prev ? {
              ...prev,
              messages: [...(prev.messages ?? []), msg],
              lastMsg: msg.text, lastTime: msg.createdAt, lastFromRole: 'teacher',
            } : null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="page-inner" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>Mesajlar</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Şagirdlər, valideynlər, sorğular, bildirişlər</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          style={{
            padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
            background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
            border: 'none', color: '#fff', cursor: 'pointer',
            fontFamily: "'Lexend Deca', sans-serif",
            boxShadow: '0 2px 12px rgba(79,135,255,0.3)',
          }}
        >+ Yaz</button>
      </div>

      <div style={{ display: 'flex', gap: 0, padding: 3, background: 'var(--bg-card)', borderRadius: 12, border: '0.5px solid var(--border-card)', marginBottom: 14 }}>
        {TABS.map(t => {
          const badge =
            t.key === 'requests' ? pendingCount :
            t.key === 'system'   ? unreadCount  :
            t.key === 'parents'  ? parentUnreplied : 0
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: tab === t.key ? '#4F87FF' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-3)',
              fontFamily: "'Lexend Deca', sans-serif", position: 'relative',
            }}>
              {t.icon} {t.label}
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: 3, right: 3,
                  minWidth: 14, height: 14, borderRadius: 7,
                  background: t.key === 'parents' ? '#F4A261' : '#ff4d6d',
                  color: '#fff', fontSize: 8, fontWeight: 800,
                  padding: '0 3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
        >
          {tab === 'messages' && <MessagesTab conversations={conversations} onOpenChat={setChatConv} loading={loading} />}
          {tab === 'parents'  && <ParentMsgsTab msgs={parentMsgs} onOpenChat={setParentChat} loading={loading} />}
          {tab === 'requests' && <RequestsTab permissions={permissions} setPermissions={setPermissions} />}
          {tab === 'system'   && <SystemTab   notifications={notifications} setNotifications={setNotifications} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            groups={groups}
            onClose={() => setShowCompose(false)}
            onSent={(msg: any) => { setSentMsgs(prev => [msg, ...prev]); setShowCompose(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
