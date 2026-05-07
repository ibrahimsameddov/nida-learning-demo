// ── ENUM-LAR ──────────────────────────────────────────
export enum Role {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  Parent  = 'PARENT',
  Admin   = 'ADMIN',
}

export enum Grade {
  Nine   = 9,
  Ten    = 10,
  Eleven = 11,
}

export enum Group {
  I   = 'I',
  II  = 'II',
  III = 'III',
  IV  = 'IV',
}

export enum Subject {
  Azerbaijani  = 'azerbaijani',
  Math         = 'math',
  English      = 'english',
  Russian      = 'russian',
  Physics      = 'physics',
  Chemistry    = 'chemistry',
  Biology      = 'biology',
  History      = 'history',
  Geography    = 'geography',
  Literature   = 'literature',
  Informatics  = 'informatics',
}

export enum StudentStatus {
  Active  = 'aktiv',
  Passive = 'passiv',
  Normal  = 'normal',
}

export enum PermissionStatus {
  Pending  = 'pending',
  Granted  = 'granted',
  Rejected = 'rejected',
}

// ── CORE MODELLƏRİ ───────────────────────────────────
export interface User {
  id:        string
  fullName:  string
  email:     string
  role:      Role
  avatarUrl?: string
  createdAt: string
}

export interface Student extends User {
  role:          Role.Student
  studentId:     string           // NDA-2024-XXXX
  grade:         Grade
  group:         Group
  city:          string
  school:        string
  foreignLang:   Subject.English | Subject.Russian
  streakDays:    number
  totalQuestions:number
  successRate:   number
}

export interface Teacher extends User {
  role:      Role.Teacher
  city:      string
  school:    string
  subjects:  Subject[]
}

export interface Parent extends User {
  role:     Role.Parent
  balance:  number
  children: Student[]
}

// ── SUAL & TEST ────────────────────────────────────
export interface Question {
  id:        string
  subjectId: Subject
  topicId:   string
  text:      string
  options:   QuestionOption[]
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: string
}

export interface QuestionOption {
  id:        string
  text:      string
  isCorrect: boolean
}

export interface QuizSession {
  id:          string
  studentId:   string
  subjectId:   Subject
  topicId:     string
  questions:   Question[]
  answers:     QuizAnswer[]
  startedAt:   string
  completedAt?: string
  isLocked:    boolean
  currentIndex:number
}

export interface QuizAnswer {
  questionId:  string
  selectedId:  string | null
  isCorrect:   boolean
  timeSpent:   number   // milliseconds
  skipped:     boolean
}

export interface QuizResult {
  sessionId:   string
  total:       number
  correct:     number
  wrong:       number
  skipped:     number
  successRate: number
  timeSpent:   number
  completedAt: string
}

// ── MÖVZU & FƏNN ───────────────────────────────────
export interface Topic {
  id:           string
  subjectId:    Subject
  name:         string
  totalQuestions:number
  doneQuestions: number
  lastIndex:    number     // davam nöqtəsi
}

// ── İMTAHAN ────────────────────────────────────────
export interface Exam {
  id:          string
  teacherId:   string
  title:       string
  subjects:    Subject[]
  studentIds:  string[]
  scheduledAt: string
  duration:    number      // dəqiqə
  status:      'waiting' | 'active' | 'completed'
}

export interface ExamResult {
  examId:     string
  studentId:  string
  score:      number
  maxScore:   number
  completedAt:string
}

// ── MÜƏLLİM-ŞAGİRD MÜNASİBƏTİ ──────────────────────
export interface TeacherPermission {
  id:        string
  teacherId: string
  studentId: string
  subject:   Subject
  status:    PermissionStatus
  grantedAt?:string
}

export interface TeacherGroup {
  id:        string
  teacherId: string
  name:      string
  studentIds:string[]
  subject:   Subject
}

// ── STATİSTİKA ─────────────────────────────────────
export interface StudentStats {
  period:         'daily' | 'weekly' | 'monthly' | 'all'
  totalQuestions: number
  correctAnswers: number
  wrongAnswers:   number
  successRate:    number
  timeSpent:      number
  streakDays:     number
  chartData:      ChartPoint[]
}

export interface ChartPoint {
  date:       string
  correct:    number
  wrong:      number
  total:      number
}

// ── MESAJ ──────────────────────────────────────────
export interface Message {
  id:         string
  fromId:     string
  fromName:   string
  fromRole:   Role
  toId:       string | 'group'
  groupId?:   string
  content:    string
  type:       'direct' | 'group' | 'system' | 'access_request'
  readAt?:    string
  createdAt:  string
}

// ── BİLDİRİŞ ───────────────────────────────────────
export interface Notification {
  id:        string
  userId:    string
  type:      'exam' | 'message' | 'permission' | 'weekly' | 'streak'
  title:     string
  body:      string
  read:      boolean
  createdAt: string
}

// ── API CAVAB TİPLƏRİ ──────────────────────────────
export interface ApiResponse<T> {
  data:    T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

export interface ApiError {
  status:  number
  message: string
  errors?: Record<string, string>
}

// ── FİRESTORE DÖNÜŞ TİPLƏRİ ───────────────────────────

export interface SubjectStat {
  subject:        string
  averagePercent: number
  totalTests:     number
}

export interface ProgressPoint {
  date:       string
  percentage: number
}

export interface RecentSession {
  subject:        string
  accuracy:       number
  totalQuestions: number
  durationSeconds:number
}

export interface FirestoreStats {
  totalTests:      number
  averagePercent:  number
  bestPercent:     number
  streak:          number
  currentStreak:   number
  subjectStats:    SubjectStat[]
  weeklyProgress:  ProgressPoint[]
  dailyProgress:   ProgressPoint[]
  recentSessions:  RecentSession[]
}

export interface FirestoreResult {
  id:          string
  subject:     string
  topicId?:    string
  topicName?:  string
  percent:     number
  total:       number
  correct:     number
  wrong:       number
  skipped:     number
  timeSpent:   number
  completedAt: string
}

