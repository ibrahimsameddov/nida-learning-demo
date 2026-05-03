import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

interface StudentRowProps {
  name:      string;
  email?:    string;
  uniqueId?: string;
  status?:   string;
  score?:    number;
  onClick?:  () => void;
}

export default function StudentRow({ name, email, uniqueId, status, score, onClick }: StudentRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        borderBottom: "0.5px solid var(--border-card)",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "var(--bg-secondary)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <Avatar name={name} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {email && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{email}</div>}
      </div>
      {uniqueId && <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-tertiary)" }}>{uniqueId}</span>}
      {score !== undefined && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--theme-primary)" }}>{score}%</span>}
      {status && <Badge status={status} />}
    </div>
  );
}
