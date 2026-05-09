// @ts-nocheck
import { motion } from 'framer-motion'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'
import { ALL_TEACHER_BADGES, CERTIFICATE_DEFS } from '@/types/teacherGamification'

const CATEGORY_LABELS = {
  starter:  'Başlanğıc',
  task:     'Tapşırıq və İmtahan',
  student:  'Şagird İnkişafı',
  activity: 'Aktivlik və Sadaqat',
}

function BadgeCard({ badge, earned }: { badge: any; earned: any }) {
  const dim = !earned
  return (
    <motion.div
      whileHover={earned ? { scale: 1.03 } : {}}
      style={{
        background: 'var(--bg-hover)', border: `0.5px solid ${earned ? 'var(--border)' : 'var(--border)'}`,
        borderRadius: 14, padding: '14px 12px', textAlign: 'center',
        opacity: dim ? 0.4 : 1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <p style={{ fontSize: 32, lineHeight: 1, marginBottom: 8 }}>{badge.icon}</p>
      <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4, lineHeight: 1.3 }}>
        {badge.label}
      </p>
      {earned ? (
        <>
          <p style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 6 }}>
            {new Date(earned.earnedAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(201,149,43,0.12)', borderRadius: 8, padding: '2px 8px',
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#C9952B', fontFamily: 'var(--font-mono)' }}>
              +{badge.txReward} TX
            </span>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 9, color: 'var(--text-3)', lineHeight: 1.4, marginBottom: badge.progress ? 6 : 0 }}>
            {badge.description}
          </p>
          {badge.progress && (
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 3, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: 'var(--primary)',
                  width: `${Math.min(100, (badge.progress.current / badge.progress.total) * 100)}%`,
                }} />
              </div>
              <p style={{ fontSize: 8, color: 'var(--text-3)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                {badge.progress.current}/{badge.progress.total}
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

function CertificateCard({ cert, def }: { cert: any; def: any }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--bg-hover)', border: '0.5px solid rgba(201,149,43,0.3)',
      borderRadius: 14, padding: '14px 16px',
    }}>
      <span style={{ fontSize: 32, flexShrink: 0 }}>{def.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', marginBottom: 2 }}>{def.label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{def.description}</p>
        <p style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          {new Date(cert.issuedAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
        style={{
          padding: '8px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
          background: 'color-mix(in srgb, var(--primary) 12%, var(--bg-hover))',
          border: '0.5px solid color-mix(in srgb, var(--primary) 28%, var(--border))',
          color: 'var(--primary)', cursor: 'pointer', flexShrink: 0,
        }}
      >
        📄 PDF
      </motion.button>
    </div>
  )
}

export default function AchievementsTab() {
  const earnedBadges   = useTeacherGamificationStore(s => s.badges)
  const certificates   = useTeacherGamificationStore(s => s.certificates)

  const categories = ['starter', 'task', 'student', 'activity'] as const
  const earnedMap = Object.fromEntries(earnedBadges.map(b => [b.id, b]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            Sertifikatlar
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {certificates.map(cert => {
              const def = CERTIFICATE_DEFS[cert.type]
              return def ? <CertificateCard key={cert.id} cert={cert} def={def} /> : null
            })}
          </div>
        </div>
      )}

      {/* Badges by category */}
      {categories.map(cat => {
        const catBadges = ALL_TEACHER_BADGES.filter(b => b.category === cat)
        const earnedCount = catBadges.filter(b => earnedMap[b.id]).length
        return (
          <div key={cat}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {CATEGORY_LABELS[cat]}
              </p>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {earnedCount}/{catBadges.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {catBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned={earnedMap[badge.id]} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
