import { useState, useEffect }    from 'react'
import { useNavigate }           from 'react-router-dom'
import { useQuery }              from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth }               from '@/features/auth/store/authContext'
import { apiGetMyStatistics, apiGetMyResults, apiGetIncomingParentRequests, apiRespondParentRequest } from '@/lib/api'
import type { FirestoreStats, FirestoreResult } from '@/types/models'
import { DashboardSkeleton }     from '@/components/ui/Skeleton'
import { SPRING }                from '@/lib/motion'

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

function ParentRequestsBanner() {
  const [requests,  setRequests]  = useState<any[]>([])
  const [open,      setOpen]      = useState(false)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    apiGetIncomingParentRequests().then(r => setRequests(Array.isArray(r) ? r : [])).catch(() => {})
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
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{requests.length} sorğu gözləyir — qəbul et və ya rədd et</div>
        </div>
        <span style={{ fontSize: 14, color: '#F4A261' }}>›</span>
      </motion.div>

      <AnimatePresence>
        {open && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
            onClick={e => e.target === e.currentTarget && setOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }} transition={SPRING}
              style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', border: '0.5px solid rgba(244,162,97,0.2)', borderRadius: '20px 20px 16px 16px', padding: 24 }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />
              <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 16 }}>
                👨‍👩‍👧 Valideyn Sorğuları
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.map(req => (
                  <div key={req.id} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{req.parentName || 'Valideyn'}</div>
                    {req.parentUniqueId && (
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>{req.parentUniqueId}</div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => respond(req.id, false)}
                        disabled={responding === req.id}
                        style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'rgba(255,77,109,0.1)', border: '0.5px solid rgba(255,77,109,0.25)', color: '#ff4d6d', cursor: 'pointer' }}
                      >Rədd et</button>
                      <button
                        onClick={() => respond(req.id, true)}
                        disabled={responding === req.id}
                        style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'rgba(0,201,167,0.1)', border: '0.5px solid rgba(0,201,167,0.3)', color: '#00C9A7', cursor: 'pointer' }}
                      >{responding === req.id ? '...' : '✓ Qəbul et'}</button>
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
      </AnimatePresence>
    </>
  )
}

export default function StudentDashboard() {
  const { userProfile } = useAuth()
  const navigate        = useNavigate()

  const userId = userProfile?.id as string | undefined

  const { data: stats = DEFAULT_STATS, isLoading: statsLoading } = useQuery({
    queryKey: ['my-statistics', userId],
    queryFn:  apiGetMyStatistics,
    staleTime: 0,
    gcTime:    0,
    enabled:   !!userId,
  })

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['my-results', userId],
    queryFn:  apiGetMyResults,
    staleTime: 0,
    gcTime:    0,
    enabled:   !!userId,
  })

  if (statsLoading || resultsLoading) return <DashboardSkeleton />

  const name  = userProfile?.displayName || userProfile?.fullName || 'Şagird'
  const first = name.split(' ')[0]
  const uid   = userProfile?.uniqueId ?? ''

  const avgPct     = Math.round(stats.averagePercent)
  const totalTests = stats.totalTests
  const streak     = stats.streak ?? stats.currentStreak

  // Subject progress from real stats
  const subjectMap: Record<string, number> = {}
  ;(stats?.subjectStats ?? []).forEach(s => {
    if (s?.subject) subjectMap[s.subject] = Math.round(s.averagePercent ?? 0)
  })


  const recentResults: FirestoreResult[] = results.slice(0, 3)

  return (
    <div className="page-inner anim-fade-up">

      {/* Parent requests banner */}
      <ParentRequestsBanner />

      {/* Hero */}
      <div className="hero-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Xoş gəldin
            </p>
            <h2 className="neon-title" style={{ fontSize: 22, marginBottom: 4 }}>{first} 👋</h2>
            {uid && (
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>ID: {uid}</span>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/subjects')}>
            Test Başla →
          </button>
        </div>
      </div>

      {/* Statistika */}
      <div className="dash-grid">
        <StatMini value={totalTests > 0 ? String(totalTests) : '—'} label="Test"     icon="📝" />
        <StatMini value={avgPct > 0 ? `${avgPct}%` : '—'}           label="Ortalama" icon="🎯" />
        <StatMini value={streak > 0 ? `${streak}🔥` : '—'}          label="Streak"   icon=""   />
      </div>

      {/* Fənlər */}
      <section>
        <div className="card-header">
          <span className="card-title">Fənlər</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')}>Hamısı →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_SUBJECTS.slice(0, 4).map((s, i) => {
            const pct = subjectMap[s.label] ?? 0
            return (
              <div
                key={s.id}
                className={`subject-card anim-fade-up d${Math.min(i + 1, 5)}`}
                onClick={() => navigate('/subjects')}
              >
                <div className="subject-icon">{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{s.label}</div>
                  {pct > 0 ? (
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${pct}%` }} />
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
              </div>
            )
          })}
        </div>
      </section>

      {/* Son nəticələr */}
      <section>
        <div className="card-header">
          <span className="card-title">Son Nəticələr</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/statistics')}>Statistika →</button>
        </div>
        {recentResults.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-tertiary)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            Hələ test həll etməmisiniz
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentResults.map((r) => {
              const pct = Math.round(r.percent)
              const badgeBg    = pct >= 80 ? 'rgba(0,229,160,0.12)' : pct >= 60 ? 'rgba(255,179,71,0.12)' : 'rgba(255,77,109,0.12)'
              const badgeColor = pct >= 80 ? 'var(--color-success)'  : pct >= 60 ? 'var(--color-warning)'  : 'var(--color-danger)'
              return (
                <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.subject}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {r.completedAt ? new Date(r.completedAt).toLocaleDateString('az-AZ') : ''}
                    </div>
                  </div>
                  <span className="badge" style={{ background: badgeBg, color: badgeColor }}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Sürətli keçid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flexDirection: 'column', gap: 6, height: 72, fontSize: 12 }} onClick={() => navigate('/exams')}>
          <span style={{ fontSize: 22 }}>📝</span>İmtahanlar
        </button>
        <button className="btn btn-ghost" style={{ flexDirection: 'column', gap: 6, height: 72, fontSize: 12 }} onClick={() => navigate('/wrong-questions')}>
          <span style={{ fontSize: 22 }}>🔁</span>Yanlış Suallar
        </button>
      </div>

    </div>
  )
}

function StatMini({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="stat-mini">
      <div className="stat-val">{icon} {value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

