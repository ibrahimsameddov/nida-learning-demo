// @ts-nocheck
import { motion } from 'framer-motion'

interface Props { score: number; size?: number; label?: string }

export default function GroupERIGauge({ score, size = 120, label }: Props) {
  const r      = size * 0.37
  const cx     = size / 2
  const cy     = size * 0.56
  const arcLen = Math.PI * r
  const offset = arcLen * (1 - Math.max(0, Math.min(100, score)) / 100)
  const color  = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--primary)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`} overflow="visible">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.065} strokeLinecap="round"
        />
        <motion.path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={size * 0.065} strokeLinecap="round"
          strokeDasharray={arcLen} strokeDashoffset={arcLen}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: size * 0.22, fontWeight: 900, color, fontFamily: 'var(--font-heading)', lineHeight: 1, marginTop: -size * 0.16 }}
      >
        {score}
      </motion.p>
      {label && (
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          {label}
        </p>
      )}
    </div>
  )
}
