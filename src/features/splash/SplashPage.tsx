import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiTrophy } from 'react-icons/hi2';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import mainMenuBg from '../../assets/bd.png';

export default function SplashPage() {
  const { goTo } = usePhaseNavigation();

  const proceed = useCallback(() => {
    goTo('loading');
  }, [goTo]);

  useEffect(() => {
    const img = new Image();
    img.src = mainMenuBg;
  }, []);

  useEffect(() => {
    const timer = setTimeout(proceed, 3000);
    const handleKey = () => proceed();
    window.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [proceed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={proceed}
      onPointerDown={proceed}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 cursor-pointer overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.08)_0%,_transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.05)_0%,_transparent_60%)] animate-pulse [animation-delay:1s]" />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' as const }}
      >
        <HiTrophy className="w-24 h-24 text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.4)]" />
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent"
      >
        Football Star Pro
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-2 text-lg md:text-xl text-gray-500 font-light tracking-widest uppercase"
      >
        Career Mode
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
        className="absolute bottom-12 text-sm text-gray-600 tracking-widest uppercase"
      >
        Tap to Start
      </motion.p>
    </motion.div>
  );
}