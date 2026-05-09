import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ProgressPoint } from '@/types/models'

const DAY_LABELS = ['B', 'Ç', 'Ç', 'C', 'Ş', 'B', 'B']  // Az. weekdays abbrev

function intensityColor(pct: number | null): string {
  if (pct === null) return 'rgba(255,255,255,0.04)'
  if (pct === 0)    return 'rgba(255,255,255,0.04)'
  if (pct >= 85)    return 'var(--success)'
  if (pct >= 70)    return 'color-mix(in srgb, var(--success) 70%, var(--primary))'
  if (pct >= 55)    return 'var(--primary)'
  if (pct >= 40)    return 'color-mix(in srgb, var(--warning) 60%, var(--primary))'
  return 'color-mix(in srgb, var(--danger) 50%, var(--warning))'
}

interface Props {
  data: ProgressPoint[]
}

export default function WeeklyHeatmap({ data }: Props) {
  // Build a 7×N grid (7 days wide, N weeks tall) from the last 84 days (12 weeks)
  const grid = useMemo(() => {
    const today  = new Date()
    today.setHours(0, 0, 0, 0)
    const cells: Array<{ date: string; pct: number | null }> = []

    // Fill 84 days backwards
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key  = d.toISOString().slice(0, 10)
      const found = data.find(p => p.date?.startsWith(key))
      cells.push({ date: key, pct: found ? found.percentage : null })
    }

    // Group into weeks (7 columns)
    const weeks: Array<typeof cells> = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    return weeks
  }, [data])

  const monthLabels = useMemo(() => {
    const labels: Array<{ col: number; label: string }> = []
    grid.forEach((week, col) => {
      if (!week[0]) return
      const d = new Date(week[0].date)
      if (d.getDate() <= 7) {
        labels.push({ col, label: d.toLocaleDateString('az-AZ', { month: 'short' }) })
      }
    })
    return labels
  }, [grid])

  const activeDays   = grid.flat().filter(c => c.pct !== null && c.pct > 0).length
  const avgScore     = useMemo(() => {
    const active = grid.flat().filter(c => c.pct !== null && c.pct! > 0)
    if (!active.length) return 0
    return Math.round(active.reduce((a, c) => a + c.pct!, 0) / active.length)
  }, [grid])

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p className="card-title">Fəaliyyət Xəritəsi</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Chip label={`${activeDays} aktiv gün`} />
          {avgScore > 0 && <Chip label={`Ort. ${avgScore}%`} />}
        </div>
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', marginBottom: 4, paddingLeft: 20 }}>
        {grid.map((_, col) => {
          const ml = monthLabels.find(m => m.col === col)
          return (
            <div key={col} style={{ width: 12, marginRight: 3, fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {ml?.label ?? ''}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 6, paddingTop: 0 }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{ height: 11, display: 'flex', alignItems: 'center', fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', userSelect: 'none' }}>
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', gap: 3, flex: 1 }}>
          {grid.map((week, col) => (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((cell, row) => (
                <div
                  key={row}
                  title={cell.pct !== null ? `${cell.date}: ${cell.pct}%` : cell.date}
                  style={{
                    width: 11, height: 11,
                    borderRadius: 2,
                    background: intensityColor(cell.pct),
                    transition: 'background 0.2s',
                    cursor: 'default',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Az</span>
        {[0, 40, 60, 75, 90].map(v => (
          <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: intensityColor(v || null) }} />
        ))}
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Çox</span>
      </div>
    </motion.div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 10, color: 'var(--text-2)', fontFamily: 'var(--font-mono)',
      padding: '2px 8px', borderRadius: 20,
      background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)',
    }}>
      {label}
    </span>
  )
}
