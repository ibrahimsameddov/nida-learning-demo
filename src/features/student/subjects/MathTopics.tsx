// @ts-nocheck
import { useMemo, useState }  from 'react'
import { useNavigate }        from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery }           from '@tanstack/react-query'
import { MATH_CHAPTERS }      from '../../../lib/mathTopics'
import { apiGetMyResults }    from '../../../lib/api'
import {
  getUnlockedTopics, getBestPercent,
  NIDA_PLUS_PLAN, MIN_PASS_PERCENT, ALL_TOPIC_IDS,
} from '../../../lib/topicAccess'
import { useAuthStore }       from '../../../stores/authStore'

// ── Layout constants ───────────────────────────────────────────
const NODE_R   = 28    // node circle radius px
const VGAP     = 100   // vertical gap between node centers
const BANNER_H = 48    // chapter banner height
const PATH_W   = 320   // container & SVG width
const PAD_TOP  = 16

// 8-period x-wave (centered on 160)
const WAVE_XS = [160, 215, 250, 215, 160, 105, 70, 105]
const waveX = (i: number) => WAVE_XS[i % 8]

// Smooth bezier path through an array of [x,y] points
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const cy = (y0 + y1) / 2
    d += ` C ${x0} ${cy} ${x1} ${cy} ${x1} ${y1}`
  }
  return d
}

type NodeState = 'completed' | 'current' | 'locked'

interface LayoutTopic {
  kind:     'topic'
  topicId:  string
  title:    string
  state:    NodeState
  best:     number
  nodeIdx:  number
  x:        number
  y:        number
}
interface LayoutBanner {
  kind:  'chapter'
  title: string
  id:    string
  y:     number
}
type LayoutItem = LayoutTopic | LayoutBanner

