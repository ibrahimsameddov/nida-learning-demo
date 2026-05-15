import { useState, useRef, useEffect } from 'react'
import { useForm }                     from 'react-hook-form'
import { zodResolver }                 from '@hookform/resolvers/zod'
import { Link, useNavigate }           from 'react-router-dom'
import { registerSchema, type RegisterInput } from '../../../lib/validations'
import { Role, Grade, Subject }        from '../../../types/models'
import { useAuthStore }                from '../../../stores/authStore'
import { api }                         from '../../../lib/api'
import { sendParentalConsentEmail } from '../../../lib/email'

// ── Azərbaycan şəhərləri ──────────────────────────────────────────────────────
const AZ_CITIES = [
  'Bakı', 'Gəncə', 'Sumqayıt', 'Mingəçevir', 'Şirvan', 'Naftalan', 'Şəki',
  'Lənkəran', 'Şuşa', 'Quba', 'Qusar', 'Xaçmaz', 'Xankəndi', 'Yevlax',
  'Ağcabədi', 'Ağdam', 'Bərdə', 'Beyləqan', 'Biləsuvar', 'Cəlilabad',
  'Füzuli', 'Göyçay', 'Göygöl', 'Hacıqabul', 'İmişli', 'İsmayıllı',
  'Kəlbəcər', 'Kürdəmir', 'Laçın', 'Lerik', 'Masallı', 'Neftçala', 'Oğuz',
  'Qəbələ', 'Qax', 'Qazax', 'Qobustan', 'Saatlı', 'Sabirabad', 'Salyan',
  'Samux', 'Siyəzən', 'Şabran', 'Şamaxı', 'Şəmkir', 'Tərtər', 'Tovuz',
  'Ucar', 'Yardımlı', 'Zaqatala', 'Zərdab', 'Zəngilan', 'Qubadlı', 'Xocalı',
  'Xocavənd', 'Naxçıvan', 'Şərur', 'Ordubad', 'Culfa',
]

