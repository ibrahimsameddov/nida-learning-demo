// @ts-nocheck
import { useState, useEffect }    from 'react'
import { useNavigate }             from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth }                 from '@/features/auth/store/authContext'
import { useAuthStore }            from '@/stores/authStore'
import { useGamificationStore, getLevelInfo } from '@/stores/gamificationStore'
import { apiGetMyStatistics, apiGetMyExams } from '@/lib/api'
import { Sidebar }   from '@/components/layout/Sidebar'
import { Topbar }    from '@/components/layout/GlassTopbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { SPRING }    from '@/lib/motion'
import { mapExamToTask } from '@/lib/utils'
import { EXAM_DATA }     from '@/types/examData'

const FADE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

// ── Stat mini kart ────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color, bg }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      style={{
        background: bg,
        border: `1.5px solid ${color}30`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        boxShadow: `0 4px 20px ${color}15`,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </motion.div>
  )
}

// ── Tapşırıq kartı ────────────────────────────────────────────────────────────
function TasksCard({ exams, onClick }: any) {
  const overdueCount = exams.filter(e => e.status === 'overdue').length
  const pendingCount = exams.filter(e => e.status === 'pending').length
  const total = overdueCount + pendingCount

  const color  = overdueCount > 0 ? 'var(--danger)'  : 'var(--warning)'
  const bg     = overdueCount > 0 ? 'var(--danger-bg)' : 'var(--warning-bg)'
  const border = overdueCount > 0 ? 'rgba(220,38,38,0.25)' : 'rgba(217,119,6,0.25)'

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: total > 0 ? bg : 'var(--bg-card)',
        border: `1.5px solid ${total > 0 ? border : 'var(--border-card)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: total > 0 ? `0 4px 20px ${color}18` : 'var(--shadow-card)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--radius-sm)',
          background: total > 0 ? `${color}18` : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>📋</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>
            Müəllim tapşırıqları
          </div>
          <div style={{ fontSize: 12, color: total > 0 ? color : 'var(--text-3)', marginTop: 1 }}>
            {total === 0 ? 'Aktiv tapşırıq yoxdur ✓' : (
              <>
                {overdueCount > 0 && <span style={{ fontWeight: 700 }}>{overdueCount} gecikmiş · </span>}
                {pendingCount > 0 && <span>{pendingCount} gözləyir</span>}
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: total > 0 ? color : 'var(--bg-input)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: total > 0 ? '#fff' : 'var(--text-3)', fontSize: 14, fontWeight: 700,
      }}>
        {total > 0 ? total : '›'}
      </div>
    </motion.div>
  )
}

// ── Tasks Modal ───────────────────────────────────────────────────────────────
function TasksModal({ onClose, navigate, tasks = [] }) {
  const overdue  = tasks.filter(t => t.status === 'overdue')
  const pending  = tasks.filter(t => t.status === 'pending')
  const rest     = tasks.filter(t => t.status !== 'overdue' && t.status !== 'pending')
  const items    = [...overdue, ...pending, ...rest]

  const statusStyle = {
    pending:   { bg: 'var(--warning-bg)',  color: 'var(--warning)', label: 'Gözləyir' },
    overdue:   { bg: 'var(--danger-bg)',   color: 'var(--danger)',  label: 'Vaxtı keçdi' },
    completed: { bg: 'var(--success-bg)',  color: 'var(--success)', label: 'Tamamlandı' },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'var(--bg-overlay)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.92 }} transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, maxHeight: '82vh', background: 'var(--bg-card-solid)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Müəllim tapşırıqları</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--text-1)' }}>Sinaq İmtahanları</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '14px 16px 20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              Aktiv tapşırıq yoxdur
            </div>
          ) : items.map(item => {
            const ss = statusStyle[item.status] || statusStyle.pending
            return (
              <div key={item.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: 8, background: ss.bg, border: `1px solid ${ss.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{item.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: ss.bg, color: ss.color, border: `1px solid ${ss.color}40`, flexShrink: 0, marginLeft: 8 }}>{ss.label}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
                  {item.teacher} · {item.questions > 0 ? `${item.questions} sual` : ''} {item.duration}
                </div>
                <button
                  onClick={() => { navigate(`/topic-quiz?exam=qebul&subject=${encodeURIComponent(item.subject)}&assignedId=${item.id}&title=${encodeURIComponent(item.title)}`); onClose() }}
                  className="btn btn-primary btn-full"
                  style={{ fontSize: 13, padding: '9px' }}
                >
                  Testi başlat →
                </button>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Ana komponent ─────────────────────────────────────────────────────────────
export default function StudentHome() {
  const navigate        = useNavigate()
  const { userProfile } = useAuth()
  const gamification    = useAuthStore(s => s.gamification)

  const [stats,      setStats]      = useState(null)
  const [exams,      setExams]      = useState([])
  const [tasksModal, setTasksModal] = useState(false)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      apiGetMyStatistics().catch(() => null),
      apiGetMyExams().catch(() => []),
    ]).then(([s, e]) => {
      if (s) setStats(s)
      if (Array.isArray(e)) setExams(e.map(mapExamToTask))
      setLoading(false)
    })
  }, [])

  const gXP     = useGamificationStore(s => s.xp)
  const gStreak = useGamificationStore(s => s.streak)
  const gBadges = useGamificationStore(s => s.badges)
  const lvInfo  = getLevelInfo(gXP)

  const firstName  = (userProfile?.fullName || '').split(' ')[0] || 'Şagird'
  const avgPct     = stats ? Math.round(stats.averagePercentage ?? stats.averagePercent ?? 0) : 0
  const totalTests = stats?.totalTests ?? 0
  const streak     = gStreak || userProfile?.streakDays || gamification?.streak || 0
  const xp         = gXP || gamification?.xp || 0
  const level      = lvInfo.level

  const pendingCount = exams.filter(e => e.status === 'pending').length
  const overdueCount = exams.filter(e => e.status === 'overdue').length

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* ── Valideyn razılığı banneri ────────────────────────────────── */}
          {userProfile?.consentStatus === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: 14, padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,180,0,0.08)',
                border: '1px solid rgba(255,180,0,0.35)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>⏳</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 2 }}>
                  Valideyn razılığı gözlənilir
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  {userProfile?.parentEmail
                    ? `${userProfile.parentEmail} ünvanına sorğu göndərildi.`
                    : 'Valideynin razılığı lazımdır.'}{' '}
                  Valideyn sistemə daxil olaraq hesabınızı təsdiqləyə bilər.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Hero panel ──────────────────────────────────────────────── */}
          <motion.div {...FADE} transition={SPRING}>
            <div style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--hero-panel)',
              border: '1px solid var(--hero-border)',
              padding: '20px 20px 18px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* shimmer top line */}
              <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,149,43,0.4), transparent)' }} />
              {/* ambient glow */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(201,149,43,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />

              {/* Greeting + streak */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--hero-text-dim)', marginBottom: 3 }}>
                    Bu gün nə öyrənəcəksən?
                  </p>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--hero-text)', lineHeight: 1.2 }}>
                    Salam, {firstName} 👋
                  </h1>
                </div>
                {/* Streak badge */}
                <motion.div
                  animate={streak > 0 ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                    background: streak > 0 ? 'var(--streak-bg)' : 'rgba(255,255,255,0.08)',
                    border: `1.5px solid ${streak > 0 ? 'rgba(255,107,53,0.35)' : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: streak > 0 ? '0 0 16px rgba(255,107,53,0.25)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 16 }}>🔥</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 15, color: streak > 0 ? 'var(--streak)' : 'var(--hero-text-dim)' }}>
                    {streak}
                  </span>
                </motion.div>
              </div>

              {/* Stat chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { val: totalTests || '—', lbl: 'Test',     bg: 'rgba(255,255,255,0.08)', tc: 'var(--hero-text)' },
                  { val: avgPct > 0 ? `${avgPct}%` : '—', lbl: 'Orta bal', bg: 'rgba(0,229,160,0.12)', tc: '#00E5A0' },
                  { val: `Lv.${level}`,  lbl: 'Səviyyə',  bg: 'rgba(167,139,250,0.12)', tc: '#A78BFA' },
                ].map(s => (
                  <div key={s.lbl} style={{ borderRadius: 'var(--radius-sm)', padding: '10px 8px', textAlign: 'center', background: s.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 17, color: s.tc, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--hero-text-dim)', marginTop: 3, fontWeight: 600 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* XP progress bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--hero-text-dim)', fontWeight: 600 }}>{xp.toLocaleString()} XP · {lvInfo.label}</span>
                  <span style={{ fontSize: 10, color: 'rgba(201,149,43,0.7)', fontWeight: 700 }}>Lv.{level} · {lvInfo.progress}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lvInfo.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${lvInfo.color}, ${lvInfo.color}88)`, borderRadius: 99, boxShadow: `0 0 8px ${lvInfo.color}60` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Stat kartları ──────────────────────────────────────────── */}
          <motion.div {...FADE} transition={{ ...SPRING, delay: 0.06 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <StatCard icon="⚡" value={xp}        label="XP"      color="var(--xp-color)"    bg="rgba(201,149,43,0.08)" />
              <StatCard icon="🔥" value={streak}     label="Seriya"  color="var(--streak)"      bg="var(--streak-bg)" />
              <StatCard icon="🏅" value={gBadges.length} label="Nişan" color="var(--level-color)" bg="var(--level-bg)" />
            </div>
          </motion.div>

          {/* ── Müəllim tapşırıqları ───────────────────────────────────── */}
          <motion.div {...FADE} transition={{ ...SPRING, delay: 0.10 }}>
            <TasksCard exams={exams} onClick={() => setTasksModal(true)} />
          </motion.div>

          {/* ── Bölücü ────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              Mövzu üzrə test et
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </motion.div>

          {/* ── İmtahan kartları ──────────────────────────────────────── */}
          <div className="exam-halves">
            {EXAM_DATA.map((exam, ei) => {
              const subjectColor = exam.id === 'qebul'
                ? 'var(--subject-math)'
                : 'var(--subject-physics)'
              const subjectBg = exam.id === 'qebul'
                ? 'var(--subject-math-bg)'
                : 'var(--subject-physics-bg)'

              return (
                <motion.div
                  key={exam.id}
                  {...FADE}
                  transition={{ ...SPRING, delay: 0.16 + 0.07 * ei }}
                >
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    {/* Başlıq şeridi */}
                    <div style={{ background: subjectBg, borderBottom: `1px solid ${subjectColor}20`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: `${subjectColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {exam.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{exam.title}</div>
                        <div style={{ fontSize: 11, color: subjectColor, fontWeight: 600 }}>
                          {exam.subjects.length > 0 ? `${exam.subjects.length} fənn` : 'Tezliklə'}
                        </div>
                      </div>
                    </div>

                    {/* Fənlər */}
                    <div style={{ padding: '10px 10px 12px' }}>
                      {exam.subjects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 12 }}>
                          <div style={{ fontSize: 26, marginBottom: 8 }}>🔒</div>
                          Tezliklə əlavə olunacaq
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {exam.subjects.map(subj => (
                            <motion.button
                              key={subj.key}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => navigate(`/topic-quiz?exam=${exam.id}&subject=${encodeURIComponent(subj.title)}`)}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                background: 'var(--bg-input)', border: '1px solid var(--border)',
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 15 }}>{subj.icon}</span>
                                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)' }}>{subj.title}</span>
                              </div>
                              <span style={{ color: subjectColor, fontSize: 14 }}>›</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── Sürətli keçidlər ──────────────────────────────────────── */}
          <motion.div {...FADE} transition={{ ...SPRING, delay: 0.30 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {[
              { label: '📊 Statistika',  path: '/stats' },
              { label: '📩 Bildirişlər', path: '/notifications' },
              { label: '👤 Profil',      path: '/profile' },
            ].map(l => (
              <motion.button
                key={l.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(l.path)}
                className="pill-tag"
              >
                {l.label}
              </motion.button>
            ))}
          </motion.div>

        </div>
      </main>

      <AnimatePresence>
        {tasksModal && (
          <TasksModal onClose={() => setTasksModal(false)} navigate={navigate} tasks={exams} />
        )}
      </AnimatePresence>
    </div>
  )
}
