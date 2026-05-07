// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  apiGetTeacherSinaqExams, apiCreateSinaqExam,
  apiGetSinaqAttempts, apiMarkSinaqSummarySent, apiGetMyGroups,
  apiShareSinaqWithParents,
} from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { MATH_CHAPTERS } from '@/lib/mathTopics'
import { SPRING } from '@/lib/motion'

const NIDA_PLUS_PLAN    = 'nida_plus'
const MONTHLY_EXAM_LIMIT = 3
const FREE_TOPIC_LIMIT   = 3
const PLUS_TOPIC_LIMIT   = 10

const DIFFICULTIES = [
  { id: 'asan',    label: 'Asan',    emoji: '🟢', desc: 'Əsas suallar' },
  { id: 'orta',    label: 'Orta',    emoji: '🟡', desc: 'Orta çətinlik' },
  { id: 'cetin',   label: 'Çətin',   emoji: '🔴', desc: 'Mürəkkəb suallar' },
  { id: 'qarisiq', label: 'Qarışıq', emoji: '🎲', desc: 'Müxtəlif səviyyə' },
]

const ALL_TOPICS = MATH_CHAPTERS.flatMap(ch => ch.topics.map(t => ({ ...t, chapterTitle: ch.title })))

function isThisMonth(ts: any): boolean {
  if (!ts) return false
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
}

function examStatus(exam: any): 'upcoming' | 'active' | 'ended' {
  const now = Date.now()
  const start = exam.startDate?.seconds ? exam.startDate.seconds * 1000 : new Date(exam.startDate ?? 0).getTime()
  const end   = exam.endDate?.seconds   ? exam.endDate.seconds   * 1000 : new Date(exam.endDate   ?? 0).getTime()
  if (now < start) return 'upcoming'
  if (now <= end)  return 'active'
  return 'ended'
}

function fmtDateTime(ts: any) {
  if (!ts) return '—'
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleString('az-AZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function StatusPill({ status }: { status: string }) {
  const cfg = {
    upcoming: { label: 'Gözləyir',  color: '#F4A261', bg: 'rgba(244,162,97,0.12)'  },
    active:   { label: 'Aktiv',     color: '#00C9A7', bg: 'rgba(0,201,167,0.12)'   },
    ended:    { label: 'Bitib',     color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  }[status] ?? { label: status, color: 'var(--text-3)', bg: 'var(--bg-card)' }
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 700,
      color: cfg.color, background: cfg.bg, flexShrink: 0,
    }}>{cfg.label}</span>
  )
}

