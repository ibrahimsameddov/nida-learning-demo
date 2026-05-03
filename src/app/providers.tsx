import { QueryClientProvider }     from '@tanstack/react-query'
import { ReactQueryDevtools }      from '@tanstack/react-query-devtools'
import { RouterProvider }          from 'react-router-dom'
import { useEffect }               from 'react'
import { queryClient }             from '../lib/queryClient'
import { router }                  from './router'
import { useThemeStore }           from '../stores/themeStore'
import { useSocketConnection }     from '../hooks/useSocket'
import { useAuthStore }            from '../stores/authStore'
import { dbSyncPublicProfile }     from '../lib/db'
import { auth }                    from '../lib/firebaseConfig'

function ThemeInitializer() {
  const { resolved } = useThemeStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])
  return null
}

function PublicProfileSync() {
  const user = useAuthStore(s => s.user)
  useEffect(() => {
    const uid = auth.currentUser?.uid ?? (user as any)?.id
    if (!uid || !user) return
    dbSyncPublicProfile(
      {
        uniqueId: (user as any).uniqueId,
        email:    (user as any).email,
        fullName: (user as any).fullName,
        role:     (user as any).role,
      },
      uid,
    ).catch(() => {})
  }, [(user as any)?.id])
  return null
}

function SocketInitializer() {
  useSocketConnection()
  return null
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <PublicProfileSync />
      <SocketInitializer />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
