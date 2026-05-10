import {
  doc, addDoc,
  collection, getDocs, query, where, orderBy,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'
import { dbGetProfile, dbGetProfileByUid } from './db.profile'
import { dbGetStats } from './db.stats'
import { dbWriteNotification } from './db.notifications'

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

export async function dbGetParentUidsByStudentUid(studentUid: string) {
  const snap = await getDocs(
    query(collection(db, 'parentRequests'), where('childUid', '==', studentUid), where('status', '==', 'accepted'))
  )
  if (snap.empty) return []
  const parentUids = [...new Set(snap.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
  const profiles = await Promise.all(parentUids.map(u => dbGetProfileByUid(u).catch(() => null)))
  return parentUids.map((u, i) => ({ uid: u, profile: profiles[i] })).filter(x => x.profile)
}
