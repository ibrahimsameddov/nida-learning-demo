import { motion } from 'framer-motion'

const ARC_R   = 60
const ARC_LEN = Math.PI * ARC_R  // ≈ 188.5

function scoreColor(score: number) {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--primary)'
  if (score >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Əla'
  if (score >= 60) return 'Yaxşı'
  if (score >= 40) return 'Orta'
  return 'Zəif'
}

interface Props {
  score:    number
  size?:    number
  showLabel?: boolean
}

export default function ERIGauge({ score, size = 160, showLabel = true }: Props) {
  const s      = Math.max(0, Math.min(100, score))
  const color  = scoreColor(s)
  const offset = ARC_LEN * (1 - s / 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg
        width={size}
        height={size * 0.65}
        viewBox="0 0 160 104"
        overflow="visible"
      >
        {/* Glow filter */}
        <defs>
          <filter id="eri-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track arc */}
        <path
          d="M 20 90 A 60 60 0 0 1 140 90"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />

        {/* Score arc */}
        <motion.path
          d="M 20 90 A 60 60 0 0 1 140 90"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={ARC_LEN}
          initial={{ strokeDashoffset: ARC_LEN }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          filter="url(#eri-glow)"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(v => {
          const angle = Math.PI * (1 - v / 100)
          const ix    = 80 + ARC_R * Math.cos(Math.PI - angle)
          const iy    = 90 - ARC_R * Math.sin(angle)
          const ox    = 80 + (ARC_R + 8) * Math.cos(Math.PI - angle)
          const oy    = 90 - (ARC_R + 8) * Math.sin(angle)
          return (
            <line key={v} x1={ix} y1={iy} x2={ox} y2={oy}
              stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round" />
          )
        })}

        {/* Score number */}
        <motion.text
          x="80" y="78"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fontFamily="var(--font-heading)"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        >
          {s}
        </motion.text>
        <text x="80" y="96" textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)" fill="rgba(255,255,255,0.4)" letterSpacing="2">
          ERI
        </text>
      </svg>

      {showLabel && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            fontSize: 11, fontWeight: 700, color,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          {scoreLabel(s)}
        </motion.span>
      )}
    </div>
  )
}
