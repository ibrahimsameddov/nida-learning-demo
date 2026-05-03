/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Lexend Deca"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'bg-base':      'var(--bg-base)',
        'bg-elevated':  'var(--bg-elevated)',
        'bg-card':      'var(--bg-card)',
        'bg-muted':     'var(--bg-muted)',
        'bg-hero':      'var(--bg-hero)',
        'c-primary':    'var(--color-primary)',
        'c-mid':        'var(--color-mid)',
        'c-accent':     'var(--color-accent)',
        'c-success':    'var(--color-success)',
        'c-warning':    'var(--color-warning)',
        'c-danger':     'var(--color-danger)',
        'c-glow':       'var(--color-glow)',
        'text-1':       'var(--text-primary)',
        'text-2':       'var(--text-secondary)',
        'text-3':       'var(--text-tertiary)',
        'text-inv':     'var(--text-inverse)',
        'border-base':  'var(--border-base)',
        'border-card':  'var(--border-card)',
        'border-focus': 'var(--border-focus)',
      },
      borderRadius: {
        'xs':   'var(--r-xs)',
        'sm':   'var(--r-sm)',
        'md':   'var(--r-md)',
        'lg':   'var(--r-lg)',
        'xl':   'var(--r-xl)',
        'pill': 'var(--r-pill)',
      },
      boxShadow: {
        'sm':  'var(--shadow-sm)',
        'md':  'var(--shadow-md)',
        'btn': 'var(--shadow-btn)',
      },
      transitionTimingFunction: {
        'spring': 'var(--spring)',
        'smooth': 'var(--smooth)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-up':    'fadeUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        'scale-in':   'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-in':   'slideIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) scale(1)' },
          '50%':     { transform: 'translateY(-20px) scale(1.05)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.35' },
          '50%':     { opacity: '0.6' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
