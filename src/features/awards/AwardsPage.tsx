import { motion } from 'framer-motion';
import {
  HiTrophy,
  HiStar,
  HiUserGroup,
  HiAcademicCap,
  HiCheckCircle,
  HiShieldCheck,
  HiFire,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import PageTransition from '../../components/layout/PageTransition';

interface AwardDef {
  id: string;
  name: string;
  icon: string;
  tier: 'gold' | 'silver' | 'bronze';
  major: boolean;
}

interface MilestoneDef {
  id: string;
  label: string;
  type: 'goals' | 'assists' | 'appearances';
  target: number;
}

const majorAwards: AwardDef[] = [
  { id: 'ballon_dor', name: 'Ballon d\'Or', icon: '🏆', tier: 'gold', major: true },
  { id: 'golden_boot', name: 'Golden Boot', icon: '🥾', tier: 'gold', major: true },
  { id: 'golden_glove', name: 'Golden Glove', icon: '🧤', tier: 'gold', major: true },
  { id: 'poty', name: 'Player of the Year', icon: '🌟', tier: 'gold', major: true },
  { id: 'ypoty', name: 'Young Player of the Year', icon: '🌱', tier: 'silver', major: false },
  { id: 'team_season', name: 'Team of the Season', icon: '📋', tier: 'silver', major: false },
  { id: 'potm', name: 'Player of the Month', icon: '📅', tier: 'silver', major: false },
  { id: 'golden_ball_wc', name: 'World Cup Golden Ball', icon: '🌍', tier: 'gold', major: true },
  { id: 'golden_boot_wc', name: 'World Cup Golden Boot', icon: '⚽', tier: 'gold', major: true },
];

const fifaAwards: AwardDef[] = [
  { id: 'fifa_best', name: 'FIFA Best Player', icon: '👑', tier: 'gold', major: true },
  { id: 'fifa_best_11', name: 'FIFA FIFPro World 11', icon: '⭐', tier: 'gold', major: true },
  { id: 'ucl_winner', name: 'UEFA Champions League Winner', icon: '🏅', tier: 'gold', major: true },
  { id: 'ucl_best_player', name: 'UCL Best Player', icon: '✨', tier: 'gold', major: true },
  { id: 'top_scorer_league', name: 'League Top Scorer', icon: '🎯', tier: 'silver', major: false },
  { id: 'top_assist_league', name: 'League Top Assister', icon: '👟', tier: 'silver', major: false },
];

const milestones: MilestoneDef[] = [
  { id: 'apps_100', label: '100 Appearances', type: 'appearances', target: 100 },
  { id: 'apps_200', label: '200 Appearances', type: 'appearances', target: 200 },
  { id: 'apps_500', label: '500 Appearances', type: 'appearances', target: 500 },
  { id: 'goals_50', label: '50 Goals', type: 'goals', target: 50 },
  { id: 'goals_100', label: '100 Goals', type: 'goals', target: 100 },
  { id: 'goals_200', label: '200 Goals', type: 'goals', target: 200 },
  { id: 'goals_500', label: '500 Goals', type: 'goals', target: 500 },
  { id: 'assists_10', label: '10 Assists', type: 'assists', target: 10 },
  { id: 'assists_50', label: '50 Assists', type: 'assists', target: 50 },
  { id: 'assists_100', label: '100 Assists', type: 'assists', target: 100 },
];

const tierBg: Record<string, string> = {
  gold: 'bg-amber-500/15 border-amber-500/30',
  silver: 'bg-gray-500/15 border-gray-500/30',
  bronze: 'bg-orange-500/15 border-orange-500/30',
};

const milestoneIcons: Record<string, React.ReactNode> = {
  appearances: <HiAcademicCap className="w-5 h-5" />,
  goals: <HiTrophy className="w-5 h-5" />,
  assists: <HiUserGroup className="w-5 h-5" />,
};

function AwardCard({ award, won, season, club }: { award: AwardDef; won: boolean; season?: number; club?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`rounded-xl border p-4 text-center transition-colors ${
        won
          ? `${tierBg[award.tier]} ${award.tier === 'gold' ? 'shadow-lg shadow-amber-500/10' : ''}`
          : 'bg-gray-900/50 border-gray-800/50 opacity-50'
      }`}
    >
      <div className={`text-3xl mb-2 ${!won ? 'grayscale' : ''}`}>{award.icon}</div>
      <p className={`text-sm font-bold ${won ? 'text-white' : 'text-gray-600'}`}>{award.name}</p>
      {won && season && (
        <p className="text-xs text-gray-400 mt-1">
          Season {season}{club ? ` · ${club}` : ''}
        </p>
      )}
      {!won && award.major && (
        <p className="text-xs text-gray-600 mt-1 italic">Not yet won</p>
      )}
    </motion.div>
  );
}

interface PlayerAward {
  name: string;
  season: number;
  club: string;
}

function parseAwards(awards: string[]): PlayerAward[] {
  return awards.map((a) => {
    const parts = a.split('|');
    return {
      name: parts[0] ?? a,
      season: Number(parts[1]) || 0,
      club: parts[2] || '',
    };
  });
}

