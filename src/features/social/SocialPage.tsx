import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHeart,
  HiChartBar,
  HiUserGroup,
  HiUser,
  HiArrowTrendingUp,
  HiChatBubbleLeftRight,
  HiFire,
  HiHandThumbUp,
  HiPaperAirplane,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/layout/PageTransition';
import { generateSocialPost, generateFanComments, generateTrendingTopics } from '../../services/groqService';

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

const fallbackPostTemplates = [
  'Great win today! ⚽',
  'Hard work in training pays off 💪',
  'Happy to help the team',
  'Fans are amazing! 🙌',
  'Back to work tomorrow 🔥',
  'What a night! 🌟',
  'Never give up! ❤️',
  'Blessed to play this game 🙏',
  'Focus on the next one 🎯',
  'Thankful for the support 👊',
  'Building something special 🏗️',
  'Every game is a final 🏆',
  'Proud of the boys! 🤝',
  'Onwards and upwards ⬆️',
];

const fallbackTrendingTopics = [
  { topic: '#TransferRumours', engagement: 45200 },
  { topic: '#TitleRace', engagement: 38900 },
  { topic: '#ManagerSackWatch', engagement: 31500 },
  { topic: '#YoungStar', engagement: 28400 },
  { topic: '#DerbyDay', engagement: 22100 },
];

const fallbackPositiveComments = [
  'What a player! 🔥',
  'Absolute legend! 👑',
  'Best in the league! ⭐',
  'Unstoppable! 🚀',
  'World class performance 🌍',
  'This guy is different 💎',
  'Sign him up! ✍️',
  'Future Ballon d\'Or 🏅',
];

const fallbackNegativeComments = [
  'Needs to step up',
  'Not good enough lately',
  'Time to prove yourself',
  'Disappointing performance',
  'Can do much better',
  'Struggling this season',
];

interface Post {
  id: string;
  content: string;
  likes: number;
  comments: number;
  engagement: number;
  type: 'performance' | 'personal' | 'fan';
}

