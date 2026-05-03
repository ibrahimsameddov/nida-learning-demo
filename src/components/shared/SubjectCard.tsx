import ProgressBar from "@/components/ui/ProgressBar";

interface SubjectCardProps {
  icon?:    React.ReactNode;
  name:     string;
  done?:    number;
  total?:   number;
  onClick?: () => void;
  badge?:   string;
  color?:   string;
}

export default function SubjectCard({ icon, name, done = 0, total = 1, onClick, badge, color = "primary" }: SubjectCardProps) {
  const pct = Math.round((done / total) * 100);
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: "var(--radius-md)",
        background: "var(--bg-card)", border: "0.5px solid var(--border-card)",
        boxShadow: "var(--shadow-card)", cursor: onClick ? "pointer" : "default",
        marginBottom: 10,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease",
        transform: "translateZ(0)", willChange: "transform",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02) translateZ(0)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateZ(0)"; e.currentTarget.style.borderColor = "var(--border-card)"; }}
      onMouseDown={e  => { e.currentTarget.style.transform = "scale(0.97) translateZ(0)"; }}
      onMouseUp={e    => { e.currentTarget.style.transform = "scale(1.02) translateZ(0)"; }}
    >
      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          {badge && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: "var(--radius-pill)", background: "var(--theme-glow)", color: "var(--theme-mid)", flexShrink: 0 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 5 }}>{done} / {total} sual · {pct}%</div>
        <ProgressBar value={done} max={total} color={color as any} height={3} />
      </div>

      <span style={{ color: "var(--text-tertiary)", fontSize: 16, flexShrink: 0 }}>›</span>
    </div>
  );
}
