// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import {
  apiGetMyChildren,
  apiGetGroupsByStudentUid,
  apiGetStudentProfile,
  apiGetGroupMessages,
  apiGetParentTeacherMessages,
  apiSendParentTeacherMessage,
} from '@/lib/api'
import { SPRING } from '@/lib/motion'

const COLOR = '#F4A261'

function initials(name: string) {
  return (name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
}

function timeLabel(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

// ── Teacher Card ──────────────────────────────────────────────────────────────

function TeacherCard({ teacher, groupName, onChat }: { teacher: any; groupName: string; onChat: () => void }) {
  const name = teacher.fullName || teacher.displayName || 'Müəllim'
  const ini  = initials(name)

  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
      borderRadius: 18, padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: 'linear-gradient(135deg, #7B61FF, #5e47d6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff',
      }}>
        {ini}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>{groupName}</div>
        {teacher.uniqueId && (
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>{teacher.uniqueId}</div>
        )}
      </div>

      <button
        onClick={onChat}
        style={{
          padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700,
          border: 'none', background: `linear-gradient(135deg, ${COLOR}, #e8895a)`,
          color: '#fff', cursor: 'pointer', flexShrink: 0,
          fontFamily: "'Lexend Deca', sans-serif",
        }}
      >
        💬 Mesaj
      </button>
    </div>
  )
}

// ── Chat View (bottom-sheet style modal) ──────────────────────────────────────

type ChatTab = 'direct' | 'group'

