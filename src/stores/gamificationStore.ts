import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

export interface Badge {
  id: string
  label: string
  icon: string
  description: string
  earnedAt?: number
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_quiz',    icon: '🎯', label: 'İlk Addım',       description: 'İlk quizi tamamladın' },
  { id: 'streak_3',      icon: '🔥', label: '3 Günlük Od',     description: '3 gün üst-üstə giriş' },
  { id: 'streak_7',      icon: '🌟', label: '7 Günlük Alev',   description: '7 gün üst-üstə giriş' },
  { id: 'streak_30',     icon: '💎', label: 'Alov Ustası',      description: '30 gün üst-üstə giriş' },
  { id: 'perfect_score', icon: '🏆', label: 'Kusursuz',         description: '100% skor aldın' },
  { id: 'top_3',         icon: '🥇', label: 'Lider',            description: 'Lider sıralamada top 3' },
  { id: 'quiz_10',       icon: '📚', label: 'Çalışqan',         description: '10 quiz tamamladın' },
  { id: 'quiz_50',       icon: '🚀', label: 'Quiz Ustası',      description: '50 quiz tamamladın' },
  { id: 'level_5',       icon: '⚡', label: 'Yüksəliş',         description: 'Səviyyə 5-ə çatdın' },
]

export function getLevelInfo(xp: number) {
  const levels = [
    { level: 1, minXP: 0,    maxXP: 500,  label: 'Başlanğıc',   color: '#8B8B8B' },
    { level: 2, minXP: 500,  maxXP: 1200, label: 'Öyrənən',     color: '#4FC3F7' },
    { level: 3, minXP: 1200, maxXP: 2200, label: 'İrəliləyən',  color: '#81C784' },
    { level: 4, minXP: 2200, maxXP: 3500, label: 'Bacarıqlı',   color: '#FFB74D' },
    { level: 5, minXP: 3500, maxXP: 5500, label: 'Mahir',       color: '#FF8A65' },
    { level: 6, minXP: 5500, maxXP: 8000, label: 'Ekspert',     color: '#BA68C8' },
    { level: 7, minXP: 8000, maxXP: 11500, label: 'Usta',       color: '#4F87FF' },
    { level: 8, minXP: 11500, maxXP: 16000, label: 'Böyük Usta', color: '#00C9A7' },
    { level: 9, minXP: 16000, maxXP: 22000, label: 'Şampiyon',  color: '#F4A261' },
    { level: 10, minXP: 22000, maxXP: 999999, label: 'Əfsanə',  color: '#FFD700' },
  ]
  const current = levels.findLast(l => xp >= l.minXP) ?? levels[0]
  const progress = current.maxXP === 999999
    ? 100
    : Math.round(((xp - current.minXP) / (current.maxXP - current.minXP)) * 100)
  return { ...current, progress, xpForNext: current.maxXP - xp }
}

interface GamificationState {
  xp:             number
  weeklyXP:       number
  streak:         number
  longestStreak:  number
  lastLoginDate:  string | null
  badges:         Badge[]
  pendingBadge:   Badge | null
  pendingLevelUp: number | null

  addXP:          (amount: number) => { newBadges: Badge[]; leveledUp: boolean; newLevel: number }
  checkStreak:    () => void
  clearPendingBadge: () => void
  clearPendingLevelUp: () => void
  _earnBadge:     (id: string) => Badge | null
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    immer((set, get) => ({
      xp:             0,
      weeklyXP:       0,
      streak:         0,
      longestStreak:  0,
      lastLoginDate:  null,
      badges:         [],
      pendingBadge:   null,
      pendingLevelUp: null,

      _earnBadge: (id) => {
        const state = get()
        if (state.badges.find(b => b.id === id)) return null
        const badge = ALL_BADGES.find(b => b.id === id)
        if (!badge) return null
        const earned = { ...badge, earnedAt: Date.now() }
        set(s => { s.badges.push(earned); s.pendingBadge = earned })
        return earned
      },

      addXP: (amount) => {
        const state    = get()
        const oldLevel = getLevelInfo(state.xp).level
        const newXP    = state.xp + amount

        set(s => {
          s.xp        = newXP
          s.weeklyXP  = s.weeklyXP + amount
        })

        const newLevel = getLevelInfo(newXP).level
        const leveledUp = newLevel > oldLevel

        if (leveledUp) set(s => { s.pendingLevelUp = newLevel })

        // Badge checks
        const newBadges: Badge[] = []
        const totalQuizzes = Math.floor(newXP / 25) // rough estimate
        if (newXP >= 25 && !state.badges.find(b => b.id === 'first_quiz')) {
          const b = get()._earnBadge('first_quiz'); if (b) newBadges.push(b)
        }
        if (totalQuizzes >= 10 && !state.badges.find(b => b.id === 'quiz_10')) {
          const b = get()._earnBadge('quiz_10'); if (b) newBadges.push(b)
        }
        if (newLevel >= 5 && !state.badges.find(b => b.id === 'level_5')) {
          const b = get()._earnBadge('level_5'); if (b) newBadges.push(b)
        }

        return { newBadges, leveledUp, newLevel }
      },

      checkStreak: () => {
        const today = new Date().toDateString()
        const state = get()
        if (state.lastLoginDate === today) return

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const isConsecutive = state.lastLoginDate === yesterday.toDateString()
        const newStreak = isConsecutive ? state.streak + 1 : 1

        set(s => {
          s.streak        = newStreak
          s.lastLoginDate = today
          s.longestStreak = Math.max(s.longestStreak, newStreak)
        })

        // Streak badges
        if (newStreak >= 3  && !state.badges.find(b => b.id === 'streak_3'))  get()._earnBadge('streak_3')
        if (newStreak >= 7  && !state.badges.find(b => b.id === 'streak_7'))  get()._earnBadge('streak_7')
        if (newStreak >= 30 && !state.badges.find(b => b.id === 'streak_30')) get()._earnBadge('streak_30')
      },

      clearPendingBadge:   () => set(s => { s.pendingBadge = null }),
      clearPendingLevelUp: () => set(s => { s.pendingLevelUp = null }),
    })),
    {
      name:    'nida-gamification',
      version: 1,
    }
  )
)
