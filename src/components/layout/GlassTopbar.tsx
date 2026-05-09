import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/store/authContext";
import { useThemeStore } from "@/stores/themeStore";
import NidaLogo from "@/components/shared/NidaLogo";
import Avatar from "@/components/ui/Avatar";
import { Role } from "@/types/models";
import { XPBar, StreakBadge, useStreakCheck } from "@/components/ui/Gamification";
import NotificationBell from "@/components/ui/NotificationBell";

const HOME_PATHS = ["/", "/teacher", "/parent"];

interface TopbarProps {
  showBack?: boolean;
}

export function GlassTopbar({ showBack = false }: TopbarProps) {
  const { userProfile } = useAuth();
  const { resolved: colorMode, setTheme } = useThemeStore();
  const toggleColorMode = () => setTheme(colorMode === "dark" ? "light" : "dark");
  const navigate  = useNavigate();
  const location  = useLocation();

  const isHome    = HOME_PATHS.includes(location.pathname);
  const name      = userProfile?.fullName || userProfile?.displayName || "";
  const firstName = name.split(" ")[0] || "İstifadəçi";
  const role      = userProfile?.role;
  const isTeacher = role === Role.Teacher;
  const isDark    = colorMode === "dark";
  const displayId = (userProfile as any)?.uniqueId || "";

  // Streak check on mount
  useStreakCheck();

  return (
    <header className="topbar">
      {/* Left: logo + name/id  OR  back button */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {isHome ? (
          <>
            <NidaLogo size={28} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700,
                fontSize: 14, color: "var(--text-1)", lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {isTeacher ? name : `Xoş gəldin, ${firstName}!`}
              </div>
              {displayId && (
                <div style={{
                  fontSize: 10,
                  color: role === Role.Teacher ? "#A78BFA"
                       : role === Role.Parent  ? "#F4A261"
                       : "#4F87FF",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700, letterSpacing: "0.05em",
                }}>
                  {displayId}
                </div>
              )}
            </div>
          </>
        ) : null}

        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(128,128,128,0.1)", border: "0.5px solid var(--border)",
              borderRadius: 10, padding: "6px 12px",
              color: "var(--text-2)", fontSize: 13, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            ← Geri
          </button>
        )}
      </div>

      {/* Right: XP + Streak + theme toggle + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Only show gamification for students */}
        {role === Role.Student && (
          <>
            <StreakBadge />
            <XPBar />
          </>
        )}

        {/* Notification bell — all authenticated roles */}
        <NotificationBell />

        <button
          onClick={toggleColorMode}
          title={isDark ? "İşıqlı rejim" : "Qaranlıq rejim"}
          style={{
            width: 34, height: 34, borderRadius: 9,
            border: "0.5px solid var(--border)",
            background: "rgba(255,255,255,0.08)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, transition: "transform 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)" }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <Avatar name={name} size="sm" onClick={() => navigate("/profile")} />
      </div>

    </header>
  );
}

export default GlassTopbar;
export { GlassTopbar as Topbar };
