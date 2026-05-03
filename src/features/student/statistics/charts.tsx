// Reusable SVG chart components for Statistics page
import type { FirestoreResult } from '@/types/models'

export function pctColor(p: number) {
  return p >= 75 ? 'var(--color-success)' : p >= 55 ? 'var(--color-warning)' : 'var(--color-danger)'
}

// ── Radar Chart ────────────────────────────────────────────────────────────────
export function RadarChart({ subjects }: { subjects: { subject: string; averagePercent: number }[] }) {
  const N = subjects.length
  if (N < 3) return null
  const cx = 110, cy = 105, r = 75
  const angle = (i: number) => (i * 2 * Math.PI / N) - Math.PI / 2
  const pt = (i: number, f: number): [number, number] => [cx + r * f * Math.cos(angle(i)), cy + r * f * Math.sin(angle(i))]
  const dataPts = subjects.map((s, i) => pt(i, Math.max(0.05, s.averagePercent / 100)))
  const polygon = dataPts.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg viewBox="0 0 220 210" width="100%" height={180} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.9} />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.7} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(lv => (
        <polygon key={lv} points={subjects.map((_, i) => pt(i, lv).join(',')).join(' ')}
          fill="none" stroke="var(--border-card)" strokeWidth={0.8} />
      ))}
      {subjects.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-card)" strokeWidth={0.5} /> })}
      <polygon points={polygon} fill="url(#rg)" fillOpacity={0.2} stroke="var(--color-primary)" strokeWidth={2.5} />
      {dataPts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 4px var(--color-glow))' }} />)}
      {subjects.map((s, i) => { const [x, y] = pt(i, 1.3); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--text-tertiary)" fontSize={8}>{s.subject.substring(0, 7)}.</text> })}
      {dataPts.map(([x, y], i) => <text key={`v${i}`} x={x} y={y - 10} textAnchor="middle" fontSize={8} fill="var(--color-primary)" fontWeight={700}>{Math.round(subjects[i].averagePercent)}%</text>)}
    </svg>
  )
}

// ── Horizontal Bar Chart (subjects) ───────────────────────────────────────────
export function SubjectBarChart({ subjects }: { subjects: { subject: string; averagePercent: number; totalTests: number }[] }) {
  const sorted = [...subjects].sort((a, b) => b.averagePercent - a.averagePercent)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map(s => {
        const pct = Math.round(s.averagePercent)
        const color = pctColor(pct)
        return (
          <div key={s.subject}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.subject}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'monospace' }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 3 }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)`, transition: 'width 0.8s var(--smooth)' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Area Trend Chart ──────────────────────────────────────────────────────────
export function AreaTrendChart({ points, color = 'var(--color-primary)' }: { points: { date: string; percentage: number }[]; color?: string }) {
  if (points.length < 2) return <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>Hələ kifayət qədər data yoxdur</p>
  const W = 320, H = 120, pL = 28, pR = 12, pT = 8, pB = 22
  const plotW = W - pL - pR, plotH = H - pT - pB
  const stepX = plotW / (points.length - 1)
  const coords = points.map((p, i) => ({ x: pL + i * stepX, y: pT + plotH - (Math.min(100, Math.max(0, p.percentage)) / 100) * plotH }))
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const area = `${line} L${coords[coords.length - 1].x},${pT + plotH} L${pL},${pT + plotH} Z`
  const gid = 'atg'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={130} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.4} />
          <stop offset="95%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[25, 50, 75].map(v => {
        const y = pT + plotH - (v / 100) * plotH
        return <g key={v}><line x1={pL} y1={y} x2={W - pR} y2={y} stroke="var(--border-card)" strokeWidth={0.5} strokeDasharray="3,3" /><text x={pL - 4} y={y + 3} textAnchor="end" fill="var(--text-tertiary)" fontSize={7}>{v}</text></g>
      })}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={3} fill={color} />)}
      {points.filter((_, i) => i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 4) === 0).map((p, _, arr) => {
        const idx = points.indexOf(p)
        return <text key={idx} x={coords[idx].x} y={pT + plotH + 14} textAnchor="middle" fill="var(--text-tertiary)" fontSize={7}>{new Date(p.date).toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' })}</text>
      })}
    </svg>
  )
}

// ── Activity Heatmap ──────────────────────────────────────────────────────────
export function ActivityHeatmap({ daily }: { daily: { date: string }[] }) {
  const today = new Date()
  const dateMap = new Map<string, number>()
  daily.forEach(p => { const d = p.date.slice(0, 10); dateMap.set(d, (dateMap.get(d) ?? 0) + 1) })
  const grid: { iso: string; count: number }[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    grid.push({ iso, count: dateMap.get(iso) ?? 0 })
  }
  const cols: typeof grid[] = []
  for (let i = 0; i < grid.length; i += 7) cols.push(grid.slice(i, i + 7))
  const col = (n: number) => n === 0 ? 'var(--border-card)' : n === 1 ? 'var(--color-accent)' : n === 2 ? 'var(--color-mid)' : 'var(--color-primary)'
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
        {cols.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map(day => <div key={day.iso} title={`${day.iso}: ${day.count} test`} style={{ width: 12, height: 12, borderRadius: 2, background: col(day.count), opacity: day.count === 0 ? 0.25 : 1 }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Subject Score History (line) ───────────────────────────────────────────────
export function ScoreHistoryChart({ results, subject }: { results: FirestoreResult[]; subject: string }) {
  const pts = results.filter(r => r.subject === subject).slice(0, 20).reverse()
  if (pts.length < 2) return <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>Bu fəndən hələ kifayət qədər test yoxdur</p>
  return <AreaTrendChart points={pts.map(p => ({ date: p.completedAt, percentage: p.percent }))} color="var(--color-primary)" />
}

// ── Accuracy Donut ────────────────────────────────────────────────────────────
export function AccuracyDonut({ results, subject }: { results: FirestoreResult[]; subject: string }) {
  const pts = results.filter(r => r.subject === subject)
  if (!pts.length) return null
  const totCorrect = pts.reduce((s, r) => s + r.correct, 0)
  const totWrong = pts.reduce((s, r) => s + r.wrong, 0)
  const totSkipped = pts.reduce((s, r) => s + (r.skipped ?? 0), 0)
  const total = totCorrect + totWrong + totSkipped || 1
  const segments = [
    { val: totCorrect, color: 'var(--color-success)', label: 'Düzgün' },
    { val: totWrong,   color: 'var(--color-danger)',  label: 'Səhv' },
    { val: totSkipped, color: 'var(--color-warning)', label: 'Keçilmiş' },
  ]
  const cx = 60, cy = 60, r = 48, stroke = 16
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const dash = (seg.val / total) * circ
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
          )
          offset += dash
          return el
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="var(--color-success)" fontSize={13} fontWeight={800} fontFamily="monospace">
          {Math.round(totCorrect / total * 100)}%
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Consistency Meter ─────────────────────────────────────────────────────────
export function ConsistencyMeter({ results, subject }: { results: FirestoreResult[]; subject: string }) {
  const pts = results.filter(r => r.subject === subject).map(r => r.percent)
  if (pts.length < 2) return null
  const avg = pts.reduce((s, v) => s + v, 0) / pts.length
  const std = Math.sqrt(pts.reduce((s, v) => s + (v - avg) ** 2, 0) / pts.length)
  const consistency = Math.round(Math.max(0, 100 - std))
  const color = pctColor(consistency)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Sabitlik Skoru</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'monospace' }}>{consistency}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-muted)', borderRadius: 4 }}>
        <div style={{ height: '100%', borderRadius: 4, width: `${consistency}%`, background: `linear-gradient(90deg,${color},${color}88)`, transition: 'width 0.8s' }} />
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
        {consistency >= 75 ? '✅ Nəticələrin çox sabitdir' : consistency >= 55 ? '⚠️ Nəticələrində bəzi dəyişkənlik var' : '❗ Nəticələrin çox dəyişkəndir — fokus lazımdır'}
      </p>
    </div>
  )
}

// ── Recent Sessions Table ─────────────────────────────────────────────────────
export function RecentSessionsTable({ results, subject }: { results: FirestoreResult[]; subject: string }) {
  const pts = results.filter(r => r.subject === subject).slice(0, 8)
  if (!pts.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {pts.map((r, i) => {
        const color = pctColor(r.percent)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', minWidth: 60 }}>{new Date(r.completedAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}</span>
            <div style={{ flex: 1, height: 4, background: 'var(--border-card)', borderRadius: 2 }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${r.percent}%`, background: color }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', minWidth: 40 }}>{r.correct}/{r.total}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'monospace', minWidth: 36, textAlign: 'right' }}>{r.percent}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Topic Best Results ────────────────────────────────────────────────────────
