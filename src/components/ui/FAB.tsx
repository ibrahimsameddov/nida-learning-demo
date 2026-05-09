import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/store/authContext'
import { Role }    from '@/types/models'

const FAB_CONFIG: Record<string, { icon: string; label: string; path: string; color: string; glow: string }> = {
  [Role.Student]: {
    icon:  '🎯',
    label: 'Test Başla',
    path:  '/subjects',
    color: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
    glow:  'rgba(79,135,255,0.40)',
  },
  [Role.Teacher]: {
    icon:  '➕',
    label: 'Sınav Yarat',
    path:  '/teacher/exams',
    color: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    glow:  'rgba(167,139,250,0.40)',
  },
  [Role.Parent]: {
    icon:  '👦',
    label: 'Övlad İzlə',
    path:  '/parent/children',
    color: 'linear-gradient(135deg, #F4A261, #E76F51)',
    glow:  'rgba(244,162,97,0.40)',
  },
}

// Pages where FAB should NOT show
const HIDDEN_PATHS = ['/login', '/register', '/subjects/', '/quiz', '/forgot']

export default function FAB() {
  const { userProfile } = useAuth()
  const navigate        = useNavigate()
  const { pathname }    = useLocation()

  const role = userProfile?.role as Role | undefined
  if (!role) return null

  const config = FAB_CONFIG[role]
  if (!config) return null

  // Hide on certain pages
  const shouldHide = HIDDEN_PATHS.some(p => pathname.includes(p)) || pathname !== '/' && pathname !== '/teacher' && pathname !== '/parent'

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.button
          key="fab"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          onClick={() => navigate(config.path)}
          className="touch-target shine-btn"
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
            right: 20,
            zIndex: 90,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '13px 20px',
            borderRadius: 50,
            background: config.color,
            border: 'none',
            boxShadow: `0 8px 28px ${config.glow}, 0 2px 8px rgba(0,0,0,0.2)`,
            cursor: 'pointer',
            color: '#fff',
            fontFamily: "'Lexend Deca', sans-serif",
            fontWeight: 800, fontSize: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>{config.icon}</span>
          <span>{config.label}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
