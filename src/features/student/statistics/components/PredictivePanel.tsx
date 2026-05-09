import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useERI } from '@/hooks/useAnalytics'
import { predictExamScore } from '@/lib/analytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

export default function PredictivePanel() {
  const { eri, breakdown } = useERI()

  const [daysToExam,   setDaysToExam]   = useState(30)
  const [dailyTests,   setDailyTests]   = useState(3)
  const [targetScore,  setTargetScore]  = useState(80)

  const predicted = useMemo(
    () => predictExamScore(eri, daysToExam, dailyTests),
    [eri, daysToExam, dailyTests],
  )

  const willReach  = predicted >= targetScore
  const gap        = Math.max(0, targetScore - eri)
  const requiredDaily = gap > 0 ? Math.ceil(gap / Math.max(1, daysToExam) * 8) : 0

  const color = willReach ? 'var(--success)' : predicted >= eri + 5 ? 'var(--warning)' : 'var(--danger)'

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 16 }}>Proqnoz Paneli</p>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <SliderRow
          label="İmtahana qədər gün"
          value={daysToExam}
          min={7} max={180} step={1}
          display={`${daysToExam} gün`}
          onChange={setDaysToExam}
        />
        <SliderRow
          label="Gündəlik test sayı"
          value={dailyTests}
          min={1} max={10} step={1}
          display={`${dailyTests} test`}
          onChange={setDailyTests}
        />
        <SliderRow
          label="Hədəf bal"
          value={targetScore}
          min={50} max={100} step={5}
          display={`${targetScore}%`}
          onChange={setTargetScore}
        />
      </div>

      {/* Prediction result */}
      <div style={{
        padding: '16px',
        borderRadius: 12,
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
        border: `0.5px solid color-mix(in srgb, ${color} 30%, transparent)`,
        textAlign: 'center',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Proqnoz nəticə
        </p>
        <motion.div
          key={predicted}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ fontSize: 44, fontWeight: 900, fontFamily: 'var(--font-heading)', color, lineHeight: 1, marginBottom: 4 }}
        >
          {predicted}%
        </motion.div>
        <p style={{ fontSize: 12, color, fontWeight: 700 }}>
          {willReach ? `✓ Hədəfinizə çatacaqsınız` : `Hədəfə ${targetScore - predicted}% çatışmır`}
        </p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricChip label="Cari ERI"     value={`${eri}`}           color="var(--primary)" />
        <MetricChip label="Artım"        value={`+${predicted - eri}`} color="var(--success)" />
        {!willReach && (
          <MetricChip label="Lazım olan test/gün" value={`${requiredDaily}+`} color="var(--warning)" />
        )}
        {breakdown && (
          <MetricChip label="Prioritet fənn" value={breakdown.weakestArea || '—'} color="var(--danger)" />
        )}
      </div>
    </motion.div>
  )
}

function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string;
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
      />
    </div>
  )
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
    }}>
      <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'var(--font-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
  )
}
