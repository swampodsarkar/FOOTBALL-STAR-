import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiCalendar,
  HiAcademicCap,
  HiTrophy,
  HiArrowTrendingUp,
  HiNewspaper,
  HiHeart,
  HiShoppingBag,
  HiStar,
  HiClock,
  HiBars3,
  HiXMark,
  HiCog6Tooth,
  HiWallet,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/career/home', icon: <HiHome className="w-5 h-5" /> },
  { label: 'Calendar', path: '/career/calendar', icon: <HiCalendar className="w-5 h-5" /> },
  { label: 'Training', path: '/career/training', icon: <HiAcademicCap className="w-5 h-5" /> },
  { label: 'League', path: '/career/league', icon: <HiTrophy className="w-5 h-5" /> },
  { label: 'Transfers', path: '/career/transfers', icon: <HiArrowTrendingUp className="w-5 h-5" /> },
  { label: 'News', path: '/career/news', icon: <HiNewspaper className="w-5 h-5" /> },
  { label: 'Social', path: '/career/social', icon: <HiHeart className="w-5 h-5" /> },
  { label: 'Lifestyle', path: '/career/lifestyle', icon: <HiShoppingBag className="w-5 h-5" /> },
  { label: 'Awards', path: '/career/awards', icon: <HiStar className="w-5 h-5" /> },
  { label: 'Timeline', path: '/career/timeline', icon: <HiClock className="w-5 h-5" /> },
];

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const player = useGameStore((s) => s.player);
  const currentSeason = useGameStore((s) => s.currentSeason);
  const seasonWeek = useGameStore((s) => s.seasonWeek);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside
        className={`fixed lg:static z-40 h-screen transition-all duration-300 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col
          ${sidebarOpen ? 'w-60' : 'w-16'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center h-16 px-4 border-b border-gray-800/50">
          {sidebarOpen ? (
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Football Career
            </span>
          ) : (
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mx-auto">
              FC
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    ${sidebarOpen ? '' : 'justify-center'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-indigo-500/20"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="relative z-10 text-sm font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <HiXMark className="w-5 h-5" /> : <HiBars3 className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">S{currentSeason}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">W{seasonWeek}</span>
          </div>

          <div className="flex-1" />

          {player && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <HiWallet className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300 font-medium">
                  £{player.bankBalance?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {player.ovr}
                </span>
                <span className="text-sm text-gray-300 font-medium">{player.name}</span>
                <span className="text-lg">{player.nationality}</span>
              </div>
            </div>
          )}

          <Link
            to="/career/settings"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiCog6Tooth className="w-5 h-5" />
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              onClick={() => removeNotification(n.id)}
              className={`px-4 py-3 rounded-xl shadow-lg border cursor-pointer backdrop-blur-lg
                ${n.type === 'success' ? 'bg-emerald-900/80 border-emerald-700/50 text-emerald-200' : ''}
                ${n.type === 'error' ? 'bg-rose-900/80 border-rose-700/50 text-rose-200' : ''}
                ${n.type === 'warning' ? 'bg-amber-900/80 border-amber-700/50 text-amber-200' : ''}
                ${n.type === 'info' ? 'bg-indigo-900/80 border-indigo-700/50 text-indigo-200' : ''}
              `}
            >
              <p className="text-sm font-medium">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
