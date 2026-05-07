import { useState }     from 'react'
import { useNavigate }  from 'react-router-dom'
import { dbSaveProfile } from '../../../lib/db'
import type { SpecialtyGroup } from '../../../types/examData'

// ── Ixtisas qrupu data ────────────────────────────────────────────────────────
const GROUPS = [
  {
    id: 'I', label: 'I İxtisas Qrupu', sublabel: 'Texniki-Riyazi', icon: '🔵',
    color: '#38BDF8',
    desc: 'Mühəndislik, texnologiya, riyaziyyat, fizika sahələri',
    subgroups: [
      {
        id: 'I_RK' as SpecialtyGroup,
        label: 'RK altqrupu',
        subjects: 'Riyaziyyat · Fizika · Kimya',
      },
      {
        id: 'I_RI' as SpecialtyGroup,
        label: 'RI altqrupu',
        subjects: 'Riyaziyyat · Fizika · İnformatika',
      },
    ],
  },
  {
    id: 'II', value: 'II' as SpecialtyGroup,
    label: 'II İxtisas Qrupu', sublabel: 'İqtisadi-Sosial', icon: '🟢',
    color: '#00C9A7',
    desc: 'İqtisadiyyat, biznes, sosial elmlər, coğrafiya',
    subjects: 'Riyaziyyat · Coğrafiya · Tarix',
    subgroups: null,
  },
  {
    id: 'III', label: 'III İxtisas Qrupu', sublabel: 'Humanitar-Pedaqoji', icon: '🟡',
    color: '#F4A261',
    desc: 'Hüquq, pedaqogika, tarix, ədəbiyyat sahələri',
    subgroups: [
      {
        id: 'III_DT' as SpecialtyGroup,
        label: 'DT altqrupu',
        subjects: 'Az. dili / Rus dili · Tarix · Ədəbiyyat',
      },
      {
        id: 'III_TC' as SpecialtyGroup,
        label: 'TC altqrupu',
        subjects: 'Az. dili / Rus dili · Tarix · Coğrafiya',
      },
    ],
  },
  {
    id: 'IV', value: 'IV' as SpecialtyGroup,
    label: 'IV İxtisas Qrupu', sublabel: 'Tibb-Təbiət', icon: '🔴',
    color: '#FB7185',
    desc: 'Tibb, biologiya, kimya, kimya-biologiya sahələri',
    subjects: 'Biologiya · Kimya · Fizika',
    subgroups: null,
  },
]

export default function GroupSelect() {
  const navigate  = useNavigate()
  const [selected, setSelected] = useState<SpecialtyGroup | ''>('')
  const [openMain, setOpenMain] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const handleMain = (g: typeof GROUPS[0]) => {
    if (!g.subgroups) {
      setSelected((g as any).value as SpecialtyGroup)
      setOpenMain(g.id)
    } else {
      setOpenMain(prev => prev === g.id ? null : g.id)
      // clear selection if switching main group
      if (openMain !== g.id) setSelected('')
    }
  }

  const finish = async () => {
    if (!selected || loading) return
    setLoading(true)
    try {
      await dbSaveProfile({ specialtyGroup: selected })
    } catch { /* silent — navigate anyway */ }
    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, position: 'relative',
      overflow: 'hidden', background: 'var(--bg-primary)',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.3,
        background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h1 style={{
            fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800,
            fontSize: 24, color: 'var(--text-1)', marginBottom: 6,
          }}>İxtisas Qrupu</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            DIM-ə hazırlıq üçün ixtisas qrupunuzu seçin
          </p>
        </div>

        {/* Group cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {GROUPS.map(g => {
            const isOpen     = openMain === g.id
            const isDirect   = !g.subgroups && selected === (g as any).value
            const hasActive  = !!g.subgroups && g.subgroups.some(s => s.id === selected)
            const highlighted = isOpen || isDirect || hasActive
            const col = g.color

            return (
              <div key={g.id}>
                {/* Main group button */}
                <button
                  onClick={() => handleMain(g)}
                  style={{
                    width: '100%', display: 'flex', gap: 14, alignItems: 'center',
                    padding: '15px 18px', borderRadius: 16, textAlign: 'left',
                    border: `1.5px solid ${highlighted ? col : 'rgba(148,163,184,0.2)'}`,
                    background: highlighted ? `${col}12` : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer', transition: 'all 0.22s ease',
                    boxShadow: highlighted ? `0 0 18px ${col}18` : 'none',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: col,
                    background: highlighted ? `${col}20` : 'rgba(148,163,184,0.1)',
                    border: `1.5px solid ${highlighted ? col : 'transparent'}`,
                  }}>{g.id}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: highlighted ? col : 'var(--text-1)' }}>
                        {g.label}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                        background: `${col}22`, color: col, whiteSpace: 'nowrap',
                      }}>{g.sublabel}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.45, margin: 0 }}>
                      {!g.subgroups ? (g as any).subjects : g.desc}
                    </p>
                  </div>

                  {isDirect && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: col, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700,
                    }}>✓</div>
                  )}
                  {g.subgroups && (
                    <span style={{
                      color: 'var(--text-3)', fontSize: 14, flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s', display: 'inline-block',
                    }}>▾</span>
                  )}
                </button>

                {/* Subgroups (accordion) */}
                {g.subgroups && isOpen && (
                  <div style={{ marginLeft: 16, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {g.subgroups.map(sg => {
                      const active = selected === sg.id
                      return (
                        <button
                          key={sg.id}
                          onClick={() => setSelected(sg.id)}
                          style={{
                            textAlign: 'left', padding: '11px 14px', borderRadius: 12,
                            cursor: 'pointer', transition: 'all 0.18s',
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: active ? `${col}14` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${active ? col + '55' : 'rgba(148,163,184,0.15)'}`,
                          }}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            background: active ? col : 'rgba(148,163,184,0.4)',
                          }} />
                          <div style={{ flex: 1 }}>
                            <span style={{
                              fontSize: 12, fontWeight: 700,
                              color: active ? col : 'var(--text-1)', marginRight: 8,
                            }}>{sg.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sg.subjects}</span>
                          </div>
                          {active && (
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                              background: col, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700,
                            }}>✓</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={!selected || loading}
          onClick={finish}
          style={{ opacity: selected ? 1 : 0.5 }}
        >
          {loading
            ? <span className="spinner" style={{ width: 18, height: 18 }} />
            : 'Başla →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, marginTop: 14, color: 'var(--text-3)' }}>
          Qrupu sonra profil səhifəsindən dəyişə bilərsiniz
        </p>
      </div>
    </div>
  )
}
