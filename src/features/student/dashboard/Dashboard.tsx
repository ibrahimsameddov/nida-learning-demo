import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate }                              from 'react-router-dom'
import { useQuery }                      from '@tanstack/react-query'
import { motion, AnimatePresence }       from 'framer-motion'
import { ResponsiveGridLayout as RGLComponent, useContainerWidth } from 'react-grid-layout'
import { useAuth }                       from '@/features/auth/store/authContext'
import {
  apiGetMyStatistics,
  apiGetMyResults,
  apiGetIncomingParentRequests,
  apiRespondParentRequest,
} from '@/lib/api'
import type { FirestoreStats, FirestoreResult } from '@/types/models'
import { DashboardSkeleton }             from '@/components/ui/Skeleton'
import { useGamificationStore, getLevelInfo } from '@/stores/gamificationStore'
import { useDashboardLayout }            from './useDashboardLayout'
import { useHoverPrefetch, prefetch }    from '@/lib/performance'

const SPRING = { type: 'spring', stiffness: 180, damping: 18 }

const ALL_SUBJECTS = [
  { id: 'RIYAZIYYAT',      label: 'Riyaziyyat',     icon: '📐' },
  { id: 'AZERBAYCAN_DILI', label: 'Azərbaycan dili', icon: '📖' },
  { id: 'INGILIS_DILI',    label: 'İngilis dili',    icon: '🌍' },
  { id: 'FIZIKA',          label: 'Fizika',          icon: '⚡' },
  { id: 'KIMYA',           label: 'Kimya',           icon: '🧪' },
  { id: 'BIOLOGIYA',       label: 'Biologiya',       icon: '🌿' },
  { id: 'TARIX',           label: 'Tarix',           icon: '🏛️' },
  { id: 'COGRAFIYA',       label: 'Coğrafiya',       icon: '🌏' },
] as const

const DEFAULT_STATS: FirestoreStats = {
  totalTests: 0, averagePercent: 0, bestPercent: 0,
  streak: 0, currentStreak: 0, subjectStats: [],
  weeklyProgress: [], dailyProgress: [], recentSessions: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let current = 0
    const step = Math.max(1, Math.ceil(target / (duration / 16)))
    const t = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(current)
      if (current >= target) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [target, duration])
  return count
}

function computeWeakCount(subjectStats: { averagePercent: number }[]) {
  return subjectStats.filter(s => s.averagePercent > 0 && s.averagePercent < 60).length
}

// ─── Drag Handle ──────────────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div className="bento-handle" title="Sürükləyin" style={{
      position: 'absolute', top: 10, right: 10, zIndex: 20,
      width: 28, height: 28, borderRadius: 8,
      background: 'var(--bg-active)',
      border: '1px solid var(--border-hover)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'grab', color: 'var(--text-3)',
      transition: 'opacity 0.2s',
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="3.5" cy="3.5" r="1.5" fill="currentColor"/>
        <circle cx="8.5" cy="3.5" r="1.5" fill="currentColor"/>
        <circle cx="3.5" cy="8.5" r="1.5" fill="currentColor"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      </svg>
    </div>
  )
}

// ─── Parent Requests Banner ───────────────────────────────────────────────────

function ParentRequestsBanner() {
  const [requests,   setRequests]   = useState<any[]>([])
  const [open,       setOpen]       = useState(false)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    apiGetIncomingParentRequests()
      .then(r => setRequests(Array.isArray(r) ? r : []))
      .catch(() => {})
  }, [])

  const respond = async (id: string, accepted: boolean) => {
    setResponding(id)
    try {
      await apiRespondParentRequest(id, accepted)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch { /* ignore */ } finally { setResponding(null) }
  }

  if (requests.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
          background: 'var(--warning-bg)',
          border: '0.5px solid color-mix(in srgb, var(--warning) 30%, transparent)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>👨‍👩‍👧</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>Valideyn sorğusu var</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{requests.length} sorğu gözləyir</div>
        </div>
        <span style={{ fontSize: 14, color: 'var(--warning)' }}>›</span>
      </motion.div>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 16px' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }} transition={SPRING}
            style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '20px 20px 16px 16px', padding: 24 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--text-1)', marginBottom: 16 }}>
              👨‍👩‍👧 Valideyn Sorğuları
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map(req => (
                <div key={req.id} style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border-card)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{req.parentName || 'Valideyn'}</div>
                  {req.parentUniqueId && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>{req.parentUniqueId}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => respond(req.id, false)} disabled={responding === req.id}
                      style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'var(--danger-bg)', border: '0.5px solid color-mix(in srgb, var(--danger) 25%, transparent)', color: 'var(--danger)', cursor: 'pointer' }}>
                      Rədd et
                    </button>
                    <button onClick={() => respond(req.id, true)} disabled={responding === req.id}
                      style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'var(--success-bg)', border: '0.5px solid color-mix(in srgb, var(--success) 30%, transparent)', color: 'var(--success)', cursor: 'pointer' }}>
                      {responding === req.id ? '...' : '✓ Qəbul et'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {requests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--success)', fontWeight: 700 }}>✓ Bütün sorğular cavablandırıldı</div>
            )}
          </motion.div>
        </div>
      )}
    </>
  )
}

