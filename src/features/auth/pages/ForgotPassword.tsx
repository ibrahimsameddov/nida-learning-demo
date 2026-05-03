import { useState }        from 'react'
import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import { Link }            from 'react-router-dom'
import { z }               from 'zod'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth }            from '../services/firebase'

const ACTION_CODE_SETTINGS = {
  url: `${window.location.origin}/login`,
  handleCodeInApp: false,
}

const schema = z.object({
  email: z.string().email('Düzgün e-poçt daxil edin'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent,  setSent]  = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormData) => {
    setError('')
    try {
      await sendPasswordResetEmail(auth, email, ACTION_CODE_SETTINGS)
      setSent(true)
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/user-not-found')    setError('Bu e-poçtla qeydiyyat tapılmadı.')
      else if (code === 'auth/invalid-email') setError('E-poçt formatı yanlışdır.')
      else                                    setError('Xəta baş verdi. Yenidən cəhd edin.')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, position: 'relative',
      overflow: 'hidden', background: 'var(--bg-primary)',
    }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.35,
        background: 'var(--glow)',
      }} />

      <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16, marginBottom: 12,
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            fontSize: 28,
          }}>🔑</div>
          <h1 style={{
            fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 22,
            color: 'var(--text-1)', marginBottom: 6,
          }}>Şifrəni sıfırla</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            E-poçtunuzu daxil edin, sıfırlama linki göndərək
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 20, padding: '28px 24px',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <p style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>
                Göndərildi!
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{getValues('email')}</span>
                {' '}ünvanına sıfırlama linki göndərildi. Spam qutusunu da yoxlayın.
              </p>
              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '12px',
                borderRadius: 12, background: 'rgba(0,212,255,0.1)',
                color: 'var(--primary)', fontWeight: 600, fontSize: 14,
                textDecoration: 'none',
              }}>
                ← Giriş səhifəsinə qayıt
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label-sm">E-poçt ünvanı</label>
                <input
                  type="email"
                  className="input"
                  placeholder="ali@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>{errors.email.message}</p>
                )}
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
                  color: 'var(--danger)',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={isSubmitting}
                style={{ marginTop: 4 }}
              >
                {isSubmitting
                  ? <span className="spinner" style={{ width: 18, height: 18 }} />
                  : 'Sıfırlama linki göndər'}
              </button>

              <Link to="/login" style={{
                textAlign: 'center', fontSize: 13,
                color: 'var(--text-3)', textDecoration: 'none',
              }}>
                ← Geri
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
