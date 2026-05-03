import { useState } from 'react'

const MSGS = [
  { id: 1, from: 'Günel Hüseynova', role: 'Müəllim', text: 'Növbəti dərs Çərşənbə axşamı. Bölmə 4-ü oxuyun.', time: '10:30', read: false },
  { id: 2, from: 'Sistem',          role: 'Bildiriş', text: 'Riyaziyyat testini 85% nəticə ilə tamamladınız! 🎉', time: 'Dünən',   read: true  },
  { id: 3, from: 'Kamran Əliyev',   role: 'Müəllim', text: 'Fizika imtahanı 28 Aprel saat 10:00-da başlayacaq.', time: '2 gün',  read: true  },
  { id: 4, from: 'Sistem',          role: 'Bildiriş', text: '10-A Riyaziyyat qrupuna dəvət edildiniz.',          time: '3 gün',  read: true  },
]

export default function Messages() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        Mesajlar
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
        {MSGS.filter(m => !m.read).length} oxunmamış mesaj
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MSGS.map((m, i) => (
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
            <div className="avatar avatar-sm" style={{ background: m.role === 'Müəllim' ? 'var(--primary)' : 'var(--accent)', flexShrink: 0 }}>
              {m.from.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{m.from}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{m.role}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, display: active === m.id ? 'block' : '-webkit-box', WebkitLineClamp: active === m.id ? undefined : 2, WebkitBoxOrient: 'vertical' as const, overflow: active === m.id ? 'visible' : 'hidden' }}>
                {m.text}
              </div>
            </div>
            {!m.read && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
