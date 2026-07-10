import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiNewspaper, HiUser, HiChevronDown, HiGlobeAlt } from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { generateNewsArticle } from '../../services/groqService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageTransition from '../../components/layout/PageTransition';

function getCategoryBadge(type: string): { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' } {
  const lower = type.toLowerCase();
  if (lower.includes('transfer')) return { label: 'Transfer', variant: 'success' };
  if (lower.includes('injury')) return { label: 'Injury', variant: 'error' };
  if (lower.includes('match') || lower.includes('result')) return { label: 'Match Report', variant: 'info' };
  if (lower.includes('award') || lower.includes('trophy')) return { label: 'Award', variant: 'warning' };
  if (lower.includes('manager') || lower.includes('sack')) return { label: 'Manager', variant: 'default' };
  if (lower.includes('title') || lower.includes('league')) return { label: 'League', variant: 'info' };
  if (lower.includes('tournament')) return { label: 'Tournament', variant: 'warning' };
  return { label: 'League', variant: 'info' };
}

export default function NewsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groqHeadlines, setGroqHeadlines] = useState<{ headline: string; body: string }[]>([]);
  const inbox = useGameStore((s) => s.inbox);
  const worldNews = useSimulationStore((s) => s.worldNews);

  // Auto-generate Groq news on mount
  useEffect(() => {
    const topics = [
      'transfer window latest rumors and completed deals around Europe',
      'surprise injury update for a top club star player',
      'match of the week review with stunning goals and drama',
      'manager under pressure after poor run of results',
      'young wonderkid making headlines with incredible form',
      'title race heating up as contenders drop points',
    ];
    const selected = topics.sort(() => Math.random() - 0.5).slice(0, 3);
    for (const topic of selected) {
      generateNewsArticle(topic).then((article) => {
        if (article) setGroqHeadlines((prev) => [...prev, article]);
      });
    }
  }, []);

  const allNews = useMemo(() => {
    const groqArticles = groqHeadlines.map((g, i) => ({
      id: `groq-auto-${i}-${Date.now()}`,
      week: 0,
      season: 0,
      type: 'Headline',
      headline: g.headline,
      body: g.body,
      importance: 6,
      date: new Date().toISOString(),
    }));
    const combined = [...groqArticles, ...(worldNews ?? []), ...inbox];
    return combined
      .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
      .sort((a, b) => {
        if (b.importance !== a.importance) return b.importance - a.importance;
        if (b.season !== a.season) return b.season - a.season;
        return b.week - a.week;
      });
  }, [inbox, worldNews, groqHeadlines]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/25">
            <HiNewspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">World Football News</h1>
            <p className="text-sm text-gray-400">Latest headlines from around the world</p>
          </div>
        </motion.div>

        <div className="space-y-3">
          {allNews.length === 0 && (
            <Card>
              <p className="text-gray-500 text-sm text-center py-4">
                No news articles found
              </p>
            </Card>
          )}
          <AnimatePresence>
            {allNews.map((article, i) => {
              const { label: category, variant } = getCategoryBadge(article.type);
              const isExpanded = expandedId === article.id;
              const isPlayerRelated = inbox.some((n) => n.id === article.id);
              const isGroq = article.id.startsWith('groq-auto-');
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                >
                  <Card
                    className={`relative overflow-hidden ${
                      article.importance >= 8 ? 'border-amber-500/30' : ''
                    }`}
                  >
                    {article.importance >= 8 && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600" />
                    )}
                    <div className="flex items-start gap-3">
                      {isGroq && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                          <HiGlobeAlt className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant={variant}>{category}</Badge>
                          {isPlayerRelated && (
                            <HiUser className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          {article.week > 0 && (
                            <span className="text-xs text-gray-500 ml-auto">
                              W{article.week} &middot; S{article.season}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : article.id)
                          }
                          className="w-full text-left"
                        >
                          <p className="text-base font-bold text-white leading-snug">
                            {article.headline}
                          </p>
                        </button>
                        <div className="mt-1">
                          <p
                            className={`text-sm text-gray-400 ${
                              isExpanded ? '' : 'line-clamp-2'
                            }`}
                          >
                            {article.body}
                          </p>
                        </div>
                        {article.body.length > 120 && (
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : article.id)
                            }
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                            <HiChevronDown
                              className={`w-3 h-3 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
