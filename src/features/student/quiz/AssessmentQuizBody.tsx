// @ts-nocheck

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

function ProgressBar({ current, total }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ height: 3, background: "rgba(0,212,255,0.1)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--primary),var(--accent))", transition: "width 0.4s ease", boxShadow: "0 0 8px var(--glow-sm)" }} />
    </div>
  );
}

export function AssessmentQuizBody({ questions, current, setCurrent, answers, seconds, submitting, onSelect, onFinish }) {
  const q        = questions[current];
  const answered = Object.keys(answers).length;
  const allDone  = answered === questions.length;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", fontFamily: "'Lexend Deca',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "rgba(26,26,46,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--text-2)", fontSize: 13 }}>Assessment Testi</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--text-3)", fontSize: 12 }}>{answered}/{questions.length} cavablandı</span>
          <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--primary)", letterSpacing: 1 }}>⏱ {fmt(seconds)}</span>
          <button
            onClick={onFinish}
            disabled={submitting}
            style={{
              padding: "8px 18px", borderRadius: 10, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 13, fontFamily: "'Lexend Deca',sans-serif", transition: "all 0.3s", opacity: submitting ? 0.7 : 1,
              background: allDone ? "linear-gradient(135deg,var(--primary),var(--accent))" : "rgba(0,212,255,0.08)",
              border: `1px solid ${allDone ? "transparent" : "var(--border)"}`,
              color: allDone ? "#fff" : "var(--text-2)",
              boxShadow: allDone ? "0 4px 16px var(--glow)" : "none",
            }}
          >{submitting ? "Göndərilir..." : allDone ? "✓ Bitir" : "Bitir"}</button>
        </div>
      </div>

      <ProgressBar current={answered} total={questions.length} />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar — question grid */}
        <div style={{ width: 72, borderRight: "1px solid var(--border)", padding: "12px 6px", overflowY: "auto", background: "rgba(26,26,46,0.6)", display: "flex", flexDirection: "column", gap: 4 }}>
          {questions.map((qItem, i) => {
            const done   = answers[qItem.id] !== undefined;
            const active = i === current;
            return (
              <button
                key={qItem.id}
                onClick={() => setCurrent(i)}
                style={{
                  width: "100%", aspectRatio: "1", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", fontFamily: "monospace", transition: "all 0.15s", flexShrink: 0,
                  border:      active ? "2px solid var(--primary)" : done ? "1px solid rgba(0,229,160,0.3)" : "1px solid var(--border)",
                  background:  active ? "rgba(0,212,255,0.15)"     : done ? "rgba(0,229,160,0.08)"          : "var(--bg-card)",
                  color:       active ? "var(--primary)"           : done ? "#00e5a0"                       : "var(--text-3)",
                }}
              >{i + 1}</button>
            );
          })}
        </div>

        {/* Question panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, padding: "4px 12px", color: "var(--primary)", fontSize: 12, fontWeight: 700 }}>
                {current + 1} / {questions.length}
              </span>
              {answers[q.id] !== undefined && <span style={{ color: "#00e5a0", fontSize: 11 }}>✓ Cavablandı</span>}
            </div>

            <p style={{ color: "var(--text-1)", fontSize: 17, lineHeight: 1.7, fontWeight: 500, marginBottom: 28 }}>{q.text}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {q.options.map((opt, idx) => {
                const label  = typeof opt === "object" ? opt.text : opt;
                const chosen = answers[q.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelect(q.id, idx)}
                    style={{
                      width: "100%", textAlign: "left", padding: "14px 18px", borderRadius: 14,
                      display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(10px)",
                      border:      chosen ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                      background:  chosen ? "rgba(0,212,255,0.08)"       : "var(--bg-card)",
                    }}
                    onMouseEnter={e => { if (!chosen) e.currentTarget.style.borderColor = "rgba(0,212,255,0.35)"; }}
                    onMouseLeave={e => { if (!chosen) e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "monospace", transition: "all 0.2s", background: chosen ? "var(--primary)" : "rgba(255,255,255,0.06)", color: chosen ? "#fff" : "var(--text-3)" }}>
                      {["A","B","C","D"][idx]}
                    </span>
                    <span style={{ color: chosen ? "var(--text-1)" : "var(--text-2)", fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                style={{ padding: "10px 20px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: current === 0 ? "not-allowed" : "pointer", opacity: current === 0 ? 0.4 : 1, fontSize: 13, fontFamily: "'Lexend Deca',sans-serif", fontWeight: 500 }}>
                ← Əvvəlki
              </button>
              <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                style={{ padding: "10px 20px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: current === questions.length - 1 ? "not-allowed" : "pointer", opacity: current === questions.length - 1 ? 0.4 : 1, fontSize: 13, fontFamily: "'Lexend Deca',sans-serif", fontWeight: 500 }}>
                Növbəti →
              </button>
            </div>
            <p style={{ color: "var(--text-3)", fontSize: 11, marginTop: 20, textAlign: "center" }}>
              Klaviatura: ← → keçid · 1-2-3-4 cavab seçimi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