function ChatModal({ teacher, child, groupId, groupName, onClose }: {
  teacher:   any
  child:     any
  groupId:   string
  groupName: string
  onClose:   () => void
}) {
  const [tab,           setTab]     = useState<ChatTab>('direct')
  const [directMsgs,   setDirect]  = useState<any[]>([])
  const [groupMsgs,    setGroup]   = useState<any[]>([])
  const [text,         setText]    = useState('')
  const [sending,      setSending] = useState(false)
  const [loading,      setLoading] = useState(true)
  const bottomRef                  = useRef<HTMLDivElement>(null)

  const teacherName = teacher.fullName || teacher.displayName || 'Müəllim'
  const childUid    = child?.id

  useEffect(() => {
    if (!teacher?.id || !childUid) { setLoading(false); return }
    Promise.all([
      apiGetParentTeacherMessages(teacher.id, childUid).catch(() => []),
      apiGetGroupMessages(groupId).catch(() => []),
    ]).then(([dm, gm]) => {
      setDirect(Array.isArray(dm) ? dm : [])
      setGroup(Array.isArray(gm) ? gm : [])
    }).finally(() => setLoading(false))
  }, [teacher?.id, childUid, groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [directMsgs])

  const send = async () => {
    const t = text.trim()
    if (!t || sending || !teacher?.id || !childUid) return
    setSending(true)
    try {
      const msg = await apiSendParentTeacherMessage(teacher.id, childUid, t)
      setDirect(prev => [...prev, msg])
      setText('')
    } catch { /* ignore */ } finally { setSending(false) }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const currentMsgs = tab === 'direct' ? directMsgs : groupMsgs

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }} transition={SPRING}
        style={{ width: '100%', maxWidth: 520, height: '78vh', background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: '24px 24px 18px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7B61FF, #5e47d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>
              {initials(teacherName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{teacherName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {groupName} · {child?.fullName || child?.name || 'Şagird'} haqqında
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text-3)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, gap: 3 }}>
            {[
              { id: 'direct' as ChatTab, label: '💬 Şəxsi Mesajlar' },
              { id: 'group'  as ChatTab, label: '📢 Qrup Mesajları'  },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.id ? 'rgba(244,162,97,0.15)' : 'transparent',
                color:      tab === t.id ? COLOR : 'var(--text-3)',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <span className="spinner" style={{ width: 20, height: 20 }} />
            </div>
          ) : currentMsgs.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>
                {tab === 'direct' ? '💬' : '📢'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
                {tab === 'direct' ? 'Hələ mesaj yoxdur' : 'Qrup mesajı yoxdur'}
              </div>
              <div style={{ fontSize: 11 }}>
                {tab === 'direct'
                  ? 'Müəllimə ilk mesajınızı göndərin'
                  : 'Müəllim qrupa mesaj göndərdikdə burada görünəcək'}
              </div>
            </div>
          ) : (
            <>
              {tab === 'direct' ? (
                currentMsgs.map((m, i) => {
                  const isParent = m.fromRole === 'parent'
                  return (
                    <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isParent ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '78%', padding: '9px 13px', borderRadius: isParent ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isParent ? `linear-gradient(135deg, ${COLOR}, #e8895a)` : 'rgba(255,255,255,0.08)',
                        border: isParent ? 'none' : '0.5px solid var(--border-card)',
                      }}>
                        <div style={{ fontSize: 13, color: isParent ? '#fff' : 'var(--text-1)', lineHeight: 1.45 }}>{m.text}</div>
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 3, paddingInline: 4 }}>
                        {!isParent && <span style={{ marginRight: 4 }}>{teacherName} ·</span>}
                        {timeLabel(m.sentAt || m.createdAt)}
                      </div>
                    </div>
                  )
                })
              ) : (
                currentMsgs.map((m, i) => (
                  <div key={m.id || i} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7B61FF' }}>{teacherName}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{timeLabel(m.sentAt || m.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{m.text}</div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input (only for direct messages) */}
        {tab === 'direct' && (
          <div style={{ padding: '10px 16px 16px', flexShrink: 0, borderTop: '0.5px solid var(--border-card)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder={`${teacherName}-ə mesaj...`}
              rows={1}
              style={{
                flex: 1, resize: 'none', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border-card)',
                borderRadius: 12, padding: '10px 12px', fontSize: 13, color: 'var(--text-1)',
                fontFamily: 'inherit', outline: 'none', lineHeight: 1.4, maxHeight: 96, overflowY: 'auto',
              }}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none', cursor: !text.trim() || sending ? 'not-allowed' : 'pointer',
                background: !text.trim() || sending ? 'rgba(244,162,97,0.25)' : `linear-gradient(135deg, ${COLOR}, #e8895a)`,
                color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '↑'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Child selector (compact) ──────────────────────────────────────────────────

function ChildSelector({ children, idx, onPrev, onNext, onDot }: any) {
  const child    = children[idx] ?? null
  const ini      = child ? initials(child.fullName || child.name || '?') : '?'

  return (
    <div style={{ background: 'rgba(244,162,97,0.07)', border: '0.5px solid rgba(244,162,97,0.2)', borderRadius: 16, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {children.length > 1 && (
          <button onClick={onPrev} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.3)', color: COLOR, fontSize: 15, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00C9A7, #00a88c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {ini}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {child?.fullName || child?.name || 'Şagird'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                {child?.uniqueId || '—'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {children.length > 1 && (
          <button onClick={onNext} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.3)', color: COLOR, fontSize: 15, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        )}
      </div>
      {children.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
          {children.map((_: any, i: number) => (
            <button key={i} onClick={() => onDot(i)} style={{ width: i === idx ? 16 : 6, height: 5, borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s', background: i === idx ? COLOR : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ParentTeachers() {
  const [children,     setChildren]     = useState<any[]>([])
  const [selectedIdx,  setSelectedIdx]  = useState(0)
  const [groups,       setGroups]       = useState<any[]>([])
  const [teachers,     setTeachers]     = useState<Record<string, any>>({})
  const [loading,      setLoading]      = useState(true)
  const [groupLoading, setGroupLoading] = useState(false)
  const [chatTarget,   setChatTarget]   = useState<{ teacher: any; groupId: string; groupName: string } | null>(null)

  useEffect(() => {
    apiGetMyChildren()
      .then(kids => setChildren(Array.isArray(kids) ? kids : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const child = children[selectedIdx] ?? null

  useEffect(() => {
    if (!child?.id) { setGroups([]); setTeachers({}); return }
    setGroupLoading(true)
    apiGetGroupsByStudentUid(child.id)
      .then(async (gs: any[]) => {
        setGroups(gs)
        const teacherUids = [...new Set(gs.map(g => g.teacherUid).filter(Boolean))]
        const profiles = await Promise.all(
          teacherUids.map(uid => apiGetStudentProfile(uid as string).catch(() => null))
        )
        const map: Record<string, any> = {}
        teacherUids.forEach((uid, i) => { if (profiles[i]) map[uid as string] = { ...profiles[i], id: uid } })
        setTeachers(map)
      })
      .catch(() => { setGroups([]); setTeachers({}) })
      .finally(() => setGroupLoading(false))
  }, [child?.id])

  const prevChild = () => setSelectedIdx(i => (i - 1 + children.length) % children.length)
  const nextChild = () => setSelectedIdx(i => (i + 1) % children.length)

  // Deduplicate teachers across groups — keep one entry per teacher, listing all their groups
  const teacherGroups = groups.reduce((acc: Record<string, string[]>, g) => {
    if (g.teacherUid) {
      if (!acc[g.teacherUid]) acc[g.teacherUid] = []
      acc[g.teacherUid].push(g.name || g.subject || 'Qrup')
    }
    return acc
  }, {})

  // For chat, use the first group of that teacher
  const firstGroupFor = (teacherUid: string) =>
    groups.find(g => g.teacherUid === teacherUid) ?? null

  return (
    <div className="page-inner anim-fade-up">
      <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>Müəllimlər</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Uşağınızın qrup müəllimləri</div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>

      ) : children.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍🏫</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>Hələ övlad əlavə edilməyib</div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Əvvəlcə övladınızı bağlayın</p>
        </div>

      ) : (
        <>
          <ChildSelector
            children={children}
            idx={selectedIdx}
            onPrev={prevChild}
            onNext={nextChild}
            onDot={(i: number) => setSelectedIdx(i)}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {groupLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <span className="spinner" style={{ width: 20, height: 20 }} />
                </div>

              ) : Object.keys(teacherGroups).length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🏫</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Hələ heç bir qrupa üzv deyil
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                    Şagird müəllim tərəfindən qrupa əlavə olunduqda<br />müəllimləri burada görəcəksiniz
                  </p>
                </div>

              ) : (
                Object.entries(teacherGroups).map(([teacherUid, groupNames]) => {
                  const teacher = teachers[teacherUid]
                  if (!teacher) return null
                  const firstGroup = firstGroupFor(teacherUid)
                  return (
                    <TeacherCard
                      key={teacherUid}
                      teacher={teacher}
                      groupName={groupNames.join(', ')}
                      onChat={() => setChatTarget({
                        teacher,
                        groupId:   firstGroup?.id ?? '',
                        groupName: groupNames[0] ?? '',
                      })}
                    />
                  )
                })
              )}
            </motion.div>
          </AnimatePresence>

          {/* Info note */}
          {Object.keys(teacherGroups).length > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(123,97,255,0.06)', border: '0.5px solid rgba(123,97,255,0.15)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
              Müəllimə mesaj göndərmək üçün "Mesaj" düyməsinə basın
            </div>
          )}
        </>
      )}

      {/* Chat modal */}
      <AnimatePresence>
        {chatTarget && (
          <ChatModal
            teacher={chatTarget.teacher}
            child={child}
            groupId={chatTarget.groupId}
            groupName={chatTarget.groupName}
            onClose={() => setChatTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
