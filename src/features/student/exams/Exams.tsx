import { useQuery } from '@tanstack/react-query'
import { apiGetExamsForStudent } from '@/lib/api'
import { useAuth } from '@/features/auth/store/authContext'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

type ExamStatus = 'waiting' | 'active' | 'completed'

const STATUS_MAP: Record<ExamStatus, { label: string; color: string; bg: string }> = {
  waiting:   { label: 'Gözləyir', color: 'var(--text-tertiary)',  bg: 'var(--bg-muted)' },
  active:    { label: 'Aktiv',    color: 'var(--color-primary)',  bg: 'color-mix(in srgb,var(--color-primary) 12%,transparent)' },
  completed: { label: 'Bitdi',    color: 'var(--color-success)',  bg: 'color-mix(in srgb,var(--color-success) 12%,transparent)' },
}

export default function Exams() {
  const { userProfile } = useAuth()
  const userId = userProfile?.id as string | undefined

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['student-exams', userId],
    queryFn:  apiGetExamsForStudent,
    staleTime: 30_000,
    enabled:   !!userId,
  })

  if (isLoading) return <DashboardSkeleton />

  const upcoming  = (exams as any[]).filter(e => e.status === 'waiting' || e.status === 'active')
  const completed = (exams as any[]).filter(e => e.status === 'completed')

  return (
    <div className="page-inner anim-fade-up">

      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        İmtahanlar
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
        Müəllim tərəfindən təşkil edilmiş sınaq imtahanları
      </p>

      {/* Upcoming / Active */}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Lexend Deca,sans-serif', marginBottom: 10 }}>
            📋 Gələcək İmtahanlar
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map((e: any) => {
              const st = STATUS_MAP[e.status as ExamStatus] ?? STATUS_MAP.waiting
              return (
                <div key={e.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{e.title}</div>
                      {e.subjects?.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>📚 {e.subjects.join(', ')}</div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      color: st.color, background: st.bg,
                    }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {e.scheduledAt && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        📅 {new Date(e.scheduledAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {e.duration && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ {e.duration} dəq</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Lexend Deca,sans-serif', marginBottom: 10 }}>
            ✅ Tamamlanan İmtahanlar
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completed.map((e: any) => (
              <div key={e.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{e.title}</div>
                  {e.scheduledAt && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {new Date(e.scheduledAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
                {e.score !== undefined && (
                  <div style={{
                    fontSize: 18, fontWeight: 800, fontFamily: 'monospace',
                    color: e.score >= 75 ? 'var(--color-success)' : e.score >= 55 ? 'var(--color-warning)' : 'var(--color-danger)',
                  }}>{e.score}%</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {exams.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Hələ imtahan yoxdur</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Müəllim imtahan təyin etdikdən sonra burada görünəcək.
          </p>
        </div>
      )}

    </div>
  )
}
