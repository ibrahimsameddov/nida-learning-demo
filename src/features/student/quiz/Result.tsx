import { useState, useEffect } from "react";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlassTopbar as Topbar } from "@/components/layout/GlassTopbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { apiGetMyStatistics } from "@/lib/api";

// ─── Subject Radar (pure SVG) ─────────────────────────────────────────────────
function SubjectRadar({ stats }: { stats: any }) {
  if (!stats?.subjectStats?.length) return null;

  const items: { subject: string; percent: number }[] = stats.subjectStats.map((s: any) => ({
    subject: s.subject?.length > 8 ? s.subject.slice(0, 8) + "…" : s.subject,
    percent: Math.round(s.averagePercent ?? 0),
  }));

  const n = items.length;
  if (n < 3) return null;

  const cx = 110, cy = 110, maxR = 80;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const gridLevels = [25, 50, 75, 100];
  const polygon = (r: number) =>
    items.map((_, i) => { const p = pt(i, r); return `${p.x},${p.y}`; }).join(" ");

  const dataPoints = items.map((item, i) => pt(i, (item.percent / 100) * maxR));
  const dataPath   = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <div className="card" style={{ padding: "20px 14px" }}>
      <p style={{ fontFamily: "'Lexend Deca', 'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 16 }}>
        Fənn Müqayisəsi
      </p>
      <svg width="100%" viewBox="0 0 220 220" style={{ overflow: "visible" }}>
        {gridLevels.map(level => (
          <polygon key={level}
            points={polygon((level / 100) * maxR)}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1}
          />
        ))}
        {items.map((_, i) => {
          const p = pt(i, maxR);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />;
        })}
        <path d={dataPath} fill="var(--color-primary, #4ECDC4)" fillOpacity={0.18} stroke="var(--color-primary, #4ECDC4)" strokeWidth={2} />
        {items.map((item, i) => {
          const lp = pt(i, maxR + 18);
          return (
            <text key={i} x={lp.x} y={lp.y} fill="rgba(255,255,255,0.45)" fontSize={10}
              textAnchor="middle" dominantBaseline="middle" fontFamily="'Lexend Deca', sans-serif">
              {item.subject}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Stat kartı ───────────────────────────────────────────────────────────────
function StatCard({ value, label, color }: { value: any; label: string; color: string }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Lexend Deca', 'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 30,
        color: color || "var(--primary)", marginBottom: 4,
        textShadow: `0 0 20px ${color || "var(--glow)"}`,
      }}>
        {value}
      </div>
      <div style={{ color: "var(--text-3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Ana komponent ────────────────────────────────────────────────────────────
export default function Result() {
  const [backendStats, setBackendStats] = useState<any>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    apiGetMyStatistics()
      .then(data => setBackendStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh" }}>
      <FloatingOrbs />
      <Sidebar />
      <Topbar />
      <BottomNav />

      <main className="main-content">
        <div className="page-inner">

          <div>
            <h1 style={{ fontFamily: "'Lexend Deca', 'Lexend Deca', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-1)", marginBottom: 4 }}>
              Statistika
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: 13 }}>
              Güclü və zəif sahələrinizi izləyin
            </p>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <span className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : !backendStats ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <h3 style={{ fontFamily: "'Lexend Deca', 'Lexend Deca', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--text-1)", marginBottom: 6 }}>
                Hələ statistika yoxdur
              </h3>
              <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                Test həll etdikdən sonra nəticələriniz burada görünəcək
              </p>
            </div>
          ) : (
            <>
              {/* Stat kartları */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatCard value={backendStats.totalTests ?? 0}   label="Test sayı"   color="var(--accent)"   />
                <StatCard value={backendStats.averagePercent != null ? `${Math.round(backendStats.averagePercent)}%` : "—"} label="Orta nəticə" color="var(--success)" />
                <StatCard value={backendStats.bestPercent    != null ? `${Math.round(backendStats.bestPercent)}%`    : "—"} label="Ən yaxşı"    color="var(--primary)" />
                <StatCard value={backendStats.subjectStats?.length ?? 0} label="Fənn"  color="#FFA500"         />
              </div>

              {/* Fənn statistikası */}
              {backendStats.subjectStats?.length > 0 && (
                <div>
                  <p style={{ fontFamily: "'Lexend Deca', 'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 12 }}>
                    Fənn üzrə nəticələr
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {backendStats.subjectStats.map((s: any, i: number) => {
                      const pct    = Math.round(s.averagePercent ?? 0);
                      const isWeak = pct < 60;
                      return (
                        <div key={i} className="card" style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>{s.subject}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span className={`badge ${isWeak ? "badge-danger" : "badge-success"}`}>
                                {isWeak ? "Zəif" : "Güclü"}
                              </span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: isWeak ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <div className="progress">
                            <div className={`progress-bar${isWeak ? " danger" : ""}`} style={{ width: `${pct}%` }} />
                          </div>
                          {s.totalTests != null && (
                            <div style={{ marginTop: 6, color: "var(--text-3)", fontSize: 11 }}>{s.totalTests} test</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <SubjectRadar stats={backendStats} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
