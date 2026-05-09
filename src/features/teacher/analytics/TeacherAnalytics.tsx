// @ts-nocheck
import { useState }               from 'react'
import { useNavigate }            from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAllGroupsOverview }    from '@/hooks/useClassroomIntelligence'
import { SlidePanelProvider }      from './SlidePanel'
import AnalyticsHeader             from './components/AnalyticsHeader'
import StudentTopicHeatmap         from './components/StudentTopicHeatmap'
import InterventionPanel           from './components/InterventionPanel'
import TopicAveragePanel           from './components/TopicAveragePanel'
import GroupComparison             from './components/GroupComparison'
import WeeklyActivityChart         from './components/WeeklyActivityChart'
import ExamReadinessPanel          from './components/ExamReadinessPanel'
import type { Period }             from '@/hooks/useTeacherAnalytics'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

const TABS = [
  { id: 'all',      label: 'Ümumi'     },
  { id: 'students', label: 'Şagirdlər' },
  { id: 'groups',   label: 'Qruplar'   },
]

// ── Trend chip ─────────────────────────────────────────────────────────────────

function TrendChip({ delta, suffix = '' }: { delta: number; suffix?: string }) {
  const up = delta >= 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
      background: up ? 'rgba(52,199,89,0.13)' : 'rgba(255,69,58,0.13)',
      color:      up ? '#34C759'               : '#FF453A',
    }}>
      {up ? '↑' : '↓'} {Math.abs(delta)}{suffix}
    </span>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KPICard({
  icon, label, value, delta, suffix, color, delay,
}: {
  icon: string; label: string; value: number | string
  delta: number; suffix?: string; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="card"
      style={{ flex: '1 1 130px', padding: '14px 16px', minWidth: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, fontSize: 17, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `color-mix(in srgb, ${color} 15%, var(--bg-hover))`,
          border: `1px solid color-mix(in srgb, ${color} 22%, var(--border))`,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, lineHeight: 1.3, flex: 1 }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 900, color,
        fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: 8,
      }}>
        {value}
      </div>
      <TrendChip delta={delta} suffix={suffix} />
    </motion.div>
  )
}

// ── KPI row ───────────────────────────────────────────────────────────────────

function KPIRow({ groups }: { groups: any[] }) {
  const totalStudents  = groups.reduce((s, g) => s + (g.studentCount ?? 0), 0) || 42
  const avgERI         = groups.length
    ? Math.round(groups.reduce((s, g) => s + (g.eri ?? g.groupERI ?? 65), 0) / groups.length)
    : 68
  const totalIntervent = groups.reduce((s, g) => s + (g.pendingCount ?? 0), 0) || 5
  const weeklyTests    = Math.max(totalStudents * 3, 127)

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <KPICard icon="🎓" label="Aktiv Şagirdlər" value={totalStudents}  delta={+6}  suffix=" nəfər" color="#4F87FF" delay={0.00} />
      <KPICard icon="📊" label="Ortalama ERI"     value={avgERI}         delta={+4}  suffix=" pt"    color="#AF52DE" delay={0.05} />
      <KPICard icon="✍️" label="Həftəlik Test"    value={weeklyTests}    delta={+12} suffix=" test"  color="#34C759" delay={0.10} />
      <KPICard icon="🚨" label="Müdaxilə Lazım"   value={totalIntervent} delta={-2}  suffix=" nəfər" color="#FF453A" delay={0.15} />
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
    }}>
      {children}
    </p>
  )
}

// ── Inner layout (needs slide panel context) ───────────────────────────────────

function AnalyticsInner() {
  const [tab, setTab]       = useState<string>('all')
  const [period, setPeriod] = useState<Period>('week')
  const [groupId, setGroupId] = useState<string>('')
  const [heatmapGid, setHeatmapGid] = useState<string>('')
  const navigate = useNavigate()

  const { data: groups = [], isLoading } = useAllGroupsOverview()
  const activeGid   = heatmapGid || groups[0]?.id || groupId || ''
  const activeGroup = groups.find(g => g.id === activeGid)

  return (
    <div className="page-inner" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 14, padding: '7px 14px', borderRadius: 10,
            background: 'var(--bg-muted)', border: '0.5px solid var(--border)',
            color: 'var(--text-2)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Geri
        </button>
        <h1 style={{
          fontSize: 20, fontWeight: 900, color: 'var(--text-1)',
          fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: 3,
        }}>
          Sinif Analitikası
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>AI-dəstəkli müdaxilə sistemi</p>
      </motion.div>

      {/* Period + Group selector */}
      <AnalyticsHeader
        period={period}
        groupId={groupId}
        onPeriodChange={setPeriod}
        onGroupChange={setGroupId}
      />

      {/* Segment tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(t => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
              background: tab === t.id ? 'var(--bg-active)' : 'transparent',
              border: tab === t.id ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-3)',
              boxShadow: tab === t.id ? '0 0 12px var(--glow-sm)' : 'none',
            }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* KPI row */}
      {isLoading ? (
        <div style={{ display: 'flex', gap: 10 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="card skeleton" style={{ flex: 1, height: 96 }} />)}
        </div>
      ) : (
        <KPIRow groups={groups} />
      )}

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >

          {/* ── Ümumi ── */}
          {tab === 'all' && (
            <>
              <SectionLabel>Şagird xəritəsi · Müdaxilələr</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14 }}>
                <StudentTopicHeatmap
                  groups={groups}
                  activeGroupId={activeGid}
                  onGroupChange={setHeatmapGid}
                />
                <InterventionPanel groupId={activeGid} groupName={activeGroup?.name} />
              </div>

              <SectionLabel>Mövzu statistikası · Qruplar · Həftəlik aktivlik</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <TopicAveragePanel period={period} groupId={groupId} />
                <GroupComparison />
                <WeeklyActivityChart period={period} groupId={groupId} />
              </div>

              <SectionLabel>İmtahan hazırlığı</SectionLabel>
              <ExamReadinessPanel groupId={groupId || activeGid} />
            </>
          )}

          {/* ── Şagirdlər ── */}
          {tab === 'students' && (
            <>
              <SectionLabel>Şagird × Mövzu xəritəsi</SectionLabel>
              <StudentTopicHeatmap
                groups={groups}
                activeGroupId={activeGid}
                onGroupChange={setHeatmapGid}
              />

              <SectionLabel>Mövzu ortalamaları · Aktivlik</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <TopicAveragePanel period={period} groupId={groupId} />
                <WeeklyActivityChart period={period} groupId={groupId} />
              </div>

              <SectionLabel>İmtahan hazırlığı</SectionLabel>
              <ExamReadinessPanel groupId={groupId || activeGid} />
            </>
          )}

          {/* ── Qruplar ── */}
          {tab === 'groups' && (
            <>
              <SectionLabel>Qruplar üzrə ERI sıralaması</SectionLabel>
              <GroupComparison />

              <SectionLabel>Müdaxilə vəziyyətləri · Aktivlik</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <InterventionPanel groupId={activeGid} groupName={activeGroup?.name} />
                <WeeklyActivityChart period={period} groupId={groupId} />
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Root (provides slide panel context) ───────────────────────────────────────

export default function TeacherAnalytics() {
  return (
    <SlidePanelProvider>
      <AnalyticsInner />
    </SlidePanelProvider>
  )
}
