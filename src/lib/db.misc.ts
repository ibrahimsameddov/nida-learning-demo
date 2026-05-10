import {
  doc, getDoc, setDoc, addDoc,
  collection, getDocs, query, where, orderBy,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'

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