function Field({ label, children }: any) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function CreateExamModal({ groups, exams, isNidaPlus, onClose, onCreate }: any) {
  const topicLimit = isNidaPlus ? PLUS_TOPIC_LIMIT : FREE_TOPIC_LIMIT

  const [groupId,     setGroupId]     = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [difficulty,  setDifficulty]  = useState('orta')
  const [timeLimit,   setTimeLimit]   = useState('45')
  const [startDate,   setStartDate]   = useState('')
  const [endDate,     setEndDate]     = useState('')
  const [saving,      setSaving]      = useState(false)
  const [err,         setErr]         = useState('')

  const monthlyCount = useMemo(() => {
    const thisMonth = exams.filter((e: any) => isThisMonth(e.createdAt))
    if (isNidaPlus) {
      if (!groupId) return 0
      return thisMonth.filter((e: any) => e.groupId === groupId).length
    }
    return thisMonth.length
  }, [exams, isNidaPlus, groupId])

  const limitReached = monthlyCount >= MONTHLY_EXAM_LIMIT

  const toggleTopic = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < topicLimit ? [...prev, id] : prev
    )
  }

  const handleCreate = async () => {
    if (!groupId)             { setErr('Qrup seçin'); return }
    if (!selectedIds.length)  { setErr('Ən azı 1 mövzu seçin'); return }
    if (!startDate)           { setErr('Başlanğıc tarixini seçin'); return }
    if (!endDate)             { setErr('Bitmə tarixini seçin'); return }
    if (new Date(startDate) >= new Date(endDate)) { setErr('Bitmə tarixi başlanğıcdan sonra olmalıdır'); return }
    if (limitReached)         { setErr(`Aylıq sinaq imtahanı limiti dolub (${MONTHLY_EXAM_LIMIT})`); return }

    setSaving(true); setErr('')
    try {
      const created = await apiCreateSinaqExam({
        groupId,
        subject:   'Riyaziyyat',
        topicIds:  selectedIds,
        difficulty,
        timeLimit: Number(timeLimit) || 45,
        startDate,
        endDate,
      })
      onCreate(created)
      onClose()
    } catch {
      setErr('Xəta baş verdi. Yenidən cəhd edin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={SPRING}
        style={{ width: '100%', maxWidth: 540, maxHeight: '92dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '0.5px solid rgba(79,135,255,0.2)', borderRadius: '20px 20px 16px 16px' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-1)' }}>Sinaq İmtahanı Yarat</h3>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Monthly limit banner */}
          <div style={{
            padding: '8px 12px', borderRadius: 10, fontSize: 12,
            background: limitReached ? 'rgba(255,77,109,0.08)' : 'rgba(79,135,255,0.06)',
            border: `0.5px solid ${limitReached ? 'rgba(255,77,109,0.3)' : 'rgba(79,135,255,0.2)'}`,
            color: limitReached ? '#ff4d6d' : 'var(--text-3)',
          }}>
            {limitReached ? '🔒 ' : '📊 '}
            {isNidaPlus ? `Bu qrupda bu ay: ${monthlyCount}/${MONTHLY_EXAM_LIMIT}` : `Bu ay cəmi: ${monthlyCount}/${MONTHLY_EXAM_LIMIT}`}
            {!isNidaPlus && !limitReached && <span style={{ color: '#A78BFA' }}> · Nida+ ilə hər qrupa ayrıca 3</span>}
          </div>

          {/* Group */}
          <Field label="Qrup">
            <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)} style={{ appearance: 'none' }}>
              <option value="">Qrup seçin...</option>
              {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name} — {g.subject}</option>)}
            </select>
          </Field>

          {/* Topic selector */}
          <Field label={`Mövzular (max ${topicLimit} seçin · seçildi: ${selectedIds.length}/${topicLimit})`}>
            <div style={{ maxHeight: 240, overflowY: 'auto', borderRadius: 12, border: '0.5px solid var(--border-card)', background: 'var(--bg-secondary)' }}>
              {MATH_CHAPTERS.map(ch => (
                <div key={ch.id}>
                  <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '0.5px solid var(--border-card)', background: 'rgba(0,0,0,0.1)' }}>
                    {ch.title}
                  </div>
                  {ch.topics.map(t => {
                    const sel = selectedIds.includes(t.id)
                    const disabled = !sel && selectedIds.length >= topicLimit
                    return (
                      <div
                        key={t.id}
                        onClick={() => !disabled && toggleTopic(t.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.4 : 1,
                          background: sel ? 'rgba(79,135,255,0.1)' : 'transparent',
                          borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1.5px solid ${sel ? '#4F87FF' : 'rgba(255,255,255,0.15)'}`,
                          background: sel ? '#4F87FF' : 'transparent',
                          fontSize: 10, color: '#fff',
                        }}>
                          {sel ? '✓' : ''}
                        </div>
                        <span style={{ fontSize: 12, color: sel ? 'var(--text-1)' : 'var(--text-2)', lineHeight: 1.3 }}>{t.title}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </Field>

          {/* Difficulty */}
          <Field label="Çətinlik">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {DIFFICULTIES.map(d => (
                <button key={d.id} type="button" onClick={() => setDifficulty(d.id)}
                  style={{
                    padding: '8px 4px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: `1.5px solid ${difficulty === d.id ? '#4F87FF' : 'var(--border-card)'}`,
                    background: difficulty === d.id ? 'rgba(79,135,255,0.1)' : 'var(--bg-secondary)',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{d.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: difficulty === d.id ? '#4F87FF' : 'var(--text-2)' }}>{d.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          {/* Time limit */}
          <Field label="Müddət (dəqiqə)">
            <div style={{ display: 'flex', gap: 6 }}>
              {[20, 30, 45, 60, 90].map(m => (
                <button key={m} type="button" onClick={() => setTimeLimit(String(m))}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: `1.5px solid ${timeLimit === String(m) ? '#4F87FF' : 'var(--border-card)'}`,
                    background: timeLimit === String(m) ? 'rgba(79,135,255,0.1)' : 'var(--bg-secondary)',
                    color: timeLimit === String(m) ? '#4F87FF' : 'var(--text-2)',
                    transition: 'all 0.15s',
                  }}>{m}'</button>
              ))}
            </div>
          </Field>

          {/* Date range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Başlanğıc tarixi">
              <input className="input" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </Field>
            <Field label="Bitmə tarixi">
              <input className="input" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </Field>
          </div>

          {/* Repeat note */}
          <div style={{ padding: '8px 12px', borderRadius: 10, fontSize: 11, color: 'var(--text-3)', background: 'rgba(167,139,250,0.06)', border: '0.5px solid rgba(167,139,250,0.15)' }}>
            ℹ️ Sinaq imtahanında hər şagird yalnız <strong style={{ color: '#A78BFA' }}>1 dəfə</strong> iştirak edə bilər.
          </div>

          {err && (
            <div style={{ fontSize: 12, color: '#ff4d6d', padding: '8px 12px', background: 'rgba(255,77,109,0.1)', borderRadius: 8 }}>{err}</div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving || limitReached}
            style={{
              padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
              background: saving || limitReached ? 'rgba(79,135,255,0.35)' : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
              border: 'none', color: '#fff',
              cursor: saving || limitReached ? 'not-allowed' : 'pointer',
              fontFamily: "'Lexend Deca',sans-serif",
              boxShadow: '0 4px 20px rgba(79,135,255,0.3)',
            }}
          >
            {saving ? 'Yaradılır...' : limitReached ? '🔒 Limit dolub' : '✓ Sinaq İmtahanı Yarat'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ResultsPanel({ exam, groupName, onClose }: any) {
  const [attempts,  setAttempts]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [sharing,   setSharing]   = useState(false)
  const [shared,    setShared]    = useState(() => !!exam.sharedWithParents)

  const handleShare = async () => {
    if (sharing || shared) return
    setSharing(true)
    try {
      await apiShareSinaqWithParents(exam.id, exam.groupId)
      setShared(true)
    } catch { /* silent */ } finally { setSharing(false) }
  }

  useEffect(() => {
    apiGetSinaqAttempts(exam.id).then(a => { setAttempts(a as any[]); setLoading(false) }).catch(() => setLoading(false))
  }, [exam.id])

  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) : 0
  const diff = DIFFICULTIES.find(d => d.id === exam.difficulty) ?? DIFFICULTIES[1]

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={SPRING}
      style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'var(--bg-primary)', overflowY: 'auto', padding: '24px 16px' }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Geri
        </button>

        {/* Exam info */}
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8, fontFamily: "'Lexend Deca',sans-serif" }}>
            {groupName} — Sinaq İmtahanı Nəticələri
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-3)' }}>
            <span>{diff.emoji} {diff.label}</span>
            <span>⏱ {exam.timeLimit} dəq</span>
            <span>📚 {exam.topicIds?.length} mövzu</span>
            <span>📅 {fmtDateTime(exam.startDate)} → {fmtDateTime(exam.endDate)}</span>
          </div>
          {attempts.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleShare}
                disabled={sharing || shared}
                style={{
                  padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                  background: shared ? 'rgba(0,201,167,0.1)' : 'rgba(167,139,250,0.1)',
                  border: `0.5px solid ${shared ? 'rgba(0,201,167,0.3)' : 'rgba(167,139,250,0.3)'}`,
                  color: shared ? '#00C9A7' : '#A78BFA',
                  cursor: sharing || shared ? 'default' : 'pointer',
                }}
              >
                {shared ? '✓ Valideynlərə paylaşıldı' : sharing ? '…' : '👨‍👩‍👧 Valideynlərə paylaş'}
              </button>
            </div>
          )}
          {attempts.length > 0 && (
            <div style={{ display: 'flex', gap: 20, marginTop: 16, padding: '12px 0', borderTop: '0.5px solid var(--border-card)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#4F87FF', fontFamily: 'monospace' }}>{attempts.length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>İştirakçı</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: avg >= 75 ? '#00C9A7' : avg >= 50 ? '#F4A261' : '#ff4d6d', fontFamily: 'monospace' }}>{avg}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Ortalama</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#A78BFA', fontFamily: 'monospace' }}>
                  {Math.max(...attempts.map(a => a.percent))}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Ən Yüksək</div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : attempts.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Heç bir şagird iştirak etməyib</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...attempts].sort((a, b) => b.percent - a.percent).map((att, idx) => (
              <div key={att.id} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 14, overflow: 'hidden' }}>
                <div
                  onClick={() => setExpanded(expanded === att.id ? null : att.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, fontFamily: 'monospace',
                    background: idx === 0 ? 'rgba(244,162,97,0.15)' : idx === 1 ? 'rgba(200,200,200,0.1)' : 'rgba(180,120,80,0.1)',
                    color: idx === 0 ? '#F4A261' : idx === 1 ? '#aaa' : '#b47850',
                  }}>{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{att.studentName || 'Şagird'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{att.correct}/{att.total} düzgün · {Math.round((att.timeSpent ?? 0) / 60)} dəq</div>
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 800, fontFamily: 'monospace',
                    color: att.percent >= 75 ? '#00C9A7' : att.percent >= 50 ? '#F4A261' : '#ff4d6d',
                  }}>{att.percent}%</div>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', transition: 'transform 0.2s', display: 'inline-block', transform: expanded === att.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>

                <AnimatePresence>
                  {expanded === att.id && att.wrongQuestions?.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', borderTop: '0.5px solid var(--border-card)' }}
                    >
                      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Yanlış Cavablar ({att.wrongQuestions.length})
                        </div>
                        {att.wrongQuestions.map((wq: any, i: number) => (
                          <div key={i} style={{ background: 'rgba(255,77,109,0.05)', border: '0.5px solid rgba(255,77,109,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, lineHeight: 1.4 }}>{wq.question}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                              <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,77,109,0.1)', color: '#ff4d6d' }}>✗ {wq.studentAnswer}</span>
                              <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(0,201,167,0.1)', color: '#00C9A7' }}>✓ {wq.correctAnswer}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ExamCard({ exam, groupName, onClick }: any) {
  const status = examStatus(exam)
  const diff = DIFFICULTIES.find(d => d.id === exam.difficulty) ?? DIFFICULTIES[1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
      onClick={status === 'ended' ? onClick : undefined}
      style={{
        background: 'var(--bg-card)',
        border: `0.5px solid ${status === 'active' ? 'rgba(0,201,167,0.25)' : 'var(--border-card)'}`,
        borderRadius: 16, padding: 16,
        cursor: status === 'ended' ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
            {groupName} — {exam.topicIds?.length} mövzu
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-3)' }}>
            <span>{diff.emoji} {diff.label}</span>
            <span>⏱ {exam.timeLimit} dəq</span>
          </div>
        </div>
        <StatusPill status={status} />
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-3)', flexWrap: 'wrap' }}>
        <span>▶ {fmtDateTime(exam.startDate)}</span>
        <span>■ {fmtDateTime(exam.endDate)}</span>
      </div>
      {status === 'active' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '7px 10px', borderRadius: 8, background: 'rgba(0,201,167,0.06)', border: '0.5px solid rgba(0,201,167,0.15)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C9A7', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 11, color: '#00C9A7', fontWeight: 600 }}>Şagirdlər imtahana qoşula bilər</span>
        </div>
      )}
      {status === 'ended' && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#A78BFA', fontWeight: 600 }}>📊 Nəticələrə bax →</div>
      )}
    </motion.div>
  )
}

const TABS = [
  { key: 'upcoming', label: 'Gözləyir' },
  { key: 'active',   label: 'Aktiv'    },
  { key: 'ended',    label: 'Bitib'    },
] as const

export default function TeacherExams() {
  const user       = useAuthStore(s => s.user)
  const isNidaPlus = (user as any)?.plan === NIDA_PLUS_PLAN

  const [exams,      setExams]      = useState<any[]>([])
  const [groups,     setGroups]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab,        setTab]        = useState<'upcoming' | 'active' | 'ended'>('active')
  const [viewing,    setViewing]    = useState<any>(null)

  const groupMap = useMemo(() => Object.fromEntries(groups.map(g => [g.id, g.name])), [groups])

  useEffect(() => {
    Promise.all([apiGetTeacherSinaqExams(), apiGetMyGroups()])
      .then(([e, g]) => {
        setExams(Array.isArray(e) ? e : [])
        setGroups(Array.isArray(g) ? g : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto-send summary notifications for ended exams without summarySentAt
  useEffect(() => {
    if (!exams.length || !user) return
    const currentUid = (user as any)?.id ?? ''
    exams
      .filter(e => examStatus(e) === 'ended' && !e.summarySentAt)
      .forEach(async e => {
        try {
          const attempts = await apiGetSinaqAttempts(e.id) as any[]
          if (!attempts.length) return
          const avg = Math.round(attempts.reduce((s: number, a: any) => s + a.percent, 0) / attempts.length)
          await apiMarkSinaqSummarySent(e.id, currentUid, {
            examId: e.id, groupName: groupMap[e.groupId] ?? 'Qrup',
            attemptCount: attempts.length, avgPercent: avg,
          })
          setExams(prev => prev.map(x => x.id === e.id ? { ...x, summarySentAt: new Date().toISOString() } : x))
        } catch { /* silent */ }
      })
  }, [exams, groupMap, user])

  const filtered = useMemo(() => exams.filter(e => examStatus(e) === tab), [exams, tab])
  const counts = useMemo(() => ({
    upcoming: exams.filter(e => examStatus(e) === 'upcoming').length,
    active:   exams.filter(e => examStatus(e) === 'active').length,
    ended:    exams.filter(e => examStatus(e) === 'ended').length,
  }), [exams])

  return (
    <div className="page-inner">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h2 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>Sinaq İmtahanları</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{exams.length} imtahan · {counts.active} aktiv</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
            border: 'none', color: '#fff', cursor: 'pointer',
            fontFamily: "'Lexend Deca',sans-serif",
            boxShadow: '0 2px 14px rgba(79,135,255,0.35)',
          }}
        >+ Yarat</button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-card)', borderRadius: 12, border: '0.5px solid var(--border-card)' }}>
        {TABS.map(t => (
          <button
            key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', border: 'none',
              background: tab === t.key ? '#4F87FF' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-3)',
              fontFamily: "'Lexend Deca',sans-serif",
            }}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span style={{ marginLeft: 5, fontSize: 9, background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: 6 }}>{counts[t.key]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
          style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)', borderRadius: 16, padding: '44px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>
            {tab === 'upcoming' ? '⏰' : tab === 'active' ? '▶️' : '📊'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>
            {tab === 'upcoming' ? 'Gözləyən imtahan yoxdur' : tab === 'active' ? 'Aktiv imtahan yoxdur' : 'Bitmiş imtahan yoxdur'}
          </div>
          {tab !== 'ended' && (
            <button onClick={() => setShowCreate(true)}
              style={{ marginTop: 14, padding: '9px 22px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #4F87FF, #6C63FF)', border: 'none', color: '#fff', cursor: 'pointer' }}>
              + Sinaq İmtahanı Yarat
            </button>
          )}
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(e => (
            <ExamCard key={e.id} exam={e} groupName={groupMap[e.groupId] ?? 'Qrup'} onClick={() => setViewing(e)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateExamModal
            groups={groups} exams={exams} isNidaPlus={isNidaPlus}
            onClose={() => setShowCreate(false)}
            onCreate={(exam: any) => setExams(prev => [exam, ...prev])}
          />
        )}
        {viewing && (
          <ResultsPanel exam={viewing} groupName={groupMap[viewing.groupId] ?? 'Qrup'} onClose={() => setViewing(null)} />
        )}
      </AnimatePresence>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
