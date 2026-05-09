import { NavLink }          from 'react-router-dom'
import { useAuth }           from '@/features/auth/store/authContext'
import { Role }              from '@/types/models'
import { motion, AnimatePresence } from 'framer-motion'

// ─── SVG Icon set ────────────────────────────────────────────────────────────
const Icons = {
  home: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={filled ? 0 : 1.8}
        strokeLinejoin="round"
      />
      {!filled && <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>}
    </svg>
  ),
  subjects: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  homework: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke={filled ? '#fff' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  stats: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="5" y={filled ? "10" : "11"} width="3" height={filled ? "10" : "9"} rx="1"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <rect x="10.5" y={filled ? "6" : "7"} width="3" height={filled ? "14" : "13"} rx="1"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <rect x="16" y={filled ? "2" : "3"} width="3" height={filled ? "18" : "17"} rx="1"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  profile: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  groups: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17 11a3 3 0 1 0 0-6M21 19c0-2.8-1.8-5.1-4.3-5.8"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  exams: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 9h18M8 2v4M16 2v4"
        stroke={filled ? '#fff' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  analytics: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M22 12h-4l-3 9L9 3 6 12H2"
        fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  children: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="6" r="3.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="19" cy="9" r="2.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <path d="M15 19c0-2.2 1.8-4 4-4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  payments: (filled: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10h20" stroke={filled ? '#fff' : 'currentColor'} strokeWidth="1.8"/>
      <circle cx="7" cy="15" r="1.5" fill={filled ? '#fff' : 'currentColor'}/>
    </svg>
  ),
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const STUDENT_NAV = [
  { path: '/',           end: true,  icon: Icons.home,     label: 'Əsas'      },
  { path: '/subjects',   end: false, icon: Icons.subjects, label: 'Fənlər'    },
  { path: '/homework',   end: false, icon: Icons.homework, label: 'Tapşırıq'  },
  { path: '/statistics', end: false, icon: Icons.stats,    label: 'Stat'      },
  { path: '/profile',    end: false, icon: Icons.profile,  label: 'Profil'    },
]

const TEACHER_NAV = [
  { path: '/teacher',           end: true,  icon: Icons.home,      label: 'Əsas'      },
  { path: '/teacher/groups',    end: false, icon: Icons.groups,    label: 'Qruplar'   },
  { path: '/teacher/homework',  end: false, icon: Icons.homework,  label: 'Tapşırıq'  },
  { path: '/teacher/exams',     end: false, icon: Icons.exams,     label: 'İmtahan'   },
  { path: '/teacher/analytics', end: false, icon: Icons.analytics, label: 'Analitik'  },
]

const PARENT_NAV = [
  { path: '/parent',             end: true,  icon: Icons.home,     label: 'Əsas'    },
  { path: '/parent/children',    end: false, icon: Icons.children, label: 'Uşaq'    },
  { path: '/parent/payments',    end: false, icon: Icons.payments, label: 'Ödəniş'  },
  { path: '/parent/profile',     end: false, icon: Icons.profile,  label: 'Profil'  },
]

const ROLE_COLOR: Record<string, string> = {
  STUDENT: '#4F87FF',
  TEACHER: '#A78BFA',
  PARENT:  '#F4A261',
}

export function BottomNav() {
  const { userProfile } = useAuth()
  const role  = userProfile?.role
  const nav   = role === 'TEACHER' ? TEACHER_NAV : role === 'PARENT' ? PARENT_NAV : STUDENT_NAV
  const color = ROLE_COLOR[role ?? 'STUDENT'] ?? '#4F87FF'

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'stretch',
      background: 'var(--bg-card)',
      borderTop: '0.5px solid var(--border-card)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {nav.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          style={{ textDecoration: 'none', flex: 1 }}
          className={({ isActive }) => isActive ? 'bnav-item active' : 'bnav-item'}
        >
          {({ isActive }) => (
            <div
              className="touch-target"
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                paddingTop: 10, paddingBottom: 6, gap: 4,
                position: 'relative',
              }}
            >
              {/* Active pill indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="bnav-pill"
                    initial={{ opacity: 0, scaleX: 0.4 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    style={{
                      position: 'absolute', top: 0,
                      width: 32, height: 3, borderRadius: 2,
                      background: color,
                      boxShadow: `0 0 8px ${color}80`,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.div
                animate={{
                  color: isActive ? color : 'var(--text-tertiary)',
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {item.icon(isActive)}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  color: isActive ? color : 'var(--text-tertiary)',
                  fontWeight: isActive ? 700 : 500,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: 9.5,
                  fontFamily: "'Lexend Deca', sans-serif",
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </motion.span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
