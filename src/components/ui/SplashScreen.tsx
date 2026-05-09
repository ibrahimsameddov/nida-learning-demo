import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore }  from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Role }          from '@/types/models'

const SPLASH_KEY = 'nida-splash-v1'

const ROLE_ACCENT: Record<string, string> = {
  [Role.Student]: '#4F87FF',
  [Role.Teacher]: '#A78BFA',
  [Role.Parent]:  '#F4A261',
}

const THEMES = {
  dark: {
    bg:      'linear-gradient(160deg, #0B1520 0%, #0F1923 50%, #0C1823 100%)',
    text:    '#FFFFFF',
    subText: 'rgba(255,255,255,0.5)',
  },
  light: {
    bg:      'linear-gradient(160deg, #1B3A5C 0%, #162E4A 50%, #1A3558 100%)',
    text:    '#FFFFFF',
    subText: 'rgba(255,255,255,0.55)',
  },
}

const sp = (delay: number) => ({
  delay,
  type: 'spring' as const,
  stiffness: 210,
  damping:   22,
})

function AnimatedDoor({ color }: { color: string }) {
  return (
    <svg
      width={148}
      height={185}
      viewBox="0 0 72 90"
      fill="none"
      style={{ filter: `drop-shadow(0 0 28px ${color}55)` }}
    >
      <motion.rect
        x="0" y="0" width="12" height="90" fill={color}
        initial={{ x: -55, opacity: 0 }}
        animate={{ x: 0,   opacity: 1 }}
        transition={sp(0.55)}
      />
      <motion.path
        d="M12 0 L72 8 L72 19 L12 11 Z" fill={color}
        initial={{ y: -45, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={sp(0.70)}
      />
      <motion.path
        d="M12 79 L72 71 L72 82 L12 90 Z" fill={color}
        initial={{ y: 45,  opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={sp(0.85)}
      />
      <motion.rect
        x="61" y="8" width="11" height="74" fill={color}
        initial={{ x: 45,  opacity: 0 }}
        animate={{ x: 0,   opacity: 1 }}
        transition={sp(1.00)}
      />
      <motion.rect
        x="33" y="24" width="7" height="30" rx="3.5" fill={color}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        style={{ transformOrigin: '36.5px 24px' }}
        transition={{ delay: 1.25, type: 'spring', stiffness: 340, damping: 18 }}
      />
      <motion.circle
        cx="36.5" cy="66" r="4.5" fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.50, type: 'spring', stiffness: 500, damping: 15 }}
      />
    </svg>
  )
}

export default function SplashScreen() {
  const [mounted, setMounted] = useState(() => !sessionStorage.getItem(SPLASH_KEY))
  const [isOpen,  setIsOpen]  = useState(false)

  const isDark = useThemeStore(s => s.resolved) === 'dark'
  const role   = useAuthStore(s => s.user?.role)

  const theme  = THEMES[isDark ? 'dark' : 'light']
  const accent = role ? (ROLE_ACCENT[role] ?? '#C9A84C') : '#C9A84C'

  useEffect(() => {
    if (!mounted) return

    // 2.4s sonra qapı açılmağa başlayır
    const t1 = setTimeout(() => setIsOpen(true), 2400)

    // 3.4s sonra (animasiya tamamlanandan sonra) unmount
    // stale-closure probleminə yol verməmək üçün onAnimationComplete əvəzinə timeout
    const t2 = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, '1')
      setMounted(false)
    }, 3400)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [mounted])

  if (!mounted) return null

  return (
    // Xarici div: perspective konteksti — məzmuna toxunmur çünki rotateY(0) = identity
    <div style={{
      position:          'fixed',
      inset:             0,
      zIndex:            9999,
      perspective:       '1600px',
      perspectiveOrigin: 'left center',
    }}>
      <motion.div
        animate={{
          rotateY: isOpen ? -92 : 0,
          opacity: isOpen ? 0   : 1,
        }}
        transition={isOpen
          ? { duration: 0.9, ease: [0.25, 0, 0.9, 1] }
          : { duration: 0 }
        }
        style={{
          position:            'absolute',
          inset:               0,
          background:          theme.bg,
          display:             'flex',
          flexDirection:       'column',
          alignItems:          'center',
          justifyContent:      'center',
          transformOrigin:     'left center',
          backfaceVisibility:  'hidden',
        }}
      >
        {/* ── "Gələcəyə Səsləniş" — mərkəzlənmiş, yuxarıda ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
          style={{
            position:      'absolute',
            top:           '13%',
            left:          0,
            right:         0,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           10,
          }}
        >
          <span style={{
            fontFamily:    "'Lexend Deca', sans-serif",
            fontWeight:    700,
            fontSize:      11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color:         accent,
          }}>
            Gələcəyə Səsləniş
          </span>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
            style={{
              height:          1,
              width:           110,
              background:      `linear-gradient(90deg, transparent, ${accent}70, transparent)`,
              transformOrigin: 'center',
            }}
          />
        </motion.div>

        {/* ── Animasiyalı qapı loqosu ── */}
        <AnimatedDoor color={accent} />

        {/* ── NIDA yazısı ── */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.5, ease: 'easeOut' }}
          style={{
            fontFamily:    "'Lexend Deca', sans-serif",
            fontWeight:    900,
            fontSize:      34,
            letterSpacing: '0.16em',
            color:         theme.text,
            marginTop:     14,
            margin:        '14px 0 0 0',
            padding:       0,
          }}
        >
          NIDA
        </motion.p>

        {/* Sağ kənar kölgəsi */}
        <div style={{
          position:      'absolute',
          top: 0, right: 0,
          width:         80, height: '100%',
          background:    'linear-gradient(270deg, rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none',
        }} />
      </motion.div>
    </div>
  )
}
