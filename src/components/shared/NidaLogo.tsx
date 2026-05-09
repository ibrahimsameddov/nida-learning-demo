import { useAuthStore } from '@/stores/authStore'
import { Role } from '@/types/models'

// Role → logo rəngi xəritəsi
// Login səhifəsi seçilmiş rolu prop kimi ötürür
// Digər səhifələr auth store-dan avtomatik alır
const ROLE_COLORS: Record<string, string> = {
  [Role.Student]: '#4F87FF',
  [Role.Teacher]: '#A78BFA',
  [Role.Parent]:  '#F4A261',
  default:        '#C9A84C',
}

interface NidaLogoProps {
  size?:      number
  role?:      string
  className?: string
  style?:     React.CSSProperties
}

export default function NidaLogo({ size = 40, role: roleProp, className, style }: NidaLogoProps) {
  const storeRole  = useAuthStore(s => s.user?.role)
  const activeRole = roleProp ?? storeRole
  const color      = ROLE_COLORS[activeRole as string] ?? ROLE_COLORS.default

  // Qapı SVG-i: sol bar + perspektiv üst/alt barlar + sağ bar + nida işarəsi
  // viewBox: 72x90 (nisbət 1:1.25 — referans logoya uyğun)
  return (
    <svg
      width={size}
      height={Math.round(size * 1.25)}
      viewBox="0 0 72 90"
      fill="none"
      className={className}
      style={style}
      aria-label="NIDA logo"
    >
      {/* Sol sakuli bar — qapi soykeneci */}
      <rect x="0" y="0" width="12" height="90" fill={color} />

      {/* Ust bar — perspektiv bucaq */}
      <path d="M12 0 L72 8 L72 19 L12 11 Z" fill={color} />

      {/* Alt bar — perspektiv bucaq */}
      <path d="M12 79 L72 71 L72 82 L12 90 Z" fill={color} />

      {/* Sag bar — aciq qapinin kenari */}
      <rect x="61" y="8" width="11" height="74" fill={color} />

      {/* Nida isaresinin bedeni */}
      <rect x="33" y="24" width="7" height="30" rx="3.5" fill={color} />

      {/* Nida isaresinin noqtesi */}
      <circle cx="36.5" cy="66" r="4.5" fill={color} />
    </svg>
  )
}
