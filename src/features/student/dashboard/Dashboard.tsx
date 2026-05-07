import { useState, useEffect }    from 'react'
import { useNavigate }           from 'react-router-dom'
import { useQuery }              from '@tanstack/react-query'
import { motion }                from 'framer-motion'
import { useAuth }               from '@/features/auth/store/authContext'
import { apiGetMyStatistics, apiGetMyResults, apiGetIncomingParentRequests, apiRespondParentRequest } from '@/lib/api'
import type { FirestoreStats, FirestoreResult } from '@/types/models'
import { DashboardSkeleton }     from '@/components/ui/Skeleton'
import { useGamificationStore, getLevelInfo } from '@/stores/gamificationStore'

const SPRING = { type: 'spring', stiffness: 180, damping: 18 }

const ALL_SUBJECTS = [
  { id: 'RIYAZIYYAT',      label: 'Riyaziyyat',      icon: '📐' },
  { id: 'AZERBAYCAN_DILI', label: 'Azərbaycan dili',  icon: '📖' },
  { id: 'INGILIS_DILI',    label: 'İngilis dili',      icon: '🌍' },
  { id: 'FIZIKA',          label: 'Fizika',            icon: '⚡' },
  { id: 'KIMYA',           label: 'Kimya',             icon: '🧪' },
  { id: 'BIOLOGIYA',       label: 'Biologiya',         icon: '🌿' },
  { id: 'TARIX',           label: 'Tarix',             icon: '🏛️' },
  { id: 'COGRAFIYA',       label: 'Coğrafiya',         icon: '🌏' },
] as const

const DEFAULT_STATS: FirestoreStats = {
  totalTests: 0, averagePercent: 0, bestPercent: 0,
  streak: 0, currentStreak: 0, subjectStats: [],
  weeklyProgress: [], dailyProgress: [], recentSessions: [],
}

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let current = 0
    const step = Math.max(1, Math.ceil(target / (duration / 16)))
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(current)
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function ParentRequestsBanner() {
  const [requests,   setRequests]   = useState<any[]>([])
  const [open,       setOpen]       = useState(false)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    apiGetIncomingParentRequests()
      .then(r => setRequests(Array.isArray(r) ? r : []))
      .catch(() => {})
  }, [])

  const respond = async (id: string, accepted: boolean) => {
    setResponding(id)
    try {
      await apiRespondParentRequest(id, accepted)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch { /* ignore */ } finally { setResponding(null) }
  }

  if (requests.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
          background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>👨‍👩‍👧</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F4A261' }}>Valideyn sorğusu var</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{requests.length} sorğu gözləyir</div>
        </div>
        <span style={{ fontSize: 14, color: '#F4A261' }}>›</span>
      </motion.div>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }} transition={SPRING}
            style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', border: '0.5px solid rgba(244,162,97,0.2)', borderRadius: '20px 20px 16px 16px', padding: 24 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />
            <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 16 }}>
              👨‍👩‍👧 Valideyn Sorğuları
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{req.parentName || 'Valideyn'}</div>
                  {req.parentUniqueId && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>{req.parentUniqueId}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => respond(req.id, false)} disabled={responding === req.id}
                      style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'rgba(255,77,109,0.1)', border: '0.5px solid rgba(255,77,109,0.25)', color: '#ff4d6d', cursor: 'pointer' }}>
                      Rədd et
                    </button>
                    <button onClick={() => respond(req.id, true)} disabled={responding === req.id}
                      style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'rgba(0,201,167,0.1)', border: '0.5px solid rgba(0,201,167,0.3)', color: '#00C9A7', cursor: 'pointer' }}>
                      {responding === req.id ? '...' : '✓ Qəbul et'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {requests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#00C9A7', fontWeight: 700 }}>✓ Bütün sorğular cavablandırıldı</div>
            )}
          </motion.div>
        </div>
      )}
    </>
  )
}

// ─── Bento Grid Stat Widget ───────────────────────────────────────────────────
function StatWidget({
  value, label, icon, color = 'var(--color-primary)', delay = 0
}: { value: number | string; label: string; icon: string; color?: string; delay?: number }) {
  const numVal = typeof value === 'number' ? value : 0
  const counted = useCountUp(numVal, 900)
  const display = typeof value === 'string' ? value : (numVal > 0 ? String(counted) : '—')

  return (
    <motion.div
      className="stat-mini"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ...SPRING }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 80% 20%, ${color}12 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div className="stat-val" style={{ color }}>{display}</div>
      <div className="stat-lbl">{label}</div>
    </motion.div>
  )
}

