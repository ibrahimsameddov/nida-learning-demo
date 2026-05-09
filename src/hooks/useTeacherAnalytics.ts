// @ts-nocheck
import { useMemo } from 'react'

function lcg(s: number) { return (((1664525 * (s >>> 0) + 1013904223) >>> 0) / 4294967296) }
function strSeed(str: string) { return [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0 }

export const MATH_TOPICS = [
  { key: 'algebra',     name: 'Cəbr',          icon: '🔢' },
  { key: 'geometry',    name: 'Həndəsə',        icon: '📐' },
  { key: 'trig',        name: 'Triqonometriya', icon: '〰️' },
  { key: 'functions',   name: 'Funksiyalar',    icon: '📈' },
  { key: 'probability', name: 'Ehtimal',         icon: '🎲' },
  { key: 'logarithms',  name: 'Loqarifmlər',   icon: '📊' },
]

const STUDENT_NAMES = [
  'Əli H.', 'Nigar M.', 'Rauf C.', 'Leyla S.', 'Fərid A.',
  'Günel T.', 'Murad K.', 'Sevinc O.', 'Tural İ.', 'Aynur B.',
  'Rəşad N.', 'Zəhra Q.', 'Emil P.', 'Könül V.', 'Kənan L.',
]

const TOPIC_NOTES = [
  'Binom teorem ən çətin mövzudur',
  'Bu dövrdə əhəmiyyətli irəliləyiş var',
  'Tənliklər bölməsindən çoxu keçmir',
  'Mürəkkəb funksiyalar çətin gəlir',
  'Kombinatorika bölməsi yaxşılaşıb',
  'Hesablama səhvləri hələ çoxdur',
]

export type Period = 'week' | 'month' | 'year'

// ── Topic averages ─────────────────────────────────────────────────────────────

export function useTopicAverages(period: Period, groupId: string) {
  const seed = strSeed(period + groupId)

  const topics = useMemo(() => MATH_TOPICS.map((t, i) => {
    const s    = seed * 3 + i * 17
    const avg  = Math.round(35 + lcg(s) * 55)
    const prev = Math.round(35 + lcg(s + 1) * 55)
    const trend = avg - prev
    const weak  = Math.round(lcg(s + 2) * 9)
    const total = 14
    return {
      ...t,
      avg,
      trend,
      weak,
      note: TOPIC_NOTES[i % TOPIC_NOTES.length],
      dist: [
        { range: '90–100%', count: Math.round(Math.max(0, (total - weak) * 0.3)), c: '#30D158' },
        { range: '70–89%',  count: Math.round(Math.max(0, (total - weak) * 0.5)), c: '#34C759' },
        { range: '50–69%',  count: Math.round(Math.max(0, weak * 0.4)),           c: '#FF9F0A' },
        { range: '0–49%',   count: Math.round(Math.max(0, weak * 0.6)),           c: '#FF453A' },
      ],
    }
  }), [seed])

  return { topics }
}

// ── Heatmap data ───────────────────────────────────────────────────────────────

export function useHeatmapData(groupId: string) {
  const seed = strSeed(groupId || 'default')

  const students = useMemo(() => {
    const count = Math.round(8 + lcg(seed + 1) * 6)
    return STUDENT_NAMES.slice(0, count).map((name, si) => ({
      name,
      uid: `uid-${si}`,
      scores: MATH_TOPICS.map((t, ti) => ({
        topic: t.key,
        score: Math.round(lcg(seed * 7 + si * 13 + ti * 3) * 88 + 12),
      })),
    }))
  }, [seed])

  return { students, topics: MATH_TOPICS }
}

// ── Student detail ─────────────────────────────────────────────────────────────

export function useStudentDetail(name: string, uid?: string) {
  const seed = strSeed(name + (uid ?? ''))

  return useMemo(() => {
    const eri      = Math.round(42 + lcg(seed) * 50)
    const streak   = Math.round(lcg(seed + 1) * 14)
    const total    = Math.round(12 + lcg(seed + 2) * 38)
    const avgScore = Math.round(40 + lcg(seed + 3) * 46)

    const topicScores = MATH_TOPICS.map((t, i) => ({
      ...t,
      score: Math.round(30 + lcg(seed * 7 + i * 13) * 60),
    }))

    const recentResults = Array.from({ length: 7 }, (_, i) => ({
      score: Math.round(33 + lcg(seed * 3 + i * 11) * 58),
      label: MATH_TOPICS[i % MATH_TOPICS.length].name.slice(0, 5),
    }))

    return { eri, streak, total, avgScore, topicScores, recentResults }
  }, [seed])
}

// ── Activity data ──────────────────────────────────────────────────────────────

export function useActivityData(period: Period, groupId: string) {
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 3600 * 1000))
  const seed     = weekSeed * 3 + strSeed(groupId || 'default')

  return useMemo(() => {
    const labels   = ['B.e', 'Ç.a', 'Çər', 'Cü.a', 'Cüm', 'Şn.', 'Baz']
    const dayOfWeek = new Date().getDay()
    const todayIdx  = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    const days = labels.map((label, i) => ({
      label,
      count:    i <= todayIdx ? Math.round(lcg(seed + i) * 58 + 5) : 0,
      isToday:  i === todayIdx,
      isFuture: i > todayIdx,
      peakHour: `${Math.round(14 + lcg(seed + i * 2) * 4)}:00`,
      topTopic: MATH_TOPICS[Math.floor(lcg(seed + i * 3) * MATH_TOPICS.length)].name,
    }))

    const total = days.reduce((s, d) => s + d.count, 0)
    return { days, total }
  }, [seed, period, groupId])
}

// ── Exam readiness ─────────────────────────────────────────────────────────────

export function useExamReadiness(groupId: string) {
  const seed = strSeed(groupId || 'default')

  return useMemo(() => [
    { id: 'e1', name: 'Rüblük İmtahan',  daysLeft: 5,  totalStudents: 14 },
    { id: 'e2', name: 'Cəbr Yoxlaması',   daysLeft: 12, totalStudents: 14 },
    { id: 'e3', name: 'Həndəsə Testi',    daysLeft: 19, totalStudents: 14 },
  ].map((exam, ei) => {
    const readyCount  = Math.round(lcg(seed + ei * 5) * exam.totalStudents)
    const atRiskCount = exam.totalStudents - readyCount
    const students    = STUDENT_NAMES.slice(0, exam.totalStudents).map((name, si) => ({
      name,
      readiness: Math.round(lcg(seed * 3 + ei * 7 + si * 11) * 88 + 12),
    })).sort((a, b) => a.readiness - b.readiness)
    return { ...exam, readyCount, atRiskCount, students }
  }), [seed])
}
