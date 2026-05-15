import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'
import type {
  StatisticsDto, TestResultDto, UserDto, GroupDto,
  NotificationDto, MessageDto, HomeworkDto, HomeworkAttemptDto,
  ExamDto, ExamResultDto, PracticeExamDto, PracticeAttemptDto,
  GamificationDto, PermissionDto, PaymentDto, LiveSessionDto,
  TestSessionDto, InviteDto, ParentChildDto,
} from '../types/backend'

// Re-export all backend DTO types — consumers import from here instead of types/backend
export type {
  UserDto, GroupDto, HomeworkDto, HomeworkAttemptDto,
  ExamDto, ExamResultDto, PracticeExamDto, PracticeAttemptDto,
  NotificationDto, MessageDto, LiveSessionDto,
  StatisticsDto, GamificationDto, BadgeDto,
  PaymentDto, PermissionDto, TestSessionDto, TestResultDto,
  InviteDto, ParentChildDto,
} from '../types/backend'

// ─── Axios instance ────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// Azerbaijani error messages for HTTP status codes
const AZ_HTTP: Record<number, string> = {
  400: 'Yanlış sorğu — məlumatları yoxlayın',
  401: 'Giriş tələb olunur',
  403: 'Bu əməliyyata icazəniz yoxdur',
  404: 'Məlumat tapılmadı',
  409: 'Bu məlumat artıq mövcuddur',
  422: 'Göndərilən məlumat düzgün deyil',
  429: 'Çox cəhd — bir az gözləyin',
  500: 'Server xətası — yenidən cəhd edin',
  503: 'Xidmət müvəqqəti əlçatmazdır',
}

function extractErrorMessage(error: AxiosError<any>): string {
  const backendMsg = error.response?.data?.message
  if (backendMsg && typeof backendMsg === 'string' && backendMsg.length < 200) return backendMsg
  const status = error.response?.status
  if (status && AZ_HTTP[status]) return AZ_HTTP[status]
  if (!error.response) return 'Serverə qoşulmaq mümkün olmadı'
  return 'Xəta baş verdi'
}

type RequestConfigExt = InternalAxiosRequestConfig & { _retry?: boolean; _silent?: boolean }

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async (error: AxiosError<any>) => {
    const original = error.config as RequestConfigExt
    const status   = error.response?.status

    // ── 401: token refresh, then retry once ──
    if (status === 401 && !original._retry) {
      original._retry = true
      const { refreshToken } = useAuthStore.getState()
      if (refreshToken) {
        try {
          const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
          const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken })
          useAuthStore.getState().setToken(data.token, data.refreshToken)
          original.headers!.Authorization = `Bearer ${data.token}`
          return api(original)
        } catch {
          // refresh failed — fall through to logout
        }
      }
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── Show error toast for all other failures (unless silent) ──
    if (!original?._silent && !axios.isCancel(error) && status !== 401) {
      const msg = extractErrorMessage(error)
      import('./toast-shim').then(({ default: toast }) => toast.error(msg))
    }

    return Promise.reject(error)
  },
)

