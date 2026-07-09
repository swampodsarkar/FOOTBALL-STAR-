import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChevronLeft,
  HiStar,
  HiBanknotes,
  HiCurrencyDollar,
  HiChevronDown,
  HiCheck,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import type { Club } from '../../types';

type SortKey = 'rating' | 'budget' | 'reputation';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'By Rating' },
  { key: 'budget', label: 'By Budget' },
  { key: 'reputation', label: 'By Reputation' },
];

function getRatingColor(rating: number): string {
  if (rating >= 85) return 'text-emerald-400';
  if (rating >= 78) return 'text-sky-400';
  if (rating >= 72) return 'text-amber-400';
  return 'text-rose-400';
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export default function SelectClubPage() {
  const { goTo } = usePhaseNavigation();
  const currentLeague = useGameStore((s) => s.currentLeague);
  const startNewCareer = useGameStore((s) => s.startNewCareer);
  const player = useGameStore((s) => s.player);

  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clubs = currentLeague?.clubs ?? [];

  const sortedClubs = useMemo(() => {
    const sorted = [...clubs];
    switch (sortBy) {
      case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
      case 'budget': return sorted.sort((a, b) => b.budget - a.budget);
      case 'reputation': return sorted.sort((a, b) => b.reputation - a.reputation);
      default: return sorted;
    }
  }, [clubs, sortBy]);

  const handleSign = () => {
    console.log('=== Sign for Club Debug ===');
    console.log('selectedClub:', selectedClub);
    console.log('player:', player);
    console.log('currentLeague:', currentLeague);
    
    if (!selectedClub || !player || !currentLeague) {
      console.log('BLOCKED: selectedClub, player, or currentLeague is null');
      return;
    }
    
    console.log('Calling startNewCareer...');
    startNewCareer(player, currentLeague, selectedClub);
    console.log('Navigating to home...');
    goTo('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 p-6">
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => goTo('selectLeague')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            <HiChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Choose Your Club</h1>
            <p className="text-sm text-gray-500">{currentLeague?.name}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === opt.key
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sortedClubs.map((club) => {
            const isSelected = selectedClub?.id === club.id;
            const isExpanded = expandedId === club.id;

            return (
              <motion.div
                key={club.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onClick={() => {
                    setSelectedClub(club);
                    setExpandedId(isExpanded ? null : club.id);
                  }}
                  className={`relative p-5 rounded-xl cursor-pointer transition-all border ${
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

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {club.crest && (
                        <img
                          src={club.crest}
                          alt={club.name}
                          className="w-9 h-9 object-contain bg-white/5 rounded-md p-1 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg leading-tight truncate">
                          {club.name}
                        </h3>
                        <span className="text-xs text-gray-500">{club.shortName}</span>
                      </div>
                    </div>
                    <span
                      className={`text-2xl font-black tabular-nums ${getRatingColor(club.rating)}`}
                    >
                      {club.rating}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        club.leaguePosition <= 4
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : club.leaguePosition <= 10
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      #{club.leaguePosition}
                    </span>
                    <span className="flex gap-0.5 ml-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <HiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(club.reputation / 20)
                              ? 'text-amber-400'
                              : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <HiCurrencyDollar className="w-4 h-4 text-emerald-400" />
                      <span>{formatCurrency(club.weeklySalary)}/w</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <HiBanknotes className="w-4 h-4 text-sky-400" />
                      <span>{formatCurrency(club.budget)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-700"
                      style={{ backgroundColor: club.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-700 -ml-1"
                      style={{ backgroundColor: club.colors.secondary }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {club.objectives.slice(0, 3).map((obj) => (
                      <Badge key={obj} variant="info">
                        {obj}
                      </Badge>
                    ))}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-gray-800">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Stadium</span>
                            <span className="text-white">{club.stadium}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-500">Squad size</span>
                            <span className="text-white">{club.aiSquad.length} players</span>
                          </div>
                          {club.objectives.length > 3 && (
                            <div className="flex items-center justify-between text-sm mt-2">
                              <span className="text-gray-500">Extra objective</span>
                              <span className="text-gray-400">{club.objectives[3]}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center mt-2">
                    <HiChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={handleSign}
          disabled={!selectedClub}
          className="bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
        >
          Sign for Club
        </Button>
      </div>
    </div>
  );
}