// ─── Hero Banner Widget ───────────────────────────────────────────────────────

function HeroBannerWidget({
  name, uid, totalTests, avgPct, editMode,
}: {
  name: string; uid: string; totalTests: number; avgPct: number; editMode: boolean
}) {
  const first = name.split(' ')[0]

  return (
    <div style={{
      height: '100%', position: 'relative', overflow: 'hidden',
      borderRadius: 20,
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent), color-mix(in srgb, var(--primary) 4%, transparent))',
      border: '1px solid var(--border-strong)',
      padding: '20px 20px 18px',
      boxShadow: 'var(--shadow-glow)',
    }}>
      {/* Shimmer top */}
      <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: 'var(--shimmer-line)', pointerEvents: 'none' }} />
      {/* Radial glow orb */}
      <div style={{
        position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 25%, transparent) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {editMode && <DragHandle />}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8, marginBottom: 4 }}>
            Xoş gəldin 👋
          </p>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 24,
            background: 'linear-gradient(135deg, var(--text-1) 0%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 2,
          }}>
            {first}!
          </h2>
          {uid && (
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)',
              background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 6,
              border: '0.5px solid var(--border)',
            }}>
              {uid}
            </span>
          )}
        </div>

        {/* Weekly goal ring */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="var(--bg-hover)" strokeWidth="5"/>
              <motion.circle
                cx="28" cy="28" r="22" fill="none"
                stroke="var(--primary)" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - Math.min(totalTests / 5, 1)) }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 4px var(--glow))' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                {Math.min(totalTests, 5)}
              </span>
              <span style={{ fontSize: 8, color: 'var(--text-3)', lineHeight: 1 }}>/5</span>
            </div>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, fontWeight: 600 }}>
            Həftəlik<br/>hədəf
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div style={{
        fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5,
        background: 'var(--bg-hover)', borderRadius: 10, padding: '8px 12px',
        border: '0.5px solid var(--border)',
      }}>
        {totalTests === 0
          ? '🚀 Bugün ilk testini həll et — böyük yolun başlangıcı!'
          : totalTests < 3
          ? `💪 ${totalTests} test etdin! Davam et, hər test sənə XP qazandırır.`
          : `🏆 Bu həftə ${totalTests} test etdin! Ortalaman: ${avgPct > 0 ? `${avgPct}%` : '—'}`
        }
      </div>
    </div>
  )
}

// ─── Level Widget ─────────────────────────────────────────────────────────────

