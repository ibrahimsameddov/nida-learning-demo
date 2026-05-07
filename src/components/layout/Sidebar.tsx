import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/store/authContext";
import { Role }    from "@/types/models";
import NidaLogo from "@/components/shared/NidaLogo";
import Avatar from "@/components/ui/Avatar";

const STUDENT_NAV = [
  { path: "/",               icon: "🏠", label: "Ana Səhifə"   },
  { path: "/subjects",       icon: "📚", label: "Fənlər"       },
  { path: "/homework",       icon: "📖", label: "Ev Tapşırığı" },
  { path: "/exams",          icon: "📝", label: "İmtahanlar"   },
  { path: "/statistics",     icon: "📊", label: "Statistika"   },
  { path: "/messages",       icon: "💬", label: "Mesajlar"     },
  { path: "/wrong-questions",icon: "🔁", label: "Yanlış Suallar"},
  { path: "/profile",        icon: "👤", label: "Profil"       },
];

const TEACHER_NAV = [
  { path: "/teacher",            icon: "🏠", label: "Ana Səhifə" },
  { path: "/teacher/students",   icon: "👨‍🎓", label: "Şagirdlər" },
  { path: "/teacher/groups",     icon: "👥", label: "Qruplar"    },
  { path: "/teacher/homework",   icon: "📖", label: "Ev Tapşırığı" },
  { path: "/teacher/exams",      icon: "📋", label: "İmtahanlar" },
  { path: "/teacher/tasks",      icon: "📝", label: "Tapşırıqlar" },
  { path: "/teacher/analytics",  icon: "📊", label: "Analitika"  },
  { path: "/teacher/messages",   icon: "💬", label: "Mesajlar"   },
  { path: "/profile",            icon: "👤", label: "Profil"     },
];

const PARENT_NAV = [
  { path: "/parent",             icon: "🏠", label: "Ana Səhifə"   },
  { path: "/parent/children",   icon: "👦", label: "Uşaqlarım"    },
  { path: "/parent/statistics", icon: "📊", label: "Statistika"   },
  { path: "/parent/teachers",   icon: "👨‍🏫", label: "Müəllimlər"  },
  { path: "/parent/messages",   icon: "💬", label: "Mesajlar"     },
  { path: "/parent/payments",   icon: "💳", label: "Balans/Ödəniş"},
  { path: "/profile",           icon: "👤", label: "Profil"       },
];

const ROLE_HOME: Partial<Record<Role, string>> = {
  [Role.Teacher]: "/teacher",
  [Role.Parent]:  "/parent",
  [Role.Student]: "/",
};

const ROLE_LABEL: Partial<Record<Role, string>> = {
  [Role.Student]: "şagird",
  [Role.Teacher]: "müəllim",
  [Role.Parent]:  "valideyn",
};

export function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const role = userProfile?.role ?? Role.Student;
  const nav  = role === Role.Teacher ? TEACHER_NAV : role === Role.Parent ? PARENT_NAV : STUDENT_NAV;
  const name = userProfile?.fullName || userProfile?.displayName || "";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "0 4px", cursor: "pointer" }}
        onClick={() => navigate(ROLE_HOME[role] ?? "/")}
      >
        <NidaLogo size="sm" />
        <span style={{ fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
          Nida
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/" || item.path === "/teacher" || item.path === "/parent" || item.path === "/profile"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <>
                <span
                  className="nav-icon"
                  style={{ display: 'inline-block', transition: 'transform 0.2s', transform: isActive ? 'scale(1.2)' : 'scale(1)' }}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 10px", borderTop: "0.5px solid var(--border)", marginTop: "auto" }}>
        <Avatar name={name} size="sm" onClick={() => navigate("/profile")} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name || "İstifadəçi"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "capitalize" }}>
            {ROLE_LABEL[role] ?? role}
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          title="Çıxış"
          style={{ background: "transparent", border: "none", color: "var(--text-3)", fontSize: 16, cursor: "pointer", lineHeight: 1, transition: "opacity 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.6" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
