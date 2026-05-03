import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiGetMyStatistics, apiGetMyResults } from '@/lib/api'
import type { FirestoreStats, FirestoreResult } from '@/types/models'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/store/authContext'
import {
  pctColor, RadarChart, SubjectBarChart, AreaTrendChart,
  ActivityHeatmap, ScoreHistoryChart, AccuracyDonut,
  ConsistencyMeter, RecentSessionsTable, StrengthWeaknessCard,
  TopicBestResults,
} from './charts'

const SUBJECT_ICONS: Record<string, string> = {
  'Riyaziyyat': '📐', 'Azərbaycan dili': '📖', 'İngilis dili': '🌍',
  'Rus dili': '🇷🇺', 'Fizika': '⚡', 'Kimya': '🧪',
  'Biologiya': '🧬', 'Tarix': '🏛️', 'Coğrafiya': '🗺️',
}
const SUBJECT_ROUTES: Record<string, string> = { 'Riyaziyyat': '/subjects/math' }
const DEFAULT_STATS: FirestoreStats = {
  totalTests: 0, averagePercent: 0, bestPercent: 0,
  streak: 0, currentStreak: 0, subjectStats: [],
  weeklyProgress: [], dailyProgress: [], recentSessions: [],
}
const TIME_TABS = [
  { id: 'umumi', label: 'Ümumi' },
  { id: 'heftelik', label: 'Həftəlik' },
  { id: 'aylig', label: 'Aylıq' },
] as const
type TabId = typeof TIME_TABS[number]['id']

function getTabPts(stats: FirestoreStats, tab: TabId) {
  return tab === 'heftelik' ? stats.weeklyProgress.slice(-7)
       : tab === 'aylig'    ? stats.weeklyProgress.slice(-30)
       : stats.weeklyProgress
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Lexend Deca,sans-serif', marginBottom: 12 }}>{children}</p>
}

// ── Subject Detail View ────────────────────────────────────────────────────────
function SubjectDetail({ subject, results, onBack }: {
  subject: FirestoreStats['subjectStats'][0]
  results: FirestoreResult[]
  onBack: () => void
}) {
  const icon  = SUBJECT_ICONS[subject.subject] ?? '📚'
  const pct   = Math.round(subject.averagePercent)
  const color = pctColor(pct)
  const route = SUBJECT_ROUTES[subject.subject] ?? '/subjects'
  const navigate = useNavigate()

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{
          padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border-card)',
          background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 12,
          fontWeight: 600, cursor: 'pointer',
        }}>← Geri</button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Lexend Deca,sans-serif' }}>
            {icon} {subject.subject}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{subject.totalTests} test · Ortalama <span style={{ color, fontWeight: 700 }}>{pct}%</span></p>
        </div>
      </div>

      {/* Topic best results */}
      <div className="card" style={{ padding: '16px' }}>
        <SectionTitle>🏆 Mövzu üzrə Ən Yüksək Nəticələr</SectionTitle>
        <TopicBestResults results={results} subject={subject.subject} />
      </div>

      {/* Strength/Weakness 4 cards */}
      <div className="card" style={{ padding: '16px' }}>
        <SectionTitle>📊 Güclü və Zəif Tərəflər</SectionTitle>
        <StrengthWeaknessCard results={results} subject={subject.subject} />
      </div>

      {/* Score history */}
      <div className="card" style={{ padding: '16px' }}>
        <SectionTitle>📈 Performans Tarixi</SectionTitle>
        <ScoreHistoryChart results={results} subject={subject.subject} />
      </div>

      {/* Accuracy donut + consistency side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card" style={{ padding: '16px' }}>
          <SectionTitle>🎯 Cavab Analizi</SectionTitle>
          <AccuracyDonut results={results} subject={subject.subject} />
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <SectionTitle>⚖️ Sabitlik</SectionTitle>
          <ConsistencyMeter results={results} subject={subject.subject} />
          <div style={{ marginTop: 16, padding: '10px', background: 'var(--bg-muted)', borderRadius: 8 }}>
            <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Toplam Test</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{subject.totalTests}</p>
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="card" style={{ padding: '16px' }}>
        <SectionTitle>🗂️ Son Test Nəticələri</SectionTitle>
        <RecentSessionsTable results={results} subject={subject.subject} />
      </div>

      {/* Practice button */}
      <button onClick={() => navigate(route)} style={{
        width: '100%', padding: '12px', borderRadius: 12,
        background: color, border: 'none', color: '#fff',
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
        boxShadow: `0 4px 16px ${color}55`,
      }}>
        📚 Bu Fəndə Çalış
      </button>
    </div>
  )
}

