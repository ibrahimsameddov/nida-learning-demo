// @ts-nocheck
import { useState, useEffect }    from 'react'
import { useNavigate }             from 'react-router-dom'
import { motion }                  from 'framer-motion'
import { useAuth }                 from '@/features/auth/store/authContext'
import { apiGetMyGroups, apiGetTeacherHomeworks, apiGetMyExams, apiGetPendingInterventions, apiCreateWeeklyReport } from '@/lib/api'
import Mascot from '@/components/ui/Mascot'
import { Sidebar }   from '@/components/layout/Sidebar'
import { Topbar }    from '@/components/layout/GlassTopbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { SPRING }    from '@/lib/motion'

const FADE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

const NAV_CARDS = [
  { path: '/teacher/groups',        icon: '👥', title: 'Qruplar',                desc: 'Şagirdləri idarə et',      color: 'var(--subject-math)',    bg: 'var(--subject-math-bg)'    },
  { path: '/teacher/student-stats', icon: '📊', title: 'Statistika',             desc: 'Nəticə və analitika',      color: 'var(--subject-physics)', bg: 'var(--subject-physics-bg)' },
  { path: '/teacher/tasks',         icon: '📋', title: 'Tapşırıqlar',            desc: 'Test və ev tapşırıqları',  color: 'var(--subject-chem)',    bg: 'var(--subject-chem-bg)'    },
  { path: '/teacher/live',          icon: '📡', title: 'Canlı izləmə',           desc: 'Aktiv imtahanları izlə',   color: 'var(--subject-history)', bg: 'var(--subject-history-bg)' },
  { path: '/notifications',         icon: '💬', title: 'Mesajlar',               desc: 'Şagird mesajları',         color: 'var(--subject-lang)',    bg: 'var(--subject-lang-bg)'    },
  { path: '/profile',               icon: '👤', title: 'Profil',                 desc: 'Hesab məlumatları',        color: 'var(--text-3)',          bg: 'var(--bg-input)'           },
]

// ── Stat kart ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color, bg }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      style={{
        background: bg,
        border: `1.5px solid ${color}30`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 10px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        boxShadow: `0 4px 16px ${color}12`,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
        {label}
      </span>
    </motion.div>
  )
}

// ── Ana komponent ─────────────────────────────────────────────────────────────
export default function TeacherHome() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  const [groups,        setGroups]        = useState([])
  const [homeworks,     setHomeworks]     = useState([])
  const [exams,         setExams]         = useState([])
  const [interventions, setInterventions] = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      apiGetMyGroups().catch(() => []),
      apiGetTeacherHomeworks().catch(() => []),
      apiGetMyExams().catch(() => []),
      apiGetPendingInterventions().catch(() => []),
    ]).then(([g, h, e, iv]) => {
      setGroups(Array.isArray(g) ? g : [])
      setHomeworks(Array.isArray(h) ? h : [])
      setExams(Array.isArray(e) ? e : [])
      setInterventions(Array.isArray(iv) ? iv : [])
      setLoading(false)
    })
  }, [])

  const firstName    = (userProfile?.fullName || 'Müəllim').split(' ')[0]
  const specialty    = userProfile?.subjectSpecialty || userProfile?.subjects?.[0] || 'Müəllim'
  const groupCount   = groups.length
  const studentCount = groups.reduce((a, g) => a + (g.studentIds?.length ?? g.students?.length ?? 0), 0)
  const activeExams  = exams.filter(e => e.status === 'ACTIVE').length
  const pendingHW    = homeworks.length

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* ── Hero panel ──────────────────────────────────────────────── */}
          <motion.div {...FADE} transition={SPRING}>
            <div style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--hero-panel)',
              border: '1px solid var(--hero-border)',
              padding: '20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,149,43,0.4), transparent)' }} />
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(201,149,43,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: -10, bottom: -10, zIndex: 1, pointerEvents: 'none' }}>
                <Mascot role="teacher" state="wave" size={130} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--hero-text-dim)', marginBottom: 3 }}>Müəllim paneli</p>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--hero-text)', marginBottom: 8 }}>
                    Salam, {firstName} 👋
                  </h1>
                  <span style={{
                    fontSize: 11, padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                    background: 'rgba(201,149,43,0.15)', color: 'var(--accent)',
                    border: '1px solid rgba(201,149,43,0.25)', fontWeight: 700,
                  }}>
                    {specialty}
                  </span>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(201,149,43,0.12)', border: '1px solid rgba(201,149,43,0.20)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>👨‍🏫</div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { val: studentCount || '—', lbl: 'Şagird',  bg: 'rgba(255,255,255,0.08)', tc: 'var(--hero-text)' },
                  { val: groupCount   || '—', lbl: 'Qrup',    bg: 'rgba(96,165,250,0.12)',  tc: '#60A5FA' },
                  { val: pendingHW    || '—', lbl: 'HW',      bg: 'rgba(167,139,250,0.12)', tc: '#A78BFA' },
                ].map(s => (
                  <div key={s.lbl} style={{ borderRadius: 'var(--radius-sm)', padding: '10px 8px', textAlign: 'center', background: s.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18, color: s.tc, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--hero-text-dim)', marginTop: 3, fontWeight: 600 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Stat kartları ──────────────────────────────────────────── */}
          <motion.div {...FADE} transition={{ ...SPRING, delay: 0.06 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <StatCard icon="👥" value={studentCount} label="Şagird"   color="var(--subject-math)"    bg="var(--subject-math-bg)"    />
              <StatCard icon="🗂️" value={groupCount}   label="Qrup"     color="var(--subject-physics)" bg="var(--subject-physics-bg)" />
              <StatCard icon="📋" value={pendingHW}    label="HW"       color="var(--subject-chem)"    bg="var(--subject-chem-bg)"    />
              <StatCard icon="📝" value={activeExams}  label="İmtahan"  color="var(--subject-history)" bg="var(--subject-history-bg)" />
            </div>
          </motion.div>

          {/* ── Müdaxilə xəbərdarlıqları ──────────────────────────────── */}
          {interventions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-xl)',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--danger)' }}>
                    Müdaxilə tələb edən şagirdlər ({interventions.length})
                  </p>
                </div>
                {interventions.slice(0, 3).map((iv, i) => (
                  <div key={iv.id ?? i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid var(--border)',
                    marginBottom: i < Math.min(interventions.length, 3) - 1 ? 6 : 0,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(239,68,68,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>🎓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{iv.studentName ?? `Şagird #${iv.studentId}`}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{iv.reason ?? iv.type ?? 'Aşağı göstərici'}</p>
                    </div>
                    <button
                      onClick={() => navigate('/teacher/student-stats')}
                      style={{ background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}
                    >
                      Bax
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Bölücü ────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              Müəllim alətləri
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </motion.div>

          {/* ── Nav kartları ───────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {NAV_CARDS.map((card, i) => (
              <motion.div
                key={card.path}
                {...FADE}
                transition={{ ...SPRING, delay: 0.12 + 0.06 * i }}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(card.path)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '16px 14px',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex', flexDirection: 'column', gap: 10,
                    boxShadow: 'var(--shadow-card)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Icon + colored top border */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                      background: card.bg,
                      border: `1.5px solid ${card.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {card.icon}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                      aktiv
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', marginBottom: 3 }}>{card.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{card.desc}</div>
                  </div>

                  <div style={{ fontSize: 11, color: card.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Keç <span>›</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
