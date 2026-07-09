import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiFlag,
  HiStar,
  HiTrophy,
  HiUserGroup,
  HiCalendarDays,
  HiShieldCheck,
  HiArrowTrendingUp,
  HiChevronDown,
  HiMapPin,
  HiUsers,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatDisplay from '../../components/ui/StatDisplay';
import ProgressBar from '../../components/ui/ProgressBar';
import PageTransition from '../../components/layout/PageTransition';

interface Fixture {
  id: string;
  opponent: string;
  opponentFlag: string;
  date: string;
  competition: string;
  type: 'Friendly' | 'Qualifier' | 'Tournament';
  venue: string;
}

interface Tournament {
  id: string;
  name: string;
  year: number;
  qualified: boolean;
  groupStage?: string[];
  knockoutStage?: string;
  result?: string;
}

const countryFlags: Record<string, string> = {
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴',
  'Nigeria': '🇳🇬',
  'Senegal': '🇸🇳',
  'Morocco': '🇲🇦',
  'Egypt': '🇪🇬',
  'Ghana': '🇬🇭',
  'Cameroon': '🇨🇲',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Australia': '🇦🇺',
  'USA': '🇺🇸',
  'Mexico': '🇲🇽',
  'Canada': '🇨🇦',
  'Croatia': '🇭🇷',
  'Serbia': '🇷🇸',
  'Denmark': '🇩🇰',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'Poland': '🇵🇱',
};

interface NationalTeamInfo {
  country: string;
  worldRanking: number;
  manager: string;
  confederation: string;
}

const nationalTeams: Record<string, NationalTeamInfo> = {
  'England': { country: 'England', worldRanking: 4, manager: 'Gareth Southgate', confederation: 'UEFA' },
  'France': { country: 'France', worldRanking: 2, manager: 'Didier Deschamps', confederation: 'UEFA' },
  'Germany': { country: 'Germany', worldRanking: 6, manager: 'Julian Nagelsmann', confederation: 'UEFA' },
  'Spain': { country: 'Spain', worldRanking: 3, manager: 'Luis de la Fuente', confederation: 'UEFA' },
  'Italy': { country: 'Italy', worldRanking: 7, manager: 'Luciano Spalletti', confederation: 'UEFA' },
  'Portugal': { country: 'Portugal', worldRanking: 5, manager: 'Roberto Martínez', confederation: 'UEFA' },
  'Netherlands': { country: 'Netherlands', worldRanking: 8, manager: 'Ronald Koeman', confederation: 'UEFA' },
  'Belgium': { country: 'Belgium', worldRanking: 1, manager: 'Domenico Tedesco', confederation: 'UEFA' },
  'Brazil': { country: 'Brazil', worldRanking: 5, manager: 'Dorival Júnior', confederation: 'CONMEBOL' },
  'Argentina': { country: 'Argentina', worldRanking: 1, manager: 'Lionel Scaloni', confederation: 'CONMEBOL' },
  'Nigeria': { country: 'Nigeria', worldRanking: 30, manager: 'Finidi George', confederation: 'CAF' },
  'Senegal': { country: 'Senegal', worldRanking: 18, manager: 'Aliou Cissé', confederation: 'CAF' },
  'Japan': { country: 'Japan', worldRanking: 17, manager: 'Hajime Moriyasu', confederation: 'AFC' },
  'South Korea': { country: 'South Korea', worldRanking: 23, manager: 'Jürgen Klinsmann', confederation: 'AFC' },
  'USA': { country: 'USA', worldRanking: 11, manager: 'Gregg Berhalter', confederation: 'CONCACAF' },
  'Mexico': { country: 'Mexico', worldRanking: 12, manager: 'Jaime Lozano', confederation: 'CONCACAF' },
};

function getNationalTeam(country: string): NationalTeamInfo {
  return nationalTeams[country] ?? {
    country,
    worldRanking: 50,
    manager: 'Unknown',
    confederation: 'Other',
  };
}

function getCountryFlag(country: string): string {
  return countryFlags[country] ?? '🏳️';
}

const fixtures: Fixture[] = [
  { id: 'fix_1', opponent: 'Italy', opponentFlag: '🇮🇹', date: 'Week 14, Season 1', competition: 'UEFA Nations League', type: 'Qualifier', venue: 'Home' },
  { id: 'fix_2', opponent: 'Germany', opponentFlag: '🇩🇪', date: 'Week 18, Season 1', competition: 'FIFA World Cup Qualifier', type: 'Qualifier', venue: 'Away' },
  { id: 'fix_3', opponent: 'Brazil', opponentFlag: '🇧🇷', date: 'Week 22, Season 1', competition: 'International Friendly', type: 'Friendly', venue: 'Neutral' },
  { id: 'fix_4', opponent: 'Portugal', opponentFlag: '🇵🇹', date: 'Week 26, Season 1', competition: 'UEFA Nations League', type: 'Qualifier', venue: 'Home' },
  { id: 'fix_5', opponent: 'France', opponentFlag: '🇫🇷', date: 'Week 30, Season 1', competition: 'International Friendly', type: 'Friendly', venue: 'Away' },
];

