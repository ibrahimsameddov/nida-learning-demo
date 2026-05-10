import {
  addDoc,
  collection, getDocs, query, where, orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, uid, tsToIso } from './db.shared'
import { dbGetProfile, dbSearchUser } from './db.profile'
import { dbWriteNotification } from './db.notifications'

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
  await dbWriteNotification(parentUid, {
    title: '💬 Müəllim Mesajı',
    body:  text.length > 80 ? text.slice(0, 80) + '…' : text,
    type:  'teacher_message',
    data:  { teacherUid: currentUid, childUid },
  }).catch(() => {})
  return { id: ref.id, parentUid, teacherUid: currentUid, childUid, fromRole: 'teacher', text: text.trim(), sentAt, createdAt: sentAt }
}

export async function dbTeacherSendDirectMessage(recipientUniqueIdOrEmail: string, text: string) {
  const teacherUid = uid()
  const sentAt = new Date().toISOString()

  const recipient = await dbSearchUser(recipientUniqueIdOrEmail)
  if (!recipient) throw new Error('Şagird tapılmadı')
  const recipientUid: string = (recipient as any).id ?? ''
  if (!recipientUid) throw new Error('Şagird UID tapılmadı')

  const teacherProfile = await dbGetProfile().catch(() => null)
  const teacherName = (teacherProfile as any)?.fullName ?? 'Müəllim'

  const ref = await addDoc(collection(db, 'userProfiles', teacherUid, 'sent'), {
    to:       recipientUniqueIdOrEmail,
    toUid:    recipientUid,
    toLabel:  (recipient as any).fullName ?? recipientUniqueIdOrEmail,
    mode:     'direct',
    text:     text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'userProfiles', recipientUid, 'received'), {
    fromUid:   teacherUid,
    fromName:  teacherName,
    fromRole:  'teacher',
    text:      text.trim(),
    sentAt,
    createdAt: serverTimestamp(),
  }).catch(() => {})

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

export async function dbGetReceivedMessages() {
  const snap = await getDocs(
    query(collection(db, 'userProfiles', uid(), 'received'), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: tsToIso((d.data() as any).createdAt) }))
}
