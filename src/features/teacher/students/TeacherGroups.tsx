// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  apiGetMyGroups, apiCreateGroup, apiGetStudentProfiles,
  apiGetStudentStatsByUid, apiGetStudentResultsByUid,
  apiGetSentPermissions, apiSearchUser,
  apiInviteToGroup, apiSendTeacherPermission,
} from '@/lib/api'
import { Sidebar }  from '@/components/layout/Sidebar'
import { Topbar }   from '@/components/layout/GlassTopbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Avatar }   from '@/components/ui/Avatar'
import toast, { Toaster } from 'react-hot-toast'
import { SPRING } from '@/lib/motion'

// ── constants ─────────────────────────────────────────────────────────────────
const GRADES    = [9, 10, 11]
const SUBJECTS  = [
  { id: 'Riyaziyyat',     icon: '📐' },
  { id: 'Azərbaycan dili',icon: '📖' },
  { id: 'Xarici dil',     icon: '🇬🇧' },
  { id: 'Fizika',         icon: '⚡' },
  { id: 'Kimya',          icon: '🧪' },
  { id: 'Biologiya',      icon: '🧬' },
  { id: 'Tarix',          icon: '🏛️' },
  { id: 'Coğrafiya',      icon: '🌍' },
  { id: 'İnformatika',    icon: '💻' },
  { id: 'Ədəbiyyat',      icon: '📚' },
]
const PALETTE   = ['#4F87FF', '#6C63FF', '#F4A261', '#00C9A7', '#A78BFA', '#38BDF8']
const groupColor = (name: string) => PALETTE[(name?.charCodeAt(0) ?? 0) % PALETTE.length]

// ── small helpers ─────────────────────────────────────────────────────────────
function Chip({ active, color = '#4F87FF', children, onClick }: any) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s', border: 'none',
      background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
      color:      active ? color        : 'var(--text-3)',
      outline:    active ? `1.5px solid ${color}55` : '1px solid rgba(255,255,255,0.08)',
    }}>{children}</button>
  )
}

function CloseBtn({ onClick }: any) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
      background: 'var(--bg-card)', border: '0.5px solid var(--border)',
      color: 'var(--text-3)', fontSize: 16, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>✕</button>
  )
}

function Overlay({ children, onClose }: any) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >{children}</div>
  )
}

function Spinner() {
  return <span className="spinner" style={{ width: 20, height: 20, display: 'inline-block' }} />
}

