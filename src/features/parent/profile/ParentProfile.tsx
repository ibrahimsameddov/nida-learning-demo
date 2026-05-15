// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/store/authContext'
import { apiUpdateProfile } from '@/lib/api'
import toast from 'react-hot-toast'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }
const COLOR  = '#F4A261'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 20, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-mono)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
          background: checked ? COLOR : 'var(--bg-hover)', transition: 'background 0.2s',
          position: 'relative', flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          style={{ position: 'absolute', top: 3, left: 0, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
        />
      </button>
    </div>
  )
}

export default function ParentProfile() {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const name     = (userProfile as any)?.fullName || userProfile?.displayName || 'Valideyn'
  const email    = userProfile?.email || ''
  const phone    = (userProfile as any)?.phone || ''
  const initials = name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase()

  const [editName,  setEditName]  = useState(name)
  const [editPhone, setEditPhone] = useState(phone)
  const [saving,    setSaving]    = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  const [notifExam,    setNotifExam]    = useState(true)
  const [notifStreak,  setNotifStreak]  = useState(true)
  const [notifWeekly,  setNotifWeekly]  = useState(true)
  const [notifMessage, setNotifMessage] = useState(true)

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiUpdateProfile({ fullName: editName.trim(), phone: editPhone.trim() })
      toast.success('Profil yeniləndi')
    } catch {
      toast.error('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-inner" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560, margin: '0 auto' }}>

      {/* Avatar header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${COLOR}, #e8895a)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 12,
          boxShadow: `0 4px 20px ${COLOR}44`,
          fontFamily: 'var(--font-heading)',
        }}>
          {initials}
        </div>
        <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
          {name}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          Valideyn hesabı
        </p>
      </motion.div>

      {/* Edit profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.05 }}>
        <Section title="Məlumatlar">
          <Field label="Ad Soyad">
            <input
              className="input"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Ad Soyad"
              style={{ borderRadius: 10 }}
            />
          </Field>

          <Field label="E-poçt">
            <input
              className="input"
              value={email}
              disabled
              style={{ borderRadius: 10, opacity: 0.5, cursor: 'not-allowed' }}
            />
          </Field>

          <Field label="Telefon">
            <input
              className="input"
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              placeholder="+994 50 XXX XX XX"
              style={{ borderRadius: 10 }}
            />
          </Field>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${COLOR}, #e8895a)`,
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, fontFamily: 'var(--font-heading)',
            }}
          >
            {saving ? 'Yadda saxlanılır…' : 'Yadda saxla'}
          </motion.button>
        </Section>
      </motion.div>

      {/* Notification settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }}>
        <Section title="Bildiriş Tənzimləmələri">
          <Toggle
            label="İmtahan xəbərdarlığı"
            desc="Uşağınızın imtahanı yaxınlaşanda bildiriş alın"
            checked={notifExam}
            onChange={setNotifExam}
          />
          <div style={{ height: '0.5px', background: 'var(--border)' }} />
          <Toggle
            label="Günlük seriya"
            desc="Uşağınız gün ərzində test həll etmədikdə"
            checked={notifStreak}
            onChange={setNotifStreak}
          />
          <div style={{ height: '0.5px', background: 'var(--border)' }} />
          <Toggle
            label="Həftəlik hesabat"
            desc="Hər bazar ertəsi həftəlik nəticə xülasəsi"
            checked={notifWeekly}
            onChange={setNotifWeekly}
          />
          <div style={{ height: '0.5px', background: 'var(--border)' }} />
          <Toggle
            label="Müəllim mesajları"
            desc="Müəllim mesaj göndərdikdə bildiriş"
            checked={notifMessage}
            onChange={setNotifMessage}
          />
        </Section>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.15 }}>
        <Section title="Hesab">
          <button
            onClick={() => navigate('/parent/children')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span style={{ fontSize: 20 }}>👨‍👩‍👧</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Övladlarım</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Bağlı uşaq hesablarını idarə et</p>
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: 18 }}>›</span>
          </button>

          <div style={{ height: '0.5px', background: 'var(--border)' }} />

          <button
            onClick={() => navigate('/parent/payments')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span style={{ fontSize: 20 }}>💳</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Balans & Ödəniş</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Ödəniş tarixçəsi və balans artırma</p>
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: 18 }}>›</span>
          </button>
        </Section>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 20, padding: '16px 20px' }}>
          <AnimatePresence mode="wait">
            {!logoutConfirm ? (
              <motion.button
                key="logout-btn"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLogoutConfirm(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, border: '0.5px solid rgba(255,77,109,0.3)',
                  background: 'rgba(255,77,109,0.07)', color: '#ff4d6d',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                ⏻ Çıxış
              </motion.button>
            ) : (
              <motion.div
                key="logout-confirm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <p style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center' }}>
                  Əminsinizmi?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setLogoutConfirm(false)}
                    style={{ flex: 1, padding: '11px', borderRadius: 12, border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-3)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#ff4d6d', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    Bəli, çıx
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-mono)', paddingBottom: 16 }}>
        NIDA Learning · Valideyn Paneli
      </p>
    </div>
  )
}
