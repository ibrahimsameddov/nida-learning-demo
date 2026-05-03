// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMyChildren, apiDisconnectChild, apiGetParentRequests } from '@/lib/api'
import { SPRING }              from '@/lib/motion'

const COLOR = '#F4A261'

const GRADE_LABEL: Record<number, string> = { 9: '9-cu', 10: '10-cu', 11: '11-ci' }

function ChildDetailCard({ child, onDisconnect }: any) {
  const [confirming,    setConfirming]    = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const name     = child.fullName || child.name || 'Şagird'
  const initials = name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase()
  const grade    = child.grade
  const stats    = child.stats ?? {}
  const avg      = Math.round(stats.averagePercent ?? 0)
  const total    = stats.totalTests ?? 0
  const streak   = stats.streak ?? stats.currentStreak ?? 0
  const subjects = (stats.subjectStats ?? []).slice(0, 4)
  const recent   = (stats.recentSessions ?? []).slice(0, 3)

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await apiDisconnectChild(child.id)
      onDisconnect(child.id)
    } catch { /* ignore */ } finally { setDisconnecting(false); setConfirming(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
      style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 20, padding: '20px', marginBottom: 12 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15, flexShrink: 0,
          background: 'linear-gradient(135deg, #00C9A7, #00a88c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {grade && <span>{GRADE_LABEL[grade] ?? grade}-ci sinif ·</span>}
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00C9A7' }}>{child.uniqueId || '—'}</span>
          </div>
        </div>
        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 5, fontWeight: 700, background: 'rgba(0,201,167,0.1)', color: '#00C9A7', flexShrink: 0 }}>Aktiv</span>
      </div>

      <div style={{ height: '0.5px', background: 'var(--border-card)', marginBottom: 14 }} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { val: total,         lbl: 'Test',     color: 'var(--text-1)' },
          { val: `${avg}%`,     lbl: 'Ortalama', color: avg >= 60 ? '#00C9A7' : avg >= 40 ? '#F4A261' : '#ff4d6d' },
          { val: `${streak}🔥`, lbl: 'Streak',   color: 'var(--text-1)' },
        ].map(k => (
          <div key={k.lbl} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: k.color, fontFamily: "'Lexend Deca', sans-serif" }}>{k.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Subject progress */}
      {subjects.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Fənn üzrə nəticələr (48-72 saat gecikməli)
          </div>
          {subjects.map((s: any) => (
            <div key={s.subject} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject}</div>
              <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${Math.round(s.averagePercent ?? 0)}%`, background: (s.averagePercent ?? 0) >= 60 ? '#00C9A7' : '#F4A261', transition: 'width 0.6s' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', minWidth: 32, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(s.averagePercent ?? 0)}%</span>
            </div>
          ))}
          <div style={{ height: '0.5px', background: 'var(--border-card)', margin: '12px 0' }} />
        </>
      )}

      {/* Recent sessions */}
      {recent.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Son testlər
          </div>
          {recent.map((r: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{r.subject || '—'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{r.totalQuestions || 0} sual</div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: (r.accuracy ?? 0) >= 60 ? '#00C9A7' : '#F4A261', fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.round(r.accuracy ?? 0)}%
              </span>
            </div>
          ))}
          <div style={{ height: '0.5px', background: 'var(--border-card)', margin: '12px 0' }} />
        </>
      )}

      {/* Disconnect */}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(255,77,109,0.08)', border: '0.5px solid rgba(255,77,109,0.2)', color: '#ff4d6d', cursor: 'pointer' }}
        >Bağlantını kəs</button>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setConfirming(false)}
            style={{ flex: 1, padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer' }}
          >Ləğv et</button>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            style={{ flex: 1, padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#ff4d6d', border: 'none', color: '#fff', cursor: disconnecting ? 'not-allowed' : 'pointer', opacity: disconnecting ? 0.7 : 1 }}
          >{disconnecting ? '...' : 'Bəli, kəs'}</button>
        </div>
      )}
    </motion.div>
  )
}

function PendingCard({ req }: any) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid rgba(244,162,97,0.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244,162,97,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⏳</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>
          {req.childUniqueId || req.childUid || 'Şagird'}
        </div>
        <div style={{ fontSize: 11, color: COLOR }}>Qəbul gözlənilir</div>
      </div>
      <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 5, fontWeight: 700, background: 'rgba(244,162,97,0.1)', color: COLOR, flexShrink: 0 }}>Gözləyir</span>
    </div>
  )
}

export default function ParentChildren() {
  const navigate   = useNavigate()
  const [children, setChildren]   = useState<any[]>([])
  const [pending,  setPending]    = useState<any[]>([])
  const [loading,  setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      apiGetMyChildren().catch(() => []),
      apiGetParentRequests().catch(() => []),
    ]).then(([kids, reqs]) => {
      setChildren(Array.isArray(kids) ? kids : [])
      setPending((Array.isArray(reqs) ? reqs : []).filter((r: any) => r.status === 'pending'))
    }).finally(() => setLoading(false))
  }, [])

  const handleDisconnect = (childId: string) => {
    setChildren(prev => prev.filter(c => c.id !== childId))
  }

  return (
    <div className="page-inner anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif' }}>
            Övladlarım
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Maksimum 5 övlad izləyə bilərsiniz</p>
        </div>
        {children.length < 5 && (
          <button
            onClick={() => navigate('/onboarding/parent')}
            style={{
              padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none',
              background: `linear-gradient(135deg, ${COLOR}, #e8895a)`,
              color: '#fff', cursor: 'pointer',
              fontFamily: "'Lexend Deca', sans-serif",
            }}
          >+ Əlavə et</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Gözlənilən sorğular ({pending.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pending.map((req: any) => <PendingCard key={req.id} req={req} />)}
              </div>
            </div>
          )}

          {/* Connected */}
          {children.length > 0 ? (
            children.map((child: any) => (
              <ChildDetailCard key={child.id} child={child} onDisconnect={handleDisconnect} />
            ))
          ) : pending.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '44px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>👨‍👩‍👧</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>Hələ övlad yoxdur</div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 18 }}>
                Övladınızın ID-si ilə sorğu göndərin
              </p>
              <button
                onClick={() => navigate('/onboarding/parent')}
                style={{ padding: '11px 24px', borderRadius: 12, fontWeight: 700, fontSize: 13, border: 'none', background: `linear-gradient(135deg, ${COLOR}, #e8895a)`, color: '#fff', cursor: 'pointer' }}
              >+ Övlad Əlavə Et</button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
