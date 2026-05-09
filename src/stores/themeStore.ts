import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme:    Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

function applyResolved(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme:    'light',
      resolved: 'light',

      setTheme: (theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme
        applyResolved(resolved)
        set({ theme, resolved })
      },
    }),
    { name: 'nida-theme' }
  )
)

// İlk yükləmədə DOM-a tətbiq et
applyResolved(useThemeStore.getState().resolved)

// Sistem temasını izlə
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') setTheme('system')
  })
