import {
  doc, getDoc, addDoc,
  collection, getDocs, query, where, orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, uid, tsToIso } from './db.shared'
import { dbGetProfile } from './db.profile'
import { dbWriteNotification, dbNotifyGroup } from './db.notifications'

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

export async function dbGetChildHomeworkAttempts(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'homeworkAttempts'), where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function dbGetStudentHomeworkAttemptsByUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'homeworkAttempts'), where('studentUid', '==', studentUid), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
