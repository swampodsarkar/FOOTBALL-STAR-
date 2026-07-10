import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from '../components/layout/AppShell';

const SplashPage = lazy(() => import('../features/splash/SplashPage'));
const WelcomePage = lazy(() => import('../features/welcome/WelcomePage'));
const CreatePlayerPage = lazy(() => import('../features/createPlayer/CreatePlayerPage'));
const SelectLeaguePage = lazy(() => import('../features/selectLeague/SelectLeaguePage'));
const SelectClubPage = lazy(() => import('../features/selectClub/SelectClubPage'));
const StartOffersPage = lazy(() => import('../features/selectLeague/StartOffersPage'));
const HomePage = lazy(() => import('../features/home/HomePage'));
const CalendarPage = lazy(() => import('../features/calendar/CalendarPage'));
const MatchPage = lazy(() => import('../features/match/MatchPage'));
const TrainingPage = lazy(() => import('../features/training/TrainingPage'));
const TransferPage = lazy(() => import('../features/transfers/TransferPage'));
const InjuryPage = lazy(() => import('../features/injuries/InjuryPage'));
const LifestylePage = lazy(() => import('../features/lifestyle/LifestylePage'));
const AwardsPage = lazy(() => import('../features/awards/AwardsPage'));
const NationalTeamPage = lazy(() => import('../features/nationalTeam/NationalTeamPage'));
const LeagueHubPage = lazy(() => import('../features/leagueHub/LeagueHubPage'));
const NewsPage = lazy(() => import('../features/news/NewsPage'));
const SocialPage = lazy(() => import('../features/social/SocialPage'));
const CareerTimelinePage = lazy(() => import('../features/careerTimeline/CareerTimelinePage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' as const }}
        className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

function CareerLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SuspenseWrapper><SplashPage /></SuspenseWrapper>} />
        <Route path="/welcome" element={<SuspenseWrapper><WelcomePage /></SuspenseWrapper>} />
        <Route path="/career/new/player" element={<SuspenseWrapper><CreatePlayerPage /></SuspenseWrapper>} />
        <Route path="/career/new/league" element={<SuspenseWrapper><SelectLeaguePage /></SuspenseWrapper>} />
        <Route path="/career/new/club" element={<SuspenseWrapper><SelectClubPage /></SuspenseWrapper>} />
        <Route path="/career/new/offers" element={<SuspenseWrapper><StartOffersPage /></SuspenseWrapper>} />

        <Route path="/career/home" element={<SuspenseWrapper><CareerLayout><HomePage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/calendar" element={<SuspenseWrapper><CareerLayout><CalendarPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/match" element={<SuspenseWrapper><CareerLayout><MatchPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/training" element={<SuspenseWrapper><CareerLayout><TrainingPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/transfers" element={<SuspenseWrapper><CareerLayout><TransferPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/injuries" element={<SuspenseWrapper><CareerLayout><InjuryPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/lifestyle" element={<SuspenseWrapper><CareerLayout><LifestylePage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/awards" element={<SuspenseWrapper><CareerLayout><AwardsPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/national" element={<SuspenseWrapper><CareerLayout><NationalTeamPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/league" element={<SuspenseWrapper><CareerLayout><LeagueHubPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/news" element={<SuspenseWrapper><CareerLayout><NewsPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/social" element={<SuspenseWrapper><CareerLayout><SocialPage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/timeline" element={<SuspenseWrapper><CareerLayout><CareerTimelinePage /></CareerLayout></SuspenseWrapper>} />
        <Route path="/career/settings" element={<SuspenseWrapper><CareerLayout><SettingsPage /></CareerLayout></SuspenseWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}
