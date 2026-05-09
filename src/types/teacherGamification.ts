// @ts-nocheck

export type TeacherLeague = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export type CertificateType =
  | 'active_teacher'
  | 'result_maker'
  | 'question_bank'
  | 'annual_activity'

export interface TeacherBadge {
  id:         string
  label:      string
  icon:       string
  description: string
  category:   'starter' | 'task' | 'student' | 'activity'
  txReward:   number
  earnedAt?:  number
  progress?:  { current: number; total: number }
}

export interface Certificate {
  id:        string
  type:      CertificateType
  label:     string
  issuedAt:  number
  pdfUrl?:   string
}

export interface TXPoint {
  amount:   number
  reason:   string
  earnedAt: number
}

// ── Rank definitions ───────────────────────────────────────────────────────────

export interface RankInfo {
  rank:        number
  label:       string
  color:       string
  icon:        string
  minTX:       number
  maxTX:       number
  privileges:  string[]
}

export const RANKS: RankInfo[] = [
  {
    rank: 1, label: 'Stajçı Müəllim',   color: '#888780', icon: '🏫',
    minTX: 0,       maxTX: 999,
    privileges: ['1 qrup', '15 şagird', 'Ayda 5 tapşırıq', 'Ayda 3 imtahan', 'Əsas statistika'],
  },
  {
    rank: 2, label: 'Junior Müəllim',   color: '#1D9E75', icon: '🌱',
    minTX: 1000,    maxTX: 2999,
    privileges: ['2 qrup', '30 şagird', 'Limitsiz tapşırıq', 'Ayda 10 imtahan', 'Müdaxilə sistemi', 'Əsas analitika'],
  },
  {
    rank: 3, label: 'Aktiv Müəllim',    color: '#378ADD', icon: '⭐',
    minTX: 3000,    maxTX: 6999,
    privileges: ['3 qrup', '60 şagird', 'Limitsiz imtahan', 'Tam analitika', 'Heatmap', 'Valideyn hesabat', '50 sual bankı'],
  },
  {
    rank: 4, label: 'Səmərəli Müəllim', color: '#7F77DD', icon: '🏆',
    minTX: 7000,    maxTX: 14999,
    privileges: ['5 qrup', '100 şagird', 'Classroom Intelligence', 'ERI tarixi', '200 sual bankı', 'Ortaq sual bankı', 'Aylıq PDF hesabat'],
  },
  {
    rank: 5, label: 'Peşəkar Müəllim',  color: '#BA7517', icon: '🥇',
    minTX: 15000,   maxTX: 29999,
    privileges: ['8 qrup', '150 şagird', 'Limitsiz sual bankı', 'Marketplace giriş', 'Sual satmaq', 'Priority dəstək', '"Peşəkar" badge'],
  },
  {
    rank: 6, label: 'Ekspert Müəllim',  color: '#C9952B', icon: '👑',
    minTX: 30000,   maxTX: 59999,
    privileges: ['12 qrup', '250 şagird', 'Analytics API', 'Məktəb paneli', 'Premium hesabat', 'Canlı dərs (beta)', 'Mentorluq'],
  },
  {
    rank: 7, label: 'Master Müəllim',   color: '#E24B4A', icon: '💎',
    minTX: 60000,   maxTX: 99999,
    privileges: ['Limitsiz qrup', 'Limitsiz şagird', 'Bütün analitika', 'Sual bazası idarəsi', 'Beta funksiyalar', 'Aylıq görüş', '"Master" badge'],
  },
  {
    rank: 8, label: 'NIDA Elçisi',      color: '#C9952B', icon: '🎖️',
    minTX: 100000,  maxTX: Infinity,
    privileges: ['Master-dakı hər şey', 'Xüsusi profil çərçivəsi', 'NIDA vebsaytında ad', 'Sınaq girişi', 'Birbaşa əlaqə', 'Aylıq mükafat'],
  },
]