function MilestoneCard({ milestone, current, achieved }: { milestone: MilestoneDef; current: number; achieved: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        achieved ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-900 border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            achieved ? 'bg-emerald-500/15' : 'bg-gray-800'
          }`}>
            {achieved ? (
              <HiCheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <span className="text-gray-500">{milestoneIcons[milestone.type]}</span>
            )}
          </div>
          <div>
            <p className={`text-sm font-semibold ${achieved ? 'text-emerald-400' : 'text-white'}`}>
              {milestone.label}
            </p>
            {achieved && (
              <p className="text-xs text-emerald-500/70">Completed</p>
            )}
          </div>
        </div>
        <span className={`text-sm font-bold ${achieved ? 'text-emerald-400' : 'text-gray-400'}`}>
          {current}/{milestone.target}
        </span>
      </div>
      {!achieved && (
        <ProgressBar value={current} max={milestone.target} color="indigo" size="sm" />
      )}
    </motion.div>
  );
}

export default function AwardsPage() {
  const player = useGameStore((s) => s.player);

  if (!player) return null;

  const playerAwards = parseAwards(player.awards ?? []);
  const clubAtSeason = player.club?.name ?? '';

  const current = {
    goals: player.careerGoals,
    assists: player.careerAssists,
    appearances: player.careerAppearances,
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <HiTrophy className="w-8 h-8 text-amber-400" />
              <h1 className="text-2xl font-bold text-white">Awards &amp; Honors</h1>
            </div>

            <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiTrophy className="w-5 h-5 text-amber-400" />Trophy Cabinet</span>}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {majorAwards.map((award) => {
                  const won = playerAwards.find((pa) => pa.name === award.name);
                  return (
                    <AwardCard
                      key={award.id}
                      award={award}
                      won={!!won}
                      season={won?.season}
                      club={won?.club}
                    />
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiFire className="w-5 h-5 text-orange-400" />Current Season Race</span>}>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HiTrophy className="w-3.5 h-3.5" /> Top Scorer Race
                    </h4>
                    <div className="space-y-1">
                      {[
                        { name: player.name, goals: player.seasonGoals, club: clubAtSeason, isPlayer: true },
                        { name: 'K. Mbappé', goals: 14, club: 'Real Madrid', isPlayer: false },
                        { name: 'E. Haaland', goals: 12, club: 'Manchester City', isPlayer: false },
                        { name: 'M. Salah', goals: 11, club: 'Liverpool', isPlayer: false },
                        { name: 'H. Kane', goals: 10, club: 'Bayern Munich', isPlayer: false },
                      ].sort((a, b) => b.goals - a.goals).map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                          entry.isPlayer ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-gray-900'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-xs font-bold w-4 ${i < 3 ? 'text-amber-400' : 'text-gray-600'}`}>
                              {i + 1}
                            </span>
                            <span className={`text-sm font-medium truncate ${entry.isPlayer ? 'text-indigo-300' : 'text-white'}`}>
                              {entry.name}
                            </span>
                            {entry.isPlayer && <Badge variant="info" className="text-[10px]">You</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-gray-500">{entry.club}</span>
                            <span className="text-sm font-bold text-amber-400">{entry.goals}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HiUserGroup className="w-3.5 h-3.5" /> Top Assists Race
                    </h4>
                    <div className="space-y-1">
                      {[
                        { name: player.name, assists: player.seasonAssists, club: clubAtSeason, isPlayer: true },
                        { name: 'K. De Bruyne', assists: 8, club: 'Manchester City', isPlayer: false },
                        { name: 'L. Messi', assists: 7, club: 'Inter Miami', isPlayer: false },
                        { name: 'Bruno Fernandes', assists: 6, club: 'Manchester United', isPlayer: false },
                        { name: 'J. Bellingham', assists: 5, club: 'Real Madrid', isPlayer: false },
                      ].sort((a, b) => b.assists - a.assists).map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                          entry.isPlayer ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-gray-900'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-xs font-bold w-4 ${i < 3 ? 'text-amber-400' : 'text-gray-600'}`}>
                              {i + 1}
                            </span>
                            <span className={`text-sm font-medium truncate ${entry.isPlayer ? 'text-indigo-300' : 'text-white'}`}>
                              {entry.name}
                            </span>
                            {entry.isPlayer && <Badge variant="info" className="text-[10px]">You</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-gray-500">{entry.club}</span>
                            <span className="text-sm font-bold text-sky-400">{entry.assists}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-900 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 uppercase">Your Goals</p>
                      <p className="text-xl font-bold text-amber-400">{player.seasonGoals}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 uppercase">Your Assists</p>
                      <p className="text-xl font-bold text-sky-400">{player.seasonAssists}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 uppercase">Appearances</p>
                      <p className="text-xl font-bold text-purple-400">{player.seasonAppearances}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiAcademicCap className="w-5 h-5 text-indigo-400" />Career Milestones</span>}>
                <div className="space-y-3">
                  {milestones.map((ms) => {
                    const achieved = current[ms.type] >= ms.target;
                    return (
                      <MilestoneCard
                        key={ms.id}
                        milestone={ms}
                        current={current[ms.type]}
                        achieved={achieved}
                      />
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiShieldCheck className="w-5 h-5 text-indigo-400" />FIFA &amp; Continental Honors</span>}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {fifaAwards.map((award) => {
                    const won = playerAwards.find((pa) => pa.name === award.name);
                    return (
                      <AwardCard
                        key={award.id}
                        award={award}
                        won={!!won}
                        season={won?.season}
                        club={won?.club}
                      />
                    );
                  })}
                </div>
              </Card>

              <Card header={<span className="text-lg font-bold text-white flex items-center gap-2"><HiStar className="w-5 h-5 text-amber-400" />Award History</span>}>
                {playerAwards.length === 0 ? (
                  <p className="text-gray-500 text-sm">No awards won yet. Keep performing to earn recognition!</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {playerAwards.sort((a, b) => b.season - a.season).map((award, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900 border border-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <HiTrophy className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-sm font-medium text-white">{award.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          S{award.season}{award.club ? ` · ${award.club}` : ''}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
