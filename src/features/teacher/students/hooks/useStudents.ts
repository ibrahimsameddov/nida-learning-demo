import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import type { Student, TeacherPermission, PermissionStatus } from '../../../../types/models'

export const studentKeys = {
  all:        ['students'] as const,
  byTeacher:  (teacherId: string) => [...studentKeys.all, 'teacher', teacherId] as const,
  permissions:(teacherId: string) => [...studentKeys.all, 'permissions', teacherId] as const,
}

export function useTeacherStudents(teacherId: string) {
  return useQuery({
    queryKey: studentKeys.byTeacher(teacherId),
    queryFn:  () =>
      api.get<Student[]>(`/api/teacher/${teacherId}/students`).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchStudent() {
  return useMutation({
    mutationFn: (studentId: string) =>
      api.get<Student>(`/api/students/${studentId}`).then(r => r.data),
  })
}

export function useRequestPermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { studentId: string; subject: string }) =>
      api.post<TeacherPermission>('/api/permissions/request', data).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: studentKeys.permissions(vars.studentId) })
    },
  })
}

export function useUpdatePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PermissionStatus }) =>
      api.patch<TeacherPermission>(`/api/permissions/${id}`, { status }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}
