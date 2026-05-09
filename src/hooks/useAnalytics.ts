import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dbGetStats, dbGetResults } from '../lib/db'
import {
  calculateERI,
  calculateDKIndex,
  calculateCohortPercentile,
  extractLearningProfile,
  deriveSpacedItems,
  buildKnowledgeGraph,
  generateMockCohort,
  generatePassportData,
  generateForgettingPoints,
} from '../lib/analytics'
import { useAnalyticsStore } from '../stores/analyticsStore'
import type { ERIBreakdown, SpacedItem, LearningProfile, GraphNode, GraphEdge } from '../lib/analytics'

// ── Base data queries ─────────────────────────────────────────────────────────

export function useStatsData() {
  const statsQ   = useQuery({ queryKey: ['stats'],   queryFn: () => dbGetStats(),   staleTime: 60_000 })
  const resultsQ = useQuery({ queryKey: ['results'], queryFn: () => dbGetResults(), staleTime: 60_000 })
  return {
    stats:     statsQ.data   ?? null,
    results:   resultsQ.data ?? [],
    isLoading: statsQ.isLoading || resultsQ.isLoading,
  }
}

// ── ERI ───────────────────────────────────────────────────────────────────────

export function useERI() {
  const { stats, isLoading } = useStatsData()

  const result = useMemo(() => stats ? calculateERI(stats) : null, [stats])

  const history = useMemo(() => {
    if (!stats?.weeklyProgress) return []
    return stats.weeklyProgress.map(p => ({
      date:  p.date,
      score: Math.round(
        p.percentage * 0.70 +
        Math.min(100, (stats.currentStreak ?? 0) * 2) * 0.15 +
        Math.min(100, (stats.totalTests ?? 0)) * 0.15,
      ),
    }))
  }, [stats])

  const trend = useMemo((): 'up' | 'down' | 'stable' => {
    if (history.length < 3) return 'stable'
    const tail  = history.slice(-4)
    const slope = tail[tail.length - 1].score - tail[0].score
    if (slope > 4) return 'up'
    if (slope < -4) return 'down'
    return 'stable'
  }, [history])

  return {
    eri:       result?.score     ?? 0,
    breakdown: result?.breakdown ?? null as ERIBreakdown | null,
    history,
    trend,
    isLoading,
  }
}

// ── Spaced Repetition ─────────────────────────────────────────────────────────

export function useSpacedRepetition() {
  const { stats, results, isLoading } = useStatsData()
  const { spacedRepState, markReviewed } = useAnalyticsStore()

  const items = useMemo((): SpacedItem[] => {
    if (!stats) return []
    const derived = deriveSpacedItems(stats.subjectStats ?? [], results)
    return derived.map(item => {
      const override = spacedRepState[item.topicId]
      if (!override) return item
      return {
        ...item,
        intervalDays:  override.intervalDays,
        easeFactor:    override.easeFactor,
        repetitions:   override.repetitions,
        lastStudied:   override.lastReviewed || item.lastStudied,
        nextReview:    override.nextReview,
        retentionRate: Math.max(0, Math.round(
          Math.exp(-(Date.now() - override.lastReviewed) / (override.intervalDays * 86_400_000)) * 100,
        )),
      }
    })
  }, [stats, results, spacedRepState])

  const now = Date.now()
  return {
    items,
    dueToday:     items.filter(i => i.nextReview <= now + 86_400_000).slice(0, 10),
    dueThisWeek:  items.filter(i => i.nextReview <= now + 7 * 86_400_000),
    overdueCount: items.filter(i => i.nextReview < now).length,
    markReviewed,
    isLoading,
  }
}

// ── Knowledge Graph ───────────────────────────────────────────────────────────

export function useKnowledgeGraph() {
  const { stats, results, isLoading } = useStatsData()

  const graph = useMemo(() => {
    if (!stats) return { nodes: [] as GraphNode[], edges: [] as GraphEdge[] }
    return buildKnowledgeGraph(stats.subjectStats ?? [], results)
  }, [stats, results])

  const weakNodes = useMemo(() => graph.nodes.filter(n => n.isWeak), [graph])

  return { ...graph, weakNodes, isLoading }
}

// ── Metacognition / Dunning-Kruger ────────────────────────────────────────────

export function useMetacognition() {
  const { selfAssessments, addSelfAssessment } = useAnalyticsStore()

  const dkIndex = useMemo(() => calculateDKIndex(selfAssessments), [selfAssessments])

  const overconfidentTopics = useMemo(
    () => selfAssessments.filter(a => a.perceivedScore - a.actualScore > 15).map(a => a.topicId),
    [selfAssessments],
  )
  const underconfidentTopics = useMemo(
    () => selfAssessments.filter(a => a.actualScore - a.perceivedScore > 15).map(a => a.topicId),
    [selfAssessments],
  )

  return { dkIndex, overconfidentTopics, underconfidentTopics, addSelfAssessment, selfAssessments }
}

// ── Cohort ────────────────────────────────────────────────────────────────────

export function useCohortData() {
  const { stats, isLoading } = useStatsData()

  const cohort = useMemo(
    () => generateMockCohort((stats?.averagePercent ?? 60) | 0, 600),
    [stats?.averagePercent],
  )

  const percentile = useMemo(
    () => calculateCohortPercentile(stats?.averagePercent ?? 0, cohort),
    [stats?.averagePercent, cohort],
  )

  // Deterministic rank numbers from seed
  const seed       = (stats?.averagePercent ?? 60) | 0
  const cityRank   = Math.max(1, Math.round(600 * (1 - percentile / 100)))
  const gradeRank  = Math.max(1, Math.round(cityRank * 0.4))
  const groupRank  = Math.max(1, Math.round(gradeRank * 0.2))

  return { percentile, cityRank, gradeRank, groupRank, cohort, isLoading }
}

// ── Learning Profile ──────────────────────────────────────────────────────────

export function useLearningProfile() {
  const { stats, isLoading } = useStatsData()

  const profile = useMemo((): LearningProfile => {
    if (!stats) return { optimalHour: 9, optimalSessionMins: 30, preferredDifficulty: 'medium', learningVelocity: 30, bestDayOfWeek: 1 }
    return extractLearningProfile(stats.recentSessions ?? [])
  }, [stats])

  return { profile, isLoading }
}

// ── Forgetting curve ──────────────────────────────────────────────────────────

export function useForgettingCurve(topicId: string) {
  const { spacedRepState } = useAnalyticsStore()
  const { items }          = useSpacedRepetition()

  const item      = items.find(i => i.topicId === topicId) ?? items[0]
  const stability = item ? Math.max(1, (item.retentionRate / 100) * 14) : 7
  const lastStudied = spacedRepState[topicId]?.lastReviewed ?? item?.lastStudied ?? Date.now() - 3 * 86_400_000

  const points = useMemo(
    () => generateForgettingPoints(lastStudied, stability, 30),
    [lastStudied, stability],
  )

  return { points, nextReview: item?.nextReview ?? Date.now() + 7 * 86_400_000 }
}

// ── Passport ──────────────────────────────────────────────────────────────────

export function usePassport() {
  const { stats, isLoading } = useStatsData()
  const passport = useMemo(() => stats ? generatePassportData(stats) : null, [stats])
  return { passport, isLoading }
}
