// @ts-nocheck
import { motion } from 'framer-motion'
import { useTeacherGamificationStore } from '@/stores/teacherGamificationStore'

function StatCard({ label, value, icon, color = 'var(--primary)' }: { label: string; value: string | number; icon: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--bg-hover)', border: '0.5px solid var(--border)',
      borderRadius: 14, padding: '14px 16px', flex: '1 1 130px', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          background: `color-mix(in srgb, ${color} 14%, var(--bg-card))`,
          border: `1px solid color-mix(in srgb, ${color} 22%, var(--border))`,
        }}>{icon}</div>
        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, lineHeight: 1.3, flex: 1 }}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 900, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 28 }}>{label}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 5, background: 'var(--border)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 5, background: color }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  )
}

export default function StatsTab() {
  const totalTX   = useTeacherGamificationStore(s => s.totalTX)
  const weeklyTX  = useTeacherGamificationStore(s => s.weeklyTX)
  const monthlyTX = useTeacherGamificationStore(s => s.monthlyTX)
  const streak    = useTeacherGamificationStore(s => s.streak)
  const longest   = useTeacherGamificationStore(s => s.longestStreak)
  const history   = useTeacherGamificationStore(s => s.txHistory)
  const badges    = useTeacherGamificationStore(s => s.badges)

  // Mock activity stats (demo data — seeded from totalTX)
  const totalStudents  = 84
  const eriImproved    = 61
  const tasksSent      = 247
  const examsConducted = 34
  const completionRate = 87
  const avgGroupERI    = 68

  // Mock 7-week TX history
  const weekHistory = [320, 480, 290, 550, 410, 620, weeklyTX]
  const maxWeek     = Math.max(...weekHistory, 1)

  // TX by category (simulated)
  const txByReason = [
    { label: 'Tapşırıq', value: Math.round(totalTX * 0.28), color: '#4F87FF' },
    { label: 'İmtahan',  value: Math.round(totalTX * 0.22), color: '#7F77DD' },
    { label: 'Şagird',   value: Math.round(totalTX * 0.32), color: '#34C759' },
    { label: 'Aktivlik', value: Math.round(totalTX * 0.18), color: '#C9952B' },
  ]
  const maxTxCat = Math.max(...txByReason.map(t => t.value), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI grid */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          Ümumi Fəaliyyət
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <StatCard icon="🎓" label="Toplam şagird"       value={totalStudents}  color="#4F87FF"  />
          <StatCard icon="📈" label="ERI artıran şagird"  value={eriImproved}    color="#34C759"  />
          <StatCard icon="📝" label="Göndərilən tapşırıq" value={tasksSent}      color="#7F77DD"  />
          <StatCard icon="📋" label="Keçirilən imtahan"   value={examsConducted} color="#C9952B"  />
          <StatCard icon="✅" label="Tamamlama faizi"     value={`${completionRate}%`} color="#34C759" />
          <StatCard icon="📊" label="Ort. qrup ERI"       value={avgGroupERI}    color="#AF52DE"  />
        </div>
      </div>

      {/* TX stats */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          TX Statistikası
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 100, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Ümumi TX</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#C9952B', fontFamily: 'var(--font-mono)' }}>{totalTX.toLocaleString()}</p>
          </div>
          <div style={{ flex: 1, minWidth: 100, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Bu həftə</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#4F87FF', fontFamily: 'var(--font-mono)' }}>{weeklyTX.toLocaleString()}</p>
          </div>
          <div style={{ flex: 1, minWidth: 100, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Bu ay</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#34C759', fontFamily: 'var(--font-mono)' }}>{monthlyTX.toLocaleString()}</p>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 72, marginBottom: 8 }}>
          {weekHistory.map((v, i) => {
            const h = Math.max(4, Math.round((v / maxWeek) * 56))
            const isThis = i === weekHistory.length - 1
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', height: 58, display: 'flex', alignItems: 'flex-end' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ delay: 0.05 * i, duration: 0.5 }}
                    style={{
                      width: '100%', borderRadius: '4px 4px 2px 2px',
                      background: isThis
                        ? 'linear-gradient(180deg, #6EA3FF 0%, var(--primary) 100%)'
                        : 'rgba(79,135,255,0.28)',
                      boxShadow: isThis ? '0 0 12px rgba(79,135,255,0.35)' : 'none',
                    }}
                  />
                </div>
                <span style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  H{i + 1}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* TX by source */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
          TX Mənbəyi
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {txByReason.map(t => (
            <MiniBar key={t.label} label={t.label} value={t.value} max={maxTxCat} color={t.color} />
          ))}
        </div>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Cari Seriya</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#FF9F0A', fontFamily: 'var(--font-mono)' }}>🔥 {streak} gün</p>
        </div>
        <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Ən uzun seriya</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#C9952B', fontFamily: 'var(--font-mono)' }}>⭐ {longest} gün</p>
        </div>
        <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-hover)', border: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Badge sayı</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#7F77DD', fontFamily: 'var(--font-mono)' }}>🏅 {badges.length}</p>
        </div>
      </div>

      {/* Recent TX history */}
      {history.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            Son TX Tarixçəsi
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {history.slice(0, 10).map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#C9952B', fontFamily: 'var(--font-mono)', minWidth: 50 }}>
                  +{pt.amount} TX
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', flex: 1 }}>{pt.reason}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {new Date(pt.earnedAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
