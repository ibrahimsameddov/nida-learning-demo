// @ts-nocheck
import { haptic } from '@/lib/native'

const QUICK_REPLIES = [
  'Qəbul edildi ✓',
  'Təşəkkür edirəm',
  'Anladım, davam edəcəm',
  'Sual yarana bilər?',
  'Hazırıq!',
]

interface Props {
  onSelect: (text: string) => void
}

export default function QuickReplyBar({ onSelect }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 12px',
      scrollbarWidth: 'none', borderBottom: '0.5px solid var(--border)',
      background: 'var(--bg-elevated)',
    }}>
      {QUICK_REPLIES.map(r => (
        <button
          key={r}
          onClick={() => { haptic.tap(); onSelect(r) }}
          style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--border)',
            color: 'var(--text-2)',
          }}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
