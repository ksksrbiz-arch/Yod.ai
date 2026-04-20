export type Rank = 'youngling' | 'padawan' | 'knight' | 'master';

export interface RankInfo {
  id: Rank;
  label: string;
  minPoints: number;
  glyph: string;
  description: string;
}

export const RANKS: RankInfo[] = [
  { id: 'youngling', label: 'Youngling', minPoints: 0, glyph: '◌', description: 'A seeker awakens.' },
  { id: 'padawan', label: 'Padawan', minPoints: 50, glyph: '◐', description: 'Curiosity, the first teacher.' },
  { id: 'knight', label: 'Knight', minPoints: 250, glyph: '◑', description: 'Discipline, the second.' },
  { id: 'master', label: 'Master', minPoints: 1000, glyph: '●', description: 'Stillness, the third.' },
];

export interface Achievement {
  id: string;
  label: string;
  description: string;
  earned: (s: Stats) => boolean;
}

export interface Stats {
  questionsAsked: number;
  wisdomPoints: number;
  cardsShared: number;
  daysActive: number;
  longestQuestionChars: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', label: 'First Step', description: 'Asked your first question.', earned: (s) => s.questionsAsked >= 1 },
  { id: 'thoughtful', label: 'Thoughtful Questioner', description: 'Asked a question over 200 characters.', earned: (s) => s.longestQuestionChars >= 200 },
  { id: 'daily-seeker', label: 'Daily Seeker', description: 'Active 3 days in a row.', earned: (s) => s.daysActive >= 3 },
  { id: 'deep-thinker', label: 'Deep Thinker', description: 'Reached 100 wisdom points.', earned: (s) => s.wisdomPoints >= 100 },
  { id: 'wisdom-sharer', label: 'Wisdom Sharer', description: 'Shared a wisdom card.', earned: (s) => s.cardsShared >= 1 },
  { id: 'dedicated', label: 'Dedicated', description: '50 questions asked.', earned: (s) => s.questionsAsked >= 50 },
];

export function rankFor(points: number): RankInfo {
  let current = RANKS[0];
  for (const r of RANKS) if (points >= r.minPoints) current = r;
  return current;
}

export function nextRank(points: number): RankInfo | null {
  for (const r of RANKS) if (r.minPoints > points) return r;
  return null;
}

export function rankProgress(points: number): { pct: number; toNext: number; next: RankInfo | null } {
  const cur = rankFor(points);
  const next = nextRank(points);
  if (!next) return { pct: 100, toNext: 0, next: null };
  const span = next.minPoints - cur.minPoints;
  const into = points - cur.minPoints;
  return { pct: Math.max(0, Math.min(100, (into / span) * 100)), toNext: next.minPoints - points, next };
}

export function pointsForQuestion(text: string): number {
  const len = text.trim().length;
  let pts = 5;
  if (len > 80) pts += 5;
  if (len > 200) pts += 5;
  if (/why|how|meaning|purpose|truth|fear|growth|love|courage/i.test(text)) pts += 3;
  return pts;
}

const STATS_KEY = 'yoda_stats_v1';

export function readStats(): Stats {
  if (typeof window === 'undefined') return emptyStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    return { ...emptyStats(), ...JSON.parse(raw) };
  } catch {
    return emptyStats();
  }
}

export function writeStats(s: Stats) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent('yoda:stats'));
}

export function recordQuestion(text: string): Stats {
  const s = readStats();
  const today = new Date().toISOString().slice(0, 10);
  const lastDay = (s as Stats & { lastDay?: string }).lastDay;
  let daysActive = s.daysActive;
  if (lastDay !== today) daysActive += 1;
  const next: Stats = {
    questionsAsked: s.questionsAsked + 1,
    wisdomPoints: s.wisdomPoints + pointsForQuestion(text),
    cardsShared: s.cardsShared,
    daysActive,
    longestQuestionChars: Math.max(s.longestQuestionChars, text.length),
  };
  (next as Stats & { lastDay?: string }).lastDay = today;
  writeStats(next);
  return next;
}

export function recordShare(): Stats {
  const s = readStats();
  const next = { ...s, cardsShared: s.cardsShared + 1 };
  writeStats(next);
  return next;
}

function emptyStats(): Stats {
  return { questionsAsked: 0, wisdomPoints: 0, cardsShared: 0, daysActive: 0, longestQuestionChars: 0 };
}
