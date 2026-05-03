// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth }             from '@/features/auth/store/authContext'
import { apiGetMyChildren, apiGetParentRequests } from '@/lib/api'
import { SPRING }              from '@/lib/motion'

const COLOR = '#F4A261'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seed(str: string) {
  return [...String(str || '')].reduce((a, c) => a + c.charCodeAt(0), 0)
}

function getLast7Days(dailyProgress: any[]) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const entries = (dailyProgress || []).filter((p: any) => (p.date || '').slice(0, 10) === dateStr)
    const pct = entries.length
      ? Math.round(entries.reduce((s: number, p: any) => s + (p.percentage || 0), 0) / entries.length)
      : 0
    return { date: dateStr, pct, count: entries.length, day: d.getDate(), isToday: i === 6 }
  })
}

function getMockUpcoming(uniqueId: string) {
  const s = seed(uniqueId)
  const subjects  = ['Riyaziyyat', 'Fizika', 'Az. dili', 'Kimya', 'Biologiya', 'İngilis dili']
  const typeData  = [
    { label: 'Sınaq İmtahanı', icon: '📋' },
    { label: 'Ev Tapşırığı',   icon: '📖' },
    { label: 'Tapşırıq',       icon: '✏️' },
  ]
  return Array.from({ length: 3 }, (_, i) => {
    const daysLeft = 1 + ((s + i * 13) % 9)
    const deadline = new Date(Date.now() + daysLeft * 86400000)
    const t = typeData[(s + i * 2) % typeData.length]
    return {
      id:       i,
      subject:  subjects[(s + i * 3) % subjects.length],
      type:     t.label,
      icon:     t.icon,
      daysLeft,
      deadline: deadline.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }),
      urgent:   daysLeft <= 2,
    }
  })
}

// ─── Weekly bar chart ─────────────────────────────────────────────────────────

