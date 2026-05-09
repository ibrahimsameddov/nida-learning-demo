// @ts-nocheck
import { motion } from 'framer-motion'

interface Props {
  studentCount: number
  groupERI:     number
  subject:      string
}

const DAYS   = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']
const WEEKS  = 4

function fakeActivity(seed: number, day: number, week: number): number {
  const h = ((seed * 2654435761) >>> 0)
  const v = ((h + day * 374761393 + week * 1234567891) >>> 0) % 100
  return v > 30 ? Math.min(100, v) : 0
}

function eriColor(val: number): string {
  if (val === 0)   return 'rgba(255,255,255,0.04)'
  if (val >= 80)   return 'var(--success)'
  if (val >= 60)   return 'var(--primary)'
  if (val >= 40)   return 'var(--warning)'
  return 'var(--danger)'
}

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

export default function GroupHeatmap({ studentCount, groupERI, subject }: Props) {
  const seed = studentCount * 31 + groupERI * 7
  const cells = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => fakeActivity(seed, d, w))
  )

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p className="card-title">Qrup Aktivliyi</p>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>son 4 həftə</span>
      </div>

      {/* Day labels */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 0 }}>
        {DAYS.map(d => (
          <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {cells.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', gap: 4 }}>
            {week.map((val, di) => (
              <motion.div
                key={di}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.008 }}
                title={val > 0 ? `${val}% aktivlik` : 'Fəal deyil'}
                style={{
                  flex: 1, aspectRatio: '1', borderRadius: 3,
                  background: eriColor(val),
                  opacity: val > 0 ? 0.6 + val / 250 : 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Az</span>
        {[0, 40, 60, 80, 95].map(v => (
          <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: eriColor(v) }} />
        ))}
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Çox</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div style={{
          flex: 1, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
        }}>
          <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 3 }}>Şagird</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{studentCount}</p>
        </div>
        <div style={{
          flex: 1, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
        }}>
          <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 3 }}>Qrup ERI</p>
          <p style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-heading)',
            color: groupERI >= 80 ? 'var(--success)' : groupERI >= 60 ? 'var(--primary)' : groupERI >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
            {groupERI}
          </p>
        </div>
        <div style={{
          flex: 2, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
        }}>
          <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 3 }}>Fənn</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject || '—'}</p>
        </div>
      </div>
    </motion.div>
  )
}