// ─── Level Progress Widget ────────────────────────────────────────────────────
function LevelWidget() {
  const xp      = useGamificationStore(s => s.xp)
  const streak  = useGamificationStore(s => s.streak)
  const badges  = useGamificationStore(s => s.badges)
  const info    = getLevelInfo(xp)

  return (
    <motion.div
      className="hero-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, ...SPRING }}
      style={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {/* Level badge */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `${info.color}20`,
          border: `2px solid ${info.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: info.color,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {info.level}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {info.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {xp.toLocaleString()} XP · Növbəti: {info.xpForNext > 0 ? `${info.xpForNext} XP` : 'MAX'}
          </div>
        </div>
        {/* Streak */}
        {streak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 10px', borderRadius: 20,
            background: 'rgba(244,162,97,0.12)',
            border: '0.5px solid rgba(244,162,97,0.3)',
          }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#F4A261', fontFamily: "'JetBrains Mono', monospace" }}>
              {streak}
            </span>
          </div>
        )}
      </div>

      {/* XP Progress bar */}
      <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 10 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${info.progress}%` }}
          transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 6,
            background: `linear-gradient(90deg, ${info.color}, ${info.color}99)`,
            boxShadow: `0 0 8px ${info.color}50`,
          }}
        />
      </div>

      {/* Badges row */}
      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {badges.slice(0, 5).map(b => (
            <span key={b.id} title={b.label} style={{ fontSize: 18, cursor: 'default' }}>{b.icon}</span>
          ))}
          {badges.length > 5 && (
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
              +{badges.length - 5}
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { userProfile } = useAuth()
  const navigate        = useNavigate()
  const userId          = userProfile?.id as string | undefined

  const { data: stats = DEFAULT_STATS, isLoading: statsLoading } = useQuery({
    queryKey: ['my-statistics', userId],
    queryFn:  apiGetMyStatistics,
    staleTime: 0, gcTime: 0, enabled: !!userId,
  })

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['my-results', userId],
    queryFn:  apiGetMyResults,
    staleTime: 0, gcTime: 0, enabled: !!userId,
  })

  if (statsLoading || resultsLoading) return <DashboardSkeleton />

  const name  = userProfile?.displayName || userProfile?.fullName || 'Şagird'
  const first = name.split(' ')[0]
  const uid   = userProfile?.uniqueId ?? ''

  const avgPct     = Math.round(stats.averagePercent)
  const totalTests = stats.totalTests
  const bestPct    = Math.round(stats.bestPercent)

  const subjectMap: Record<string, number> = {}
  ;(stats?.subjectStats ?? []).forEach(s => {
    if (s?.subject) subjectMap[s.subject] = Math.round(s.averagePercent ?? 0)
  })

  const recentResults: FirestoreResult[] = results.slice(0, 3)

  return (
    <div className="page-inner anim-fade-up">

      {/* Parent requests banner */}
      <ParentRequestsBanner />

      {/* ── Hero greeting ── */}
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Xoş gəldin
          </p>
          <h2 className="neon-title" style={{ fontSize: 22, marginBottom: 4 }}>{first} 👋</h2>
          {uid && (
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>ID: {uid}</span>
          )}
        </div>
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/subjects')}
        >
          Test Başla →
        </motion.button>
      </motion.div>

      {/* ── Gamification / Level Widget ── */}
      <LevelWidget />

      {/* ── Bento Grid Stats ── */}
      <div className="dash-grid">
        <StatWidget value={totalTests} label="Test"     icon="📝" color="var(--color-primary)" delay={0.1} />
        <StatWidget value={avgPct > 0 ? `${avgPct}%` : '—'} label="Ortalama" icon="🎯" color="#00C9A7"   delay={0.15} />
        <StatWidget value={bestPct > 0 ? `${bestPct}%` : '—'} label="Ən Yaxşı" icon="🏆" color="#F4A261"  delay={0.2} />
      </div>

      {/* ── Subjects ── */}
      <section>
        <div className="card-header">
          <span className="card-title">Fənlər</span>
          <motion.button
            className="btn btn-ghost btn-sm"
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate('/subjects')}
          >
            Hamısı →
          </motion.button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_SUBJECTS.slice(0, 4).map((s, i) => {
            const pct = subjectMap[s.label] ?? 0
            return (
              <motion.div
                key={s.id}
                className="subject-card"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, ...SPRING }}
                whileHover={{ scale: 1.015, x: 3 }}
                onClick={() => navigate('/subjects')}
                style={{ cursor: 'pointer' }}
              >
                <div className="subject-icon">{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{s.label}</div>
                  {pct > 0 ? (
                    <div className="progress">
                      <motion.div
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Hələ test edilməyib</div>
                  )}
                </div>
                {pct > 0 && (
                  <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 34, textAlign: 'right' }}>
                    {pct}%
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Recent Results ── */}
      <section>
        <div className="card-header">
          <span className="card-title">Son Nəticələr</span>
          <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.04 }} onClick={() => navigate('/statistics')}>
            Statistika →
          </motion.button>
        </div>
        {recentResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="card"
            style={{ textAlign: 'center', padding: '36px 16px' }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Hələ test həll etməmisiniz
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
              İlk testinizi həll edib statistikanıza baxın!
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/subjects')}>
              İndi Başla →
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentResults.map((r, i) => {
              const pct        = Math.round(r.percent)
              const badgeBg    = pct >= 80 ? 'rgba(0,229,160,0.12)' : pct >= 60 ? 'rgba(255,179,71,0.12)' : 'rgba(255,77,109,0.12)'
              const badgeColor = pct >= 80 ? 'var(--color-success)'  : pct >= 60 ? 'var(--color-warning)'  : 'var(--color-danger)'
              return (
                <motion.div
                  key={r.id}
                  className="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ...SPRING }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.subject}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {r.completedAt ? new Date(r.completedAt).toLocaleDateString('az-AZ') : ''}
                    </div>
                  </div>
                  <span className="badge" style={{ background: badgeBg, color: badgeColor }}>
                    {pct}%
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Quick Nav ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { icon: '📝', label: 'İmtahanlar', path: '/exams' },
          { icon: '🔁', label: 'Yanlış Suallar', path: '/wrong-questions' },
          { icon: '📚', label: 'Tapşırıqlar', path: '/homework' },
          { icon: '📊', label: 'Statistika', path: '/statistics' },
        ].map((item, i) => (
          <motion.button
            key={item.path}
            className="btn btn-ghost"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05, ...SPRING }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{ flexDirection: 'column', gap: 6, height: 72, fontSize: 12 }}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            {item.label}
          </motion.button>
        ))}
      </div>

    </div>
  )
}
