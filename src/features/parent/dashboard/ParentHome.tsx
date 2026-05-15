// @ts-nocheck
import { useState, useEffect }    from 'react'
import { useNavigate }             from 'react-router-dom'
import { motion }                  from 'framer-motion'
import { useAuth }                 from '@/features/auth/store/authContext'
import { apiGetUserByUniqueId, apiGetChildStatistics, apiGetChildResults, apiGetParentRequests, apiSendParentRequest, apiGetUnreadReports, apiMarkReportRead } from '@/lib/api'
import { Sidebar }      from '@/components/layout/Sidebar'
import { Topbar }       from '@/components/layout/GlassTopbar'
import { BottomNav }    from '@/components/layout/BottomNav'
import toast, { Toaster } from 'react-hot-toast'
import { normalizeSubjectStats } from '@/lib/utils'
import { SPRING } from '@/lib/motion'

const CHILD_KEY = 'nida_linked_child'
const FADE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

const SUBJECT_COLORS: Record<string, { color: string; bg: string }> = {
  'Riyaziyyat':       { color: 'var(--subject-math)',    bg: 'var(--subject-math-bg)'    },
  'Fizika':           { color: 'var(--subject-physics)', bg: 'var(--subject-physics-bg)' },
  'Kimya':            { color: 'var(--subject-chem)',    bg: 'var(--subject-chem-bg)'    },
  'Tarix':            { color: 'var(--subject-history)', bg: 'var(--subject-history-bg)' },
  'Azərbaycan dili':  { color: 'var(--subject-lang)',    bg: 'var(--subject-lang-bg)'    },
}
const getSubjectStyle = (name: string) =>
  SUBJECT_COLORS[name] ?? { color: 'var(--text-3)', bg: 'var(--bg-input)' }

