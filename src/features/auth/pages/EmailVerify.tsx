import { useState }    from 'react'
import { Link }        from 'react-router-dom'
import { api }         from '../../../lib/api'
import { useAuthStore } from '../../../stores/authStore'

export default function EmailVerify() {
  const [resent,  setResent]  = useState(false)
  const [error,   setError]   = useState('')
  const email = useAuthStore(s => s.user?.email ?? '')

  const handleResend = async () => {
    setError('')
    try {
      await api.post('/api/auth/resend-verification', { email })
      setResent(true)
      setTimeout(() => setResent(false), 6000)
    } catch {
      setError('Göndərmə zamanı xəta baş verdi.')
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

      <div style={{
        width: '100%', maxWidth: 380, textAlign: 'center',
        animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>

        <h1 style={{
          fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 24,
          color: 'var(--text-1)', marginBottom: 8,
        }}>E-poçtu doğrulayın</h1>

        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 8 }}>
          Doğrulama linki göndərildi:
        </p>
        {email && (
          <p style={{
            fontSize: 14, fontWeight: 600, color: 'var(--primary)',
            marginBottom: 24, fontFamily: "'JetBrains Mono', monospace",
          }}>
            {email}
          </p>
        )}

        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 16, padding: '20px 24px', marginBottom: 16,
          textAlign: 'left',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            1. E-poçt qutunuzu açın<br />
            2. NIDA-dan gələn emaili tapın<br />
            3. <strong style={{ color: 'var(--text-1)' }}>"E-poçtu doğrula"</strong> linkini klik edin<br />
            4. Sonra aşağıdakı düymə ilə daxil olun
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12,
            background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
            color: 'var(--danger)', textAlign: 'left',
          }}>
            {error}
          </div>
        )}

        <Link
          to="/login"
          className="btn btn-primary btn-full btn-lg"
          style={{ display: 'block', marginBottom: 12, textDecoration: 'none' }}
        >
          Daxil ol →
        </Link>

        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Email gəlmədi?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resent}
            style={{
              background: 'none', border: 'none', cursor: resent ? 'default' : 'pointer',
              color: resent ? 'var(--text-3)' : 'var(--primary)',
              fontWeight: 600, fontSize: 'inherit',
            }}
          >
            {resent ? 'Göndərildi ✓' : 'Yenidən göndər'}
          </button>
        </p>
      </div>
    </div>
  )
}
