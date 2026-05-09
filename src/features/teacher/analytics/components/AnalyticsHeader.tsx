// @ts-nocheck
import { motion } from 'framer-motion'
import type { Period } from '@/hooks/useTeacherAnalytics'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week',  label: 'Bu həftə' },
  { id: 'month', label: 'Bu ay'    },
  { id: 'year',  label: 'Bu il'    },
]

const MOCK_GROUPS = [
  { id: '',   name: 'Bütün qruplar' },
  { id: 'm1', name: '10-A'          },
  { id: 'm2', name: '10-B'          },
  { id: 'm3', name: '11-A'          },
  { id: 'm4', name: '11-B'          },
]

interface Props {
  period:         Period
  groupId:        string
  onPeriodChange: (p: Period) => void
  onGroupChange:  (id: string) => void
}

export default function AnalyticsHeader({ period, groupId, onPeriodChange, onGroupChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 3, background: 'var(--bg-hover)', borderRadius: 12, padding: 3 }}>
        {PERIODS.map(p => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => onPeriodChange(p.id)}
            style={{
              padding: '6px 14px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: period === p.id ? 'var(--bg-card)' : 'transparent',
              color:      period === p.id ? 'var(--primary)' : 'var(--text-3)',
              boxShadow:  period === p.id ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
            }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      <select
        value={groupId}
        onChange={e => onGroupChange(e.target.value)}
        style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
          background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
          borderRadius: 10, padding: '7px 12px', cursor: 'pointer',
          outline: 'none', fontFamily: 'inherit',
        }}
      >
        {MOCK_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
    </div>
  )
}
