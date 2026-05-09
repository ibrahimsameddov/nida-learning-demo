// @ts-nocheck

// ── Shared types ──────────────────────────────────────────────────────────────

export type InterventionType   = 'low_score' | 'inactive' | 'group_weak' | 'streak_broken' | 'exam_approaching'
export type Priority           = 'critical' | 'important' | 'info'
export type InterventionStatus = 'pending' | 'actioned' | 'dismissed'
export type ActionType         = 'task_sent' | 'message_sent' | 'exam_created' | 'dismissed'
export type RiskLevel          = 'low' | 'medium' | 'high'

export interface AffectedStudent { uid: string; name: string }

export interface Intervention {
  id:               string
  teacherUid:       string
  groupId:          string
  type:             InterventionType
  priority:         Priority
  subject:          string
  topicId?:         string
  topicName?:       string
  triggerData: {
    consecutiveLowScores?: number
    scores?:               number[]
    threshold?:            number
    inactiveDays?:         number
    groupAverage?:         number
  }
  affectedStudents: AffectedStudent[]
  status:           InterventionStatus
  createdAt:        number
  actionedAt?:      number
  actionType?:      ActionType
}

export interface WeakTopic {
  topicId:           string
  topicName:         string
  subject:           string
  groupAverage:      number
  affectedStudents:  AffectedStudent[]
  consecutiveWeeks:  number
}

export interface InactiveStudent {
  studentUid:      string
  studentName:     string
  lastActiveDays:  number
  riskLevel:       RiskLevel
}

export interface WeeklyReportData {
  testsCompleted:     number
  avgScore:           number
  bestSubject:        string
  weakestSubject:     string
  improvementPercent: number
  streakStatus:       'maintained' | 'broken' | 'new_record'
  topicsStudied:      string[]
  timeSpentMinutes:   number
  milestoneAchieved?: string
}

export interface WeeklyReport {
  id:            string
  uid:           string
  parentUid:     string
  weekStart:     string
  weekEnd:       string
  generatedAt:   number
  data:          WeeklyReportData
  generatedText: string
  teacherNotes?: string
  isRead:        boolean
}

export interface LiveWatcher {
  sessionId:         string
  studentUid:        string
  watcherUids:       string[]
  allowedByStudent:  boolean
  startedAt:         number
  currentQuestion?:  number
  currentScore?:     number
  totalQuestions?:   number
  subject?:          string
  topicName?:        string
}

interface StudentData {
  uid:             string
  name:            string
  lastActiveDate?: string
  currentStreak:   number
  subjectStats:    Array<{ subject: string; averagePercent: number; totalTests: number }>
}

interface ResultData {
  subject:     string
  topicId?:    string
  topicName?:  string
  percent:     number
  completedAt: string
}

// ── Intervention detection ────────────────────────────────────────────────────