function LevelWidget({ editMode }: { editMode: boolean }) {
  const xp     = useGamificationStore(s => s.xp)
  const streak = useGamificationStore(s => s.streak)
  const badges = useGamificationStore(s => s.badges)
  const info   = getLevelInfo(xp)

  return (
    <div className="hero-card" style={{ height: '100%', padding: '16px 20px', overflow: 'hidden', position: 'relative' }}>
      {editMode && <DragHandle />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `${info.color}20`, border: `2px solid ${info.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: info.color, fontFamily: 'var(--font-mono)',
        }}>
          {info.level}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{info.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {xp.toLocaleString()} XP · {info.xpForNext > 0 ? `${info.xpForNext} XP qalır` : 'MAX'}
          </div>
        </div>
        {streak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
            borderRadius: 20, background: 'var(--warning-bg)',
            border: '0.5px solid color-mix(in srgb, var(--warning) 30%, transparent)',
          }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
              {streak}
            </span>
          </div>
        )}
      </div>

      <div style={{ height: 6, borderRadius: 6, background: 'var(--bg-hover)', overflow: 'hidden', marginBottom: 10 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${info.progress}%` }}
          transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 6,
            background: `linear-gradient(90deg, ${info.color}, ${info.color}99)`,
            boxShadow: `0 0 8px ${info.color}50`,
          }}
        />
      </div>

      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {badges.slice(0, 5).map(b => (
            <span key={b.id} title={b.label} style={{ fontSize: 18, cursor: 'default' }}>{b.icon}</span>
          ))}
          {badges.length > 5 && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>+{badges.length - 5}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Stats Widget ─────────────────────────────────────────────────────────────

function StatCard({ value, label, icon, color, delay }: {
  value: number | string; label: string; icon: string; color: string; delay: number
}) {
  const numVal  = typeof value === 'number' ? value : 0
  const counted = useCountUp(numVal, 900)
  const display = typeof value === 'string' ? value : (numVal > 0 ? String(counted) : '—')

  return (
    <motion.div
      className="stat-mini"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ...SPRING }}
      style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 20%, ${color}12 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div className="stat-val" style={{ color }}>{display}</div>
      <div className="stat-lbl">{label}</div>
    </motion.div>
  )
}

function StatsWidget({ totalTests, avgPct, bestPct, editMode }: {
  totalTests: number; avgPct: number; bestPct: number; editMode: boolean
}) {
  return (
    <div style={{ height: '100%', position: 'relative', display: 'flex', gap: 10 }}>
      {editMode && <DragHandle />}
      <StatCard value={totalTests} label="Test"     icon="📝" color="var(--primary)"  delay={0.05} />
      <StatCard value={avgPct > 0  ? `${avgPct}%`  : '—'} label="Ortalama" icon="🎯" color="var(--success)"  delay={0.10} />
      <StatCard value={bestPct > 0 ? `${bestPct}%` : '—'} label="Ən Yaxşı" icon="🏆" color="var(--warning)"  delay={0.15} />
    </div>
  )
}

// ─── Subjects Widget ──────────────────────────────────────────────────────────

