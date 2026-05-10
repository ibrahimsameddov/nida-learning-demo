import {
  doc, getDoc, addDoc,
  collection, getDocs, query, orderBy,
  updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'

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