export default function SocialPage() {
  const player = useGameStore((s) => s.player);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const [feed, setFeed] = useState<Post[]>([]);
  const [groqPosts, setGroqPosts] = useState<string[]>([]);
  const [groqComments, setGroqComments] = useState<{ text: string; isPositive: boolean }[]>([]);
  const [groqTrending, setGroqTrending] = useState<{ topic: string; engagement: number }[]>([]);
  const [groqLoaded, setGroqLoaded] = useState(false);

  const lastMatchResult = player?.matchHistory[player.matchHistory.length - 1];
  const recentForm = player?.matchHistory.slice(-3) ?? [];
  const recentWins = recentForm.filter((m) => m.result === 'Win').length;

  if (!groqLoaded) {
    setGroqLoaded(true);
    const context = player ? `player ${player.name}, position ${player.position}, recent form: ${recentWins}/3 wins, last match rating: ${lastMatchResult?.rating ?? 'N/A'}` : 'general';

    generateSocialPost(`${context}, post about recent match`).then((p) => {
      if (p) setGroqPosts((prev) => [...prev, p]);
    });
    generateSocialPost(`${context}, post about training`).then((p) => {
      if (p) setGroqPosts((prev) => [...prev, p]);
    });
    generateSocialPost(`${context}, thank fans message`).then((p) => {
      if (p) setGroqPosts((prev) => [...prev, p]);
    });

    if (player) {
      generateFanComments(player.name, 'positive', 4).then((comments) => {
        if (comments) setGroqComments((prev) => [...prev, ...comments.map((t) => ({ text: t, isPositive: true }))]);
      });
      generateFanComments(player.name, 'negative', 3).then((comments) => {
        if (comments) setGroqComments((prev) => [...prev, ...comments.map((t) => ({ text: t, isPositive: false }))]);
      });
    }

    generateTrendingTopics().then((topics) => {
      if (topics) setGroqTrending(topics.map((t) => ({ topic: t, engagement: Math.floor(Math.random() * 50000) + 10000 })));
    });
  }

  const weeklyChange = useMemo(() => {
    if (!player) return 0;
    const perf = player.matchHistory.slice(-3);
    const base = perf.reduce((s, m) => {
      if (m.result === 'Win') return s + 2500;
      if (m.result === 'Draw') return s + 500;
      return s - 1000;
    }, 0);
    return base + player.seasonGoals * 1000 + player.seasonAssists * 500;
  }, [player]);

  const formLevel = player
    ? player.form >= 70
      ? 'high'
      : player.form >= 40
        ? 'medium'
        : 'low'
    : 'medium';

  const fanComments = useMemo(() => {
    if (groqComments.length > 0) return groqComments;
    if (!player) return [];
    const count = 4 + Math.floor(Math.random() * 3);
    const positiveRatio = formLevel === 'high' ? 0.8 : formLevel === 'medium' ? 0.5 : 0.2;
    return Array.from({ length: count }, (_, i) => {
      const isPositive = Math.random() < positiveRatio;
      return {
        id: `comment-${i}`,
        text: isPositive
          ? fallbackPositiveComments[Math.floor(Math.random() * fallbackPositiveComments.length)]
          : fallbackNegativeComments[Math.floor(Math.random() * fallbackNegativeComments.length)],
        isPositive,
        likes: Math.floor(Math.random() * 200) + 20,
      };
    });
  }, [formLevel, player?.matchHistory.length, groqComments]);

  const displayFeed = useMemo(() => {
    if (feed.length > 0) return feed;
    if (!player) return [];
    const baseLikes = Math.floor(player.popularity * 150) + 500;
    const baseEng = player.popularity;
    const groqContents = groqPosts.length >= 3 ? groqPosts : [];
    const templates = groqContents.length >= 3 ? groqContents : fallbackPostTemplates;
    return templates.slice(0, 6).map((content, i) => ({
      id: `post-${i}`,
      content,
      likes: Math.floor(baseLikes * (0.5 + Math.random() * 0.5)),
      comments: Math.floor(Math.random() * 80) + 10,
      engagement: Math.min(100, baseEng + Math.floor(Math.random() * 20 - 10)),
      type: i % 3 === 0 ? 'performance' : i % 3 === 1 ? 'personal' : 'fan',
    }));
  }, [player, feed, groqPosts]);

  const trendingTopics = useMemo(() => {
    if (groqTrending.length > 0) return groqTrending;
    return fallbackTrendingTopics;
  }, [groqTrending]);

  const positiveCount = fanComments.filter((c) => c.isPositive).length;
  const sentimentRatio = fanComments.length > 0
    ? Math.round((positiveCount / fanComments.length) * 100)
    : 50;

  const handlePostUpdate = useCallback(() => {
    if (!player) return;

    const context = `player ${player.name}, position ${player.position}, recent form: ${recentWins}/3 wins`;
    generateSocialPost(`${context}, personal update`).then((groqContent) => {
      const content = groqContent || fallbackPostTemplates[Math.floor(Math.random() * fallbackPostTemplates.length)];
      const newPost: Post = {
        id: `post-${Date.now()}`,
        content,
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 50) + 5,
        engagement: Math.floor(Math.random() * 30) + 40,
        type: 'personal',
      };
      setFeed((prev) => [newPost, ...prev]);
    });

    const popChange = Math.min(5, Math.max(-5, Math.floor(Math.random() * 6 + 2)));
    updatePlayer({
      popularity: Math.min(100, (player.popularity ?? 50) + popChange),
      socialFollowers: (player.socialFollowers ?? 1000) + Math.floor(Math.random() * 500 + 100),
    });
  }, [player, updatePlayer, recentWins]);

  if (!player) return null;

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/25">
                <HiUser className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{player.name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <HiUserGroup className="w-4 h-4 text-indigo-400" />
                    <span className="text-lg font-bold text-white">
                      {formatFollowers(player.socialFollowers ?? 0)}
                    </span>
                    <span className="text-xs text-gray-500">Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiArrowTrendingUp
                      className={`w-4 h-4 ${
                        weeklyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        weeklyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {weeklyChange >= 0 ? '+' : ''}
                      {formatFollowers(weeklyChange)}
                    </span>
                    <span className="text-xs text-gray-500">this week</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 h-full">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <HiChartBar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Popularity
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(player.popularity ?? 50)}
                  </span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HiHeart className="w-5 h-5 text-rose-400" />
                Your Feed
              </h2>
              <Button size="sm" icon={<HiPaperAirplane className="w-4 h-4" />} onClick={handlePostUpdate}>
                Post Update
              </Button>
            </div>

            <AnimatePresence>
              {feed.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                >
                  <Card>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                        <HiUser className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {player.name}
                          </span>
                          <Badge
                            variant={
                              post.type === 'performance'
                                ? 'success'
                                : post.type === 'personal'
                                  ? 'info'
                                  : 'warning'
                            }
                          >
                            {post.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <HiHeart className="w-3.5 h-3.5 text-rose-400" />
                            <span>{post.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HiChatBubbleLeftRight className="w-3.5 h-3.5 text-sky-400" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HiFire
                              className={`w-3.5 h-3.5 ${
                                post.engagement > 70
                                  ? 'text-orange-400'
                                  : 'text-gray-500'
                              }`}
                            />
                            <span>{post.engagement}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <Card
              header={
                <div className="flex items-center gap-2">
                  <HiFire className="w-5 h-5 text-orange-400" />
                  <span className="text-lg font-bold text-white">Trending</span>
                </div>
              }
            >
              <div className="space-y-3">
                {trendingTopics.map((topic, i) => (
                  <div
                    key={topic.topic}
                    className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600 w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm text-white font-medium">
                        {topic.topic}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {topic.engagement.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-2">
                  <HiChatBubbleLeftRight className="w-5 h-5 text-sky-400" />
                  <span className="text-lg font-bold text-white">
                    Fan Reactions
                  </span>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sentiment</span>
                  <div className="flex items-center gap-1">
                    <HiHandThumbUp
                      className={`w-4 h-4 ${
                        sentimentRatio >= 50
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        sentimentRatio >= 50
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {sentimentRatio}% positive
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {fanComments.slice(0, 5).map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                        <HiUser className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300">{comment.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <HiHeart className="w-3 h-3 text-rose-400" />
                          <span className="text-xs text-gray-500">
                            {comment.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
