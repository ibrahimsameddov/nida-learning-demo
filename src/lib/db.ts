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
  const ref = await addDoc(collection(db, 'permissions'), {
    teacherUid: uid(),
    receiverUniqueId,
    studentUid: studentUid ?? '',
    subject,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return { id: ref.id }
}

export async function dbRespondPermission(permId: string, approved: boolean) {
  await updateDoc(doc(db, 'permissions', permId), {
    status: approved ? 'granted' : 'rejected', respondedAt: serverTimestamp(),
  })
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
  const ref = await addDoc(collection(db, 'parentRequests'), {
    parentUid:      uid(),
    parentName:     ((profile as any)?.fullName  as string) || '',
    parentUniqueId: ((profile as any)?.uniqueId as string) || '',
    childUid,
    childUniqueId,
    status:    'pending',
    createdAt: serverTimestamp(),
  })
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
