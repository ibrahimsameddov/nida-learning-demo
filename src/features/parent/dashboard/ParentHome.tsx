// @ts-nocheck
﻿import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/features/auth/store/authContext';
import { apiGetUserByUniqueId, apiGetChildStatistics, apiGetChildResults } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/GlassTopbar';
import { BottomNav } from '@/components/layout/BottomNav';
import GlassCard from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import toast, { Toaster } from "react-hot-toast";
import { normalizeSubjectStats } from '@/lib/utils';

const CHILD_KEY = "nida_linked_child";

// ── Övlad axtarış ekranı ──────────────────────────────────────────────────────
function SearchChildScreen({ onLinked }) {
  const [uniqueId, setUniqueId] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!uniqueId.trim()) return;
    setLoading(true);
    try {
      const data = await apiGetUserByUniqueId(uniqueId.trim());
      if (!data) { toast.error("Şagird tapılmadı. Unikal ID-ni yoxlayın."); return; }
      const role = (data.role ?? "").toLowerCase();
      if (role && role !== "student") { toast.error("Bu ID bir şagirdə aid deyil."); return; }
      const child = {
        uniqueId: data.uniqueId ?? uniqueId.trim(),
        fullName: data.fullName || "Şagird",
        email:    data.email || "",
        role:     "student",
      };
      localStorage.setItem(CHILD_KEY, JSON.stringify(child));
      onLinked(child);
      toast.success("Övlad hesabı bağlandı!");
    } catch {
      toast.error("Şagird tapılmadı. Unikal ID-ni yoxlayın.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>👨‍👩‍👧</div>
          <h1 style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>
            Övladınızı bağlayın
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
            Övladınızın NIDA hesabındakı unikal ID-ni daxil edin
          </p>
        </div>

        <GlassCard style={{ padding: 24 }}>
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
                Şagird unikal ID-si
              </label>
              <input
                className="input" value={uniqueId}
                onChange={e => setUniqueId(e.target.value)}
                placeholder="məs: STU-0001" autoFocus
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border-card)", color: "var(--text-primary)" }}
              />
            </div>
            <button type="submit" disabled={loading || !uniqueId.trim()} className="btn btn-primary btn-full"
              style={{ background: "var(--theme-mid)", boxShadow: "var(--shadow-btn)" }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : "Axtar və bağla"}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Ana komponent ─────────────────────────────────────────────────────────────
export default function ParentHome() {
  useAuth();
  useNavigate();

  const [child,   setChild]   = useState(null);
  const [stats,   setStats]   = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CHILD_KEY);
    if (saved) { try { setChild(JSON.parse(saved)); } catch { localStorage.removeItem(CHILD_KEY); } }
  }, []);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    Promise.allSettled([
      apiGetChildStatistics(child.email),
      child.email ? apiGetChildResults(child.email) : Promise.resolve([]),
    ]).then(([statsRes, resultsRes]) => {
      if (statsRes.status === "fulfilled")   setStats(statsRes.value);
      if (resultsRes.status === "fulfilled") setResults(Array.isArray(resultsRes.value) ? resultsRes.value : []);
    }).finally(() => setLoading(false));
  }, [child]);

  const handleUnlink = () => { localStorage.removeItem(CHILD_KEY); setChild(null); setStats(null); setResults([]); };

  if (!child) {
    return (
      <>
        <Toaster position="top-center" />
        <SearchChildScreen onLinked={setChild} />
      </>
    );
  }

  const avg      = stats ? Math.round(stats.averagePercent ?? stats.averagePercentage ?? 0) : null;
  const best     = stats?.bestPercent ? Math.round(stats.bestPercent) : null;
  const total    = stats?.totalTests ?? null;
  const improved = avg != null && avg >= 60;
  const subjects = normalizeSubjectStats(stats?.subjectStats);

  const initials = child.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString("az-AZ", { day: "2-digit", month: "short" }) : "";

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <Toaster position="top-center" toastOptions={{ style: { background: "var(--bg-card)", color: "var(--text-primary)", border: "0.5px solid var(--border-card)", borderRadius: 12 } }} />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          {/* ── Hero: övlad karti ─────────────────────────────────────── */}
          <div style={{
            borderRadius: "var(--radius-xl)", padding: "20px",
            background: "var(--bg-hero)",
            border: "0.5px solid var(--border-accent)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--theme-mid)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Lexend Deca',sans-serif", fontWeight: 700, fontSize: 17, color: "#fff",
                border: "2px solid var(--theme-accent)",
              }}>{initials}</div>
              <div>
                <div style={{ fontFamily: "'Lexend Deca',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-on-dark)", marginBottom: 4 }}>
                  {child.fullName}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,0.12)", color: "var(--text-on-dark-muted)" }}>
                    Şagird
                  </span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,0.08)", color: "var(--text-on-dark-muted)" }}>
                    ID: {child.uniqueId}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "14px 0" }}>
                <span className="spinner" style={{ width: 24, height: 24 }} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { val: total != null ? total : "—",        lbl: "Test",    tc: "var(--text-on-dark)",   bg: "rgba(255,255,255,0.1)"  },
                  { val: avg  != null ? `${avg}%`  : "—",   lbl: "Orta bal",tc: "var(--theme-success)",  bg: "rgba(104,211,145,0.2)"  },
                  { val: best != null ? `${best}%` : "—",   lbl: "Rekord",  tc: "var(--theme-accent)",   bg: "rgba(126,200,227,0.15)" },
                ].map(s => (
                  <div key={s.lbl} style={{ borderRadius: "var(--radius-sm)", padding: "10px 8px", textAlign: "center", background: s.bg }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 18, color: s.tc, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-on-dark-muted)", marginTop: 3 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Analiz karti ──────────────────────────────────────────── */}
          {stats && (
            <GlassCard accent={improved} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{improved ? "📈" : "⚠️"}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 5 }}>
                    {improved ? "Övladınız yaxşı inkişaf edir" : "Bəzi fənlərə diqqət lazımdır"}
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.6 }}>
                    Orta nəticə:{" "}
                    <span style={{ color: improved ? "var(--theme-success)" : "var(--theme-warning)", fontWeight: 700 }}>{avg}%</span>
                    {(() => {
                      const weak = subjects.filter(s => (s.averagePercent ?? 0) < 60).map(s => s.subject);
                      return weak.length > 0
                        ? `. ${weak.join(", ")} fənlərindəki nəticələrə diqqət yetirin.`
                        : ". Nəticələr qənaətbəxşdir.";
                    })()}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* ── Fənn üzrə irəliləyiş ─────────────────────────────────── */}
          {subjects.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Fənn üzrə irəliləyiş
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {subjects.map((s, i) => {
                  const pct    = Math.round(s.averagePercent ?? 0);
                  const isWeak = pct < 60;
                  return (
                    <GlassCard key={i} style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{s.subject}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: "var(--radius-pill)", background: isWeak ? "rgba(252,129,129,0.12)" : "rgba(104,211,145,0.12)", color: isWeak ? "var(--theme-danger)" : "var(--theme-success)", border: `0.5px solid ${isWeak ? "rgba(252,129,129,0.3)" : "rgba(104,211,145,0.3)"}`, fontWeight: 600 }}>
                            {isWeak ? "Zəif" : "Güclü"}
                          </span>
                          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </div>
                      <ProgressBar value={pct} max={100} color={isWeak ? "danger" : "success"} height={4} />
                    </GlassCard>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Son nəticələr ──────────────────────────────────────────── */}
          {results.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Son nəticələr
              </p>
              <GlassCard style={{ padding: "8px 14px" }}>
                {results.slice(0, 5).map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: i < Math.min(results.length, 5) - 1 ? "0.5px solid var(--border-card)" : "none",
                  }}>
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{r.subject || r.title || "Test"}</p>
                      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{fmtDate(r.completedAt || r.date)}</p>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: (r.percent ?? 0) >= 60 ? "var(--theme-success)" : "var(--theme-danger)" }}>
                      {r.percent ?? 0}%
                    </span>
                  </div>
                ))}
              </GlassCard>
            </>
          )}

          {/* ── Əlavə linklər ─────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={handleUnlink} style={{ fontSize: 12, padding: "7px 14px", borderRadius: "var(--radius-pill)", background: "rgba(252,129,129,0.1)", color: "var(--theme-danger)", border: "0.5px solid rgba(252,129,129,0.25)", cursor: "pointer", fontWeight: 600 }}>
              🔗 Bağlantını sil
            </button>
            <button onClick={() => navigate("/notifications")} style={{ fontSize: 12, padding: "7px 14px", borderRadius: "var(--radius-pill)", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "0.5px solid var(--border-card)", cursor: "pointer", fontWeight: 500 }}>
              📩 Bildirişlər
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

