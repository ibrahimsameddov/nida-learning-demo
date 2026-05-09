import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStatsData, useERI, useKnowledgeGraph } from '@/hooks/useAnalytics'

import ERIWidget          from './components/ERIWidget'
import ERIBreakdownCard   from './components/ERIBreakdownCard'
import ERIGauge           from './components/ERIGauge'
import PredictivePanel    from './components/PredictivePanel'
import WeeklyHeatmap      from './components/WeeklyHeatmap'
import SpacedRepQueue     from './components/SpacedRepQueue'
import ForgettingCurve    from './components/ForgettingCurve'
import KnowledgeGraph     from './components/KnowledgeGraph'
import CognitiveLoadBar   from './components/CognitiveLoadBar'
import DKIndexCard        from './components/DKIndexCard'
import LearningProfileCard from './components/LearningProfileCard'
import CohortChart        from './components/CohortChart'
import LearningPassport   from './components/LearningPassport'
import MilestoneTimeline  from './components/MilestoneTimeline'

const TABS = [
  { id: 'overview',   icon: '📊', label: 'Ümumi'    },
  { id: 'eri',        icon: '🎯', label: 'ERI'      },
  { id: 'knowledge',  icon: '🕸️', label: 'Bilik'    },
  { id: 'spaced',     icon: '🔄', label: 'Təkrar'   },
  { id: 'cognitive',  icon: '🧠', label: 'Kognitiv' },
  { id: 'cohort',     icon: '🏆', label: 'Reytinq'  },
  { id: 'passport',   icon: '📜', label: 'Pasport'  },
] as const

type TabId = typeof TABS[number]['id']
const PAGE_SPRING = { type: 'spring', stiffness: 280, damping: 26 }

// ── Summary strip ──────────────────────────────────────────────────────────────

function SummaryStrip() {
  const { stats, isLoading } = useStatsData()
  const { eri }              = useERI()
  if (isLoading || !stats) return null

  const items = [
    { label: 'Test',   value: String(stats.totalTests ?? 0),          color: 'var(--primary)' },
    { label: 'Ort.',   value: `${stats.averagePercent ?? 0}%`,         color: stats.averagePercent >= 75 ? 'var(--success)' : stats.averagePercent >= 55 ? 'var(--warning)' : 'var(--danger)' },
    { label: 'ERI',    value: String(eri),                             color: 'var(--accent)' },
    { label: 'Streak', value: `${stats.currentStreak ?? 0}🔥`,        color: 'var(--warning)' },
  ]

  return (
    <div style={{
      display: 'flex', background: 'var(--bg-elevated)',
      borderRadius: 14, border: '0.5px solid var(--border-card)',
      overflow: 'hidden', marginBottom: 14,
    }}>
      {items.map((item, i) => (
        <div key={item.label} style={{
          flex: 1, textAlign: 'center', padding: '10px 8px',
          borderRight: i < items.length - 1 ? '0.5px solid var(--border)' : 'none',
        }}>
          <p style={{ fontSize: 16, fontWeight: 900, color: item.color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{item.value}</p>
          <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 3, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{item.label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Overview tab ───────────────────────────────────────────────────────────────

function OverviewTab() {
  const { stats } = useStatsData()
  const sessions  = stats?.recentSessions ?? []
  const subjects  = stats?.subjectStats   ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ERIWidget />
      <WeeklyHeatmap data={stats?.dailyProgress ?? []} />

      {subjects.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...PAGE_SPRING }}>
          <p className="card-title" style={{ marginBottom: 16 }}>Fənn Analizi</p>
          {subjects.map((s, i) => (
            <div key={s.subject} style={{ marginBottom: i < subjects.length - 1 ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{s.subject}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{s.totalTests} test</span>
                  <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.averagePercent >= 75 ? 'var(--success)' : s.averagePercent >= 55 ? 'var(--warning)' : 'var(--danger)' }}>{s.averagePercent}%</span>
                </div>
              </div>
              <div className="progress" style={{ height: 5 }}>
                <motion.div className="progress-bar"
                  initial={{ width: 0 }} animate={{ width: `${s.averagePercent}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.08 }}
                  style={{ background: s.averagePercent >= 75 ? 'var(--success)' : s.averagePercent >= 55 ? 'var(--warning)' : 'var(--danger)' }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {sessions.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...PAGE_SPRING }}>
          <p className="card-title" style={{ marginBottom: 14 }}>Son Fəaliyyət</p>
          {sessions.slice(0, 5).map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < 4 && i < sessions.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{s.subject}</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.totalQuestions} sual · {Math.round((s.durationSeconds ?? 0) / 60)} dəq</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.accuracy >= 75 ? 'var(--success)' : s.accuracy >= 55 ? 'var(--warning)' : 'var(--danger)' }}>
                {Math.round(s.accuracy)}%
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ── ERI tab ────────────────────────────────────────────────────────────────────

function ERITab() {
  const { eri } = useERI()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <motion.div className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={PAGE_SPRING} style={{ padding: '28px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          İmtahana Hazırlıq İndeksi
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <ERIGauge score={eri} size={200} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
          ERI ümumi ortalamanı, öyrənmə sürətini, fənn balansını, 7 günlük trendi və streak-i nəzərə alaraq hesablanır.
        </p>
      </motion.div>
      <ERIBreakdownCard />
      <PredictivePanel />
    </div>
  )
}

// ── Knowledge tab ──────────────────────────────────────────────────────────────

function KnowledgeTab() {
  const { weakNodes } = useKnowledgeGraph()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <KnowledgeGraph />
      {weakNodes.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...PAGE_SPRING }}>
          <p className="card-title" style={{ marginBottom: 14 }}>Zəif Mövzular</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weakNodes.slice(0, 6).map((node, i) => (
              <motion.div key={node.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,77,109,0.06)', border: '0.5px solid rgba(255,77,109,0.2)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(255,77,109,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'var(--danger)', fontFamily: 'var(--font-heading)' }}>
                  {node.masteryLevel}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{node.topicName}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{node.subject}</p>
                </div>
                <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700 }}>Zəif</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Tab components (trivial) ───────────────────────────────────────────────────

function SpacedTab()   { return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><SpacedRepQueue /><ForgettingCurve /></div> }
function CognitiveTab(){ return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><CognitiveLoadBar /><DKIndexCard /><LearningProfileCard /></div> }
function CohortTab()   { return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><CohortChart /></div> }
function PassportTab() { return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><LearningPassport /><MilestoneTimeline /></div> }

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const CONTENT: Record<TabId, React.ReactNode> = {
    overview:  <OverviewTab />,
    eri:       <ERITab />,
    knowledge: <KnowledgeTab />,
    spaced:    <SpacedTab />,
    cognitive: <CognitiveTab />,
    cohort:    <CohortTab />,
    passport:  <PassportTab />,
  }

  return (
    <div className="page-inner">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: 3 }}>
          Statistika
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Analitik irəliləyiş paneli</p>
      </div>

      <SummaryStrip />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
              background: activeTab === tab.id ? 'var(--bg-active)' : 'rgba(255,255,255,0.04)',
              border: activeTab === tab.id ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-2)',
              boxShadow: activeTab === tab.id ? '0 0 10px var(--glow-sm)' : 'none',
            }}
          >
            <span style={{ marginRight: 5 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {CONTENT[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