export function TopicBestResults({ results, subject }: { results: FirestoreResult[]; subject: string }) {
  const pts = results.filter(r => r.subject === subject && r.topicName)
  if (!pts.length) return (
    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
      Mövzu məlumatı hələ yoxdur. Növbəti testdən sonra burada görünəcək.
    </p>
  )

  // Best percent per topic
  const topicMap = new Map<string, { topicName: string; best: number; count: number }>()
  pts.forEach(r => {
    const key  = r.topicId ?? r.topicName!
    const name = r.topicName!
    const prev = topicMap.get(key)
    if (!prev) topicMap.set(key, { topicName: name, best: r.percent, count: 1 })
    else { prev.best = Math.max(prev.best, r.percent); prev.count++ }
  })

  const topics = [...topicMap.values()].sort((a, b) => b.best - a.best)

  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {topics.map((t, i) => {
        const color = pctColor(t.best)
        return (
          <div key={t.topicName} style={{ padding: '10px 12px', background: 'var(--bg-muted)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{medal(i)}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.3 }}>{t.topicName}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'monospace' }}>{t.best}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--border-card)', borderRadius: 2 }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${t.best}%`, background: color, transition: 'width 0.8s' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{t.count} test</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Strength/Weakness Card ────────────────────────────────────────────────────
export function StrengthWeaknessCard({ results, subject }: { results: FirestoreResult[]; subject: string }) {
  const pts = results.filter(r => r.subject === subject)
  if (pts.length < 2) return null
  const best = Math.max(...pts.map(r => r.percent))
  const worst = Math.min(...pts.map(r => r.percent))
  const recent5 = pts.slice(0, 5).map(r => r.percent)
  const older5 = pts.slice(5, 10).map(r => r.percent)
  const recentAvg = recent5.length ? recent5.reduce((s, v) => s + v, 0) / recent5.length : 0
  const olderAvg = older5.length ? older5.reduce((s, v) => s + v, 0) / older5.length : recentAvg
  const trend = recentAvg - olderAvg
  const items = [
    { label: 'Ən Yaxşı Nəticə', value: `${best}%`, color: 'var(--color-success)', icon: '🏆' },
    { label: 'Ən Zəif Nəticə',  value: `${worst}%`, color: 'var(--color-danger)',  icon: '⚠️' },
    { label: 'Son 5 Ortalama',  value: `${Math.round(recentAvg)}%`, color: pctColor(recentAvg), icon: '📊' },
    { label: 'Trend',           value: `${trend >= 0 ? '+' : ''}${Math.round(trend)}%`, color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)', icon: trend >= 0 ? '↑' : '↓' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.map(item => (
        <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: item.color, fontFamily: 'monospace', marginBottom: 2 }}>{item.value}</div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}
