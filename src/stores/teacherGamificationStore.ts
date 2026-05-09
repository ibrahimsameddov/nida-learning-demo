// @ts-nocheck
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  ALL_TEACHER_BADGES, RANKS, getRankInfo, getLeagueInfo,
  type TeacherBadge, type TeacherLeague, type TXPoint, type Certificate,
} from '@/types/teacherGamification'

interface TeacherGamificationState {
  totalTX:     number
  weeklyTX:    number
  monthlyTX:   number
  currentRank: number
  currentLeague: TeacherLeague
  streak:      number
  longestStreak: number
  lastLoginDate: string | null
  badges:      TeacherBadge[]
  certificates: Certificate[]
  txHistory:   TXPoint[]

  // Weekly reset tracking
  lastWeekReset:  string | null
  lastMonthReset: string | null

  // Mock leaderboard ranks
  weeklyRank:  number
  monthlyRank: number
  globalRank:  number

  // Pending UI events
  pendingBadge:   TeacherBadge | null
  pendingRankUp:  number | null        // new rank number
  pendingTXToast: { amount: number; reason: string } | null

  // Actions
  addTX:            (amount: number, reason: string) => void
  checkStreak:      () => void
  awardBadge:       (id: string) => void
  awardCertificate: (cert: Certificate) => void
  clearPendingBadge:   () => void
  clearPendingRankUp:  () => void
  clearPendingTXToast: () => void
  resetWeeklyTX:    () => void
}

function todayStr()  { return new Date().toDateString() }
function monthStr()  { return `${new Date().getFullYear()}-${new Date().getMonth()}` }
function weekStr()   {
  const d = new Date()
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return d.toDateString()
}

export const useTeacherGamificationStore = create<TeacherGamificationState>()(
  persist(
    immer((set, get) => ({
      totalTX:      1240,    // demo seed — looks lived-in
      weeklyTX:     340,
      monthlyTX:    1240,
      currentRank:  2,
      currentLeague:'bronze',
      streak:       7,
      longestStreak:14,
      lastLoginDate: null,
      badges:       [],
      certificates: [],
      txHistory:    [],
      lastWeekReset:  null,
      lastMonthReset: null,
      weeklyRank:   8,
      monthlyRank:  12,
      globalRank:   47,
      pendingBadge:   null,
      pendingRankUp:  null,
      pendingTXToast: null,

      // ── Add TX ──────────────────────────────────────────────────────────────

      addTX: (amount, reason) => {
        const state = get()
        const oldRank = getRankInfo(state.totalTX).rank
        const newTotal = state.totalTX + amount
        const newWeekly = state.weeklyTX + amount
        const newMonthly = state.monthlyTX + amount
        const newRankInfo = getRankInfo(newTotal)
        const newLeague = getLeagueInfo(newWeekly)

        set(s => {
          s.totalTX   = newTotal
          s.weeklyTX  = newWeekly
          s.monthlyTX = newMonthly
          s.currentLeague = newLeague.id
          s.txHistory.unshift({ amount, reason, earnedAt: Date.now() })
          if (s.txHistory.length > 100) s.txHistory.pop()
          s.pendingTXToast = { amount, reason }
          if (newRankInfo.rank > oldRank) {
            s.currentRank  = newRankInfo.rank
            s.pendingRankUp = newRankInfo.rank
          }
        })
      },

      // ── Streak (daily login) ─────────────────────────────────────────────────

      checkStreak: () => {
        const today = todayStr()
        const state = get()
        if (state.lastLoginDate === today) return

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const isConsecutive = state.lastLoginDate === yesterday.toDateString()
        const newStreak = isConsecutive ? state.streak + 1 : 1

        set(s => {
          s.streak        = newStreak
          s.longestStreak = Math.max(s.longestStreak, newStreak)
          s.lastLoginDate = today
        })

        get().addTX(10, 'Gündəlik giriş')
        if (newStreak >= 7 && !get().badges.find(b => b.id === 'login_30')) {
          // progress toward login_30 badge
        }
      },

      // ── Award badge ──────────────────────────────────────────────────────────

      awardBadge: (id) => {
        const state = get()
        if (state.badges.find(b => b.id === id)) return
        const def = ALL_TEACHER_BADGES.find(b => b.id === id)
        if (!def) return
        const earned = { ...def, earnedAt: Date.now() }
        set(s => { s.badges.push(earned); s.pendingBadge = earned })
        get().addTX(def.txReward, `Badge: ${def.label}`)
      },

      // ── Award certificate ────────────────────────────────────────────────────

      awardCertificate: (cert) => {
        set(s => { s.certificates.push(cert) })
      },

      // ── Weekly TX reset ──────────────────────────────────────────────────────

      resetWeeklyTX: () => {
        const thisWeek = weekStr()
        if (get().lastWeekReset === thisWeek) return
        set(s => { s.weeklyTX = 0; s.lastWeekReset = thisWeek })
      },

      // ── Clear pending ────────────────────────────────────────────────────────

      clearPendingBadge:   () => set(s => { s.pendingBadge   = null }),
      clearPendingRankUp:  () => set(s => { s.pendingRankUp  = null }),
      clearPendingTXToast: () => set(s => { s.pendingTXToast = null }),
    })),
    { name: 'nida-teacher-gamification', version: 1 }
  )
)