function WeeklyChart({ days }: { days: ReturnType<typeof getLast7Days> }) {
  const hasAny = days.some(d => d.pct > 0)
  if (!hasAny) return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Bu həftə hələ test çözülməyib</div>
    </div>
  )

  const BAR_MAX = 68
  const WIDTH   = 280
  const barW    = 28
  const spacing = (WIDTH - days.length * barW) / (days.length + 1)

  return (
    <svg width="100%" viewBox={`0 0 ${WIDTH} 100`} preserveAspectRatio="xMidYMid meet">
      {days.map((d, i) => {
        const x     = spacing + i * (barW + spacing)
        const h     = d.pct > 0 ? Math.max((d.pct / 100) * BAR_MAX, 6) : 3
        const y     = BAR_MAX - h + 6
        const color = d.pct >= 60 ? '#00C9A7' : d.pct >= 40 ? COLOR : d.pct > 0 ? '#ff4d6d' : 'rgba(255,255,255,0.08)'
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barW} height={h} rx={6}
              fill={color} opacity={d.isToday ? 1 : 0.65} />
            {d.pct > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                style={{ fill: color, fontSize: 8, fontWeight: 700 }}>
                {d.pct}%
              </text>
            )}
            <text x={x + barW / 2} y={90} textAnchor="middle"
              style={{ fill: d.isToday ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: d.isToday ? 700 : 400 }}>
              {d.day}
            </text>
            {d.isToday && (
              <circle cx={x + barW / 2} cy={96} r={2.5} fill={COLOR} />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { userProfile } = useAuth()
  const navigate        = useNavigate()

  const [children,     setChildren]     = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [selectedIdx,  setSelectedIdx]  = useState(0)

  useEffect(() => {
    Promise.all([
      apiGetMyChildren().catch(() => []),
      apiGetParentRequests().catch(() => []),
    ]).then(([kids, reqs]) => {
      const kidList = Array.isArray(kids) ? kids : []
      setChildren(kidList)
      setPendingCount((Array.isArray(reqs) ? reqs : []).filter((r: any) => r.status === 'pending').length)
    }).finally(() => setLoading(false))
  }, [])

  const parentName  = (userProfile as any)?.fullName || userProfile?.displayName || 'Valideyn'
  const parentFirst = parentName.split(' ')[0]
  const child       = children[selectedIdx] ?? null
  const stats       = child?.stats ?? {}

  // Today's data
  const today       = new Date().toISOString().slice(0, 10)
  const todayItems  = (stats.dailyProgress ?? []).filter((d: any) => (d.date || '').slice(0, 10) === today)
  const todayTests  = todayItems.length
  const todayAvg    = todayTests > 0
    ? Math.round(todayItems.reduce((s: number, d: any) => s + (d.percentage || 0), 0) / todayTests)
    : 0
  const sessions    = stats.recentSessions ?? []
  const todayTimeSec = sessions.slice(0, todayTests).reduce((s: number, r: any) => s + (r.durationSeconds || 0), 0)
  const todayTimeMin = todayTests > 0 ? Math.max(Math.round(todayTimeSec / 60), todayTests * 3) : 0

  const weekDays  = getLast7Days(stats.dailyProgress ?? [])
  const upcoming  = child ? getMockUpcoming(child.uniqueId || child.id || '') : []
  const initials  = child
    ? (child.fullName || child.name || '?').split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase()
    : '?'
  const avgScore  = Math.round(stats.averagePercent ?? 0)
  const totalTests = stats.totalTests ?? 0

  const prevChild = () => setSelectedIdx(i => (i - 1 + children.length) % children.length)
  const nextChild = () => setSelectedIdx(i => (i + 1) % children.length)

  return (
    <div className="page-inner anim-fade-up">

      {/* Parent greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 3 }}>Valideyn Paneli</div>
          <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-1)' }}>
            Salam, {parentFirst}!
          </div>
        </div>
        {children.length < 5 && !loading && (
          <button
            onClick={() => navigate('/onboarding/parent')}
            style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, border: '0.5px solid rgba(244,162,97,0.3)', background: 'rgba(244,162,97,0.12)', color: COLOR, cursor: 'pointer', marginTop: 4, flexShrink: 0 }}
          >+ Övlad</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>

      ) : children.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 20, padding: '44px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>👨‍👩‍👧</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Hələ övlad əlavə edilməyib</div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 18 }}>
            Övladınızın ID-si ilə sorğu göndərin
          </p>
          {pendingCount > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.2)', fontSize: 12, color: COLOR, marginBottom: 16 }}>
              ⏳ {pendingCount} sorğu şagirdin qəbulunu gözləyir
            </div>
          )}
          <button
            onClick={() => navigate('/onboarding/parent')}
            style={{ padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 13, border: 'none', background: `linear-gradient(135deg, ${COLOR}, #e8895a)`, color: '#fff', cursor: 'pointer', fontFamily: "'Lexend Deca', sans-serif" }}
          >+ Övlad Əlavə Et</button>
        </div>

      ) : (
        <>
          {/* ── Child selector ── */}
          <div style={{ background: `linear-gradient(135deg, rgba(244,162,97,0.1), rgba(244,162,97,0.03))`, border: '0.5px solid rgba(244,162,97,0.22)', borderRadius: 20, padding: '16px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {children.length > 1 && (
                <button onClick={prevChild} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.3)', color: COLOR, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}
                  style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg, #00C9A7, #00a88c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff',
                  }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>
                      {child?.fullName || child?.name || 'Şagird'}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {child?.grade && (
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{child.grade}-ci sinif</span>
                      )}
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00C9A7', background: 'rgba(0,201,167,0.1)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {child?.uniqueId || '—'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {children.length > 1 && (
                <button onClick={nextChild} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.3)', color: COLOR, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              )}
            </div>

            {/* Dot indicators */}
            {children.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 12 }}>
                {children.map((_, i) => (
                  <button key={i} onClick={() => setSelectedIdx(i)} style={{
                    width: i === selectedIdx ? 18 : 6, height: 6, borderRadius: 3,
                    border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s',
                    background: i === selectedIdx ? COLOR : 'rgba(255,255,255,0.15)',
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* ── Child content (animates on switch) ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Today's KPIs */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Bu gün</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    {
                      val:   todayTests > 0 ? todayTests : '—',
                      lbl:   'Test',
                      color: 'var(--text-1)',
                    },
                    {
                      val:   todayTests > 0 ? `${todayAvg}%` : '—',
                      lbl:   'Uğur faizi',
                      color: todayTests > 0 ? (todayAvg >= 60 ? '#00C9A7' : todayAvg >= 40 ? COLOR : '#ff4d6d') : 'var(--text-3)',
                    },
                    {
                      val:   todayTests > 0 ? `${todayTimeMin} dəq` : '—',
                      lbl:   'Tətbiqdə vaxt',
                      color: 'var(--text-1)',
                    },
                  ].map(k => (
                    <div key={k.lbl} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '13px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: k.color, fontFamily: "'Lexend Deca', sans-serif", marginBottom: 3 }}>{k.val}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-3)', lineHeight: 1.3 }}>{k.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Ümumi ortalama</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: avgScore >= 60 ? '#00C9A7' : avgScore >= 40 ? COLOR : avgScore > 0 ? '#ff4d6d' : 'var(--text-3)', fontFamily: "'Lexend Deca', sans-serif" }}>{avgScore > 0 ? `${avgScore}%` : '—'}</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Ümumi test</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', fontFamily: "'Lexend Deca', sans-serif" }}>{totalTests}</div>
                </div>
              </div>

              {/* Weekly chart */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '16px 16px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Həftəlik Aktivlik</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { color: '#00C9A7', lbl: '60%+' },
                      { color: COLOR,     lbl: '40%+' },
                      { color: '#ff4d6d', lbl: '<40%' },
                    ].map(l => (
                      <span key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'var(--text-3)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                        {l.lbl}
                      </span>
                    ))}
                  </div>
                </div>
                <WeeklyChart days={weekDays} />
              </div>

              {/* Upcoming tasks */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>
                  Yaxınlaşan Tapşırıqlar
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.map((task: any) => (
                    <div
                      key={task.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: `0.5px solid ${task.urgent ? 'rgba(255,77,109,0.25)' : 'var(--border-card)'}`,
                        borderRadius: 14, padding: '13px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: task.urgent ? 'rgba(255,77,109,0.1)' : 'rgba(244,162,97,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {task.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.subject}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                          {task.type} · Son tarix: {task.deadline}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: task.urgent ? '#ff4d6d' : COLOR, fontFamily: "'Lexend Deca', sans-serif" }}>
                          {task.daysLeft} gün
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-3)' }}>qalıb</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add child (max 5) */}
              {children.length < 5 && (
                <button
                  onClick={() => navigate('/onboarding/parent')}
                  style={{ width: '100%', padding: '12px', borderRadius: 14, background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.25)', color: COLOR, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  + Başqa övlad əlavə et <span style={{ opacity: 0.7, fontWeight: 400 }}>({children.length}/5)</span>
                </button>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Pending requests notice */}
          {pendingCount > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.2)', fontSize: 12, color: COLOR, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⏳ {pendingCount} sorğu şagirdin qəbulunu gözləyir
            </div>
          )}
        </>
      )}
    </div>
  )
}
