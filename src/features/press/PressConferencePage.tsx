import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMicrophone, HiCalendarDays, HiCheck, HiArrowLeft } from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageTransition from '../../components/layout/PageTransition';
import { generatePreMatchQuestions, generatePostMatchQuestions, applyPressConferenceEffects, type PressQuestion, type PressConferenceResult } from '../../services/pressService';

export default function PressConferencePage() {
  const player = useGameStore((s) => s.player);
  const nextMatch = useGameStore((s) => s.nextMatch);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const { goTo } = usePhaseNavigation();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; chosenAnswer: string; response: string }[]>([]);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => {
    if (!player) return [];
    if (nextMatch) {
      return generatePreMatchQuestions(nextMatch.opponent, player.form);
    }
    const lastMatch = player.matchHistory[player.matchHistory.length - 1];
    if (lastMatch) {
      return generatePostMatchQuestions(lastMatch.result as 'Win' | 'Draw' | 'Loss', lastMatch, lastMatch.opponent);
    }
    return [];
  }, [player, nextMatch]);

  if (!player) return null;

  const currentQuestion = questions[currentQIndex];
  const isPreMatch = !!nextMatch;

  const handleAnswer = (question: PressQuestion, answerIndex: number) => {
    const answer = question.answers[answerIndex];
    setAnswers((prev) => [...prev, {
      question: question.question,
      chosenAnswer: answer.text,
      response: answer.response,
    }]);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((i) => i + 1);
    } else {
      const result: PressConferenceResult = {
        questions: [...answers, { question: question.question, chosenAnswer: answer.text, response: answer.response }],
        totalMorale: [...answers, { question: question.question, chosenAnswer: answer.text, response: answer.response }].reduce((s, _, i) => {
          return s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.moraleEffect ?? 0);
        }, 0),
        totalPopularity: [...answers, { question: question.question, chosenAnswer: answer.text, response: answer.response }].reduce((s, _, i) => {
          return s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.popularityEffect ?? 0);
        }, 0),
        totalManagerTrust: [...answers, { question: question.question, chosenAnswer: answer.text, response: answer.response }].reduce((s, _, i) => {
          return s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.managerTrustEffect ?? 0);
        }, 0),
        totalConfidence: [...answers, { question: question.question, chosenAnswer: answer.text, response: answer.response }].reduce((s, _, i) => {
          return s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.confidenceEffect ?? 0);
        }, 0),
      };
      updatePlayer(applyPressConferenceEffects(player, result));
      setFinished(true);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
            <button onClick={() => goTo('home')} className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors">
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <HiMicrophone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Press Conference
                </h1>
                <p className="text-sm text-gray-500">{isPreMatch ? 'Pre-Match' : 'Post-Match'} &middot; {nextMatch ? nextMatch.opponent : 'Media Duty'}</p>
              </div>
            </div>
          </motion.div>

          {questions.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <HiMicrophone className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No press questions available right now.</p>
                <p className="text-xs text-gray-600 mt-1">Schedule a match to generate press interest.</p>
                <Button variant="primary" className="mt-4" onClick={() => goTo('home')}>Back to Home</Button>
              </div>
            </Card>
          ) : finished ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-emerald-500/30">
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
                    <HiCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Press Conference Complete</h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    You answered {answers.length} question{answers.length > 1 ? 's' : ''}. The media have published their stories.
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-center">
                      <p className="text-xs text-gray-500 uppercase">Morale</p>
                      <p className={`text-lg font-bold ${answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.moraleEffect ?? 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.moraleEffect ?? 0), 0) >= 0 ? '+' : ''}{answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.moraleEffect ?? 0), 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-center">
                      <p className="text-xs text-gray-500 uppercase">Popularity</p>
                      <p className={`text-lg font-bold ${answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.popularityEffect ?? 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.popularityEffect ?? 0), 0) >= 0 ? '+' : ''}{answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.popularityEffect ?? 0), 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-center">
                      <p className="text-xs text-gray-500 uppercase">Trust</p>
                      <p className={`text-lg font-bold ${answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.managerTrustEffect ?? 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.managerTrustEffect ?? 0), 0) >= 0 ? '+' : ''}{answers.reduce((s, _, i) => s + (questions[i]?.answers[questions[i].answers.findIndex((a) => a.text === _?.chosenAnswer)]?.managerTrustEffect ?? 0), 0)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    {answers.map((a, i) => (
                      <div key={i} className="text-sm text-gray-400 bg-gray-900 rounded-lg p-3 border border-gray-800">
                        <p className="font-medium text-white mb-1">{a.question}</p>
                        <p className="text-indigo-300">"{a.chosenAnswer}"</p>
                        <p className="text-gray-500 italic mt-1">— {a.response}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" onClick={() => goTo('home')}>Back to Home</Button>
                </div>
              </Card>
            </motion.div>
          ) : currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <Card>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="info">{isPreMatch ? 'Pre-Match' : 'Post-Match'}</Badge>
                      <span className="text-xs text-gray-500">Question {currentQIndex + 1} of {questions.length}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HiMicrophone className="w-5 h-5 text-indigo-400" />
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Journalist</span>
                      </div>
                      <p className="text-lg font-semibold text-white leading-relaxed">{currentQuestion.question}</p>
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.answers.map((answer, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswer(currentQuestion, idx)}
                          className="w-full text-left p-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                        >
                          <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                            {answer.text}
                          </p>
                          <div className="flex gap-3 mt-2 text-[10px] text-gray-600">
                            {answer.moraleEffect !== 0 && <span className={answer.moraleEffect > 0 ? 'text-emerald-500' : 'text-rose-500'}>Morale {answer.moraleEffect > 0 ? '+' : ''}{answer.moraleEffect}</span>}
                            {answer.popularityEffect !== 0 && <span className={answer.popularityEffect > 0 ? 'text-emerald-500' : 'text-rose-500'}>Pop {answer.popularityEffect > 0 ? '+' : ''}{answer.popularityEffect}</span>}
                            {answer.managerTrustEffect !== 0 && <span className={answer.managerTrustEffect > 0 ? 'text-emerald-500' : 'text-rose-500'}>Trust {answer.managerTrustEffect > 0 ? '+' : ''}{answer.managerTrustEffect}</span>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
