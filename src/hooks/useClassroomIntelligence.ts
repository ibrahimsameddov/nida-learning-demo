// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  dbGetMyGroups, dbGetGroupStudentStats, dbGetResults,
  dbGetTeacherInterventions, dbSaveIntervention,
  dbActionIntervention, dbDismissIntervention,
} from '@/lib/db'
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
  const qc         = useQueryClient()

  const query = useQuery({
    queryKey: ['group-insights', groupId],
    enabled:  !!groupId && !!teacherUid,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const students = await dbGetGroupStudentStats(groupId)
      if (!students.length) return null

      // Fetch results for each student
      const resultsMap: Record<string, any[]> = {}
      await Promise.all(
        students.map(async s => {
          const r = await dbGetResults(s.uid).catch(() => [])
          resultsMap[s.uid] = r as any[]
        })
      )

      const studentNames: Record<string, string> = {}
      students.forEach(s => { studentNames[s.uid] = s.name })

      const interventions    = detectInterventions(students, resultsMap, teacherUid, groupId)
      const weakTopics       = detectWeakTopics(resultsMap, studentNames)
      const inactiveStudents = analyzeActivityPatterns(students)
      const groupERI         = computeGroupERI(students.map(s => s.subjectStats))

      // Persist new interventions
      await Promise.all(interventions.map(i => dbSaveIntervention(i).catch(() => {})))

      return { interventions, weakTopics, inactiveStudents, groupERI }
    },
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, actionType }: { id: string; actionType: string }) =>
      dbActionIntervention(id, actionType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group-insights', groupId] }),
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dbDismissIntervention(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group-insights', groupId] }),
  })

  return {
    interventions:    query.data?.interventions    ?? [],
    weakTopics:       query.data?.weakTopics       ?? [],
    inactiveStudents: query.data?.inactiveStudents ?? [],
    groupERI:         query.data?.groupERI         ?? 0,
    isLoading:        query.isLoading,
    actionIntervention:   actionMutation.mutate,
    dismissIntervention:  dismissMutation.mutate,
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
      const groups = await dbGetMyGroups()
      const summaries = await Promise.all(
        groups.map(async (g: any) => {
          const students = await dbGetGroupStudentStats(g.id).catch(() => [])
          const eri      = computeGroupERI(students.map((s: any) => s.subjectStats))
          const pending  = await dbGetTeacherInterventions(teacherUid)
            .then((list: any[]) => list.filter((i: any) => i.groupId === g.id).length)
            .catch(() => 0)
          return {
            id:           g.id,
            name:         g.name,
            subject:      g.subject,
            studentCount: students.length,
            groupERI:     eri,
            pendingCount: pending,
          }
        })
      )
      return summaries
    },
  })
}

// ── Saved Interventions ────────────────────────────────────────────────────────

export function useSavedInterventions() {
  const teacherUid = useAuthStore(s => s.user?.id ?? '')
  const qc         = useQueryClient()

  const query = useQuery({
    queryKey: ['saved-interventions', teacherUid],
    enabled:  !!teacherUid,
    staleTime: 60_000,
    queryFn:  () => dbGetTeacherInterventions(teacherUid),
  })

  const action  = useMutation({
    mutationFn: ({ id, actionType }: { id: string; actionType: string }) =>
      dbActionIntervention(id, actionType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-interventions', teacherUid] }),
  })

  const dismiss = useMutation({
    mutationFn: (id: string) => dbDismissIntervention(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['saved-interventions', teacherUid] }),
  })

  return {
    interventions: (query.data ?? []) as Intervention[],
    isLoading:     query.isLoading,
    action:        action.mutate,
    dismiss:       dismiss.mutate,
  }
}
