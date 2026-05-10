import {
  doc, getDoc, addDoc,
  collection, getDocs, query, where, orderBy,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid, tsToIso } from './db.shared'

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

export async function dbWriteNotification(targetUid: string, notif: { title: string; body: string; type: string; data?: any }) {
  await addDoc(collection(db, 'userProfiles', targetUid, 'notifications'), {
    ...notif, read: false, createdAt: serverTimestamp(),
  })
}

export async function dbNotifyGroup(groupId: string, notif: { title: string; body: string; type: string; data?: any }) {
  const groupSnap = await getDoc(doc(db, 'groups', groupId))
  if (!groupSnap.exists()) return
  const studentUids: string[] = (groupSnap.data() as any).studentUids ?? []
  if (!studentUids.length) return
  await Promise.all(studentUids.map(sUid => dbWriteNotification(sUid, notif).catch(() => {})))
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

  await Promise.all(
    studentUids.map(sUid =>
      addDoc(collection(db, 'userProfiles', sUid, 'notifications'), notifBase)
    )
  )

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
