import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
const NotFound = lazy(() => import('../features/errors/NotFound'))
import { useAuthStore } from '../stores/authStore'
import { Role } from '../types/models'
import PageWrapper from '../components/layout/PageWrapper'
import Spinner from '../components/ui/Spinner'

// Lazy imports — hər route ayrı chunk
const Login           = lazy(() => import('../features/auth/pages/Login'))
const Register        = lazy(() => import('../features/auth/pages/Register'))
const EmailVerify     = lazy(() => import('../features/auth/pages/EmailVerify'))
const ForgotPassword  = lazy(() => import('../features/auth/pages/ForgotPassword'))
const ResetPassword   = lazy(() => import('../features/auth/pages/ResetPassword'))
const DiagnosticTest     = lazy(() => import('../features/auth/pages/DiagnosticTest'))
const GroupSelect        = lazy(() => import('../features/auth/pages/GroupSelect'))
const TeacherOnboarding  = lazy(() => import('../features/auth/pages/TeacherOnboarding'))
const TeacherPending     = lazy(() => import('../features/auth/pages/TeacherPending'))
const ParentOnboarding   = lazy(() => import('../features/auth/pages/ParentOnboarding'))

const StudentDashboard  = lazy(() => import('../features/student/dashboard/Dashboard'))
const StudentSubjects   = lazy(() => import('../features/student/subjects/StudentSubjects'))
const MathTopics        = lazy(() => import('../features/student/subjects/MathTopics'))
const MathQuiz          = lazy(() => import('../features/student/quiz/MathQuiz'))
const StudentQuiz       = lazy(() => import('../features/student/quiz/Quiz'))
const StudentExams      = lazy(() => import('../features/student/exams/Exams'))
const StudentStats      = lazy(() => import('../features/student/statistics/Statistics'))
const StudentMessages   = lazy(() => import('../features/student/messages/Messages'))
const StudentProfile    = lazy(() => import('../features/student/profile/Profile'))
const WrongQuestions    = lazy(() => import('../features/student/wrong-questions/WrongQuestions'))

const TeacherDashboard  = lazy(() => import('../features/teacher/dashboard/Dashboard'))
const TeacherStudents   = lazy(() => import('../features/teacher/students/Students'))
const TeacherGroups     = lazy(() => import('../features/teacher/students/TeacherGroups'))
const TeacherTasks      = lazy(() => import('../features/teacher/exams/TeacherTasks'))
const TeacherAnalytics  = lazy(() => import('../features/teacher/analytics/TeacherAnalytics'))
const TeacherExams      = lazy(() => import('../features/teacher/exams/Exams'))
const TeacherMessages   = lazy(() => import('../features/teacher/messages/Messages'))
const TeacherHomework   = lazy(() => import('../features/teacher/homework/TeacherHomework'))
const TeacherProfile    = lazy(() => import('../features/teacher/profile/TeacherProfile'))
const StudentHomework   = lazy(() => import('../features/student/homework/StudentHomework'))
const TopicQuizPage     = lazy(() => import('../features/student/quiz/TopicQuizPage'))

const ParentDashboard    = lazy(() => import('../features/parent/dashboard/Dashboard'))
const ParentChildren     = lazy(() => import('../features/parent/children/Children'))
const ParentStatistics   = lazy(() => import('../features/parent/statistics/Statistics'))
const ParentTeachers     = lazy(() => import('../features/parent/teachers/Teachers'))
const ParentMessages     = lazy(() => import('../features/parent/messages/Messages'))
const ParentPayments     = lazy(() => import('../features/parent/payments/Payments'))
const ParentProfile      = lazy(() => import('../features/parent/profile/ParentProfile'))

