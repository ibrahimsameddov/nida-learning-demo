import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            2 * 60 * 1000,
      gcTime:               10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect:   true,
      retry:                2,
      retryDelay:           (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      networkMode:          'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