// ── Overview View ──────────────────────────────────────────────────────────────
function Overview({ stats, results, onSelectSubject }: {
  stats: FirestoreStats
  results: FirestoreResult[]
  onSelectSubject: (s: FirestoreStats['subjectStats'][0]) => void
}) {
  const [activeTab, setActiveTab] = useState<TabId>('umumi')
  const trendPts   = getTabPts(stats, activeTab)
  const streakVal  = stats.streak ?? stats.currentStreak ?? 0
  const sortedSubj = useMemo(() => [...(stats.subjectStats ?? [])].sort((a, b) => b.averagePercent - a.averagePercent), [stats.subjectStats])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Lexend Deca,sans-serif', marginBottom: 2 }}>Statistikam</h2>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Time Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-muted)', borderRadius: 12, padding: 4 }}>
        {TIME_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '7px 6px', borderRadius: 9, border: 'none',
            fontFamily: 'Lexend Deca,sans-serif', fontWeight: 600, fontSize: 11, cursor: 'pointer',
            transition: 'all 0.25s',
            background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
            color: activeTab === tab.id ? '#fff' : 'var(--text-tertiary)',
            boxShadow: activeTab === tab.id ? 'var(--shadow-btn)' : 'none',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Hero strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {[
          { label: 'Ortalama', value: stats.averagePercent > 0 ? `${Math.round(stats.averagePercent)}%` : '—', color: 'var(--color-success)' },
          { label: 'Testlər',  value: stats.totalTests > 0 ? String(stats.totalTests) : '—',               color: 'var(--text-primary)' },
          { label: 'Seriya',   value: streakVal > 0 ? `${streakVal}🔥` : '—',                              color: 'var(--color-warning)' },
          { label: 'Rekord',   value: stats.bestPercent > 0 ? `${Math.round(stats.bestPercent)}%` : '—',   color: 'var(--color-primary)' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '12px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: item.color, fontFamily: 'monospace', lineHeight: 1.1, marginBottom: 3 }}>{item.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Diagram 1: Radar */}
      {sortedSubj.length >= 3 && (
        <div className="card" style={{ padding: '16px' }}>
          <SectionTitle>🕸️ Fənn Balansı — Radar Diaqramı</SectionTitle>
          <RadarChart subjects={sortedSubj} />
        </div>
      )}

      {/* Diagram 2: Horizontal bar chart */}
      {sortedSubj.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <SectionTitle>📊 Fənn üzrə Müqayisə</SectionTitle>
          <SubjectBarChart subjects={sortedSubj} />
        </div>
      )}

      {/* Diagram 3: Trend area chart */}
      {trendPts.length >= 2 && (
        <div className="card" style={{ padding: '16px' }}>
          <SectionTitle>📈 Performans Trendi</SectionTitle>
          <AreaTrendChart points={trendPts} />
        </div>
      )}

      {/* Diagram 4: Heatmap */}
      {stats.dailyProgress.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <SectionTitle>🔥 Aktivlik Xəritəsi — Son 12 həftə</SectionTitle>
          <ActivityHeatmap daily={stats.dailyProgress} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
            {[
              { c: 'var(--border-card)', l: 'Yox' },
              { c: 'var(--color-accent)', l: 'Az' },
              { c: 'var(--color-mid)', l: 'Orta' },
              { c: 'var(--color-primary)', l: 'Çox' },
            ].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject cards — click for detail */}
      {sortedSubj.length > 0 && (
        <div>
          <SectionTitle>📚 Fənn üzrə — Ətraflı baxış üçün toxunun</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedSubj.map(s => {
              const pct   = Math.round(s.averagePercent)
              const color = pctColor(pct)
              const icon  = SUBJECT_ICONS[s.subject] ?? '📚'
              return (
                <button key={s.subject} onClick={() => onSelectSubject(s)} className="card spring-hover" style={{
                  width: '100%', padding: '14px 16px', textAlign: 'left',
                  border: `1px solid var(--border-card)`, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.subject}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.totalTests} test</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'monospace' }}>{pct}%</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>›</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: color, transition: 'width 0.8s' }} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalTests === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>Hələ statistika yoxdur</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>İlk testini tamamladıqdan sonra bütün diaqramlar görünəcək.</p>
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Statistics() {
  const { userProfile } = useAuth()
  const userId = userProfile?.id as string | undefined
  const [selectedSubject, setSelectedSubject] = useState<FirestoreStats['subjectStats'][0] | null>(null)

  const { data: stats = DEFAULT_STATS, isLoading } = useQuery({
    queryKey: ['my-statistics', userId],
    queryFn:  apiGetMyStatistics,
    staleTime: 30_000,
    gcTime:    60_000,
    enabled:   !!userId,
  })
  const { data: results = [] } = useQuery<FirestoreResult[]>({
    queryKey: ['my-results', userId],
    queryFn:  apiGetMyResults,
    staleTime: 30_000,
    gcTime:    60_000,
    enabled:   !!userId,
  })

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="page-inner anim-fade-up">
      {selectedSubject
        ? <SubjectDetail subject={selectedSubject} results={results} onBack={() => setSelectedSubject(null)} />
        : <Overview stats={stats} results={results} onSelectSubject={setSelectedSubject} />
      }
    </div>
  )
}
