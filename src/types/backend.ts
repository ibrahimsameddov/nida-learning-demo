// Backend REST API DTO types — aligned with Spring Boot controllers

export interface ApiResponse<T> {
  data:    T
  message: string
  success: boolean
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthDto {
  id:           number
  email:        string
  fullName:     string
  role:         'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
  token:        string
  refreshToken: string
  uniqueId?:    string
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface UserDto {
  id:                number
  email:             string
  fullName:          string
  role:              string
  uniqueId?:         string
  phone?:            string
  city?:             string
  school?:           string
  grade?:            number
  specialtyGroup?:   string
  subjectSpecialty?: string
  subjects?:         string[]
  plan?:             string
  createdAt?:        string
}

// ── Groups ────────────────────────────────────────────────────────────────────

export interface GroupDto {
  id:         number
  name:       string
  subject:    string
  maxSize:    number
  grade?:     number
  teacherId:  number
  studentIds: number[]
  createdAt?: string
}

export interface InviteDto {
  id:        number
  groupId:   number
  groupName: string
  status:    'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt?: string
}

// ── Homeworks ─────────────────────────────────────────────────────────────────

export interface HomeworkDto {
  id:          number
  groupId:     number
  topicId:     string
  topicTitle:  string
  subject:     string
  repeatLimit: number
  teacherId:   number
  createdAt?:  string
}

export interface HomeworkAttemptDto {
  id:            number
  homeworkId:    number
  studentId:     number
  score:         number
  maxScore:      number
  attemptNumber: number
  completedAt?:  string
}

// ── Exams ─────────────────────────────────────────────────────────────────────

export interface ExamDto {
  id:        number
  title:     string
  subject:   string
  status:    'DRAFT' | 'ACTIVE' | 'COMPLETED'
  teacherId: number
  groupId?:  number
  createdAt?: string
}

export interface ExamResultDto {
  id:        number
  examId:    number
  studentId: number
  score:     number
  maxScore:  number
  percent:   number
  comment?:  string
}

// ── Practice Exams (Sinaq) ────────────────────────────────────────────────────

export interface PracticeExamDto {
  id:        number
  title:     string
  subject:   string
  status:    'DRAFT' | 'ACTIVE' | 'COMPLETED'
  teacherId: number
  groupId?:  number
  createdAt?: string
}

export interface PracticeAttemptDto {
  id:        number
  examId:    number
  studentId: number
  score:     number
  maxScore:  number
  sharedWithParents?: boolean
}

// ── Tests / Quiz ──────────────────────────────────────────────────────────────

export interface TestSessionDto {
  id:           number
  studentId:    number
  status:       'IN_PROGRESS' | 'COMPLETED'
  score?:       number
  maxScore?:    number
  startedAt?:   string
  completedAt?: string
}

export interface TestResultDto {
  sessionId:  number
  studentId:  number
  score:      number
  maxScore:   number
  percent:    number
  subject?:   string
  completedAt?: string
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationDto {
  id:        number
  userId:    number
  type:      string
  title:     string
  body:      string
  isRead:    boolean
  createdAt?: string
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface MessageDto {
  id:      number
  fromId:  number
  toId:    number
  content: string
  isRead:  boolean
  sentAt:  string
  groupId?: number
}

// ── Live Sessions ─────────────────────────────────────────────────────────────

export interface LiveSessionDto {
  id:         number
  status:     'CREATED' | 'ACTIVE' | 'ENDED'
  teacherId:  number
  groupId?:   number
  startedAt?: string
  endedAt?:   string
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface StatisticsDto {
  studentId:       number
  totalTests:      number
  averagePercent:  number
  currentStreak:   number
  longestStreak?:  number
  subjectStats?:   SubjectStatDto[]
  weeklyProgress?: WeeklyProgressDto[]
  recentSessions?: any[]
}

export interface SubjectStatDto {
  subject:   string
  avg:       number
  total:     number
  lastScore?: number
}

export interface WeeklyProgressDto {
  date:       string
  percentage: number
  testsCount: number
}

// ── Gamification ──────────────────────────────────────────────────────────────

export interface GamificationDto {
  userId:  number
  xp:      number
  level:   number
  streak:  number
  badges:  BadgeDto[]
}

export interface BadgeDto {
  id:          number
  name:        string
  description: string
  icon:        string
  earnedAt?:   string
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface PaymentDto {
  id:        number
  userId:    number
  amount:    number
  type:      string
  status:    string
  createdAt?: string
}

// ── Permissions ───────────────────────────────────────────────────────────────

export interface PermissionDto {
  id:               number
  senderId:         number
  receiverId:       number
  subject:          string
  status:           'PENDING' | 'GRANTED' | 'REVOKED'
  receiverUniqueId?: string
  createdAt?:        string
}

// ── Parent–Child ──────────────────────────────────────────────────────────────

export interface ParentChildDto {
  id:        number
  parentId:  number
  childId:   number
  status:    'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt?: string
}
