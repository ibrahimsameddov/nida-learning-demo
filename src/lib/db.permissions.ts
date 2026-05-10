import {
  doc, getDoc, addDoc,
  collection, getDocs, query, where,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'
import { dbGetProfile, dbGetProfileByUid } from './db.profile'
import { dbWriteNotification } from './db.notifications'

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
  if (approved && permSnap.exists()) {
    const perm = permSnap.data() as any
    if (perm.studentUid) {
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

export async function dbGetPermittedStudents() {
  const snap = await getDocs(
    query(collection(db, 'permissions'), where('teacherUid', '==', uid()), where('status', '==', 'granted'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
