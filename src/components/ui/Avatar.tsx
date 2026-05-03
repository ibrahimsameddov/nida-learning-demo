const SIZES = { sm: { w: 32, h: 32, fs: 12 }, md: { w: 40, h: 40, fs: 14 }, lg: { w: 52, h: 52, fs: 18 }, xl: { w: 64, h: 64, fs: 22 } }

interface AvatarProps {
  name?:    string
  size?:    keyof typeof SIZES
  onClick?: () => void
  style?:   React.CSSProperties
}

export function Avatar({ name = '', size = 'md', onClick, style = {} }: AvatarProps) {
  const s        = SIZES[size] || SIZES.md
  const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')

  return (
    <div
      onClick={onClick}
      className="spring-hover"
      style={{
        width: s.w, height: s.h, borderRadius: '50%',
        background: 'var(--primary)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Lexend Deca', sans-serif", fontWeight: 700, fontSize: s.fs,
        flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none', ...style,
      }}
    >
      {initials || '?'}
    </div>
  )
}

export default Avatar
