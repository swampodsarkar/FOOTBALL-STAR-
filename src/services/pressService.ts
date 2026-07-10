import type { Player, MatchPerformance } from '../types';
import { generatePressQuestions as groqPressQuestions } from './groqService';

export interface PressQuestion {
  id: string;
  question: string;
  context: string;
  answers: PressAnswer[];
}

export interface PressAnswer {
  text: string;
  moraleEffect: number;
  popularityEffect: number;
  managerTrustEffect: number;
  confidenceEffect: number;
  response: string;
}

export interface PressConferenceResult {
  questions: { question: string; chosenAnswer: string; response: string }[];
  totalMorale: number;
  totalPopularity: number;
  totalManagerTrust: number;
  totalConfidence: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function parseEffect(text: string, effectStr: string): number {
  const match = text.match(new RegExp(`\\[${effectStr}([+-]\\d+)\\]`));
  return match ? parseInt(match[1], 10) : 0;
}

function stripEffects(text: string): string {
  return text.replace(/\[(morale|pop|trust)[+-]?\d+\]/g, '').trim();
}

export async function generatePreMatchQuestions(opponent: string, playerForm: number, matchImportance: string = 'league'): Promise<PressQuestion[]> {
  const groqResult = await groqPressQuestions(`Pre-match press conference before facing ${opponent}. Player form: ${playerForm}%. Match: ${matchImportance}.`);
  if (groqResult && groqResult.length >= 2) {
    return groqResult.slice(0, 3).map((q, i) => ({
      id: `groq-pre-${i}`,
      question: q.question,
      context: 'AI-generated pre-match question',
      answers: q.answers.map((a, j) => ({
        text: stripEffects(a.text),
        moraleEffect: parseEffect(a.text, 'morale') || (j === 0 ? 3 : j === 1 ? 1 : -3),
        popularityEffect: parseEffect(a.text, 'pop') || (j === 0 ? 2 : j === 1 ? 1 : -2),
        managerTrustEffect: parseEffect(a.text, 'trust') || (j === 0 ? 3 : j === 1 ? 2 : -3),
        confidenceEffect: parseEffect(a.text, 'morale') || (j === 0 ? 3 : j === 1 ? 1 : -3),
        response: j === 0 ? 'A confident answer that pleases the room.' : j === 1 ? 'A measured response.' : 'A risky admission.',
      })),
    }));
  }

  const questions: PressQuestion[] = [];

  questions.push({
    id: 'pre-confident',
    question: `Your team faces ${opponent} next. How are you feeling about the match?`,
    context: 'Pre-match confidence question',
    answers: [
      { text: 'We\'re fully prepared and confident of getting the win.', moraleEffect: 5, popularityEffect: 3, managerTrustEffect: 3, confidenceEffect: 8, response: 'A confident statement that rallies the fans.' },
      { text: 'It will be a tough match, but we\'ll give our best.', moraleEffect: 3, popularityEffect: 1, managerTrustEffect: 5, confidenceEffect: 3, response: 'A balanced, realistic take.' },
      { text: 'I\'m not sure. We\'ve struggled lately.', moraleEffect: -5, popularityEffect: -3, managerTrustEffect: -5, confidenceEffect: -5, response: 'Honest but worrying for fans to hear.' },
    ],
  });

  questions.push({
    id: 'pre-pressure',
    question: `There's a lot of expectation on you this season. How do you handle the pressure?`,
    context: 'Pressure and expectations',
    answers: [
      { text: 'Pressure is a privilege. I thrive on it.', moraleEffect: 5, popularityEffect: 5, managerTrustEffect: 3, confidenceEffect: 5, response: 'Fans love the confidence.' },
      { text: 'I try not to think about it and just focus on my game.', moraleEffect: 2, popularityEffect: 1, managerTrustEffect: 2, confidenceEffect: 2, response: 'A sensible, grounded response.' },
      { text: 'It\'s been getting to me, if I\'m honest.', moraleEffect: -8, popularityEffect: -5, managerTrustEffect: -3, confidenceEffect: -5, response: 'Admitting doubt — the media have a field day.' },
    ],
  });

  if (playerForm < 50) {
    questions.push({
      id: 'pre-form',
      question: 'Your recent form has dipped. What\'s going on?',
      context: 'Form concerns',
      answers: [
        { text: 'Every player goes through patches. I\'ll come back stronger.', moraleEffect: 3, popularityEffect: 2, managerTrustEffect: 3, confidenceEffect: 5, response: 'A resilient answer that shows character.' },
        { text: 'I\'ve been working extra in training to fix it.', moraleEffect: 2, popularityEffect: 3, managerTrustEffect: 5, confidenceEffect: 2, response: 'The manager appreciates the dedication.' },
        { text: 'I\'m not sure what\'s wrong. It\'s frustrating.', moraleEffect: -5, popularityEffect: -3, managerTrustEffect: -5, confidenceEffect: -5, response: 'Honesty doesn\'t always play well with the press.' },
      ],
    });
  } else {
    questions.push({
      id: 'pre-form-good',
      question: 'You\'ve been in great form recently. Can you keep it up?',
      context: 'Good form',
      answers: [
        { text: 'Absolutely. I feel fit and at my best.', moraleEffect: 5, popularityEffect: 3, managerTrustEffect: 2, confidenceEffect: 5, response: 'Fans cheer the bold claim.' },
        { text: 'I\'m just focused on helping the team win.', moraleEffect: 3, popularityEffect: 2, managerTrustEffect: 5, confidenceEffect: 3, response: 'A humble, team-first answer.' },
        { text: 'I don\'t want to jinx it!', moraleEffect: 1, popularityEffect: 3, managerTrustEffect: 1, confidenceEffect: 1, response: 'A lighthearted response — the room laughs.' },
      ],
    });
  }

  return questions;
}

export async function generatePostMatchQuestions(result: 'Win' | 'Draw' | 'Loss', performance: Partial<MatchPerformance>, opponent: string): Promise<PressQuestion[]> {
  const groqResult = await groqPressQuestions(`Post-match press conference after a ${result} against ${opponent}. Player scored: ${(performance.goals ?? 0) > 0 ? 'yes' : 'no'}.`);
  if (groqResult && groqResult.length >= 2) {
    return groqResult.slice(0, 3).map((q, i) => ({
      id: `groq-post-${i}`,
      question: q.question,
      context: 'AI-generated post-match question',
      answers: q.answers.map((a, j) => ({
        text: stripEffects(a.text),
        moraleEffect: parseEffect(a.text, 'morale') || (result === 'Win' ? [5, 3, -3][j] || 0 : result === 'Loss' ? [-2, -3, -5][j] || 0 : [2, -2, 3][j] || 0),
        popularityEffect: parseEffect(a.text, 'pop') || (j === 0 ? 2 : j === 1 ? 3 : 1),
        managerTrustEffect: parseEffect(a.text, 'trust') || (j === 0 ? 3 : j === 1 ? 1 : -3),
        confidenceEffect: parseEffect(a.text, 'morale') || (j === 0 ? 3 : j === 1 ? 0 : -3),
        response: j === 0 ? 'A strong answer that resonates.' : j === 1 ? 'A balanced viewpoint.' : 'An honest but risky take.',
      })),
    }));
  }

  const questions: PressQuestion[] = [];

  if (result === 'Win') {
    questions.push({
      id: 'post-win',
      question: `Great win against ${opponent}! What was the key to victory?`,
      context: 'Post-match victory',
      answers: [
        { text: 'We stuck to the game plan and executed perfectly.', moraleEffect: 5, popularityEffect: 3, managerTrustEffect: 5, confidenceEffect: 5, response: 'The manager smiles — you credit the tactics.' },
        { text: 'The fans pushed us through. They were incredible.', moraleEffect: 3, popularityEffect: 8, managerTrustEffect: 3, confidenceEffect: 3, response: 'The fans adore you even more.' },
        { text: 'I felt great out there. Everything clicked for me.', moraleEffect: 5, popularityEffect: 1, managerTrustEffect: 1, confidenceEffect: 8, response: 'Confident, but slightly self-centered.' },
      ],
    });
  } else if (result === 'Loss') {
    questions.push({
      id: 'post-loss',
      question: `Tough loss against ${opponent}. What went wrong?`,
      context: 'Post-match defeat',
      answers: [
        { text: 'We didn\'t execute our game plan. We\'ll learn from this.', moraleEffect: -2, popularityEffect: 1, managerTrustEffect: 3, confidenceEffect: -3, response: 'Accountable — the manager appreciates the honesty.' },
        { text: 'We were unlucky. The better team didn\'t win today.', moraleEffect: -3, popularityEffect: -3, managerTrustEffect: -5, confidenceEffect: -2, response: 'Sounds like making excuses.' },
        { text: 'I take responsibility. I need to be better.', moraleEffect: -5, popularityEffect: 5, managerTrustEffect: 5, confidenceEffect: -5, response: 'Taking the blame earns respect.' },
      ],
    });
  } else {
    questions.push({
      id: 'post-draw',
      question: `A hard-fought draw against ${opponent}. Satisfied with a point?`,
      context: 'Post-match draw',
      answers: [
        { text: 'We wanted all three, but a point keeps us moving.', moraleEffect: 2, popularityEffect: 1, managerTrustEffect: 3, confidenceEffect: 2, response: 'A balanced take on the result.' },
        { text: 'We dominated and should have won. Frustrating.', moraleEffect: -2, popularityEffect: 0, managerTrustEffect: -2, confidenceEffect: 2, response: 'Honest frustration.' },
        { text: 'The lads fought hard. We build on this.', moraleEffect: 3, popularityEffect: 2, managerTrustEffect: 3, confidenceEffect: 3, response: 'Positive outlook — good for team spirit.' },
      ],
    });
  }

  if (performance.goals && performance.goals > 0) {
    questions.push({
      id: 'post-goal',
      question: `You got on the scoresheet. How does it feel?`,
      context: 'Goal scorer reaction',
      answers: [
        { text: 'It\'s always special to score. Most importantly, I helped the team.', moraleEffect: 5, popularityEffect: 3, managerTrustEffect: 3, confidenceEffect: 5, response: 'A perfect balance of personal joy and team focus.' },
        { text: 'I\'ve been working on finishing in training, and it paid off.', moraleEffect: 3, popularityEffect: 2, managerTrustEffect: 5, confidenceEffect: 3, response: 'The manager loves hearing training pays off.' },
        { text: 'That was for the fans — they deserve it.', moraleEffect: 2, popularityEffect: 8, managerTrustEffect: 2, confidenceEffect: 2, response: 'Fan favorite quote!' },
      ],
    });
  }

  return questions;
}

export function applyPressConferenceEffects(player: Player, result: PressConferenceResult): Partial<Player> {
  return {
    morale: clamp(player.morale + result.totalMorale, 0, 100),
    popularity: clamp(player.popularity + result.totalPopularity, 0, 100),
    managerTrust: clamp(player.managerTrust + result.totalManagerTrust, 0, 100),
    confidence: clamp(player.confidence + result.totalConfidence, 0, 100),
  };
}
