// @ts-nocheck
import { addDoc, collection, doc, updateDoc, serverTimestamp, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebaseConfig'

// ── Types ──────────────────────────────────────────────────────────────────────

export type DraftTemplate =
  | 'monthly_summary'
  | 'exam_reminder'
  | 'low_score_alert'
  | 'streak_broken'
  | 'task_reminder'
  | 'exam_result'
  | 'welcome'
  | 'custom'

export type ContextType = 'task' | 'exam' | 'result' | 'warning' | 'announcement' | 'none'

export interface ContextData {
  title:    string
  subject?: string
  dueDate?: string
  score?:   number
  total?:   number
  percent?: number
  examDate?: string
}

export type SystemNotificationType =
  | 'exam_passed' | 'exam_failed' | 'task_completed'
  | 'badge_earned' | 'streak_milestone'
  | 'parent_connected' | 'teacher_approved'
  | 'exam_approaching' | 'weekly_report_ready'

// ── Template draft generator ───────────────────────────────────────────────────

const TEMPLATES: Record<DraftTemplate, (d: Record<string, any>) => string> = {
  monthly_summary: (d) =>
    `Hörmətli valideyn, ${d.studentName ?? 'şagird'} bu ay ${d.totalTests ?? 0} test etdi. ` +
    `Ortalama nəticə ${d.avgScore ?? 0}% oldu. ` +
    `${d.bestSubject ? `${d.bestSubject} fənnində ` : ''}` +
    `${(d.improvement ?? 0) > 0 ? 'yaxşı irəliləyiş var.' : 'əlavə diqqət lazımdır.'}`,

  exam_reminder: (d) =>
    `Salam! ${d.examTitle ?? 'İmtahan'} ` +
    `${d.daysLeft != null ? `${d.daysLeft} gün sonra` : `${d.examDate ?? ''} tarixində`}. ` +
    `Hazırlığınızı artırmanızı tövsiyə edirəm.`,

  low_score_alert: (d) =>
    `${d.studentName ?? 'Şagird'}, ${d.subject ?? ''} fənninin ` +
    `${d.topicName ? `"${d.topicName}" mövzusunda` : 'son nəticələri'} ` +
    `aşağıdır (${d.avgScore ?? 0}%). ` +
    `Əlavə məşq üçün tapşırıq göndərdim.`,

  streak_broken: (d) =>
    `${d.studentName ?? 'Şagird'}-in ${d.streakDays ?? ''} günlük ardıcıllığı pozuldu. ` +
    `Həvəsləndirməyinizi xahiş edirəm.`,

  task_reminder: (d) =>
    `Xatırlatma: "${d.taskTitle ?? 'Tapşırıq'}" tapşırığının son tarixi ${d.dueDate ?? ''}. ` +
    `Hələ tamamlanmayıb.`,

  exam_result: (d) =>
    `${d.studentName ?? 'Şagird'} "${d.examTitle ?? 'imtahan'}" tamamladı. ` +
    `Nəticə: ${d.score ?? 0}/${d.total ?? 0} (${d.percent ?? 0}%). ` +
    `${(d.percent ?? 0) >= 60 ? 'Təbrik edirik! 🎉' : 'Əlavə hazırlıq tövsiyə olunur.'}`,

  welcome: (d) =>
    `Salam ${d.name ?? ''}! NIDA platformasına xoş gəldiniz. ` +
    `${d.groupName ? `${d.groupName} qrupuna əlavə olundunuz.` : ''}`,

  custom: () => '',
}

export function generateDraftText(
  template: DraftTemplate,
  data: Record<string, any>,
  _recipientName?: string,
): string {
  return TEMPLATES[template]?.(data) ?? ''
}

// ── Context card builder ───────────────────────────────────────────────────────

export function buildContextCard(
  type: ContextType | undefined,
  _id: string,
  data: Record<string, any>,
): ContextData | undefined {
  if (!type || type === 'none') return undefined
  switch (type) {
    case 'task':
      return { title: data.title ?? 'Tapşırıq', subject: data.subject, dueDate: data.dueDate }
    case 'exam':
      return { title: data.title ?? 'İmtahan', subject: data.subject, examDate: data.examDate }
    case 'result':
      return { title: data.title ?? 'Nəticə', subject: data.subject, score: data.score, total: data.total, percent: data.percent }
    case 'warning':
      return { title: data.title ?? 'Xəbərdarlıq', subject: data.subject }
    case 'announcement':
      return { title: data.title ?? 'Elan', subject: data.subject }
    default:
      return undefined
  }
}

// ── System notification text ───────────────────────────────────────────────────

function buildSystemNotifText(type: SystemNotificationType, data: Record<string, any>): { title: string; body: string } {
  const map: Record<SystemNotificationType, { title: string; body: string }> = {
    exam_passed:          { title: '🎉 İmtahan keçildi',       body: `${data.examTitle ?? 'İmtahan'}dan ${data.percent ?? 0}% aldınız!` },
    exam_failed:          { title: '📉 İmtahan nəticəsi',       body: `${data.examTitle ?? 'İmtahan'}dan ${data.percent ?? 0}% — daha yaxşısını edə bilərsiniz.` },
    task_completed:       { title: '✅ Tapşırıq tamamlandı',    body: `"${data.taskTitle ?? 'Tapşırıq'}" tamamlandı.` },
    badge_earned:         { title: `🏅 ${data.badgeName ?? 'Nişan'} qazanıldı`, body: data.badgeDesc ?? 'Yeni nailiyyət!' },
    streak_milestone:     { title: '🔥 Seriya rekordu',         body: `${data.days ?? 0} günlük ardıcıl öyrənmə!` },
    parent_connected:     { title: '👨‍👩‍👧 Valideyn bağlandı',     body: `${data.parentName ?? 'Valideyn'} hesabınıza qoşuldu.` },
    teacher_approved:     { title: '✓ Müəllim təsdiqləndi',     body: `${data.teacherName ?? 'Müəllim'} sizinlə əlaqə qura bilər.` },
    exam_approaching:     { title: '📋 İmtahan yaxınlaşır',     body: `${data.examTitle ?? 'İmtahan'} — ${data.daysLeft ?? 0} gün qalıb.` },
    weekly_report_ready:  { title: '📊 Həftəlik hesabat hazır', body: 'Bu həftənin analitik hesabatını görün.' },
  }
  return map[type] ?? { title: 'Bildiriş', body: '' }
}

// ── Trigger system notification ────────────────────────────────────────────────

export async function triggerSystemNotification(
  uid: string,
  type: SystemNotificationType,
  data: Record<string, any>,
  forwardToParent = false,
): Promise<void> {
  const { title, body } = buildSystemNotifText(type, data)

  const notif = {
    uid, type, title, body,
    contextType: data.contextType ?? null,
    contextId:   data.contextId   ?? null,
    isRead:      false,
    forwardToParent,
    createdAt: serverTimestamp(),
  }

  await addDoc(collection(db, 'userProfiles', uid, 'notifications'), notif)

  if (forwardToParent) {
    const parentSnap = await getDocs(
      query(collection(db, 'parentRequests'), where('childUid', '==', uid), where('status', '==', 'accepted'))
    ).catch(() => null)
    if (parentSnap && !parentSnap.empty) {
      const parentUids = [...new Set(parentSnap.docs.map(d => (d.data() as any).parentUid as string).filter(Boolean))]
      await Promise.all(parentUids.map(pUid =>
        addDoc(collection(db, 'userProfiles', pUid, 'notifications'), {
          ...notif,
          uid: pUid,
          parentUid: pUid,
          body: `(Uşağınız) ${body}`,
        }).catch(() => {})
      ))
    }
  }
}

// ── Mark message read ─────────────────────────────────────────────────────────

export async function markMessageRead(messageId: string, uid: string): Promise<void> {
  try {
    const ref = doc(db, 'userProfiles', uid, 'notifications', messageId)
    await updateDoc(ref, { isRead: true, readAt: serverTimestamp() })
  } catch {}
}

// ── Context type icon / label ─────────────────────────────────────────────────

export function contextMeta(type: ContextType | undefined) {
  const map: Record<string, { icon: string; label: string; color: string }> = {
    task:         { icon: '📋', label: 'Tapşırıq',  color: 'var(--primary)'  },
    exam:         { icon: '📝', label: 'İmtahan',   color: 'var(--accent)'   },
    result:       { icon: '🏆', label: 'Nəticə',    color: 'var(--success)'  },
    warning:      { icon: '⚠️', label: 'Diqqət',    color: 'var(--warning)'  },
    announcement: { icon: '📢', label: 'Elan',      color: 'var(--primary)'  },
  }
  return map[type ?? 'announcement'] ?? map.announcement
}
