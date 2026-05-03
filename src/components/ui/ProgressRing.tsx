interface ProgressRingProps {
  value?: number;
  size?:  number;
  color?: string;
}

export function ProgressRing({ value = 72, size = 180, color }: ProgressRingProps) {
  const c    = color || "var(--primary)"
  const pct  = Math.min(100, Math.max(0, value))
  const r    = size * 0.43
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const cx = size / 2

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={size * 0.1}
        />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={c}
          strokeWidth={size * 0.1}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease", filter: `drop-shadow(0 0 6px ${c})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif", fontWeight: 800,
          fontSize: size * 0.17, color: "#fff", lineHeight: 1,
          textShadow: `0 0 20px ${c}`,
        }}>
          {value}%
        </span>
      </div>
    </div>
  );
}

export default ProgressRing;
