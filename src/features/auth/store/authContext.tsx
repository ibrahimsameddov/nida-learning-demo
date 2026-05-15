import { useAuthStore }    from '../../../stores/authStore'
import { Role }             from '../../../types/models'
import { api }              from '../../../lib/api'

export function useAuth() {
  const user         = useAuthStore(s => s.user)
  const storeLogout  = useAuthStore(s => s.logout)
  const refreshToken = useAuthStore(s => s.refreshToken)

  const logout = async () => {
    try {
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken })
      }
    } catch {
      // backend xətası logout-u bloklamasın
    } finally {
      storeLogout()
    }
  }

  const userProfile = user
    ? {
        ...user,
        displayName: user.fullName,
        uniqueId:    (user as any).uniqueId || '',
      }
    : null

  return {
    userProfile,
    logout,
    isStudent: user?.role === Role.Student,
    isTeacher: user?.role === Role.Teacher,
    isParent:  user?.role === Role.Parent,
  }
}
