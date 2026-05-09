// @ts-nocheck
import { motion } from 'framer-motion'
import GroupERIGauge from './GroupERIGauge'
import { usePanels } from '../SlidePanel'
import StudentDetailPanel from './StudentDetailPanel'

const STUDENT_NAMES = [
  'Əli H.', 'Nigar M.', 'Rauf C.', 'Leyla S.',
  'Fərid A.', 'Günel T.', 'Murad K.', 'Sevinc O.', 'Tural İ.', 'Aynur B.',
]
const TOPICS = ['Cəbr', 'Həndəsə', 'Triqonometriya', 'Funksiyalar', 'Ehtimal']

function lcg(s: number) { return (((1664525 * (s >>> 0) + 1013904223) >>> 0) / 4294967296) }
function strSeed(str: string) { return [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0 }
function barColor(v: number) { return v >= 70 ? '#34C759' : v >= 50 ? '#FF9F0A' : '#FF453A' }

const RANKS = ['🥇', '🥈', '🥉']

interface Props { group: any }

export default function GroupDetailContent({ group }: Props) {
  const { push } = usePanels()
  const seed  = strSeed(group.name ?? '')
  const eri   = group.eri ?? group.groupERI ?? Math.round(52 + lcg(seed) * 38)
  const count = group.studentCount ?? Math.round(10 + lcg(seed + 1) * 8)

  const students = STUDENT_NAMES.slice(0, Math.min(count, 10))
    .map((name, i) => ({ name, score: Math.round(33 + lcg(seed * 3 + i * 7) * 57) }))
    .sort((a, b) => b.score - a.score)

  const topicAvgs  = TOPICS.map((t, i) => ({ topic: t, avg: Math.round(38 + lcg(seed * 5 + i * 9) * 52) }))
  const weakTopics = topicAvgs.filter(t => t.avg < 60)

  const openStudent = (name: string) =>
    push({ id: `student-${name}`, title: name, subtitle: 'Şagird profili', content: <StudentDetailPanel name={name} /> })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ERI header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <GroupERIGauge score={eri} size={72} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
            {group.name}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 8 }}>
              👥 {count} şagird
            </span>
            {(group.pendingCount ?? 0) > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'rgba(255,69,58,0.1)', padding: '2px 8px', borderRadius: 8 }}>
                ⚠ {group.pendingCount} müdaxilə
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,69,58,0.07)', border: '0.5px solid rgba(255,69,58,0.2)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#FF453A', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            ⚠ Zəif Mövzular
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {weakTopics.map(t => (
              <span key={t.topic} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.25)', color: '#FF453A' }}>
                {t.topic} — {t.avg}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topic averages */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Mövzu Ortalamaları
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topicAvgs.map((t, i) => {
            const c = barColor(t.avg)
            return (
              <div key={t.topic}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.topic}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{t.avg}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.avg}%` }}
                    transition={{ delay: 0.04 * i, duration: 0.5 }}
                    style={{ height: '100%', borderRadius: 4, background: c }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Student ranking */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
          Şagird Sıralaması · tıkla → profil
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {students.map((s, i) => {
            const c = barColor(s.score)
            return (
              <motion.div
                key={s.name}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openStudent(s.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 13, flexShrink: 0, width: 22 }}>
                  {RANKS[i] ?? <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{s.name}</span>
                <div style={{ width: 72, height: 5, borderRadius: 5, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.score}%` }}
                    transition={{ delay: 0.03 * i, duration: 0.5 }}
                    style={{ height: '100%', borderRadius: 5, background: c }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: 'var(--font-mono)', minWidth: 34, textAlign: 'right' }}>
                  {s.score}%
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
