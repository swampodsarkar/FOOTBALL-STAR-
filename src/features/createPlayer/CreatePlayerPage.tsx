import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChevronLeft,
  HiSparkles,
  HiStar,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Button from '../../components/ui/Button';
import CountryFlag from '../../components/ui/CountryFlag';
import { fetchAllCountries, type CountryInfo } from '../../services/countries';
import type {
  Player,
  Position,
  PreferredFoot,
  Difficulty,
  PlayerAttributes,
} from '../../types';

const TOTAL_STEPS = 7;

const countryFlags: Record<string, string> = {
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'USA': '🇺🇸',
  'Saudi Arabia': '🇸🇦',
  'Turkey': '🇹🇷',
  'Belgium': '🇧🇪',
  'Croatia': '🇭🇷',
  'Denmark': '🇩🇰',
  'Poland': '🇵🇱',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Switzerland': '🇨🇭',
  'Austria': '🇦🇹',
  'Ukraine': '🇺🇦',
  'Russia': '🇷🇺',
  'Serbia': '🇷🇸',
  'Czech Republic': '🇨🇿',
  'Greece': '🇬🇷',
  'Colombia': '🇨🇴',
  'Uruguay': '🇺🇾',
  'Chile': '🇨🇱',
  'Nigeria': '🇳🇬',
  'Egypt': '🇪🇬',
  'Senegal': '🇸🇳',
  'Morocco': '🇲🇦',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Australia': '🇦🇺',
};

const nameSuggestions = [
  'Alex Silva',
  'Marco Rossi',
  'Lars van der Berg',
  'Kai Mueller',
  'Ethan Cole',
];

const positions: Position[] = [
  'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF',
];

const positionDescriptions: Record<Position, string> = {
  GK: 'Goalkeeper – the last line of defense',
  CB: 'Centre Back – strong defensive presence',
  LB: 'Left Back – pacey defender on the flank',
  RB: 'Right Back – pacey defender on the flank',
  CDM: 'Defensive Midfielder – breaks up play',
  CM: 'Central Midfielder – box-to-box engine',
  CAM: 'Attacking Midfielder – creative playmaker',
  LM: 'Left Midfielder – wide midfield presence',
  RM: 'Right Midfielder – wide midfield presence',
  LW: 'Left Wing – tricky winger cutting inside',
  RW: 'Right Wing – tricky winger cutting inside',
  ST: 'Striker – the goal scorer',
  CF: 'Centre Forward – link-up forward',
};

const difficulties: { name: Difficulty; stars: number; desc: string }[] = [
  { name: 'Amateur', stars: 1, desc: 'Relaxed gameplay, forgiving mechanics' },
  { name: 'Semi-Pro', stars: 2, desc: 'Balanced challenge for newcomers' },
  { name: 'Professional', stars: 3, desc: 'Standard football simulation difficulty' },
  { name: 'World Class', stars: 4, desc: 'Tough competition, small margins' },
  { name: 'Legendary', stars: 5, desc: 'The ultimate test of skill' },
];

interface StepProps {
  children: React.ReactNode;
}

function Step({ children }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
    >
      {children}
    </motion.div>
  );
}

