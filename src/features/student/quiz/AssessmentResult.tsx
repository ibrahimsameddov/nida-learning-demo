// @ts-nocheck
import { useState } from "react";

function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

export function AssessmentResult({ score, total, percent, timeSeconds, wrongList, onBack }) {
  const [showWrong, setShowWrong] = useState(false);
  const emoji = percent >= 80 ? "🏆" : percent >= 60 ? "✅" : percent >= 40 ? "📚" : "💪";

  return (
    <div style={{
      minHeight: "100dvh", background: "var(--bg-primary)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "flex-start", padding: "32px 16px 80px",
      fontFamily: "'Lexend Deca',sans-serif", overflowY: "auto",
    }}>
      {/* Score card */}
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--bg-card)", backdropFilter: "blur(20px)",
        border: "1px solid var(--border)", borderRadius: 20,
        padding: 32, textAlign: "center", marginBottom: 20,
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
          {percent}<span style={{ fontSize: 24, color: "var(--text-3)" }}>%</span>
        </div>
        <p style={{ color: "var(--text-2)", marginTop: 8, fontSize: 14 }}>
          {score} düzgün / {total} sual
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 24 }}>
          {[
            { label: "Düzgün", value: score,          color: "#00e5a0" },
            { label: "Yanlış",  value: total - score,  color: "#ff4d6d" },
            { label: "Vaxt",    value: fmt(timeSeconds),color: "var(--primary)" },
          ].map(st => (
            <div key={st.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: st.color }}>{st.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wrong answers */}
      {wrongList.length > 0 && (
        <div style={{
          width: "100%", maxWidth: 480,
          background: "var(--bg-card)", backdropFilter: "blur(20px)",
          border: "1px solid var(--border)", borderRadius: 20,
          padding: 24, marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 15 }}>
              Səhv cavablar ({wrongList.length})
            </span>
            <button
              onClick={() => setShowWrong(p => !p)}
              style={{
                background: "rgba(0,212,255,0.08)", border: "1px solid var(--border)",
                borderRadius: 8, color: "var(--primary)", fontSize: 12,
                padding: "5px 12px", cursor: "pointer", fontFamily: "'Lexend Deca',sans-serif",
              }}
            >{showWrong ? "Gizlət" : "Göstər"}</button>
          </div>
          {showWrong && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {wrongList.map((w, i) => (
                <div key={w.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ color: "var(--text-1)", fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--text-3)", marginRight: 6 }}>{i + 1}.</span>{w.text}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {w.options.map((opt, idx) => {
                      const label      = typeof opt === "object" ? opt.text : opt;
                      const isCorrect  = idx === w.correctIndex;
                      const isSelected = idx === w.selectedIndex;
                      return (
                        <div key={idx} style={{
                          padding: "8px 12px", borderRadius: 8, fontSize: 12,
                          display: "flex", alignItems: "center", gap: 8,
                          background: isCorrect ? "rgba(0,229,160,0.1)" : isSelected ? "rgba(255,77,109,0.1)" : "transparent",
                          border:     isCorrect ? "1px solid rgba(0,229,160,0.3)" : isSelected ? "1px solid rgba(255,77,109,0.3)" : "1px solid transparent",
                          color:      isCorrect ? "#00e5a0" : isSelected ? "#ff4d6d" : "var(--text-3)",
                        }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, width: 18, textAlign: "center" }}>
                            {["A","B","C","D"][idx]}
                          </span>
                          <span style={{ flex: 1 }}>{label}</span>
                          {isCorrect  && <span style={{ fontSize: 10 }}>✓ Düzgün</span>}
                          {isSelected && !isCorrect && <span style={{ fontSize: 10 }}>✗ Sənin</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onBack}
        style={{
          width: "100%", maxWidth: 480, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg,var(--primary),var(--accent))",
          border: "none", color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: "pointer", fontFamily: "'Lexend Deca',sans-serif",
          boxShadow: "0 4px 20px var(--glow)",
        }}
      >Dashboarda qayıt</button>
    </div>
  );
}
