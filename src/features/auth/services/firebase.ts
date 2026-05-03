import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '../../../lib/firebaseConfig'

export { auth }

export const firebaseRegister = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const firebaseLogin = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const sendVerificationEmail = async (user?: User | null) => {
  const target = user ?? auth.currentUser
  if (target) await sendEmailVerification(target)
}

export const checkEmailVerified = async (): Promise<boolean> => {
  const user = auth.currentUser
  if (!user) return false
  await user.reload()
  return user.emailVerified
}

export const firebaseSignOut = () => signOut(auth)

export const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
  const user = auth.currentUser
  if (user) await updateProfile(user, data)
}

export const onFirebaseAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb)
