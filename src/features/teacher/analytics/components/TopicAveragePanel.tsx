// @ts-nocheck
import { motion } from 'framer-motion'
import { usePanels } from '../SlidePanel'
import { useTopicAverages } from '@/hooks/useTeacherAnalytics'
import type { Period } from '@/hooks/useTeacherAnalytics'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

function barColor(v: number) { return v >= 70 ? '#34C759' : v >= 50 ? '#FF9F0A' : '#FF453A' }

// ── Topic drill-down content ───────────────────────────────────────────────────

function TopicDetailContent({ topic }: { topic: any }) {
  const total = 14
  const weekTrend = [
    topic.avg - 8, topic.avg - 12, topic.avg + 2, topic.avg - 4,
    topic.avg + Math.floor(topic.trend / 2), topic.avg, topic.avg + topic.trend,
  ].map(v => Math.max(0, Math.min(100, v)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
          color: barColor(topic.avg), background: `${barColor(topic.avg)}18`,
        }}>
          ⌀ {topic.avg}%
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
          background: topic.trend > 0 ? 'rgba(52,199,89,0.12)' : 'rgba(255,69,58,0.12)',
          color: topic.trend > 0 ? '#34C759' : '#FF453A',
        }}>
          {topic.trend > 0 ? '↑' : '↓'} {Math.abs(topic.trend)}% bu ay
        </span>
        {topic.weak > 4 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#FF453A', background: 'rgba(255,69,58,0.1)', padding: '3px 10px', borderRadius: 8 }}>
            ⚠ {topic.weak} şagird zəif
          </span>
        )}
      </div>

      {/* Note */}
      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>💡 {topic.note}</p>
      </div>

      {/* Nəticə paylanması */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Nəticə Paylanması ({total} şagird)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {topic.dist.map((d: any, i: number) => (
            <div key={d.range} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 64 }}>{d.range}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 6, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.count / total) * 100}%` }}
                  transition={{ delay: 0.06 * i, duration: 0.5 }}
                  style={{ height: '100%', borderRadius: 6, background: d.c }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.c, minWidth: 20, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Həftəlik trend */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          Həftəlik Trend
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 52 }}>
          {weekTrend.map((v, i) => {
            const h = Math.max(4, Math.round((v / 100) * 40))
            const c = barColor(v)
            return (
              <div key={i} style={{ flex: 1, height: 40, display: 'flex', alignItems: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  style={{ width: '100%', borderRadius: '4px 4px 2px 2px', background: `${c}55`, border: `1px solid ${c}99` }}
                />
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Bu'].map(l => (
            <span key={l} style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: '📝 Tapşırıq Yarat', color: 'var(--primary)' },
          { label: '📋 İmtahan Yarat',  color: null },
        ].map(({ label, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: color ? `color-mix(in srgb, ${color} 12%, var(--bg-hover))` : 'var(--bg-hover)',
              border: color ? `0.5px solid color-mix(in srgb, ${color} 28%, var(--border))` : '0.5px solid var(--border)',
              color: color ?? 'var(--text-2)',
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

interface Props { period: Period; groupId: string }

export default function TopicAveragePanel({ period, groupId }: Props) {
  const { push } = usePanels()
  const { topics } = useTopicAverages(period, groupId)
  const sorted = [...topics].sort((a, b) => a.avg - b.avg)

  const openDetail = (t: any) => push({
    id:       `topic-${t.key}`,
    title:    `${t.icon} ${t.name}`,
    subtitle: `⌀ ${t.avg}% · ${t.trend > 0 ? '↑' : '↓'} ${Math.abs(t.trend)}% bu ay`,
    content:  <TopicDetailContent topic={t} />,
  })

  return (
    <div className="card">
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
          Mövzu Ortalaması
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
          Zəifdən güclüyə · tıkla → detal
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((t, i) => {
          const color = barColor(t.avg)
          return (
            <motion.div
              key={t.key}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openDetail(t)}
              style={{ cursor: 'pointer', borderRadius: 8, padding: '2px 0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</span>
                  {t.avg < 50 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#FF453A', background: 'rgba(255,69,58,0.1)', padding: '1px 6px', borderRadius: 6 }}>
                      ⚠ Zəif
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                    background: t.trend > 0 ? 'rgba(52,199,89,0.12)' : 'rgba(255,69,58,0.12)',
                    color: t.trend > 0 ? '#34C759' : '#FF453A',
                  }}>
                    {t.trend > 0 ? '↑' : '↓'} {Math.abs(t.trend)}%
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-mono)', minWidth: 32, textAlign: 'right' }}>
                    {t.avg}%
                  </span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 5, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.avg}%` }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.6 }}
                  style={{ height: '100%', borderRadius: 5, background: color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
