import { motion } from 'framer-motion'
import { useMetacognition } from '@/hooks/useAnalytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

function dkLabel(index: number): { text: string; color: string; icon: string; desc: string } {
  if (index > 0.3)  return { text: '謙Humble', icon: '🎓', color: 'var(--success)', desc: 'Bildiyini bilən ekspert. Özünü az qiymətləndirirsən.' }
  if (index > 0.1)  return { text: 'Dəqiq',    icon: '✦',  color: 'var(--primary)', desc: 'Özqiymət real nəticəyə çox yaxındır. Mükəmməl!' }
  if (index > -0.1) return { text: 'Balansda', icon: '⚖️',  color: 'var(--accent)',  desc: 'Özqiymət balanslaşıb. Davam et.' }
  if (index > -0.3) return { text: 'Həddaşımı', icon: '⚠️', color: 'var(--warning)', desc: 'Özünü bir qədər artıq qiymətləndirirsən.' }
  return              { text: 'Dunning-Kruger', icon: '🔍', color: 'var(--danger)',  desc: 'Bilik boşluğu var. Özünü çox qiymətləndirirsən.' }
}

export default function DKIndexCard() {
  const { dkIndex, overconfidentTopics, underconfidentTopics, selfAssessments } = useMetacognition()

  const meta    = dkLabel(dkIndex)
  const percent = Math.round((dkIndex + 1) / 2 * 100)  // -1…+1 → 0…100

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 14 }}>Metakognitiv Analiz</p>

      {selfAssessments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, marginBottom: 6 }}>Hələ özqiymət yoxdur</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
            Test başlamadan özünüzü qiymətləndirin —<br/>sistem Dunning-Kruger indeksini hesablayacaq.
          </p>
        </div>
      ) : (
        <>
          {/* DK Index gauge (horizontal) */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Dunning-Kruger</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Humble</span>
            </div>
            <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              {/* Gradient track */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, var(--danger) 0%, var(--warning) 35%, var(--primary) 50%, var(--accent) 70%, var(--success) 100%)',
                opacity: 0.25,
              }} />
              {/* Marker */}
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${percent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                style={{
                  position: 'absolute', top: 1, bottom: 1,
                  width: 10, marginLeft: -5,
                  borderRadius: 4,
                  background: meta.color,
                  boxShadow: `0 0 8px ${meta.color}80`,
                }}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 22, marginRight: 8 }}>{meta.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: meta.color, fontFamily: 'var(--font-heading)' }}>
                {meta.text}
              </span>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.5 }}>{meta.desc}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <StatPill label="Qiymət sayı" value={selfAssessments.length} color="var(--primary)" />
            <StatPill
              label="Ortalama fərq"
              value={`${dkIndex >= 0 ? '+' : ''}${Math.round(dkIndex * 100)}%`}
              color={meta.color}
            />
          </div>

          {overconfidentTopics.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 6, fontWeight: 700 }}>⚠️ Aşırı inam:</p>
              {overconfidentTopics.slice(0, 3).map(t => (
                <span key={t} style={{
                  display: 'inline-block', margin: '2px 4px 2px 0',
                  padding: '2px 8px', borderRadius: 20,
                  fontSize: 10, color: 'var(--danger)',
                  background: 'var(--danger-bg)', border: '0.5px solid rgba(255,77,109,0.3)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {underconfidentTopics.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 10, color: 'var(--success)', marginBottom: 6, fontWeight: 700 }}>🎯 Özünü az qiymətləndirir:</p>
              {underconfidentTopics.slice(0, 3).map(t => (
                <span key={t} style={{
                  display: 'inline-block', margin: '2px 4px 2px 0',
                  padding: '2px 8px', borderRadius: 20,
                  fontSize: 10, color: 'var(--success)',
                  background: 'var(--success-bg)', border: '0.5px solid rgba(0,229,160,0.3)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      flex: 1, padding: '8px 10px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 900, color, fontFamily: 'var(--font-heading)' }}>{value}</p>
    </div>
  )
}