// ── Övlad axtarış ekranı ──────────────────────────────────────────────────────
function SearchChildScreen({ onLinked }) {
  const [uniqueId, setUniqueId] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!uniqueId.trim()) return
    setLoading(true)
    try {
      const data = await apiGetUserByUniqueId(uniqueId.trim())
      if (!data) { toast.error('Şagird tapılmadı. Unikal ID-ni yoxlayın.'); return }
      const role = (data.role ?? '').toLowerCase()
      if (role && role !== 'student') { toast.error('Bu ID bir şagirdə aid deyil.'); return }
      const child = { uniqueId: data.uniqueId ?? uniqueId.trim(), fullName: data.fullName || 'Şagird', email: data.email || '', role: 'student', backendId: data.id }
      localStorage.setItem(CHILD_KEY, JSON.stringify(child))
      // Send backend connection request (student will accept on their end)
      await apiSendParentRequest(data.id).catch(() => {})
      onLinked(child)
      toast.success('Övlad hesabı bağlandı! Qoşulma sorğusu göndərildi.')
    } catch {
      toast.error('Şagird tapılmadı. Unikal ID-ni yoxlayın.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <motion.div {...FADE} transition={SPRING} style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-xl)',
            background: 'var(--subject-lang-bg)', border: '2px solid var(--subject-lang-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(236,72,153,0.15)',
          }}>👨‍👩‍👧</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>
            Övladınızı bağlayın
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.6 }}>
            Övladınızın NIDA hesabındakı unikal ID-ni daxil edin
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-2xl)', padding: 24, boxShadow: 'var(--shadow-card)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label-sm">Şagird unikal ID-si</label>
              <input
                className="input" value={uniqueId}
                onChange={e => setUniqueId(e.target.value)}
                placeholder="məs: STU-0001" autoFocus
              />
            </div>
            <button type="submit" disabled={loading || !uniqueId.trim()} className="btn btn-primary btn-full">
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Axtar və bağla'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ── Ana komponent ─────────────────────────────────────────────────────────────
export default function ParentHome() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  const [child,           setChild]           = useState(null)
  const [stats,           setStats]           = useState(null)
  const [results,         setResults]         = useState([])
  const [loading,         setLoading]         = useState(false)
  const [pendingConsents, setPendingConsents] = useState([])
  const [consentLoading,  setConsentLoading]  = useState({})
  const [weeklyReports,   setWeeklyReports]   = useState([])

  // Load pending outgoing parent-child requests (waiting for student to accept)
  useEffect(() => {
    apiGetParentRequests()
      .then(reqs => setPendingConsents(reqs.filter(r => r.status === 'PENDING')))
      .catch(() => {})
    apiGetUnreadReports()
      .then(r => setWeeklyReports(Array.isArray(r) ? r : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(CHILD_KEY)
    if (saved) { try { setChild(JSON.parse(saved)) } catch { localStorage.removeItem(CHILD_KEY) } }
  }, [])

  useEffect(() => {
    if (!child) return
    setLoading(true)
    Promise.allSettled([
      child.backendId ? apiGetChildStatistics(child.backendId) : Promise.resolve(null),
      child.backendId ? apiGetChildResults(child.backendId)    : Promise.resolve([]),
    ]).then(([statsRes, resultsRes]) => {
      if (statsRes.status === 'fulfilled')   setStats(statsRes.value)
      if (resultsRes.status === 'fulfilled') setResults(Array.isArray(resultsRes.value) ? resultsRes.value : [])
    }).finally(() => setLoading(false))
  }, [child])

  const handleUnlink = () => { localStorage.removeItem(CHILD_KEY); setChild(null); setStats(null); setResults([]) }

  if (!child) return (
    <>
      <Toaster position="top-center" />
      <SearchChildScreen onLinked={setChild} />
    </>
  )

  const avg      = stats ? Math.round(stats.averagePercent ?? stats.averagePercentage ?? 0) : null
  const best     = stats?.bestPercent ? Math.round(stats.bestPercent) : null
  const total    = stats?.totalTests ?? null
  const streak   = stats?.currentStreak ?? 0
  const improved = avg != null && avg >= 60
  const subjects = normalizeSubjectStats(stats?.subjectStats)
  const initials = child.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const fmtDate  = (ts) => ts ? new Date(ts).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short' }) : ''

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <Toaster position="top-center" toastOptions={{ style: { background: 'var(--bg-card-solid)', color: 'var(--text-1)', border: '1px solid var(--border-card)', borderRadius: 12 } }} />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* ── Valideyn razılığı sorğuları ───────────────────────────── */}
          {pendingConsents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
              <div style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255,180,0,0.07)',
                border: '1px solid rgba(255,180,0,0.4)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🔔</span>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#F59E0B' }}>
                    Gözlənilən qoşulma sorğuları ({pendingConsents.length})
                  </p>
                </div>
                {pendingConsents.map(req => (
                  <div key={req.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid var(--border)',
                    marginBottom: 8,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(255,180,0,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>🎓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Şagird #{req.childId}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Sorğu göndərildi — şagird cavabını gözləyir</p>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '3px 9px', borderRadius: 'var(--radius-pill)',
                      background: 'rgba(255,180,0,0.15)', color: '#F59E0B', fontWeight: 700,
                    }}>Gözlənilir</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Hero: övlad karti ─────────────────────────────────────── */}
          <motion.div {...FADE} transition={SPRING}>
            <div style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--hero-panel)',
              border: '1px solid var(--hero-border)',
              padding: '20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,149,43,0.4), transparent)' }} />
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(236,72,153,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />

              {/* Child info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: '#fff',
                  boxShadow: '0 4px 16px rgba(201,149,43,0.35)',
                }}>{initials}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--hero-text)', marginBottom: 5 }}>
                    {child.fullName}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.10)', color: 'var(--hero-text-dim)', fontWeight: 600 }}>
                      🎓 Şagird
                    </span>
                    {child.uniqueId && (
                      <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.06)', color: 'var(--hero-text-dim)', fontWeight: 600 }}>
                        ID: {child.uniqueId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0' }}>
                  <span className="spinner" style={{ width: 24, height: 24 }} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { val: total  != null ? total       : '—',  lbl: 'Test',   bg: 'rgba(255,255,255,0.08)', tc: 'var(--hero-text)' },
                    { val: avg    != null ? `${avg}%`   : '—',  lbl: 'Orta',   bg: 'rgba(0,229,160,0.12)',   tc: '#00E5A0' },
                    { val: best   != null ? `${best}%`  : '—',  lbl: 'Rekord', bg: 'rgba(167,139,250,0.12)', tc: '#A78BFA' },
                    { val: streak > 0     ? streak      : '—',  lbl: '🔥 Seriya', bg: 'rgba(255,107,53,0.12)', tc: 'var(--streak)' },
                  ].map(s => (
                    <div key={s.lbl} style={{ borderRadius: 'var(--radius-sm)', padding: '10px 6px', textAlign: 'center', background: s.bg, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 16, color: s.tc, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: 'var(--hero-text-dim)', marginTop: 3, fontWeight: 600 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Analiz karti ──────────────────────────────────────────── */}
          {stats && (
            <motion.div {...FADE} transition={{ ...SPRING, delay: 0.06 }}>
              <div style={{
                background: improved ? 'var(--success-bg)' : 'var(--warning-bg)',
                border: `1.5px solid ${improved ? 'rgba(5,150,105,0.25)' : 'rgba(217,119,6,0.25)'}`,
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{improved ? '📈' : '⚠️'}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>
                    {improved ? 'Övladınız yaxşı inkişaf edir' : 'Bəzi fənlərə diqqət lazımdır'}
                  </p>
                  <p style={{ color: 'var(--text-2)', fontSize: 12, lineHeight: 1.6 }}>
                    Orta nəticə:{' '}
                    <span style={{ color: improved ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>{avg}%</span>
                    {(() => {
                      const weak = subjects.filter(s => (s.averagePercent ?? 0) < 60).map(s => s.subject)
                      return weak.length > 0
                        ? `. ${weak.join(', ')} fənlərindəki nəticələrə diqqət yetirin.`
                        : '. Nəticələr qənaətbəxşdir.'
                    })()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Fənn üzrə irəliləyiş ─────────────────────────────────── */}
          {subjects.length > 0 && (
            <motion.div {...FADE} transition={{ ...SPRING, delay: 0.10 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p className="label-sm">Fənn üzrə irəliləyiş</p>
              {subjects.map((s, i) => {
                const pct    = Math.round(s.averagePercent ?? 0)
                const isWeak = pct < 60
                const sc     = getSubjectStyle(s.subject)
                return (
                  <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{s.subject}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: isWeak ? 'var(--danger-bg)' : 'var(--success-bg)', color: isWeak ? 'var(--danger)' : 'var(--success)', border: `1px solid ${isWeak ? 'rgba(220,38,38,0.2)' : 'rgba(5,150,105,0.2)'}`, fontWeight: 700 }}>
                          {isWeak ? 'Zəif' : 'Güclü'}
                        </span>
                        <span style={{ fontSize: 14, color: sc.color, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{pct}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * i }}
                        style={{ height: '100%', background: isWeak ? 'var(--danger)' : sc.color, borderRadius: 99, boxShadow: `0 0 8px ${sc.color}40` }}
                      />
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* ── Son nəticələr ──────────────────────────────────────────── */}
          {results.length > 0 && (
            <motion.div {...FADE} transition={{ ...SPRING, delay: 0.14 }}>
              <p className="label-sm" style={{ marginBottom: 8 }}>Son nəticələr</p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                {results.slice(0, 5).map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: i < Math.min(results.length, 5) - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>{r.subject || r.title || 'Test'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{fmtDate(r.completedAt || r.date)}</p>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                      background: (r.percent ?? 0) >= 60 ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: (r.percent ?? 0) >= 60 ? 'var(--success)' : 'var(--danger)',
                      fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 13,
                    }}>
                      {r.percent ?? 0}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Həftəlik hesabatlar ───────────────────────────────────── */}
          {weeklyReports.length > 0 && (
            <motion.div {...FADE} transition={{ ...SPRING, delay: 0.16 }}>
              <p className="label-sm" style={{ marginBottom: 8 }}>Oxunmamış hesabatlar</p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                {weeklyReports.slice(0, 3).map((rep, i) => (
                  <div key={rep.id ?? i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < Math.min(weeklyReports.length, 3) - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>📋</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>
                        {rep.title ?? rep.subject ?? 'Həftəlik hesabat'}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {(rep.summary ?? rep.content ?? '').slice(0, 120)}{(rep.summary ?? rep.content ?? '').length > 120 ? '…' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        apiMarkReportRead(rep.id).catch(() => {})
                        setWeeklyReports(prev => prev.filter(r => r.id !== rep.id))
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: 'var(--text-3)', flexShrink: 0 }}
                      title="Oxundu"
                    >✓</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CTA — müəllim ilə əlaqə + bağlantı ───────────────────── */}
          <motion.div {...FADE} transition={{ ...SPRING, delay: 0.18 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/notifications')}
                className="btn btn-primary"
                style={{ flex: 1, minWidth: 140 }}
              >
                💬 Müəllimə yaz
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleUnlink}
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-bg)', background: 'var(--danger-bg)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                🔗 Ayır
              </motion.button>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
