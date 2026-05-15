// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  apiGetMyGroups, apiGetGroup,
  apiGetStudentStatistics, apiGetChildResults,
} from '@/lib/api'
import {
  detectInterventions, detectWeakTopics, analyzeActivityPatterns, computeGroupERI,
  type Intervention, type WeakTopic, type InactiveStudent,
} from '@/lib/classroomIntelligence'

// ── Group Insights ─────────────────────────────────────────────────────────────

export interface GroupInsights {
  groupId:          string
  groupName:        string
  subject:          string
  studentCount:     number
  groupERI:         number
  interventions:    Intervention[]
  weakTopics:       WeakTopic[]
  inactiveStudents: InactiveStudent[]
}

export function useGroupInsights(groupId: string) {
  const teacherUid = useAuthStore(s => s.user?.id ?? '')

  const query = useQuery({
    queryKey: ['group-insights', groupId],
    enabled:  !!groupId && !!teacherUid,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const group = await apiGetGroup(groupId)
      const studentIds: number[] = group?.studentIds ?? group?.studentUids ?? []
      if (!studentIds.length) return null

      const [statsArr, resultsArr] = await Promise.all([
        Promise.all(studentIds.map((id: number) => apiGetStudentStatistics(id).catch(() => null))),
        Promise.all(studentIds.map((id: number) => apiGetChildResults(id).catch(() => []))),
      ])

      // Normalise to the shape detectInterventions / computeGroupERI expect
      const students = statsArr
        .map((s, i) => s ? { ...s, uid: String(studentIds[i]), id: studentIds[i] } : null)
        .filter(Boolean)

      const resultsMap: Record<string, any[]> = {}
      students.forEach((s, i) => { resultsMap[s.uid] = resultsArr[i] ?? [] })

      const studentNames: Record<string, string> = {}
      students.forEach(s => { studentNames[s.uid] = s.fullName ?? s.name ?? String(s.id) })

      const weakTopics       = detectWeakTopics(resultsMap, studentNames)
      const inactiveStudents = analyzeActivityPatterns(students)
      const groupERI         = computeGroupERI(students.map(s => s.subjectStats ?? []))

      // Interventions not yet in backend — return empty
      const interventions: Intervention[] = []

      return { interventions, weakTopics, inactiveStudents, groupERI }
    },
  })

  // Mutation stubs — interventions not yet in backend
  const qc = useQueryClient()
  const noopMutate = useMutation({ mutationFn: async () => {} })

  return {
    interventions:    query.data?.interventions    ?? [],
    weakTopics:       query.data?.weakTopics       ?? [],
    inactiveStudents: query.data?.inactiveStudents ?? [],
    groupERI:         query.data?.groupERI         ?? 0,
    isLoading:        query.isLoading,
    actionIntervention:  noopMutate.mutate,
    dismissIntervention: noopMutate.mutate,
  }
}

// ── All Groups Overview ────────────────────────────────────────────────────────

export interface GroupSummary {
  id:           string
  name:         string
  subject:      string
  studentCount: number
  groupERI:     number
  pendingCount: number
}

export function useAllGroupsOverview() {
  const teacherUid = useAuthStore(s => s.user?.id ?? '')

  return useQuery<GroupSummary[]>({
    queryKey: ['all-groups-overview', teacherUid],
    enabled:  !!teacherUid,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const groups = await apiGetMyGroups()
      const summaries = await Promise.all(
        groups.map(async (g: any) => {
          const studentIds: number[] = g.studentIds ?? g.studentUids ?? []
          const statsArr = await Promise.all(
            studentIds.map((id: number) => apiGetStudentStatistics(id).catch(() => null))
          )
          const students = statsArr.filter(Boolean)
          const eri = computeGroupERI(students.map((s: any) => s.subjectStats ?? []))
          return {
            id:           g.id,
            name:         g.name,
            subject:      g.subject,
            studentCount: studentIds.length,
            groupERI:     eri,
            pendingCount: 0, // interventions not yet in backend
          }
        })
      )
      return summaries
    },
  })
}

// ── Saved Interventions ────────────────────────────────────────────────────────
// Interventions not yet in backend — returns empty list

export function useSavedInterventions() {
  const noopMutate = useMutation({ mutationFn: async () => {} })

  return {
    interventions: [] as Intervention[],
    isLoading:     false,
    action:        noopMutate.mutate,
    dismiss:       noopMutate.mutate,
  }
}
