import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'
import type { ApiError, FirestoreStats, FirestoreResult } from '../types/models'
import {
  dbGetProfile, dbSaveProfile,
  dbGetStats, dbGetResults, dbSaveTestResult,
  dbGetNotifications, dbMarkNotificationRead, dbMarkAllNotificationsRead,
  dbGetMyGroups, dbCreateGroup, dbAddStudentToGroup,
  dbGetProfileByUid, dbGetProfilesByUids, dbGetUserByUniqueId, dbSearchUser,
  dbGetIncomingPermissions, dbGetSentPermissions, dbSendPermission,
  dbRespondPermission, dbRevokePermission,
  dbGetMyExams, dbCreateExam, dbActivateExam, type CreateExamInput,
  dbGetBalance, dbTopUp, dbGetPaymentHistory,
  dbGetSentMessages, dbSendMessage,
  dbSendParentRequest, dbGetParentRequests, dbGetIncomingParentRequests,
  dbRespondParentRequest, dbGetMyChildren, dbDisconnectChild,
  dbGetGroupsByStudentUid, dbGetGroupMessages,
  dbGetAllParentMessages, dbGetParentTeacherMessages, dbSendParentTeacherMessage,
  dbGetExamsForStudent, dbNotifyExamAssigned, dbGetIncomingParentMessages,
  dbTeacherReplyToParent,
  dbCreateHomework, dbGetTeacherHomeworks, dbGetGroupHomeworks,
  dbSaveHomeworkAttempt, dbGetHomeworkAttempts, dbGetMyHomeworkAttempts,
  dbCreateSinaqExam, dbGetTeacherSinaqExams, dbGetSinaqExamsForStudent,
  dbSaveSinaqAttempt, dbGetSinaqAttempts, dbGetMySinaqAttempt, dbMarkSinaqSummarySent,
  dbGetStudentHomeworkAttemptsByUid, dbGetStudentSinaqAttemptsByUid,
  dbGetChildHomeworkAttempts, dbGetChildSharedExamAttempts,
  dbGetPermittedStudents, dbShareSinaqWithParents,
  dbGetParentUidsByStudentUid, dbTeacherMessageParent,
  dbGetGroupHomeworkResults,
  dbTeacherSendDirectMessage,
  dbGetReceivedMessages,
  dbGetAllMyHomeworkAttempts,
} from './db'

