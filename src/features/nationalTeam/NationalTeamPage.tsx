import { motion } from 'framer-motion';
import {
  HiFlag,
  HiStar,
  HiTrophy,
  HiUserGroup,
  HiCalendarDays,
  HiShieldCheck,
  HiArrowTrendingUp,
  HiMapPin,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatDisplay from '../../components/ui/StatDisplay';
import ProgressBar from '../../components/ui/ProgressBar';
import PageTransition from '../../components/layout/PageTransition';
import {
  NATIONAL_TEAMS,
  FIFA_WINDOWS,
  resolveNationality,
} from '../../services/nationalTeamService';

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

export default function NationalTeamPage() {
  const player = useGameStore((s) => s.player);
  const nationalTeamStatus = useGameStore((s) => s.nationalTeamStatus);
  const nationalTeamCountry = useGameStore((s) => s.nationalTeamCountry);
  const selectionScore = useGameStore((s) => s.selectionScore);
  const isFIFAWindow = useGameStore((s) => s.isFIFAWindow);
  const fifaWindowName = useGameStore((s) => s.fifaWindowName);
  const seasonWeek = useGameStore((s) => s.seasonWeek);

  if (!player) return null;

  const canonNat = resolveNationality(player.nationality);
  const teamInfo = NATIONAL_TEAMS[canonNat] ?? NATIONAL_TEAMS[nationalTeamCountry];
  const flag = countryFlags[canonNat] ?? countryFlags[nationalTeamCountry] ?? '🏳️';

  const caps = player.internationalCaps;
  const intlGoals = player.internationalGoals;
  const intlAssists = player.internationalAssists;
  const intlMotm = player.internationalMotm;

  // Compute selection score breakdown
  const ovrScore = Math.round((player.ovr / 99) * 40);
  const formScore = Math.round((player.form / 100) * 30);
  const recent = player.matchHistory.slice(-5);
  const avgRating = recent.length > 0
    ? recent.reduce((s, m) => s + m.rating, 0) / recent.length
    : 0;
  const ratingScore = Math.round((avgRating / 10) * 20);
  const fitnessScore = Math.round((player.physical.fitness / 100) * 10);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-green-600/25">
            <HiFlag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">National Team</h1>
            <p className="text-sm text-gray-400">
              {teamInfo ? `${teamInfo.country} — ${teamInfo.confederation}` : 'No national team available'}
            </p>
          </div>
        </motion.div>

        {/* FIFA Window Status */}
        {teamInfo && (
          <Card className={`border-l-4 ${isFIFAWindow ? 'border-l-amber-500' : 'border-l-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{flag}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{teamInfo.country}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HiMapPin className="w-3.5 h-3.5" />
                    <span>{teamInfo.confederation}</span>
                    <span className="text-gray-700">|</span>
                    <span>World Ranking: #{teamInfo.worldRanking}</span>
                    <span className="text-gray-700">|</span>
                    <span>Manager: {teamInfo.manager}</span>
                  </div>
                </div>
              </div>
              {isFIFAWindow && (
                <Badge variant="info">{fifaWindowName} FIFA Window</Badge>
              )}
            </div>
          </Card>
        )}

        {!teamInfo && (
          <Card>
            <p className="text-gray-500 text-sm text-center py-4">
              Your nationality ({player.nationality}) does not have a national team in the database.
            </p>
          </Card>
        )}

        {teamInfo && (
          <>
            {/* Selection Score */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <HiStar className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-bold text-white">Selection Score</span>
                </div>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Overall ({ovrScore}%)</p>
                  <ProgressBar value={ovrScore} color="indigo" size="sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Form ({formScore}%)</p>
                  <ProgressBar value={formScore} color="green" size="sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Avg Rating ({ratingScore}%)</p>
                  <ProgressBar value={ratingScore} color="indigo" size="sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Fitness ({fitnessScore}%)</p>
                  <ProgressBar value={fitnessScore} color="purple" size="sm" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                <div>
                  <span className="text-sm text-gray-500">Total Score</span>
                  <span className="text-2xl font-bold text-white ml-3">{selectionScore || ovrScore + formScore + ratingScore + fitnessScore}/100</span>
                </div>
                <Badge
                  variant={
                    nationalTeamStatus === 'Called Up'
                      ? 'success'
                      : nationalTeamStatus === 'On Standby'
                        ? 'warning'
                        : 'error'
                  }
                >
                  {nationalTeamStatus === 'Called Up'
                    ? '✅ Called Up'
                    : nationalTeamStatus === 'On Standby'
                      ? '⏳ On Standby'
                      : '❌ Not Called'}
                </Badge>
              </div>
            </Card>

            {/* FIFA Windows */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <HiCalendarDays className="w-5 h-5 text-indigo-400" />
                  <span className="text-lg font-bold text-white">FIFA Windows</span>
                </div>
              }
            >
              <div className="grid grid-cols-5 gap-2">
                {FIFA_WINDOWS.map((w) => (
                  <div
                    key={w.month}
                    className={`text-center p-3 rounded-lg border ${
                      isFIFAWindow && fifaWindowName === w.name
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-800 bg-gray-900'
                    }`}
                  >
                    <p className={`text-sm font-bold ${isFIFAWindow && fifaWindowName === w.name ? 'text-amber-400' : 'text-gray-400'}`}>
                      {w.name}
                    </p>
                    <p className="text-xs text-gray-600">Month {w.month}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Season Week: {seasonWeek}</p>
            </Card>

            {/* International Career Stats */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <HiTrophy className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-bold text-white">International Career</span>
                </div>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatDisplay label="Caps" value={caps} icon={<HiShieldCheck className="w-4 h-4 text-sky-400" />} />
                <StatDisplay label="Goals" value={intlGoals} icon={<HiTrophy className="w-4 h-4 text-amber-400" />} />
                <StatDisplay label="Assists" value={intlAssists} icon={<HiArrowTrendingUp className="w-4 h-4 text-emerald-400" />} />
                <StatDisplay label="MOTM" value={intlMotm} icon={<HiStar className="w-4 h-4 text-purple-400" />} />
              </div>
              {caps > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800 text-sm text-gray-500">
                  Average Rating: <span className="text-white font-semibold">
                    {avgRating > 0 ? avgRating.toFixed(2) : 'N/A'}
                  </span>
                </div>
              )}
            </Card>

            {/* Squad Positions Preview */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <HiUserGroup className="w-5 h-5 text-indigo-400" />
                  <span className="text-lg font-bold text-white">Squad Positions</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(['GK', 'DEF', 'MID', 'FWD'] as const).map((group) => {
                  const groupPositions: Record<string, string[]> = {
                    GK: ['GK'],
                    DEF: ['CB', 'LB', 'RB'],
                    MID: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
                    FWD: ['LW', 'RW', 'ST', 'CF'],
                  };
                  const playerInGroup = groupPositions[group].includes(player.position);
                  return (
                    <div
                      key={group}
                      className={`p-3 rounded-lg border ${
                        playerInGroup
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-gray-800 bg-gray-900'
                      }`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-wider ${playerInGroup ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {group}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {groupPositions[group].join(', ')}
                      </p>
                      {playerInGroup && (
                        <Badge variant="success" className="mt-2">Your Position</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Call-up Info */}
            {nationalTeamStatus === 'Not Called' && !isFIFAWindow && (
              <Card className="border-rose-500/30">
                <p className="text-sm text-gray-400 text-center py-2">
                  Keep performing well in your club matches to get called up during FIFA windows.
                </p>
              </Card>
            )}

            {nationalTeamStatus === 'Called Up' && (
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <div className="text-center py-2">
                  <p className="text-emerald-400 font-bold text-lg">✅ You have been called up!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You are in the {teamInfo.country} squad for the {fifaWindowName} FIFA window.
                    International matches will be available during this period.
                  </p>
                </div>
              </Card>
            )}

            {nationalTeamStatus === 'On Standby' && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <div className="text-center py-2">
                  <p className="text-amber-400 font-bold text-lg">⏳ On Standby</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You are on standby for {teamInfo.country}. Maintain good form to secure a spot in the squad.
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
