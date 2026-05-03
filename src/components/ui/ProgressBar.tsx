const COLORS: Record<string, string> = {
  primary: "var(--theme-mid)",
  success: "var(--theme-success)",
  danger:  "var(--theme-danger)",
  warning: "var(--theme-warning)",
  accent:  "var(--theme-accent)",
};

interface ProgressBarProps {
  value?:  number;
  max?:    number;
  color?:  keyof typeof COLORS;
  height?: number;
}

export default function ProgressBar({ value = 0, max = 100, color = "primary", height = 4 }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height, borderRadius: "var(--radius-pill)", overflow: "hidden", background: "var(--border-card)" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        borderRadius: "var(--radius-pill)",
        background: COLORS[color] || COLORS.primary,
        transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}
