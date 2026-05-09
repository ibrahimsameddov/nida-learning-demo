// @ts-nocheck
import { useState }            from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAllGroupsOverview, useGroupInsights } from '@/hooks/useClassroomIntelligence'
import GroupERIGauge        from './GroupERIGauge'
import InterventionCard     from './InterventionCard'
import InactiveStudentsList from './InactiveStudentsList'
import WeakTopicsPanel      from './WeakTopicsPanel'
import GroupHeatmap         from './GroupHeatmap'

const SPRING = { type: 'spring', stiffness: 260, damping: 24 }

// ── Group selector ─────────────────────────────────────────────────────────────

function GroupSelector({ groups, selectedId, onSelect }: {
  groups:     any[]
  selectedId: string
  onSelect:   (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {groups.map(g => {
        const active = g.id === selectedId
        const errColor = g.pendingCount > 0 ? 'var(--danger)' : 'transparent'
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            style={{
              position: 'relative', padding: '8px 14px', borderRadius: 20,
              fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
              background: active ? 'var(--bg-active)' : 'rgba(255,255,255,0.04)',
              border: active ? '0.5px solid var(--border-focus)' : '0.5px solid var(--border)',
              color: active ? 'var(--primary)' : 'var(--text-2)',
              boxShadow: active ? '0 0 10px var(--glow-sm)' : 'none',
            }}
          >
            {g.name}
            {g.pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--danger)', fontSize: 8, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
                {g.pendingCount > 9 ? '9+' : g.pendingCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Group detail ───────────────────────────────────────────────────────────────

function GroupDetail({ groupId, subject, studentCount }: { groupId: string; subject: string; studentCount: number }) {
  const { interventions, weakTopics, inactiveStudents, groupERI, isLoading,
          actionIntervention, dismissIntervention } = useGroupInsights(groupId)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
        {[1,2,3].map(i => (
          <div key={i} className="card skeleton" style={{ height: 80 }} />
        ))}
      </div>
    )
  }

  const totalAlerts = interventions.length

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={groupId}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}
      >
        {/* ERI + heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, alignItems: 'start' }}>
          <div className="card" style={{ padding: '16px 10px', textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Qrup ERI</p>
            <GroupERIGauge score={groupERI} size={80} />
          </div>
          <GroupHeatmap studentCount={studentCount} groupERI={groupERI} subject={subject} />
        </div>

        {/* Intervention summary */}
        {totalAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '10px 14px', borderRadius: 12,
              background: 'rgba(255,77,109,0.07)', border: '0.5px solid rgba(255,77,109,0.25)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>🚨</span>
            <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
              {totalAlerts} müdaxilə tələb edən vəziyyət aşkar edildi
            </p>
          </motion.div>
        )}

        {/* Intervention cards */}
        {interventions.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Müdaxilələr
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {interventions.map(iv => (
                  <InterventionCard
                    key={iv.id}
                    intervention={iv}
                    onAction={actionIntervention}
                    onDismiss={dismissIntervention}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Weak topics */}
        <WeakTopicsPanel topics={weakTopics} />

        {/* Inactive students */}
        <InactiveStudentsList students={inactiveStudents} />

        {/* All clear */}
        {totalAlerts === 0 && inactiveStudents.length === 0 && weakTopics.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ textAlign: 'center', padding: '32px 20px' }}
          >
            <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
              Hər şey qaydasındadır
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
              Bu qrupda müdaxilə tələb edən vəziyyət yoxdur
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ClassroomIntelligence() {
  const navigate  = useNavigate()
  const { data: groups = [], isLoading: groupsLoading } = useAllGroupsOverview()
  const [selectedId, setSelectedId] = useState<string>('')

  const activeId   = selectedId || groups[0]?.id || ''
  const activeGroup = groups.find(g => g.id === activeId)

  if (groupsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 40, borderRadius: 20 }} />
        {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 80 }} />)}
      </div>
    )
  }

  if (!groups.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'color-mix(in srgb, var(--primary) 12%, var(--bg-hover))',
            border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            👥
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
            Qrup tapılmadı
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 22 }}>
            Analitika üçün əvvəlcə şagirdlərini<br />qruplara əlavə et
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/teacher/groups')}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 14, cursor: 'pointer',
                background: 'var(--primary)', border: 'none',
                fontSize: 13, fontWeight: 800, color: 'var(--text-on-accent)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              👥 Qrup Yarat
            </motion.button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/teacher/students')}
                style={{
                  padding: '10px', borderRadius: 12, cursor: 'pointer',
                  background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
                  fontSize: 12, fontWeight: 700, color: 'var(--text-2)',
                }}
              >
                🎓 Şagirdlər
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/teacher/tasks')}
                style={{
                  padding: '10px', borderRadius: 12, cursor: 'pointer',
                  background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
                  fontSize: 12, fontWeight: 700, color: 'var(--text-2)',
                }}
              >
                📝 Tapşırıqlar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const totalAlerts = groups.reduce((s, g) => s + g.pendingCount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Total alert badge */}
      {totalAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderRadius: 12, background: 'rgba(255,77,109,0.08)',
            border: '0.5px solid rgba(255,77,109,0.2)',
          }}
        >
          <span style={{ fontSize: 16 }}>🚨</span>
          <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
            {totalAlerts} qruplarda müdaxilə gözləyir
          </p>
        </motion.div>
      )}

      {/* Group selector */}
      <GroupSelector groups={groups} selectedId={activeId} onSelect={setSelectedId} />

      {/* Group detail */}
      {activeId && (
        <GroupDetail
          groupId={activeId}
          subject={activeGroup?.subject ?? ''}
          studentCount={activeGroup?.studentCount ?? 0}
        />
      )}
    </div>
  )
}
