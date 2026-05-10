import { useState }          from 'react'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { Link, useNavigate }  from 'react-router-dom'
import { motion }             from 'framer-motion'
import { loginSchema, type LoginInput } from '../../../lib/validations'
import { useLogin }           from '../hooks/useLogin'
import { useAuthStore }       from '../../../stores/authStore'
import { Role }               from '../../../types/models'

const ROLE_HOME: Record<Role, string> = {
  [Role.Student]: '/',
  [Role.Teacher]: '/teacher',
  [Role.Parent]:  '/parent',
  [Role.Admin]:   '/teacher',
}

const ROLES = [
  { role: Role.Student, icon: '🎓', label: 'Şagird',   color: '#4F87FF', glow: 'rgba(79,135,255,0.25)' },
  { role: Role.Teacher, icon: '👩‍🏫', label: 'Müəllim', color: '#A78BFA', glow: 'rgba(167,139,250,0.25)' },
  { role: Role.Parent,  icon: '👨‍👩‍👧', label: 'Valideyn', color: '#F4A261', glow: 'rgba(244,162,97,0.25)'  },
]

const SPRING = { type: 'spring', stiffness: 220, damping: 20 }

export default function Login() {
  const navigate = useNavigate()
  const { mutateAsync: login, isPending, error } = useLogin()
  const [showPw, setShowPw]         = useState(false)
  const [activeRole, setActiveRole] = useState<Role>(Role.Student)
  const [focused, setFocused]       = useState<'email' | 'password' | null>(null)
  const [roleMismatch, setRoleMismatch] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const currentRoleInfo = ROLES.find(r => r.role === activeRole)!

  const onSubmit = async (data: LoginInput) => {
    setRoleMismatch(false)
    try {
      await login(data)
      const role = useAuthStore.getState().user?.role
      if (role && (role as string) !== activeRole) {
        setRoleMismatch(true)
        useAuthStore.getState().logout()
        return
      }
      navigate(role ? ROLE_HOME[role] : '/', { replace: true })
    } catch {
      // error displayed below
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* ── Animated background orbs ── */}
      <div className="floating-orb" style={{
        top: '-15%', left: '-10%',
        width: '50vw', height: '50vw', maxWidth: 320, maxHeight: 320,
        background: currentRoleInfo.color,
        opacity: 0.18,
        animationDelay: '0s',
        transition: 'background 0.6s ease',
      }} />
      <div className="floating-orb" style={{
        bottom: '-10%', right: '-10%',
        width: '40vw', height: '40vw', maxWidth: 260, maxHeight: 260,
        background: currentRoleInfo.color,
        opacity: 0.12,
        animationDelay: '-3s',
        animationDirection: 'reverse',
        transition: 'background 0.6s ease',
      }} />
      <div className="floating-orb" style={{
        top: '50%', right: '15%',
        width: '20vw', height: '20vw', maxWidth: 120, maxHeight: 120,
        background: '#A78BFA',
        opacity: 0.08,
        animationDelay: '-5s',
      }} />

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ delay: 0.05, ...SPRING }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontWeight: 800, fontSize: 26,
            marginBottom: 6,
            background: 'linear-gradient(135deg, var(--text-primary) 60%, var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Xoş gəlmisiniz!
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.5 }}>
            NIDA — Gələcəyə Səsləniş Platforması
          </p>
        </div>

        {/* ── Role selector ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, marginBottom: 20,
        }}>
          {ROLES.map((r, i) => (
            <motion.button
              key={r.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, ...SPRING }}
              onClick={() => setActiveRole(r.role)}
              className="touch-target"
              style={{
                padding: '12px 8px',
                borderRadius: 14,
                border: activeRole === r.role
                  ? `1.5px solid ${r.color}60`
                  : '1px solid var(--border-card)',
                background: activeRole === r.role
                  ? `${r.color}12`
                  : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                boxShadow: activeRole === r.role
                  ? `0 4px 16px ${r.glow}`
                  : 'none',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: activeRole === r.role ? r.color : 'var(--text-tertiary)',
                fontFamily: "'Lexend Deca', sans-serif",
                transition: 'color 0.25s ease',
              }}>{r.label}</div>
            </motion.button>
          ))}
        </div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...SPRING }}
          className="glass-luxury gradient-border"
          style={{ borderRadius: 22, padding: '24px 20px' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email field */}
            <div style={{ position: 'relative' }}>
              <motion.label
                animate={{
                  fontSize: focused === 'email' ? 10 : 11,
                  color: focused === 'email' ? currentRoleInfo.color : 'var(--text-tertiary)',
                  y: 0,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'block', fontWeight: 700,
                  marginBottom: 6, letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                E-poçt
              </motion.label>
              <motion.div
                animate={{
                  boxShadow: focused === 'email'
                    ? `0 0 0 2px ${currentRoleInfo.color}50`
                    : '0 0 0 1px var(--border-card)',
                }}
                transition={{ duration: 0.2 }}
                style={{ borderRadius: 12, overflow: 'visible' }}
              >
                <input
                  type="email"
                  className="input"
                  placeholder="nida@example.com"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  style={{ boxShadow: 'none', border: 'none', borderRadius: 12 }}
                  {...register('email')}
                />
              </motion.div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 4, fontSize: 11, color: 'var(--color-danger)' }}
                >{errors.email.message}</motion.p>
              )}
            </div>

            {/* Password field */}
            <div style={{ position: 'relative' }}>
              <motion.label
                animate={{
                  fontSize: focused === 'password' ? 10 : 11,
                  color: focused === 'password' ? currentRoleInfo.color : 'var(--text-tertiary)',
                }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'block', fontWeight: 700,
                  marginBottom: 6, letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                Şifrə
              </motion.label>
              <motion.div
                animate={{
                  boxShadow: focused === 'password'
                    ? `0 0 0 2px ${currentRoleInfo.color}50`
                    : '0 0 0 1px var(--border-card)',
                }}
                transition={{ duration: 0.2 }}
                style={{ borderRadius: 12, position: 'relative' }}
              >
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={{ paddingRight: 48, boxShadow: 'none', border: 'none', borderRadius: 12 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="touch-target"
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', fontSize: 16, padding: 4,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </motion.div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 4, fontSize: 11, color: 'var(--color-danger)' }}
                >{errors.password.message}</motion.p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="touch-target" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: currentRoleInfo.color, width: 15, height: 15 }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Məni xatırla</span>
              </label>
              <Link to="/forgot-password" style={{
                fontSize: 12, color: currentRoleInfo.color,
                textDecoration: 'none', fontWeight: 600,
                transition: 'opacity 0.2s',
              }}>
                Şifrəni unutdum?
              </Link>
            </div>

            {/* Role mismatch error */}
            {roleMismatch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13,
                  background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)',
                  color: 'var(--color-danger)', textAlign: 'center',
                }}
              >
                Bu hesab <strong>{ROLES.find(r => r.role === activeRole)?.label}</strong> hesabı deyil. Yuxarıdan düzgün rol seçin.
              </motion.div>
            )}

            {/* Auth error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13,
                  background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)',
                  color: 'var(--color-danger)', textAlign: 'center',
                }}
              >
                {(() => {
                  const code = (error as any)?.code ?? ''
                  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Şifrə yanlışdır.'
                  if (code === 'auth/user-not-found')   return 'Bu e-poçtla hesab tapılmadı.'
                  if (code === 'auth/too-many-requests') return 'Çox cəhd. Bir az gözləyin.'
                  if (code === 'auth/user-disabled')    return 'Hesab deaktiv edilib.'
                  return 'E-poçt və ya şifrə yanlışdır.'
                })()}
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isPending}
              className="shine-btn touch-target"
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', padding: '15px',
                borderRadius: 14, border: 'none',
                background: isPending
                  ? 'rgba(79,135,255,0.4)'
                  : `linear-gradient(135deg, ${currentRoleInfo.color}, ${currentRoleInfo.color}cc)`,
                color: '#fff', fontSize: 15, fontWeight: 800,
                fontFamily: "'Lexend Deca', sans-serif",
                cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: isPending ? 'none' : `0 6px 24px ${currentRoleInfo.glow}`,
                transition: 'background 0.4s ease, box-shadow 0.4s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {isPending ? (
                <span className="spinner" style={{ width: 20, height: 20 }} />
              ) : (
                <>Daxil ol <span style={{ opacity: 0.8 }}>→</span></>
              )}
            </motion.button>
          </form>

          {/* Register link */}
          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
            Hesabınız yoxdur?{' '}
            <Link to="/register" style={{
              color: currentRoleInfo.color, fontWeight: 700, textDecoration: 'none',
            }}>
              Qeydiyyat
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}
        >
          © {new Date().getFullYear()} NIDA · Bütün hüquqlar qorunur
        </motion.p>
      </motion.div>
    </div>
  )
}
