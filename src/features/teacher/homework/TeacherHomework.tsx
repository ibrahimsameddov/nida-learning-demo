// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MATH_CHAPTERS } from '@/lib/mathTopics'
import {
  apiCreateHomework, apiGetTeacherHomeworks,
  apiGetHomeworkAttempts, apiGetMyGroups,
} from '@/lib/api'
import { apiGetStudentProfiles } from '@/lib/api'
import { Avatar }    from '@/components/ui/Avatar'
import toast, { Toaster } from 'react-hot-toast'
import { SPRING } from '@/lib/motion'

function fmt(ts: any) {
  if (!ts) return '—'
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
}

// ── CreateHomeworkModal ───────────────────────────────────────────────────────
function CreateHomeworkModal({ groups, onClose, onCreate }: any) {
  const [groupId,     setGroupId]     = useState('')
  const [topicId,     setTopicId]     = useState('')
  const [repeatLimit, setRepeatLimit] = useState(3)
  const [saving,      setSaving]      = useState(false)

  const allTopics = MATH_CHAPTERS.flatMap(ch =>
    ch.topics.map(t => ({ ...t, chapterTitle: ch.title }))
  )
  const selectedTopic = allTopics.find(t => t.id === topicId)

  const canSubmit = groupId && topicId

  const handleCreate = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      const hw = await apiCreateHomework({
        groupId,
        topicId,
        topicTitle: selectedTopic!.title,
        subject:    'Riyaziyyat',
        repeatLimit,
      })
      onCreate(hw)
      onClose()
      toast.success('Ev tapşırığı təyin edildi!')
    } catch {
      toast.error('Xəta baş verdi.')
    } finally { setSaving(false) }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={SPRING}
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 22, padding: '24px 20px',
          maxHeight: '90dvh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text-1)' }}>
              Ev Tapşırığı Təyin Et
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Riyaziyyat mövzusu seç</div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
            background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
            color: 'var(--text-3)', fontSize: 16,
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Group */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
              Qrup
            </label>
            <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)} style={{ appearance: 'none' }}>
              <option value="">Qrup seçin</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
              Mövzu
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
              {MATH_CHAPTERS.map(ch => (
                <div key={ch.id}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 4px 4px' }}>
                    {ch.title}
                  </div>
                  {ch.topics.map(t => (
                    <button
                      key={t.id} type="button"
                      onClick={() => setTopicId(t.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px',
                        borderRadius: 10, marginBottom: 3, cursor: 'pointer',
                        fontSize: 13, fontWeight: topicId === t.id ? 700 : 400,
                        border: `1.5px solid ${topicId === t.id ? '#4F87FF' : 'var(--border)'}`,
                        background: topicId === t.id ? 'rgba(79,135,255,0.1)' : 'var(--bg-secondary)',
                        color: topicId === t.id ? '#4F87FF' : 'var(--text-1)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Repeat limit */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
              Təkrar sayı
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 5, 10].map(n => (
                <button
                  key={n} type="button"
                  onClick={() => setRepeatLimit(n)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', border: `1.5px solid ${repeatLimit === n ? '#4F87FF' : 'var(--border)'}`,
                    background: repeatLimit === n ? 'rgba(79,135,255,0.1)' : 'var(--bg-secondary)',
                    color: repeatLimit === n ? '#4F87FF' : 'var(--text-3)',
                    transition: 'all 0.15s',
                  }}
                >{n}</button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!canSubmit || saving}
            style={{
              padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
              background: canSubmit && !saving ? 'linear-gradient(135deg, #4F87FF, #6C63FF)' : 'rgba(79,135,255,0.3)',
              border: 'none', color: '#fff',
              cursor: canSubmit && !saving ? 'pointer' : 'not-allowed',
              fontFamily: "'Lexend Deca', sans-serif",
            }}
          >
            {saving ? 'Təyin edilir...' : '✓ Təyin Et'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── AttemptsPanel ─────────────────────────────────────────────────────────────
function AttemptsPanel({ homework, groups, onClose }: any) {
  const [attempts,  setAttempts]  = useState<any[]>([])
  const [profiles,  setProfiles]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selStudent, setSelStudent] = useState<string | null>(null)

  const group = groups.find((g: any) => g.id === homework.groupId)

  useEffect(() => {
    Promise.all([
      apiGetHomeworkAttempts(homework.id),
      (group?.studentIds ?? group?.studentUids)?.length
        ? apiGetStudentProfiles((group.studentIds ?? group.studentUids) as number[])
        : Promise.resolve([]),
    ]).then(([att, profs]) => {
      setAttempts(Array.isArray(att) ? att : [])
      setProfiles(Array.isArray(profs) ? profs.filter(Boolean) : [])
    }).finally(() => setLoading(false))
  }, [homework.id])

  const studentAttempts = (studentUid: string) =>
    attempts
      .filter(a => a.studentUid === studentUid)
      .sort((a, b) => a.attemptNumber - b.attemptNumber)

  const studentsDone = [...new Set(attempts.map(a => a.studentUid))]
  const studentsPending = (group?.studentUids ?? []).filter((uid: string) => !studentsDone.includes(uid))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={SPRING}
        style={{
          width: '100%', maxWidth: 500,
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 22, padding: '22px 20px',
          maxHeight: '90dvh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text-1)' }}>
              {homework.topicTitle}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
              {group?.name} · Maks {homework.repeatLimit} təkrar
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
            background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
            color: 'var(--text-3)', fontSize: 16,
          }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>Yüklənir...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profiles.map((profile: any) => {
              const uid = profile.id
              const studentName = profile.fullName || '—'
              const attList = studentAttempts(uid)
              const isOpen = selStudent === uid

              return (
                <div key={uid} style={{
                  borderRadius: 14, border: '0.5px solid var(--border)',
                  background: 'var(--bg-secondary)', overflow: 'hidden',
                }}>
                  {/* Student row */}
                  <button
                    onClick={() => setSelStudent(isOpen ? null : uid)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <Avatar name={studentName} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{studentName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                        {attList.length}/{homework.repeatLimit} cəhd
                      </div>
                    </div>
                    {attList.length > 0 ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                        background: 'rgba(0,201,167,0.12)', color: '#00C9A7',
                      }}>
                        Ən yaxşı: {Math.max(...attList.map(a => a.percent))}%
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Gözlənilir</span>
                    )}
                    <span style={{ color: 'var(--text-3)', fontSize: 14, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                  </button>

                  {/* Attempts detail */}
                  {isOpen && attList.length > 0 && (
                    <div style={{ borderTop: '0.5px solid var(--border)', padding: '10px 14px 14px' }}>
                      {attList.map(att => (
                        <div key={att.id} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                              background: 'rgba(79,135,255,0.12)', color: '#4F87FF',
                            }}>
                              {att.attemptNumber}-ci cəhd
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                              background: att.percent >= 80 ? 'rgba(0,201,167,0.12)' : 'rgba(244,162,97,0.12)',
                              color: att.percent >= 80 ? '#00C9A7' : '#F4A261',
                            }}>
                              {att.percent}%
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>
                              {fmt(att.completedAt)}
                            </span>
                          </div>

                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                            ✅ {att.correct}/{att.total} düzgün
                            {att.wrongQuestions?.length > 0 && ` · ❌ ${att.wrongQuestions.length} səhv`}
                          </div>

                          {att.wrongQuestions?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {att.wrongQuestions.map((wq: any, i: number) => (
                                <div key={i} style={{
                                  padding: '8px 10px', borderRadius: 8,
                                  background: 'rgba(255,77,109,0.06)',
                                  border: '0.5px solid rgba(255,77,109,0.2)',
                                }}>
                                  <div style={{ fontSize: 12, color: 'var(--text-1)', marginBottom: 4, lineHeight: 1.4 }}>
                                    {wq.question}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#ff4d6d' }}>
                                    Şagird: <strong>{wq.studentAnswer}</strong>
                                  </div>
                                  <div style={{ fontSize: 11, color: '#00C9A7', marginTop: 2 }}>
                                    Düzgün: <strong>{wq.correctAnswer}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isOpen && attList.length === 0 && (
                    <div style={{ borderTop: '0.5px solid var(--border)', padding: '12px 14px', fontSize: 12, color: 'var(--text-3)' }}>
                      Bu şagird hələ tapşırığı tamamlamamışdır.
                    </div>
                  )}
                </div>
              )
            })}

            {profiles.length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)', fontSize: 13 }}>
                Bu qrupda şagird yoxdur.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Subject color map
const SUBJ_COLOR: Record<string, string> = {
  'Riyaziyyat':      'var(--subject-math)',
  'Fizika':          'var(--subject-physics)',
  'Kimya':           'var(--subject-chem)',
  'Tarix':           'var(--subject-history)',
  'Biologiya':       '#10B981',
  'Coğrafiya':       '#0EA5E9',
  'İnformatika':     '#8B5CF6',
  'Azərbaycan dili': 'var(--subject-lang)',
  'Xarici dil':      'var(--subject-lang)',
}
const SUBJ_ICON: Record<string, string> = {
  'Riyaziyyat':      '📐',
  'Fizika':          '⚡',
  'Kimya':           '🧪',
  'Tarix':           '🏛️',
  'Biologiya':       '🧬',
  'Coğrafiya':       '🌍',
  'İnformatika':     '💻',
  'Azərbaycan dili': '📖',
  'Xarici dil':      '🇬🇧',
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TeacherHomework() {
  const [homeworks,   setHomeworks]   = useState<any[]>([])
  const [groups,      setGroups]      = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showCreate,  setShowCreate]  = useState(false)
  const [selected,    setSelected]    = useState<any>(null)

  useEffect(() => {
    Promise.all([apiGetTeacherHomeworks(), apiGetMyGroups()])
      .then(([hw, gr]) => {
        setHomeworks(Array.isArray(hw) ? hw : [])
        setGroups(Array.isArray(gr) ? gr : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const groupObj  = (gid: string) => groups.find(g => g.id === gid)
  const groupName = (gid: string) => groupObj(gid)?.name ?? '—'
  const uniqueGroups = new Set(homeworks.map(h => h.groupId)).size

  return (
    <div className="page-inner">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'rgba(20,30,50,0.95)', backdropFilter: 'blur(20px)',
          color: '#fff', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12,
        },
      }} />

      <AnimatePresence>
        {showCreate && (
          <CreateHomeworkModal
            groups={groups}
            onClose={() => setShowCreate(false)}
            onCreate={(hw: any) => setHomeworks(prev => [hw, ...prev])}
          />
        )}
        {selected && (
          <AttemptsPanel
            homework={selected}
            groups={groups}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-1)' }}>
            Ev Tapşırıqları
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
            {loading ? 'Yüklənir...' : `${homeworks.length} tapşırıq · ${uniqueGroups} qrup`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          style={{
            padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--subject-math), #6C63FF)',
            border: 'none', color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 2px 14px rgba(59,130,246,0.35)',
          }}
        >+ Təyin Et</motion.button>
      </motion.div>

      {/* ── Stats row ──────────────────────────────── */}
      {!loading && homeworks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}
        >
          {[
            { icon: '📋', val: homeworks.length, label: 'Tapşırıq', color: 'var(--subject-math)',    bg: 'var(--subject-math-bg)' },
            { icon: '👥', val: uniqueGroups,      label: 'Qrup',     color: 'var(--subject-physics)', bg: 'var(--subject-physics-bg)' },
            { icon: '🔁', val: Math.round(homeworks.reduce((s, h) => s + (h.repeatLimit || 0), 0) / Math.max(homeworks.length, 1)), label: 'Ort. Cəhd', color: 'var(--subject-chem)', bg: 'var(--subject-chem-bg)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1.5px solid ${s.color}25`,
              borderRadius: 'var(--radius-lg)', padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── List ───────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : homeworks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 14 }}>📝</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--text-1)', marginBottom: 8 }}>
            Hələ tapşırıq yoxdur
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 20 }}>
            Qrupa mövzu tapşırığı təyin etmək üçün düyməni basın
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 800,
              background: 'linear-gradient(135deg, var(--subject-math), #6C63FF)',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >+ Tapşırıq Təyin Et</motion.button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {homeworks.map((hw, i) => {
            const subj   = hw.subject ?? 'Riyaziyyat'
            const color  = SUBJ_COLOR[subj] ?? 'var(--subject-math)'
            const icon   = SUBJ_ICON[subj]  ?? '📐'
            const grp    = groupObj(hw.groupId)
            const stCount = grp?.studentUids?.length ?? grp?.studentIds?.length ?? 0
            return (
              <motion.button
                key={hw.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.04 * i }}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(hw)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden', display: 'flex', padding: 0,
                }}
              >
                {/* Colored left accent bar */}
                <div style={{ width: 4, background: color, flexShrink: 0 }} />

                <div style={{ flex: 1, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  {/* Subject icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                    border: `1.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{icon}</div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hw.topicTitle}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                        background: `color-mix(in srgb, ${color} 12%, transparent)`,
                        color,
                      }}>
                        {groupName(hw.groupId)}
                      </span>
                      {stCount > 0 && (
                        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
                          👥 {stCount} şagird
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: repeat limit + date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                      background: 'var(--subject-math-bg)', color: 'var(--subject-math)',
                      marginBottom: 4, display: 'inline-block',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      ×{hw.repeatLimit}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{fmt(hw.createdAt)}</div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
