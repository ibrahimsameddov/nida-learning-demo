import type { FirestoreStats, FirestoreResult, SubjectStat, RecentSession } from '../types/models'

// ── Exported types ────────────────────────────────────────────────────────────

export interface SpacedItem {
  topicId:      string
  topicName:    string
  subject:      string
  lastStudied:  number   // Unix ms
  retentionRate:number   // 0-100
  nextReview:   number   // Unix ms
  intervalDays: number
  easeFactor:   number   // SM-2, starts 2.5
  repetitions:  number
}

export interface SelfAssessment {
  sessionId:      string
  topicId:        string
  perceivedScore: number
  actualScore:    number
  delta:          number   // actualScore - perceivedScore
  completedAt:    number
}

export interface ERIBreakdown {
  bySubject:     Record<string, number>
  weakestArea:   string
  strongestArea: string
  projectedScore: number
  avgScore:      number
  trendScore:    number
  balanceScore:  number
  velocityScore: number
  streakScore:   number
}

export interface LearningProfile {
  optimalHour:         number   // 0-23
  optimalSessionMins:  number
  preferredDifficulty: 'easy' | 'medium' | 'hard'
  learningVelocity:    number   // questions/hour
  bestDayOfWeek:       number   // 0-6
}

export interface PassportData {
  totalTests:    number
  totalHours:    number
  avgScore:      number
  bestScore:     number
  longestStreak: number
  subjects:      Array<{ name: string; score: number; tests: number }>
  generatedAt:   number
}

export type CognitiveLoad = 'low' | 'medium' | 'high' | 'overload'

export interface GraphNode {
  id:           string
  topicName:    string
  subject:      string
  masteryLevel: number  // 0-100
  isWeak:       boolean
  x:            number
  y:            number
}

export interface GraphEdge {
  from:     string
  to:       string
  strength: number
}

// ── ERI (Exam Readiness Index) ────────────────────────────────────────────────

export function calculateERI(stats: FirestoreStats): { score: number; breakdown: ERIBreakdown } {
  // 1. Average score (30%)
  const avgScore = Math.min(100, stats.averagePercent ?? 0)

  // 2. 7-day trend (25%)
  const recent = (stats.dailyProgress ?? []).slice(-7)
  let trendScore = 50
  if (recent.length >= 2) {
    const slope = (recent[recent.length - 1].percentage - recent[0].percentage) / recent.length
    trendScore = Math.max(0, Math.min(100, 50 + slope * 5))
  }

  // 3. Subject balance (20%) — inverse of std dev across subjects
  const subjects = stats.subjectStats ?? []
  let balanceScore = 75
  if (subjects.length >= 2) {
    const scores = subjects.map(s => s.averagePercent)
    const mean   = scores.reduce((a, b) => a + b, 0) / scores.length
    const stdDev = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length)
    balanceScore = Math.max(0, Math.min(100, 100 - stdDev))
  }

  // 4. Learning velocity (15%) — tests per day, 5 tests/day = 100
  const daysActive    = Math.max(1, stats.dailyProgress?.length ?? 1)
  const testsPerDay   = (stats.totalTests ?? 0) / daysActive
  const velocityScore = Math.min(100, testsPerDay * 20)

  // 5. Streak (10%)
  const streak      = stats.currentStreak ?? stats.streak ?? 0
  const streakScore = Math.min(100, (streak / 30) * 100)

  const score = Math.round(
    avgScore      * 0.30 +
    trendScore    * 0.25 +
    balanceScore  * 0.20 +
    velocityScore * 0.15 +
    streakScore   * 0.10,
  )

  const bySubject: Record<string, number> = {}
  subjects.forEach(s => {
    bySubject[s.subject] = Math.round(s.averagePercent * 0.65 + Math.min(100, s.totalTests * 5) * 0.35)
  })

  const sorted    = subjects.slice().sort((a, b) => a.averagePercent - b.averagePercent)
  const weakest   = sorted[0]?.subject ?? '—'
  const strongest = sorted[sorted.length - 1]?.subject ?? '—'

  const proj = Math.round(Math.min(100, avgScore + trendScore * 0.15))

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      bySubject, weakestArea: weakest, strongestArea: strongest,
      projectedScore: proj,
      avgScore: Math.round(avgScore), trendScore: Math.round(trendScore),
      balanceScore: Math.round(balanceScore), velocityScore: Math.round(velocityScore),
      streakScore: Math.round(streakScore),
    },
  }
}

// ── Ebbinghaus forgetting curve: R = e^(-t/S) ────────────────────────────────

export function calculateRetentionRate(lastStudied: number, stabilityFactor: number): number {
  const t = (Date.now() - lastStudied) / 86_400_000
  return Math.max(0, Math.round(Math.exp(-t / Math.max(1, stabilityFactor)) * 100))
}

