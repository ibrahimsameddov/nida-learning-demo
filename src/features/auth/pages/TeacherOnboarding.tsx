// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { apiCreateGroup, apiUpdateProfile } from '@/lib/api'

const SUBJECTS = [
  { id: 'math',    icon: '📐', label: 'Riyaziyyat',         color: '#4F87FF' },
  { id: 'az',      icon: '📖', label: 'Azərbaycan dili',    color: '#F4A261' },
  { id: 'physics', icon: '⚡', label: 'Fizika',             color: '#A78BFA' },
  { id: 'chem',    icon: '🧪', label: 'Kimya',              color: '#00C9A7' },
  { id: 'bio',     icon: '🧬', label: 'Biologiya',          color: '#38BDF8' },
  { id: 'history', icon: '🏛️', label: 'Tarix',              color: '#FB7185' },
  { id: 'geo',     icon: '🌍', label: 'Coğrafiya',          color: '#6C63FF' },
  { id: 'it',      icon: '💻', label: 'İnformatika',        color: '#00C9A7' },
  { id: 'english', icon: '🇬🇧', label: 'Xarici dil',         color: '#F4A261' },
]

const STEPS = [
  { id: 'subject',  title: 'Fənninizi seçin',         desc: 'Tədris etdiyiniz əsas fənni seçin' },
  { id: 'group',    title: 'İlk qrupu yaradın',        desc: 'Şagird qrupunuzu adlandırın (ixtiyari)' },
  { id: 'done',     title: 'Hazırsınız!',              desc: 'Müəllim panelinizə xoş gəldiniz' },
]

export default function TeacherOnboarding() {
  const navigate = useNavigate()
  const [step,        setStep]       = useState(0)
  const [subject,     setSubject]    = useState<string | null>(null)
  const [groupName,   setGroupName]  = useState('')
  const [saving,      setSaving]     = useState(false)

  const selectedSubject = SUBJECTS.find(s => s.id === subject)

  const goNext = async () => {
    if (step === 0) {
      if (!subject) return
      setSaving(true)
      try {
        const sub = selectedSubject?.label ?? ''
        await apiUpdateProfile({ subjectSpecialty: sub })
      } catch { /* non-fatal */ } finally { setSaving(false) }
      setStep(1)
    } else if (step === 1) {
      if (groupName.trim()) {
        setSaving(true)
        try {
          await apiCreateGroup(groupName.trim(), selectedSubject?.label ?? '', 25)
        } catch { /* non-fatal */ } finally { setSaving(false) }
      }
      setStep(2)
    } else {
      navigate('/teacher')
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1225 50%, #0a0a1a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,135,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #4F87FF, #6C63FF)', borderRadius: '0 3px 3px 0' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <motion.div key={i} style={{
              height: 4, borderRadius: 4,
              background: i <= step ? '#4F87FF' : 'rgba(255,255,255,0.1)',
            }}
            animate={{ width: i === step ? 28 : 8 }}
            transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-subject"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 24, padding: '28px 24px',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                  background: 'linear-gradient(135deg, rgba(79,135,255,0.2), rgba(108,99,255,0.2))',
                  border: '0.5px solid rgba(79,135,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>📚</div>
                <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 6 }}>
                  {STEPS[0].title}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  {STEPS[0].desc}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
                {SUBJECTS.map(s => {
                  const active = subject === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSubject(s.id)}
                      style={{
                        padding: '14px 6px', borderRadius: 14,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        cursor: 'pointer', transition: 'all 0.2s',
                        border: active ? `1.5px solid ${s.color}` : '0.5px solid rgba(255,255,255,0.1)',
                        background: active ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                        boxShadow: active ? `0 0 20px ${s.color}22` : 'none',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: active ? s.color : 'rgba(255,255,255,0.4)',
                        textAlign: 'center', lineHeight: 1.3, fontFamily: "'Lexend Deca', sans-serif",
                      }}>{s.label}</span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={goNext}
                disabled={!subject || saving}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 15,
                  background: subject ? 'linear-gradient(135deg, #4F87FF, #6C63FF)' : 'rgba(255,255,255,0.08)',
                  border: 'none', color: subject ? '#fff' : 'rgba(255,255,255,0.3)',
                  cursor: subject ? 'pointer' : 'not-allowed',
                  fontFamily: "'Lexend Deca', sans-serif",
                  boxShadow: subject ? '0 4px 24px rgba(79,135,255,0.4)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {saving ? 'Saxlanılır...' : 'Növbəti →'}
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-group"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 24, padding: '28px 24px',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(79,135,255,0.2))',
                  border: '0.5px solid rgba(108,99,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>📁</div>
                <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 6 }}>
                  {STEPS[1].title}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  {STEPS[1].desc}
                </p>
              </div>

              {selectedSubject && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  borderRadius: 12, marginBottom: 18,
                  background: `${selectedSubject.color}12`,
                  border: `0.5px solid ${selectedSubject.color}30`,
                }}>
                  <span style={{ fontSize: 18 }}>{selectedSubject.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: selectedSubject.color }}>
                    {selectedSubject.label} müəllimi
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', marginBottom: 8,
                  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                }}>Qrup adı</label>
                <input
                  placeholder="Riyaziyyat 10A, Gündüz qrupu..."
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: groupName ? '0.5px solid rgba(79,135,255,0.4)' : '0.5px solid rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: 14, outline: 'none',
                    fontFamily: "'Lexend Deca', sans-serif",
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={goNext}
                disabled={saving}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 15,
                  background: 'linear-gradient(135deg, #6C63FF, #4F87FF)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  fontFamily: "'Lexend Deca', sans-serif",
                  boxShadow: '0 4px 24px rgba(108,99,255,0.4)',
                  marginBottom: 10, transition: 'opacity 0.2s',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Yaradılır...' : groupName.trim() ? '+ Qrup yarat →' : 'Sonra yaradaq →'}
              </button>

              {!groupName.trim() && (
                <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  Qrupu sonra Qruplar bölməsindən əlavə edə bilərsiniz
                </p>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(79,135,255,0.2)',
                borderRadius: 24, padding: '36px 24px',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ fontSize: 64, marginBottom: 20 }}
              >🎉</motion.div>

              <h2 style={{
                fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 24,
                color: '#fff', marginBottom: 10,
              }}>
                Xoş gəldiniz!
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
                Müəllim paneliniz hazırdır. Şagirdlər əlavə edib, imtahanlar yaradıb, analitikanı izləyə bilərsiniz.
              </p>

              {selectedSubject && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                  borderRadius: 20, marginBottom: 28,
                  background: `${selectedSubject.color}14`,
                  border: `0.5px solid ${selectedSubject.color}35`,
                }}>
                  <span>{selectedSubject.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: selectedSubject.color }}>
                    {selectedSubject.label} müəllimi
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  { icon: '📁', text: 'Qrup yaradıb şagird əlavə edin', color: '#6C63FF' },
                  { icon: '📋', text: 'İmtahan yararaq aktivləşdirin',   color: '#F4A261' },
                  { icon: '📊', text: 'Analitika ilə nəticəni izləyin',  color: '#00C9A7' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 12, textAlign: 'left',
                      background: 'rgba(255,255,255,0.04)',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: `${item.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                    }}>{item.icon}</div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={goNext}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  width: '100%', padding: '15px', borderRadius: 14, fontWeight: 800, fontSize: 16,
                  background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  fontFamily: "'Lexend Deca', sans-serif",
                  boxShadow: '0 6px 28px rgba(79,135,255,0.45)',
                }}
              >
                Panelə keç →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
