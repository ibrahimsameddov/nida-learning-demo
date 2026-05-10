import {
  doc, getDoc, setDoc, addDoc,
  collection, getDocs, query, orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'

const STATS_DEFAULTS = {
  totalTests:     0,
  averagePercent: 0,
  bestPercent:    0,
  streak:         0,
  currentStreak:  0,
  subjectStats:   [] as unknown[],
  weeklyProgress: [] as unknown[],
  dailyProgress:  [] as unknown[],
  recentSessions: [] as unknown[],
}

export async function dbGetStats(targetUid?: string) {
  const id = targetUid ?? uid()
  if (!id) return STATS_DEFAULTS

  const snap = await getDoc(doc(db, 'userProfiles', id, 'meta', 'stats'))
  if (!snap.exists()) return STATS_DEFAULTS

  const raw = snap.data()
  return {
    ...STATS_DEFAULTS,
    ...raw,
    subjectStats:   Array.isArray(raw.subjectStats)   ? raw.subjectStats   : [],
    weeklyProgress: Array.isArray(raw.weeklyProgress)  ? raw.weeklyProgress  : [],
    dailyProgress:  Array.isArray(raw.dailyProgress)   ? raw.dailyProgress   : [],
    recentSessions: Array.isArray(raw.recentSessions)  ? raw.recentSessions  : [],
  }
}

export async function dbGetResults(targetUid?: string) {
  const id = targetUid ?? uid()
  if (!id) return []

  const snap = await getDocs(
    query(collection(db, 'userProfiles', id, 'results'), orderBy('completedAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbSaveTestResult(result: {
  subject: string
  topicId?: string
  topicName?: string
  percent: number
  total: number
  correct: number
  wrong: number
  skipped: number
  timeSpent: number
  completedAt: string
}) {
  const currentUid = uid()
  if (!currentUid) {
    throw new Error('[DB] dbSaveTestResult: uid tapılmadı — Firestore-a yazılmır')
  }

  const statsRef  = doc(db, 'userProfiles', currentUid, 'meta', 'stats')
  const statsSnap = await getDoc(statsRef)
  const prev = statsSnap.exists() ? statsSnap.data() : {
    totalTests: 0, averagePercent: 0, bestPercent: 0,
    streak: 0, currentStreak: 0, subjectStats: [] as any[],
    weeklyProgress: [] as any[], dailyProgress: [] as any[], recentSessions: [] as any[],
  }

  const subjectStats = [...(prev.subjectStats ?? [])]
  const existing = subjectStats.find((s: any) => s.subject === result.subject)
  if (existing) {
    const n = existing.totalTests + 1
    existing.averagePercent = Math.round((existing.averagePercent * existing.totalTests + result.percent) / n)
    existing.totalTests = n
  } else {
    subjectStats.push({ subject: result.subject, averagePercent: result.percent, totalTests: 1 })
  }

  const totalTests = (prev.totalTests ?? 0) + 1
  const tSum = subjectStats.reduce((s: number, x: any) => s + x.totalTests, 0)
  const wSum = subjectStats.reduce((s: number, x: any) => s + x.averagePercent * x.totalTests, 0)
  const averagePercent = tSum > 0 ? Math.round((wSum / tSum) * 10) / 10 : 0
  const bestPercent = Math.max(prev.bestPercent ?? 0, result.percent)
  const today     = result.completedAt.slice(0, 10)
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  const lastDate  = (prev.lastActiveDate as string | undefined) ?? ''
  const streak    = lastDate === today      ? (prev.streak ?? 1)
                  : lastDate === yesterday  ? (prev.streak ?? 0) + 1
                  : 1

  const weekly = [...(prev.weeklyProgress ?? []), { date: result.completedAt, percentage: result.percent }].slice(-30)
  const daily  = [...(prev.dailyProgress  ?? []), { date: today,              percentage: result.percent }].slice(-30)
  const recent = [
    { subject: result.subject, accuracy: result.percent, totalQuestions: result.total, durationSeconds: result.timeSpent },
    ...(prev.recentSessions ?? []),
  ].slice(0, 10)

  await setDoc(statsRef, {
    totalTests, averagePercent, bestPercent, streak, currentStreak: streak,
    lastActiveDate: today,
    subjectStats, weeklyProgress: weekly, dailyProgress: daily, recentSessions: recent,
    updatedAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'userProfiles', currentUid, 'results'), {
    ...result, completedAt: result.completedAt, createdAt: serverTimestamp(),
  })
}
