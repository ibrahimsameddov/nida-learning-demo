import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Student, Teacher, Parent, Role } from '../types/models'

type AuthUser = Student | Teacher | Parent

interface AuthState {
  user:         AuthUser | null
  token:        string | null
  refreshToken: string | null
  isLoading:    boolean
  setUser:      (user: AuthUser) => void
  setToken:     (token: string, refresh?: string) => void
  logout:       () => void
  isRole:       (role: Role) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user:         null,
      token:        null,
      refreshToken: null,
      isLoading:    false,

      setUser:  (user)           => set(s => { s.user  = user }),
      setToken: (token, refresh) => set(s => {
        s.token        = token
        s.refreshToken = refresh ?? s.refreshToken
      }),
      logout: () => set(s => {
        s.user         = null
        s.token        = null
        s.refreshToken = null
      }),
      isRole: (role) => get().user?.role === role,
    })),
    {
      name:    'nida-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ token: s.token, refreshToken: s.refreshToken, user: s.user }),
    }
  )
)