export function getRankInfo(totalTX: number): RankInfo {
  return [...RANKS].reverse().find(r => totalTX >= r.minTX) ?? RANKS[0]
}

export function getNextRank(totalTX: number): RankInfo | null {
  const cur = getRankInfo(totalTX)
  return RANKS.find(r => r.rank === cur.rank + 1) ?? null
}

export function getRankProgress(totalTX: number): number {
  const cur  = getRankInfo(totalTX)
  if (cur.rank === 8) return 100
  const span = cur.maxTX - cur.minTX + 1
  return Math.min(100, Math.round(((totalTX - cur.minTX) / span) * 100))
}

// ── League definitions ─────────────────────────────────────────────────────────

export interface LeagueInfo {
  id:         TeacherLeague
  label:      string
  color:      string
  icon:       string
  minWeekly:  number
  weeklyBonus: number
}

export const LEAGUES: LeagueInfo[] = [
  { id: 'bronze',   label: 'Tunc',   color: '#CD7F32', icon: '🥉', minWeekly: 0,    weeklyBonus: 100  },
  { id: 'silver',   label: 'Gümüş',  color: '#C0C0C0', icon: '🥈', minWeekly: 500,  weeklyBonus: 250  },
  { id: 'gold',     label: 'Qızıl',  color: '#C9952B', icon: '🥇', minWeekly: 1000, weeklyBonus: 500  },
  { id: 'platinum', label: 'Platin', color: '#7F77DD', icon: '💜', minWeekly: 2000, weeklyBonus: 1000 },
  { id: 'diamond',  label: 'Almas',  color: '#378ADD', icon: '💎', minWeekly: 4000, weeklyBonus: 2000 },
]

export function getLeagueInfo(weeklyTX: number): LeagueInfo {
  return [...LEAGUES].reverse().find(l => weeklyTX >= l.minWeekly) ?? LEAGUES[0]
}

// ── Badge definitions ──────────────────────────────────────────────────────────

