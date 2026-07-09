import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiNewspaper, HiMegaphone, HiUser, HiChevronDown } from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { useSimulationStore } from '../../stores/simulationStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageTransition from '../../components/layout/PageTransition';


type NewsFilter = 'All' | 'Transfers' | 'Injuries' | 'Matches' | 'Awards' | 'Breaking';

const filters: NewsFilter[] = ['All', 'Breaking', 'Transfers', 'Injuries', 'Matches', 'Awards'];

function getCategoryBadge(type: string): { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' } {
  const lower = type.toLowerCase();
  if (lower.includes('transfer')) return { label: 'Transfer', variant: 'success' };
  if (lower.includes('injury')) return { label: 'Injury', variant: 'error' };
  if (lower.includes('match') || lower.includes('result')) return { label: 'Match Report', variant: 'info' };
  if (lower.includes('award') || lower.includes('trophy')) return { label: 'Award', variant: 'warning' };
  if (lower.includes('manager') || lower.includes('sack')) return { label: 'Manager', variant: 'default' };
  if (lower.includes('title') || lower.includes('league')) return { label: 'League', variant: 'info' };
  if (lower.includes('break') || lower.includes('breaking')) return { label: 'Breaking', variant: 'error' };
  return { label: 'League', variant: 'info' };
}

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState<NewsFilter>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const inbox = useGameStore((s) => s.inbox);
  const worldNews = useSimulationStore((s) => s.worldNews);

  const allNews = useMemo(() => {
    const combined = [...(worldNews ?? []), ...inbox];
    const unique = combined.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );
    return unique.sort((a, b) => {
      if (b.importance !== a.importance) return b.importance - a.importance;
      if (b.season !== a.season) return b.season - a.season;
      return b.week - a.week;
    });
  }, [inbox, worldNews]);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return allNews;
    if (activeFilter === 'Breaking') return allNews.filter((n) => n.importance >= 8);
    const filterLower = activeFilter.toLowerCase();
    return allNews.filter((n) => n.type.toLowerCase().includes(filterLower));
  }, [allNews, activeFilter]);

  const breakingNews = useMemo(
    () => allNews.filter((n) => n.importance >= 8),
    [allNews]
  );

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
            <p className="text-sm text-gray-400">The world's media</p>
          </div>
        </motion.div>

        <AnimatePresence>
          {breakingNews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-rose-500/30 bg-rose-600/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                    <HiMegaphone className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <Badge variant="error">BREAKING</Badge>
                    <p className="text-sm font-bold text-white mt-1">
                      {breakingNews[0].headline}
                    </p>
                    <p className="text-xs text-rose-300/70 mt-0.5">
                      {breakingNews[0].body.slice(0, 100)}
                      {breakingNews[0].body.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card>
              <p className="text-gray-500 text-sm text-center py-4">
                No news articles found
              </p>
            </Card>
          )}
          <AnimatePresence>
            {filtered.map((article, i) => {
              const { label: category, variant } = getCategoryBadge(article.type);
              const isExpanded = expandedId === article.id;
              const isPlayerRelated = inbox.some((n) => n.id === article.id);
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
                      article.importance >= 8 ? 'border-rose-500/30' : ''
                    }`}
                  >
                    {article.importance >= 8 && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-rose-600" />
                    )}
                    {article.importance < 8 && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-600 to-gray-700" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant={variant}>{category}</Badge>
                          {isPlayerRelated && (
                            <HiUser className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span className="text-xs text-gray-500 ml-auto">
                            W{article.week} &middot; S{article.season}
                          </span>
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