export function generateForgettingPoints(
  lastStudied: number,
  stability:   number,
  days = 30,
): Array<{ day: number; retention: number; label: string }> {
  return Array.from({ length: days + 1 }, (_, i) => {
    const t         = i
    const retention = Math.max(0, Math.round(Math.exp(-t / Math.max(1, stability)) * 100))
    const d         = new Date(lastStudied + i * 86_400_000)
    return { day: i, retention, label: `${d.getDate()}/${d.getMonth() + 1}` }
  })
}

// ── SM-2 spaced repetition ────────────────────────────────────────────────────

export function calculateNextInterval(
  prevInterval: number,
  easeFactor:   number,
  quality:      number,  // 0-5
): { interval: number; easeFactor: number } {
  if (quality < 3) {
    return { interval: 1, easeFactor: Math.max(1.3, easeFactor - 0.2) }
  }
  let interval: number
  if (prevInterval <= 0) interval = 1
  else if (prevInterval === 1) interval = 6
  else interval = Math.round(prevInterval * easeFactor)

  const newEF = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  )
  return { interval, easeFactor: newEF }
}

// ── Cognitive load (NASA-TLX simplified) ──────────────────────────────────────

export function calculateCognitiveLoad(
  timePerQ:       number,  // seconds
  errorRate:      number,  // 0-1
  hesitationRate: number,  // 0-1
): CognitiveLoad {
  const score = (timePerQ / 120) * 0.40 + errorRate * 0.35 + hesitationRate * 0.25
  if (score >= 0.80) return 'overload'
  if (score >= 0.55) return 'high'
  if (score >= 0.30) return 'medium'
  return 'low'
}

// ── Dunning-Kruger index ──────────────────────────────────────────────────────

export function calculateDKIndex(assessments: SelfAssessment[]): number {
  if (!assessments.length) return 0
  const sum = assessments.reduce((acc, a) => acc + (a.actualScore - a.perceivedScore) / 100, 0)
  return Math.max(-1, Math.min(1, sum / assessments.length))
}

// ── Learning profile ──────────────────────────────────────────────────────────

export function extractLearningProfile(sessions: RecentSession[]): LearningProfile {
  let bestScore = 0
  let optimalMins = 30

  sessions.forEach(s => {
    const mins = (s.durationSeconds ?? 0) / 60
    if (mins > 5 && mins < 90 && s.accuracy > bestScore) {
      bestScore    = s.accuracy
      optimalMins  = Math.round(mins)
    }
  })

  const totalQ = sessions.reduce((a, s) => a + (s.totalQuestions ?? 0), 0)
  const totalH = sessions.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / 3600
  const velocity = totalH > 0 ? Math.round(totalQ / totalH) : 30

  return {
    optimalHour:         9,
    optimalSessionMins:  Math.max(15, Math.min(60, optimalMins)),
    preferredDifficulty: 'medium',
    learningVelocity:    velocity,
    bestDayOfWeek:       1,
  }
}

// ── Cohort percentile ─────────────────────────────────────────────────────────

export function calculateCohortPercentile(userScore: number, cohortScores: number[]): number {
  if (!cohortScores.length) return 50
  const below = cohortScores.filter(s => s < userScore).length
  return Math.round((below / cohortScores.length) * 100)
}

// Deterministic LCG-seeded normal distribution (no actual randomness per render)
export function generateMockCohort(seed: number, size = 600): number[] {
  let s = Math.abs(seed | 0) || 12345
  const rand = () => {
    s = ((s * 1664525 + 1013904223) | 0) >>> 0
    return s / 0x100000000
  }
  const scores: number[] = []
  for (let i = 0; i < size; i++) {
    const u1  = Math.max(1e-10, rand())
    const u2  = rand()
    const z   = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    scores.push(Math.max(0, Math.min(100, Math.round(60 + z * 18))))
  }
  return scores
}

// ── Predictive score (exponential growth model) ───────────────────────────────

export function predictExamScore(
  eriScore:          number,
  daysToExam:        number,
  dailyTestsPlanned: number,
): number {
  const growthRate = 0.006 * Math.max(1, dailyTestsPlanned)
  const potential  = eriScore + (100 - eriScore) * (1 - Math.exp(-growthRate * daysToExam))
  return Math.round(Math.min(100, Math.max(eriScore, potential)))
}

// ── Derive spaced rep items from results ─────────────────────────────────────

