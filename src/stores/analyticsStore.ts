import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { calculateNextInterval } from '../lib/analytics'
import type { SelfAssessment } from '../lib/analytics'

interface SpacedRepState {
  intervalDays: number
  easeFactor:   number
  repetitions:  number
  lastReviewed: number
  nextReview:   number
}

interface AnalyticsStoreState {
  spacedRepState:  Record<string, SpacedRepState>
  selfAssessments: SelfAssessment[]

  markReviewed:       (topicId: string, quality: number) => void
  addSelfAssessment:  (sa: SelfAssessment) => void
  clearSpacedRep:     () => void
}

export const useAnalyticsStore = create<AnalyticsStoreState>()(
  persist(
    immer((set, get) => ({
      spacedRepState:  {},
      selfAssessments: [],

      markReviewed: (topicId, quality) => {
        set(state => {
          const prev = state.spacedRepState[topicId] ?? { intervalDays: 1, easeFactor: 2.5, repetitions: 0, lastReviewed: 0, nextReview: 0 }
          const { interval, easeFactor } = calculateNextInterval(prev.intervalDays, prev.easeFactor, quality)
          state.spacedRepState[topicId] = {
            intervalDays: interval,
            easeFactor,
            repetitions:  prev.repetitions + 1,
            lastReviewed: Date.now(),
            nextReview:   Date.now() + interval * 86_400_000,
          }
        })
      },

      addSelfAssessment: (sa) => {
        set(state => {
          const idx = state.selfAssessments.findIndex(x => x.sessionId === sa.sessionId && x.topicId === sa.topicId)
          if (idx >= 0) state.selfAssessments[idx] = sa
          else state.selfAssessments.push(sa)
        })
      },

      clearSpacedRep: () => set(state => { state.spacedRepState = {} }),
    })),
    { name: 'nida-analytics', version: 1 },
  ),
)
