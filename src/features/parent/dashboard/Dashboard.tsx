// @ts-nocheck
import { useState } from 'react'
import { useNavigate }              from 'react-router-dom'
import { motion, AnimatePresence }  from 'framer-motion'
import { useAuth }                  from '@/features/auth/store/authContext'
import { useChildrenSummary }       from '@/hooks/useFamilyLearning'
import { useWeeklyReports }         from '@/hooks/useFamilyLearning'
import { ParentDashboardSkeleton }  from '@/components/ui/Skeleton'
import ChildSummaryCard             from '../components/ChildSummaryCard'
import WeeklyReportCard             from '../components/WeeklyReportCard'
import LiveSessionWatcher           from '../components/LiveSessionWatcher'
import ParentAlerts, { buildAlertsFromStats } from '../components/ParentAlerts'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

// ── Child reports section ──────────────────────────────────────────────────────

function ChildReports({ child }: { child: any }) {
  const { reports, isLoading, markRead } = useWeeklyReports(child.id ?? child.uid ?? '')
  if (isLoading) return <div className="skeleton" style={{ height: 80, borderRadius: 14 }} />
  if (!reports.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Həftəlik Hesabatlar
      </p>
      {reports.slice(0, 3).map(r => (
        <WeeklyReportCard key={r.id} report={r} onMarkRead={markRead} />
      ))}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { userProfile }                      = useAuth()
  const navigate                             = useNavigate()
  const { data: children = [], isLoading }   = useChildrenSummary()
  const [selectedIdx, setSelectedIdx]        = useState(0)
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const parentName  = (userProfile as any)?.fullName || userProfile?.displayName || 'Valideyn'
  const parentFirst = parentName.split(' ')[0]
  const child       = children[selectedIdx] ?? null

  const alerts = child
    ? buildAlertsFromStats(child.stats, child.fullName ?? child.name ?? '').filter(a => !dismissedAlerts.includes(a.id))
    : []

  if (isLoading) {
    return (
      <div className="page-inner">
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 3 }}>Valideyn Paneli</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
            Salam, {parentFirst}!
          </h1>
        </div>
        <ParentDashboardSkeleton />
      </div>
    )
  }

  if (!children.length) {
    return (
      <div className="page-inner">
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 3 }}>Valideyn Paneli</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
            Salam, {parentFirst}!
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className="card"
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <p style={{ fontSize: 48, marginBottom: 14 }}>👨‍👩‍👧</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            Övlad əlavə edilməyib
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 20 }}>
            Övladınızın öyrənmə irəliləyişini izləmək üçün hesabını bağlayın
          </p>
          <button
            onClick={() => navigate('/onboarding/parent')}
            className="btn btn-primary"
            style={{ fontSize: 14, padding: '12px 28px' }}
          >
            + Övlad Əlavə Et
          </button>
        </motion.div>
      </div>
    )
  }

  const initials = (child?.fullName ?? child?.name ?? '?')
    .split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()

  return (
    <div className="page-inner">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 3, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Valideyn Paneli
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
            Salam, {parentFirst}!
          </h1>
        </div>
        {children.length < 5 && (
          <button
            onClick={() => navigate('/onboarding/parent')}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
              color: 'var(--text-2)', cursor: 'pointer', marginTop: 4,
            }}
          >
            + Övlad
          </button>
        )}
      </div>

      {/* Child selector tabs */}
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
          {children.map((c: any, i: number) => (
            <button
              key={c.id ?? i}
              onClick={() => setSelectedIdx(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
                background: i === selectedIdx ? 'var(--bg-active)' : 'rgba(255,255,255,0.04)',
                border: i === selectedIdx ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
                color: i === selectedIdx ? 'var(--primary)' : 'var(--text-2)',
              }}
            >
              {(c.fullName ?? c.name ?? 'Şagird').split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Child content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* Summary card */}
          <ChildSummaryCard child={child} />

          {/* Alerts */}
          {alerts.length > 0 && (
            <ParentAlerts
              alerts={alerts}
              onDismiss={id => setDismissedAlerts(prev => [...prev, id])}
            />
          )}

          {/* Live session watcher */}
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Canlı İzləmə
            </p>
            <LiveSessionWatcher
              childUid={child?.id ?? child?.uid ?? ''}
              childName={child?.fullName ?? child?.name ?? 'Şagird'}
            />
          </div>

          {/* Weekly reports */}
          {child && <ChildReports child={child} />}

          {/* Quick nav */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <NavTile icon="📊" label="Statistika" onClick={() => navigate('/parent/statistics')} />
            <NavTile icon="📋" label="Tapşırıqlar" onClick={() => navigate('/parent/children')} />
            <NavTile icon="👤" label="Müəllimlər" onClick={() => navigate('/parent/teachers')} />
            <NavTile icon="💬" label="Mesajlar" onClick={() => navigate('/parent/messages')} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function NavTile({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
        background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{label}</span>
    </motion.button>
  )
}
