# NIDA — Senior Frontend Developer Guidelines & Requirements

**10/10 Keyfiyyət Standartı**
Sen 10+ il təcrübəli senior frontend developer kimi davranırsan.
Aşağıdakı hər tapşırığı professional standartda icra et.
Heç bir köşəni kəsmə. Heç bir detali atlama.

## 0. LAYİHƏ STRUKTURU — İLK ADDIM
Mövcud strukturu bu şəkildə yenidən təşkil et:
```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx          # React Router v6 lazy routes
│   └── providers.tsx       # Bütün provider-lər burada
│
├── assets/
│   └── fonts/
│
├── components/
│   ├── ui/                 # Atom komponentlər
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Input.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/             # Layout komponentlər
│   │   ├── GlassTopbar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageWrapper.tsx
│   │
│   └── shared/             # Paylaşılan domain komponentlər
│       ├── NidaLogo.tsx
│       ├── ThemeToggle.tsx
│       ├── SubjectCard.tsx
│       ├── StatCard.tsx
│       ├── StudentRow.tsx
│       └── QuizOption.tsx
│
├── features/               # Feature-based modullar
│   ├── auth/
│   ├── student/
│   ├── teacher/
│   └── parent/
│
├── hooks/                  # Global hooks
│   ├── useTheme.ts
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   └── useIntersection.ts
│
├── lib/                    # Utility-lər
│   ├── api.ts              # Axios instance
│   ├── socket.ts           # Socket.io singleton
│   ├── queryClient.ts      # React Query config
│   ├── validations.ts      # Zod schemas
│   └── utils.ts
│
├── stores/                 # Zustand store-lar
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── notificationStore.ts
│
├── styles/
│   ├── index.css           # CSS variables + base
│   └── animations.css      # Keyframes
│
└── types/                  # Global TypeScript tiplər
    ├── api.ts
    ├── models.ts
    └── enums.ts
```

## MÜTLƏQ RİAYƏT EDİLƏCƏK QEYDLƏR
- `ease` / `linear` animasiya YASAQDIR — yalnız `cubic-bezier(0.34,1.56,0.64,1)`
- Hardcoded rəng (`#fff`, `black`, `#333`) YASAQDIR — yalnız `var(--...)`
- `any` tipi TypeScript-də YASAQDIR — düzgün tip yaz
- Component 150 sətrdən böyükdürsə — parçala
- Hər `useEffect`-in cleanup funksiyası olmalıdır
- Hər `async` funksiya `try-catch` ilə əhatə olunmalıdır
- `console.log` production-da olmamalıdır — yalnız `console.error`/`console.warn`
- Hər form `react-hook-form` + `zod` ilə idarə olunmalıdır
- Hər data fetching React Query ilə — birbaşa `useEffect` + `fetch` YASAQDIR
- `transform: translateZ(0)` + `will-change: transform` — bütün animated elementlərdə
- Skeleton loading — hər data yüklənən yerdə
- ErrorBoundary — hər route-un ətrafında
- `aria-*` atributlar — bütün interaktiv elementlərdə
- `key` prop — index ilə deyil, id ilə