export const ALL_TEACHER_BADGES: TeacherBadge[] = [
  // Starter
  { id: 'first_task',    icon: '👣', label: 'İlk Addım',           description: 'İlk tapşırığı göndərdi',             category: 'starter',  txReward: 50  },
  { id: 'first_group',   icon: '👥', label: 'İlk Qrup',            description: 'İlk qrupu yaratdı',                  category: 'starter',  txReward: 50  },
  { id: 'first_exam',    icon: '📝', label: 'İlk İmtahan',         description: 'İlk sinaq imtahanını aktivləşdirdi',  category: 'starter',  txReward: 75  },
  { id: 'profile_done',  icon: '✅', label: 'Profil Tam',           description: 'Profilini tam doldurdu',             category: 'starter',  txReward: 30  },
  // Task & exam
  { id: 'tasks_50',      icon: '📋', label: 'Tapşırıq Ustası',     description: '50 tapşırıq göndərdi',               category: 'task',     txReward: 200, progress: { current: 0, total: 50  } },
  { id: 'tasks_200',     icon: '📌', label: 'Tapşırıq Memarı',     description: '200 tapşırıq göndərdi',              category: 'task',     txReward: 500, progress: { current: 0, total: 200 } },
  { id: 'exams_20',      icon: '🎓', label: 'İmtahan Rejissoru',   description: '20 sinaq imtahanı keçirdi',           category: 'task',     txReward: 300, progress: { current: 0, total: 20  } },
  { id: 'exam_90avg',    icon: '⭐', label: 'Mükəmməl Nəticə',     description: 'Qrup imtahan ortalaması 90%+ oldu',   category: 'task',     txReward: 400 },
  { id: 'completion_100',icon: '💯', label: '100% Tamamlama',       description: 'Tapşırığı bütün şagirdlər tamamladı', category: 'task',    txReward: 250 },
  // Student
  { id: 'eri_30',        icon: '📈', label: 'Transformasiya',       description: 'Bir şagirdin ERI skoru 30+ artdı',   category: 'student',  txReward: 350 },
  { id: 'group_eri_15',  icon: '🏅', label: 'Qrup Qəhrəmanı',      description: 'Qrupun ERI ortalaması 15+ artdı',    category: 'student',  txReward: 500 },
  { id: 'inactive_5',    icon: '🔄', label: 'Geri Qaytaran',        description: '5 qeyri-aktiv şagirdi geri qaytardı',category: 'student',  txReward: 400, progress: { current: 0, total: 5 }  },
  { id: 'weak_10',       icon: '💪', label: 'Zəiflikdən Güclüyə',  description: 'Zəif mövzunu aşan 10 şagird',        category: 'student',  txReward: 450, progress: { current: 0, total: 10 } },
  { id: 'streak_guard',  icon: '🔥', label: 'Streak Qoruyucu',     description: 'Bir şagirdin 30 günlük streakini qorudu', category: 'student', txReward: 200 },
  // Activity
  { id: 'login_30',      icon: '📅', label: 'Sadiq Müəllim',       description: '30 gün ardıcıl aktiv',               category: 'activity', txReward: 300, progress: { current: 0, total: 30 } },
  { id: 'ontime_20',     icon: '⏰', label: 'Vaxtında',             description: '20 tapşırığı vaxtında yoxladı',      category: 'activity', txReward: 150, progress: { current: 0, total: 20 } },
  { id: 'messages_100',  icon: '💬', label: 'Kommunikator',         description: '100 mesaj göndərdi',                 category: 'activity', txReward: 200, progress: { current: 0, total: 100} },
  { id: 'parent_50',     icon: '🤝', label: 'Valideyn Körpüsü',    description: '50 valideynə hesabat göndərdi',      category: 'activity', txReward: 250, progress: { current: 0, total: 50 } },
  { id: 'questions_100', icon: '🗄️', label: 'Sual Bankı Qəhrəmanı', description: '100 sual əlavə etdi',              category: 'activity', txReward: 300, progress: { current: 0, total: 100} },
  { id: 'mentor',        icon: '🎓', label: 'Mentor',               description: 'Yeni müəllimlərə 5 sual bankı paylaşdı', category: 'activity', txReward: 200, progress: { current: 0, total: 5 } },
]

// ── Certificate definitions ────────────────────────────────────────────────────

export const CERTIFICATE_DEFS: Record<CertificateType, { label: string; description: string; icon: string }> = {
  active_teacher:   { label: 'Aktiv Müəllim',          icon: '📜', description: '3 ay ardıcıl aktiv + 500+ TX' },
  result_maker:     { label: 'Nəticə Yaradan Müəllim', icon: '🏆', description: 'Ən azı 10 şagirdin ERI 20+ artdı' },
  question_bank:    { label: 'Sual Bankı Töhfəçisi',   icon: '🗄️', description: '100+ sual, ort. reytinq 4.5+' },
  annual_activity:  { label: 'İllik Fəaliyyət',         icon: '🎖️', description: '1 il platformada aktiv' },
}

// ── TX amount constants ────────────────────────────────────────────────────────

export const TX = {
  TASK_CREATED:         10,
  TASK_80_COMPLETE:     30,
  TASK_100_COMPLETE:    60,
  EXAM_CREATED:         20,
  EXAM_AVG_70:          50,
  EXAM_AVG_85:          80,
  ERI_UP_10:            25,
  ERI_UP_25:            60,
  ERI_UP_40:           100,
  GROUP_ERI_UP_5:       75,
  WEAK_TOPIC_PASSED:    30,
  INTERVENTION_SENT:    15,
  INTERVENTION_UP_20:   50,
  INACTIVE_RETURNED:    40,
  DAILY_LOGIN:          10,
  MESSAGE_SENT:          5,
  PARENT_REPORT:        15,
  WEEKLY_5_DAYS:        50,
} as const
