const STYLES: Record<string, { bg: string; color: string; border: string }> = {
  aktiv:     { bg: "rgba(104,211,145,0.15)", color: "#22a870", border: "rgba(104,211,145,0.3)" },
  passiv:    { bg: "rgba(252,129,129,0.15)", color: "#e85555", border: "rgba(252,129,129,0.3)" },
  normal:    { bg: "rgba(126,200,227,0.15)", color: "var(--color-mid)", border: "rgba(126,200,227,0.3)" },
  pending:   { bg: "rgba(246,173,85,0.15)",  color: "#d97706", border: "rgba(246,173,85,0.3)"  },
  completed: { bg: "rgba(104,211,145,0.15)", color: "#22a870", border: "rgba(104,211,145,0.3)" },
  overdue:   { bg: "rgba(252,129,129,0.15)", color: "#e85555", border: "rgba(252,129,129,0.3)" },
  active:    { bg: "rgba(104,211,145,0.15)", color: "#22a870", border: "rgba(104,211,145,0.3)" },
  passive:   { bg: "rgba(252,129,129,0.15)", color: "#e85555", border: "rgba(252,129,129,0.3)" },
};

const LABELS: Record<string, string> = {
  aktiv: "Aktiv", passiv: "Passiv", active: "Aktiv", passive: "Passiv",
  normal: "Normal", pending: "Gözləyir", completed: "Tamamlandı", overdue: "Vaxtı keçdi",
};

interface BadgeProps {
  status: string;
}

export default function Badge({ status }: BadgeProps) {
  const s = STYLES[status?.toLowerCase()] || STYLES.normal;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: "var(--r-pill)",
      background: s.bg, color: s.color,
      border: `0.5px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>
      {LABELS[status?.toLowerCase()] || status}
    </span>
  );
}

export { Badge };
export { Badge as StatusBadge };
