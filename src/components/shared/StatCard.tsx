// ── Heatmap Calendar ──────────────────────────────────────────────────────────

interface CalendarData { date: string; percentage?: number }

export function HeatmapCalendar({ data = [] }: { data?: CalendarData[] }) {
  const weeks = 15, days = 7, cells = weeks * days;
  const map: Record<string, number> = {};
  data.forEach(d => { if (d?.date) map[d.date.substring(0, 10)] = Math.round(d.percentage ?? 0); });

  const today = new Date();
  const grid  = Array.from({ length: cells }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (cells - 1 - i));
    const key = d.toISOString().substring(0, 10);
    return { key, val: map[key] ?? -1 };
  });

  const color = (v: number) =>
    v < 0   ? "rgba(255,255,255,0.04)" :
    v === 0 ? "rgba(255,255,255,0.06)" :
    v < 40  ? "#1a3a2a" :
    v < 60  ? "#0e6640" :
    v < 80  ? "#00c875" : "#00ff99";

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridTemplateRows: `repeat(${days}, 1fr)`, gap: 3, width: "100%", minWidth: 300 }}>
        {grid.map((c, i) => (
          <div key={i} title={c.val >= 0 ? `${c.key}: ${c.val}%` : c.key}
            style={{ aspectRatio: "1", borderRadius: 3, background: color(c.val), transition: "transform 0.15s", cursor: c.val >= 0 ? "pointer" : "default" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
        <span>Az</span>
        {["rgba(255,255,255,0.06)", "#1a3a2a", "#0e6640", "#00c875", "#00ff99"].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
        ))}
        <span>Çox</span>
      </div>
    </div>
  );
}

// ── Records Panel ─────────────────────────────────────────────────────────────

export function RecordsPanel({ stats }: { stats: any }) {
  const avg    = Math.round(stats?.averagePercentage ?? stats?.averagePercent ?? 0);
  const best   = Math.round(stats?.bestPercentage ?? avg);
  const total  = stats?.totalTests ?? 0;
  const streak = stats?.streak ?? stats?.currentStreak ?? 0;

  const records = [
    { icon: "🏆", label: "Ən Yüksək Xal",  val: `${best}%`,      color: "#FFD700" },
    { icon: "📊", label: "Orta Nəticə",     val: `${avg}%`,       color: "var(--primary)" },
    { icon: "📝", label: "Ümumi Test",       val: total,           color: "var(--accent)" },
    { icon: "🔥", label: "Gün Seriyası",     val: `${streak} gün`, color: "#FF6B35" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
      {records.map((r, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "16px 14px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${r.color}15, transparent 70%)` }} />
          <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 22, color: r.color, textShadow: `0 0 20px ${r.color}88` }}>{r.val}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{r.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Percentile Gauge ──────────────────────────────────────────────────────────

export function PercentileGauge({ avg }: { avg: number }) {
  const pct       = Math.min(100, Math.max(0, avg));
  const rank      = pct >= 90 ? "Top 10%" : pct >= 75 ? "Top 25%" : pct >= 50 ? "Top 50%" : "Alt 50%";
  const rankColor = pct >= 75 ? "#00e5a0" : pct >= 50 ? "var(--primary)" : "#ff8c42";
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          <circle cx={65} cy={65} r={r} fill="none" stroke={rankColor} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${rankColor})`, transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 20, color: rankColor }}>{pct}%</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>nəticə</div>
        </div>
      </div>
      <div style={{ marginTop: 12, padding: "6px 18px", borderRadius: 999, display: "inline-block", background: `${rankColor}22`, border: `1px solid ${rankColor}55`, color: rankColor, fontSize: 13, fontWeight: 800 }}>{rank}</div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8, lineHeight: 1.5 }}>
        Ümumi nəticə əsasında<br />hesablanmış reytinq
      </p>
    </div>
  );
}

// ── Weakness Bubbles ──────────────────────────────────────────────────────────

interface SubjectData { subject: string; avg: number }

export function WeaknessBubbles({ subjects, onPractice }: { subjects?: SubjectData[]; onPractice?: (s: string) => void }) {
  if (!subjects?.length) return <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Hələ məlumat yoxdur</p>;

  const sorted = [...subjects].sort((a, b) => a.avg - b.avg);
  const maxErr = Math.max(...sorted.map(s => 100 - s.avg), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorted.map((s, i) => {
        const errPct = 100 - s.avg;
        const barW   = (errPct / maxErr) * 100;
        const col    = s.avg >= 60 ? "#00e5a0" : s.avg >= 40 ? "#ff8c42" : "#ff4d6d";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 90, fontSize: 11, color: "rgba(255,255,255,0.6)", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subject}</div>
            <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barW}%`, borderRadius: 999, background: `linear-gradient(90deg,${col},${col}88)`, boxShadow: `0 0 8px ${col}66`, transition: "width 1s ease" }} />
            </div>
            <div style={{ width: 38, textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: col, flexShrink: 0 }}>{s.avg}%</div>
            {s.avg < 60 && onPractice && (
              <button onClick={() => onPractice(s.subject)} style={{ background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 8, color: "#ff4d6d", fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer", flexShrink: 0, fontFamily: "'Lexend Deca',sans-serif" }}>Məşq</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Speed vs Accuracy (SVG scatter replacement) ────────────────────────────────

export function SpeedAccuracyChart({ sessions = [] }: { sessions?: any[] }) {
  const data = sessions.length > 0 ? sessions.map(s => ({
    speed:    Math.round((s.totalQuestions ?? 10) / Math.max(s.durationSeconds ?? 600, 1) * 60),
    accuracy: Math.round(s.percentage ?? s.score ?? 0),
    tests:    s.totalQuestions ?? 10,
  })) : [
    { speed: 4, accuracy: 72, tests: 20 },
    { speed: 6, accuracy: 58, tests: 15 },
    { speed: 3, accuracy: 85, tests: 25 },
    { speed: 8, accuracy: 45, tests: 10 },
    { speed: 5, accuracy: 78, tests: 20 },
  ];

  const W = 280, H = 180, PAD = 30;
  const maxSpeed = Math.max(...data.map(d => d.speed), 1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = PAD + (H - PAD * 2) * (1 - v / 100);
        return (
          <g key={v}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={PAD - 4} y={y + 3} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="end">{v}%</text>
          </g>
        );
      })}
      {/* Points */}
      {data.map((d, i) => {
        const x = PAD + (d.speed / maxSpeed) * (W - PAD * 2);
        const y = PAD + (H - PAD * 2) * (1 - d.accuracy / 100);
        const r = Math.sqrt(d.tests) * 1.5;
        return (
          <circle key={i} cx={x} cy={y} r={r}
            fill="var(--color-primary, #4ECDC4)" fillOpacity={0.7}
            style={{ filter: 'drop-shadow(0 0 4px var(--color-primary, #4ECDC4))' }}
          >
            <title>Sürət: {d.speed} s/s · Doğruluk: {d.accuracy}%</title>
          </circle>
        );
      })}
      {/* Axis labels */}
      <text x={W / 2} y={H - 2} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="middle">Sürət (s/sual)</text>
    </svg>
  );
}
