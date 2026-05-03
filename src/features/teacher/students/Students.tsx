// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiGetMyGroups, apiGetStudentProfiles } from '@/lib/api'
import { SPRING } from '@/lib/motion'

const PALETTE = ['#4F87FF', '#6C63FF', '#F4A261', '#00C9A7', '#A78BFA', '#38BDF8', '#FB7185']

function Avi({ seed, size = 38 }: { seed: string; size?: number }) {
  const color = PALETTE[seed.charCodeAt(0) % PALETTE.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: `${color}1a`, border: `1.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {seed.charAt(0).toUpperCase()}
    </div>
  )
}

export default function TeacherStudents() {
  const [groups,   setGroups]   = useState<any[]>([])
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [selGroup, setSelGroup] = useState('all')

  useEffect(() => {
    apiGetMyGroups()
      .then(async (d: any) => {
        const grps = Array.isArray(d) ? d : []
        setGroups(grps)
        const uids = [...new Set(grps.flatMap((g: any) => g.studentUids ?? []))] as string[]
        if (!uids.length) return
        // Firestore 'in' max 30 — batch in chunks
        const chunks: string[][] = []
        for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30))
        const all = await Promise.all(chunks.map(c => apiGetStudentProfiles(c).catch(() => [])))
        const map: Record<string, any> = {}
        all.flat().forEach((p: any) => { if (p?.id) map[p.id] = p })
        setProfiles(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allStudents = groups.flatMap((g: any) =>
    (g.studentUids ?? []).map((uid: string) => {
      const p = profiles[uid]
      return {
        uid,
        fullName: p?.fullName || p?.displayName || '',
        uniqueId: p?.uniqueId || '',
        groupName: g.name || 'Qrup',
        subject:   g.subject || '',
        groupId:   g.id,
      }
    })
  )

  const q = search.toLowerCase()
  const displayed = allStudents.filter(s => {
    const matchGroup  = selGroup === 'all' || s.groupId === selGroup
    const matchSearch = !q ||
      s.uid.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.uniqueId.toLowerCase().includes(q) ||
      s.groupName.toLowerCase().includes(q)
    return matchGroup && matchSearch
  })

  const groupTabs = [
    { id: 'all', name: 'Hamısı', count: allStudents.length },
    ...groups.map((g: any) => ({ id: g.id, name: g.name || 'Qrup', count: g.studentUids?.length ?? 0 })),
  ]

  return (
    <div className="page-inner">

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>
          Şagirdlər
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
          {allStudents.length} şagird · {groups.length} qrup
        </p>
      </div>

      {/* Search */}
      <input
        className="input"
        placeholder="Ad, ID (ŞAG-XXXXXX) və ya qrup adı ilə axtar..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Group filter chips */}
      {groups.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {groupTabs.map(g => (
            <button
              key={g.id}
              onClick={() => setSelGroup(g.id)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                whiteSpace: 'nowrap', flexShrink: 0,
                background: selGroup === g.id ? '#4F87FF' : 'var(--bg-card)',
                border: selGroup === g.id ? 'none' : '0.5px solid var(--border-card)',
                color: selGroup === g.id ? '#fff' : 'var(--text-3)',
                fontFamily: "'Lexend Deca', sans-serif",
              }}
            >
              {g.name} ({g.count})
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING}
          style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
            borderRadius: 16, padding: '44px 24px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>
            {search ? 'Nəticə tapılmadı' : 'Hələ şagird yoxdur'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
            {search
              ? 'Fərqli ad və ya ID ilə sınayın'
              : 'Qruplar bölməsindən şagirdlərinizi əlavə edin'}
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayed.map((s, i) => (
            <motion.div
              key={s.uid + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: Math.min(i * 0.025, 0.18) }}
              style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border-card)',
                borderRadius: 14, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <Avi seed={s.fullName || s.uid} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--text-1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {s.fullName || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                  {s.uniqueId && (
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#4F87FF', background: 'rgba(79,135,255,0.1)', padding: '1px 6px', borderRadius: 5 }}>
                      {s.uniqueId}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {s.groupName}{s.subject ? ` · ${s.subject}` : ''}
                  </span>
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: 'rgba(79,135,255,0.1)', color: '#4F87FF', flexShrink: 0,
              }}>aktiv</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
