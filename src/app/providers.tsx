import { QueryClientProvider }     from '@tanstack/react-query'
import { ReactQueryDevtools }      from '@tanstack/react-query-devtools'
import { RouterProvider }          from 'react-router-dom'
import { useEffect }               from 'react'
import { queryClient }             from '../lib/queryClient'
import { router }                  from './router'
import { useThemeStore }           from '../stores/themeStore'
import { useSocketConnection }     from '../hooks/useSocket'
function ThemeInitializer() {
  const { resolved } = useThemeStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])
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
      <SocketInitializer />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
