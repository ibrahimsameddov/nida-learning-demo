import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/store/authContext'

const STEPS = [
  { icon: '📋', label: 'Müraciət göndərildi',   done: true  },
  { icon: '🔍', label: 'Admin yoxlaması',         done: false },
  { icon: '✅', label: 'Hesab aktivləşdirilir',   done: false },
]

export default function TeacherPending() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(160deg, #080818 0%, #0c1228 50%, #080818 100%)',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Lexend Deca', sans-serif",
    }}>

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,135,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >

        {/* Animated icon */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: 22, marginBottom: 20,
              background: 'linear-gradient(135deg, rgba(79,135,255,0.2), rgba(108,99,255,0.2))',
              border: '0.5px solid rgba(79,135,255,0.3)',
              boxShadow: '0 0 40px rgba(79,135,255,0.15)',
            }}
          >
            <span style={{ fontSize: 38 }}>⏳</span>
          </motion.div>

          <h1 style={{ fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
            Hesabınız yoxlanılır
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 320, margin: '0 auto' }}>
            Müəllim hesabınız admin tərəfindən yoxlanıldıqdan sonra tam giriş əldə edəcəksiniz.
            Bu proses adətən <strong style={{ color: 'rgba(255,255,255,0.7)' }}>24 saat</strong> ərzində tamamlanır.
          </p>
        </div>

        {/* Progress steps */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '20px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: s.done
                      ? 'rgba(0,201,167,0.15)'
                      : i === 1 ? 'rgba(79,135,255,0.12)' : 'rgba(255,255,255,0.05)',
                    border: s.done
                      ? '0.5px solid rgba(0,201,167,0.3)'
                      : i === 1 ? '0.5px solid rgba(79,135,255,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {s.done ? '✅' : s.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: s.done ? '#00C9A7' : i === 1 ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}>{s.label}</div>
                    {i === 1 && (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ fontSize: 11, color: '#4F87FF', marginTop: 2 }}
                      >
                        Prosesdədir...
                      </motion.div>
                    )}
                  </div>
                  {s.done && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: 'rgba(0,201,167,0.12)', color: '#00C9A7',
                    }}>Tamamlandı</span>
                  )}
                  {i === 1 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: 'rgba(79,135,255,0.12)', color: '#4F87FF',
                    }}>Gözlənilir</span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ marginLeft: 19, width: 0, height: 16, border: '0.5px dashed rgba(255,255,255,0.08)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div style={{
          background: 'rgba(244,162,97,0.07)',
          border: '0.5px solid rgba(244,162,97,0.2)',
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F4A261', marginBottom: 4 }}>Bildiriş alacaqsınız</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Hesabınız təsdiqlənəndə qeydiyyat e-poçtunuza bildiriş göndəriləcək.
              Ondan sonra hesabınıza tam giriş edə bilərsiniz.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigate('/onboarding/teacher')}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
              background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontFamily: "'Lexend Deca', sans-serif",
              boxShadow: '0 4px 24px rgba(79,135,255,0.35)',
            }}
          >
            Paneli kəşf et →
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '11px', borderRadius: 12, fontWeight: 600, fontSize: 13,
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              fontFamily: "'Lexend Deca', sans-serif",
            }}
          >
            Çıxış et
          </button>
        </div>
      </motion.div>
    </div>
  )
}
