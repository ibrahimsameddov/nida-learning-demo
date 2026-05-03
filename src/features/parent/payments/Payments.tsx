import { useState } from 'react'

const HISTORY = [
  { id: 1, type: 'Balans artırma',  amount:  20, date: '08 Apr 2026', status: 'success' },
  { id: 2, type: 'Aylıq paket',     amount: -25, date: '01 Apr 2026', status: 'success' },
  { id: 3, type: 'Müəllim ödənişi', amount: -15, date: '20 Mar 2026', status: 'success' },
  { id: 4, type: 'Balans artırma',  amount:  50, date: '15 Mar 2026', status: 'success' },
]

const AMOUNTS = [10, 20, 30, 50]

export default function ParentPayments() {
  const [balance]    = useState(30)
  const [selected, setSelected] = useState<number | null>(null)
  const [custom, setCustom]     = useState('')

  return (
    <div className="page-inner anim-fade-up">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Lexend Deca, sans-serif', marginBottom: 4 }}>
        Balans & Ödəniş
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
        Övladınızın platformaya giriş ödənişləri
      </p>

      {/* Cari balans */}
      <div className="hero-card" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Cari Balans
        </div>
        <div className="neon-glow font-mono" style={{ fontSize: 36, fontWeight: 900 }}>
          {balance.toFixed(2)} ₼
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
          Növbəti ödəniş: 01 May 2026
        </div>
      </div>

      {/* Balans artır */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div className="card-header" style={{ marginBottom: 14 }}>
          <span className="card-title">Balans Artır</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          {AMOUNTS.map(a => (
            <button
              key={a}
              className={`pill-tag${selected === a ? ' active' : ''}`}
              style={{ justifyContent: 'center' }}
              onClick={() => { setSelected(a); setCustom('') }}
            >
              {a} ₼
            </button>
          ))}
        </div>

        <input
          className="input"
          type="number"
          placeholder="Digər məbləğ (₼)"
          value={custom}
          onChange={e => { setCustom(e.target.value); setSelected(null) }}
          style={{ marginBottom: 12 }}
        />

        <button
          className="btn btn-primary btn-full"
          disabled={!selected && !custom}
        >
          💳 {selected || custom || '—'} ₼ Ödə
        </button>
      </div>

      {/* Tarixçə */}
      <section>
        <div className="card-header">
          <span className="card-title">Ödəniş Tarixçəsi</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HISTORY.map((h, i) => (
            <div key={h.id} className={`card anim-fade-up d${Math.min(i + 1, 5)}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{h.type}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{h.date}</div>
              </div>
              <span className="font-mono" style={{
                fontSize: 15, fontWeight: 700,
                color: h.amount > 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {h.amount > 0 ? '+' : ''}{h.amount} ₼
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