const TEACHER_SUBJECTS = [
  { id: Subject.Math,        label: 'Riyaziyyat',      icon: '📐', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)'  },
  { id: Subject.Azerbaijani, label: 'Azərbaycan dili', icon: '📖', color: '#EC4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)' },
  { id: Subject.English,     label: 'Xarici dil',      icon: '🇬🇧', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)'  },
  { id: Subject.Physics,     label: 'Fizika',          icon: '⚡', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)' },
  { id: Subject.Chemistry,   label: 'Kimya',           icon: '🧪', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)' },
  { id: Subject.Biology,     label: 'Biologiya',       icon: '🧬', color: '#00C9A7', bg: 'rgba(0,201,167,0.12)',  border: 'rgba(0,201,167,0.35)'  },
  { id: Subject.History,     label: 'Tarix',           icon: '🏛️', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  { id: Subject.Geography,   label: 'Coğrafiya',       icon: '🌍', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  { id: Subject.Literature,  label: 'Ədəbiyyat',       icon: '📚', color: '#A855F7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)' },
  { id: Subject.Russian,     label: 'Rus dili',        icon: '🇷🇺', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)'  },
]

// ── CityInput ─────────────────────────────────────────────────────────────────
function CityInput({ value, onChange, error }: {
  value: string
  onChange: (city: string) => void
  error?: string
}) {
  const [query,   setQuery]   = useState(value ?? '')
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(-1)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const listRef  = useRef<HTMLUListElement>(null)

  const filtered = query.trim().length === 0
    ? []
    : AZ_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (city: string) => {
    setQuery(city); onChange(city); setOpen(false); setFocused(-1)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)) }
    else if (e.key === 'Enter' && focused >= 0) { e.preventDefault(); select(filtered[focused]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  useEffect(() => {
    if (focused >= 0 && listRef.current) {
      const item = listRef.current.children[focused] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [focused])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="input"
        placeholder="Bakı"
        autoComplete="off"
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true); setFocused(-1) }}
        onFocus={() => { if (filtered.length > 0) setOpen(true) }}
        onBlur={() => {
          setTimeout(() => {
            const match = AZ_CITIES.find(c => c.toLowerCase() === query.toLowerCase())
            if (match) { setQuery(match); onChange(match) }
            else { setQuery(''); onChange('') }
            setOpen(false)
          }, 150)
        }}
        onKeyDown={handleKey}
        style={error ? { borderColor: 'var(--danger)' } : undefined}
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef} style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--bg-card-solid)', border: '1px solid var(--border-hover)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
          zIndex: 999, maxHeight: 220, overflowY: 'auto', padding: '6px',
          listStyle: 'none', margin: 0,
        }}>
          {filtered.map((city, i) => (
            <li key={city} onMouseDown={() => select(city)} onMouseEnter={() => setFocused(i)}
              style={{
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                color: i === focused ? 'var(--primary)' : 'var(--text-1)',
                background: i === focused ? 'var(--bg-active)' : 'transparent',
                transition: 'background 0.12s',
              }}>
              {highlight(city, query)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function highlight(city: string, query: string) {
  const idx = city.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1 || !query) return <>{city}</>
  return (
    <>
      {city.slice(0, idx)}
      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{city.slice(idx, idx + query.length)}</span>
      {city.slice(idx + query.length)}
    </>
  )
}

// ── Role card configs ─────────────────────────────────────────────────────────
const ROLES = [
  {
    value: Role.Student,
    label: 'Şagird',
    icon: '🎓',
    desc: 'Test çöz, statistikanı izlə',
    color: '#00C9A7',
    bg: 'rgba(0,201,167,0.07)',
  },
  {
    value: Role.Teacher,
    label: 'Müəllim',
    icon: '📋',
    desc: 'Şagirdlərini idarə et, imtahan yarat',
    color: '#4F87FF',
    bg: 'rgba(79,135,255,0.08)',
  },
  {
    value: Role.Parent,
    label: 'Valideyn',
    icon: '👨‍👩‍👧',
    desc: 'Övladının inkişafını izlə',
    color: '#F4A261',
    bg: 'rgba(244,162,97,0.07)',
  },
]

const GRADES = [
  { value: Grade.Nine,   label: '9-cu sinif'  },
  { value: Grade.Ten,    label: '10-cu sinif' },
  { value: Grade.Eleven, label: '11-ci sinif' },
]

// ── SubjectChips ──────────────────────────────────────────────────────────────
function SubjectChips({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id))
    else if (selected.length < 2) onChange([...selected, id])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {TEACHER_SUBJECTS.map(s => {
        const active   = selected.includes(s.id)
        const disabled = !active && selected.length >= 2
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            disabled={disabled}
            style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              display: 'flex', alignItems: 'center', gap: 6,
              background: active ? s.bg : 'var(--bg-input)',
              border: `1.5px solid ${active ? s.border : 'var(--border)'}`,
              color: active ? s.color : 'var(--text-3)',
              opacity: disabled ? 0.35 : 1,
              transform: active ? 'scale(1.04)' : 'scale(1)',
              boxShadow: active ? `0 0 14px ${s.bg}` : 'none',
            }}
          >
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span>{s.label}</span>
            {active && <span style={{ fontSize: 10, fontWeight: 800, color: s.color }}>✓</span>}
          </button>
        )
      })}
    </div>
  )
}