// ── Main component ─────────────────────────────────────────────
export default function MathTopics() {
  const navigate   = useNavigate()
  const user       = useAuthStore(s => s.user)
  const isNidaPlus = (user as any)?.plan === NIDA_PLUS_PLAN
  const [toast, setToast] = useState<string | null>(null)
  const [tipId, setTipId] = useState<string | null>(null)

  const { data: results = [] } = useQuery({
    queryKey:       ['my-results'],
    queryFn:        () => apiGetMyResults(),
    staleTime:      0,
    refetchOnMount: true,
  })

  const unlockedSet = useMemo(
    () => (isNidaPlus ? null : getUnlockedTopics(results as any[])),
    [results, isNidaPlus],
  )
  const isUnlocked = (id: string) => isNidaPlus || (unlockedSet?.has(id) ?? false)

  // Build flat layout: chapter banners + topic nodes
  const { layout, svgHeight, doneCount } = useMemo(() => {
    const layout: LayoutItem[] = []
    let y = PAD_TOP
    let nodeIdx = 0
    let done = 0

    for (const chapter of MATH_CHAPTERS) {
      layout.push({ kind: 'chapter', title: chapter.title, id: chapter.id, y })
      y += BANNER_H + 12

      for (const topic of chapter.topics) {
        const best   = getBestPercent(results as any[], topic.id)
        const passed = best >= MIN_PASS_PERCENT
        const unlocked = isUnlocked(topic.id)
        let state: NodeState = 'locked'
        if (passed)        { state = 'completed'; done++ }
        else if (unlocked) { state = 'current' }

        layout.push({
          kind: 'topic', topicId: topic.id, title: topic.title,
          state, best, nodeIdx,
          x: waveX(nodeIdx),
          y,
        })
        y += VGAP
        nodeIdx++
      }
      y += 20
    }
    return { layout, svgHeight: y + 40, doneCount: done }
  }, [results, isNidaPlus, unlockedSet])

  // SVG path points = all topic node centers in order
  const pathPts = useMemo((): [number, number][] =>
    (layout.filter(i => i.kind === 'topic') as LayoutTopic[]).map(t => [t.x, t.y]),
  [layout])

  const completedPts = pathPts.slice(0, doneCount + 1)
  const totalTopics  = ALL_TOPIC_IDS.length
  const progressPct  = totalTopics ? Math.round((doneCount / totalTopics) * 100) : 0

  const handleNodeClick = (node: LayoutTopic) => {
    setTipId(id => id === node.topicId ? null : node.topicId)
    if (node.state === 'locked') {
      setToast(`Əvvəlki mövzunu %${MIN_PASS_PERCENT} ilə tamamla 🔒`)
      setTimeout(() => setToast(null), 2800)
      return
    }
    navigate(`/math/quiz/${node.topicId}`)
  }

  return (
    <div className="page-inner anim-fade-up">

      {/* ── Back + title ─────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => navigate('/subjects')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, padding: 0, marginBottom: 8 }}
        >
          ← Fənlər
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--subject-math-bg)', border: '1.5px solid var(--subject-math-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>📐</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--text-1)', margin: 0 }}>
              Riyaziyyat
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
              {MATH_CHAPTERS.length} bölmə · {totalTopics} mövzu
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>İrəliləyiş</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--subject-math)', fontFamily: 'var(--font-mono)' }}>
            {doneCount}/{totalTopics}
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-input)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, var(--subject-math) 0%, #60C0FF 100%)',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
          {progressPct}% tamamlandı
        </div>
      </div>

      {/* ── Nida+ banner ─────────────────────────────── */}
      {!isNidaPlus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16,
          background: 'rgba(201,149,43,0.07)', border: '1px solid rgba(201,149,43,0.22)',
        }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--accent)' }}>Nida+</strong> ilə bütün mövzulara birbaşa daxil ol
          </span>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 12,
              background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.25)',
              fontSize: 13, color: 'var(--danger)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Winding path ─────────────────────────────── */}
      <div style={{ position: 'relative', width: PATH_W, maxWidth: '100%', margin: '0 auto', height: svgHeight }}>

        {/* SVG road */}
        <svg
          viewBox={`0 0 ${PATH_W} ${svgHeight}`}
          width="100%" height={svgHeight}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {/* Grey dashed track */}
          <path
            d={smoothPath(pathPts)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={5}
            strokeDasharray="7 7"
            strokeLinecap="round"
          />
          {/* Completed track (solid blue) */}
          {doneCount > 0 && (
            <motion.path
              d={smoothPath(completedPts)}
              fill="none"
              stroke="var(--subject-math)"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.55}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          )}
        </svg>

        {/* Chapter banners + topic nodes */}
        {layout.map(item => {
          if (item.kind === 'chapter') {
            return (
              <div
                key={`ch-${item.id}`}
                style={{
                  position: 'absolute', left: 0, right: 0, top: item.y,
                  height: BANNER_H,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 3,
                }}
              >
                <div style={{
                  padding: '5px 16px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
                  boxShadow: 'var(--shadow-sm)',
                  maxWidth: '78%', textAlign: 'center',
                  letterSpacing: '0.01em',
                }}>
                  {item.title}
                </div>
              </div>
            )
          }

          // Topic node
          const node = item as LayoutTopic
          const isCompleted = node.state === 'completed'
          const isCurrent   = node.state === 'current'
          const isLocked    = node.state === 'locked'
          const showRight   = node.x < PATH_W / 2

          return (
            <div key={node.topicId} style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 0, zIndex: 4 }}>

              {/* Label beside node */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + node.nodeIdx * 0.02, duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: node.y - 18,
                  ...(showRight
                    ? { left: node.x + NODE_R + 10, maxWidth: PATH_W - node.x - NODE_R - 16 }
                    : { right: PATH_W - node.x + NODE_R + 10, maxWidth: node.x - NODE_R - 16, textAlign: 'right' }
                  ),
                  fontSize: 10,
                  fontWeight: isLocked ? 500 : 700,
                  color: isLocked ? 'var(--text-3)' : isCurrent ? 'var(--text-1)' : 'var(--text-2)',
                  lineHeight: 1.35,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {node.title}
              </motion.div>

              {/* Node circle */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.08 + node.nodeIdx * 0.025 }}
                whileHover={!isLocked ? { scale: 1.14, y: -3 } : {}}
                whileTap={!isLocked ? { scale: 0.92 } : {}}
                onClick={() => handleNodeClick(node)}
                style={{
                  position: 'absolute',
                  left: node.x - NODE_R,
                  top:  node.y - NODE_R,
                  width:  NODE_R * 2,
                  height: NODE_R * 2,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
              >
                {/* Pulse glow for current */}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.45, 0.1, 0.45] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', inset: -10, borderRadius: '50%',
                      background: 'rgba(201,149,43,0.22)', pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Circle face */}
                <div style={{
                  width: NODE_R * 2, height: NODE_R * 2, borderRadius: '50%',
                  background: isCompleted
                    ? 'var(--subject-math-bg)'
                    : isCurrent
                      ? 'rgba(201,149,43,0.12)'
                      : 'var(--bg-input)',
                  border: `2.5px solid ${
                    isCompleted ? 'var(--subject-math)'
                    : isCurrent ? 'var(--accent)'
                    : 'var(--border)'
                  }`,
                  boxShadow: isCompleted
                    ? '0 0 12px rgba(59,130,246,0.28)'
                    : isCurrent
                      ? '0 0 18px rgba(201,149,43,0.35)'
                      : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15,
                  position: 'relative',
                }}>
                  {isCompleted ? '✓' : isLocked ? '🔒' : '▶'}
                </div>

                {/* Score badge */}
                {isCompleted && node.best > 0 && (
                  <div style={{
                    position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--subject-math)', color: '#fff',
                    fontSize: 8, fontWeight: 800, padding: '2px 5px',
                    borderRadius: 99, whiteSpace: 'nowrap', lineHeight: 1.5,
                  }}>
                    {node.best}%
                  </div>
                )}

                {/* Mascot bounces above current node */}
                {isCurrent && (
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', top: -30, left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 18, lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    }}
                  >
                    🦁
                  </motion.div>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Bottom padding */}
      <div style={{ height: 40 }} />
    </div>
  )
}
