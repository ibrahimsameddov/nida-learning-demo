// @ts-nocheck
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/store/authContext'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'
import {
  getRankInfo, getRankProgress, getNextRank, getLeagueInfo, RANKS,
} from '@/types/teacherGamification'
import AchievementsTab from './AchievementsTab'
import StatsTab        from './StatsTab'
import LeaderboardTab  from './LeaderboardTab'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const TABS = [
  { id: 'achievements', label: 'Nailiyyətlər' },
  { id: 'stats',        label: 'Statistika'   },
  { id: 'leaderboard',  label: 'Sıralama'     },
]

function DemoTXButton() {
  const addTX = useTeacherGamificationStore(s => s.addTX)
  const reasons = [
    { amount: 10,  reason: 'Gündəlik giriş'           },
    { amount: 30,  reason: 'Tapşırığı 80% tamamladı'  },
    { amount: 50,  reason: 'İmtahan ortalaması 70%+'   },
    { amount: 25,  reason: 'Şagird ERI 10+ artdı'      },
    { amount: 100, reason: 'Şagird ERI 40+ artdı'      },
    { amount: 15,  reason: 'Müdaxilə tapşırığı göndərdi' },
  ]
  const pick = reasons[Math.floor(Math.random() * reasons.length)]
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={() => addTX(pick.amount, pick.reason)}
      style={{
        padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700,
        background: 'rgba(201,149,43,0.12)', border: '0.5px solid rgba(201,149,43,0.3)',
        color: '#C9952B', cursor: 'pointer',
      }}
    >
      ✨ Demo TX
    </motion.button>
  )
}

export default function TeacherProfile() {
  const [tab, setTab] = useState<string>('achievements')
  const { userProfile } = useAuth()

  const totalTX    = useTeacherGamificationStore(s => s.totalTX)
  const weeklyTX   = useTeacherGamificationStore(s => s.weeklyTX)
  const streak     = useTeacherGamificationStore(s => s.streak)
  const badges     = useTeacherGamificationStore(s => s.badges)

  const name   = (userProfile?.fullName || userProfile?.displayName || 'Müəllim')
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const city   = (userProfile as any)?.city || ''
  const school = (userProfile as any)?.school || ''

  const rank     = getRankInfo(totalTX)
  const next     = getNextRank(totalTX)
  const progress = getRankProgress(totalTX)
  const league   = getLeagueInfo(weeklyTX)

  return (
    <div className="page-inner" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680, margin: '0 auto' }}>

      {/* ── Profile header card ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="card"
        style={{ padding: '24px 24px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${rank.color}, ${rank.color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff',
            boxShadow: `0 4px 20px ${rank.color}44`,
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
              {name}
            </p>
            {(city || school) && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                {[school, city].filter(Boolean).join(' · ')}
              </p>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: rank.color, background: `${rank.color}18`, padding: '3px 10px', borderRadius: 8 }}>
                {rank.icon} {rank.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: league.color, background: `${league.color}18`, padding: '3px 10px', borderRadius: 8 }}>
                {league.icon} {league.label} Liqa
              </span>
              {streak > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF9F0A', background: 'rgba(255,159,10,0.12)', padding: '3px 10px', borderRadius: 8 }}>
                  🔥 {streak} gün seriya
                </span>
              )}
            </div>
          </div>

          <DemoTXButton />
        </div>

        {/* TX + rank progress */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 32, fontWeight: 900, color: rank.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {totalTX.toLocaleString()}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>TX</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                Rütbə {rank.rank}/8
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: 'var(--bg-hover)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 6, background: rank.color }}
              />
            </div>
            {next && (
              <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                {next.icon} {next.label} üçün {(next.minTX - totalTX).toLocaleString()} TX qaldı
              </p>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '0.5px solid var(--border)' }}>
          {[
            { label: 'Bu həftə',  value: `+${weeklyTX} TX`,      color: '#4F87FF'  },
            { label: 'Badge',     value: `${badges.length} ədəd`, color: '#7F77DD'  },
            { label: 'Seriya',    value: `${streak} gün`,         color: '#FF9F0A'  },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Rank road ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '2px 0' }}>
        {RANKS.map(r => {
          const active  = totalTX >= r.minTX
          const current = r.rank === rank.rank
          return (
            <div
              key={r.rank}
              style={{
                flexShrink: 0, textAlign: 'center', padding: '6px 8px',
                borderRadius: 10,
                background: current ? `${r.color}18` : 'transparent',
                border: current ? `0.5px solid ${r.color}44` : '0.5px solid transparent',
                opacity: active ? 1 : 0.38,
              }}
            >
              <p style={{ fontSize: 18, lineHeight: 1, marginBottom: 3 }}>{r.icon}</p>
              <p style={{ fontSize: 8, fontWeight: 700, color: current ? r.color : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                {r.rank}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(t => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '9px', borderRadius: 12, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              background: tab === t.id ? 'var(--bg-active)' : 'transparent',
              border: tab === t.id ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-3)',
              boxShadow: tab === t.id ? '0 0 12px var(--glow-sm)' : 'none',
            }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {tab === 'achievements' && <AchievementsTab />}
          {tab === 'stats'        && <StatsTab />}
          {tab === 'leaderboard'  && <LeaderboardTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
