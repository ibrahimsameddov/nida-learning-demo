import { Timestamp } from 'firebase/firestore'
import { db, auth }  from './firebaseConfig'
import { useAuthStore } from '../stores/authStore'

export { db, auth }

export const uid = () => useAuthStore.getState().user?.id ?? auth.currentUser?.uid ?? ''

export function tsToIso(ts: any): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return String(ts)
}
