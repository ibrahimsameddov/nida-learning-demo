import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStatsData } from '@/hooks/useAnalytics'
import { calculateCognitiveLoad } from '@/lib/analytics'
import type { CognitiveLoad } from '@/lib/analytics'

const LOAD_META: Record<CognitiveLoad, { label: string; color: string; icon: string }> = {
  low:      { label: 'Aşağı Yük',    color: 'var(--success)', icon: '🟢' },
  medium:   { label: 'Orta Yük',     color: 'var(--primary)', icon: '🟡' },
  high:     { label: 'Yüksək Yük',   color: 'var(--warning)', icon: '🟠' },
  overload: { label: 'Həddindən Çox', color: 'var(--danger)', icon: '🔴' },
}

const LOAD_WIDTHS: Record<CognitiveLoad, string> = {
  low: '25%', medium: '55%', high: '78%', overload: '100%',
}

export default function CognitiveLoadBar() {
  const { stats, results, isLoading } = useStatsData()

  const subjectLoad = useMemo(() => {
    if (!stats?.subjectStats) return []

    return stats.subjectStats.map(s => {
      const subjectResults = results.filter(r => r.subject === s.subject)
      const avgTime   = subjectResults.length
        ? subjectResults.reduce((a, r) => a + (r.timeSpent ?? 30000) / Math.max(1, r.total), 0) / subjectResults.length / 1000
        : 45
      const errorRate  = 1 - s.averagePercent / 100
      const hesitation = Math.max(0, Math.min(1, (avgTime - 20) / 100))

      return {
        subject: s.subject,
        load:    calculateCognitiveLoad(avgTime, errorRate, hesitation),
        avgTime: Math.round(avgTime),
        accuracy: s.averagePercent,
      }
    })
  }, [stats, results])

  if (isLoading) return null

  const overallLoad = subjectLoad.length
    ? (subjectLoad.filter(s => s.load === 'overload').length > 1 ? 'overload'
      : subjectLoad.filter(s => s.load === 'high').length > 1 ? 'high'
      : subjectLoad.some(s => s.load === 'medium') ? 'medium' : 'low') as CognitiveLoad
    : 'low'

  const overall = LOAD_META[overallLoad]

  return (
    <motion.div className="card"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p className="card-title">Kognitiv Yük</p>
        <span style={{
          fontSize: 11, fontWeight: 700, color: overall.color, fontFamily: 'var(--font-mono)',
          padding: '3px 8px', borderRadius: 20,
          background: `color-mix(in srgb, ${overall.color} 12%, transparent)`,
          border: `0.5px solid color-mix(in srgb, ${overall.color} 30%, transparent)`,
        }}>
          {overall.icon} {overall.label}
        </span>
      </div>

      {/* Overall load bar */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Ümumi yük göstəricisi
        </p>
        <div style={{ position: 'relative', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: LOAD_WIDTHS[overallLoad] }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            style={{
              height: '100%', borderRadius: 5,
              background: `linear-gradient(90deg, ${overall.color}, color-mix(in srgb, ${overall.color} 60%, transparent))`,
              boxShadow: `0 0 10px ${overall.color}40`,
            }}
          />
          {/* Threshold markers */}
          {[25, 55, 78].map(p => (
            <div key={p} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${p}%`,
              width: 1, background: 'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {(['Aşağı', 'Orta', 'Yüksək', 'Həddindən Çox'] as const).map(l => (
            <span key={l} style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Per-subject */}
      {subjectLoad.map((item, i) => {
        const meta = LOAD_META[item.load]
        return (
          <motion.div
            key={item.subject}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}
          >
            <span style={{ fontSize: 11 }}>{meta.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{item.subject}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  ~{item.avgTime}s/sual · {item.accuracy}%
                </span>
              </div>
              <div className="progress" style={{ height: 4 }}>
                <motion.div
                  className="progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: LOAD_WIDTHS[item.load] }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.06 }}
                  style={{ background: meta.color }}
                />
              </div>
            </div>
          </motion.div>
        )
      })}

      {subjectLoad.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
          Test həll etdikcə yük göstəricisi hesablanır
        </p>
      )}
    </motion.div>
  )
}
