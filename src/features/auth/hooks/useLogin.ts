import { useMutation }   from '@tanstack/react-query'
import { api }           from '../../../lib/api'
import { useAuthStore }  from '../../../stores/authStore'
import { firebaseLogin } from '../services/firebase'
import { Role, Grade, Group, Subject } from '../../../types/models'
import type { LoginInput } from '../../../lib/validations'

interface LoginResponse {
  token:        string
  refreshToken: string
  user:         any
}

export function useLogin() {
  const { setToken, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (data: LoginInput): Promise<LoginResponse> => {
      // ── Step 1: Firebase Auth (email verification session) ──────────────────
      const cred = await firebaseLogin(data.email, data.password)

      // ── Step 2: Backend login → JWT + full user profile ─────────────────────
      try {
        const res = await api.post<{ data: LoginResponse }>('/api/auth/login', {
          email:    data.email,
          password: data.password,
        })
        if (res.data?.data?.token) {
          return res.data.data
        }
      } catch {
        // Backend unavailable — build minimal user from Firebase session
      }

      // ── Fallback: backend offline → use Firebase identity only ───────────────
      const fbUser = cred.user
      return {
        token:        await fbUser.getIdToken(),
        refreshToken: fbUser.refreshToken,
        user: {
          id:             fbUser.uid,
          backendId:      null,
          email:          fbUser.email ?? '',
          fullName:       fbUser.displayName ?? fbUser.email ?? '',
          role:           Role.Student,
          uniqueId:       '',
          grade:          Grade.Ten,
          group:          Group.I,
          foreignLang:    Subject.English,
          specialtyGroup: '',
          plan:           'free',
          streakDays:     0,
          totalQuestions: 0,
          successRate:    0,
        },
      }
    },
    onSuccess: ({ token, refreshToken, user }) => {
      setToken(token, refreshToken)
      setUser(user)
    },
  })
}
