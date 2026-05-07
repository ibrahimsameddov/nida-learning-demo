// @ts-nocheck
import { useState, useEffect } from 'react'
import { apiGetReceivedMessages } from '@/lib/api'

function fmt(ts: any) {
  if (!ts) return ''
  const d   = new Date(ts)
  const now = new Date()
  const diffMs  = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH   = Math.floor(diffMin / 60)
  const diffD   = Math.floor(diffH   / 24)
  if (diffMin < 2)  return 'İndicə'
  if (diffMin < 60) return `${diffMin} dəq`
  if (diffH   < 24) return `${diffH} saat`
  if (diffD   < 7)  return `${diffD} gün əvvəl`
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

export default function Messages() {
  const [msgs,    setMsgs]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [active,  setActive]  = useState<string | null>(null)

  useEffect(() => {
    apiGetReceivedMessages()
      .then(data => setMsgs(Array.isArray(data) ? data : []))
      .catch(() => setMsgs([]))
      .finally(() => setLoading(false))
  }, [])

  const unread = msgs.filter(m => !m.read).length

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        Mesajlar
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
        {loading ? 'Yüklənir...' : unread > 0 ? `${unread} oxunmamış mesaj` : 'Bütün mesajlar oxunub'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>Yüklənir...</div>
      ) : msgs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--bg-card)', borderRadius: 20,
          border: '0.5px solid var(--border)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Mesaj yoxdur</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Müəllim mesaj göndərdikdə burada görünəcək</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msgs.map((m, i) => (
            <button
              key={m.id}
              className={`card card-hover anim-fade-up d${Math.min(i + 1, 5)}`}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px', width: '100%', textAlign: 'left',
                border: active === m.id ? '1px solid var(--border-hover)' : undefined,
                background: !m.read ? 'rgba(0,212,255,0.04)' : undefined,
              }}
              onClick={() => setActive(active === m.id ? null : m.id)}
            >
              <div className="avatar avatar-sm"
                style={{ background: 'var(--primary)', flexShrink: 0 }}>
                {(m.fromName ?? 'M').charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                    {m.fromName ?? 'Müəllim'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmt(m.createdAt)}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'capitalize' }}>
                  {m.fromRole === 'teacher' ? 'Müəllim' : m.fromRole}
                </div>
                <div style={{
                  fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5,
                  display: active === m.id ? 'block' : '-webkit-box',
                  WebkitLineClamp: active === m.id ? undefined : 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: active === m.id ? 'visible' : 'hidden',
                }}>
                  {m.text}
                </div>
              </div>
              {!m.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
