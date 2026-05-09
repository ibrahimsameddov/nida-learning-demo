// @ts-nocheck
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'
import { getRankInfo } from '@/types/teacherGamification'

function lcg(s: number) { return (((1664525 * (s >>> 0) + 1013904223) >>> 0) / 4294967296) }
function strSeed(str: string) { return [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0 }

const TEACHER_NAMES = [
  'Nigar M.', 'Rauf Ə.', 'Leyla H.', 'Fərid N.', 'Günel S.',
  'Murad K.', 'Sevinc O.', 'Tural B.', 'Aynur R.', 'Kənan P.',
  'Zəhra Q.', 'Emil V.', 'Könül L.', 'Rəşad T.', 'Şəfa Y.',
]

function generateLeaderboard(myRank: number, myTX: number, type: 'weekly' | 'monthly' | 'global') {
  const seed = strSeed(type)
  const myIdx = myRank - 1
  const entries = TEACHER_NAMES.map((name, i) => {
    const s = seed * 3 + i * 17
    const baseTX = type === 'weekly'
      ? Math.round(200 + lcg(s) * 2000)
      : type === 'monthly'
        ? Math.round(800 + lcg(s) * 6000)
        : Math.round(5000 + lcg(s) * 95000)
    return { name, tx: baseTX, isMe: false }
  })
  // Insert "me" at the right rank
  entries.splice(myIdx, 0, { name: 'Siz', tx: myTX, isMe: true })
  entries.sort((a, b) => b.tx - a.tx)
  return entries.slice(0, 15).map((e, i) => ({ ...e, rank: i + 1 }))
}

const MEDALS = ['🥇', '🥈', '🥉']

const SUB_TABS = [
  { id: 'weekly',  label: 'Həftəlik' },
  { id: 'monthly', label: 'Aylıq'    },
  { id: 'global',  label: 'Ümumi'    },
]

export default function LeaderboardTab() {
  const [subTab, setSubTab] = useState<'weekly' | 'monthly' | 'global'>('weekly')
  const totalTX    = useTeacherGamificationStore(s => s.totalTX)
  const weeklyTX   = useTeacherGamificationStore(s => s.weeklyTX)
  const monthlyTX  = useTeacherGamificationStore(s => s.monthlyTX)
  const weeklyRank = useTeacherGamificationStore(s => s.weeklyRank)
  const monthlyRank = useTeacherGamificationStore(s => s.monthlyRank)
  const globalRank = useTeacherGamificationStore(s => s.globalRank)

  const myTX   = subTab === 'weekly' ? weeklyTX : subTab === 'monthly' ? monthlyTX : totalTX
  const myRank = subTab === 'weekly' ? weeklyRank : subTab === 'monthly' ? monthlyRank : globalRank

  const entries = generateLeaderboard(myRank, myTX, subTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-hover)', borderRadius: 12, padding: 3 }}>
        {SUB_TABS.map(t => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSubTab(t.id as any)}
            style={{
              flex: 1, padding: '7px', borderRadius: 9, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: subTab === t.id ? 'var(--bg-card)' : 'transparent',
              color:      subTab === t.id ? 'var(--primary)' : 'var(--text-3)',
              boxShadow:  subTab === t.id ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
            }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* My position chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 14,
        background: 'color-mix(in srgb, var(--primary) 8%, var(--bg-hover))',
        border: '0.5px solid color-mix(in srgb, var(--primary) 22%, var(--border))',
      }}>
        <span style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--primary)' }}>
          #{myRank}
        </span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>Sizin mövqeyiniz</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {myTX.toLocaleString()} TX · {subTab === 'weekly' ? 'Bu həftə' : subTab === 'monthly' ? 'Bu ay' : 'Ümumi'}
          </p>
        </div>
      </div>

      {/* Leaderboard list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.map((e, i) => {
          const rank = getRankInfo(e.tx)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 12,
                background: e.isMe
                  ? 'color-mix(in srgb, var(--primary) 10%, var(--bg-hover))'
                  : 'var(--bg-hover)',
                border: e.isMe
                  ? '0.5px solid color-mix(in srgb, var(--primary) 24%, var(--border))'
                  : '0.5px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>
                {e.rank <= 3 ? MEDALS[e.rank - 1] : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {e.rank}
                  </span>
                )}
              </span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: e.isMe ? 800 : 600, color: e.isMe ? 'var(--primary)' : 'var(--text-1)' }}>
                {e.name}
              </span>
              <span style={{ fontSize: 10, flexShrink: 0 }}>{rank.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#C9952B', fontFamily: 'var(--font-mono)', minWidth: 54, textAlign: 'right' }}>
                {e.tx.toLocaleString()}
              </span>
            </motion.div>
          )
        })}
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        {subTab === 'weekly' ? 'Hər bazar ertəsi sıfırlanır' : subTab === 'monthly' ? 'Hər ayın 1-i sıfırlanır' : 'Heç vaxt sıfırlanmır'}
      </p>
    </div>
  )
}
