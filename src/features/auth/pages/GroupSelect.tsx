import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'

const GROUPS = [
  {
    id: 'I',
    label: 'I Qrup',
    icon: '⚡',
    subjects: 'Riyaziyyat + Fizika',
    color: '#6366f1',
    desc: 'Texniki elmləri seçənlər üçün. Mühəndislik, fizika, riyaziyyat.',
  },
  {
    id: 'II',
    label: 'II Qrup',
    icon: '🧬',
    subjects: 'Riyaziyyat + Kimya / Biologiya',
    color: '#10b981',
    desc: 'Tibb, biotexnologiya, kimya sahəsini planlaşdıranlar üçün.',
  },
  {
    id: 'III',
    label: 'III Qrup',
    icon: '📖',
    subjects: 'Azərbaycan dili + Tarix / Coğrafiya',
    color: '#f59e0b',
    desc: 'Humanitar elmlər, hüquq, dil, tarix sahəsini seçənlər üçün.',
  },
  {
    id: 'IV',
    label: 'IV Qrup',
    icon: '🌍',
    subjects: 'Xarici dil + Coğrafiya / Tarix',
    color: '#06b6d4',
    desc: 'Beynəlxalq münasibətlər, turizm, dilçilik üçün.',
  },
]

export default function GroupSelect() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const finish = async () => {
    if (!selected) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, position: 'relative',
      overflow: 'hidden', background: 'var(--bg-primary)',
    }}>

      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.35,
        background: 'var(--glow)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h1 style={{ fontFamily: "'Lexend Deca','Lexend Deca',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text-1)', marginBottom: 6 }}>
            İxtisas Qrupu
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            DIM-ə hazırlıq üçün ixtisas qrupunuzu seçin
          </p>
        </div>

        {/* Group cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {GROUPS.map(g => {
            const active = selected === g.id
            return (
              <button
                key={g.id}
                onClick={() => setSelected(g.id)}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '16px 18px', borderRadius: 16, textAlign: 'left',
                  border: `2px solid ${active ? g.color : 'rgba(148,163,184,0.2)'}`,
                  background: active ? `${g.color}14` : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: active ? `0 0 20px ${g.color}20` : 'none',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  background: active ? `${g.color}22` : 'rgba(148,163,184,0.1)',
                  border: `1.5px solid ${active ? g.color : 'transparent'}`,
                }}>
                  {g.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: active ? g.color : 'var(--text-1)' }}>
                      {g.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                      background: `${g.color}22`, color: g.color,
                    }}>
                      {g.subjects}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                    {g.desc}
                  </p>
                </div>
                {active && (
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', fontWeight: 700,
                  }}>
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={!selected || loading}
          onClick={finish}
        >
          {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Başla →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, marginTop: 14, color: 'var(--text-3)' }}>
          Qrupu sonra profil səhifəsindən dəyişə bilərsiniz
        </p>
      </div>
    </div>
  )
}
