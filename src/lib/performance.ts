// @ts-nocheck
import { useEffect, useRef, useCallback } from 'react'
import { queryClient } from './queryClient'

// ── Prefetch manager ───────────────────────────────────────────────────────────

export const prefetch = {
  subjectTopics: (_subjectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['stats'],
      staleTime: 5 * 60_000,
      queryFn: async () => {
        const { apiGetMyStatistics } = await import('./api')
        return apiGetMyStatistics()
      },
    })
  },

  topicQuiz: (topicId: string) => {
    // Prefetch quiz questions for a topic — stale 2 min
    queryClient.prefetchQuery({
      queryKey: ['quiz-questions', topicId],
      staleTime: 2 * 60_000,
      queryFn: async () => topicId, // Real query populated per implementation
    })
  },

  dashboard: (_uid: string) => {
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['stats'],
        staleTime: 2 * 60_000,
        queryFn: async () => {
          const { apiGetMyStatistics } = await import('./api')
          return apiGetMyStatistics()
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ['notifications'],
        staleTime: 60_000,
        queryFn: async () => {
          const { apiGetMyNotifications } = await import('./api')
          return apiGetMyNotifications()
        },
      }),
    ]).catch(() => {})
  },

  messages: (_uid: string) => {
    queryClient.prefetchQuery({
      queryKey: ['sent-messages'],
      staleTime: 60_000,
      queryFn: async () => {
        const { apiGetSentMessages } = await import('./api')
        return apiGetSentMessages()
      },
    })
  },
}

// ── Optimistic answer update ───────────────────────────────────────────────────

export function optimisticAnswer(
  sessionId: string,
  questionId: string,
  selectedOption: string,
  isCorrect: boolean,
): void {
  queryClient.setQueryData(['session', sessionId], (old: any) => {
    if (!old) return old
    return {
      ...old,
      answers: [...(old.answers ?? []), { questionId, selectedOption, isCorrect }],
      currentIndex: (old.currentIndex ?? 0) + 1,
    }
  })
}

export function optimisticTaskComplete(taskId: string): void {
  queryClient.setQueryData(['tasks'], (old: any[] | undefined) =>
    old?.map(t => t.id === taskId ? { ...t, status: 'completed' } : t)
  )
}

export function optimisticMarkRead(notifId: string): void {
  queryClient.setQueryData(['notifications'], (old: any[] | undefined) =>
    old?.map(n => n.id === notifId ? { ...n, read: true } : n)
  )
}

// ── Hover prefetch hook ────────────────────────────────────────────────────────

export function useHoverPrefetch(prefetchFn: () => void, delay = 150) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(prefetchFn, delay)
  }, [prefetchFn, delay])

  const onMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { onMouseEnter, onMouseLeave }
}

// ── Intersection-based prefetch ────────────────────────────────────────────────

export function useIntersectionPrefetch(
  prefetchFn: () => void,
  threshold = 0.5,
) {
  const ref = useRef<HTMLDivElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          prefetchFn()
        }
      },
      { threshold },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [prefetchFn, threshold])

  return ref
}