function SubjectsWidget({ subjectMap, weakSubjects, navigate, editMode }: {
  subjectMap: Record<string, number>;
  weakSubjects: Set<string>;
  navigate: (path: string) => void;
  editMode: boolean;
}) {
  const subjectsHover = useHoverPrefetch(() => prefetch.subjectTopics('all'))

  return (
    <div className="card" style={{ height: '100%', overflow: 'hidden auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {editMode && <DragHandle />}
      <div className="card-header">
        <span className="card-title">Fənlər</span>
        {weakSubjects.size > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-bg)', padding: '2px 8px', borderRadius: 6, border: '0.5px solid color-mix(in srgb, var(--warning) 25%, transparent)' }}>
            {weakSubjects.size} zəif fənn
          </span>
        )}
        <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.04 }} onClick={() => navigate('/subjects')} {...subjectsHover}>
          Hamısı →
        </motion.button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {ALL_SUBJECTS.slice(0, 4).map((s, i) => {
          const pct  = subjectMap[s.label] ?? 0
          const weak = weakSubjects.has(s.label)
          return (
            <motion.div
              key={s.id}
              className="subject-card"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.07 + i * 0.06, ...SPRING }}
              whileHover={{ scale: 1.015, x: 3 }}
              onClick={() => navigate('/subjects')}
              style={{ cursor: 'pointer', borderColor: weak ? 'color-mix(in srgb, var(--warning) 30%, transparent)' : undefined }}
            >
              <div className="subject-icon">{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.label}
                  {weak && <span style={{ fontSize: 10, color: 'var(--warning)' }}>↓ Zəif</span>}
                </div>
                {pct > 0 ? (
                  <div className="progress">
                    <motion.div
                      className={`progress-bar${pct < 60 ? ' danger' : ''}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Hələ test edilməyib</div>
                )}
              </div>
              {pct > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pct < 60 ? 'var(--warning)' : 'var(--text-2)', minWidth: 34, textAlign: 'right' }}>
                  {pct}%
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Results Widget ───────────────────────────────────────────────────────────

function ResultsWidget({ results, navigate, editMode }: {
  results: FirestoreResult[];
  navigate: (path: string) => void;
  editMode: boolean;
}) {
  return (
    <div className="card" style={{ height: '100%', overflow: 'hidden auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {editMode && <DragHandle />}
      <div className="card-header">
        <span className="card-title">Son Nəticələr</span>
        <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.04 }} onClick={() => navigate('/statistics')}>
          Statistika →
        </motion.button>
      </div>

      {results.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Hələ test həll etməmisiniz</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, textAlign: 'center' }}>İlk testinizi həll edib statistikanıza baxın!</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/subjects')}>İndi Başla →</button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {results.map((r, i) => {
            const pct        = Math.round(r.percent)
            const badgeBg    = pct >= 80 ? 'var(--success-bg)' : pct >= 60 ? 'var(--warning-bg)' : 'var(--danger-bg)'
            const badgeColor = pct >= 80 ? 'var(--success)'    : pct >= 60 ? 'var(--warning)'    : 'var(--danger)'
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, ...SPRING }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 12,
                  background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{r.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {r.completedAt ? new Date(r.completedAt).toLocaleDateString('az-AZ') : ''}
                  </div>
                </div>
                <span className="badge" style={{ background: badgeBg, color: badgeColor }}>{pct}%</span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Quick Nav Widget ─────────────────────────────────────────────────────────

const NAV_PREFETCH: Record<string, () => void> = {
  '/subjects':       () => prefetch.subjectTopics('all'),
  '/statistics':     () => prefetch.dashboard(''),
  '/messages':       () => prefetch.messages(''),
}

function NavItem({ item, index, navigate }: {
  item: { icon: string; label: string; path: string };
  index: number;
  navigate: (path: string) => void;
}) {
  const prefetchFn = useCallback(() => NAV_PREFETCH[item.path]?.(), [item.path])
  const hover      = useHoverPrefetch(prefetchFn)

  return (
    <motion.button
      key={item.path}
      className="btn btn-ghost"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, ...SPRING }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{ flexDirection: 'column', gap: 6, height: '100%', minHeight: 60, fontSize: 12 }}
      onClick={() => navigate(item.path)}
      {...hover}
    >
      <span style={{ fontSize: 22 }}>{item.icon}</span>
      {item.label}
    </motion.button>
  )
}

function QuickNavWidget({ navigate, editMode }: {
  navigate: (path: string) => void;
  editMode: boolean;
}) {
  const items = [
    { icon: '📝', label: 'İmtahanlar',      path: '/exams' },
    { icon: '🔁', label: 'Yanlış Suallar', path: '/wrong-questions' },
    { icon: '📚', label: 'Tapşırıqlar',     path: '/homework' },
    { icon: '📊', label: 'Statistika',       path: '/statistics' },
  ]

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {editMode && <DragHandle />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, height: '100%' }}>
        {items.map((item, i) => (
          <NavItem key={item.path} item={item} index={i} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

// ─── Edit Mode Bar ────────────────────────────────────────────────────────────

function EditBar({ saveStatus, onReset, onDone }: {
  saveStatus: string; onReset: () => void; onDone: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderRadius: 14,
        background: 'var(--bg-active)',
        border: '1px solid var(--border-focus)',
        boxShadow: '0 0 20px var(--glow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>✏️</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Düzəliş rejimi</span>
        {saveStatus === 'saving' && (
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>💾 saxlanır...</span>
        )}
        {saveStatus === 'saved' && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: 'var(--success)' }}>✓ saxlandı</motion.span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onReset}
          style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', background: 'none', border: '0.5px solid var(--border)', padding: '5px 10px', borderRadius: 8, cursor: 'pointer' }}
        >
          Sıfırla
        </button>
        <button
          onClick={onDone}
          className="btn btn-primary btn-sm"
          style={{ fontSize: 12, padding: '6px 14px' }}
        >
          Bitir ✓
        </button>
      </div>
    </motion.div>
  )
}

// ─── Edit FAB ─────────────────────────────────────────────────────────────────

function EditFAB({ editMode, onToggle }: { editMode: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bnav-h) + 16px)',
        right: 16,
        width: 42, height: 42,
        borderRadius: 21,
        background: editMode ? 'var(--primary)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: editMode ? 'var(--text-on-accent)' : 'var(--text-2)',
        cursor: 'pointer', fontSize: 17,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 45,
        boxShadow: editMode ? 'var(--shadow-btn)' : 'var(--shadow-card)',
        backdropFilter: 'blur(16px)',
        transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
      }}
      title={editMode ? 'Düzəlişi bitir' : 'Düzəliş rejimi'}
    >
      {editMode ? '✓' : '⊞'}
    </motion.button>
  )
}

// ─── Inner Dashboard (rendered after data loads) ───────────────────────────────

function DashboardInner({
  stats, results, userProfile,
}: {
  stats: FirestoreStats
  results: FirestoreResult[]
  userProfile: any
}) {
  const navigate      = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const { width: gridWidth, containerRef: gridRef } = useContainerWidth({ initialWidth: 360 })

  const weakSubjectSet = useMemo(() => {
    const set = new Set<string>()
    ;(stats.subjectStats ?? []).forEach(s => {
      if ((s as any).averagePercent > 0 && (s as any).averagePercent < 60) {
        set.add((s as any).subject)
      }
    })
    return set
  }, [stats.subjectStats])

  const weakCount = weakSubjectSet.size
  const { layouts, saveStatus, onLayoutChange, resetLayout } = useDashboardLayout(weakCount)

  const name      = userProfile?.displayName || userProfile?.fullName || 'Şagird'
  const uid       = userProfile?.uniqueId ?? ''
  const avgPct    = Math.round(stats.averagePercent)
  const totalTests = stats.totalTests
  const bestPct   = Math.round(stats.bestPercent)

  const subjectMap: Record<string, number> = {}
  ;(stats.subjectStats ?? []).forEach((s: any) => {
    if (s?.subject) subjectMap[s.subject] = Math.round(s.averagePercent ?? 0)
  })

  const recentResults = results.slice(0, 5)

  return (
    <div className="page-inner anim-fade-up">

      <ParentRequestsBanner />

      <AnimatePresence>
        {editMode && (
          <EditBar
            saveStatus={saveStatus}
            onReset={resetLayout}
            onDone={() => setEditMode(false)}
          />
        )}
      </AnimatePresence>

      <div ref={gridRef}>
      <RGLComponent
        className={`bento-grid${editMode ? ' bento-edit' : ''}`}
        layouts={layouts}
        width={gridWidth}
        breakpoints={{ lg: 768, sm: 0 }}
        cols={{ lg: 12, sm: 1 }}
        rowHeight={44}
        margin={[10, 10]}
        draggableHandle=".bento-handle"
        isDraggable={editMode}
        isResizable={false}
        onLayoutChange={onLayoutChange}
        useCSSTransforms
      >
        <div key="hero"      style={{ overflow: 'hidden' }}>
          <HeroBannerWidget name={name} uid={uid} totalTests={totalTests} avgPct={avgPct} editMode={editMode} />
        </div>
        <div key="level"     style={{ overflow: 'hidden' }}>
          <LevelWidget editMode={editMode} />
        </div>
        <div key="stats"     style={{ overflow: 'hidden' }}>
          <StatsWidget totalTests={totalTests} avgPct={avgPct} bestPct={bestPct} editMode={editMode} />
        </div>
        <div key="subjects"  style={{ overflow: 'hidden' }}>
          <SubjectsWidget subjectMap={subjectMap} weakSubjects={weakSubjectSet} navigate={navigate} editMode={editMode} />
        </div>
        <div key="results"   style={{ overflow: 'hidden' }}>
          <ResultsWidget results={recentResults} navigate={navigate} editMode={editMode} />
        </div>
        <div key="quick-nav" style={{ overflow: 'hidden' }}>
          <QuickNavWidget navigate={navigate} editMode={editMode} />
        </div>
      </RGLComponent>
      </div>

      <EditFAB editMode={editMode} onToggle={() => setEditMode(e => !e)} />
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { userProfile } = useAuth()
  const userId          = userProfile?.id as string | undefined

  const { data: stats = DEFAULT_STATS, isLoading: statsLoading } = useQuery({
    queryKey:  ['my-statistics', userId],
    queryFn:   apiGetMyStatistics,
    staleTime: 0, gcTime: 0, enabled: !!userId,
  })

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey:  ['my-results', userId],
    queryFn:   apiGetMyResults,
    staleTime: 0, gcTime: 0, enabled: !!userId,
  })

  if (statsLoading || resultsLoading) return <DashboardSkeleton />

  return <DashboardInner stats={stats} results={results as FirestoreResult[]} userProfile={userProfile} />
}
