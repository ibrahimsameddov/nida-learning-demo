// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore }        from '@/stores/authStore'
import { apiSearchUser, apiSendParentRequest, apiGetParentRequests } from '@/lib/api'
import { SPRING }              from '@/lib/motion'
import NidaLogo                from '@/components/shared/NidaLogo'

const COLOR = '#F4A261'

function GradeBadge({ grade }: any) {
  if (!grade) return null
  const labels: Record<number, string> = { 9: '9-cu', 10: '10-cu', 11: '11-ci' }
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 700,
      background: 'rgba(244,162,97,0.12)', color: COLOR,
    }}>{labels[grade] ?? grade}-ci sinif</span>
  )
}

export default function ParentOnboarding() {
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)

  // step: 'search' | 'confirm' | 'sent' | 'already'
  const [step,       setStep]       = useState<'search' | 'confirm' | 'sent' | 'already'>('search')
  const [query,      setQuery]      = useState('')
  const [searching,  setSearching]  = useState(false)
  const [found,      setFound]      = useState<any>(null)
  const [sending,    setSending]    = useState(false)
  const [searchErr,  setSearchErr]  = useState('')
  const [existing,   setExisting]   = useState<any[]>([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    apiGetParentRequests()
      .then((reqs: any[]) => {
        const pending = reqs.filter(r => r.status === 'pending' || r.status === 'accepted')
        setExisting(pending)
        if (pending.some(r => r.status === 'accepted')) setStep('already')
      })
      .catch(() => {})
  }, [user, navigate])

  const handleSearch = async () => {
    const q = query.trim()
    if (!q) { setSearchErr('ID daxil edin'); return }
    setSearching(true); setSearchErr(''); setFound(null)
    try {
      const result = await apiSearchUser(q)
      if (!result) { setSearchErr('Şagird tapılmadı. ID-ni yoxlayın.'); return }
      if (result.role && result.role !== 'student') { setSearchErr('Bu ID şagirdə məxsus deyil.'); return }
      setFound(result)
      setStep('confirm')
    } catch { setSearchErr('Axtarış zamanı xəta baş verdi.') }
    finally { setSearching(false) }
  }

  const handleSendRequest = async () => {
    if (!found) return
    setSending(true)
    try {
      await apiSendParentRequest(found.id, found.uniqueId || found.uid)
      setStep('sent')
    } catch (e: any) {
      const msg = e?.message
      if (msg === 'accepted') setStep('already')
      else if (msg === 'pending') setStep('sent')
      else setSearchErr('Sorğu göndərmə xətası')
      setStep(msg === 'accepted' ? 'already' : 'sent')
    } finally { setSending(false) }
  }

  const name  = user ? ((user as any).fullName || (user as any).displayName || 'Valideyn') : 'Valideyn'
  const first = name.split(' ')[0]

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px 40px',
      background: 'radial-gradient(ellipse at 20% 20%, rgba(244,162,97,0.08) 0%, transparent 60%), var(--bg-primary)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blob */}
      <div style={{
        position: 'absolute', top: '-5%', right: '-5%', width: '40vw', height: '40vw',
        borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none',
        background: `radial-gradient(circle, ${COLOR} 0%, transparent 70%)`,
      }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <NidaLogo size="sm" />
          <span style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-1)' }}>Nida</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── SEARCH step ── */}
          {step === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={SPRING}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 64, height: 64, borderRadius: 18, marginBottom: 14,
                  background: 'rgba(244,162,97,0.12)', border: `0.5px solid rgba(244,162,97,0.3)`,
                  fontSize: 28,
                }}>👨‍👩‍👧</div>
                <h1 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-1)', marginBottom: 6 }}>
                  Xoş gəldin, {first}!
                </h1>
                <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.6 }}>
                  Övladınızın inkişafını izləmək üçün onun ID nömrəsini daxil edin
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 20, padding: '24px 20px' }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
                  Şagird ID-si
                </label>
                <input
                  className="input"
                  placeholder="ŞAG-XXXXXX"
                  value={query}
                  onChange={e => { setQuery(e.target.value.toUpperCase()); setSearchErr('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', marginBottom: 12 }}
                  autoFocus
                />
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.55 }}>
                  💡 ID şagirdin profilindən görmək olar (ŞAG-XXXXXX formatı)
                </p>

                {searchErr && (
                  <div style={{ fontSize: 12, color: '#ff4d6d', padding: '8px 12px', background: 'rgba(255,77,109,0.08)', borderRadius: 8, marginBottom: 12 }}>
                    {searchErr}
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={searching || !query.trim()}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none',
                    background: searching || !query.trim() ? 'rgba(244,162,97,0.3)' : `linear-gradient(135deg, ${COLOR}, #e8895a)`,
                    color: '#fff', cursor: searching || !query.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: "'Lexend Deca', sans-serif",
                    boxShadow: '0 4px 20px rgba(244,162,97,0.25)',
                  }}
                >
                  {searching ? 'Axtarılır...' : '🔍  Axtar'}
                </button>
              </div>

              {existing.length > 0 && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.2)' }}>
                  <div style={{ fontSize: 12, color: COLOR, fontWeight: 600 }}>
                    📬 {existing.length} sorğu göndərilmişdir — şagirdin qəbulunu gözləyin
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/parent')}
                style={{ width: '100%', marginTop: 12, padding: '11px', borderRadius: 12, background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Sonraya qoy → Panelə keç
              </button>
            </motion.div>
          )}

          {/* ── CONFIRM step ── */}
          {step === 'confirm' && found && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={SPRING}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h1 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)', marginBottom: 6 }}>
                  Şagird tapıldı
                </h1>
                <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Bu sizin övladınız olduğunu təsdiqləyin</p>
              </div>

              <div style={{
                background: 'var(--bg-card)', border: `0.5px solid rgba(244,162,97,0.3)`,
                borderRadius: 20, padding: '20px', marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, #00C9A7, #00a88c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff',
                  }}>
                    {(found.fullName || found.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                      {found.fullName || found.name || 'Şagird'}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#00C9A7', background: 'rgba(0,201,167,0.1)', padding: '2px 8px', borderRadius: 5, fontWeight: 700 }}>
                        {found.uniqueId || '—'}
                      </span>
                      <GradeBadge grade={found.grade} />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, lineHeight: 1.6 }}>
                  Sorğu göndərildikdən sonra şagird öz panelindən qəbul etməlidir. Qəbul edildikdən sonra hesabınız aktivləşər.
                </div>
              </div>

              {searchErr && (
                <div style={{ fontSize: 12, color: '#ff4d6d', padding: '8px 12px', background: 'rgba(255,77,109,0.08)', borderRadius: 8, marginBottom: 12 }}>
                  {searchErr}
                </div>
              )}

              <button
                onClick={handleSendRequest}
                disabled={sending}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none',
                  background: sending ? 'rgba(244,162,97,0.3)' : `linear-gradient(135deg, ${COLOR}, #e8895a)`,
                  color: '#fff', cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: "'Lexend Deca', sans-serif",
                  boxShadow: '0 4px 20px rgba(244,162,97,0.25)',
                  marginBottom: 8,
                }}
              >
                {sending ? 'Göndərilir...' : '📤  Bağlantı sorğusu göndər'}
              </button>
              <button
                onClick={() => { setStep('search'); setFound(null); setSearchErr('') }}
                style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >← Geri</button>
            </motion.div>
          )}

          {/* ── SENT step ── */}
          {step === 'sent' && (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={SPRING}>
              <div style={{ background: 'var(--bg-card)', border: `0.5px solid rgba(244,162,97,0.3)`, borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING, delay: 0.1 }}
                  style={{ fontSize: 56, marginBottom: 16 }}
                >📬</motion.div>
                <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)', marginBottom: 10 }}>
                  Sorğu göndərildi!
                </h2>
                <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                  Şagird sorğunu öz panelindən qəbul etdikdən sonra siz övladınızın statistikasını görə biləcəksiniz.
                </p>
                <div style={{ padding: '12px 16px', background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.2)', borderRadius: 12, marginBottom: 20, fontSize: 12, color: COLOR, lineHeight: 1.6 }}>
                  ⏳ Gözlənilir — şagird öz telefonunda bildiriş alacaq
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => { setStep('search'); setQuery(''); setFound(null) }}
                    style={{
                      padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 13, border: 'none',
                      background: `linear-gradient(135deg, ${COLOR}, #e8895a)`,
                      color: '#fff', cursor: 'pointer',
                      fontFamily: "'Lexend Deca', sans-serif",
                    }}
                  >+ Başqa övlad əlavə et</button>
                  <button
                    onClick={() => navigate('/parent')}
                    style={{ padding: '11px', borderRadius: 12, background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >Panelə keç →</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ALREADY connected ── */}
          {step === 'already' && (
            <motion.div key="already" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}>
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid rgba(0,201,167,0.3)', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)', marginBottom: 10 }}>
                  Hesabınız aktivdir
                </h2>
                <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                  Övladınız sorğunuzu qəbul etmişdir. İndi panelinizdən statistikaları izləyə bilərsiniz.
                </p>
                <button
                  onClick={() => navigate('/parent')}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none',
                    background: 'linear-gradient(135deg, #00C9A7, #00a88c)',
                    color: '#fff', cursor: 'pointer',
                    fontFamily: "'Lexend Deca', sans-serif",
                    boxShadow: '0 4px 20px rgba(0,201,167,0.3)',
                  }}
                >Panelə keç →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
