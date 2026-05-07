import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/store/authContext";
import { useThemeStore } from "@/stores/themeStore";
import NidaLogo from "@/components/shared/NidaLogo";
import Avatar from "@/components/ui/Avatar";
import { Role } from "@/types/models";
import { XPBar, StreakBadge, BadgeModal, LevelUpModal, useStreakCheck } from "@/components/ui/Gamification";
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
    <header
      className="topbar"
      style={{
        background: isDark
          ? "color-mix(in srgb, var(--bg-primary) 80%, transparent)"
          : "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
      }}
    >
      {/* Left: back button OR name+id */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {!isHome && !showBack === false ? (
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
        ) : null}

        {isHome && (
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
                color: role === Role.Teacher ? "#4F87FF"
                     : role === Role.Parent  ? "#F4A261"
                     : "#00C9A7",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700, letterSpacing: "0.05em",
              }}>
                {displayId}
              </div>
            )}
          </div>
        )}

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
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
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

      {/* Gamification modals — global, rendered once */}
      <BadgeModal />
      <LevelUpModal />
    </header>
  );
}

export default GlassTopbar;
export { GlassTopbar as Topbar };
