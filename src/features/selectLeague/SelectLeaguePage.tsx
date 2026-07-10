import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiCheck, HiArrowPath } from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Button from '../../components/ui/Button';
import { SUPPORTED_LEAGUES, buildRealLeague, getLeagueLogos } from '../../services/footballData';
import type { LeagueName } from '../../types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const cardItem = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface SelectedLeague {
  code: string;
  name: LeagueName;
  country: string;
  flag: string;
}

export default function SelectLeaguePage() {
  const { goTo } = usePhaseNavigation();
  const [selected, setSelected] = useState<SelectedLeague | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logos, setLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    getLeagueLogos()
      .then(setLogos)
      .catch(() => {});
  }, []);

  const handleConfirm = async () => {
    if (!selected || loading) return;
    setLoading(true);
    setError(null);
    try {
      const league = await buildRealLeague(selected.code);
      useGameStore.setState({ currentLeague: league });
      goTo('startOffers');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load league data');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 p-6">
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => goTo('createPlayer')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            <HiChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Choose Your League</h1>
            <p className="text-sm text-gray-500">Real leagues loaded from football-data.org</p>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {SUPPORTED_LEAGUES.map((league) => {
            const isSelected = selected?.code === league.code;

            return (
              <motion.button
                key={league.code}
                variants={cardItem}
                onClick={() => setSelected(league)}
                disabled={loading}
                className={`relative p-5 rounded-xl text-left transition-all border disabled:opacity-60 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/10 shadow-lg shadow-indigo-600/10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <HiCheck className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  {logos[league.code] ? (
                    <img
                      src={logos[league.code]}
                      alt={league.name}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-3xl">{league.flag}</span>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{league.name}</h3>
                    <p className="text-xs text-gray-500">{league.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-700/30 text-gray-400 border border-gray-600/30">
                    {league.code}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {error && (
          <p className="mt-4 text-center text-sm text-rose-400">{error}</p>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={handleConfirm} disabled={!selected || loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <HiArrowPath className="w-4 h-4 animate-spin" /> Loading teams & fixtures…
            </span>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
