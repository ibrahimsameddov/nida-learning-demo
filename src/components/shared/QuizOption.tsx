interface QuizOptionProps {
  label:       string;
  text:        string;
  selected?:   boolean;
  correct?:    boolean;
  incorrect?:  boolean;
  disabled?:   boolean;
  onClick?:    () => void;
}

export default function QuizOption({ label, text, selected, correct, incorrect, disabled, onClick }: QuizOptionProps) {
  const getColors = () => {
    if (correct)   return { border: "#00e5a0", bg: "rgba(0,229,160,0.08)", color: "#00e5a0" };
    if (incorrect) return { border: "#ff4d6d", bg: "rgba(255,77,109,0.08)", color: "#ff4d6d" };
    if (selected)  return { border: "var(--primary)", bg: "rgba(var(--primary-rgb,0,212,255),0.08)", color: "var(--primary)" };
    return { border: "var(--border-card)", bg: "var(--bg-card)", color: "var(--text-primary)" };
  };

  const { border, bg, color } = getColors();

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "14px 16px",
        background: bg, border: `1.5px solid ${border}`,
        borderRadius: 12, cursor: disabled ? "default" : "pointer",
        textAlign: "left", transition: "border-color 0.2s, background 0.2s, transform 0.15s",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.01)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)" }}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.99)" }}
      onMouseUp={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.01)" }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: selected || correct || incorrect ? border : "var(--bg-secondary)",
        color: selected || correct || incorrect ? "#fff" : "var(--text-tertiary)",
        fontSize: 12, fontWeight: 700, flexShrink: 0,
        border: `1.5px solid ${border}`,
        transition: "background 0.2s, color 0.2s",
      }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color, lineHeight: 1.4, flex: 1 }}>{text}</span>
      {correct   && <span style={{ fontSize: 16 }}>✓</span>}
      {incorrect && <span style={{ fontSize: 16 }}>✗</span>}
    </button>
  );
}
