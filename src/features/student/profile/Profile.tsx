// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/store/authContext'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore, getLevelInfo } from '@/stores/gamificationStore'
import { Role, Subject } from '../../../types/models'
import { apiUpdateProfile, apiGetSentPermissions, apiGetMyChildren, apiChangePassword, apiGetIncomingParentRequests, apiRespondParentRequest } from '@/lib/api'
import { SPRING } from '@/lib/motion'

const GRADE_LABEL: Record<number, string> = { 9: '9-cu', 10: '10-cu', 11: '11-ci' }
const SUBJECT_LABEL: Record<string, string> = {
  [Subject.English]: 'İngilis dili',
  [Subject.Russian]: 'Rus dili',
}
const ALL_SUBJECTS = [
  'Riyaziyyat', 'Azərbaycan dili', 'Fizika', 'Kimya',
  'Biologiya', 'Tarix', 'Coğrafiya', 'İnformatika', 'Xarici dil',
]

export default function Profile() {
  const { userProfile, logout } = useAuth()
  const setUser    = useAuthStore(s => s.setUser)
  const navigate   = useNavigate()

  const xp       = useGamificationStore(s => s.xp)
  const gStreak  = useGamificationStore(s => s.streak)
  const badges   = useGamificationStore(s => s.badges)
  const lvInfo   = getLevelInfo(xp)

  const name   = userProfile?.fullName || 'İstifadəçi'
  const email  = userProfile?.email    || ''
  const role   = userProfile?.role
  const isTeacher = role === Role.Teacher
  const isStudent = role === Role.Student
  const isParent  = role === Role.Parent

  const idColor  = isTeacher ? '#4F87FF' : role === Role.Parent ? '#F4A261' : '#00C9A7'
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const uniqueId = userProfile?.uniqueId || ''
  const roleLabel = isTeacher ? 'Müəllim' : role === Role.Parent ? 'Valideyn' : 'Şagird'

  // Student fields
  const grade       = isStudent ? userProfile?.grade as number | undefined : undefined
  const group       = isStudent ? userProfile?.group as string | undefined : undefined
  const foreignLang = isStudent ? userProfile?.foreignLang as string | undefined : undefined
  const city        = isStudent ? ((userProfile as any)?.city || '') : ''
  const school      = isStudent ? ((userProfile as any)?.school || '') : ''
  const streak      = isStudent ? (userProfile as any)?.streakDays as number | undefined : undefined
  const total       = isStudent ? (userProfile as any)?.totalQuestions as number | undefined : undefined
  const rate        = isStudent ? (userProfile as any)?.successRate as number | undefined : undefined

  // Teacher state
  const [editMode,  setEditMode]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [editName,  setEditName]  = useState((userProfile as any)?.fullName || '')
  const [editCity,  setEditCity]  = useState((userProfile as any)?.city    || '')
  const [editSchool,setEditSchool]= useState((userProfile as any)?.school  || '')
  const [editSubjs, setEditSubjs] = useState<string[]>((userProfile as any)?.subjects || [])
  const [grantedPerms, setGrantedPerms] = useState<any[]>([])

  // Student state — incoming parent connection requests
  const [parentRequests,    setParentRequests]    = useState<any[]>([])
  const [requestLoading,    setRequestLoading]    = useState<Record<number, boolean>>({})

  // Parent state
  const [parentChildren,   setParentChildren]   = useState<any[]>([])
  const [parentEditName,   setParentEditName]   = useState((userProfile as any)?.fullName || '')
  const [parentEditPhone,  setParentEditPhone]  = useState((userProfile as any)?.phone    || '')
  const [parentEditCity,   setParentEditCity]   = useState((userProfile as any)?.city     || '')
  const [parentEdit,       setParentEdit]       = useState(false)
  const [parentSaving,     setParentSaving]     = useState(false)
  const [parentNotif,      setParentNotif]      = useState({
    taskDeadline: true,
    noActivity:   true,
    teacherMsg:   true,
    sysMessages:  true,
  })

  const [pwModal,   setPwModal]   = useState(false)
  const [notifSettings, setNotifSettings] = useState({
    newResult:   true,
    examStart:   true,
    groupNews:   true,
    sysMessages: true,
  })

  useEffect(() => {
    if (isTeacher) {
      apiGetSentPermissions()
        .then((p: any[]) => setGrantedPerms(p.filter((x: any) => x.status === 'granted')))
        .catch(() => {})
    }
    if (isParent) {
      apiGetMyChildren()
        .then(kids => setParentChildren(Array.isArray(kids) ? kids : []))
        .catch(() => {})
    }
    if (isStudent) {
      apiGetIncomingParentRequests()
        .then(reqs => setParentRequests(Array.isArray(reqs) ? reqs.filter((r: any) => r.status === 'PENDING') : []))
        .catch(() => {})
    }
  }, [isTeacher, isParent, isStudent])

  const handleRespondParent = async (requestId: number, accepted: boolean) => {
    setRequestLoading(l => ({ ...l, [requestId]: true }))
    try {
      await apiRespondParentRequest(requestId, accepted)
      setParentRequests(rs => rs.filter((r: any) => r.id !== requestId))
    } catch { /* ignore */ } finally {
      setRequestLoading(l => ({ ...l, [requestId]: false }))
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await apiUpdateProfile({
        fullName: editName.trim(),
        city:     editCity.trim(),
        school:   editSchool.trim(),
        subjects: editSubjs,
      })
      setUser({ ...useAuthStore.getState().user, fullName: editName.trim(), city: editCity.trim(), school: editSchool.trim(), subjects: editSubjs } as any)
      setEditMode(false)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const toggleSubj = (s: string) =>
    setEditSubjs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSaveParent = async () => {
    setParentSaving(true)
    try {
      await apiUpdateProfile({ fullName: parentEditName.trim(), phone: parentEditPhone.trim(), city: parentEditCity.trim() })
      setUser({ ...useAuthStore.getState().user, fullName: parentEditName.trim() } as any)
      setParentEdit(false)
    } catch { /* ignore */ } finally { setParentSaving(false) }
  }

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 16 }}>
        Profilim
      </h2>

      {/* Avatar + info */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg, ${idColor}, color-mix(in srgb, ${idColor} 60%, #6C63FF))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff',
        }}>{initials || '?'}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {uniqueId ? (
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: idColor,
                background: `color-mix(in srgb, ${idColor} 12%, transparent)`,
                border: `0.5px solid color-mix(in srgb, ${idColor} 30%, transparent)`,
                borderRadius: 8, padding: '3px 10px',
              }}>{uniqueId}</span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>ID yaradılır...</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Teacher section ─────────────────────────────────────────────────── */}
      {isTeacher && (
        <>
          {/* Info card — view or edit */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Məlumatlar</div>
              {!editMode ? (
                <button
                  onClick={() => { setEditName((userProfile as any)?.fullName || ''); setEditCity((userProfile as any)?.city || ''); setEditSchool((userProfile as any)?.school || ''); setEditSubjs((userProfile as any)?.subjects || []); setEditMode(true) }}
                  style={{ fontSize: 11, fontWeight: 700, color: '#4F87FF', background: 'rgba(79,135,255,0.1)', border: '0.5px solid rgba(79,135,255,0.25)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
                >✏️ Düzəliş et</button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setEditMode(false)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>Ləğv et</button>
                  <button onClick={handleSaveProfile} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: saving ? 'rgba(79,135,255,0.4)' : '#4F87FF', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? '...' : '✓ Saxla'}</button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editMode ? (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <EditField label="Ad Soyad">
                    <input className="input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ad Soyad" />
                  </EditField>
                  <EditField label="Şəhər">
                    <input className="input" value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="Bakı" />
                  </EditField>
                  <EditField label="Məktəb">
                    <input className="input" value={editSchool} onChange={e => setEditSchool(e.target.value)} placeholder="Məktəb adı" />
                  </EditField>
                  <EditField label="Tədris etdiyi fənlər">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {ALL_SUBJECTS.map(s => (
                        <button key={s} onClick={() => toggleSubj(s)} style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                          background: editSubjs.includes(s) ? 'rgba(79,135,255,0.18)' : 'rgba(255,255,255,0.04)',
                          border: editSubjs.includes(s) ? '0.5px solid rgba(79,135,255,0.4)' : '0.5px solid var(--border)',
                          color: editSubjs.includes(s) ? '#4F87FF' : 'var(--text-3)',
                        }}>{s}</button>
                      ))}
                    </div>
                  </EditField>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(userProfile as any)?.subjects?.length > 0 && (
                    <InfoRow label="Tədris etdiyi fənlər" value={(userProfile as any).subjects.join(', ')} />
                  )}
                  {(userProfile as any)?.city   && <InfoRow label="Şəhər"  value={(userProfile as any).city}   />}
                  {(userProfile as any)?.school  && <InfoRow label="Məktəb" value={(userProfile as any).school}  />}
                  {!(userProfile as any)?.subjects?.length && !(userProfile as any)?.city && !(userProfile as any)?.school && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>
                      Məlumat əlavə edilməyib — düzəliş et
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Granted students */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: grantedPerms.length > 0 ? 14 : 0 }}>
              İcazə verilmiş şagirdlər
              {grantedPerms.length > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, color: '#00C9A7', background: 'rgba(0,201,167,0.12)', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                  {grantedPerms.length}
                </span>
              )}
            </div>
            {grantedPerms.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-3)', paddingTop: 10 }}>
                Hələ heç bir şagirdə giriş icazəsi verilməyib
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grantedPerms.map((p: any) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(0,201,167,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {p.receiverUniqueId || p.studentUid || '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{p.subject}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, fontWeight: 700, background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>Aktiv</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification settings */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Bildiriş tənzimləmələri</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'newResult',   label: 'Yeni test nəticəsi'    },
                { key: 'examStart',   label: 'İmtahan başlanğıcı'    },
                { key: 'groupNews',   label: 'Qrup xəbərləri'        },
                { key: 'sysMessages', label: 'Sistem mesajları'       },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{label}</span>
                  <button
                    onClick={() => setNotifSettings(p => ({ ...p, [key]: !p[key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      background: notifSettings[key] ? '#4F87FF' : 'rgba(255,255,255,0.1)',
                      position: 'relative', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s',
                      left: notifSettings[key] ? 23 : 3,
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Student section ─────────────────────────────────────────────────── */}
      {isStudent && (
        <>
          {/* Gamification hero card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 }}
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--hero-panel)',
              border: '1px solid var(--hero-border)',
              padding: '18px 20px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* shimmer top line */}
            <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,149,43,0.4), transparent)' }} />

            {/* Level + XP */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: `${lvInfo.color}22`, border: `2px solid ${lvInfo.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 20, color: lvInfo.color,
              }}>{lvInfo.level}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--hero-text)', marginBottom: 2 }}>
                  {lvInfo.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--hero-text-dim)' }}>
                  {xp.toLocaleString()} XP · növbəti səviyyəyə {lvInfo.xpForNext.toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lvInfo.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  style={{
                    height: '100%', borderRadius: 99,
                    background: `linear-gradient(90deg, ${lvInfo.color}, ${lvInfo.color}88)`,
                    boxShadow: `0 0 8px ${lvInfo.color}60`,
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--hero-text-dim)', marginTop: 4, textAlign: 'right' }}>
                {lvInfo.progress}%
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { val: gStreak || streak || 0, label: 'Seriya 🔥', color: 'var(--streak)' },
                { val: badges.length,           label: 'Nailiyyət',  color: '#A78BFA' },
                { val: total ?? 0,              label: 'Sual',        color: 'var(--hero-text)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--hero-text-dim)', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges row */}
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.12 }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)', padding: '14px 16px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Nailiyyətlər ({badges.length})
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {badges.slice(0, 8).map(b => (
                  <div key={b.id} title={b.label}
                    style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                      background: 'rgba(201,149,43,0.10)', border: '1.5px solid rgba(201,149,43,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>{b.icon}</div>
                ))}
                {badges.length > 8 && (
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
                  }}>+{badges.length - 8}</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Info card */}
          {(grade || group || city || school || foreignLang) && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Məlumatlar</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {grade       && <InfoRow label="Sinif"         value={`${GRADE_LABEL[grade] ?? grade}-ci sinif`} />}
                {group       && <InfoRow label="İxtisas qrupu" value={`${group} qrupu`} />}
                {city        && <InfoRow label="Şəhər"         value={city} />}
                {school      && <InfoRow label="Məktəb"        value={school} />}
                {foreignLang && <InfoRow label="Xarici dil"    value={SUBJECT_LABEL[foreignLang] ?? foreignLang} />}
              </div>
            </div>
          )}

          {/* Parent connection requests */}
          {parentRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.08 }}
              style={{
                background: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.3)',
                borderRadius: 'var(--radius-xl)', padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                🔔 Valideyn sorğuları ({parentRequests.length})
              </div>
              {parentRequests.map((req: any) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(255,180,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>👨‍👩‍👧</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Valideyn #{req.parentId}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Hesabınıza bağlanmaq istəyir</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleRespondParent(req.id, false)}
                      disabled={requestLoading[req.id]}
                      style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer' }}
                    >Rədd</button>
                    <button
                      onClick={() => handleRespondParent(req.id, true)}
                      disabled={requestLoading[req.id]}
                      style={{ padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, border: 'none', background: '#00C9A7', color: '#fff', cursor: 'pointer' }}
                    >{requestLoading[req.id] ? '...' : 'Qəbul et'}</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ── Parent section ──────────────────────────────────────────────────── */}
      {isParent && (
        <>
          {/* Editable info */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Məlumatlar</div>
              {!parentEdit ? (
                <button
                  onClick={() => { setParentEditName((userProfile as any)?.fullName || ''); setParentEditPhone((userProfile as any)?.phone || ''); setParentEditCity((userProfile as any)?.city || ''); setParentEdit(true) }}
                  style={{ fontSize: 11, fontWeight: 700, color: '#F4A261', background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.25)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
                >✏️ Düzəliş et</button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setParentEdit(false)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>Ləğv et</button>
                  <button onClick={handleSaveParent} disabled={parentSaving} style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: parentSaving ? 'rgba(244,162,97,0.4)' : '#F4A261', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: parentSaving ? 'not-allowed' : 'pointer' }}>{parentSaving ? '...' : '✓ Saxla'}</button>
                </div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {parentEdit ? (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <EditField label="Ad Soyad">
                    <input className="input" value={parentEditName} onChange={e => setParentEditName(e.target.value)} placeholder="Ad Soyad" />
                  </EditField>
                  <EditField label="Telefon">
                    <input className="input" value={parentEditPhone} onChange={e => setParentEditPhone(e.target.value)} placeholder="+994 50 000 00 00" />
                  </EditField>
                  <EditField label="Şəhər">
                    <input className="input" value={parentEditCity} onChange={e => setParentEditCity(e.target.value)} placeholder="Bakı" />
                  </EditField>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(userProfile as any)?.phone && <InfoRow label="Telefon" value={(userProfile as any).phone} />}
                  {(userProfile as any)?.city  && <InfoRow label="Şəhər"   value={(userProfile as any).city}  />}
                  {!(userProfile as any)?.phone && !(userProfile as any)?.city && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '6px 0' }}>Məlumat əlavə edilməyib</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connected children */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: parentChildren.length > 0 ? 14 : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                Bağlı uşaqlar
                {parentChildren.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#00C9A7', background: 'rgba(0,201,167,0.12)', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                    {parentChildren.length}/5
                  </span>
                )}
              </div>
              {parentChildren.length < 5 && (
                <button
                  onClick={() => navigate('/onboarding/parent')}
                  style={{ fontSize: 11, fontWeight: 700, color: '#F4A261', background: 'rgba(244,162,97,0.1)', border: '0.5px solid rgba(244,162,97,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}
                >+ Əlavə et</button>
              )}
            </div>
            {parentChildren.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-3)', paddingTop: 10 }}>Hələ övlad əlavə edilməyib</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {parentChildren.map((c: any) => {
                  const cName = c.fullName || c.name || 'Şagird'
                  const ini   = cName.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #00C9A7, #00a88c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>{ini}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cName}</div>
                        <div style={{ fontSize: 10, color: '#00C9A7', fontFamily: "'JetBrains Mono', monospace" }}>{c.uniqueId || '—'}</div>
                      </div>
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 5, fontWeight: 700, background: 'rgba(0,201,167,0.1)', color: '#00C9A7', flexShrink: 0 }}>Aktiv</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notification settings */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Bildiriş tənzimləmələri</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {([
                { key: 'taskDeadline', label: 'Tapşırıq son tarixi yaxınlaşanda' },
                { key: 'noActivity',   label: 'Uşaq gün ərzində aktiv olmayanda'  },
                { key: 'teacherMsg',   label: 'Müəllimdən yeni mesaj gəldikdə'    },
                { key: 'sysMessages',  label: 'Sistem bildirişləri'                },
              ] as const).map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-1)', flex: 1, paddingRight: 12 }}>{label}</span>
                  <button
                    onClick={() => setParentNotif(p => ({ ...p, [key]: !p[key] }))}
                    style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: parentNotif[key] ? '#F4A261' : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: parentNotif[key] ? 23 : 3 }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Shared ──────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <InfoRow label="Platforma" value="NIDA — Gələcəyə Səsləniş" />
      </div>

      {/* Password change */}
      <button
        onClick={() => setPwModal(true)}
        className="btn btn-ghost btn-full"
        style={{ color: 'var(--text-2)' }}
      >🔑 Şifrəni dəyiş</button>

      <button
        className="btn btn-ghost btn-full"
        style={{ color: 'var(--danger)', borderColor: 'rgba(255,77,109,0.25)' }}
        onClick={logout}
      >⏻ Çıxış</button>

      <AnimatePresence>
        {pwModal && <PasswordModal onClose={() => setPwModal(false)} email={email} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function EditField({ label, children }: any) {
  return (
    <div>
      <label style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

function StatMini({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="stat-mini">
      <div className="stat-val" style={color ? { color } : undefined}>{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

function PasswordModal({ onClose, email }: { onClose: () => void; email: string }) {
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')
  const [ok,      setOk]      = useState(false)

  const handleSave = async () => {
    if (!current || !next) { setErr('Bütün sahələri doldurun'); return }
    if (next.length < 6)   { setErr('Şifrə minimum 6 simvol olmalıdır'); return }
    if (next !== confirm)  { setErr('Yeni şifrələr uyğun gəlmir'); return }
    setSaving(true); setErr('')
    try {
      await apiChangePassword(current, next)
      setOk(true)
      setTimeout(onClose, 1500)
    } catch (e: any) {
      const status = e?.response?.status
      const msg = status === 401 ? 'Cari şifrə yanlışdır'
                : status === 429 ? 'Çox cəhd. Bir az gözləyin'
                : 'Xəta baş verdi. Yenidən cəhd edin'
      setErr(msg)
    } finally { setSaving(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }} transition={SPRING}
        style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '20px 20px 16px 16px', padding: 24 }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text-1)' }}>🔑 Şifrəni dəyiş</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 30, height: 30, fontSize: 14, color: 'var(--text-3)', cursor: 'pointer' }}>✕</button>
        </div>

        {ok ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#00C9A7', fontSize: 15, fontWeight: 700 }}>
            ✓ Şifrə uğurla dəyişdirildi
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <EditField label="Cari şifrə">
              <input className="input" type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
            </EditField>
            <EditField label="Yeni şifrə">
              <input className="input" type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Minimum 6 simvol" />
            </EditField>
            <EditField label="Yeni şifrəni təsdiqlə">
              <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
            </EditField>

            {err && <div style={{ fontSize: 12, color: '#ff4d6d', padding: '8px 12px', background: 'rgba(255,77,109,0.1)', borderRadius: 8 }}>{err}</div>}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none', color: '#fff',
                background: saving ? 'rgba(79,135,255,0.4)' : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Lexend Deca', sans-serif",
              }}
            >{saving ? 'Yenilənir...' : '✓ Şifrəni yenilə'}</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
