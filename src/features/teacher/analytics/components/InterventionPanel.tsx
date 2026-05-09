// @ts-nocheck
import { AnimatePresence }     from 'framer-motion'
import { useGroupInsights }    from '@/hooks/useClassroomIntelligence'
import InterventionCard        from './InterventionCard'

interface Props {
  groupId:    string
  groupName?: string
}

export default function InterventionPanel({ groupId, groupName }: Props) {
  const { interventions, isLoading, actionIntervention, dismissIntervention } =
    useGroupInsights(groupId || '')

  if (!groupId) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, gap: 8 }}>
        <p style={{ fontSize: 28 }}>👥</p>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Qrup seçin</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
      </div>
    )
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>
            Müdaxilə Kartları
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {groupName ? `${groupName} · ` : ''}{interventions.length > 0 ? `${interventions.length} aktiv` : 'Hamısı qaydasındadır'}
          </p>
        </div>
        {interventions.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'rgba(255,69,58,0.1)', padding: '3px 8px', borderRadius: 8 }}>
            🚨 {interventions.length}
          </span>
        )}
      </div>

      {/* List or empty */}
      {interventions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
            Hər şey qaydasındadır
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Bu qrupda müdaxilə tələb edən vəziyyət yoxdur
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      )}
    </div>
  )
}
