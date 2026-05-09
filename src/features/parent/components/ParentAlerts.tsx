// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'

const SPRING = { type: 'spring', stiffness: 220, damping: 22 }

export interface ParentAlert {
  id:      string
  type:    'inactivity' | 'low_score' | 'milestone' | 'message'
  title:   string
  body:    string
  color:   string
  icon:    string
  date:    Date
}

interface Props {
  alerts:   ParentAlert[]
  onDismiss: (id: string) => void
}

export default function ParentAlerts({ alerts, onDismiss }: Props) {
  if (!alerts.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Bildirişlər
      </p>
      <AnimatePresence>
        {alerts.map((a, i) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ delay: i * 0.05, ...SPRING }}
            style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '12px 14px', borderRadius: 12,
              background: `color-mix(in srgb, ${a.color} 6%, var(--bg-card))`,
              border: `0.5px solid color-mix(in srgb, ${a.color} 20%, var(--border-card))`,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)', marginBottom: 2 }}>{a.title}</p>
              <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{a.body}</p>
              <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                {a.date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <button
              onClick={() => onDismiss(a.id)}
              style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)',
                cursor: 'pointer', fontSize: 10, color: 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function buildAlertsFromStats(stats: any, childName: string): ParentAlert[] {
  const alerts: ParentAlert[] = []
  const first = (childName ?? 'Şagird').split(' ')[0]
  const now   = Date.now()

  const days = stats?.lastActiveDate
    ? Math.round((now - new Date(stats.lastActiveDate).getTime()) / 86_400_000)
    : 0

  if (days >= 3) {
    alerts.push({
      id: 'inactive', type: 'inactivity', icon: '😴',
      title: 'Fəalsızlıq',
      body: `${first} ${days} gündür platformaya girməyib.`,
      color: 'var(--warning)', date: new Date(now - days * 86_400_000),
    })
  }

  const avg = stats?.averagePercent ?? 0
  if (avg > 0 && avg < 50) {
    alerts.push({
      id: 'low_score', type: 'low_score', icon: '📉',
      title: 'Nəticə Diqqət Tələb Edir',
      body: `${first}-in ümumi ortalama nəticəsi ${avg}% — məsləhət almaq tövsiyə olunur.`,
      color: 'var(--danger)', date: new Date(),
    })
  }

  const streak = stats?.currentStreak ?? 0
  if (streak >= 7) {
    alerts.push({
      id: 'streak', type: 'milestone', icon: '🏆',
      title: 'Əla İrəliləyiş!',
      body: `${first} ${streak} günlük ardıcıl öyrənmə seriyası qurdu!`,
      color: 'var(--success)', date: new Date(),
    })
  }

  return alerts
}
