// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMyGroups, apiGetMyExams, apiGetSentPermissions } from '@/lib/api'
import { SPRING } from '@/lib/motion'
import { TeacherDashboardSkeleton } from '@/components/ui/Skeleton'

// ── helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10)
const isoDate = (ts: any): string | null => {
  if (!ts) return null
  if (ts?.seconds) return new Date(ts.seconds * 1000).toISOString().slice(0, 10)
  return String(ts).slice(0, 10)
}

// ── TodaySquare ───────────────────────────────────────────────────────────────
const DAYS_FULL_AZ  = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']
const MONTHS_AZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

function TodaySquare({ eventDates }: { eventDates: Record<string, string[]> }) {
  const [open, setOpen] = useState(false)
  const now      = new Date()
  const todayStr = today()
  const events   = eventDates[todayStr] ?? []
  const dayNum   = now.getDate()
  const dayName  = DAYS_FULL_AZ[now.getDay()]
  const month    = MONTHS_AZ[now.getMonth()]
  const year     = now.getFullYear()

  return (
    <div>
      {/* Date label above the box */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
        marginBottom: 8, letterSpacing: '0.02em',
      }}>
        {dayName}, {dayNum} {month} {year}
      </div>

      {/* Square widget */}
      <motion.div
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.97 }}
        style={{
          width: 88, height: 88, borderRadius: 18, cursor: 'pointer',
          background: open
            ? 'linear-gradient(135deg, #4F87FF, #6C63FF)'
            : 'var(--bg-card)',
          border: open
            ? '0.5px solid transparent'
            : '0.5px solid var(--border-card)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
          position: 'relative', overflow: 'hidden',
          boxShadow: open ? '0 4px 24px rgba(79,135,255,0.35)' : 'none',
          transition: 'background 0.25s, box-shadow 0.25s, border 0.25s',
          userSelect: 'none',
        }}
      >
        {/* Glow strip at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: open ? 'rgba(255,255,255,0.25)' : '#4F87FF',
          borderRadius: '18px 18px 0 0',
        }} />

        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800, fontSize: 32, lineHeight: 1,
          color: open ? '#fff' : '#4F87FF',
        }}>
          {dayNum}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          color: open ? 'rgba(255,255,255,0.75)' : 'var(--text-3)',
          textTransform: 'uppercase',
        }}>
          {month}
        </div>

        {/* Event badge */}
        {events.length > 0 && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 18, height: 18, borderRadius: '50%',
            background: open ? 'rgba(255,255,255,0.3)' : '#F4A261',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800,
            color: open ? '#fff' : '#fff',
          }}>
            {events.length}
          </div>
        )}
      </motion.div>

      {/* Events panel — slides down on click */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', marginTop: 10 }}
          >
            <div style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
              }}>
                Bu gün — {dayNum} {month}
              </div>

              {events.length === 0 ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>📭</div>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Bu gün üçün hadisə yoxdur</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map((type, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 10,
                      background: type === 'exam'
                        ? 'rgba(244,162,97,0.08)'
                        : 'rgba(79,135,255,0.08)',
                      border: `0.5px solid ${type === 'exam' ? 'rgba(244,162,97,0.2)' : 'rgba(79,135,255,0.2)'}`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: type === 'exam' ? 'rgba(244,162,97,0.15)' : 'rgba(79,135,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                      }}>
                        {type === 'exam' ? '📋' : '📝'}
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: type === 'exam' ? '#F4A261' : '#4F87FF',
                      }}>
                        {type === 'exam' ? 'Sınaq İmtahanı' : 'Tapşırıq'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color, sub }: any) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `0.5px solid ${color}22`,
      borderRadius: 14, padding: '14px 12px',
      display: 'flex', flexDirection: 'column', gap: 6,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 48, height: 48, background: `radial-gradient(circle at 100% 0%, ${color}18 0%, transparent 70%)` }} />
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── GroupCard ─────────────────────────────────────────────────────────────────
function GroupCard({ group, navigate }: any) {
  const PALETTE = ['#4F87FF', '#6C63FF', '#F4A261', '#00C9A7', '#A78BFA']
  const color = PALETTE[(group.name || '').charCodeAt(0) % PALETTE.length]
  const count = group.studentUids?.length ?? 0
  return (
    <div
      onClick={() => navigate('/teacher/groups')}
      style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)' }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 17, fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {(group.name || 'Q').charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {group.subject} · {count} şagird
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color }}>{count}</span>
        <span style={{ fontSize: 16, color: 'var(--text-3)' }}>›</span>
      </div>
    </div>
  )
}

