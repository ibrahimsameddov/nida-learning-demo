// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import {
  apiGetAllParentMessages,
  apiGetMyChildren,
  apiGetStudentProfile,
  apiGetGroupMessages,
  apiGetParentTeacherMessages,
  apiSendParentTeacherMessage,
  apiGetMyNotifications,
  apiMarkAllNotificationsRead,
} from '@/lib/api'
import { SPRING } from '@/lib/motion'

const COLOR = '#F4A261'

function timeAgo(iso: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'indi'
  if (m < 60)  return `${m} dəq`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h} saat`
  const d = Math.floor(h / 24)
  if (d < 7)   return `${d} gün`
  return new Date(iso).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

function initials(name: string) {
  return (name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}

// ── Smart alerts from child stats ─────────────────────────────────────────────

function generateSmartAlerts(children: any[]) {
  const alerts: any[] = []
  const today = new Date().toISOString().slice(0, 10)

  for (const child of children) {
    const name  = child.fullName || child.name || 'Uşaq'
    const stats = child.stats ?? {}

    const todayItems = (stats.dailyProgress ?? []).filter((d: any) => d.date?.slice(0, 10) === today)
    if (todayItems.length === 0) {
      alerts.push({
        id:    `no-today-${child.id}`,
        icon:  '📵',
        title: `${name} bu gün hələ test həll etməyib`,
        body:  'Uşağınızı motivasiya etmək üçün müəlliminizə yazın',
        type:  'warning',
        time:  new Date().toISOString(),
      })
    }

    const streak = stats.streak ?? stats.currentStreak ?? 0
    if (streak === 0 && (stats.totalTests ?? 0) > 0) {
      alerts.push({
        id:    `streak-${child.id}`,
        icon:  '🔥',
        title: `${name} gündəlik seriyasını itirdi`,
        body:  'Ən az 1 test həll etməklə seriyasını bərpa edə bilər',
        type:  'warning',
        time:  new Date(Date.now() - 3600000).toISOString(),
      })
    }

    const avg = stats.averagePercent ?? 0
    if (avg > 0 && avg < 40) {
      alerts.push({
        id:    `low-avg-${child.id}`,
        icon:  '📉',
        title: `${name}-ın ortalama faizi aşağıdır (${Math.round(avg)}%)`,
        body:  'Zəif olan fənlərə daha çox diqqət yetirmək tövsiyə olunur',
        type:  'info',
        time:  new Date(Date.now() - 7200000).toISOString(),
      })
    }
  }

  return alerts
}

// ── Chat modal (same pattern as Teachers page) ────────────────────────────────

function ChatModal({ teacher, childUid, childName, groupId, onClose }: any) {
  const [msgs,    setMsgs]    = useState<any[]>([])
  const [gMsgs,   setGMsgs]   = useState<any[]>([])
  const [text,    setText]    = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'direct' | 'group'>('direct')
  const bottomRef             = useRef<HTMLDivElement>(null)
  const teacherName           = teacher.fullName || teacher.displayName || 'Müəllim'

  useEffect(() => {
    if (!teacher?.id || !childUid) { setLoading(false); return }
    Promise.all([
      apiGetParentTeacherMessages(teacher.id, childUid).catch(() => []),
      groupId ? apiGetGroupMessages(groupId).catch(() => []) : Promise.resolve([]),
    ]).then(([dm, gm]) => {
      setMsgs(Array.isArray(dm) ? dm : [])
      setGMsgs(Array.isArray(gm) ? gm : [])
    }).finally(() => setLoading(false))
  }, [teacher?.id, childUid, groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async () => {
    const t = text.trim()
    if (!t || sending) return
    setSending(true)
    try {
      const msg = await apiSendParentTeacherMessage(teacher.id, childUid, t)
      setMsgs(prev => [...prev, msg])
      setText('')
    } catch { /* ignore */ } finally { setSending(false) }
  }

  const displayMsgs = tab === 'direct' ? msgs : gMsgs

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }} transition={SPRING}
        style={{ width: '100%', maxWidth: 520, height: '76vh', background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: '24px 24px 18px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #7B61FF, #5e47d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>
              {initials(teacherName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{teacherName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{childName} haqqında</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: 'var(--text-3)', fontSize: 17 }}>×</button>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, gap: 3 }}>
            {[
              { id: 'direct', label: '💬 Şəxsi' },
              { id: 'group',  label: '📢 Qrup'  },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.id ? 'rgba(244,162,97,0.15)' : 'transparent',
                color:      tab === t.id ? COLOR : 'var(--text-3)',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <span className="spinner" style={{ width: 20, height: 20 }} />
            </div>
          ) : displayMsgs.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>{tab === 'direct' ? '💬' : '📢'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
                {tab === 'direct' ? 'Hələ mesaj yoxdur' : 'Qrup mesajı yoxdur'}
              </div>
            </div>
          ) : tab === 'direct' ? (
            displayMsgs.map((m, i) => {
              const isParent = m.fromRole === 'parent'
              return (
                <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isParent ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '78%', padding: '8px 12px', fontSize: 13, lineHeight: 1.45,
                    borderRadius: isParent ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isParent ? `linear-gradient(135deg, ${COLOR}, #e8895a)` : 'rgba(255,255,255,0.08)',
                    border: isParent ? 'none' : '0.5px solid var(--border-card)',
                    color: isParent ? '#fff' : 'var(--text-1)',
                  }}>{m.text}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 3, paddingInline: 4 }}>
                    {!isParent && `${teacherName} · `}{timeAgo(m.sentAt || m.createdAt)}
                  </div>
                </div>
              )
            })
          ) : (
            displayMsgs.map((m, i) => (
              <div key={m.id || i} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border-card)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7B61FF' }}>{teacherName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{timeAgo(m.sentAt || m.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{m.text}</div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {tab === 'direct' && (
          <div style={{ padding: '10px 16px 16px', flexShrink: 0, borderTop: '0.5px solid var(--border-card)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={`${teacherName}-ə mesaj...`}
              rows={1}
              style={{ flex: 1, resize: 'none', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border-card)', borderRadius: 12, padding: '9px 12px', fontSize: 13, color: 'var(--text-1)', fontFamily: 'inherit', outline: 'none', lineHeight: 1.4, maxHeight: 88, overflowY: 'auto' }}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              style={{ width: 40, height: 40, borderRadius: 11, border: 'none', cursor: !text.trim() || sending ? 'not-allowed' : 'pointer', background: !text.trim() || sending ? 'rgba(244,162,97,0.25)' : `linear-gradient(135deg, ${COLOR}, #e8895a)`, color: '#fff', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {sending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↑'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

type Tab = 'teachers' | 'notifications'

export default function ParentMessages() {
  const [tab,           setTab]          = useState<Tab>('teachers')
  const [allMsgs,       setAllMsgs]      = useState<any[]>([])
  const [teacherMap,    setTeacherMap]   = useState<Record<string, any>>({})
  const [children,      setChildren]     = useState<any[]>([])
  const [notifications, setNotifs]       = useState<any[]>([])
  const [smartAlerts,   setSmartAlerts]  = useState<any[]>([])
  const [loading,       setLoading]      = useState(true)
  const [chatTarget,    setChatTarget]   = useState<any>(null)

  useEffect(() => {
    Promise.all([
      apiGetAllParentMessages().catch(() => []),
      apiGetMyChildren().catch(() => []),
      apiGetMyNotifications().catch(() => []),
    ]).then(async ([msgs, kids, notifs]) => {
      const msgList  = Array.isArray(msgs)  ? msgs  : []
      const kidList  = Array.isArray(kids)  ? kids  : []
      const notifList= Array.isArray(notifs)? notifs: []

      setAllMsgs(msgList)
      setChildren(kidList)
      setNotifs(notifList)
      setSmartAlerts(generateSmartAlerts(kidList))

      // Load teacher profiles for unique teacherUids
      const uids = [...new Set(msgList.map((m: any) => m.teacherUid).filter(Boolean))] as string[]
      if (uids.length) {
        const profiles = await Promise.all(uids.map(u => apiGetStudentProfile(u).catch(() => null)))
        const map: Record<string, any> = {}
        uids.forEach((u, i) => { if (profiles[i]) map[u] = { ...profiles[i], id: u } })
        setTeacherMap(map)
      }
    }).finally(() => setLoading(false))
  }, [])

  // Group messages into conversations by teacherUid + childUid
  type ConvoKey = string
  const conversations = (() => {
    const map = new Map<ConvoKey, any>()
    for (const m of allMsgs) {
      const key = `${m.teacherUid}::${m.childUid}`
      const existing = map.get(key)
      if (!existing || new Date(m.createdAt) > new Date(existing.lastTime)) {
        map.set(key, {
          key,
          teacherUid: m.teacherUid,
          childUid:   m.childUid,
          lastMsg:    m.text,
          lastTime:   m.createdAt,
          fromRole:   m.fromRole,
        })
      }
    }
    return [...map.values()].sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
  })()

  const getChildName = (childUid: string) => {
    const c = children.find(k => k.id === childUid)
    return c?.fullName || c?.name || 'Uşaq'
  }

  const unreadCount = notifications.filter((n: any) => !n.read).length + smartAlerts.length

  const markAllRead = async () => {
    try { await apiMarkAllNotificationsRead() } catch { /* ignore */ }
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="page-inner anim-fade-up">
      <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>Mesajlar</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Müəllimlər və sistem bildirişləri</div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, gap: 4 }}>
        {([
          { id: 'teachers',      label: '💬 Müəllimlər',  badge: conversations.length },
          { id: 'notifications', label: '🔔 Bildirişlər', badge: unreadCount },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: tab === t.id ? `linear-gradient(135deg, ${COLOR}, #e8895a)` : 'transparent',
              color:      tab === t.id ? '#fff' : 'var(--text-3)',
            }}
          >
            {t.label}
            {t.badge > 0 && (
              <span style={{ fontSize: 9, fontWeight: 800, background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'rgba(244,162,97,0.3)', color: tab === t.id ? '#fff' : COLOR, borderRadius: 999, padding: '1px 5px', minWidth: 14, textAlign: 'center' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {/* ── Teacher conversations tab ── */}
            {tab === 'teachers' && (
              conversations.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '44px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Hələ mesaj göndərilməyib</div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65 }}>
                    Müəllimlər bölməsindən müəllimlə söhbəti başladın
                  </p>
                </div>
              ) : (
                conversations.map(convo => {
                  const teacher = teacherMap[convo.teacherUid]
                  const tName   = teacher?.fullName || teacher?.displayName || 'Müəllim'
                  const cName   = getChildName(convo.childUid)
                  const isFromParent = convo.fromRole === 'parent'
                  return (
                    <div
                      key={convo.key}
                      onClick={() => setChatTarget({ teacher: teacher ?? { id: convo.teacherUid }, childUid: convo.childUid, childName: cName })}
                      style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: 'linear-gradient(135deg, #7B61FF, #5e47d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>
                        {initials(tName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{tName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isFromParent ? 'Siz: ' : `${tName}: `}{convo.lastMsg}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                          {cName} haqqında
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{timeAgo(convo.lastTime)}</div>
                        <span style={{ fontSize: 16, color: 'var(--text-3)' }}>›</span>
                      </div>
                    </div>
                  )
                })
              )
            )}

            {/* ── Notifications tab ── */}
            {tab === 'notifications' && (
              <>
                {/* Smart alerts */}
                {smartAlerts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingInline: 2 }}>
                      Fəaliyyət Xəbərdarlıqları
                    </div>
                    {smartAlerts.map(a => (
                      <div key={a.id} style={{ background: a.type === 'warning' ? 'rgba(244,162,97,0.06)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${a.type === 'warning' ? 'rgba(244,162,97,0.22)' : 'var(--border-card)'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: a.type === 'warning' ? 'rgba(244,162,97,0.12)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {a.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{a.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>{a.body}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{timeAgo(a.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* System notifications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {notifications.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: 2 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Sistem Bildirişləri
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          style={{ fontSize: 10, color: '#00C9A7', background: 'rgba(0,201,167,0.08)', border: '0.5px solid rgba(0,201,167,0.2)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          ✓ Hamısını oxu
                        </button>
                      )}
                    </div>
                  )}

                  {notifications.length === 0 && smartAlerts.length === 0 && (
                    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '44px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>Hər şey sakit</div>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Yeni bildiriş gəldikdə burada görünəcək</p>
                    </div>
                  )}

                  {notifications.map((n: any) => (
                    <div
                      key={n.id}
                      style={{ background: n.read ? 'var(--bg-card)' : 'rgba(244,162,97,0.05)', border: `0.5px solid ${n.read ? 'var(--border-card)' : 'rgba(244,162,97,0.2)'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(244,162,97,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {n.icon || '🔔'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: 'var(--text-1)' }}>
                            {n.title || n.message || 'Bildiriş'}
                          </div>
                          {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLOR, flexShrink: 0, marginTop: 3 }} />}
                        </div>
                        {n.body && <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>{n.body}</div>}
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Chat modal */}
      <AnimatePresence>
        {chatTarget && (
          <ChatModal
            teacher={chatTarget.teacher}
            childUid={chatTarget.childUid}
            childName={chatTarget.childName}
            groupId={null}
            onClose={() => setChatTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