export function detectInterventions(
  students:    StudentData[],
  resultsMap:  Record<string, ResultData[]>,
  teacherUid:  string,
  groupId:     string,
): Intervention[] {
  const now           = Date.now()
  const interventions: Intervention[] = []

  // ── Trigger 1: 3+ consecutive scores < 40% on same topic ─────────────────
  const topicLow = new Map<string, {
    subject: string; topicName: string; scores: number[]; students: AffectedStudent[]
  }>()

  students.forEach(student => {
    const byTopic = new Map<string, ResultData[]>()
    ;(resultsMap[student.uid] ?? []).slice(0, 15).forEach(r => {
      const key = r.topicId ?? r.subject
      const arr = byTopic.get(key) ?? []
      arr.push(r)
      byTopic.set(key, arr)
    })
    byTopic.forEach((rs, key) => {
      const sorted = rs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      const lowRun = sorted.filter(r => r.percent < 40)
      if (lowRun.length >= 3) {
        const entry = topicLow.get(key) ?? {
          subject:   rs[0].subject,
          topicName: rs[0].topicName ?? key,
          scores:    lowRun.slice(0, 3).map(r => r.percent),
          students:  [],
        }
        entry.students.push({ uid: student.uid, name: student.name })
        topicLow.set(key, entry)
      }
    })
  })

  topicLow.forEach((data, topicKey) => {
    interventions.push({
      id:       `low_${topicKey}_${now}`,
      teacherUid, groupId,
      type:     'low_score',
      priority: data.students.length >= 3 ? 'critical' : 'important',
      subject:  data.subject,
      topicId:  topicKey,
      topicName: data.topicName,
      triggerData: { consecutiveLowScores: 3, scores: data.scores, threshold: 40 },
      affectedStudents: data.students,
      status:   'pending',
      createdAt: now,
    })
  })

  // ── Trigger 2: 3+ days inactive ───────────────────────────────────────────
  const inactiveList: AffectedStudent[] = []
  students.forEach(s => {
    const days = s.lastActiveDate
      ? Math.round((now - new Date(s.lastActiveDate).getTime()) / 86_400_000)
      : 999
    if (days >= 3) inactiveList.push({ uid: s.uid, name: s.name })
  })
  if (inactiveList.length) {
    interventions.push({
      id: `inactive_${now}`, teacherUid, groupId,
      type: 'inactive',
      priority: inactiveList.length >= 3 ? 'critical' : 'important',
      subject: '',
      triggerData: { inactiveDays: 3 },
      affectedStudents: inactiveList,
      status: 'pending',
      createdAt: now,
    })
  }

  // ── Trigger 3: Group average < 50% on a topic ─────────────────────────────
  const groupTopicMap = new Map<string, { subject: string; name: string; avgs: number[]; students: AffectedStudent[] }>()
  students.forEach(s => {
    const byTopic = new Map<string, number[]>()
    ;(resultsMap[s.uid] ?? []).slice(0, 20).forEach(r => {
      const key = r.topicId ?? r.subject
      const arr = byTopic.get(key) ?? []
      arr.push(r.percent)
      byTopic.set(key, arr)
    })
    byTopic.forEach((scores, key) => {
      const avg   = scores.reduce((a, b) => a + b, 0) / scores.length
      const entry = groupTopicMap.get(key) ?? {
        subject:  (resultsMap[s.uid] ?? []).find(r => (r.topicId ?? r.subject) === key)?.subject ?? '',
        name:     (resultsMap[s.uid] ?? []).find(r => (r.topicId ?? r.subject) === key)?.topicName ?? key,
        avgs: [], students: [],
      }
      entry.avgs.push(avg)
      entry.students.push({ uid: s.uid, name: s.name })
      groupTopicMap.set(key, entry)
    })
  })

  groupTopicMap.forEach((data, key) => {
    if (data.students.length < 2) return
    const gAvg = data.avgs.reduce((a, b) => a + b, 0) / data.avgs.length
    if (gAvg < 50) {
      interventions.push({
        id: `group_weak_${key}_${now}`, teacherUid, groupId,
        type: 'group_weak',
        priority: gAvg < 35 ? 'critical' : 'important',
        subject: data.subject, topicId: key, topicName: data.name,
        triggerData: { groupAverage: Math.round(gAvg), threshold: 50 },
        affectedStudents: data.students,
        status: 'pending', createdAt: now,
      })
    }
  })

  // ── Trigger 4: Streak broken (streak = 0) ────────────────────────────────
  const streakBroken = students.filter(s => s.currentStreak === 0)
  if (streakBroken.length >= 2) {
    interventions.push({
      id: `streak_${now}`, teacherUid, groupId,
      type: 'streak_broken', priority: 'info', subject: '',
      triggerData: {},
      affectedStudents: streakBroken.map(s => ({ uid: s.uid, name: s.name })),
      status: 'pending', createdAt: now,
    })
  }

  return interventions
}

// ── Weak topics ───────────────────────────────────────────────────────────────

export function detectWeakTopics(
  resultsMap:   Record<string, ResultData[]>,
  studentNames: Record<string, string>,
  threshold = 50,
): WeakTopic[] {
  const map = new Map<string, { subject: string; name: string; avgs: Array<{ uid: string; avg: number }> }>()

  Object.entries(resultsMap).forEach(([uid, results]) => {
    const byTopic = new Map<string, ResultData[]>()
    results.forEach(r => {
      const key = r.topicId ?? r.subject
      const arr = byTopic.get(key) ?? []
      arr.push(r)
      byTopic.set(key, arr)
    })
    byTopic.forEach((rs, key) => {
      const avg   = rs.reduce((a, r) => a + r.percent, 0) / rs.length
      const entry = map.get(key) ?? { subject: rs[0].subject, name: rs[0].topicName ?? key, avgs: [] }
      entry.avgs.push({ uid, avg })
      map.set(key, entry)
    })
  })

  return Array.from(map.entries())
    .filter(([, data]) => data.avgs.length >= 2)
    .map(([key, data]) => {
      const gAvg     = data.avgs.reduce((a, s) => a + s.avg, 0) / data.avgs.length
      const affected = data.avgs.filter(s => s.avg < threshold)
      return {
        topicId:          key,
        topicName:        data.name,
        subject:          data.subject,
        groupAverage:     Math.round(gAvg),
        affectedStudents: affected.map(s => ({ uid: s.uid, name: studentNames[s.uid] ?? s.uid })),
        consecutiveWeeks: 1,
      }
    })
    .filter(t => t.groupAverage < threshold)
    .sort((a, b) => a.groupAverage - b.groupAverage)
}

