import { useMutation }    from '@tanstack/react-query'
import { api }            from '../../../lib/api'
import { useAuthStore }   from '../../../stores/authStore'
import { firebaseLogin }  from '../services/firebase'
import { dbGetProfile, dbSaveProfile, dbSyncPublicProfile, generateUniqueId } from '../../../lib/db'
import { Role, Grade, Group, Subject } from '../../../types/models'
import type { LoginInput }             from '../../../lib/validations'
import type { Student }                from '../../../types/models'

interface LoginResponse {
  token:        string
  refreshToken: string
  user:         any
}

export function useLogin() {
  const { setToken, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (data: LoginInput): Promise<LoginResponse> => {
      const cred    = await firebaseLogin(data.email, data.password)
      const idToken = await cred.user.getIdToken()

      try {
        const res = await api.post<{ data: LoginResponse }>('/api/auth/firebase', { idToken })
        if (res.data.data?.token) {
          const u = res.data.data.user
          dbSyncPublicProfile(
            { uniqueId: u.uniqueId, email: u.email, fullName: u.fullName, role: u.role },
            cred.user.uid,
          ).catch(() => {})
          return res.data.data
        }
      } catch {
        // ignore — fall through to Firebase fallback
      }

      // Firebase fallback (backend yoxdursa) — Firestore-dən real profil yüklə
      const fbUser  = cred.user
      const profile = await dbGetProfile().catch(() => null)
      const role    = (profile?.role as Role) ?? Role.Student

      // uniqueId yoxdursa — bir dəfəlik generate et və Firestore-a yaz
      let uniqueId = (profile?.uniqueId as string) ?? ''
      if (!uniqueId) {
        uniqueId = generateUniqueId(role)
      }
      // publicProfiles-a həmişə sinxronizasiya et (email, fullName, uniqueId, role)
      await dbSaveProfile({
        uniqueId,
        email:    (fbUser.email ?? '').toLowerCase().trim(),
        fullName: (profile?.fullName as string) ?? fbUser.displayName ?? '',
        role,
      }).catch(() => {})

      return {
        token:        idToken,
        refreshToken: fbUser.refreshToken,
        user: {
          id:             fbUser.uid,
          fullName:       (profile?.fullName as string) ?? fbUser.displayName ?? fbUser.email ?? '',
          email:          fbUser.email ?? '',
          role,
          uniqueId,
          createdAt:      fbUser.metadata.creationTime ?? new Date().toISOString(),
          avatarUrl:      fbUser.photoURL ?? undefined,
          studentId:      (profile?.studentId as string) ?? '',
          grade:          (profile?.grade as Grade)   ?? Grade.Ten,
          group:          (profile?.group as Group)   ?? Group.I,
          city:           (profile?.city as string)   ?? '',
          school:         (profile?.school as string) ?? '',
          foreignLang:    (profile?.foreignLang as Subject) ?? Subject.English,
          specialtyGroup: (profile?.specialtyGroup as string) ?? '',
          plan:           (profile?.plan as string) ?? 'free',
          streakDays:     0,
          totalQuestions: 0,
          successRate:    0,
          ...(role === Role.Teacher && {
            subjects: (profile?.subjects as string[]) ?? [],
            status:   (profile?.status as string)   ?? 'pending',
          }),
        },
      }
    },
    onSuccess: ({ token, refreshToken, user }) => {
      setToken(token, refreshToken)
      setUser(user)
    },
  })
}
