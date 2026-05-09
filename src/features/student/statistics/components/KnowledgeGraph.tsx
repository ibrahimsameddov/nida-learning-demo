import { useState } from 'react'
import { motion } from 'framer-motion'
import { useKnowledgeGraph } from '@/hooks/useAnalytics'
import type { GraphNode } from '@/lib/analytics'

const SPRING = { type: 'spring', stiffness: 200, damping: 22 }

function masteryColor(level: number): string {
  if (level >= 80) return 'var(--success)'
  if (level >= 60) return 'var(--primary)'
  if (level >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

export default function KnowledgeGraph() {
  const { nodes, edges, weakNodes, isLoading } = useKnowledgeGraph()
  const [hovered, setHovered] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="card" style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 12 }}>Yüklənir…</p>
      </div>
    )
  }

  if (!nodes.length) {
    return (
      <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>🕸️</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Bilik xəritəsi quruluşda</p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Testlər həll etdikcə xəritə genişlənir</p>
      </div>
    )
  }

  const subjectNodes = nodes.filter(n => n.id.startsWith('sub:'))
  const topicNodes   = nodes.filter(n => !n.id.startsWith('sub:'))
  const hoveredNode  = nodes.find(n => n.id === hovered)

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <p className="card-title">Bilik Xəritəsi</p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{nodes.length} node, {edges.length} əlaqə</p>
        </div>
        {weakNodes.length > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--danger)',
            padding: '3px 8px', borderRadius: 20,
            background: 'var(--danger-bg)', border: '0.5px solid rgba(255,77,109,0.3)',
          }}>
            {weakNodes.length} zəif
          </span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          width="100%"
          viewBox="0 0 400 340"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Edges */}
          {edges.map((e, i) => {
            const from = nodes.find(n => n.id === e.from)
            const to   = nodes.find(n => n.id === e.to)
            if (!from || !to) return null
            const isActive = hovered === e.from || hovered === e.to
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={isActive ? 'var(--primary)' : 'rgba(255,255,255,0.07)'}
                strokeWidth={isActive ? 1.5 : 0.8}
                opacity={isActive ? 0.9 : 0.5}
              />
            )
          })}

          {/* Topic nodes */}
          {topicNodes.map((node, i) => {
            const color  = masteryColor(node.masteryLevel)
            const isHov  = hovered === node.id
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.02, ...SPRING }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x} cy={node.y}
                  r={isHov ? 9 : 7}
                  fill={`color-mix(in srgb, ${color} 20%, rgba(15,30,61,0.9))`}
                  stroke={color}
                  strokeWidth={isHov ? 2 : 1}
                  style={{ transition: 'all 0.2s' }}
                />
                {node.isWeak && (
                  <circle cx={node.x + 5} cy={node.y - 5} r="3"
                    fill="var(--danger)" stroke="var(--bg-card)" strokeWidth="1" />
                )}
              </motion.g>
            )
          })}

          {/* Subject nodes */}
          {subjectNodes.map((node, i) => {
            const color  = masteryColor(node.masteryLevel)
            const isHov  = hovered === node.id
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, ...SPRING }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x} cy={node.y}
                  r={isHov ? 24 : 20}
                  fill={`color-mix(in srgb, ${color} 15%, rgba(15,30,61,0.95))`}
                  stroke={color}
                  strokeWidth={isHov ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />
                <text
                  x={node.x} y={node.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={color}
                  style={{ pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: '0.03em' }}
                >
                  {node.topicName.slice(0, 6)}
                </text>
                <text
                  x={node.x} y={node.y + 11}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fontWeight="900"
                  fontFamily="var(--font-heading)"
                  fill={color}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.masteryLevel}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8, right: 8,
            padding: '8px 12px', borderRadius: 10,
            background: 'var(--bg-elevated)',
            border: `0.5px solid ${masteryColor(hoveredNode.masteryLevel)}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pointerEvents: 'none',
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{hoveredNode.topicName}</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{hoveredNode.subject}</p>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: masteryColor(hoveredNode.masteryLevel), fontFamily: 'var(--font-heading)' }}>
              {hoveredNode.masteryLevel}%
            </div>
          </div>
        )}
      </div>

      {/* Mastery legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
        {[['Zəif','var(--danger)',0],['Orta','var(--warning)',40],['Yaxşı','var(--primary)',60],['Əla','var(--success)',80]].map(([l,c]) => (
          <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c as string }} />
            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{l as string}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
