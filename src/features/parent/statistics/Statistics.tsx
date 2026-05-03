// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence }       from 'framer-motion'
import { apiGetMyChildren, apiGetStudentResultsByUid, apiGetGroupsByStudentUid } from '@/lib/api'
import { SPRING }                        from '@/lib/motion'

const COLOR = '#F4A261'

type Period = 'daily' | 'weekly' | 'monthly'

const PERIODS: { id: Period; label: string; days: number }[] = [
  { id: 'daily',   label: 'Günlük',   days: 1  },
  { id: 'weekly',  label: 'Həftəlik', days: 7  },
  { id: 'monthly', label: 'Aylıq',    days: 30 },
]

function filterByPeriod(results: any[], period: Period) {
  const p   = PERIODS.find(p => p.id === period)!
  const cut = Date.now() - p.days * 864e5
  return results.filter(r => r.completedAt ? new Date(r.completedAt).getTime() >= cut : false)
}

function computeFromResults(results: any[]) {
  if (!results.length) return { avg: 0, total: 0, passCount: 0, bySubject: [], byTopic: [] }
  const total     = results.length
  const avg       = Math.round(results.reduce((s, r) => s + r.percent, 0) / total)
  const passCount = results.filter(r => r.percent >= 60).length

  const subMap: Record<string, { sum: number; count: number }> = {}
  const topMap: Record<string, { sum: number; count: number; subject: string }> = {}

  results.forEach(r => {
    if (!subMap[r.subject]) subMap[r.subject] = { sum: 0, count: 0 }
    subMap[r.subject].sum   += r.percent
    subMap[r.subject].count++
    if (r.topicName) {
      const key = `${r.subject}::${r.topicName}`
      if (!topMap[key]) topMap[key] = { sum: 0, count: 0, subject: r.subject }
      topMap[key].sum   += r.percent
      topMap[key].count++
    }
  })

  const bySubject = Object.entries(subMap)
    .map(([subject, { sum, count }]) => ({ subject, avg: Math.round(sum / count), count }))
    .sort((a, b) => b.avg - a.avg)

  const byTopic = Object.entries(topMap)
    .map(([key, { sum, count, subject }]) => ({
      topic:   key.split('::')[1],
      subject,
      avg:     Math.round(sum / count),
      count,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)

  return { avg, total, passCount, bySubject, byTopic }
}

// ── Period activity bar chart ─────────────────────────────────────────────────

function PeriodChart({ allResults, period }: { allResults: any[]; period: Period }) {
  const p    = PERIODS.find(pp => pp.id === period)!
  const days = p.days
  if (days === 1) return null   // daily — just show list

  const today   = new Date()
  const buckets = Array.from({ length: days }, (_, i) => {
    const d       = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const items   = allResults.filter(r => r.completedAt?.slice(0, 10) === dateStr)
    const pct     = items.length ? Math.round(items.reduce((s, r) => s + r.percent, 0) / items.length) : 0
    return { label: String(d.getDate()), pct, isToday: i === days - 1 }
  })

  if (!buckets.some(b => b.pct > 0)) return (
    <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--text-3)' }}>
      Bu dövrdə aktivlik yoxdur
    </div>
  )

  const BAR_MAX = 58
  const WIDTH   = 300
  const barW    = days <= 7 ? 26 : 7
  const gap     = (WIDTH - buckets.length * barW) / (buckets.length + 1)

  return (
    <svg width="100%" viewBox={`0 0 ${WIDTH} 84`} preserveAspectRatio="xMidYMid meet">
      {buckets.map((b, i) => {
        const x     = gap + i * (barW + gap)
        const h     = b.pct > 0 ? Math.max((b.pct / 100) * BAR_MAX, 4) : 3
        const y     = BAR_MAX - h + 6
        const color = b.pct >= 60 ? '#00C9A7' : b.pct >= 40 ? COLOR : b.pct > 0 ? '#ff4d6d' : 'rgba(255,255,255,0.08)'
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={days <= 7 ? 5 : 2}
              fill={color} opacity={b.isToday ? 1 : 0.6} />
            {b.pct > 0 && days <= 7 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                style={{ fill: color, fontSize: 7, fontWeight: 700 }}>
                {b.pct}%
              </text>
            )}
            {days <= 7 && (
              <text x={x + barW / 2} y={80} textAnchor="middle"
                style={{ fill: b.isToday ? '#fff' : 'rgba(255,255,255,0.38)', fontSize: 8, fontWeight: b.isToday ? 700 : 400 }}>
                {b.label}
              </text>
            )}
            {b.isToday && (
              <circle cx={x + barW / 2} cy={days <= 7 ? 76 : 73} r={2.5} fill={COLOR} />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Horizontal subject bars ───────────────────────────────────────────────────

function SubjectBars({ subjects }: { subjects: { subject: string; avg: number; count: number }[] }) {
  if (!subjects.length) return (
    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-3)', fontSize: 12 }}>
      Məlumat yoxdur
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {subjects.map(s => {
        const color = s.avg >= 60 ? '#00C9A7' : s.avg >= 40 ? COLOR : '#ff4d6d'
        return (
          <div key={s.subject}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                {s.subject}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.count} test</span>
                <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", minWidth: 38, textAlign: 'right' }}>
                  {s.avg}%
                </span>
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${s.avg}%`, background: color, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Child selector (compact) ──────────────────────────────────────────────────

function ChildSelector({ children, idx, onPrev, onNext, onDot }: any) {
  const child    = children[idx] ?? null
  const initials = child
    ? (child.fullName || child.name || '?').split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div style={{ background: 'rgba(244,162,97,0.07)', border: '0.5px solid rgba(244,162,97,0.2)', borderRadius: 16, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {children.length > 1 && (
          <button onClick={onPrev} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.3)', color: COLOR, fontSize: 15, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00C9A7, #00a88c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {child?.fullName || child?.name || 'Şagird'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                {child?.uniqueId || '—'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {children.length > 1 && (
          <button onClick={onNext} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.3)', color: COLOR, fontSize: 15, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        )}
      </div>

      {children.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
          {children.map((_: any, i: number) => (
            <button key={i} onClick={() => onDot(i)} style={{ width: i === idx ? 16 : 6, height: 5, borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s', background: i === idx ? COLOR : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Group Comparison ─────────────────────────────────────────────────────────

function GroupComparison({ childSubjects, peerResults, period, loading, hasGroups }: any) {
  if (!hasGroups) return null
  if (loading) return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid rgba(244,162,97,0.18)', borderRadius: 18, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>Qrup Müqayisəsi</div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
        <span className="spinner" style={{ width: 18, height: 18 }} />
      </div>
    </div>
  )

  // Filter peer results by same period
  const filteredPeers = peerResults.map((results: any[]) => filterByPeriod(results, period))
  const activePeers   = filteredPeers.filter((r: any[]) => r.length > 0)

  if (activePeers.length === 0 || childSubjects.length === 0) return null

  // Peer average per subject
  const peerSubMap: Record<string, { sum: number; count: number }> = {}
  for (const results of activePeers) {
    for (const r of results) {
      if (!peerSubMap[r.subject]) peerSubMap[r.subject] = { sum: 0, count: 0 }
      peerSubMap[r.subject].sum   += r.percent
      peerSubMap[r.subject].count++
    }
  }
  const peerAvgBy: Record<string, number> = Object.fromEntries(
    Object.entries(peerSubMap).map(([sub, { sum, count }]) => [sub, Math.round(sum / count)])
  )

  const sharedSubjects = childSubjects.filter((s: any) => peerAvgBy[s.subject] !== undefined)
  if (!sharedSubjects.length) return null

  // Rank: count peers whose overall avg is higher than child's
  const childOverall = childSubjects.reduce((s: number, sub: any) => s + sub.avg, 0) / childSubjects.length
  const peerOveralls = activePeers.map((r: any[]) =>
    r.reduce((s, x) => s + x.percent, 0) / r.length
  )
  const rank  = peerOveralls.filter((avg: number) => avg > childOverall).length + 1
  const total = peerOveralls.length + 1
  const rankColor = rank === 1 ? '#FFD700' : rank <= Math.ceil(total / 3) ? '#00C9A7' : rank > Math.floor(2 * total / 3) ? '#ff4d6d' : COLOR

  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid rgba(244,162,97,0.22)', borderRadius: 18, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Qrup Müqayisəsi</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: rankColor, background: `${rankColor}18`, padding: '4px 10px', borderRadius: 8, border: `0.5px solid ${rankColor}40` }}>
          #{rank} / {total} şagird
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sharedSubjects.map((s: any) => {
          const peerAvg = peerAvgBy[s.subject]
          const diff    = s.avg - peerAvg
          const diffColor = diff > 0 ? '#00C9A7' : diff < 0 ? '#ff4d6d' : 'var(--text-3)'
          return (
            <div key={s.subject}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                  {s.subject}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: diffColor, flexShrink: 0 }}>
                  {diff > 0 ? '+' : ''}{diff}%
                </span>
              </div>
              {/* Child bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: COLOR, width: 24, flexShrink: 0 }}>Siz</span>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', borderRadius: 999, width: `${s.avg}%`, background: COLOR, transition: 'width 0.7s ease' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: COLOR, fontFamily: "'JetBrains Mono', monospace", width: 32, textAlign: 'right', flexShrink: 0 }}>{s.avg}%</span>
              </div>
              {/* Peer bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: 'var(--text-3)', width: 24, flexShrink: 0 }}>Qrup</span>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', borderRadius: 999, width: `${peerAvg}%`, background: 'rgba(255,255,255,0.25)', transition: 'width 0.7s ease' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", width: 32, textAlign: 'right', flexShrink: 0 }}>{peerAvg}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ParentStatistics() {
  const [children,        setChildren]        = useState<any[]>([])
  const [selectedIdx,     setSelectedIdx]     = useState(0)
  const [allResults,      setAllResults]      = useState<any[]>([])
  const [loading,         setLoading]         = useState(true)
  const [resultsLoading,  setResultsLoading]  = useState(false)
  const [period,          setPeriod]          = useState<Period>('weekly')
  const [showTopics,      setShowTopics]      = useState(false)
  const [childGroups,     setChildGroups]     = useState<any[]>([])
  const [peerResults,     setPeerResults]     = useState<any[][]>([])
  const [groupCompLoading,setGroupCompLoading]= useState(false)

  useEffect(() => {
    apiGetMyChildren()
      .then(kids => setChildren(Array.isArray(kids) ? kids : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const child = children[selectedIdx] ?? null

  useEffect(() => {
    if (!child?.id) { setAllResults([]); return }
    setResultsLoading(true)
    apiGetStudentResultsByUid(child.id)
      .then(r => setAllResults(Array.isArray(r) ? r : []))
      .catch(() => setAllResults([]))
      .finally(() => setResultsLoading(false))
  }, [child?.id])

  // Load group peers when child changes
  useEffect(() => {
    if (!child?.id) { setChildGroups([]); setPeerResults([]); return }
    setGroupCompLoading(true)
    apiGetGroupsByStudentUid(child.id)
      .then(async (groups: any[]) => {
        setChildGroups(groups)
        const peerUids = [...new Set(
          groups.flatMap((g: any) => (g.studentUids ?? []) as string[])
                .filter((uid: string) => uid !== child.id)
        )].slice(0, 15)
        if (!peerUids.length) { setPeerResults([]); return }
        const results = await Promise.all(
          peerUids.map((uid: string) => apiGetStudentResultsByUid(uid).catch(() => []))
        )
        setPeerResults(results.map(r => Array.isArray(r) ? r : []))
      })
      .catch(() => { setChildGroups([]); setPeerResults([]) })
      .finally(() => setGroupCompLoading(false))
  }, [child?.id])

  const filtered = useMemo(() => filterByPeriod(allResults, period), [allResults, period])
  const computed  = useMemo(() => computeFromResults(filtered), [filtered])

  const prevChild = () => setSelectedIdx(i => (i - 1 + children.length) % children.length)
  const nextChild = () => setSelectedIdx(i => (i + 1) % children.length)

  const pctColor = (v: number) => v >= 60 ? '#00C9A7' : v >= 40 ? COLOR : v > 0 ? '#ff4d6d' : 'var(--text-3)'

  return (
    <div className="page-inner anim-fade-up">
      <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>Statistika</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Uşağınızın dövr üzrə göstəriciləri</div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>

      ) : children.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>Hələ övlad əlavə edilməyib</div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Əvvəlcə övladınızı bağlayın</p>
        </div>

      ) : (
        <>
          <ChildSelector
            children={children}
            idx={selectedIdx}
            onPrev={prevChild}
            onNext={nextChild}
            onDot={(i: number) => setSelectedIdx(i)}
          />

          {/* Period tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, gap: 4 }}>
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: period === p.id ? `linear-gradient(135deg, ${COLOR}, #e8895a)` : 'transparent',
                  color: period === p.id ? '#fff' : 'var(--text-3)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {resultsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <span className="spinner" style={{ width: 20, height: 20 }} />
            </div>

          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedIdx}-${period}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* KPI strip */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { val: computed.total || '—',                                 lbl: 'Test',    c: 'var(--text-1)' },
                    { val: computed.total ? `${computed.avg}%` : '—',            lbl: 'Ortalama', c: pctColor(computed.avg) },
                    { val: computed.total ? `${computed.passCount}/${computed.total}` : '—', lbl: 'Keçid', c: '#00C9A7' },
                  ].map(k => (
                    <div key={k.lbl} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 13, padding: '11px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: k.c, fontFamily: "'Lexend Deca', sans-serif", marginBottom: 2 }}>{k.val}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{k.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Period activity chart */}
                {period !== 'daily' && (
                  <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '14px 14px 8px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>
                      {period === 'weekly' ? 'Son 7 günlük aktivlik' : 'Son 30 günlük aktivlik'}
                    </div>
                    <PeriodChart allResults={allResults} period={period} />
                  </div>
                )}

                {/* Subject breakdown */}
                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 18, padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Fənn üzrə nəticələr</div>
                    {computed.byTopic.length > 0 && (
                      <button
                        onClick={() => setShowTopics(v => !v)}
                        style={{ fontSize: 10, color: COLOR, background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.25)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        {showTopics ? 'Fənnlər' : 'Mövzular'}
                      </button>
                    )}
                  </div>
                  {showTopics ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {computed.byTopic.map((t: any) => {
                        const color = t.avg >= 60 ? '#00C9A7' : t.avg >= 40 ? COLOR : '#ff4d6d'
                        return (
                          <div key={`${t.subject}::${t.topic}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <div style={{ minWidth: 0, marginRight: 8 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.topic}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.subject}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.count}×</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{t.avg}%</span>
                              </div>
                            </div>
                            <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 999, width: `${t.avg}%`, background: color, transition: 'width 0.6s' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <SubjectBars subjects={computed.bySubject} />
                  )}
                </div>

                {/* Group comparison */}
                <GroupComparison
                  childSubjects={computed.bySubject}
                  peerResults={peerResults}
                  period={period}
                  loading={groupCompLoading}
                  hasGroups={childGroups.length > 0}
                />

                {/* Results list */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
                    Nəticələr{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>({filtered.length})</span>
                  </div>

                  {filtered.length === 0 ? (
                    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '28px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                      <div style={{ fontSize: 30, marginBottom: 8 }}>📭</div>
                      Bu dövrdə test edilməyib
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {filtered.slice(0, 25).map((r: any, i: number) => {
                        const pct   = Math.round(r.percent)
                        const color = pct >= 80 ? '#00C9A7' : pct >= 60 ? '#7BC67E' : pct >= 40 ? COLOR : '#ff4d6d'
                        const bg    = pct >= 60 ? 'rgba(0,201,167,0.08)' : pct >= 40 ? 'rgba(244,162,97,0.08)' : 'rgba(255,77,109,0.08)'
                        return (
                          <div key={r.id || i} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.subject}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.topicName && <span style={{ marginRight: 5 }}>{r.topicName} ·</span>}
                                {r.completedAt ? new Date(r.completedAt).toLocaleDateString('az-AZ') : ''}
                                {r.total ? ` · ${r.correct}/${r.total} düz` : ''}
                              </div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color, background: bg, padding: '4px 9px', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                              {pct}%
                            </span>
                          </div>
                        )
                      })}

                      {filtered.length > 25 && (
                        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', padding: '6px 0' }}>
                          +{filtered.length - 25} daha çox nəticə
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  )
}