// ── IndividualCard ────────────────────────────────────────────────────────────
function IndividualCard({ perm }: any) {
  const name = perm.receiverName ?? perm.studentName ?? 'Şagird'
  const subject = perm.subject ?? ''
  const PALETTE = ['#4F87FF', '#6C63FF', '#F4A261', '#00C9A7', '#A78BFA']
  const color = PALETTE[name.charCodeAt(0) % PALETTE.length]
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
      borderRadius: 14, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color,
        fontFamily: "'Lexend Deca', sans-serif",
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {subject} · Fərdi şagird
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
        background: 'rgba(0,201,167,0.1)', color: '#00C9A7',
      }}>
        {perm.status === 'granted' ? 'Aktiv' : 'Gözləyir'}
      </span>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ icon, title, desc, action, onAction }: any) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
      borderRadius: 16, padding: '36px 20px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>{desc}</div>
      {action && (
        <button onClick={onAction} style={{
          marginTop: 14, padding: '8px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700,
          background: '#4F87FF', border: 'none', color: '#fff', cursor: 'pointer',
        }}>{action}</button>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [groups,  setGroups]  = useState<any[]>([])
  const [exams,   setExams]   = useState<any[]>([])
  const [perms,   setPerms]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'groups' | 'individuals'>('groups')

  useEffect(() => {
    Promise.all([apiGetMyGroups(), apiGetMyExams(), apiGetSentPermissions()])
      .then(([g, e, p]) => {
        setGroups(Array.isArray(g) ? g : [])
        setExams(Array.isArray(e) ? e : [])
        setPerms(Array.isArray(p) ? p : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Derived stats
  const totalStudents = groups.reduce((s, g) => s + (g.studentUids?.length ?? 0), 0)
  const todayStr      = today()
  const todayExams    = exams.filter(e => isoDate(e.createdAt) === todayStr)
  const activeExams   = exams.filter(e => e.status === 'active')

  // Calendar event map: date → type[]
  const eventDates = useMemo(() => {
    const map: Record<string, string[]> = {}
    exams.forEach(e => {
      const d = isoDate(e.createdAt)
      if (d) { map[d] = [...(map[d] ?? []), 'exam'] }
    })
    return map
  }, [exams])

  // Individuals: perms not linked to any group
  const groupStudentUids = new Set(groups.flatMap(g => g.studentUids ?? []))
  const individuals = perms.filter(p => {
    const sid = p.studentUid ?? p.receiverUid ?? p.id
    return !groupStudentUids.has(sid)
  })

  if (loading) return <TeacherDashboardSkeleton />

  return (
    <div className="page-inner">

      {/* ── Daily stats ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Günlük statistika</span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
            {new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <StatCard
            icon="👥"
            value={loading ? '—' : totalStudents}
            label="Şagird"
            sub="Ümumi"
            color="#4F87FF"
          />
          <StatCard
            icon="📋"
            value={loading ? '—' : activeExams.length}
            label="Aktiv"
            sub="İmtahanlar"
            color="#00C9A7"
          />
          <StatCard
            icon="📝"
            value={loading ? '—' : todayExams.length || '—'}
            label="Bu gün"
            sub="Yaradıldı"
            color="#F4A261"
          />
        </div>
      </motion.div>

      {/* ── Today square ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.07 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Təqvim</span>
          <button
            onClick={() => navigate('/teacher/exams')}
            style={{ fontSize: 12, color: '#4F87FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            + İmtahan əlavə et
          </button>
        </div>
        <TodaySquare eventDates={eventDates} />
      </motion.div>

      {/* ── Groups / Individuals ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.14 }}
      >
        {/* Tab toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
          borderRadius: 14, padding: 4, marginBottom: 12,
        }}>
          {([
            { key: 'groups',      label: 'Qruplarım',  icon: '👥', count: groups.length      },
            { key: 'individuals', label: 'Fərdlər',    icon: '👤', count: individuals.length  },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 8px', borderRadius: 10, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.key ? '#4F87FF' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: "'Lexend Deca', sans-serif",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count > 0 && (
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 800,
                  background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', padding: 40 }}
            >
              <span className="spinner" style={{ width: 26, height: 26 }} />
            </motion.div>
          ) : tab === 'groups' ? (
            <motion.div key="groups" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={SPRING}>
              {groups.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="Hələ qrup yoxdur"
                  desc="Qruplar bölməsindən yeni qrup yaradıb şagirdlər əlavə edin"
                  action="+ Qrup yarat"
                  onAction={() => navigate('/teacher/groups')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groups.map((g, i) => (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ...SPRING }}
                    >
                      <GroupCard group={g} navigate={navigate} />
                    </motion.div>
                  ))}
                  <button
                    onClick={() => navigate('/teacher/groups')}
                    style={{
                      padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                      background: 'rgba(79,135,255,0.08)',
                      border: '0.5px solid rgba(79,135,255,0.2)',
                      color: '#4F87FF', cursor: 'pointer',
                      fontFamily: "'Lexend Deca', sans-serif",
                    }}
                  >
                    + Yeni Qrup Yarat
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="individuals" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={SPRING}>
              {individuals.length === 0 ? (
                <EmptyState
                  icon="👤"
                  title="Fərdi şagird yoxdur"
                  desc="Qrupa daxil olmayan şagirdlər burada görünür. Şagird sizə icazə verəndə buraya əlavə olunur."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {individuals.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ...SPRING }}
                    >
                      <IndividualCard perm={p} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  )
}
