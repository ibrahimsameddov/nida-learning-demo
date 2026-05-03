import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import type { QuizSession, QuizAnswer, QuizResult } from '../../../../types/models'

// Query keys — centralized
export const quizKeys = {
  all:     ['quiz'] as const,
  session: (id: string) => [...quizKeys.all, 'session', id] as const,
  result:  (id: string) => [...quizKeys.all, 'result',  id] as const,
}

// Aktiv session al
export function useQuizSession(sessionId: string) {
  return useQuery({
    queryKey: quizKeys.session(sessionId),
    queryFn:  () => api.get<QuizSession>(`/api/quiz/session/${sessionId}`).then(r => r.data),
    staleTime: 0,
    gcTime:    Infinity,
  })
}

// Cavab göndər — optimistic update ilə
export function useSubmitAnswer(sessionId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (answer: QuizAnswer) =>
      api.post(`/api/quiz/session/${sessionId}/answer`, answer).then(r => r.data),

    // Optimistic update — server cavabını gözləmədən UI yenilə
    onMutate: async (answer) => {
      await qc.cancelQueries({ queryKey: quizKeys.session(sessionId) })
      const prev = qc.getQueryData<QuizSession>(quizKeys.session(sessionId))

      qc.setQueryData<QuizSession>(quizKeys.session(sessionId), old => {
        if (!old) return old
        return {
          ...old,
          answers:      [...old.answers, answer],
          currentIndex: old.currentIndex + 1,
        }
      })

      return { prev }
    },

    // Xəta — geri al
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(quizKeys.session(sessionId), ctx.prev)
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: quizKeys.session(sessionId) })
    },
  })
}

// Testi bitir
export function useCompleteQuiz(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post<QuizResult>(`/api/quiz/session/${sessionId}/complete`).then(r => r.data),
    onSuccess: (result) => {
      qc.setQueryData(quizKeys.result(sessionId), result)
      // Dashboard + Statistics cache — hamısını invalidate et
      qc.invalidateQueries({ queryKey: ['my-statistics'], exact: false })
      qc.invalidateQueries({ queryKey: ['my-results'],    exact: false })
      qc.invalidateQueries({ queryKey: ['statistics'] })
      qc.invalidateQueries({ queryKey: ['wrong-questions'] })
    },
  })
}
