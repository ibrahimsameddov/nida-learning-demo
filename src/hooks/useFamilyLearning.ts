// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGetMyChildren, apiGetChildStatistics, apiGetStudentLiveSessions } from '@/lib/api'

// ── Weekly Reports ─────────────────────────────────────────────────────────────
// Weekly reports not yet in backend — returns empty list

export function useWeeklyReports(_childId: string | number) {
  const noopMutate = useMutation({ mutationFn: async () => {} })

  return {
    reports:     [] as any[],
    isLoading:   false,
    markRead:    noopMutate.mutate,
    unreadCount: 0,
  }
}

// ── Live Session Watching ──────────────────────────────────────────────────────
// Parent live-watch requests not yet in backend — session data from backend

export function useLiveSession(studentId: string | number) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['live-session', studentId],
    enabled:  !!studentId,
    staleTime: 30_000,
    refetchInterval: 15_000,
    queryFn: async () => {
      const sessions = await apiGetStudentLiveSessions(Number(studentId)).catch(() => [])
      return Array.isArray(sessions)
        ? sessions.find((s: any) => s.status === 'ACTIVE' || s.status === 'active') ?? null
        : null
    },
  })

  // Watch request/respond not yet in backend — no-op
  const noopMutate = useMutation({ mutationFn: async () => {} })

  return {
    session:      query.data ?? null,
    isLoading:    query.isLoading,
    requestWatch: noopMutate.mutate,
    respond:      noopMutate.mutate,
  }
}

// ── Children Summary ───────────────────────────────────────────────────────────

export function useChildrenSummary() {
  return useQuery({
    queryKey: ['children-summary'],
    staleTime: 2 * 60_000,
    queryFn:  () => apiGetMyChildren(),
  })
}
