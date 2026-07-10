import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const FOOTBALL_QUOTES = [
  'Football is not just a game, it is a way of life.',
  'Talent wins games, but teamwork and intelligence win championships.',
  'Every great player was once a beginner who refused to give up.',
  'The pitch is where legends are written.',
  'Hard work beats talent when talent does not work hard.',
  'A champion is defined by how they rise after falling.',
  'Football is the beautiful game — play it with heart.',
  'Discipline, dedication, and desire: the three keys to glory.',
  'The ball is round, and the game lasts ninety minutes — anything is possible.',
  'Greatness is built one training session at a time.',
];

export default function LoadingScreen() {
  const { goTo } = usePhaseNavigation();
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % FOOTBALL_QUOTES.length);
    }, 2500);

    const proceedTimer = setTimeout(() => {
      goTo('welcome');
    }, 10000);

    return () => {
      clearInterval(quoteTimer);
      clearTimeout(proceedTimer);
    };
  }, [goTo]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.10)_0%,_transparent_70%)] animate-pulse" />

      <div className="absolute top-8 text-center">
        <p className="text-sm md:text-base font-bold tracking-[0.3em] text-indigo-300 uppercase">
          MADE BY SWAMPOD & MITHUN
        </p>
      </div>

      <div className="flex flex-col items-center px-6">
        <LoadingSpinner size="lg" label="Loading..." />

        <div className="mt-10 h-16 flex items-center justify-center max-w-xl text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-lg md:text-xl text-gray-300 font-light italic"
            >
              “{FOOTBALL_QUOTES[quoteIndex]}”
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
