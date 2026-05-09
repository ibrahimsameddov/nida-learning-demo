// @ts-nocheck
import { motion } from 'framer-motion'
import { useAllGroupsOverview } from '@/hooks/useClassroomIntelligence'
import { usePanels } from '../SlidePanel'
import GroupDetailContent from './GroupDetailContent'

const MOCK_GROUPS = [
  { id: 'm1', name: '10-A', eri: 78, studentCount: 14, pendingCount: 1 },
  { id: 'm2', name: '10-B', eri: 62, studentCount: 16, pendingCount: 3 },
  { id: 'm3', name: '11-A', eri: 85, studentCount: 12, pendingCount: 0 },
  { id: 'm4', name: '11-B', eri: 44, studentCount: 15, pendingCount: 5 },
]

const RANKS = ['🥇', '🥈', '🥉']

function eriColor(v: number) {
  if (v >= 70) return '#34C759'
  if (v >= 50) return '#FF9F0A'
  return '#FF453A'
}

export default function GroupComparison() {
  const { data: realGroups = [] } = useAllGroupsOverview()
  const groups = realGroups.length ? realGroups : MOCK_GROUPS
  const sorted = [...groups].sort((a, b) => (b.eri ?? b.groupERI ?? 65) - (a.eri ?? a.groupERI ?? 65))
  const { push } = usePanels()

  return (
    <div className="card">
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
          Qruplar Müqayisəsi
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>ERI skoru · tıkla → qrup detalı</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((g, i) => {
          const eri   = g.eri ?? g.groupERI ?? 65
          const color = eriColor(eri)
          return (
            <motion.div
              key={g.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => push({
                id:       `group-${g.id}`,
                title:    g.name,
                subtitle: `ERI ${eri} · ${g.studentCount ?? '?'} şagird`,
                content:  <GroupDetailContent group={g} />,
              })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 8, padding: '4px 0' }}
            >
              <span style={{ fontSize: 14, flexShrink: 0, width: 20 }}>
                {RANKS[i] ?? <span style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', minWidth: 42, flexShrink: 0 }}>
                {g.name}
              </span>
              <div style={{ flex: 1, height: 8, borderRadius: 6, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${eri}%` }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 6, background: color }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-mono)', minWidth: 30, textAlign: 'right', flexShrink: 0 }}>
                {eri}
              </span>
              {(g.pendingCount ?? 0) > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--danger)', flexShrink: 0,
                  background: 'rgba(255,69,58,0.1)', padding: '2px 6px', borderRadius: 6,
                }}>
                  ⚠ {g.pendingCount}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--border)' }}>
        {[{ l: 'Güclü 70+', c: '#34C759' }, { l: 'Orta 50–69', c: '#FF9F0A' }, { l: 'Zəif <50', c: '#FF453A' }].map(({ l, c }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