// Route qoruyucuları
function AuthGuard() {
  const token = useAuthStore(s => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

function RoleGuard({ allowed }: { allowed: Role[] }) {
  const role = useAuthStore(s => s.user?.role)
  return role && allowed.includes(role) ? <Outlet /> : <Navigate to="/" replace />
}

const SuspenseWrapper = () => (
  <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
    <Outlet />
  </Suspense>
)

export const router = createBrowserRouter(
  [
    // Public routes
    { path: '/login',             element: <Suspense fallback={null}><Login /></Suspense> },
    { path: '/register',          element: <Suspense fallback={null}><Register /></Suspense> },
    { path: '/verify',            element: <Suspense fallback={null}><EmailVerify /></Suspense> },
    { path: '/forgot-password',   element: <Suspense fallback={null}><ForgotPassword /></Suspense> },
    { path: '/reset-password',    element: <Suspense fallback={null}><ResetPassword /></Suspense> },
    { path: '/onboarding/test',    element: <Suspense fallback={null}><DiagnosticTest /></Suspense> },
    { path: '/onboarding/group',   element: <Suspense fallback={null}><GroupSelect /></Suspense> },
    { path: '/onboarding/teacher', element: <Suspense fallback={null}><TeacherOnboarding /></Suspense> },
    { path: '/teacher/pending',    element: <Suspense fallback={null}><TeacherPending /></Suspense> },
    { path: '/onboarding/parent', element: <Suspense fallback={null}><ParentOnboarding /></Suspense> },

    // Protected routes
    {
      element: <AuthGuard />,
      children: [{
        element: <SuspenseWrapper />,
        children: [
          // Shared — bütün authenticated istifadəçilər
          { path: '/profile', element: <PageWrapper><StudentProfile /></PageWrapper> },

          // Student
          {
            element: <RoleGuard allowed={[Role.Student]} />,
            children: [
              { path: '/',                element: <PageWrapper><StudentDashboard /></PageWrapper> },
              { path: '/subjects',        element: <PageWrapper><StudentSubjects /></PageWrapper> },
              { path: '/subjects/math',        element: <PageWrapper><MathTopics /></PageWrapper> },
              { path: '/math/quiz/:topicId',  element: <MathQuiz /> },
              { path: '/quiz/:sessionId', element: <StudentQuiz /> },
              { path: '/exams',           element: <PageWrapper><StudentExams /></PageWrapper> },
              { path: '/statistics',      element: <PageWrapper><StudentStats /></PageWrapper> },
              { path: '/messages',        element: <PageWrapper><StudentMessages /></PageWrapper> },
              { path: '/wrong-questions', element: <PageWrapper><WrongQuestions /></PageWrapper> },
              { path: '/homework',        element: <PageWrapper><StudentHomework /></PageWrapper> },
              { path: '/topic-quiz',      element: <TopicQuizPage /> },
            ],
          },

          // Teacher
          {
            path: '/teacher',
            element: <RoleGuard allowed={[Role.Teacher]} />,
            children: [
              { path: '',          element: <PageWrapper><TeacherDashboard /></PageWrapper> },
              { path: 'students',  element: <PageWrapper><TeacherStudents /></PageWrapper> },
              { path: 'groups',    element: <TeacherGroups /> },
              { path: 'tasks',     element: <TeacherTasks /> },
              { path: 'analytics', element: <TeacherAnalytics /> },
              { path: 'exams',     element: <PageWrapper><TeacherExams /></PageWrapper> },
              { path: 'homework',  element: <PageWrapper><TeacherHomework /></PageWrapper> },
              { path: 'messages',  element: <PageWrapper><TeacherMessages /></PageWrapper> },
              { path: 'profile',   element: <PageWrapper><TeacherProfile /></PageWrapper> },
            ],
          },

          // Parent
          {
            path: '/parent',
            element: <RoleGuard allowed={[Role.Parent]} />,
            children: [
              { path: '',           element: <PageWrapper><ParentDashboard /></PageWrapper>  },
              { path: 'children',   element: <PageWrapper><ParentChildren /></PageWrapper>   },
              { path: 'statistics', element: <PageWrapper><ParentStatistics /></PageWrapper> },
              { path: 'teachers',   element: <PageWrapper><ParentTeachers /></PageWrapper>   },
              { path: 'messages',   element: <PageWrapper><ParentMessages /></PageWrapper>   },
              { path: 'payments',   element: <PageWrapper><ParentPayments /></PageWrapper>   },
              { path: 'profile',    element: <PageWrapper><ParentProfile /></PageWrapper>    },
            ],
          },
        ],
      }],
    },

    { path: '*', element: <Suspense fallback={null}><NotFound /></Suspense> },
  ],
  {
    future: {
      v7_fetcherPersist:      true,
      v7_normalizeFormMethod: true,
      v7_partialHydration:    true,
      v7_relativeSplatPath:   true,
    },
  }
)