// ── Register ──────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate    = useNavigate()
  const [step,      setStep]    = useState<1 | 2>(1)
  const [isLoading, setLoading] = useState(false)
  const [regError,  setRegError] = useState('')

  // Teacher-specific local state
  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([])

  // Parental consent state (students only)
  const [dob,          setDob]          = useState('')        // YYYY-MM-DD
  const [parentEmail,  setParentEmail]  = useState('')
  const [parentEmailErr, setParentEmailErr] = useState('')

  const calcAge = (dobStr: string): number => {
    if (!dobStr) return 0
    const today = new Date()
    const birth = new Date(dobStr)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }
  const age     = calcAge(dob)
  const isAdult = dob ? age >= 18 : null   // null = not yet entered

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: Role.Student },
  })

  const selectedRole = watch('role')
  const cityValue    = watch('city') ?? ''
  const isTeacher    = selectedRole === Role.Teacher

  // Keep fullName synced for teacher
  useEffect(() => {
    if (isTeacher) {
      const combined = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      setValue('fullName', combined, { shouldValidate: false })
    }
  }, [firstName, lastName, isTeacher, setValue])

  const gradeToBackend = (grade: Grade | undefined): string | undefined => {
    if (grade == null) return undefined
    return `GRADE_${grade}`
  }

  const onSubmit = async (data: RegisterInput) => {
    if (isTeacher && !firstName.trim()) { setRegError('Ad daxil edin'); return }
    if (isTeacher && !lastName.trim())  { setRegError('Soyad daxil edin'); return }
    // Students must enter DOB
    if (data.role === Role.Student && !dob) {
      setParentEmailErr('Doğum tarixini daxil edin')
      return
    }
    // If minor, parent email required
    if (data.role === Role.Student && isAdult === false) {
      if (!parentEmail.trim() || !/\S+@\S+\.\S+/.test(parentEmail)) {
        setParentEmailErr('Düzgün valideyn emaili daxil edin')
        return
      }
    }
    setParentEmailErr('')
    setLoading(true)
    setRegError('')
    try {
      const res = await api.post<{ data: any }>('/api/auth/register', {
        fullName:        data.fullName,
        email:           data.email,
        password:        data.password,
        role:            data.role,
        city:            data.city   || undefined,
        school:          data.school || undefined,
        grade:           gradeToBackend(data.grade as Grade | undefined),
        foreignLanguage: data.foreignLang ? (data.foreignLang as string).toUpperCase() : undefined,
        subjects:        teacherSubjects.length > 0
          ? teacherSubjects.map(s => s.toUpperCase())
          : undefined,
      })

      const b = res.data.data
      const { setToken, setUser, setBackendId } = useAuthStore.getState()
      setToken(b.token, b.refreshToken)
      if (b.id) setBackendId(b.id)
      setUser({
        id:             String(b.id ?? ''),
        fullName:       b.fullName,
        email:          b.email,
        role:           b.role as Role,
        uniqueId:       b.uniqueId,
        emailVerified:  b.emailVerified,
        createdAt:      new Date().toISOString(),
        specialtyGroup: b.specialtyGroup ?? '',
        plan:           'free',
        streakDays:     0,
        totalQuestions: 0,
        successRate:    0,
      } as any)

      if (data.role === Role.Student && isAdult === false) {
        await sendParentalConsentEmail({ parentEmail, studentName: data.fullName, studentAge: age }).catch(() => {})
      }

      if (isTeacher) navigate('/teacher/pending')
      else if (data.role === Role.Parent) navigate('/onboarding/parent')
      else navigate('/onboarding/group')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? ''
      if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('already'))
        setRegError('Bu e-poçt artıq qeydiyyatdadır.')
      else
        setRegError('Qeydiyyat zamanı xəta baş verdi.')
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = ROLES.find(r => r.value === selectedRole) ?? ROLES[0]
  const accentColor = isTeacher ? '#4F87FF' : selectedRole === Role.Parent ? '#F4A261' : '#00C9A7'

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px 16px 40px',
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        filter: 'blur(120px)', pointerEvents: 'none', opacity: 0.25,
        background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        transition: 'background 0.5s',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '35vw', height: '35vw', borderRadius: '50%',
        filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.12,
        background: accentColor,
        transition: 'background 0.5s',
      }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 16, marginBottom: 12,
            background: `${accentColor}18`,
            border: `0.5px solid ${accentColor}35`,
            transition: 'all 0.4s',
          }}>
            <span style={{ fontSize: 26 }}>{step === 1 ? 'N' : roleConfig.icon}</span>
          </div>
          <h1 style={{
            fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22,
            color: 'var(--text-1)', marginBottom: 5,
          }}>
            {step === 1 ? 'Qeydiyyat' : isTeacher ? 'Müəllim Məlumatları' : 'Şəxsi Məlumatlar'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            {step === 1 ? 'Rolunuzu seçin' : isTeacher ? 'Peşəkar profil yaradın' : 'Məlumatlarınızı daxil edin'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              height: 4, borderRadius: 4,
              width: s === step ? 28 : 8,
              background: s <= step ? accentColor : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{
            background: 'var(--bg-card)',
            border: `0.5px solid ${step === 2 ? `${accentColor}30` : 'var(--border)'}`,
            borderRadius: 20, padding: '24px 20px',
            backdropFilter: 'blur(20px)',
            marginBottom: 14,
          }}>

            {step === 1 ? (
              /* ── STEP 1: Role selection ─────────────────────────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 4 }}>
                  Kim olaraq qeydiyyatdan keçirsiniz?
                </p>
                {ROLES.map(r => {
                  const active = selectedRole === r.value
                  return (
                    <label key={r.value} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                      border: `1.5px solid ${active ? r.color : 'var(--border)'}`,
                      background: active ? r.bg : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s ease',
                      boxShadow: active ? `0 0 20px ${r.color}20` : 'none',
                    }}>
                      <input type="radio" value={r.value} {...register('role')} style={{ display: 'none' }} />
                      <div style={{
                        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                        background: active ? `${r.color}20` : 'rgba(255,255,255,0.06)',
                        border: active ? `1px solid ${r.color}50` : '1px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        transition: 'all 0.2s',
                      }}>{r.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: active ? r.color : 'var(--text-1)' }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{r.desc}</div>
                      </div>
                      {active && (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: '#fff', fontWeight: 700,
                        }}>✓</div>
                      )}
                    </label>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    marginTop: 8, padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
                    background: `linear-gradient(135deg, ${accentColor}, ${isTeacher ? '#6C63FF' : accentColor})`,
                    border: 'none', color: '#fff', cursor: 'pointer',
                    fontFamily: "'Lexend Deca', sans-serif",
                    boxShadow: `0 4px 20px ${accentColor}35`,
                    transition: 'all 0.3s',
                  }}
                >
                  Növbəti →
                </button>
              </div>
            ) : isTeacher ? (
              /* ── STEP 2: TEACHER form ───────────────────────────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Teacher badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 12, background: 'rgba(79,135,255,0.08)',
                  border: '0.5px solid rgba(79,135,255,0.2)', marginBottom: 4,
                }}>
                  <span style={{ fontSize: 18 }}>📋</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4F87FF' }}>Müəllim qeydiyyatı</span>
                </div>

                {/* Ad + Soyad row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <FormField label="Ad" error={!firstName.trim() && regError ? ' ' : undefined}>
                    <input
                      className="input"
                      placeholder="Əli"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Soyad">
                    <input
                      className="input"
                      placeholder="Həsənov"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="E-poçt" error={errors.email?.message}>
                  <input className="input" type="email" placeholder="ali@example.com" {...register('email')} />
                </FormField>

                <FormField label="Şifrə" error={errors.password?.message} hint="Böyük/kiçik hərf, rəqəm, xüsusi simvol">
                  <input className="input" type="password" placeholder="Min. 8 simvol" {...register('password')} />
                </FormField>

                <FormField label="İş yeri (məktəb)" error={errors.school?.message}>
                  <input className="input" placeholder="Bakı şəhəri №132 tam orta məktəb" {...register('school')} />
                </FormField>

                <FormField label="Şəhər / Rayon" error={errors.city?.message}>
                  <CityInput
                    value={cityValue}
                    onChange={v => setValue('city', v, { shouldValidate: true })}
                    error={errors.city?.message}
                  />
                </FormField>

                <FormField
                  label={`Tədris etdiyiniz fənlər — maks. 2${teacherSubjects.length > 0 ? ` (${teacherSubjects.length}/2 seçilib)` : ''}`}
                >
                  <SubjectChips selected={teacherSubjects} onChange={setTeacherSubjects} />
                  {teacherSubjects.length === 0 && (
                    <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
                      Ən azı bir fənn seçin
                    </p>
                  )}
                </FormField>

                {regError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
                    color: 'var(--danger)',
                  }}>{regError}</div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" style={{ flexShrink: 0 }} onClick={() => setStep(1)}>
                    ← Geri
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !firstName.trim() || !lastName.trim() || teacherSubjects.length === 0}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12, fontWeight: 800, fontSize: 14,
                      background: isLoading || !firstName.trim() || !lastName.trim() || teacherSubjects.length === 0
                        ? 'rgba(79,135,255,0.3)'
                        : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                      border: 'none', color: '#fff', cursor: 'pointer',
                      fontFamily: "'Lexend Deca', sans-serif",
                      opacity: isLoading ? 0.7 : 1,
                      boxShadow: '0 4px 20px rgba(79,135,255,0.3)',
                    }}
                  >
                    {isLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Qeydiyyat →'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── STEP 2: STUDENT / PARENT form ─────────────────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormField label="Ad Soyad" error={errors.fullName?.message}>
                  <input className="input" placeholder="Əli Həsənov" {...register('fullName')} />
                </FormField>

                <FormField label="E-poçt" error={errors.email?.message}>
                  <input className="input" type="email" placeholder="ali@example.com" {...register('email')} />
                </FormField>

                <FormField label="Şifrə" error={errors.password?.message} hint="Böyük/kiçik hərf, rəqəm və xüsusi simvol">
                  <input className="input" type="password" placeholder="Min. 8 simvol" {...register('password')} />
                </FormField>

                <FormField label="Şəhər" error={errors.city?.message}>
                  <CityInput
                    value={cityValue}
                    onChange={v => setValue('city', v, { shouldValidate: true })}
                    error={errors.city?.message}
                  />
                </FormField>

                {selectedRole === Role.Student && (
                  <>
                    <FormField label="Məktəb" error={errors.school?.message}>
                      <input className="input" placeholder="Məktəb №132" {...register('school')} />
                    </FormField>
                    <FormField label="Sinif">
                      <select className="input" {...register('grade', { valueAsNumber: true })}>
                        <option value="">Sinif seçin</option>
                        {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Xarici dil">
                      <select className="input" {...register('foreignLang')}>
                        <option value="english">İngilis dili</option>
                        <option value="russian">Rus dili</option>
                      </select>
                    </FormField>

                  </>
                )}

                {selectedRole === Role.Parent && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, background: 'rgba(244,162,97,0.08)', border: '0.5px solid rgba(244,162,97,0.25)', color: '#F4A261', lineHeight: 1.55 }}>
                    👨‍👩‍👧 Qeydiyyatdan sonra övladınızın ID-si ilə bağlantı sorğusu göndərəcəksiniz
                  </div>
                )}

                {/* ── DOB + parental consent (students only) ── */}
                {selectedRole === Role.Student && (
                  <div style={{
                    padding: '14px', borderRadius: 12,
                    background: isAdult === true
                      ? 'rgba(0,201,167,0.06)'
                      : isAdult === false
                        ? 'rgba(255,180,0,0.06)'
                        : 'rgba(128,128,128,0.04)',
                    border: `1px solid ${
                      isAdult === true  ? 'rgba(0,201,167,0.35)' :
                      isAdult === false ? 'rgba(255,180,0,0.35)' :
                      'var(--border)'
                    }`,
                    transition: 'all 0.2s',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 10 }}>
                      Doğum tarixi <span style={{ color: 'var(--danger)' }}>*</span>
                    </p>

                    {/* Date of birth picker */}
                    <input
                      className="input"
                      type="date"
                      value={dob}
                      max={new Date().toISOString().split('T')[0]}
                      min="1990-01-01"
                      onChange={e => { setDob(e.target.value); setParentEmailErr('') }}
                      style={{ marginBottom: dob ? 10 : 0 }}
                    />

                    {/* Age badge — only shown for minors */}
                    {dob && isAdult === false && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 8, marginBottom: 10,
                        background: 'rgba(255,180,0,0.12)',
                        border: '1px solid rgba(255,180,0,0.3)',
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>
                          {age} yaş
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          — valideyn razılığı lazımdır
                        </span>
                      </div>
                    )}

                    {/* Parent email — shown only when DOB entered and minor */}
                    {dob && isAdult === false && (
                      <div>
                        <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                          Valideyn e-poçtu <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                          className="input"
                          type="email"
                          placeholder="valideyn@gmail.com"
                          value={parentEmail}
                          onChange={e => { setParentEmail(e.target.value); setParentEmailErr('') }}
                          style={parentEmailErr ? { borderColor: 'var(--danger)' } : undefined}
                        />
                        {parentEmailErr && (
                          <p style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>{parentEmailErr}</p>
                        )}
                        <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                          Valideynin həm NIDA hesabına həm də e-poçtuna təsdiq mesajı göndəriləcək.
                          Azərbaycan Respublikasının qanunvericiliyinə əsasən 18 yaşdan aşağı şəxslərin
                          məlumatlarının toplanması üçün valideyn razılığı tələb olunur.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {regError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
                    color: 'var(--danger)',
                  }}>{regError}</div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)}>
                    ← Geri
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Qeydiyyat'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
          Hesabınız var?{' '}
          <Link to="/login" style={{ color: accentColor, fontWeight: 700, textDecoration: 'none' }}>
            Daxil olun
          </Link>
        </p>
      </div>
    </div>
  )
}

// ── Köməkçi komponent ─────────────────────────────────────────────────────────
function FormField({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="label-sm">{label}</label>
      {children}
      {error && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>{error}</p>}
      {hint && !error && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-3)' }}>{hint}</p>}
    </div>
  )
}
