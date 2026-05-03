// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMyExams, apiGetMyGroups, apiCreateExam, apiActivateExam, apiNotifyExamAssigned } from '@/lib/api'
import { SPRING } from '@/lib/motion'

const SUBJECTS = [
  'Riyaziyyat', 'Azərbaycan dili', 'Fizika', 'Kimya',
  'Biologiya', 'Tarix', 'Coğrafiya', 'İnformatika', 'Xarici dil',
]

function fmt(ts: any) {
  if (!ts) return '—'
  const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    waiting:   { label: 'Gözləyir',   color: '#F4A261', bg: 'rgba(244,162,97,0.12)'  },
    active:    { label: 'Aktiv',      color: '#00C9A7', bg: 'rgba(0,201,167,0.12)'   },
    completed: { label: 'Tamamlandı', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  }
  const s = map[status] ?? map.waiting
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
      color: s.color, background: s.bg, flexShrink: 0,
    }}>{s.label}</span>
  )
}

function CreateModal({ groups, onClose, onCreate }: any) {
  const [form, setForm] = useState({
    title: '', subject: SUBJECTS[0], duration: '60', groupId: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleCreate = async () => {
    if (!form.title.trim()) { setErr('İmtahan adı boş ola bilməz'); return }
    setSaving(true); setErr('')
    try {
      const exam = await apiCreateExam({
        title:     form.title.trim(),
        subject:   form.subject,
        duration:  Number(form.duration) || 60,
        groupId:   form.groupId || null,
        createdAt: new Date().toISOString(),
      })
      const created = { ...exam, status: 'waiting', createdAt: new Date().toISOString() }
      if (form.groupId) {
        apiNotifyExamAssigned({ ...created, groupId: form.groupId }).catch(() => {})
      }
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
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={SPRING}
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg-card)',
          border: '0.5px solid rgba(79,135,255,0.2)',
          borderRadius: '20px 20px 16px 16px',
          padding: 24,
        }}
      >
        {/* handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text-1)' }}>
            Yeni İmtahan
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="İmtahan adı">
            <input
              className="input"
              placeholder="Riyaziyyat sınaq imtahanı"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus
            />
          </Field>

          <Field label="Fənn">
            <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)} style={{ appearance: 'none' }}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Müddət (dəqiqə)">
            <input
              className="input"
              type="number"
              placeholder="60"
              value={form.duration}
              onChange={e => set('duration', e.target.value)}
              min="5"
            />
          </Field>

          {groups.length > 0 && (
            <Field label="Qrup (ixtiyari)">
              <select className="input" value={form.groupId} onChange={e => set('groupId', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Qrup seçilməyib</option>
                {groups.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name} — {g.subject}</option>
                ))}
              </select>
            </Field>
          )}

          {err && (
            <div style={{ fontSize: 12, color: '#ff4d6d', padding: '8px 12px', background: 'rgba(255,77,109,0.1)', borderRadius: 8 }}>
              {err}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving || !form.title.trim()}
            style={{
              padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 14,
              background: saving || !form.title.trim() ? 'rgba(79,135,255,0.35)' : 'linear-gradient(135deg, #4F87FF, #6C63FF)',
              border: 'none', color: '#fff',
              cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'Lexend Deca', sans-serif",
              boxShadow: '0 4px 20px rgba(79,135,255,0.3)',
              transition: 'opacity 0.2s',
            }}
          >
            {saving ? 'Yaradılır...' : '✓  İmtahan Yarat'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, children }: any) {
  return (
    <div>
      <label style={{
        fontSize: 10, color: 'var(--text-3)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.07em',
        display: 'block', marginBottom: 6,
      }}>{label}</label>
      {children}
    </div>
  )
}

function ExamCard({ exam, onActivate }: any) {
  const [activating, setActivating] = useState(false)

  const handleActivate = async () => {
    setActivating(true)
    try { await onActivate(exam.id) } catch {} finally { setActivating(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      style={{
        background: 'var(--bg-card)',
        border: `0.5px solid ${exam.status === 'active' ? 'rgba(0,201,167,0.2)' : 'var(--border-card)'}`,
        borderRadius: 16, padding: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, lineHeight: 1.3 }}>
            {exam.title || exam.name || 'İmtahan'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{exam.subject}</div>
        </div>
        <StatusPill status={exam.status} />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: exam.status === 'waiting' ? 12 : 0 }}>
        {exam.duration && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⏱ {exam.duration} dəq
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          📅 {fmt(exam.createdAt)}
        </span>
      </div>

      {exam.status === 'waiting' && (
        <button
          onClick={handleActivate}
          disabled={activating}
          style={{
            width: '100%', padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700,
            background: 'rgba(0,201,167,0.1)',
            border: '0.5px solid rgba(0,201,167,0.3)',
            color: '#00C9A7', cursor: activating ? 'not-allowed' : 'pointer',
            fontFamily: "'Lexend Deca', sans-serif",
            opacity: activating ? 0.6 : 1, transition: 'opacity 0.2s',
          }}
        >
          {activating ? 'Aktivləşdirilir...' : '▶  Aktivləşdir'}
        </button>
      )}

      {exam.status === 'active' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 10,
          background: 'rgba(0,201,167,0.06)', border: '0.5px solid rgba(0,201,167,0.15)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C9A7', boxShadow: '0 0 6px #00C9A7', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 11, color: '#00C9A7', fontWeight: 600 }}>Şagirdlər imtahana qoşula bilər</span>
        </div>
      )}
    </motion.div>
  )
}

const TABS = [
  { key: 'waiting',   label: 'Gözləyir'   },
  { key: 'active',    label: 'Aktiv'       },
  { key: 'completed', label: 'Tamamlandı'  },
] as const

export default function TeacherExams() {
  const [exams,      setExams]      = useState<any[]>([])
  const [groups,     setGroups]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab,        setTab]        = useState<'waiting' | 'active' | 'completed'>('waiting')

  useEffect(() => {
    Promise.all([apiGetMyExams(), apiGetMyGroups()])
      .then(([e, g]) => {
        setExams(Array.isArray(e) ? e : [])
        setGroups(Array.isArray(g) ? g : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleActivate = async (id: string) => {
    await apiActivateExam(id)
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e))
  }

  const counts = {
    waiting:   exams.filter(e => e.status === 'waiting').length,
    active:    exams.filter(e => e.status === 'active').length,
    completed: exams.filter(e => e.status === 'completed').length,
  }
  const filtered = exams.filter(e => e.status === tab)

  return (
    <div className="page-inner">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>
            İmtahanlar
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {exams.length} imtahan · {counts.active} aktiv
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
            border: 'none', color: '#fff', cursor: 'pointer',
            fontFamily: "'Lexend Deca', sans-serif",
            boxShadow: '0 2px 14px rgba(79,135,255,0.35)',
          }}
        >+ Yarat</button>
      </div>

      {/* Tab strip */}
      <div style={{
        display: 'flex', gap: 4, padding: 3,
        background: 'var(--bg-card)', borderRadius: 12,
        border: '0.5px solid var(--border-card)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 9,
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', border: 'none',
              background: tab === t.key ? '#4F87FF' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-3)',
              fontFamily: "'Lexend Deca', sans-serif",
            }}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span style={{
                marginLeft: 5, fontSize: 9,
                background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                padding: '2px 5px', borderRadius: 6,
              }}>{counts[t.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
            borderRadius: 16, padding: '44px 24px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>
            {tab === 'waiting' ? '📋' : tab === 'active' ? '▶️' : '✅'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>
            {tab === 'waiting'
              ? 'Gözləyən imtahan yoxdur'
              : tab === 'active'
              ? 'Aktiv imtahan yoxdur'
              : 'Tamamlanmış imtahan yoxdur'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
            {tab === 'waiting'
              ? 'Yeni imtahan yaradın. Hazır olduğunda aktivləşdirə bilərsiniz.'
              : tab === 'active'
              ? 'Gözləyən imtahanlardan birini aktivləşdirin.'
              : 'Tamamlanmış imtahan hələ yoxdur.'}
          </div>
          {tab === 'waiting' && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                marginTop: 16, padding: '9px 22px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: 'linear-gradient(135deg, #4F87FF, #6C63FF)',
                border: 'none', color: '#fff', cursor: 'pointer',
              }}
            >+ Yeni İmtahan Yarat</button>
          )}
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(e => (
            <ExamCard key={e.id} exam={e} onActivate={handleActivate} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateModal
            groups={groups}
            onClose={() => setShowCreate(false)}
            onCreate={(exam: any) => setExams(prev => [exam, ...prev])}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
