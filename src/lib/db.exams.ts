import {
  doc, getDoc, addDoc,
  collection, getDocs, query, where, orderBy,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'
import { dbGetProfile } from './db.profile'
import { dbWriteNotification, dbNotifyGroup } from './db.notifications'

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

export async function dbGetExamsForStudent() {
  const currentUid = uid()
  if (!currentUid) return []

  const groupsSnap = await getDocs(
    query(collection(db, 'groups'), where('studentUids', 'array-contains', currentUid))
  )
  const groupIds = groupsSnap.docs.map(d => d.id)
  if (!groupIds.length) return []

  const chunk = groupIds.slice(0, 30)
  const examsSnap = await getDocs(
    query(collection(db, 'exams'), where('groupId', 'in', chunk))
  )
  return examsSnap.docs.map(d => ({ ...d.data(), id: d.id }))
}

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

export async function dbShareSinaqWithParents(examId: string, _groupId: string) {
  await updateDoc(doc(db, 'sinaqExams', examId), { sharedWithParents: true })

  const attSnap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('examId', '==', examId))
  )
  const attempts = attSnap.docs.map(d => ({ ...d.data() })) as any[]
  const studentUids = attempts.map((a: any) => a.studentUid).filter(Boolean)

  if (!studentUids.length) return

  const parentSnap = await getDocs(
    query(collection(db, 'parentRequests'), where('childUid', 'in', studentUids.slice(0, 30)), where('status', '==', 'accepted'))
  )
  const parentChildPairs = parentSnap.docs.map(d => ({ parentUid: (d.data() as any).parentUid, childUid: (d.data() as any).childUid }))

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

export async function dbGetStudentSinaqAttemptsByUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbGetChildSharedExamAttempts(studentUid: string) {
  const attSnap = await getDocs(
    query(collection(db, 'sinaqAttempts'), where('studentUid', '==', studentUid))
  )
  const attempts = attSnap.docs.map(d => ({ id: d.id, ...d.data() }))
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
