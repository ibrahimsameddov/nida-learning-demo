interface NidaLogoProps {
  size?:    "sm" | "md" | "lg";
  variant?: "default" | "subtle";
  onClick?: () => void;
}

export default function NidaLogo({ size = "md", variant = "default", onClick }: NidaLogoProps) {
  const sizes = {
    sm: { box: 28, font: 13, radius: 8 },
    md: { box: 34, font: 15, radius: 10 },
    lg: { box: 56, font: 24, radius: 16 },
  };
  const s      = sizes[size] || sizes.md;
  const bg     = variant === "subtle" ? "rgba(255,255,255,0.15)" : "var(--theme-mid)";
  const border = variant === "subtle" ? "1px solid rgba(255,255,255,0.2)" : "none";

  return (
    <div
      onClick={onClick}
      style={{
        width: s.box, height: s.box, borderRadius: s.radius,
        background: bg, border,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Lexend Deca','Lexend Deca',sans-serif",
        fontWeight: 800, fontSize: s.font, color: "#fff",
        flexShrink: 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) rotate(-3deg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; }}
    >
      N<span style={{ color: "var(--theme-accent)", fontSize: "65%" }}>!</span>
    </div>
  );
}
