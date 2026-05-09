import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db, auth } from './firebaseConfig'
import { useAuthStore } from '../stores/authStore'

// authStore localStorage-dan anında gəlir — Firebase async restore-u gözləmir
const uid = () => useAuthStore.getState().user?.id ?? auth.currentUser?.uid ?? ''


// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_PREFIX: Record<string, string> = {
  teacher: 'MÜE',
  student: 'ŞAG',
  parent:  'VAL',
}

export function generateUniqueId(role: string): string {
  const prefix = ROLE_PREFIX[role.toLowerCase()] ?? 'USR'
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${prefix}-${suffix}`
}

function tsToIso(ts: any): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return String(ts)
}

// ─── Public search index (hamı oxuya bilər) ───────────────────────────────────
// userProfiles-a cross-user sorğu rules tərəfindən bloklanır.
// publicProfiles hər user tərəfindən özü yazılır, hamı oxuya bilər.

export async function dbSyncPublicProfile(data: Record<string, any>, currentUid: string) {
  if (!currentUid) return
  const pub: Record<string, any> = { uid: currentUid, updatedAt: serverTimestamp() }
  if (data.fullName)  pub.fullName  = data.fullName
  if (data.email)     pub.email     = (data.email as string).toLowerCase().trim()
  if (data.uniqueId)  pub.uniqueId  = data.uniqueId
  if (data.role)      pub.role      = data.role
  await setDoc(doc(db, 'publicProfiles', currentUid), pub, { merge: true })
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function dbGetProfile() {
  const snap = await getDoc(doc(db, 'userProfiles', uid()))
  if (!snap.exists()) return null
  return { ...snap.data(), id: snap.id }
}

export async function dbSaveProfile(data: Record<string, any>) {
  const currentUid = uid()
  await setDoc(doc(db, 'userProfiles', currentUid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
  await dbSyncPublicProfile(data, currentUid).catch(() => {})
  return data
}

// ─── Statistics ───────────────────────────────────────────────────────────────

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

  // subject stats
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


// ─── Notifications ────────────────────────────────────────────────────────────

export async function dbGetNotifications() {
  const snap = await getDocs(
    query(collection(db, 'userProfiles', uid(), 'notifications'), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

export async function dbMarkNotificationRead(id: string) {
  await updateDoc(doc(db, 'userProfiles', uid(), 'notifications', id), { read: true })
}

export async function dbMarkAllNotificationsRead() {
  const snap = await getDocs(collection(db, 'userProfiles', uid(), 'notifications'))
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })))
}

// ─── Groups (Teacher) ─────────────────────────────────────────────────────────

export async function dbGetMyGroups() {
  const snap = await getDocs(
    query(collection(db, 'groups'), where('teacherUid', '==', uid()))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbGetProfileByUid(targetUid: string) {
  const snap = await getDoc(doc(db, 'userProfiles', targetUid))
  if (!snap.exists()) return null
  return { ...snap.data(), id: snap.id }
}

export async function dbGetProfilesByUids(uids: string[]) {
  if (!uids.length) return []
  const results = await Promise.all(uids.map(u => dbGetProfileByUid(u)))
  return results.filter(Boolean)
}

export async function dbGetUserByUniqueId(uniqueId: string) {
  const snap = await getDocs(query(collection(db, 'publicProfiles'), where('uniqueId', '==', uniqueId.trim())))
  if (snap.empty) return null
  const pub = snap.docs[0]
  // tam profili userProfiles-dan gətir
  const fullSnap = await getDoc(doc(db, 'userProfiles', pub.id)).catch(() => null)
  const full = fullSnap?.exists() ? fullSnap.data() : {}
  return { ...full, ...pub.data(), id: pub.id }
}

export async function dbGetUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim()
  const snap = await getDocs(query(collection(db, 'publicProfiles'), where('email', '==', normalized)))
  if (snap.empty) return null
  const pub = snap.docs[0]
  const fullSnap = await getDoc(doc(db, 'userProfiles', pub.id)).catch(() => null)
  const full = fullSnap?.exists() ? fullSnap.data() : {}
  return { ...full, ...pub.data(), id: pub.id }
}

// ASCII prefix → Azerbaijani equivalent (e.g. SAG → ŞAG)
const ASCII_TO_AZ: Record<string, string> = { SAG: 'ŞAG', MUE: 'MÜE', VAL: 'VAL' }

export async function dbSearchUser(queryStr: string) {
  const q = queryStr.trim()
  if (!q) return null
  if (q.includes('@')) return dbGetUserByEmail(q)

  // 1. Exact match
  const exact = await dbGetUserByUniqueId(q)
  if (exact) return exact

  // 2. Uppercase variant
  const upper = q.toUpperCase()
  if (upper !== q) {
    const byUpper = await dbGetUserByUniqueId(upper)
    if (byUpper) return byUpper
  }

  // 3. ASCII prefix → Azerbaijani prefix  (SAG-XXXXX → ŞAG-XXXXX)
  const dash = upper.indexOf('-')
  if (dash > 0) {
    const asciiPrefix = upper.slice(0, dash)
    const suffix      = upper.slice(dash)
    const azPrefix    = ASCII_TO_AZ[asciiPrefix]
    if (azPrefix) {
      const candidate = `${azPrefix}${suffix}`
      if (candidate !== q && candidate !== upper) {
        const byAz = await dbGetUserByUniqueId(candidate)
        if (byAz) return byAz
      }
    }
  }

  // 4. Firebase UID fallback
  const byUid = await dbGetProfileByUid(q).catch(() => null)
  if (byUid) return { ...byUid, id: q }

  return null
}

export async function dbCreateGroup(name: string, subject: string, maxSize: number, grade?: number) {
  const ref = await addDoc(collection(db, 'groups'), {
    teacherUid: uid(), name, subject, maxSize,
    grade: grade ?? null,
    studentUids: [], createdAt: serverTimestamp(),
  })
  return { id: ref.id, name, subject, maxSize, grade: grade ?? null, studentUids: [] }
}

export async function dbAddStudentToGroup(groupId: string, studentUid: string) {
  const groupRef  = doc(db, 'groups', groupId)
  const groupSnap = await getDoc(groupRef)
  if (!groupSnap.exists()) throw new Error('Qrup tapılmadı')
  const current: string[] = (groupSnap.data() as any).studentUids ?? []
  if (!current.includes(studentUid)) {
    await updateDoc(groupRef, { studentUids: [...current, studentUid] })
  }
  return { success: true }
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function dbGetIncomingPermissions() {
  const snap = await getDocs(
    query(collection(db, 'permissions'), where('studentUid', '==', uid()))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbGetSentPermissions() {
  const snap = await getDocs(
    query(collection(db, 'permissions'), where('teacherUid', '==', uid()))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbSendPermission(receiverUniqueId: string, subject: string, studentUid?: string) {
  const teacherUid = uid()
  const ref = await addDoc(collection(db, 'permissions'), {
    teacherUid,
    receiverUniqueId,
    studentUid: studentUid ?? '',
    subject,
    status: 'pending',
    createdAt: serverTimestamp(),
  })

  // When a query is sent to a student, auto-notify their connected parents
  if (studentUid) {
    try {
      const parentSnap = await getDocs(
        query(collection(db, 'parentRequests'), where('childUid', '==', studentUid), where('status', '==', 'accepted'))
      )
      const parentUids = [...new Set(parentSnap.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
      if (parentUids.length) {
        const [teacherProfile, studentProfile] = await Promise.all([
          dbGetProfile().catch(() => null),
          dbGetProfileByUid(studentUid).catch(() => null),
        ])
        const teacherName = (teacherProfile as any)?.fullName ?? 'Müəllim'
        const studentName = (studentProfile as any)?.fullName ?? 'şagird'
        await Promise.all(parentUids.map(pUid =>
          dbWriteNotification(pUid, {
            title: '📨 Müəllim Sorğusu',
            body:  `${teacherName} (${subject}) — ${studentName} ilə əlaqə qurmaq üçün sorğu göndərdi.`,
            type:  'teacher_query',
            data:  { teacherUid, studentUid, subject, permissionId: ref.id },
          }).catch(() => {})
        ))
      }
    } catch { /* silent */ }
  }

  return { id: ref.id }
}

export async function dbRespondPermission(permId: string, approved: boolean) {
  const permSnap = await getDoc(doc(db, 'permissions', permId))
  await updateDoc(doc(db, 'permissions', permId), {
    status: approved ? 'granted' : 'rejected', respondedAt: serverTimestamp(),
  })
  // Auto-notify connected parents when permission is granted
  if (approved && permSnap.exists()) {
    const perm = permSnap.data() as any
    if (perm.studentUid) {
      // Find parent of this student
      const parentSnap = await getDocs(
        query(collection(db, 'parentRequests'), where('childUid', '==', perm.studentUid), where('status', '==', 'accepted'))
      )
      const parentUids = [...new Set(parentSnap.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
      const studentProfile = await dbGetProfileByUid(perm.studentUid).catch(() => null)
      const studentName = (studentProfile as any)?.fullName ?? 'şagird'
      await Promise.all(parentUids.map(pUid =>
        dbWriteNotification(pUid, {
          title: '🔗 Müəllim Bağlantısı',
          body:  `Müəllim "${perm.subject}" fənnindən ${studentName} hesabına giriş hüququ qazandı.`,
          type:  'teacher_link',
          data:  { teacherUid: perm.teacherUid, studentUid: perm.studentUid, subject: perm.subject },
        }).catch(() => {})
      ))
    }
  }
  return { success: true }
}

export async function dbRevokePermission(permId: string) {
  await updateDoc(doc(db, 'permissions', permId), { status: 'revoked' })
  return { success: true }
}

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function dbGetMyExams() {
  const snap = await getDocs(
    query(collection(db, 'exams'), where('teacherUid', '==', uid()))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbCreateExam(data: any) {
  const ref = await addDoc(collection(db, 'exams'), {
    ...data, teacherUid: uid(), status: 'waiting', createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data }
}

export async function dbActivateExam(examId: string) {
  await updateDoc(doc(db, 'exams', examId), { status: 'active' })
  return { success: true }
}

// ─── Notification helpers (internal) ─────────────────────────────────────────

async function dbWriteNotification(targetUid: string, notif: { title: string; body: string; type: string; data?: any }) {
  await addDoc(collection(db, 'userProfiles', targetUid, 'notifications'), {
    ...notif, read: false, createdAt: serverTimestamp(),
  })
}

async function dbNotifyGroup(groupId: string, notif: { title: string; body: string; type: string; data?: any }) {
  const groupSnap = await getDoc(doc(db, 'groups', groupId))
  if (!groupSnap.exists()) return
  const studentUids: string[] = (groupSnap.data() as any).studentUids ?? []
  if (!studentUids.length) return
  await Promise.all(studentUids.map(sUid => dbWriteNotification(sUid, notif).catch(() => {})))
  // Also notify connected parents
  if (studentUids.length > 0) {
    const parentSnap = await getDocs(query(
      collection(db, 'parentRequests'),
      where('childUid', 'in', studentUids.slice(0, 30)),
      where('status', '==', 'accepted')
    ))
    const parentUids = [...new Set(parentSnap.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
    await Promise.all(parentUids.map(pUid => dbWriteNotification(pUid, { ...notif, body: `(Uşağınız) ${notif.body}` }).catch(() => {})))
  }
}

// ─── Homeworks ────────────────────────────────────────────────────────────────

export async function dbCreateHomework(data: {
  groupId:      string
  topicId:      string
  topicTitle:   string
  subject:      string
  repeatLimit:  number
  dueDate?:     string
}) {
  const teacherUid = uid()
  const ref = await addDoc(collection(db, 'homeworks'), {
    ...data, teacherUid, createdAt: serverTimestamp(),
  })
  await dbNotifyGroup(data.groupId, {
    title: '📖 Yeni Ev Tapşırığı',
    body:  `"${data.topicTitle}" mövzusu üzrə ev tapşırığı verildi.${data.dueDate ? ' Son tarix: ' + new Date(data.dueDate).toLocaleDateString('az-AZ') : ''}`,
    type:  'homework',
    data:  { homeworkId: ref.id, groupId: data.groupId },
  }).catch(() => {})
  return { id: ref.id, ...data, teacherUid }
}

export async function dbGetTeacherHomeworks() {
  const snap = await getDocs(
    query(collection(db, 'homeworks'), where('teacherUid', '==', uid()), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbGetGroupHomeworks(groupId: string) {
  const snap = await getDocs(
    query(collection(db, 'homeworks'), where('groupId', '==', groupId))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbSaveHomeworkAttempt(data: {
  homeworkId:    string
  groupId:       string
  topicId:       string
  attemptNumber: number
  percent:       number
  correct:       number
  total:         number
  wrongQuestions: { id: string; question: string; correctAnswer: string; studentAnswer: string }[]
  completedAt:   string
}) {
  const studentUid = uid()
  const ref = await addDoc(collection(db, 'homeworkAttempts'), {
    ...data, studentUid, createdAt: serverTimestamp(),
  })
  // Late submission check: if homework has a dueDate, notify teacher
  try {
    const hwSnap = await getDoc(doc(db, 'homeworks', data.homeworkId))
    if (hwSnap.exists()) {
      const hw = hwSnap.data() as any
      if (hw.dueDate && new Date(data.completedAt) > new Date(hw.dueDate)) {
        const profile = await dbGetProfile()
        await dbWriteNotification(hw.teacherUid, {
          title: '⏰ Gecikmiş Ev Tapşırığı',
          body:  `Şagird "${hw.topicTitle}" tapşırığını son tarixdən sonra tamamladı. (${data.percent}%)`,
          type:  'homework_late',
          data:  { homeworkId: data.homeworkId, studentUid, studentName: (profile as any)?.fullName ?? '' },
        })
      }
    }
  } catch { /* silent */ }
  return { id: ref.id }
}

export async function dbGetHomeworkAttempts(homeworkId: string) {
  const snap = await getDocs(
    query(collection(db, 'homeworkAttempts'), where('homeworkId', '==', homeworkId), orderBy('createdAt', 'asc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbGetMyHomeworkAttempts(homeworkId: string) {
  const snap = await getDocs(
    query(
      collection(db, 'homeworkAttempts'),
      where('homeworkId', '==', homeworkId),
      where('studentUid', '==', uid()),
    )
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Parent–Child connections ─────────────────────────────────────────────────

export async function dbSendParentRequest(childUid: string, childUniqueId: string) {
  const existing = await getDocs(
    query(collection(db, 'parentRequests'),
      where('parentUid', '==', uid()),
      where('childUid',  '==', childUid)
    )
  )
  if (!existing.empty) {
    const d = existing.docs[0].data()
    if (d.status === 'pending')  throw new Error('pending')
    if (d.status === 'accepted') throw new Error('accepted')
    await updateDoc(existing.docs[0].ref, { status: 'pending', createdAt: serverTimestamp() })
    return { id: existing.docs[0].id }
  }
  const profile = await dbGetProfile()
  const parentName = ((profile as any)?.fullName as string) || 'Valideyn'
  const ref = await addDoc(collection(db, 'parentRequests'), {
    parentUid:      uid(),
    parentName,
    parentUniqueId: ((profile as any)?.uniqueId as string) || '',
    childUid,
    childUniqueId,
    status:    'pending',
    createdAt: serverTimestamp(),
  })
  // Notify the student so they know to approve/reject
  await dbWriteNotification(childUid, {
    title: '👨‍👩‍👧 Valideyn Sorğusu',
    body:  `${parentName} sizi övlad kimi əlavə etmək istəyir. Qəbul etmək üçün profil səhifənizi yoxlayın.`,
    type:  'parent_request',
    data:  { parentUid: uid(), requestId: ref.id },
  }).catch(() => {})
  return { id: ref.id }
}

export async function dbGetParentRequests() {
  const snap = await getDocs(
    query(collection(db, 'parentRequests'), where('parentUid', '==', uid()), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbGetIncomingParentRequests() {
  const snap = await getDocs(
    query(collection(db, 'parentRequests'), where('childUid', '==', uid()), where('status', '==', 'pending'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbRespondParentRequest(requestId: string, accepted: boolean) {
  await updateDoc(doc(db, 'parentRequests', requestId), {
    status:      accepted ? 'accepted' : 'rejected',
    respondedAt: serverTimestamp(),
  })
  return { success: true }
}

export async function dbGetMyChildren() {
  const snap = await getDocs(
    query(collection(db, 'parentRequests'),
      where('parentUid', '==', uid()),
      where('status',    '==', 'accepted')
    )
  )
  if (snap.empty) return []
  const childUids = snap.docs.map(d => (d.data() as any).childUid as string)
  const [profiles, statsList] = await Promise.all([
    Promise.all(childUids.map(u => dbGetProfileByUid(u).catch(() => null))),
    Promise.all(childUids.map(u => dbGetStats(u).catch(() => ({} as any)))),
  ])
  return childUids
    .map((_, i) => profiles[i] ? { ...profiles[i], stats: statsList[i] ?? {} } : null)
    .filter(Boolean)
}

export async function dbDisconnectChild(childUid: string) {
  const snap = await getDocs(
    query(collection(db, 'parentRequests'),
      where('parentUid', '==', uid()),
      where('childUid',  '==', childUid)
    )
  )
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { status: 'revoked' })))
  return { success: true }
}

// ─── Teacher Messages ─────────────────────────────────────────────────────────

export async function dbGetSentMessages() {
  const snap = await getDocs(
    query(collection(db, 'userProfiles', uid(), 'sent'), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbSendMessage(data: {
  to: string; toLabel: string; mode: string; text: string
}) {
  const sentAt = new Date().toISOString()
  const ref = await addDoc(collection(db, 'userProfiles', uid(), 'sent'), {
    ...data, sentAt, createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, sentAt }
}

// ─── Balance (local — Firestore-da saxlan) ────────────────────────────────────

export async function dbGetBalance() {
  const snap = await getDoc(doc(db, 'userProfiles', uid()))
  return { balance: snap.exists() ? (snap.data() as any).balance ?? 0 : 0 }
}

export async function dbTopUp(amount: number) {
  const snap = await getDoc(doc(db, 'userProfiles', uid()))
  const current = snap.exists() ? (snap.data() as any).balance ?? 0 : 0
  await updateDoc(doc(db, 'userProfiles', uid()), { balance: current + amount })
  return { success: true, newBalance: current + amount }
}

export async function dbGetPaymentHistory() {
  const snap = await getDocs(
    query(collection(db, 'userProfiles', uid(), 'payments'), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

// ─── Student – Exams assigned by teacher ─────────────────────────────────────

export async function dbGetExamsForStudent() {
  const currentUid = uid()
  if (!currentUid) return []

  // Groups the student belongs to
  const groupsSnap = await getDocs(
    query(collection(db, 'groups'), where('studentUids', 'array-contains', currentUid))
  )
  const groupIds = groupsSnap.docs.map(d => d.id)
  if (!groupIds.length) return []

  // Firestore 'in' max 30 items
  const chunk = groupIds.slice(0, 30)
  const examsSnap = await getDocs(
    query(collection(db, 'exams'), where('groupId', 'in', chunk))
  )
  return examsSnap.docs.map(d => ({ ...d.data(), id: d.id }))
}

// ─── Notifications: write to student + connected parent ───────────────────────

export async function dbNotifyExamAssigned(exam: {
  id: string; title: string; subject: string; groupId: string | null; scheduledAt?: string
}) {
  if (!exam.groupId) return

  const groupSnap = await getDoc(doc(db, 'groups', exam.groupId))
  if (!groupSnap.exists()) return
  const studentUids: string[] = (groupSnap.data() as any).studentUids ?? []
  if (!studentUids.length) return

  const notifBase = {
    title:     `📋 Yeni imtahan: ${exam.title}`,
    body:      `${exam.subject}${exam.scheduledAt ? ' · ' + new Date(exam.scheduledAt).toLocaleDateString('az-AZ') : ''}`,
    icon:      '📋',
    type:      'exam',
    examId:    exam.id,
    read:      false,
    createdAt: serverTimestamp(),
  }

  // Notify students
  await Promise.all(
    studentUids.map(sUid =>
      addDoc(collection(db, 'userProfiles', sUid, 'notifications'), notifBase)
    )
  )

  // Notify connected parents
  const parentRequests = await getDocs(
    query(
      collection(db, 'parentRequests'),
      where('childUid',  'in', studentUids.slice(0, 30)),
      where('status',    '==', 'accepted')
    )
  )
  const parentUids = [...new Set(parentRequests.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
  await Promise.all(
    parentUids.map(pUid =>
      addDoc(collection(db, 'userProfiles', pUid, 'notifications'), {
        ...notifBase,
        title: `📋 Tapşırıq: ${exam.title}`,
        body:  `${exam.subject} — uşağınızın yeni imtahanı var`,
      })
    )
  )
}

// ─── Teacher – Incoming parent messages ───────────────────────────────────────

export async function dbGetIncomingParentMessages() {
  const snap = await getDocs(
    query(
      collection(db, 'parentTeacherMessages'),
      where('teacherUid', '==', uid()),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

// ─── Parent – Child group/teacher queries ─────────────────────────────────────

export async function dbGetGroupsByStudentUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'groups'), where('studentUids', 'array-contains', studentUid))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

// Group messages written by teachers, readable by parents
export async function dbGetGroupMessages(groupId: string) {
  const snap = await getDocs(
    query(collection(db, 'groupMessages'), where('groupId', '==', groupId), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

// Parent ↔ Teacher direct messages
export async function dbGetParentTeacherMessages(teacherUid: string, childUid: string) {
  const snap = await getDocs(
    query(
      collection(db, 'parentTeacherMessages'),
      where('parentUid', '==', uid()),
      where('teacherUid', '==', teacherUid),
      where('childUid', '==', childUid),
      orderBy('createdAt', 'asc')
    )
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

export async function dbGetAllParentMessages() {
  const snap = await getDocs(
    query(
      collection(db, 'parentTeacherMessages'),
      where('parentUid', '==', uid()),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

export async function dbSendParentTeacherMessage(teacherUid: string, childUid: string, text: string) {
  const sentAt = new Date().toISOString()
  const ref = await addDoc(collection(db, 'parentTeacherMessages'), {
    parentUid: uid(),
    teacherUid,
    childUid,
    fromRole: 'parent',
    text: text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, fromRole: 'parent', text: text.trim(), sentAt, createdAt: sentAt }
}

export async function dbTeacherReplyToParent(parentUid: string, childUid: string, text: string) {
  const currentUid = uid()
  const sentAt = new Date().toISOString()
  const ref = await addDoc(collection(db, 'parentTeacherMessages'), {
    parentUid,
    teacherUid: currentUid,
    childUid,
    fromRole: 'teacher',
    text: text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, parentUid, teacherUid: currentUid, childUid, fromRole: 'teacher', text: text.trim(), sentAt, createdAt: sentAt }
}

// ─── Sinaq İmtahanları ────────────────────────────────────────────────────────

export async function dbCreateSinaqExam(data: {
  groupId:    string
  subject:    string
  topicIds:   string[]
  difficulty: string
  timeLimit:  number
  startDate:  string
  endDate:    string
}) {
  const teacherUid = uid()
  const ref = await addDoc(collection(db, 'sinaqExams'), {
    ...data, teacherUid, summarySentAt: null, createdAt: serverTimestamp(),
  })
  const groupSnap = await getDoc(doc(db, 'groups', data.groupId)).catch(() => null)
  const groupName = groupSnap?.exists() ? (groupSnap.data() as any).name : 'Qrup'
  await dbNotifyGroup(data.groupId, {
    title: '📋 Yeni Sinaq İmtahanı',
    body:  `${groupName} — ${data.topicIds.length} mövzu üzrə sinaq imtahanı. Başlanğıc: ${new Date(data.startDate).toLocaleDateString('az-AZ')}`,
    type:  'sinaq_exam',
    data:  { examId: ref.id, groupId: data.groupId },
  }).catch(() => {})
  return { id: ref.id, ...data, teacherUid }
}

export async function dbGetTeacherSinaqExams() {
  const snap = await getDocs(
    query(collection(db, 'sinaqExams'), where('teacherUid', '==', uid()), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbGetSinaqExamsForStudent() {
  const currentUid = uid()
  if (!currentUid) return []
  const groupsSnap = await getDocs(
    query(collection(db, 'groups'), where('studentUids', 'array-contains', currentUid))
  )
  if (groupsSnap.empty) return []
  const groupIds = groupsSnap.docs.map(d => d.id)
  const results: any[] = []
  for (const gid of groupIds.slice(0, 10)) {
    const snap = await getDocs(
      query(collection(db, 'sinaqExams'), where('groupId', '==', gid), orderBy('createdAt', 'desc'))
    )
    snap.docs.forEach(d => results.push({ id: d.id, ...d.data() }))
  }
  return results
}

export async function dbSaveSinaqAttempt(data: {
  examId:         string
  groupId:        string
  startedAt:      string
  completedAt:    string
  timeSpent:      number
  percent:        number
  correct:        number
  total:          number
  wrongQuestions: { id: string; question: string; correctAnswer: string; studentAnswer: string }[]
}) {
  const studentUid = uid()
  const profile = await dbGetProfile()
  const studentName = (profile as any)?.fullName ?? ''
  const ref = await addDoc(collection(db, 'sinaqAttempts'), {
    ...data, studentUid, studentName, createdAt: serverTimestamp(),
  })
  return { id: ref.id }
}

export async function dbGetSinaqAttempts(examId: string) {
  const snap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('examId', '==', examId))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbGetMySinaqAttempt(examId: string) {
  const snap = await getDocs(
    query(
      collection(db, 'sinaqAttempts'),
      where('examId', '==', examId),
      where('studentUid', '==', uid())
    )
  )
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function dbMarkSinaqSummarySent(examId: string, teacherUid: string, summary: {
  groupName: string; attemptCount: number; avgPercent: number; examId: string
}) {
  await updateDoc(doc(db, 'sinaqExams', examId), { summarySentAt: serverTimestamp() })
  await dbWriteNotification(teacherUid, {
    title: '📊 Sinaq İmtahanı Başa Çatdı',
    body:  `${summary.groupName} — ${summary.attemptCount} şagird iştirak etdi, ortalama nəticə: ${summary.avgPercent}%`,
    type:  'sinaq_summary',
    data:  summary,
  })
}

// ─── Cross-user data access (with permission) ─────────────────────────────────

// Teacher gets all homework attempts for a student (requires accepted permission)
export async function dbGetStudentHomeworkAttemptsByUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'homeworkAttempts'), where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Teacher gets all sinaq attempts for a student (requires accepted permission)
export async function dbGetStudentSinaqAttemptsByUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Parent gets child's homework attempts (auto-visible)
export async function dbGetChildHomeworkAttempts(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'homeworkAttempts'), where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Parent gets shared exam results for a child
export async function dbGetChildSharedExamAttempts(studentUid: string) {
  // Exams shared by teacher come as notifications with type='sinaq_share'
  // Also get sinaqAttempts for this student where the exam has sharedWithParents=true
  const attSnap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('studentUid', '==', studentUid))
  )
  const attempts = attSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  // Filter to exams that are shared
  const examIds = [...new Set(attempts.map((a: any) => a.examId))]
  const shared: any[] = []
  for (const eid of examIds) {
    const examSnap = await getDoc(doc(db, 'sinaqExams', eid)).catch(() => null)
    if (examSnap?.exists() && (examSnap.data() as any).sharedWithParents) {
      const att = attempts.find((a: any) => a.examId === eid)
      if (att) shared.push({ ...att, examData: examSnap.data() })
    }
  }
  return shared
}

// Teacher gets students who have accepted their permission
export async function dbGetPermittedStudents() {
  const snap = await getDocs(
    query(collection(db, 'permissions'), where('teacherUid', '==', uid()), where('status', '==', 'granted'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Teacher shares sinaq exam results with parents of group students
export async function dbShareSinaqWithParents(examId: string, _groupId: string) {
  // Mark the exam as shared
  await updateDoc(doc(db, 'sinaqExams', examId), { sharedWithParents: true })

  // Gather all attempts for this exam
  const attSnap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('examId', '==', examId))
  )
  const attempts = attSnap.docs.map(d => ({ ...d.data() })) as any[]
  const studentUids = attempts.map((a: any) => a.studentUid).filter(Boolean)

  if (!studentUids.length) return

  // Find parents of these students
  const parentSnap = await getDocs(
    query(collection(db, 'parentRequests'), where('childUid', 'in', studentUids.slice(0, 30)), where('status', '==', 'accepted'))
  )
  const parentChildPairs = parentSnap.docs.map(d => ({ parentUid: (d.data() as any).parentUid, childUid: (d.data() as any).childUid }))

  // Send each parent their child's result
  await Promise.all(parentChildPairs.map(async ({ parentUid, childUid }) => {
    const att = attempts.find((a: any) => a.studentUid === childUid)
    if (!att) return
    await dbWriteNotification(parentUid, {
      title: '📊 Sinaq İmtahanı Nəticəsi',
      body:  `Uşağınız sinaq imtahanında ${att.percent}% nəticə göstərdi (${att.correct}/${att.total} düzgün).`,
      type:  'sinaq_share',
      data:  { examId, studentUid: childUid, percent: att.percent, correct: att.correct, total: att.total },
    }).catch(() => {})
  }))
}

// Teacher gets parent UIDs for a student (to enable direct messaging)
export async function dbGetParentUidsByStudentUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'parentRequests'), where('childUid', '==', studentUid), where('status', '==', 'accepted'))
  )
  if (snap.empty) return []
  const parentUids = [...new Set(snap.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
  const profiles = await Promise.all(parentUids.map(u => dbGetProfileByUid(u).catch(() => null)))
  return parentUids.map((uid, i) => ({ uid, profile: profiles[i] })).filter(x => x.profile)
}

// Teacher sends direct message to a parent (identified by parentUid + childUid context)
export async function dbTeacherMessageParent(parentUid: string, childUid: string, text: string) {
  const currentUid = uid()
  const sentAt = new Date().toISOString()
  const ref = await addDoc(collection(db, 'parentTeacherMessages'), {
    parentUid,
    teacherUid: currentUid,
    childUid,
    fromRole: 'teacher',
    text: text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  })
  // Notify the parent
  await dbWriteNotification(parentUid, {
    title: '💬 Müəllim Mesajı',
    body:  text.length > 80 ? text.slice(0, 80) + '…' : text,
    type:  'teacher_message',
    data:  { teacherUid: currentUid, childUid },
  }).catch(() => {})
  return { id: ref.id, parentUid, teacherUid: currentUid, childUid, fromRole: 'teacher', text: text.trim(), sentAt, createdAt: sentAt }
}

// Teacher's homework results per group (for analytics)
export async function dbGetGroupHomeworkResults(groupId: string) {
  const hwSnap = await getDocs(
    query(collection(db, 'homeworks'), where('groupId', '==', groupId))
  )
  const homeworks = hwSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const results = await Promise.all(homeworks.map(async (hw: any) => {
    const attSnap = await getDocs(
      query(collection(db, 'homeworkAttempts'), where('homeworkId', '==', hw.id))
    )
    const attempts = attSnap.docs.map(d => d.data()) as any[]
    const participants = [...new Set(attempts.map(a => a.studentUid))].length
    const avgPct = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) : 0
    return { ...hw, participantCount: participants, avgPercent: avgPct, attemptCount: attempts.length }
  }))
  return results
}

// Teacher sends a direct message to a student (writes to student's inbox + notification)
export async function dbTeacherSendDirectMessage(recipientUniqueIdOrEmail: string, text: string) {
  const teacherUid = uid()
  const sentAt = new Date().toISOString()

  // Resolve recipient to a full profile
  const recipient = await dbSearchUser(recipientUniqueIdOrEmail)
  if (!recipient) throw new Error('Şagird tapılmadı')
  const recipientUid: string = (recipient as any).id ?? ''
  if (!recipientUid) throw new Error('Şagird UID tapılmadı')

  const teacherProfile = await dbGetProfile().catch(() => null)
  const teacherName = (teacherProfile as any)?.fullName ?? 'Müəllim'

  // Save in teacher's sent collection
  const ref = await addDoc(collection(db, 'userProfiles', teacherUid, 'sent'), {
    to:       recipientUniqueIdOrEmail,
    toUid:    recipientUid,
    toLabel:  (recipient as any).fullName ?? recipientUniqueIdOrEmail,
    mode:     'direct',
    text:     text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  })

  // Deliver to student's received subcollection
  await addDoc(collection(db, 'userProfiles', recipientUid, 'received'), {
    fromUid:   teacherUid,
    fromName:  teacherName,
    fromRole:  'teacher',
    text:      text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  }).catch(() => {})

  // Send notification to student
  await dbWriteNotification(recipientUid, {
    title: `💬 ${teacherName}`,
    body:  text.length > 80 ? text.slice(0, 80) + '…' : text,
    type:  'teacher_direct_message',
    data:  { teacherUid, messageId: ref.id },
  }).catch(() => {})

  return {
    id:      ref.id,
    to:      recipientUniqueIdOrEmail,
    toUid:   recipientUid,
    toLabel: (recipient as any).fullName ?? recipientUniqueIdOrEmail,
    mode:    'direct',
    text:    text.trim(),
    sentAt,
  }
}

// Şagird gələn mesajlarını oxuyur (müəllim tərəfindən göndərilmiş)
export async function dbGetReceivedMessages() {
  const snap = await getDocs(
    query(collection(db, 'userProfiles', uid(), 'received'), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

export async function dbGetDashboardLayout() {
  const id = uid()
  if (!id) return null
  const snap = await getDoc(doc(db, 'userProfiles', id, 'meta', 'dashboardLayout'))
  if (!snap.exists()) return null
  return snap.data() as { layouts: { lg: any[] } }
}

export async function dbSaveDashboardLayout(layouts: { lg: any[] }) {
  const id = uid()
  if (!id) return
  await setDoc(
    doc(db, 'userProfiles', id, 'meta', 'dashboardLayout'),
    { layouts, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// Şagirdin bütün ev tapşırığı cəhdlərini gətir (yanlış suallar üçün)
export async function dbGetAllMyHomeworkAttempts() {
  const currentUid = uid()
  if (!currentUid) return []
  const snap = await getDocs(
    query(
      collection(db, 'homeworkAttempts'),
      where('studentUid', '==', currentUid),
      orderBy('createdAt', 'desc'),
    )
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

// ─── Classroom Intelligence ────────────────────────────────────────────────────

export async function dbSaveIntervention(intervention: Record<string, any>) {
  await setDoc(doc(db, 'interventions', intervention.id), {
    ...intervention, savedAt: serverTimestamp(),
  })
}

export async function dbGetTeacherInterventions(teacherUid?: string) {
  const tUid = teacherUid ?? uid()
  if (!tUid) return []
  const snap = await getDocs(
    query(
      collection(db, 'interventions'),
      where('teacherUid', '==', tUid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    )
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbActionIntervention(id: string, actionType: string) {
  await updateDoc(doc(db, 'interventions', id), {
    status: 'actioned', actionType, actionedAt: Date.now(),
  })
}

export async function dbDismissIntervention(id: string) {
  await updateDoc(doc(db, 'interventions', id), {
    status: 'dismissed', actionedAt: Date.now(),
  })
}

// ─── Weekly Reports ───────────────────────────────────────────────────────────

export async function dbGetWeeklyReports(childUid: string, limitCount = 8) {
  const snap = await getDocs(
    query(
      collection(db, 'weeklyReports'),
      where('uid', '==', childUid),
      orderBy('generatedAt', 'desc'),
    )
  )
  return snap.docs.slice(0, limitCount).map(d => ({ ...d.data(), id: d.id }))
}

export async function dbMarkReportRead(reportId: string) {
  await updateDoc(doc(db, 'weeklyReports', reportId), { isRead: true })
}

export async function dbGenerateWeeklyReport(payload: {
  uid: string; parentUid: string
  weekStart: string; weekEnd: string
  data: Record<string, any>; generatedText: string
}) {
  const ref = await addDoc(collection(db, 'weeklyReports'), {
    ...payload, generatedAt: Date.now(), isRead: false, createdAt: serverTimestamp(),
  })
  return { id: ref.id }
}

// ─── Live Session Watching ────────────────────────────────────────────────────

export async function dbRequestLiveWatch(studentUid: string, sessionId: string) {
  const watcherUid = uid()
  const ref = doc(db, 'liveSessionWatchers', sessionId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const watchers: string[] = (snap.data() as any).watcherUids ?? []
    if (!watchers.includes(watcherUid)) {
      await updateDoc(ref, { watcherUids: [...watchers, watcherUid] })
    }
  } else {
    await setDoc(ref, {
      sessionId, studentUid,
      watcherUids: [watcherUid],
      allowedByStudent: false,
      startedAt: Date.now(),
    })
  }
  return { sessionId }
}

export async function dbRespondLiveWatch(sessionId: string, allow: boolean) {
  await updateDoc(doc(db, 'liveSessionWatchers', sessionId), { allowedByStudent: allow })
}

export async function dbGetActiveLiveSession(studentUid: string) {
  const snap = await getDocs(
    query(
      collection(db, 'liveSessionWatchers'),
      where('studentUid', '==', studentUid),
      where('allowedByStudent', '==', true),
    )
  )
  if (snap.empty) return null
  return { ...snap.docs[0].data(), id: snap.docs[0].id }
}

// Group-level insights: get all students in a group with their stats
export async function dbGetGroupStudentStats(groupId: string) {
  const groupSnap = await getDoc(doc(db, 'groups', groupId))
  if (!groupSnap.exists()) return []
  const studentUids: string[] = (groupSnap.data() as any).studentUids ?? []
  if (!studentUids.length) return []
  const [profiles, statsList] = await Promise.all([
    Promise.all(studentUids.map(u => dbGetProfileByUid(u).catch(() => null))),
    Promise.all(studentUids.map(u => dbGetStats(u).catch(() => null))),
  ])
  return studentUids
    .map((u, i) => ({
      uid:           u,
      name:          (profiles[i] as any)?.fullName ?? u,
      lastActiveDate:(statsList[i] as any)?.lastActiveDate,
      currentStreak: (statsList[i] as any)?.currentStreak ?? 0,
      subjectStats:  (statsList[i] as any)?.subjectStats ?? [],
      stats:         statsList[i],
    }))
    .filter(s => !!s.name)
}