// Axios instance — gələcəkdə real backend üçün saxlanılır
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const backendUrl = import.meta.env.VITE_API_URL
    if (error.response?.status === 401 && !original._retry && backendUrl) {
      original._retry = true
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/refresh`,
          { refreshToken: useAuthStore.getState().refreshToken }
        )
        useAuthStore.getState().setToken(data.token, data.refreshToken)
        original.headers!.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Statistics ───────────────────────────────────────────────────────────────
export const apiGetMyStatistics      = (): Promise<FirestoreStats>       => dbGetStats() as Promise<FirestoreStats>
export const apiGetStudentStatistics = (email: string): Promise<FirestoreStats> => dbGetStats(email) as Promise<FirestoreStats>
export const apiGetChildStatistics   = (email: string): Promise<FirestoreStats> => dbGetStats(email) as Promise<FirestoreStats>
export const apiGetMyResults         = (): Promise<FirestoreResult[]>    => dbGetResults() as Promise<FirestoreResult[]>
export const apiGetChildResults      = (email: string): Promise<FirestoreResult[]> => dbGetResults(email) as Promise<FirestoreResult[]>

// ─── User ─────────────────────────────────────────────────────────────────────
export const apiGetUserByUniqueId  = (uniqueId: string) => dbGetUserByUniqueId(uniqueId)
export const apiSearchUser         = (query: string)   => dbSearchUser(query)
export const apiGetProfile        = ()           => dbGetProfile()
export const apiUpdateProfile     = (data: any)  => dbSaveProfile(data)

// ─── Permissions ──────────────────────────────────────────────────────────────
export const apiGetIncomingPermissions = ()  => dbGetIncomingPermissions()
export const apiGetSentPermissions     = ()  => dbGetSentPermissions()
export const apiSendTeacherPermission  = (receiverUniqueId: string, subject: string, studentUid?: string) =>
  dbSendPermission(receiverUniqueId, subject, studentUid)
export const apiRespondPermission = (permId: string, approved: boolean) =>
  dbRespondPermission(permId, approved)
export const apiRevokePermission  = (permId: string) => dbRevokePermission(permId)

// ─── Groups ───────────────────────────────────────────────────────────────────
export const apiGetMyGroups        = ()  => dbGetMyGroups()
export const apiCreateGroup        = (name: string, subject: string, maxSize: number, grade?: number) =>
  dbCreateGroup(name, subject, maxSize, grade)
export const apiInviteToGroup      = (groupId: string | number, studentUid: string) =>
  dbAddStudentToGroup(String(groupId), studentUid)
export const apiGetStudentProfile      = (targetUid: string) => dbGetProfileByUid(targetUid)
export const apiGetExamsForStudent     = ()                  => dbGetExamsForStudent()
export const apiNotifyExamAssigned     = (exam: any)         => dbNotifyExamAssigned(exam)
export const apiGetIncomingParentMsgs  = ()                  => dbGetIncomingParentMessages()
export const apiReplyAsTeacher         = (parentUid: string, childUid: string, text: string) => dbTeacherReplyToParent(parentUid, childUid, text)
export const apiGetStudentProfiles = (uids: string[])    => dbGetProfilesByUids(uids)
export const apiGetStudentStatsByUid    = (targetUid: string) => dbGetStats(targetUid)
export const apiGetStudentResultsByUid  = (targetUid: string) => dbGetResults(targetUid)

// ─── Notifications ────────────────────────────────────────────────────────────
export const apiGetMyNotifications       = ()  => dbGetNotifications()
export const apiGetUnreadNotifications   = ()  => dbGetNotifications().then(ns => ns.filter((n: any) => !n.read))
export const apiMarkNotificationRead     = (id: string | number) => dbMarkNotificationRead(String(id))
export const apiMarkAllNotificationsRead = ()  => dbMarkAllNotificationsRead()
export const apiSendNotification         = (_data: any) => Promise.resolve({ success: true })

// ─── Exams ────────────────────────────────────────────────────────────────────
export const apiGetMyExams   = ()           => dbGetMyExams()
export const apiCreateExam   = (data: CreateExamInput) => dbCreateExam(data)
export const apiActivateExam = (id: string) => dbActivateExam(id)

// ─── Homeworks ────────────────────────────────────────────────────────────────
export const apiCreateHomework        = (data: any)    => dbCreateHomework(data)
export const apiGetTeacherHomeworks   = ()             => dbGetTeacherHomeworks()
export const apiGetGroupHomeworks     = (gid: string)  => dbGetGroupHomeworks(gid)
export const apiGetHomeworkAttempts   = (hid: string)  => dbGetHomeworkAttempts(hid)
export const apiGetMyHomeworkAttempts = (hid: string)  => dbGetMyHomeworkAttempts(hid)
export const apiSaveHomeworkAttempt   = (data: any)    => dbSaveHomeworkAttempt(data)

// ─── Payment ──────────────────────────────────────────────────────────────────
export const apiGetBalance        = ()              => dbGetBalance()
export const apiGetPaymentHistory = ()              => dbGetPaymentHistory()
export const apiTopUp             = (amount: number) => dbTopUp(amount)

// ─── Parent–Child connections ─────────────────────────────────────────────────
export const apiSendParentRequest         = (childUid: string, childUniqueId: string) => dbSendParentRequest(childUid, childUniqueId)
export const apiGetParentRequests         = ()                      => dbGetParentRequests()
export const apiGetIncomingParentRequests = ()                      => dbGetIncomingParentRequests()
export const apiRespondParentRequest      = (id: string, ok: boolean) => dbRespondParentRequest(id, ok)
export const apiGetMyChildren             = ()                      => dbGetMyChildren()
export const apiDisconnectChild           = (childUid: string)      => dbDisconnectChild(childUid)

// ─── Messages ─────────────────────────────────────────────────────────────────
export const apiGetSentMessages = ()          => dbGetSentMessages()
export const apiSendMessage     = (data: any) => dbSendMessage(data)

// ─── Parent – Teacher messaging & group queries ───────────────────────────────
export const apiGetGroupsByStudentUid      = (studentUid: string)                                  => dbGetGroupsByStudentUid(studentUid)
export const apiGetGroupMessages           = (groupId: string)                                      => dbGetGroupMessages(groupId)
export const apiGetAllParentMessages       = ()                                                     => dbGetAllParentMessages()
export const apiGetParentTeacherMessages   = (teacherUid: string, childUid: string)                => dbGetParentTeacherMessages(teacherUid, childUid)
export const apiSendParentTeacherMessage   = (teacherUid: string, childUid: string, text: string)  => dbSendParentTeacherMessage(teacherUid, childUid, text)

// ─── Sinaq İmtahanları ────────────────────────────────────────────────────────
export const apiCreateSinaqExam              = (data: any)    => dbCreateSinaqExam(data)
export const apiGetTeacherSinaqExams         = ()             => dbGetTeacherSinaqExams()
export const apiGetSinaqExamsForStudent      = ()             => dbGetSinaqExamsForStudent()
export const apiSaveSinaqAttempt             = (data: any)    => dbSaveSinaqAttempt(data)
export const apiGetSinaqAttempts             = (eid: string)  => dbGetSinaqAttempts(eid)
export const apiGetMySinaqAttempt            = (eid: string)  => dbGetMySinaqAttempt(eid)
export const apiMarkSinaqSummarySent         = (eid: string, teacherUid: string, summary: any) =>
  dbMarkSinaqSummarySent(eid, teacherUid, summary)
export const apiShareSinaqWithParents        = (eid: string, gid: string) => dbShareSinaqWithParents(eid, gid)

// ─── Cross-user / Permission-gated data ──────────────────────────────────────
export const apiGetStudentHomeworkAttempts   = (uid: string) => dbGetStudentHomeworkAttemptsByUid(uid)
export const apiGetStudentSinaqAttempts      = (uid: string) => dbGetStudentSinaqAttemptsByUid(uid)
export const apiGetChildHomeworkAttempts     = (uid: string) => dbGetChildHomeworkAttempts(uid)
export const apiGetChildSharedExamAttempts   = (uid: string) => dbGetChildSharedExamAttempts(uid)
export const apiGetPermittedStudents         = ()             => dbGetPermittedStudents()
export const apiGetParentUidsByStudentUid    = (uid: string) => dbGetParentUidsByStudentUid(uid)
export const apiTeacherMessageParent         = (parentUid: string, childUid: string, text: string) =>
  dbTeacherMessageParent(parentUid, childUid, text)
export const apiTeacherSendDirectMessage     = (recipientId: string, text: string) =>
  dbTeacherSendDirectMessage(recipientId, text)
export const apiGetGroupHomeworkResults      = (gid: string) => dbGetGroupHomeworkResults(gid)
export const apiGetReceivedMessages          = () => dbGetReceivedMessages()
export const apiGetAllMyHomeworkAttempts     = () => dbGetAllMyHomeworkAttempts()

// ─── Quiz / Assessment ────────────────────────────────────────────────────────
export const apiGetAssessmentQuestions = (_sessionId: string) => Promise.resolve([])

// ─── Test nəticəsini Firestore-a yaz ─────────────────────────────────────────
export { dbSaveTestResult }