export function deriveSpacedItems(
  subjectStats: SubjectStat[],
  results:      FirestoreResult[],
): SpacedItem[] {
  type Entry = { lastStudied: number; accuracy: number; subject: string; name: string }
  const map = new Map<string, Entry>()

  results.forEach(r => {
    const key = r.topicId ?? `${r.subject}:${r.subject}`
    const ts  = new Date(r.completedAt).getTime()
    const prev = map.get(key)
    if (!prev || ts > prev.lastStudied) {
      map.set(key, {
        lastStudied: ts,
        accuracy:    r.percent,
        subject:     r.subject,
        name:        r.topicName ?? r.subject,
      })
    }
  })

  // Supplement with subjects that have no individual results
  subjectStats.forEach(s => {
    if (![...map.values()].some(v => v.subject === s.subject)) {
      map.set(`subject:${s.subject}`, {
        lastStudied: Date.now() - 3 * 86_400_000,
        accuracy:    s.averagePercent,
        subject:     s.subject,
        name:        s.subject,
      })
    }
  })

  return Array.from(map.entries()).map(([topicId, info]) => {
    const stability    = Math.max(1, (info.accuracy / 100) * 14)
    const ef           = 1.3 + (info.accuracy / 100) * 1.2
    const retention    = calculateRetentionRate(info.lastStudied, stability)
    const intervalDays = Math.max(1, Math.round(stability * 0.7))
    const nextReview   = info.lastStudied + intervalDays * 86_400_000

    return { topicId, topicName: info.name, subject: info.subject, lastStudied: info.lastStudied, retentionRate: retention, nextReview, intervalDays, easeFactor: ef, repetitions: 1 }
  }).sort((a, b) => a.nextReview - b.nextReview)
}

// ── Knowledge graph from results ──────────────────────────────────────────────

export function buildKnowledgeGraph(
  subjectStats: SubjectStat[],
  results:      FirestoreResult[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const cx = 200, cy = 200

  // Subject nodes in a circle
  const subjectNodes: GraphNode[] = subjectStats.map((s, i) => {
    const angle = (2 * Math.PI * i / subjectStats.length) - Math.PI / 2
    return {
      id:           `sub:${s.subject}`,
      topicName:    s.subject,
      subject:      s.subject,
      masteryLevel: Math.round(s.averagePercent),
      isWeak:       s.averagePercent < 60,
      x:            cx + 120 * Math.cos(angle),
      y:            cy + 110 * Math.sin(angle),
    }
  })

  // Topic nodes derived from results, clustered around their subject
  const topicMap = new Map<string, { name: string; subject: string; pct: number; count: number }>()
  results.forEach(r => {
    const key  = r.topicId ?? `${r.subject}:${r.topicName}`
    const prev = topicMap.get(key)
    if (!prev) {
      topicMap.set(key, { name: r.topicName ?? r.subject, subject: r.subject, pct: r.percent, count: 1 })
    } else {
      prev.pct = Math.round((prev.pct * prev.count + r.percent) / (prev.count + 1))
      prev.count++
    }
  })

  const topicNodes: GraphNode[] = []
  const subjectGrouped = new Map<string, string[]>()

  Array.from(topicMap.entries()).forEach(([id, info]) => {
    const list = subjectGrouped.get(info.subject) ?? []
    list.push(id)
    subjectGrouped.set(info.subject, list)
  })

  subjectGrouped.forEach((ids, subjectName) => {
    const parentNode = subjectNodes.find(n => n.subject === subjectName)
    if (!parentNode) return
    ids.slice(0, 6).forEach((id, j) => {
      const info  = topicMap.get(id)!
      const angle = (2 * Math.PI * j / ids.length)
      topicNodes.push({
        id,
        topicName:    info.name,
        subject:      info.subject,
        masteryLevel: Math.round(info.pct),
        isWeak:       info.pct < 60,
        x:            parentNode.x + 55 * Math.cos(angle),
        y:            parentNode.y + 50 * Math.sin(angle),
      })
    })
  })

  // Edges: subject → its topics
  const edges: GraphEdge[] = []
  topicNodes.forEach(t => {
    const parent = subjectNodes.find(n => n.subject === t.subject)
    if (parent) edges.push({ from: parent.id, to: t.id, strength: t.masteryLevel / 100 })
  })

  // Cross-subject edges for subjects that share results
  for (let i = 0; i < subjectNodes.length - 1; i++) {
    for (let j = i + 1; j < subjectNodes.length; j++) {
      edges.push({ from: subjectNodes[i].id, to: subjectNodes[j].id, strength: 0.3 })
    }
  }

  return { nodes: [...subjectNodes, ...topicNodes], edges }
}

// ── Passport data ─────────────────────────────────────────────────────────────

export function generatePassportData(stats: FirestoreStats): PassportData {
  const totalSecs = (stats.recentSessions ?? []).reduce((a, s) => a + (s.durationSeconds ?? 0), 0)
  return {
    totalTests:    stats.totalTests    ?? 0,
    totalHours:    Math.round((totalSecs / 3600) * 10) / 10,
    avgScore:      stats.averagePercent ?? 0,
    bestScore:     stats.bestPercent    ?? 0,
    longestStreak: stats.streak         ?? 0,
    subjects:      (stats.subjectStats ?? []).map(s => ({ name: s.subject, score: s.averagePercent, tests: s.totalTests })),
    generatedAt:   Date.now(),
  }
}
