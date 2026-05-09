// @ts-nocheck
import { motion } from 'framer-motion'
import type { InactiveStudent } from '@/lib/classroomIntelligence'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

const RISK_COLOR: Record<string, string> = {
  high:   'var(--danger)',
  medium: 'var(--warning)',
  low:    'var(--primary)',
}

const RISK_LABEL: Record<string, string> = {
  high:   'Yüksək risk',
  medium: 'Orta risk',
  low:    'Kiçik risk',
}

interface Props { students: InactiveStudent[] }

export default function InactiveStudentsList({ students }: Props) {
  if (!students.length) return null

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 14 }}>
        😴 Fəalsız Şagirdlər
        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
          {students.length}
        </span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {students.slice(0, 8).map((s, i) => (
          <motion.div
            key={s.studentUid}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              background: `color-mix(in srgb, ${RISK_COLOR[s.riskLevel]} 6%, var(--bg-elevated))`,
              border: `0.5px solid color-mix(in srgb, ${RISK_COLOR[s.riskLevel]} 20%, transparent)`,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: `color-mix(in srgb, ${RISK_COLOR[s.riskLevel]} 12%, var(--bg-card))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, color: RISK_COLOR[s.riskLevel], fontFamily: 'var(--font-heading)',
            }}>
              {s.lastActiveDays >= 999 ? '∞' : s.lastActiveDays}
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{s.studentName}</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)' }}>
                {s.lastActiveDays >= 999 ? 'Heç vaxt fəal olmayıb' : `${s.lastActiveDays} gündür fəal deyil`}
              </p>
            </div>

            <span style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
              background: `color-mix(in srgb, ${RISK_COLOR[s.riskLevel]} 12%, transparent)`,
              color: RISK_COLOR[s.riskLevel],
            }}>
              {RISK_LABEL[s.riskLevel]}
            </span>
          </motion.div>
        ))}

        {students.length > 8 && (
          <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', padding: '4px 0' }}>
            +{students.length - 8} daha
          </p>
        )}
      </div>
    </motion.div>
  )
}
