import {
  doc, getDoc, setDoc, addDoc,
  collection, getDocs, query, where,
  serverTimestamp,
} from 'firebase/firestore'
import { db, uid } from './db.shared'

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

export async function dbSyncPublicProfile(data: Record<string, any>, currentUid: string) {
  if (!currentUid) return
  const pub: Record<string, any> = { uid: currentUid, updatedAt: serverTimestamp() }
  if (data.fullName)  pub.fullName  = data.fullName
  if (data.email)     pub.email     = (data.email as string).toLowerCase().trim()
  if (data.uniqueId)  pub.uniqueId  = data.uniqueId
  if (data.role)      pub.role      = data.role
  await setDoc(doc(db, 'publicProfiles', currentUid), pub, { merge: true })
}

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

const ASCII_TO_AZ: Record<string, string> = { SAG: 'ŞAG', MUE: 'MÜE', VAL: 'VAL' }

export async function dbSearchUser(queryStr: string) {
  const q = queryStr.trim()
  if (!q) return null
  if (q.includes('@')) return dbGetUserByEmail(q)

  const exact = await dbGetUserByUniqueId(q)
  if (exact) return exact

  const upper = q.toUpperCase()
  if (upper !== q) {
    const byUpper = await dbGetUserByUniqueId(upper)
    if (byUpper) return byUpper
  }

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

  const byUid = await dbGetProfileByUid(q).catch(() => null)
  if (byUid) return { ...byUid, id: q }

  return null
}
