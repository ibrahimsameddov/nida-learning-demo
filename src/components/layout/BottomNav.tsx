import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/store/authContext";
import { Role }    from "@/types/models";

const STUDENT_NAV = [
  { path: "/",               end: true,  icon: "🏠", label: "Əsas"   },
  { path: "/subjects",       end: false, icon: "📚", label: "Fənlər" },
  { path: "/statistics",     end: false, icon: "📊", label: "Stat"   },
  { path: "/messages",       end: false, icon: "💬", label: "Mesaj"  },
  { path: "/profile",        end: false, icon: "👤", label: "Profil" },
];

const TEACHER_NAV = [
  { path: "/teacher",           end: true,  icon: "🏠", label: "Əsas"    },
  { path: "/teacher/groups",    end: false, icon: "📁", label: "Qruplar" },
  { path: "/teacher/exams",     end: false, icon: "📋", label: "İmtahan" },
  { path: "/teacher/analytics", end: false, icon: "📊", label: "Analitika" },
  { path: "/teacher/messages",  end: false, icon: "💬", label: "Mesaj"   },
];

const PARENT_NAV = [
  { path: "/parent",          end: true,  icon: "🏠", label: "Əsas"   },
  { path: "/parent/children", end: false, icon: "👦", label: "Uşaq"   },
  { path: "/parent/payments", end: false, icon: "💳", label: "Ödəniş" },
  { path: "/profile",         end: false, icon: "👤", label: "Profil" },
];

export function BottomNav() {
  const { userProfile } = useAuth();
  const role = userProfile?.role;
  const nav  = role === Role.Teacher ? TEACHER_NAV : role === Role.Parent ? PARENT_NAV : STUDENT_NAV;

  return (
    <nav className="bottom-nav">
      {nav.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          style={{ textDecoration: "none" }}
          className={({ isActive }) => `bnav-item${isActive ? " active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <span
                className="bnav-icon"
                style={{ display: 'inline-block', transition: 'transform 0.2s', transform: isActive ? 'scale(1.2)' : 'scale(1)' }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