// ── CreateGroupModal ──────────────────────────────────────────────────────────
function CreateGroupModal({ onClose, onCreated }: any) {
  const [name,    setName]    = useState('')
  const [grade,   setGrade]   = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = name.trim() && grade && subject

  const handleCreate = async (e: any) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const grp = await apiCreateGroup(name.trim(), subject, 30, grade)
      toast.success(`"${grp.name}" qrupu yaradıldı!`)
      onCreated(grp)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Qrup yaradıla bilmədi.')
    } finally { setLoading(false) }
  }

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={SPRING}
        style={{
          width: '100%', maxWidth: 440, borderRadius: 22, padding: '24px 22px',
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text-1)' }}>
              Yeni Qrup
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Ad, sinif və fənn seçin</div>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Qrup adı
            </label>
            <input
              autoFocus className="input" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="məs: 10-A Riyaziyyat"
            />
          </div>

          {/* Grade */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Sinif
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {GRADES.map(g => (
                <Chip key={g} active={grade === g} color="#4F87FF" onClick={() => setGrade(g)}>
                  {g}-ci sinif
                </Chip>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Fənn
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUBJECTS.map(s => (
                <Chip key={s.id} active={subject === s.id} color="#6C63FF" onClick={() => setSubject(s.id)}>
                  {s.icon} {s.id}
                </Chip>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)',
                color: 'var(--text-3)', cursor: 'pointer',
              }}>Ləğv et</button>
            <button type="submit" disabled={!canSubmit || loading}
              style={{
                flex: 2, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                background: canSubmit && !loading ? 'linear-gradient(135deg, #4F87FF, #6C63FF)' : 'rgba(79,135,255,0.25)',
                border: 'none', color: '#fff', cursor: canSubmit ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Lexend Deca', sans-serif",
              }}>
              {loading ? <Spinner /> : '+ Qrup Yarat'}
            </button>
          </div>
        </form>
      </motion.div>
    </Overlay>
  )
}

// ── AddStudentModal ───────────────────────────────────────────────────────────
function AddStudentModal({ group, approvedPerms, onClose, onAdded }: any) {
  const [tab,     setTab]     = useState<'id' | 'requests'>('id')
  const [idInput, setIdInput] = useState('')
  const [found,   setFound]   = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const [adding,    setAdding]    = useState<string | null>(null)

  const memberUids = new Set(group.studentUids ?? [])

  const canAdd = approvedPerms.filter((p: any) => {
    const sid = p.studentUid ?? p.receiverUid ?? p.id
    return !memberUids.has(sid)
  })

  const handleSearch = async (e: any) => {
    e.preventDefault()
    if (!idInput.trim()) return
    setSearching(true); setFound(null)
    try {
      const data = await apiSearchUser(idInput.trim())
      if (!data) {
        toast.error('Şagird tapılmadı. ID və ya e-poçtu yoxlayın.')
        return
      }
      setFound(data)
    } catch { toast.error('Axtarış zamanı xəta baş verdi.') }
    finally { setSearching(false) }
  }

  const addByUid = async (studentUid: string, name: string) => {
    if (memberUids.has(studentUid)) { toast.error('Bu şagird artıq qrupdadır.'); return }
    setAdding(studentUid)
    try {
      await apiInviteToGroup(group.id, studentUid)
      toast.success(`${name} qrupa əlavə edildi!`)
      onAdded()
      onClose()
    } catch (err: any) { toast.error(err.message || 'Əlavə edilə bilmədi.') }
    finally { setAdding(null) }
  }

  const sendRequest = async (studentUniqueId: string, studentUid?: string) => {
    if (!studentUniqueId) return
    setAdding(studentUniqueId)
    try {
      await apiSendTeacherPermission(studentUniqueId, group.subject, studentUid)
      toast.success('İcazə sorğusu göndərildi!')
    } catch (err: any) { toast.error(err.message || 'Sorğu göndərilə bilmədi.') }
    finally { setAdding(null) }
  }

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={SPRING}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 22, padding: '24px 22px',
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          maxHeight: '80dvh', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-1)' }}>
              Şagird Əlavə Et
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{group.name}</div>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Tab */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, marginBottom: 18,
        }}>
          {[
            { key: 'id',       label: '🔍 ID ilə axtar' },
            { key: 'requests', label: `✅ Gözləyənlər ${canAdd.length > 0 ? `(${canAdd.length})` : ''}` },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key as any)}
              style={{
                padding: '9px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.key ? '#4F87FF' : 'transparent',
                color:      tab === t.key ? '#fff'    : 'var(--text-3)',
                fontFamily: "'Lexend Deca', sans-serif",
              }}>{t.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'id' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={idInput} onChange={e => setIdInput(e.target.value)}
                  placeholder="ŞAG-XXXXXX və ya email@..." style={{ flex: 1 }} autoFocus />
                <button type="submit" disabled={!idInput.trim() || searching}
                  style={{
                    padding: '0 18px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                    background: '#4F87FF', border: 'none', color: '#fff',
                    cursor: 'pointer', flexShrink: 0,
                  }}>
                  {searching ? '...' : '🔍'}
                </button>
              </form>

              <AnimatePresence>
                {found && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(0,201,167,0.06)', border: '0.5px solid rgba(0,201,167,0.25)',
                      borderRadius: 14, padding: '14px 16px', marginBottom: 10,
                    }}>
                      <Avatar name={found.fullName || '?'} size="md" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{found.fullName || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                          {found.email} · {found.uniqueId}
                        </div>
                      </div>
                    </div>
                    {memberUids.has(found.id) ? (
                      <div style={{
                        padding: '10px 14px', borderRadius: 10, fontSize: 12,
                        background: 'rgba(244,162,97,0.08)', color: '#F4A261',
                        border: '0.5px solid rgba(244,162,97,0.2)',
                      }}>Bu şagird artıq qrupdadır.</div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => sendRequest(found.uniqueId, found.id)} disabled={!!adding}
                          style={{
                            flex: 1, padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                            background: 'rgba(79,135,255,0.1)', border: '0.5px solid rgba(79,135,255,0.3)',
                            color: '#4F87FF', cursor: 'pointer',
                          }}>
                          {adding === found.uniqueId ? '...' : '📨 Sorğu göndər'}
                        </button>
                        <button onClick={() => addByUid(found.id, found.fullName)} disabled={!!adding}
                          style={{
                            flex: 1, padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                            background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                            border: 'none', color: '#fff', cursor: 'pointer',
                          }}>
                          {adding === found.id ? '...' : '+ Birbaşa Əlavə Et'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div>
              {canAdd.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                    Gözləyən şagird yoxdur.<br />
                    ID ilə axtarıb sorğu göndərin.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {canAdd.map((p: any) => {
                    const sid  = p.studentUid ?? p.receiverUid ?? p.id
                    const name = p.receiverName ?? p.studentName ?? p.senderName ?? 'Şagird'
                    return (
                      <div key={sid} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'rgba(0,201,167,0.05)', border: '0.5px solid rgba(0,201,167,0.2)',
                        borderRadius: 12, padding: '12px 14px',
                      }}>
                        <Avatar name={name} size="sm" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.subject ?? ''}</div>
                        </div>
                        <button onClick={() => addByUid(sid, name)} disabled={adding === sid}
                          style={{
                            padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                            border: 'none', color: '#fff', cursor: 'pointer', flexShrink: 0,
                          }}>
                          {adding === sid ? '...' : '+ Əlavə et'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Overlay>
  )
}

// ── StudentDetailPanel ────────────────────────────────────────────────────────
function StudentDetailPanel({ student }: any) {
  const [stats,   setStats]   = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'stats' | 'results'>('stats')

  useEffect(() => {
    if (!student?.id) return
    setLoading(true)
    Promise.all([
      apiGetStudentStatsByUid(student.id).catch(() => null),
      apiGetStudentResultsByUid(student.id).catch(() => []),
    ]).then(([s, r]) => {
      setStats(s); setResults(Array.isArray(r) ? r : [])
    }).finally(() => setLoading(false))
  }, [student?.id])

  if (loading) return (
    <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  const avg      = Math.round(stats?.averagePercent ?? stats?.averagePercentage ?? 0)
  const total    = stats?.totalTests ?? 0
  const streak   = stats?.currentStreak ?? stats?.streak ?? 0
  const subjects: any[] = Array.isArray(stats?.subjectStats) ? stats.subjectStats : []
  const weakest  = [...subjects].sort((a, b) => (a.averagePercent ?? 0) - (b.averagePercent ?? 0))

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{ paddingTop: 16, marginTop: 16, borderTop: '0.5px solid var(--border-card)' }}>
        {/* Mini tab */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 14,
          background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3,
        }}>
          {[
            { key: 'stats',   label: '📊 Statistika' },
            { key: 'results', label: `📋 Nəticələr ${results.length > 0 ? `(${results.length})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{
                flex: 1, padding: '6px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                background: tab === t.key ? '#4F87FF' : 'transparent',
                color:      tab === t.key ? '#fff'    : 'var(--text-3)',
                fontFamily: "'Lexend Deca', sans-serif",
              }}>{t.label}</button>
          ))}
        </div>

        {tab === 'stats' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[
                { icon: '📝', label: 'Test',    value: total > 0 ? total : '—',       color: '#4F87FF' },
                { icon: '🎯', label: 'Ortalama', value: total > 0 ? `${avg}%` : '—', color: '#6C63FF' },
                { icon: '🔥', label: 'Streak',  value: streak > 0 ? streak : '—',     color: '#F4A261' },
              ].map(c => (
                <div key={c.label} style={{
                  background: `${c.color}0f`, border: `0.5px solid ${c.color}30`,
                  borderRadius: 10, padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Subject breakdown */}
            {subjects.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Fənn üzrə nəticələr
                </div>
                {weakest.map((s, i) => {
                  const pct = Math.round(s.averagePercent ?? 0)
                  const col = pct >= 70 ? '#00C9A7' : pct >= 50 ? '#F4A261' : '#FF4D6D'
                  return (
                    <div key={s.subject ?? i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 90, fontSize: 11, color: 'var(--text-2)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.subject}
                      </div>
                      <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: 4, background: col }}
                        />
                      </div>
                      <div style={{ width: 34, fontSize: 11, fontWeight: 700, color: col, textAlign: 'right', flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                        {pct}%
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {subjects.length === 0 && total === 0 && (
              <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 11, color: 'var(--text-3)' }}>
                Hələ test həll edilməyib
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 11, color: 'var(--text-3)' }}>
                Nəticə yoxdur
              </div>
            ) : results.map((r, i) => {
              const pct = Math.round(r.percent ?? 0)
              const col = pct >= 70 ? '#00C9A7' : pct >= 50 ? '#F4A261' : '#FF4D6D'
              const date = r.completedAt ? new Date(r.completedAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }) : '—'
              return (
                <div key={r.id ?? i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border-card)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.subject ?? r.topicName ?? 'Test'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                      {r.correct ?? '?'}/{r.total ?? '?'} düzgün · {date}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800,
                    color: col, flexShrink: 0,
                  }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── GroupStatsBar ─────────────────────────────────────────────────────────────
function GroupStatsBar({ studentProfiles }: any) {
  const [statsMap, setStatsMap] = useState<Record<string, any>>({})
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!studentProfiles.length) { setLoading(false); return }
    Promise.all(
      studentProfiles.map((s: any) =>
        apiGetStudentStatsByUid(s.id).then(st => ({ uid: s.id, stats: st })).catch(() => ({ uid: s.id, stats: null }))
      )
    ).then(results => {
      const map: Record<string, any> = {}
      results.forEach(r => { if (r.stats) map[r.uid] = r.stats })
      setStatsMap(map)
    }).finally(() => setLoading(false))
  }, [studentProfiles.length])

  const allStats  = Object.values(statsMap)
  const withTests = allStats.filter(s => (s.totalTests ?? 0) > 0)
  const avgPct    = withTests.length
    ? Math.round(withTests.reduce((sum, s) => sum + (s.averagePercent ?? 0), 0) / withTests.length)
    : null

  // Most wrong topics: aggregate subjectStats across all students
  const topicCount: Record<string, number> = {}
  allStats.forEach(s => {
    const subjects: any[] = Array.isArray(s.subjectStats) ? s.subjectStats : []
    subjects.forEach(sub => {
      if ((sub.averagePercent ?? 100) < 60 && sub.subject) {
        topicCount[sub.subject] = (topicCount[sub.subject] ?? 0) + 1
      }
    })
  })
  const weakTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
      borderRadius: 16, padding: '16px',
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
    }}>
      {[
        {
          icon: '👥', label: 'Aktiv Şagird',
          value: withTests.length > 0 ? withTests.length : '—',
          color: '#4F87FF',
          sub: `${studentProfiles.length} ümumi`,
        },
        {
          icon: '🎯', label: 'Ortalama Bal',
          value: avgPct !== null ? `${avgPct}%` : '—',
          color: avgPct !== null ? (avgPct >= 70 ? '#00C9A7' : avgPct >= 50 ? '#F4A261' : '#FF4D6D') : '#6C63FF',
          sub: 'Qrup ortalama',
        },
        {
          icon: '⚠️', label: 'Ən Zəif Mövzu',
          value: weakTopics[0]?.[0] ?? '—',
          color: '#F4A261',
          sub: weakTopics[0] ? `${weakTopics[0][1]} şagirddə` : 'Məlumat yoxdur',
        },
      ].map(c => (
        <div key={c.label} style={{
          background: `${c.color}0d`, border: `0.5px solid ${c.color}25`,
          borderRadius: 12, padding: '12px 10px',
        }}>
          <div style={{ fontSize: 16, marginBottom: 6 }}>{c.icon}</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 800,
            color: c.color, lineHeight: 1, marginBottom: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{c.value}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)' }}>{c.label}</div>
          {c.sub && <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{c.sub}</div>}
        </div>
      ))}
    </div>
  )
}

// ── GroupDetailView ───────────────────────────────────────────────────────────
function GroupDetailView({ group, onBack, onRefresh }: any) {
  const [profiles,   setProfiles]   = useState<any[]>([])
  const [loadingP,   setLoadingP]   = useState(true)
  const [openUid,    setOpenUid]    = useState<string | null>(null)
  const [showAdd,    setShowAdd]    = useState(false)
  const [approvedP,  setApprovedP]  = useState<any[]>([])
  const color = groupColor(group.name)

  useEffect(() => {
    const uids = group.studentUids ?? []
    if (!uids.length) { setLoadingP(false); return }
    apiGetStudentProfiles(uids)
      .then(p => setProfiles(Array.isArray(p) ? p.filter(Boolean) : []))
      .catch(() => setProfiles([]))
      .finally(() => setLoadingP(false))

    apiGetSentPermissions()
      .then(p => setApprovedP(Array.isArray(p) ? p.filter((x: any) => x.status === 'granted' || x.status === 'APPROVED') : []))
      .catch(() => setApprovedP([]))
  }, [group.id, group.studentUids?.length])

  const memberCount = group.studentUids?.length ?? 0

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <Sidebar />
      <Topbar />
      <BottomNav />

      <AnimatePresence>
        {showAdd && (
          <AddStudentModal
            group={group}
            approvedPerms={approvedP}
            onClose={() => setShowAdd(false)}
            onAdded={() => { onRefresh(); setShowAdd(false) }}
          />
        )}
      </AnimatePresence>

      <main className="main-content">
        <div className="page-inner">

          {/* Back + header */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <button onClick={onBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16,
              fontFamily: "'Lexend Deca', sans-serif",
            }}>‹ Qruplara qayıt</button>

            <div style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
              borderRadius: 16, padding: '16px',
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, color,
              }}>
                {(group.name ?? 'Q').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-1)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {group.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {group.grade && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: `${color}18`, color,
                    }}>{group.grade}-ci sinif</span>
                  )}
                  <span>{group.subject}</span>
                  <span>·</span>
                  <span>{memberCount} şagird</span>
                </div>
              </div>
              <button onClick={() => setShowAdd(true)}
                style={{
                  padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: '#4F87FF', color: '#fff', fontSize: 12, fontWeight: 700,
                  fontFamily: "'Lexend Deca', sans-serif", flexShrink: 0,
                }}>+ Şagird</button>
            </div>
          </motion.div>

          {/* Group stats */}
          {memberCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Qrup Statistikası
              </div>
              {loadingP ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Spinner /></div>
              ) : (
                <GroupStatsBar studentProfiles={profiles} />
              )}
            </motion.div>
          )}

          {/* Students */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Şagirdlər ({memberCount})
              </div>
            </div>

            {memberCount === 0 ? (
              <div style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
                borderRadius: 16, padding: '36px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Qrupda şagird yoxdur</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>
                  "+ Şagird" düyməsindən şagird əlavə edin
                </div>
                <button onClick={() => setShowAdd(true)} style={{
                  padding: '9px 20px', borderRadius: 10, background: '#4F87FF',
                  border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>+ Şagird əlavə et</button>
              </div>
            ) : loadingP ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profiles.map((student, i) => {
                  const isOpen = openUid === student.id
                  const sColor = PALETTE[student.fullName?.charCodeAt(0) % PALETTE.length] ?? '#4F87FF'
                  return (
                    <motion.div key={student.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SPRING, delay: 0.04 * i }}
                      style={{
                        background: isOpen ? `${sColor}07` : 'var(--bg-card)',
                        border: isOpen ? `0.5px solid ${sColor}35` : '0.5px solid var(--border-card)',
                        borderRadius: 14, padding: '13px 14px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <button
                        onClick={() => setOpenUid(isOpen ? null : student.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: `${sColor}18`, border: `1px solid ${sColor}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 800, color: sColor,
                          fontFamily: "'Lexend Deca', sans-serif",
                        }}>
                          {(student.fullName ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {student.fullName ?? 'Şagird'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 6 }}>
                            {student.uniqueId && <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{student.uniqueId}</span>}
                            {student.grade && <span>· {student.grade}-ci sinif</span>}
                          </div>
                        </div>
                        <motion.span
                          animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}
                          style={{ color: isOpen ? sColor : 'var(--text-3)', fontSize: 18, flexShrink: 0 }}
                        >›</motion.span>
                      </button>

                      <AnimatePresence>
                        {isOpen && <StudentDetailPanel student={student} />}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  )
}

// ── Main GroupsListView ───────────────────────────────────────────────────────
export default function TeacherGroups() {
  const [groups,      setGroups]      = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [approvedCnt, setApprovedCnt] = useState(0)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGetMyGroups()
      setGroups(Array.isArray(data) ? data : [])
    } catch { setGroups([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchGroups()
    apiGetSentPermissions()
      .then(p => setApprovedCnt(Array.isArray(p) ? p.filter((x: any) => x.status === 'granted' || x.status === 'APPROVED').length : 0))
      .catch(() => {})
  }, [])

  const activeGroupObj = useMemo(
    () => groups.find(g => g.id === activeGroup) ?? null,
    [groups, activeGroup]
  )

  if (activeGroupObj) {
    return (
      <GroupDetailView
        group={activeGroupObj}
        onBack={() => setActiveGroup(null)}
        onRefresh={() => { fetchGroups(); setActiveGroup(null) }}
      />
    )
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'rgba(20,30,50,0.95)', backdropFilter: 'blur(20px)',
          color: '#fff', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12,
        },
      }} />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <AnimatePresence>
        {showCreate && (
          <CreateGroupModal
            onClose={() => setShowCreate(false)}
            onCreated={() => fetchGroups()}
          />
        )}
      </AnimatePresence>

      <main className="main-content">
        <div className="page-inner">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
            <h1 style={{
              fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22,
              color: 'var(--text-1)', marginBottom: 4,
            }}>Qruplar</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
              {loading ? 'Yüklənir...' : groups.length > 0
                ? `${groups.length} qrup · ${groups.reduce((a, g) => a + (g.studentUids?.length ?? 0), 0)} şagird`
                : 'Hələ qrup yaradılmayıb'}
            </p>
          </motion.div>

          {/* Create button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 }}>
            <button onClick={() => setShowCreate(true)}
              style={{
                width: '100%', padding: '13px', borderRadius: 14, fontSize: 14, fontWeight: 800,
                background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                border: 'none', color: '#fff', cursor: 'pointer',
                fontFamily: "'Lexend Deca', sans-serif",
                boxShadow: '0 4px 20px rgba(79,135,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              + Yeni Qrup Yarat
            </button>
          </motion.div>

          {/* Approved badge */}
          {approvedCnt > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(0,201,167,0.07)', border: '0.5px solid rgba(0,201,167,0.25)',
                borderRadius: 12, padding: '10px 14px',
              }}
            >
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                <strong style={{ color: '#00C9A7' }}>{approvedCnt}</strong> şagird icazə verdi — qrupa daxil edə bilərsiniz
              </span>
            </motion.div>
          )}

          {/* Groups list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
          ) : groups.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
                borderRadius: 20, padding: '48px 24px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 14 }}>👥</div>
              <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 8 }}>
                Hələ qrup yoxdur
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 260, margin: '0 auto 20px' }}>
                Yeni qrup yaradın. Ad verin, sinif və fənn seçin, sonra şagirdlər əlavə edin.
              </div>
              <button onClick={() => setShowCreate(true)}
                style={{
                  padding: '11px 28px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                  background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  fontFamily: "'Lexend Deca', sans-serif",
                }}>+ Qrup Yarat</button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {groups.map((grp, i) => {
                const color = groupColor(grp.name)
                const count = grp.studentUids?.length ?? 0
                return (
                  <motion.div key={grp.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: 0.05 * i }}
                    onClick={() => setActiveGroup(grp.id)}
                    style={{
                      background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
                      borderRadius: 16, padding: '16px',
                      cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
                    }}
                    whileHover={{ scale: 1.005 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Icon */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                        background: `${color}18`, border: `1px solid ${color}35`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color,
                      }}>
                        {(grp.name ?? 'Q').charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {grp.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {grp.grade && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                              background: `${color}18`, color,
                            }}>{grp.grade}-ci sinif</span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{grp.subject}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>·</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{count} şagird</span>
                        </div>
                      </div>

                      {/* Count + arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color,
                        }}>{count}</div>
                        <div style={{ color: 'var(--text-3)', fontSize: 18 }}>›</div>
                      </div>
                    </div>

                    {/* Avatar stack */}
                    {count > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', marginTop: 12,
                        paddingTop: 12, borderTop: '0.5px solid var(--border-card)',
                        gap: 0,
                      }}>
                        {(grp.studentUids ?? []).slice(0, 7).map((uid: string, j: number) => (
                          <div key={uid} style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${PALETTE[j % PALETTE.length]}, ${PALETTE[(j + 2) % PALETTE.length]})`,
                            border: '2px solid var(--bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 800, color: '#fff',
                            marginLeft: j > 0 ? -8 : 0, zIndex: 10 - j,
                            position: 'relative',
                          }}>
                            {(uid[0] ?? '?').toUpperCase()}
                          </div>
                        ))}
                        {count > 7 && (
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--bg-primary)', border: '2px solid var(--bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, color: 'var(--text-3)', fontWeight: 700, marginLeft: -8,
                          }}>+{count - 7}</div>
                        )}
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                          Bax →
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
