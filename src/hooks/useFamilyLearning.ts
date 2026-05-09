// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  dbGetWeeklyReports, dbMarkReportRead, dbGenerateWeeklyReport,
  dbGetActiveLiveSession, dbRequestLiveWatch, dbRespondLiveWatch,
  dbGetStats, dbGetMyChildren,
} from '@/lib/db'
import { buildWeeklyReportData, generateWeeklyReportText } from '@/lib/classroomIntelligence'

// ── Weekly Reports ─────────────────────────────────────────────────────────────

export function useWeeklyReports(childUid: string) {
  const parentUid = useAuthStore(s => s.user?.id ?? '')
  const qc        = useQueryClient()

  const query = useQuery({
    queryKey: ['weekly-reports', childUid],
    enabled:  !!childUid && !!parentUid,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const existing = await dbGetWeeklyReports(childUid)
      if (existing.length) return existing

      // Auto-generate if no reports exist
      const stats = await dbGetStats(childUid).catch(() => null)
      if (!stats) return []

      const weekEnd   = new Date().toISOString().slice(0, 10)
      const weekStart = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)
      const data      = buildWeeklyReportData(stats, stats.averagePercent ?? 0)
      const text      = generateWeeklyReportText(data, (stats as any).fullName ?? 'Şagird')

      await dbGenerateWeeklyReport({ uid: childUid, parentUid, weekStart, weekEnd, data, generatedText: text })
      return dbGetWeeklyReports(childUid)
    },
  })

  const markRead = useMutation({
    mutationFn: (reportId: string) => dbMarkReportRead(reportId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['weekly-reports', childUid] }),
  })

  return {
    reports:    (query.data ?? []) as any[],
    isLoading:  query.isLoading,
    markRead:   markRead.mutate,
    unreadCount: (query.data ?? []).filter((r: any) => !r.isRead).length,
  }
}

// ── Live Session Watching ──────────────────────────────────────────────────────

export function useLiveSession(studentUid: string) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['live-session', studentUid],
    enabled:  !!studentUid,
    staleTime: 30_000,
    refetchInterval: 15_000,
    queryFn: () => dbGetActiveLiveSession(studentUid),
  })

  const request = useMutation({
    mutationFn: (sessionId: string) => dbRequestLiveWatch(studentUid, sessionId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['live-session', studentUid] }),
  })

  const respond = useMutation({
    mutationFn: ({ sessionId, allow }: { sessionId: string; allow: boolean }) =>
      dbRespondLiveWatch(sessionId, allow),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live-session', studentUid] }),
  })

  return {
    session:    query.data ?? null,
    isLoading:  query.isLoading,
    requestWatch: request.mutate,
    respond:    respond.mutate,
  }
}

// ── Children Summary ───────────────────────────────────────────────────────────

export function useChildrenSummary() {
  return useQuery({
    queryKey: ['children-summary'],
    staleTime: 2 * 60_000,
    queryFn: () => dbGetMyChildren(),
  })
}
