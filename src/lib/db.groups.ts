import {
  doc, getDoc, addDoc,
  collection, getDocs, query, where, orderBy,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid, tsToIso } from './db.shared'
import { dbGetProfileByUid } from './db.profile'
import { dbGetStats } from './db.stats'

export async function dbGetMyGroups() {
  const snap = await getDocs(
    query(collection(db, 'groups'), where('teacherUid', '==', uid()))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
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

export async function dbGetGroupsByStudentUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'groups'), where('studentUids', 'array-contains', studentUid))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

export async function dbGetGroupMessages(groupId: string) {
  const snap = await getDocs(
    query(collection(db, 'groupMessages'), where('groupId', '==', groupId), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}

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
      uid:            u,
      name:           (profiles[i] as any)?.fullName ?? u,
      lastActiveDate: (statsList[i] as any)?.lastActiveDate,
      currentStreak:  (statsList[i] as any)?.currentStreak ?? 0,
      subjectStats:   (statsList[i] as any)?.subjectStats ?? [],
      stats:          statsList[i],
    }))
    .filter(s => !!s.name)
}
