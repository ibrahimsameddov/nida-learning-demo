import { useAuthStore } from '../../../stores/authStore'
import { Role } from '../../../types/models'

export function useAuth() {
  const user   = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

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
