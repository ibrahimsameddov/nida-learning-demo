import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStatsData } from '@/hooks/useAnalytics'
import { useGamificationStore } from '@/stores/gamificationStore'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

interface TimelineItem {
  id:          string
  icon:        string
  title:       string
  description: string
  date:        Date
  color:       string
  type:        'badge' | 'milestone' | 'record'
}

export default function MilestoneTimeline() {
  const { stats } = useStatsData()
  const { badges, xp, streak, longestStreak } = useGamificationStore()

  const items = useMemo((): TimelineItem[] => {
    const all: TimelineItem[] = []

    // From badges
    badges.forEach(b => {
      all.push({
        id:          b.id,
        icon:        b.icon,
        title:       b.label,
        description: b.description,
        date:        new Date(b.earnedAt ?? Date.now()),
        color:       'var(--primary)',
        type:        'badge',
      })
    })

    // Milestone: first test
    if ((stats?.totalTests ?? 0) >= 1) {
      all.push({
        id: 'first_test', icon: '📝', title: 'İlk Test',
        description: `${stats?.totalTests ?? 0} test tamamlandı`,
        date: new Date(Date.now() - 30 * 86_400_000),
        color: 'var(--accent)', type: 'milestone',
      })
    }

    // Milestone: streak
    if (longestStreak >= 3) {
      all.push({
        id: 'streak_record', icon: '🔥', title: `${longestStreak} Günlük Rekord`,
        description: `Ən uzun ardıcıl giriş seriyası`,
        date: new Date(Date.now() - 7 * 86_400_000),
        color: 'var(--warning)', type: 'record',
      })
    }

    // Milestone: XP levels
    if (xp >= 500) {
      all.push({
        id: 'xp_500', icon: '⚡', title: '500 XP',
        description: `${xp} XP qazanıldı`,
        date: new Date(Date.now() - 14 * 86_400_000),
        color: 'var(--success)', type: 'milestone',
      })
    }

    // Best score
    if ((stats?.bestPercent ?? 0) >= 90) {
      all.push({
        id: 'best_score', icon: '🏆', title: `${stats?.bestPercent}% Rekord`,
        description: 'Ən yüksək test nəticəsi',
        date: new Date(Date.now() - 5 * 86_400_000),
        color: 'var(--success)', type: 'record',
      })
    }

    return all.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [stats, badges, xp, longestStreak])

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="card-title" style={{ marginBottom: 18 }}>Nailiyyətlər Xətti</p>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🌱</p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>İlk addımı at!</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            Test həll etdikcə nailiyyətlər burda görünəcək
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 19, top: 0, bottom: 0,
            width: 1.5, background: 'var(--border)', zIndex: 0,
          }} />

          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, ...SPRING }}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                position: 'relative', zIndex: 1,
                marginBottom: i < items.length - 1 ? 16 : 0,
              }}
            >
              {/* Icon circle */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                background: `color-mix(in srgb, ${item.color} 12%, var(--bg-card))`,
                border: `0.5px solid color-mix(in srgb, ${item.color} 40%, transparent)`,
                boxShadow: `0 0 10px color-mix(in srgb, ${item.color} 20%, transparent)`,
              }}>
                {item.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {item.date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