// ── Activity patterns ─────────────────────────────────────────────────────────

export function analyzeActivityPatterns(students: StudentData[]): InactiveStudent[] {
  const now = Date.now()
  return students
    .map(s => {
      const days = s.lastActiveDate
        ? Math.round((now - new Date(s.lastActiveDate).getTime()) / 86_400_000)
        : 999
      return {
        studentUid:     s.uid,
        studentName:    s.name,
        lastActiveDays: days,
        riskLevel:      (days >= 5 ? 'high' : days >= 3 ? 'medium' : 'low') as RiskLevel,
      }
    })
    .filter(s => s.lastActiveDays >= 1)
    .sort((a, b) => b.lastActiveDays - a.lastActiveDays)
}

// ── Weekly report text (template-based, no external API) ─────────────────────

export function generateWeeklyReportText(
  data:        WeeklyReportData,
  studentName: string,
): string {
  const first = studentName.split(' ')[0]

  if (!data.testsCompleted) {
    return `${first} bu həftə heç bir test həll etmədi. Fəal olmağı gözlənilir.`
  }

  let text = `${first} bu həftə ${data.testsCompleted} test həll etdi. `

  if (data.bestSubject) {
    if (data.improvementPercent > 15)       text += `${data.bestSubject} fənnindəki əla irəliləyiş diqqəti cəlb edir. `
    else if (data.improvementPercent >= 5)  text += `${data.bestSubject} fənnindəki sabit irəliləyiş davam edir. `
    else if (data.improvementPercent < 0)   text += `${data.bestSubject} fənnindəki nəticələrə diqqət tələb olunur. `
    else                                     text += `${data.bestSubject} fənnindəki nəticələr sabit qalır. `
  }

  if (data.weakestSubject && data.weakestSubject !== data.bestSubject) {
    text += `${data.weakestSubject} fənnindəki nəticələrin yaxşılaşdırılmasını tövsiyə edirik. `
  }

  if (data.timeSpentMinutes >= 120) {
    text += `Bu həftə ${Math.round(data.timeSpentMinutes / 60)} saatdan çox öyrəndi. `
  }

  if (data.streakStatus === 'new_record')  text += `Yeni ardıcıllıq rekoru qırdı! 🎯 `
  else if (data.streakStatus === 'broken') text += `Bu həftə ardıcıl öyrənmə seriyası qırıldı. `
  else if (data.streakStatus === 'maintained') text += `Ardıcıl öyrənmə seriyasını saxladı. `

  if (data.milestoneAchieved) text += `"${data.milestoneAchieved}" nailiyyəti qazanıldı — təbrik edin! 🎉`

  return text.trim()
}

// ── Group ERI ─────────────────────────────────────────────────────────────────

export function computeGroupERI(
  allSubjectStats: Array<Array<{ subject: string; averagePercent: number; totalTests: number }>>,
): number {
  const flat = allSubjectStats.flat()
  if (!flat.length) return 0
  const totalTests = flat.reduce((a, s) => a + s.totalTests, 0)
  const weighted   = flat.reduce((a, s) => a + s.averagePercent * s.totalTests, 0)
  return Math.round(Math.max(0, Math.min(100, totalTests > 0 ? weighted / totalTests : 0)))
}

// ── Generate weekly report data from stats ────────────────────────────────────

export function buildWeeklyReportData(
  stats:       any,
  prevAvg:     number,
  badgeEarned?: string,
): WeeklyReportData {
  const subjects   = stats.subjectStats ?? []
  const best       = subjects.slice().sort((a: any, b: any) => b.averagePercent - a.averagePercent)[0]
  const weakest    = subjects.slice().sort((a: any, b: any) => a.averagePercent - b.averagePercent)[0]
  const totalSecs  = (stats.recentSessions ?? []).reduce((a: number, s: any) => a + (s.durationSeconds ?? 0), 0)

  const improvement = prevAvg > 0 ? Math.round(((stats.averagePercent ?? 0) - prevAvg) / prevAvg * 100) : 0
  const streak      = stats.currentStreak ?? 0
  const longestStr  = stats.streak ?? 0

  return {
    testsCompleted:     stats.totalTests ?? 0,
    avgScore:           stats.averagePercent ?? 0,
    bestSubject:        best?.subject ?? '',
    weakestSubject:     weakest?.subject ?? '',
    improvementPercent: improvement,
    streakStatus:       streak > longestStr ? 'new_record' : streak > 0 ? 'maintained' : 'broken',
    topicsStudied:      [...new Set((stats.recentSessions ?? []).map((s: any) => s.subject))],
    timeSpentMinutes:   Math.round(totalSecs / 60),
    milestoneAchieved:  badgeEarned,
  }
}
