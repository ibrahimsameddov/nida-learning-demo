import { useThemeStore } from '../../stores/themeStore'

export default function ThemeToggle() {
  const { resolved, setTheme, theme } = useThemeStore()
  const dark = resolved === 'dark'

  const toggle = () => {
    // system → dark → light → dark → ...
    if (theme === 'system') setTheme(dark ? 'light' : 'dark')
    else setTheme(dark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Tema dəyiş"
      style={{
        width: 36, height: 36, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        cursor: 'pointer',
        transition: 'transform 0.35s var(--spring), background 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e  => { e.currentTarget.style.transform = 'scale(1.12)' }}
      onMouseLeave={e  => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseDown={e   => { e.currentTarget.style.transform = 'scale(0.93)' }}
      onMouseUp={e     => { e.currentTarget.style.transform = 'scale(1.12)' }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, userSelect: 'none' }}>
        {dark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