export default function CreatePlayerPage() {
  const { goTo } = usePhaseNavigation();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(18);
  const [nationality, setNationality] = useState('England');
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [foot, setFoot] = useState<PreferredFoot>('Right');
  const [position, setPosition] = useState<Position | null>(null);
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(72);
  const [difficulty, setDifficulty] = useState<Difficulty>('Professional');

  const [apiCountries, setApiCountries] = useState<CountryInfo[] | null>(null);

  useEffect(() => {
    fetchAllCountries().then(setApiCountries);
  }, []);

  const countryList = useMemo(() => {
    if (apiCountries && apiCountries.length > 0) {
      return apiCountries.map((c) => ({
        country: c.name,
        flag: c.flag,
        flagPng: c.flagPng,
      }));
    }
    return Object.entries(countryFlags).map(([country, flag]) => ({
      country,
      flag,
      flagPng: undefined as string | undefined,
    }));
  }, [apiCountries]);

  const filteredCountries = useMemo(
    () =>
      countryList.filter(({ country }) =>
        country.toLowerCase().includes(nationalitySearch.toLowerCase())
      ),
    [countryList, nationalitySearch]
  );

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return name.trim().length >= 2;
      case 2: return age >= 16 && age <= 39;
      case 3: return !!nationality;
      case 4: return true;
      case 5: return position !== null;
      case 6: return true;
      case 7: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS && canProceed()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else goTo('welcome');
  };

  const handleCreate = () => {
    if (!position) return;

    const baseOvr =
      difficulty === 'Amateur' ? 70
        : difficulty === 'Semi-Pro' ? 65
        : difficulty === 'Professional' ? 60
        : difficulty === 'World Class' ? 55
        : 50;

    const baseStats: PlayerAttributes = {
      pace: baseOvr, acceleration: baseOvr, sprintSpeed: baseOvr,
      finishing: baseOvr, shotPower: baseOvr, longShots: baseOvr,
      passing: baseOvr, vision: baseOvr, crossing: baseOvr,
      dribbling: baseOvr, ballControl: baseOvr, agility: baseOvr, balance: baseOvr,
      heading: baseOvr, strength: baseOvr, jumping: baseOvr, stamina: baseOvr,
      defensiveAwareness: baseOvr, standingTackle: baseOvr, slidingTackle: baseOvr,
    };

    const player: Player = {
      id: crypto.randomUUID(),
      name,
      age,
      nationality,
      preferredFoot: foot,
      position,
      height,
      weight,
      difficulty,
      club: null,
      ovr: baseOvr,
      attributes: baseStats,
      physical: {
        energy: 85, fitness: 80, sharpness: 70, fatigue: 20, recovery: 50, injuryRisk: 15,
      },
      injury: null,
      morale: 70,
      managerTrust: 50,
      confidence: 60,
      popularity: 30,
      form: 7,
      marketValue: 500000,
      weeklySalary: 5000,
      bankBalance: 50000,
      contractYears: 3,
      releaseClause: 2000000,
      seasonGoals: 0, seasonAssists: 0, seasonAppearances: 0,
      careerGoals: 0, careerAssists: 0, careerAppearances: 0,
      totalXp: 0, level: 1,
      socialFollowers: 1000,
      cars: [], houses: [], watches: [], businesses: [],
      awards: [],
      matchHistory: [],
      currentSeason: 1,
    };

    useGameStore.setState({ player });
    goTo('startOffers');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i + 1 <= step
              ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
              : 'w-4 bg-gray-800'
          }`}
        />
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step key="name">
            <h2 className="text-xl font-bold text-white text-center mb-6">What is your name?</h2>
            <div className="max-w-sm mx-auto space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="text-right text-xs text-gray-600">{name.length}/24</div>
              <div className="flex flex-wrap gap-2">
                {nameSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setName(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      name === s
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <HiSparkles className="inline w-3 h-3 mr-1" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Step>
        );

      case 2:
        return (
          <Step key="age">
            <h2 className="text-xl font-bold text-white text-center mb-2">Select your age</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Recommended: 16-24 for long careers</p>
            <div className="max-w-xs mx-auto">
              <div className="text-center mb-4">
                <span className="text-5xl font-black text-white tabular-nums">{age}</span>
                <span className="text-gray-500 ml-1">years old</span>
              </div>
              <input
                type="range"
                min={16}
                max={39}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>16</span>
                <span className={`${age >= 16 && age <= 24 ? 'text-emerald-400' : ''}`}>Prime</span>
                <span>39</span>
              </div>
            </div>
          </Step>
        );

      case 3:
        return (
          <Step key="nationality">
            <h2 className="text-xl font-bold text-white text-center mb-6">Choose nationality</h2>
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={nationalitySearch}
                onChange={(e) => setNationalitySearch(e.target.value)}
                placeholder="Search country..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors mb-3"
              />
              <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
                {filteredCountries.map(({ country, flag, flagPng }) => (
                  <button
                    key={country}
                    onClick={() => {
                      setNationality(country);
                      setNationalitySearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      nationality === country && !nationalitySearch
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    {flagPng ? (
                      <img
                        src={flagPng}
                        alt={country}
                        className="w-5 h-5 rounded-sm object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <CountryFlag
                        country={country}
                        emoji={flag}
                        className="text-lg"
                        imgClassName="w-5 h-5 rounded-sm object-cover"
                      />
                    )}
                    <span>{country}</span>
                  </button>
                ))}
              </div>
            </div>
          </Step>
        );

      case 4:
        return (
          <Step key="foot">
            <h2 className="text-xl font-bold text-white text-center mb-6">Preferred foot</h2>
            <div className="flex justify-center gap-3 max-w-xs mx-auto">
              {(['Left', 'Right', 'Both'] as PreferredFoot[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFoot(f)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    foot === f
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {f === 'Both' ? 'Both Feet' : f}
                </button>
              ))}
            </div>
          </Step>
        );

      case 5:
        return (
          <Step key="position">
            <h2 className="text-xl font-bold text-white text-center mb-6">Select position</h2>
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all relative ${
                    position === pos
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                  title={positionDescriptions[pos]}
                >
                  {pos}
                </button>
              ))}
            </div>
            {position && (
              <p className="text-center text-gray-500 text-sm mt-3">
                {positionDescriptions[position]}
              </p>
            )}
          </Step>
        );

      case 6:
        return (
          <Step key="physical">
            <h2 className="text-xl font-bold text-white text-center mb-6">Height & Weight</h2>
            <div className="max-w-xs mx-auto space-y-6">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Height</span>
                  <span className="text-white font-semibold">{height} cm</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={210}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>150cm</span>
                  <span>210cm</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Weight</span>
                  <span className="text-white font-semibold">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={110}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>50kg</span>
                  <span>110kg</span>
                </div>
              </div>
            </div>
          </Step>
        );

      case 7:
        return (
          <Step key="difficulty">
            <h2 className="text-xl font-bold text-white text-center mb-6">Choose difficulty</h2>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {difficulties.map((d) => (
                <button
                  key={d.name}
                  onClick={() => setDifficulty(d.name)}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    difficulty === d.name
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-600/10'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-white ${difficulty === d.name ? 'text-indigo-300' : ''}`}>
                      {d.name}
                    </span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <HiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < d.stars ? 'text-amber-400' : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{d.desc}</p>
                </button>
              ))}
            </div>
          </Step>
        );

      default:
        return null;
    }
  };

  

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 p-6">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full justify-center">
        {renderStepIndicator()}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="flex justify-between items-center max-w-sm mx-auto w-full mt-8">
        <Button
          variant="ghost"
          icon={<HiChevronLeft className="w-5 h-5" />}
          onClick={handleBack}
        >
          {step === 1 ? 'Exit' : 'Back'}
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            className="bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
            onClick={handleCreate}
          >
            Create Career
          </Button>
        )}
      </div>
    </div>
  );
}
