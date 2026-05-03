import { useState }      from 'react'
import { useNavigate }   from 'react-router-dom'
import { useQuery }      from '@tanstack/react-query'
import { MATH_CHAPTERS } from '../../../lib/mathTopics'
import { dbGetResults }  from '../../../lib/db'
import { getUnlockedTopics, getBestPercent, NIDA_PLUS_PLAN, MIN_PASS_PERCENT } from '../../../lib/topicAccess'
import { useAuthStore }  from '../../../stores/authStore'

export default function MathTopics() {
  const navigate        = useNavigate()
  const [open, setOpen] = useState<string | null>(null)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null)

  const user      = useAuthStore(s => s.user)
  const isNidaPlus = (user as any)?.plan === NIDA_PLUS_PLAN

  const { data: results = [] } = useQuery({
    queryKey:       ['my-results'],
    queryFn:        () => dbGetResults(),
    enabled:        !isNidaPlus,
    staleTime:      0,
    refetchOnMount: true,
  })

  const unlockedSet = isNidaPlus ? null : getUnlockedTopics(results as any[])
  const isUnlocked  = (topicId: string) => isNidaPlus || (unlockedSet?.has(topicId) ?? false)

  const handleTopicClick = (topicId: string) => {
    if (!isUnlocked(topicId)) {
      setLockedMsg('Əvvəlki mövzunu %' + MIN_PASS_PERCENT + ' ilə tamamla')
      setTimeout(() => setLockedMsg(null), 3000)
      return
    }
    navigate(`/math/quiz/${topicId}`)
  }

  const totalTopics = MATH_CHAPTERS.reduce((s, c) => s + c.topics.length, 0)

  return (
    <div className="page-inner anim-fade-up">

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/subjects')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, padding: 0, marginBottom: 8 }}
        >
          ← Fənlər
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
          📐 Riyaziyyat
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          {MATH_CHAPTERS.length} bölmə · {totalTopics} mövzu
        </p>
      </div>

      {/* Nida+ banner (free users only) */}
      {!isNidaPlus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 12, marginBottom: 16,
          background: 'rgba(244,162,97,0.08)',
          border: '0.5px solid rgba(244,162,97,0.3)',
        }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F4A261' }}>Nida+</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}> — bütün mövzulara birbaşa daxil ol</span>
          </div>
        </div>
      )}

      {/* Locked topic message */}
      {lockedMsg && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 12,
          background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
          fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🔒 {lockedMsg}
        </div>
      )}

      {/* Chapter list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MATH_CHAPTERS.map((chapter, ci) => {
          const anyUnlocked = chapter.topics.some(t => isUnlocked(t.id))
          return (
            <div key={chapter.id} className="card" style={{ overflow: 'hidden' }}>

              {/* Chapter header */}
              <button
                onClick={() => setOpen(o => o === chapter.id ? null : chapter.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: anyUnlocked ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.04)',
                    fontSize: 12, fontWeight: 700,
                    color: anyUnlocked ? 'var(--primary)' : 'var(--text-3)',
                    fontFamily: 'monospace',
                  }}>
                    {!isNidaPlus && !anyUnlocked ? '🔒' : ci + 1}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: anyUnlocked || isNidaPlus ? 'var(--text-1)' : 'var(--text-3)',
                    }}>
                      {chapter.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {chapter.topics.length} mövzu
                    </div>
                  </div>
                </div>
                <span style={{
                  color: 'var(--text-3)', fontSize: 16,
                  transform: open === chapter.id ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}>›</span>
              </button>

              {/* Topics list */}
              {open === chapter.id && (
                <div style={{ borderTop: '0.5px solid var(--border)', padding: '8px 12px 12px' }}>
                  {chapter.topics.map((topic, ti) => {
                    const unlocked   = isUnlocked(topic.id)
                    const best       = getBestPercent(results as any[], topic.id)
                    const passed     = best >= MIN_PASS_PERCENT

                    return (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicClick(topic.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                          background: passed ? 'rgba(0,201,167,0.06)' : 'var(--bg-secondary)',
                          border: `0.5px solid ${passed ? 'rgba(0,201,167,0.3)' : 'var(--border)'}`,
                          cursor: unlocked ? 'pointer' : 'not-allowed',
                          textAlign: 'left', opacity: unlocked ? 1 : 0.5,
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => {
                          if (!unlocked) return
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.background  = 'rgba(0,212,255,0.05)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = passed ? 'rgba(0,201,167,0.3)' : 'var(--border)'
                          e.currentTarget.style.background  = passed ? 'rgba(0,201,167,0.06)' : 'var(--bg-secondary)'
                        }}
                      >
                        {/* Index or lock */}
                        <span style={{
                          fontSize: unlocked ? 10 : 13, fontWeight: 700,
                          color: 'var(--text-3)', fontFamily: 'monospace', minWidth: 20,
                          textAlign: 'center',
                        }}>
                          {unlocked ? ti + 1 : '🔒'}
                        </span>

                        {/* Title */}
                        <span style={{ fontSize: 13, color: unlocked ? 'var(--text-1)' : 'var(--text-3)', flex: 1, lineHeight: 1.4 }}>
                          {topic.title}
                        </span>

                        {/* Right side: best score or arrow */}
                        {best > 0 ? (
                          <span style={{
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                            color: passed ? '#00C9A7' : '#F4A261',
                            background: passed ? 'rgba(0,201,167,0.12)' : 'rgba(244,162,97,0.12)',
                            padding: '2px 7px', borderRadius: 6,
                          }}>
                            {best}%
                          </span>
                        ) : unlocked ? (
                          <span style={{ fontSize: 14, color: 'var(--text-3)', flexShrink: 0 }}>›</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
