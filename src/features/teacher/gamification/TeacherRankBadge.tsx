// @ts-nocheck
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'
import { getRankInfo, getRankProgress, getNextRank, getLeagueInfo, RANKS } from '@/types/teacherGamification'

export default function TeacherRankBadge() {
  const navigate   = useNavigate()
  const totalTX    = useTeacherGamificationStore(s => s.totalTX)
  const weeklyTX   = useTeacherGamificationStore(s => s.weeklyTX)
  const streak     = useTeacherGamificationStore(s => s.streak)

  const rank     = getRankInfo(totalTX)
  const next     = getNextRank(totalTX)
  const progress = getRankProgress(totalTX)
  const league   = getLeagueInfo(weeklyTX)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/teacher/profile')}
      style={{
        margin: '8px 0 4px',
        background: 'var(--bg-hover)',
        border: `0.5px solid ${rank.color}33`,
        borderRadius: 12,
        padding: '10px 12px',
        cursor: 'pointer',
      }}
    >
      {/* Rank row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{rank.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: rank.color }}>
            {rank.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10 }}>{league.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: league.color }}>{league.label}</span>
        </div>
      </div>

      {/* TX display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: rank.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
          {totalTX.toLocaleString()}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>TX</span>
        {streak > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#FF9F0A' }}>
            🔥 {streak}g
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 4, background: rank.color }}
        />
      </div>
      {next && (
        <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          {next.label} üçün {(next.minTX - totalTX).toLocaleString()} TX
        </p>
      )}
    </motion.div>
  )
}
