import { useEffect }               from 'react'
import { useLocation }             from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar }                 from './Sidebar'
import GlassTopbar                 from './GlassTopbar'
import { BottomNav }               from './BottomNav'
import { ErrorBoundary }           from '@/components/ui/ErrorBoundary'
import FAB                         from '@/components/ui/FAB'
import { useAuth }                 from '@/features/auth/store/authContext'
import { Role }                    from '@/types/models'
import { useStreakCheck } from '@/components/ui/Gamification'

const ROLE_ATTR: Record<string, string> = {
  [Role.Student]: 'student',
  [Role.Teacher]: 'teacher',
  [Role.Parent]:  'parent',
}

interface PageWrapperProps {
  children:  React.ReactNode
  showBack?: boolean
}

export default function PageWrapper({ children, showBack }: PageWrapperProps) {
  const { pathname }    = useLocation()
  const { userProfile } = useAuth()
  const role            = userProfile?.role

  // Apply role-based theme to <body>
  useEffect(() => {
    const attr = role ? (ROLE_ATTR[role] ?? 'student') : 'student'
    document.body.setAttribute('data-role', attr)
    return () => document.body.removeAttribute('data-role')
  }, [role])

  // Fogg BM triggers: check streak danger and welcome back bonus on every mount
  useStreakCheck()

  return (
    <>
      <Sidebar />
      <GlassTopbar showBack={showBack} />

      <div className="main-content">
        <ErrorBoundary>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
              style={{ height: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </div>

      <BottomNav />
      <FAB />
    </>
  )
}