const tournaments: Tournament[] = [
  { id: 'tour_1', name: 'FIFA World Cup', year: 2026, qualified: true, groupStage: ['Brazil', 'Portugal', 'Japan'], result: 'Group Stage' },
  { id: 'tour_2', name: 'UEFA European Championship', year: 2024, qualified: false, result: 'Did not qualify' },
  { id: 'tour_3', name: 'UEFA Nations League', year: 2025, qualified: true, groupStage: ['Italy', 'Germany', 'Croatia'], knockoutStage: 'Final' },
];

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors: Record<string, string> = {
    Friendly: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    Qualifier: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    Tournament: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
    >
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">{fixture.opponentFlag}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">vs {fixture.opponent}</p>
            <p className="text-xs text-gray-500">{fixture.competition}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeColors[fixture.type]}`}>
            {fixture.type}
          </span>
          <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiCalendarDays className="w-4 h-4" />
                {fixture.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiMapPin className="w-4 h-4" />
                {fixture.venue}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <HiFlag className="w-4 h-4" />
                {fixture.competition}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        tournament.qualified
          ? 'bg-gray-900 border-gray-800'
          : 'bg-gray-900/50 border-gray-800/50 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HiTrophy className={`w-5 h-5 ${tournament.qualified ? 'text-amber-400' : 'text-gray-600'}`} />
          <span className="text-sm font-bold text-white">{tournament.name} {tournament.year}</span>
        </div>
        <Badge variant={tournament.qualified ? 'success' : 'error'}>
          {tournament.qualified ? 'Qualified' : 'Not Qualified'}
        </Badge>
      </div>
      {tournament.qualified && tournament.groupStage && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Group Stage</p>
          <div className="flex flex-wrap gap-2">
            {tournament.groupStage.map((opp) => (
              <span key={opp} className="text-xs px-2 py-1 bg-gray-800 rounded-lg text-gray-300">{opp}</span>
            ))}
          </div>
        </div>
      )}
      {tournament.knockoutStage && (
        <div className="mt-2">
          <span className="text-xs font-medium text-purple-400">Reached: {tournament.knockoutStage}</span>
        </div>
      )}
      {tournament.result && !tournament.qualified && (
        <p className="text-xs text-gray-600 mt-2">{tournament.result}</p>
      )}
    </motion.div>
  );
}

export default function NationalTeamPage() {
  const player = useGameStore((s) => s.player);

  if (!player) return null;

  const country = getNationalTeam(player.nationality);
  const flag = getCountryFlag(player.nationality);
  const caps = player.careerAppearances;
  const calledUp = caps > 0;

  const debutSeason = player.matchHistory.length > 0
    ? Math.min(...player.matchHistory.filter((m) => m.week > 0).map((m) => m.season))
    : player.currentSeason;

  let callUpStatus: 'In Squad' | 'Starting XI' | 'On Bench' = 'In Squad';
  if (player.ovr >= 85) callUpStatus = 'Starting XI';
  else if (player.ovr >= 75) callUpStatus = 'In Squad';
  else callUpStatus = 'On Bench';

  const isCaptain = false;
  const isViceCaptain = false;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{flag}</span>
              <div>
                <h1 className="text-2xl font-bold text-white">{player.nationality}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info">FIFA Rank #{country.worldRanking}</Badge>
                  <span className="text-xs text-gray-500">{country.confederation}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {!calledUp ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-amber-500/30 bg-amber-500/5">
                <div className="text-center py-8">
                  <HiFlag className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Waiting for First Call-Up</h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Keep performing at club level to earn your first international call-up.
                    National team scouts are watching your progress.
                  </p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
                    <div className="bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">Eligibility</p>
                      <p className="text-sm font-semibold text-white">{player.nationality}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">World Rank</p>
                      <p className="text-sm font-semibold text-white">#{country.worldRanking}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">Confederation</p>
                      <p className="text-sm font-semibold text-white">{country.confederation}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">Manager</p>
                      <p className="text-sm font-semibold text-white">{country.manager}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiFlag className="w-5 h-5 text-indigo-400" />National Team Info</span>}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{flag}</span>
                        <div>
                          <p className="text-white font-bold text-lg">{country.country}</p>
                          <p className="text-xs text-gray-500">{country.confederation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(isCaptain || isViceCaptain) && (
                          <Badge variant="warning" icon={<HiStar className="w-3 h-3" />}>
                            {isCaptain ? 'Captain' : 'Vice Captain'}
                          </Badge>
                        )}
                        <Badge variant={callUpStatus === 'Starting XI' ? 'success' : 'info'}>
                          {callUpStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase">World Ranking</p>
                        <p className="text-lg font-bold text-white">#{country.worldRanking}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase">Manager</p>
                        <p className="text-lg font-bold text-white">{country.manager}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiStar className="w-5 h-5 text-amber-400" />International Stats</span>}>
                  <div className="grid grid-cols-2 gap-4">
                    <StatDisplay label="Caps" value={caps} icon={<HiShieldCheck className="w-5 h-5 text-blue-400" />} />
                    <StatDisplay label="International Goals" value={player.careerGoals} icon={<HiTrophy className="w-5 h-5 text-amber-400" />} />
                    <StatDisplay label="International Assists" value={player.careerAssists} icon={<HiUserGroup className="w-5 h-5 text-green-400" />} />
                    <StatDisplay label="Debut Season" value={`S${debutSeason}`} icon={<HiCalendarDays className="w-5 h-5 text-purple-400" />} />
                  </div>
                </Card>
              </div>

              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiArrowTrendingUp className="w-5 h-5 text-indigo-400" />Manager Trust</span>}>
                <div className="flex items-center gap-3">
                  <HiUsers className="w-5 h-5 text-indigo-400 shrink-0" />
                  <ProgressBar value={player.managerTrust} color="indigo" size="md" showValue />
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiCalendarDays className="w-5 h-5 text-sky-400" />Upcoming International Fixtures</span>}>
                <div className="space-y-2">
                  {fixtures.map((f) => (
                    <FixtureCard key={f.id} fixture={f} />
                  ))}
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiTrophy className="w-5 h-5 text-amber-400" />International Tournaments</span>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tournaments.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
