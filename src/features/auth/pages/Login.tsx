import { useState }          from 'react'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { Link, useNavigate }  from 'react-router-dom'
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

export default function Login() {
  const navigate = useNavigate()
  const { mutateAsync: login, isPending, error } = useLogin()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data)
      const role = useAuthStore.getState().user?.role
      navigate(role ? ROLE_HOME[role] : '/', { replace: true })
    } catch {
      // error displayed below
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, position: 'relative',
      overflow: 'hidden', background: 'var(--bg-primary)',
    }}>
      {/* background orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.35,
        background: 'var(--glow)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '35vw', height: '35vw', borderRadius: '50%',
        filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.2,
        background: 'var(--accent)',
      }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16, marginBottom: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>N</span>
          </div>
          <h1 style={{
            fontFamily: "'Lexend Deca','Lexend Deca',sans-serif", fontWeight: 800, fontSize: 24,
            color: 'var(--text-1)', marginBottom: 6,
          }}>Xoş gəlmisiniz!</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            NIDA Platformasına daxil olaraq öyrənməyə davam edin
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 20, padding: '28px 24px',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label className="label-sm">E-poçt ünvanı</label>
              <input
                type="email"
                className="input"
                placeholder="nida@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label-sm">Şifrə</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-3)', fontSize: 16, padding: 4,
                  }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
                color: 'var(--danger)',
              }}>
                {(() => {
                  const code = (error as any)?.code ?? ''
                  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
                    return 'Şifrə yanlışdır.'
                  if (code === 'auth/user-not-found')
                    return 'Bu e-poçtla hesab tapılmadı.'
                  if (code === 'auth/too-many-requests')
                    return 'Çox sayda uğursuz cəhd. Bir az gözləyin.'
                  if (code === 'auth/user-disabled')
                    return 'Hesab deaktiv edilib.'
                  return 'E-poçt və ya şifrə yanlışdır.'
                })()}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Məni xatırla</span>
              </label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Şifrəni unutmusan?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isPending}
              style={{ marginTop: 4 }}
            >
              {isPending
                ? <span className="spinner" style={{ width: 18, height: 18 }} />
                : 'Daxil ol'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
            Hesabınız yoxdur?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Qeydiyyatdan keçin
            </Link>
          </div>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-3)' }}>
          &copy; {new Date().getFullYear()} NIDA Gələcəyə Səsləniş Platforması
        </p>
      </div>
    </div>
  )
}