/** Pass { _silent: true } in axios config to suppress automatic error toasts */
export function silent<T>(promise: Promise<T>): Promise<T> {
  return promise
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uw = <T = any>(res: { data: { data: T } }): T => res.data.data
// Returns -1 when no backend session exists (Firebase-only auth).
// Callers get a rejected promise (HTTP 404/network) instead of a sync throw.
const bid = (): number => useAuthStore.getState().backendId ?? -1
const role = (): string => useAuthStore.getState().user?.role?.toLowerCase() ?? 'student'

// ─── Auth extras ──────────────────────────────────────────────────────────────
export const apiLogout = () =>
  api.post('/api/auth/logout', { userId: bid() }).catch(() => {})

export const apiResendVerification = (email: string) =>
  api.post('/api/auth/resend-verification', { email })

export const apiForgotPassword = (email: string) =>
  api.post('/api/auth/forgot-password', { email })

export const apiResetPassword = (token: string, newPassword: string) =>
  api.post('/api/auth/reset-password', { token, newPassword })

export const apiVerifyEmail = (token: string) =>
  api.get('/api/auth/verify', { params: { token } })

export const apiChangePassword = (currentPassword: string, newPassword: string) =>
  api.post('/api/auth/change-password', { currentPassword, newPassword, userId: bid() }).then(uw)

// ─── Interventions ────────────────────────────────────────────────────────────
export const apiGetInterventions = (): Promise<any[]> =>
  api.get(`/api/interventions/teacher/${bid()}`).then(uw)

export const apiGetPendingInterventions = (): Promise<any[]> =>
  api.get(`/api/interventions/teacher/${bid()}/pending`).then(uw)

export const apiCreateIntervention = (data: any): Promise<any> =>
  api.post(`/api/interventions/teacher/${bid()}`, data).then(uw)

export const apiActionIntervention = (id: string | number, action: string): Promise<any> =>
  api.put(`/api/interventions/${id}/action`, { action }, { params: { teacherId: bid() } }).then(uw)

export const apiDismissIntervention = (id: string | number): Promise<any> =>
  api.put(`/api/interventions/${id}/dismiss`, null, { params: { teacherId: bid() } }).then(uw)

// ─── Weekly Reports ───────────────────────────────────────────────────────────
export const apiCreateWeeklyReport = (data: any): Promise<any> =>
  api.post('/api/reports/weekly', data).then(uw)

export const apiGetStudentWeeklyReports = (studentId?: number): Promise<any[]> =>
  api.get(`/api/reports/weekly/student/${studentId ?? bid()}`).then(uw)

export const apiGetParentWeeklyReports = (): Promise<any[]> =>
  api.get(`/api/reports/weekly/parent/${bid()}`).then(uw)

export const apiGetStudentReportsForParent = (studentId: number): Promise<any[]> =>
  api.get(`/api/reports/weekly/student/${studentId}/parent/${bid()}`).then(uw)

export const apiGetUnreadReports = (): Promise<any[]> =>
  api.get(`/api/reports/weekly/parent/${bid()}/unread`).then(uw)

export const apiMarkReportRead = (reportId: string | number): Promise<any> =>
  api.put(`/api/reports/weekly/${reportId}/read`).then(uw)

// ─── User search by uniqueId (alternate path) ─────────────────────────────────
export const apiSearchByUniqueId = (uniqueId: string): Promise<UserDto> =>
  api.get(`/api/users/search/unique-id/${uniqueId}`).then(uw)

// ─── Statistics / Analytics ───────────────────────────────────────────────────
export const apiGetMyStatistics      = (): Promise<StatisticsDto>   => api.get(`/api/analytics/students/${bid()}`).then(uw)
export const apiGetStudentStatistics = (targetId: number): Promise<StatisticsDto> => api.get(`/api/analytics/students/${targetId}`).then(uw)
export const apiGetChildStatistics   = (targetId: number): Promise<StatisticsDto> => api.get(`/api/analytics/students/${targetId}`).then(uw)
export const apiGetMyResults         = (): Promise<TestResultDto[]> => api.get(`/api/tests/student/${bid()}/results`).then(uw)
export const apiGetChildResults      = (targetId: number): Promise<TestResultDto[]> => api.get(`/api/tests/student/${targetId}/results`).then(uw)
export const apiGetDailyStats        = (studentId?: number) => api.get(`/api/analytics/students/${studentId ?? bid()}/daily`).then(uw)
export const apiGetWeeklyStats       = (studentId?: number) => api.get(`/api/analytics/students/${studentId ?? bid()}/weekly`).then(uw)
export const apiGetProgress          = (studentId?: number) => api.get(`/api/analytics/students/${studentId ?? bid()}/progress`).then(uw)
export const apiGetProgressBySubject = (subject: string, studentId?: number) => api.get(`/api/analytics/students/${studentId ?? bid()}/progress/${subject}`).then(uw)
export const apiGetStatsBySubject    = (subject: string, studentId?: number) => api.get(`/api/analytics/students/${studentId ?? bid()}/subject/${subject}`).then(uw)

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const apiGetStudentDashboard  = () => api.get(`/api/dashboard/student/${bid()}`).then(uw)
export const apiGetTeacherDashboard  = () => api.get(`/api/dashboard/teacher/${bid()}`).then(uw)
export const apiGetParentDashboard   = () => api.get(`/api/dashboard/parent/${bid()}`).then(uw)

// ─── User / Profile ───────────────────────────────────────────────────────────
export const apiGetProfile = (): Promise<UserDto> => {
  const r = role()
  const path = r === 'student'
    ? `/api/users/students/id/${bid()}`
    : `/api/users/${r}s/${bid()}`
  return api.get(path).then(uw)
}

export const apiUpdateProfile         = (data: any): Promise<UserDto>   => api.put(`/api/users/${role()}s/${bid()}/profile`, data).then(uw)
export const apiGetUserByUniqueId     = (uniqueId: string): Promise<UserDto> => api.get(`/api/users/students/${uniqueId}`).then(uw)
export const apiSearchUser            = (query: string): Promise<UserDto[]>  => api.get('/api/users/search', { params: { query } }).then(uw)
export const apiGetStudentProfile     = (targetId: number): Promise<UserDto> => api.get(`/api/users/students/id/${targetId}`).then(uw)
export const apiGetTeacherById        = (id: number): Promise<UserDto>       => api.get(`/api/users/teachers/${id}`).then(uw)
export const apiGetParentById         = (id: number): Promise<UserDto>       => api.get(`/api/users/parents/${id}`).then(uw)
export const apiGetStudentProfiles    = (ids: number[]): Promise<UserDto[]>  => Promise.all(ids.map(id => api.get(`/api/users/students/id/${id}`).then(uw)))
export const apiDeleteUser            = (userId: number) => api.delete(`/api/users/${userId}`).then(uw)
export const apiGetStudentStatsByUid   = (targetId: number): Promise<StatisticsDto>   => apiGetStudentStatistics(targetId)
export const apiGetStudentResultsByUid = (targetId: number): Promise<TestResultDto[]> => apiGetChildResults(targetId)

// ─── Permissions ──────────────────────────────────────────────────────────────
export const apiGetIncomingPermissions = (): Promise<PermissionDto[]> =>
  api.get(`/api/permissions/incoming/${bid()}`).then(uw)

export const apiGetSentPermissions = (): Promise<PermissionDto[]> =>
  api.get(`/api/permissions/sent/${bid()}`).then(uw)

export const apiGetGrantedPermissions = (): Promise<PermissionDto[]> =>
  api.get(`/api/permissions/granted/${bid()}`).then(uw)

export const apiGetPermittedStudents = (): Promise<PermissionDto[]> =>
  api.get(`/api/permissions/teacher/${bid()}/students`).then(uw)

export const apiSendTeacherPermission = (receiverUniqueId: string, subject: string): Promise<PermissionDto> =>
  api.post(`/api/permissions/send/${bid()}`, { receiverUniqueId, subject }).then(uw)

// respond: studentId + approved query params
export const apiRespondPermission = (permId: string, approved: boolean): Promise<PermissionDto> =>
  api.put(`/api/permissions/${permId}/respond`, null, { params: { studentId: bid(), approved } }).then(uw)

// revoke: studentId query param
export const apiRevokePermission = (permId: string): Promise<PermissionDto> =>
  api.put(`/api/permissions/${permId}/revoke`, null, { params: { studentId: bid() } }).then(uw)

// ─── Groups ───────────────────────────────────────────────────────────────────
export const apiGetMyGroups = (): Promise<GroupDto[]> =>
  api.get(`/api/groups/${role()}/${bid()}`).then(uw)

export const apiGetGroupsByStudentUid = (studentId: number): Promise<GroupDto[]> =>
  api.get(`/api/groups/student/${studentId}`).then(uw)

export const apiGetGroup = (groupId: string | number): Promise<GroupDto> =>
  api.get(`/api/groups/${groupId}`).then(uw)

export const apiGetGroupInvites = (groupId: string | number): Promise<InviteDto[]> =>
  api.get(`/api/groups/${groupId}/invites`).then(uw)

export const apiGetStudentInvites = (studentId?: number): Promise<InviteDto[]> =>
  api.get(`/api/groups/invites/student/${studentId ?? bid()}`).then(uw)

export const apiCreateGroup = (name: string, subject: string, maxSize: number, grade?: number): Promise<GroupDto> =>
  api.post(`/api/groups/create/${bid()}`, { name, subject: subject.toUpperCase(), maxSize, grade }).then(uw)

// invite: teacherId + studentUniqueId as query params (NOT body)
export const apiInviteToGroup = (groupId: string | number, studentUniqueId: string): Promise<InviteDto> =>
  api.post(`/api/groups/${groupId}/invite`, null, { params: { teacherId: bid(), studentUniqueId } }).then(uw)

// respond invite: studentId + accepted as query params
export const apiRespondGroupInvite = (inviteId: number, accepted: boolean): Promise<InviteDto> =>
  api.put(`/api/groups/invites/${inviteId}/respond`, null, { params: { studentId: bid(), accepted } }).then(uw)

// remove student: teacherId query param
export const apiRemoveStudentFromGroup = (groupId: number, studentId: number) =>
  api.delete(`/api/groups/${groupId}/students/${studentId}`, { params: { teacherId: bid() } }).then(uw)

// delete group: teacherId query param
export const apiDeleteGroup = (groupId: number) =>
  api.delete(`/api/groups/${groupId}`, { params: { teacherId: bid() } }).then(uw)

// ─── Notifications ────────────────────────────────────────────────────────────
export const apiGetMyNotifications = (): Promise<NotificationDto[]> =>
  api.get(`/api/notifications/user/${bid()}`).then(uw)

export const apiGetUnreadNotifications = (): Promise<NotificationDto[]> =>
  api.get(`/api/notifications/user/${bid()}/unread`).then(uw)

export const apiGetNotificationCount = (): Promise<number> =>
  api.get(`/api/notifications/user/${bid()}/count`).then(uw)

// markAsRead: userId query param
export const apiMarkNotificationRead = (id: string | number) =>
  api.put(`/api/notifications/${id}/read`, null, { params: { userId: bid() } }).then(uw)

export const apiMarkAllNotificationsRead = () =>
  api.put(`/api/notifications/user/${bid()}/read-all`).then(uw)

export const apiSendNotification = (data: any): Promise<NotificationDto> =>
  api.post('/api/notifications/send', data).then(uw)

export const apiNotifyExamAssigned = (data: any): Promise<NotificationDto> =>
  api.post('/api/notifications/send', data).then(uw)

// ─── Exams ────────────────────────────────────────────────────────────────────
export const apiGetMyExams = (): Promise<ExamDto[]> =>
  api.get(`/api/exams/teacher/${bid()}`).then(uw)

export const apiGetExamsForStudent = (): Promise<ExamDto[]> =>
  api.get(`/api/exams/student/${bid()}`).then(uw)

export const apiGetStudentExamResults = (studentId?: number): Promise<ExamResultDto[]> =>
  api.get(`/api/exams/student/${studentId ?? bid()}/results`).then(uw)

export const apiGetExamResults = (examId: string | number): Promise<ExamResultDto[]> =>
  api.get(`/api/exams/${examId}/results`).then(uw)

export const apiGetExamResultForStudent = (examId: string | number, studentId: number): Promise<ExamResultDto> =>
  api.get(`/api/exams/${examId}/results/student/${studentId}`).then(uw)

export const apiCreateExam = (data: any): Promise<ExamDto> =>
  api.post(`/api/exams/create/${bid()}`, data).then(uw)

// activate / complete: teacherId query param
export const apiActivateExam = (examId: string | number): Promise<ExamDto> =>
  api.put(`/api/exams/${examId}/activate`, null, { params: { teacherId: bid() } }).then(uw)

export const apiCompleteExam = (examId: string | number): Promise<ExamDto> =>
  api.put(`/api/exams/${examId}/complete`, null, { params: { teacherId: bid() } }).then(uw)

// submitResult: studentId, score, maxScore as query params (NOT body)
export const apiSubmitExamResult = (examId: string | number, studentId: number, score: number, maxScore: number): Promise<ExamResultDto> =>
  api.post(`/api/exams/${examId}/result`, null, { params: { studentId, score, maxScore } }).then(uw)

// comment: teacherId query param + comment body
export const apiCommentExamResult = (resultId: number, comment: string): Promise<ExamResultDto> =>
  api.put(`/api/exams/results/${resultId}/comment`, { comment }, { params: { teacherId: bid() } }).then(uw)

// ─── Homeworks ────────────────────────────────────────────────────────────────
export const apiCreateHomework = (data: any): Promise<HomeworkDto> =>
  api.post(`/api/homeworks/create/${bid()}`, data).then(uw)

export const apiGetTeacherHomeworks = (): Promise<HomeworkDto[]> =>
  api.get(`/api/homeworks/teacher/${bid()}`).then(uw)

export const apiGetGroupHomeworks = (gid: string | number): Promise<HomeworkDto[]> =>
  api.get(`/api/homeworks/group/${gid}`).then(uw)

export const apiGetHomeworkAttempts = (hid: string | number): Promise<HomeworkAttemptDto[]> =>
  api.get(`/api/homeworks/${hid}/attempts`).then(uw)

export const apiGetMyHomeworkAttempts = (hid: string | number): Promise<HomeworkAttemptDto[]> =>
  api.get(`/api/homeworks/${hid}/attempts/student/${bid()}`).then(uw)

export const apiGetStudentHomeworkAttempts = (studentId: number): Promise<HomeworkAttemptDto[]> =>
  api.get(`/api/homeworks/student/${studentId}/attempts`).then(uw)

export const apiGetChildHomeworkAttempts = (childId: number): Promise<HomeworkAttemptDto[]> =>
  api.get(`/api/homeworks/student/${childId}/attempts`).then(uw)

export const apiGetAllMyHomeworkAttempts = (): Promise<HomeworkAttemptDto[]> =>
  api.get(`/api/homeworks/student/${bid()}/attempts`).then(uw)

export const apiGetGroupHomeworkResults = (gid: string | number): Promise<HomeworkDto[]> =>
  api.get(`/api/homeworks/group/${gid}`).then(uw)

// submitAttempt: studentId, score, maxScore as query params
export const apiSaveHomeworkAttempt = (data: any): Promise<HomeworkAttemptDto> =>
  api.post(
    `/api/homeworks/${data.homeworkId}/attempt`,
    null,
    { params: { studentId: bid(), score: data.score ?? 0, maxScore: data.maxScore ?? 0 } },
  ).then(uw)

// deleteHomework: teacherId query param
export const apiDeleteHomework = (homeworkId: number) =>
  api.delete(`/api/homeworks/${homeworkId}`, { params: { teacherId: bid() } }).then(uw)

// addComment: teacherId query param + comment body
export const apiCommentHomeworkAttempt = (attemptId: number, comment: string): Promise<HomeworkAttemptDto> =>
  api.put(`/api/homeworks/attempts/${attemptId}/comment`, { comment }, { params: { teacherId: bid() } }).then(uw)

// ─── Payment ──────────────────────────────────────────────────────────────────
export const apiGetBalance = (): Promise<number> =>
  api.get(`/api/payments/balance/${bid()}`).then(uw)

export const apiGetPaymentHistory = (): Promise<PaymentDto[]> =>
  api.get(`/api/payments/history/${bid()}`).then(uw)

export const apiTopUp = (amount: number): Promise<PaymentDto> =>
  api.post(`/api/payments/topup/${bid()}`, { amount }).then(uw)

export const apiGetStudentPayments = (studentId: number): Promise<PaymentDto[]> =>
  api.get(`/api/payments/student/${studentId}`).then(uw)

// subscription + exam: studentId (and examId for exam) as query params
export const apiPaySubscription = (studentId: number): Promise<PaymentDto> =>
  api.post(`/api/payments/subscription/${bid()}`, null, { params: { studentId } }).then(uw)

export const apiPayExamFee = (studentId: number, examId: number): Promise<PaymentDto> =>
  api.post(`/api/payments/exam/${bid()}`, null, { params: { studentId, examId } }).then(uw)

// ─── Parent–Child connections ─────────────────────────────────────────────────
export const apiSendParentRequest = (childId: number): Promise<ParentChildDto> =>
  api.post(`/api/parent-child/request/${bid()}`, { childId }).then(uw)

export const apiGetParentRequests = (): Promise<ParentChildDto[]> =>
  api.get(`/api/parent-child/parent/${bid()}/requests`).then(uw)

export const apiGetIncomingParentRequests = (): Promise<ParentChildDto[]> =>
  api.get(`/api/parent-child/student/${bid()}/requests`).then(uw)

// respond: studentId + accepted as query params (NOT body)
export const apiRespondParentRequest = (requestId: string | number, ok: boolean): Promise<ParentChildDto> =>
  api.put(`/api/parent-child/request/${requestId}/respond`, null, { params: { studentId: bid(), accepted: ok } }).then(uw)

export const apiGetMyChildren = (): Promise<ParentChildDto[]> =>
  api.get(`/api/parent-child/parent/${bid()}/children`).then(uw)

export const apiGetParentUidsByStudentUid = (studentId: number): Promise<ParentChildDto[]> =>
  api.get(`/api/parent-child/student/${studentId}/parents`).then(uw)

// disconnect: parentId + studentId as query params
export const apiDisconnectChild = (childId: number) =>
  api.put('/api/parent-child/disconnect', null, { params: { parentId: bid(), studentId: childId } }).then(uw)

// ─── Messages ─────────────────────────────────────────────────────────────────
export const apiGetSentMessages = (): Promise<MessageDto[]> =>
  api.get(`/api/messages/sent/${bid()}`).then(uw)

export const apiGetReceivedMessages = (): Promise<MessageDto[]> =>
  api.get(`/api/messages/incoming/${bid()}`).then(uw)

export const apiGetGroupMessages = (groupId: string | number): Promise<MessageDto[]> =>
  api.get(`/api/messages/group/${groupId}`).then(uw)

export const apiGetUnreadCount = (): Promise<number> =>
  api.get(`/api/messages/unread/${bid()}`).then(uw)

// conversation: fromId + toId query params
export const apiGetConversation = (fromId: number, toId: number): Promise<MessageDto[]> =>
  api.get('/api/messages/conversation', { params: { fromId, toId } }).then(uw)

// markAsRead: userId query param
export const apiMarkMessageRead = (messageId: number) =>
  api.put(`/api/messages/${messageId}/read`, null, { params: { userId: bid() } }).then(uw)

export const apiSendMessage = (data: any): Promise<MessageDto> =>
  api.post(`/api/messages/send/${bid()}`, data).then(uw)

export const apiTeacherSendDirectMessage = (recipientId: number, text: string): Promise<MessageDto> =>
  api.post(`/api/messages/send/${bid()}`, { toId: recipientId, content: text }).then(uw)

// parent-teacher: parentId, teacherId, childId, content all as query params
export const apiSendParentTeacherMessage = (teacherId: number, childId: number, text: string): Promise<MessageDto> =>
  api.post('/api/messages/parent-teacher', null, {
    params: { parentId: bid(), teacherId, childId, content: text },
  }).then(uw)

export const apiReplyAsTeacher = (parentId: number, childId: number, text: string): Promise<MessageDto> =>
  api.post('/api/messages/parent-teacher', null, {
    params: { parentId, teacherId: bid(), childId, content: text },
  }).then(uw)

export const apiTeacherMessageParent = (parentId: number, childId: number, text: string): Promise<MessageDto> =>
  api.post('/api/messages/parent-teacher', null, {
    params: { parentId, teacherId: bid(), childId, content: text },
  }).then(uw)

export const apiGetAllParentMessages = (): Promise<MessageDto[]> =>
  api.get(`/api/messages/teacher/${bid()}/parent-messages`).then(uw)

export const apiGetIncomingParentMsgs = (): Promise<MessageDto[]> =>
  api.get(`/api/messages/teacher/${bid()}/parent-messages`).then(uw)

// parent-teacher conversation: parentId + teacherId + childId query params
export const apiGetParentTeacherMessages = (teacherId: number, childId: number): Promise<MessageDto[]> =>
  api.get('/api/messages/parent-teacher/conversation', {
    params: { parentId: bid(), teacherId, childId },
  }).then(uw)

// ─── Gamification ─────────────────────────────────────────────────────────────
export const apiGetGamification = (userId?: number): Promise<GamificationDto> =>
  api.get(`/api/gamification/user/${userId ?? bid()}`).then(uw)

export const apiGetUserBadges = (userId?: number) =>
  api.get(`/api/gamification/user/${userId ?? bid()}/badges`).then(uw)

export const apiGetAllBadges = () =>
  api.get('/api/gamification/badges').then(uw)

export const apiGetLeaderboard = () =>
  api.get('/api/gamification/leaderboard').then(uw)

export const apiAddXP = (userId: number, xp: number, reason?: string) =>
  api.post('/api/gamification/xp', { userId, xp, reason }).then(uw)

export const apiCreateBadge = (data: any) =>
  api.post('/api/gamification/badges', data).then(uw)

// updateStreak: streakDays query param
export const apiUpdateStreak = (streakDays: number, userId?: number) =>
  api.put(`/api/gamification/user/${userId ?? bid()}/streak`, null, { params: { streakDays } }).then(uw)

// ─── Live Sessions ────────────────────────────────────────────────────────────
export const apiCreateLiveSession = (data?: any): Promise<LiveSessionDto> =>
  api.post(`/api/live-sessions/create/${bid()}`, data ?? {}).then(uw)

export const apiGetTeacherSessions = (): Promise<LiveSessionDto[]> =>
  api.get(`/api/live-sessions/teacher/${bid()}`).then(uw)

export const apiGetGroupSessions = (groupId: string | number): Promise<LiveSessionDto[]> =>
  api.get(`/api/live-sessions/group/${groupId}`).then(uw)

export const apiGetStudentLiveSessions = (studentId?: number): Promise<LiveSessionDto[]> =>
  api.get(`/api/live-sessions/student/${studentId ?? bid()}`).then(uw)

export const apiGetLiveSession = (sessionId: string | number): Promise<LiveSessionDto> =>
  api.get(`/api/live-sessions/${sessionId}`).then(uw)

// start / end: teacherId query param
export const apiStartLiveSession = (sessionId: string | number): Promise<LiveSessionDto> =>
  api.put(`/api/live-sessions/${sessionId}/start`, null, { params: { teacherId: bid() } }).then(uw)

export const apiEndLiveSession = (sessionId: string | number): Promise<LiveSessionDto> =>
  api.put(`/api/live-sessions/${sessionId}/end`, null, { params: { teacherId: bid() } }).then(uw)

// join / leave: studentId query param
export const apiJoinLiveSession = (sessionId: string | number): Promise<LiveSessionDto> =>
  api.put(`/api/live-sessions/${sessionId}/join`, null, { params: { studentId: bid() } }).then(uw)

export const apiLeaveLiveSession = (sessionId: string | number): Promise<LiveSessionDto> =>
  api.put(`/api/live-sessions/${sessionId}/leave`, null, { params: { studentId: bid() } }).then(uw)

// ─── Practice Exams (Sinaq) ───────────────────────────────────────────────────
export const apiCreateSinaqExam = (data: any): Promise<PracticeExamDto> =>
  api.post(`/api/practice-exams/create/${bid()}`, data).then(uw)

export const apiGetTeacherSinaqExams = (): Promise<PracticeExamDto[]> =>
  api.get(`/api/practice-exams/teacher/${bid()}`).then(uw)

export const apiGetGroupSinaqExams = (gid: string | number): Promise<PracticeExamDto[]> =>
  api.get(`/api/practice-exams/group/${gid}`).then(uw)

export const apiGetSinaqExamsForStudent = (): Promise<PracticeAttemptDto[]> =>
  api.get(`/api/practice-exams/student/${bid()}/attempts`).then(uw)

export const apiGetSinaqAttempts = (eid: string | number): Promise<PracticeAttemptDto[]> =>
  api.get(`/api/practice-exams/${eid}/attempts`).then(uw)

export const apiGetMySinaqAttempt = (eid: string | number): Promise<PracticeAttemptDto> =>
  api.get(`/api/practice-exams/${eid}/attempts/student/${bid()}`).then(uw)

export const apiGetStudentSinaqAttempts = (studentId: number): Promise<PracticeAttemptDto[]> =>
  api.get(`/api/practice-exams/student/${studentId}/attempts`).then(uw)

// shared attempts: scoped by examId (NOT studentId)
export const apiGetChildSharedExamAttempts = (examId: string | number): Promise<PracticeAttemptDto[]> =>
  api.get(`/api/practice-exams/${examId}/attempts/shared`).then(uw)

// activate / complete: teacherId query param
export const apiActivateSinaqExam = (eid: string | number): Promise<PracticeExamDto> =>
  api.put(`/api/practice-exams/${eid}/activate`, null, { params: { teacherId: bid() } }).then(uw)

export const apiCompleteSinaqExam = (eid: string | number): Promise<PracticeExamDto> =>
  api.put(`/api/practice-exams/${eid}/complete`, null, { params: { teacherId: bid() } }).then(uw)

// submitAttempt: studentId, score, maxScore as query params
export const apiSaveSinaqAttempt = (data: any): Promise<PracticeAttemptDto> =>
  api.post(
    `/api/practice-exams/${data.examId}/attempt`,
    null,
    { params: { studentId: bid(), score: data.score ?? 0, maxScore: data.maxScore ?? 0 } },
  ).then(uw)

// addComment: teacherId query param + comment body
export const apiCommentSinaqAttempt = (attemptId: number, comment: string): Promise<PracticeAttemptDto> =>
  api.put(`/api/practice-exams/attempts/${attemptId}/comment`, { comment }, { params: { teacherId: bid() } }).then(uw)

// shareWithParents: teacherId query param
export const apiShareSinaqWithParents = (eid: string | number): Promise<PracticeExamDto> =>
  api.put(`/api/practice-exams/${eid}/share-parents`, null, { params: { teacherId: bid() } }).then(uw)

// markSummarySent: teacherId + summary as query params
export const apiMarkSinaqSummarySent = (eid: string | number, _legacy: string, summary: any): Promise<PracticeExamDto> =>
  api.put(`/api/practice-exams/${eid}/summary-sent`, null, {
    params: { teacherId: bid(), summary: typeof summary === 'string' ? summary : JSON.stringify(summary) },
  }).then(uw)

// ─── Tests / Quiz ─────────────────────────────────────────────────────────────
export const apiGetAssessmentQuestions = () =>
  api.get('/api/tests/assessment/questions').then(uw)

export const apiStartTest = (request?: any): Promise<TestSessionDto> =>
  api.post(`/api/tests/start/${bid()}`, request ?? {}).then(uw)

// answer + finish: studentId query param
export const apiSubmitAnswer = (sessionId: string | number, data: any) =>
  api.post(`/api/tests/${sessionId}/answer`, data, { params: { studentId: bid() } }).then(uw)

export const apiFinishTest = (
  sessionId: string | number,
  result?: { score?: number; maxScore?: number; percent?: number },
): Promise<TestResultDto> =>
  api.post(`/api/tests/${sessionId}/finish`, result ?? null, { params: { studentId: bid() } }).then(uw)

// getSession: studentId query param
export const apiGetTestSession = (sessionId: string | number): Promise<TestSessionDto> =>
  api.get(`/api/tests/${sessionId}`, { params: { studentId: bid() } }).then(uw)

export const apiGetTestResult = (sessionId: string | number): Promise<TestResultDto> =>
  api.get(`/api/tests/${sessionId}/result`).then(uw)

// getStudentSessions: returns List<TestSessionDto>
export const apiGetStudentSessions = (studentId?: number): Promise<TestSessionDto[]> =>
  api.get(`/api/tests/student/${studentId ?? bid()}`).then(uw)

// MathQuiz result saver — starts a session if none exists, then finishes it with score data
export const dbSaveTestResult = async (data: {
  sessionId?:   string | number
  subject?:     string
  correctCount?: number
  correct?:     number
  totalCount?:  number
  total?:       number
  percent?:     number
  [key: string]: unknown
}): Promise<TestResultDto | null> => {
  const resultData = {
    score:    data.correctCount ?? data.correct,
    maxScore: data.totalCount   ?? data.total,
    percent:  data.percent,
  }
  try {
    if (data.sessionId) return await apiFinishTest(data.sessionId, resultData)
    const session = await apiStartTest({ subject: (data.subject ?? 'MATH').toUpperCase() })
    return await apiFinishTest(session.id, resultData)
  } catch {
    return null
  }
}
