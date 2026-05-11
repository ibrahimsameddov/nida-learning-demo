# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server (localhost:5173)
npm run build      # TypeScript compile + Vite production build
npm run preview    # Preview production build locally
npx tsc --noEmit   # Type-check only (no tests exist)
firebase deploy --only firestore:rules   # Deploy Firestore security rules
```

There are no test files in this project.

## Architecture

**Stack:** React 18 + TypeScript + Vite + Firebase (Auth + Firestore) + Zustand + TanStack Query + Framer Motion + PWA

### Data Layer

All data goes through Firestore directly from the client — there is no active backend. `src/lib/api.ts` exports `api*` functions that are thin wrappers over `db*` functions. An Axios instance (`api`) and a Spring Boot backend integration exist but are inactive; login falls back to Firebase when the backend is unreachable.

`src/lib/db.ts` is a barrel re-export of 12 domain files:

| File | Domain |
|------|--------|
| `db.profile.ts` | User profiles, public search, uniqueId generation |
| `db.stats.ts` | Quiz stats, results, `dbSaveTestResult` |
| `db.notifications.ts` | Notifications, `dbWriteNotification`, `dbNotifyGroup` |
| `db.groups.ts` | Groups, group messages, homework results, student stats |
| `db.permissions.ts` | Teacher↔student permission flow |
| `db.exams.ts` | Exams, sinaq (practice) exams, attempts |
| `db.homeworks.ts` | Homework CRUD and attempts |
| `db.parent.ts` | Parent–child connection requests |
| `db.messages.ts` | Teacher↔parent and direct messages |
| `db.payments.ts` | Balance, top-up, payment history |
| `db.misc.ts` | Dashboard layout, interventions, reports, live sessions |
| `db.shared.ts` | `db`, `auth`, `uid()`, `tsToIso()` — imported by all domain files |

`uid()` in `db.shared.ts` reads from Zustand `authStore` first, then Firebase `auth.currentUser` as fallback.

### State Management

Zustand stores in `src/stores/`:

- **`authStore`** — persisted to `localStorage` (`nida-auth`). Source of truth for the current user, token, and role. `useAuth()` hook (`src/hooks/useAuth.ts`) is a thin wrapper that adds role booleans.
- **`gamificationStore`** — persisted. XP, level, streak, badges, multipliers. `addXP()` auto-awards badges. `checkStreak()` called on every `PageWrapper` mount via `useStreakCheck()`.
- **`themeStore`** — persisted. Defaults to `'light'`. Resolved theme written to `document.documentElement` as `data-theme` attribute.
- **`notificationStore`** — in-memory. Receives real-time notifications from socket.
- **`teacherGamificationStore`** — separate gamification for teacher role.

### Routing & Layout

`src/app/router.tsx` — all routes lazy-loaded. Three guard layers: `AuthGuard` (token check) → `RoleGuard` (role check) → `PageWrapper` (layout).

**`PageWrapper`** wraps most pages and provides: `Sidebar` + `GlassTopbar` + `BottomNav` + `FAB` + page transition animation. Quiz routes (`/quiz/:sessionId`, `/math/quiz/:topicId`, `/topic-quiz`) intentionally skip PageWrapper — they render full-screen.

**`App.tsx`** renders gamification overlays (`BadgeModal`, `LevelUpModal`, `StreakDangerToast`, `WelcomeBackModal`) at root level so they appear on all routes including quiz routes.

### Auth Flow

Login (`useLogin` mutation):
1. Firebase Auth (`signInWithEmailAndPassword`)
2. Try Spring Boot `/api/auth/firebase` with Firebase ID token → if backend responds, use its JWT
3. If backend fails → Firebase fallback: load profile from Firestore, build user object from it
4. `setToken` + `setUser` into `authStore`

Role is stored in `userProfiles/{uid}.role` as uppercase string: `'STUDENT'`, `'TEACHER'`, `'PARENT'`, `'ADMIN'`.

### CSS / Theming

`src/index.css` defines CSS custom properties. Theme switching via `data-theme="light|dark"` on `<html>`. Role switching via `data-role="student|teacher|parent"` on `<body>` (set by PageWrapper).

Sidebar and topbar always use dark backgrounds regardless of theme — handled by `.sidebar` and `.topbar` CSS classes which override tokens using `var(--bg-hero)`.

### Gamification UI

`src/components/ui/Gamification.tsx` exports all gamification components. `XPMultiplierReveal` is used inside quiz result screens for slot-machine XP reveal. Variable reward schedule: 1× (55%), 1.5× (25%), 2× (15%), 3× (5%).

### Infrastructure

- **Firebase project:** `nida-learning-platform` — config is hardcoded in `firebaseConfig.ts`, no env vars needed
- **Socket.io** (`src/lib/socket.ts`): disabled by default; only activates when `VITE_SOCKET_ENABLED=true`
- **PWA:** Workbox service worker via `vite-plugin-pwa`; `devOptions.enabled: true` so SW runs in dev too
- **`react-hot-toast`** aliased to `src/lib/toast-shim.tsx` (real package not installed)
- **TanStack Query** default stale time: 2 min; offline-first mode enabled
- **Vercel** deployment: auto-deploys on push to `main`; no env vars required (Firebase config is hardcoded)

### Firestore Security Rules

Rules are in `firestore.rules`. Key invariants:
- `userProfiles/{uid}/**` — owner-only read/write; other users can write to subcollections `notifications/` and `received/`
- Teacher-only write: `groups`, `homeworks`, `sinaqExams`, `exams`, `groupMessages` — enforced via `get()` role lookup
- `publicProfiles` — readable by all authenticated users, writable only by owner
