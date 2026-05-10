import { Providers }     from "./providers";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import OfflineBanner     from "../components/layout/OfflineBanner";
import InstallPrompt     from "../components/ui/InstallPrompt";
import { BadgeModal, LevelUpModal, StreakDangerToast, WelcomeBackModal } from "../components/ui/Gamification";

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <Providers />
      <InstallPrompt />
      {/* Global gamification overlays — render regardless of route (covers quiz pages too) */}
      <BadgeModal />
      <LevelUpModal />
      <StreakDangerToast />
      <WelcomeBackModal />
    </ErrorBoundary>
  );
}
