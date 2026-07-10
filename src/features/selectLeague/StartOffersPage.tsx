import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiCheck, HiSparkles, HiStar } from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Button from '../../components/ui/Button';
import { SUPPORTED_LEAGUES, buildRealLeague, getStartingOffers, type ClubOffer } from '../../services/footballData';

const flagFor = (code: string) =>
  SUPPORTED_LEAGUES.find((l) => l.code === code)?.flag ?? '🏳️';

function ReputationStars({ rep }: { rep: number }) {
  const stars = Math.max(1, Math.min(5, Math.round(rep / 18)));
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <HiStar key={i} className={`w-4 h-4 ${i < stars ? 'text-amber-400' : 'text-gray-700'}`} />
      ))}
    </span>
  );
}

export default function StartOffersPage() {
  const { goTo } = usePhaseNavigation();
  const player = useGameStore((s) => s.player);
  const startNewCareer = useGameStore((s) => s.startNewCareer);

  const [offers, setOffers] = useState<ClubOffer[]>([]);
  const [selected, setSelected] = useState<ClubOffer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOffers(getStartingOffers(3));
  }, []);

  const handleConfirm = async () => {
    if (!selected || !player || loading) return;
    setLoading(true);
    const league = await buildRealLeague(selected.code);
    startNewCareer(player, league, selected.club);
    goTo('home');
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
            <h1 className="text-2xl font-bold text-white">Contract Offers</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <HiSparkles className="w-4 h-4 text-indigo-400" />
              {player?.name}, these lower-league clubs want to sign you
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {offers.map((offer) => {
            const isSelected = selected?.id === offer.id;
            return (
              <motion.button
                key={offer.id}
                variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                onClick={() => setSelected(offer)}
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
                  {offer.club.crest ? (
                    <img src={offer.club.crest} alt={offer.club.name} className="w-10 h-10 object-contain" loading="lazy" />
                  ) : (
                    <span className="text-3xl">{flagFor(offer.code)}</span>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{offer.club.name}</h3>
                    <p className="text-xs text-gray-500">{offer.leagueName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-700/30 text-gray-400 border border-gray-600/30">
                    {offer.code}
                  </span>
                  <ReputationStars rep={offer.reputation} />
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Reputation: <span className="text-white font-semibold">{offer.reputation}</span>
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={handleConfirm} disabled={!selected || loading}>
          {loading ? 'Starting career…' : 'Start Career Here'}
        </Button>
      </div>
    </div>
  );
}
