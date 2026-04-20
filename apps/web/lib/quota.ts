export const FREE_DAILY_QUESTIONS = 3;

const QUOTA_KEY = 'yoda_quota_v1';

interface Quota {
  date: string;
  used: number;
  tier: 'free' | 'padawan' | 'master';
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Quota {
  if (typeof window === 'undefined') return { date: today(), used: 0, tier: 'free' };
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    if (!raw) return { date: today(), used: 0, tier: 'free' };
    const q = JSON.parse(raw) as Quota;
    if (q.date !== today()) return { date: today(), used: 0, tier: q.tier || 'free' };
    return q;
  } catch {
    return { date: today(), used: 0, tier: 'free' };
  }
}

function write(q: Quota) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUOTA_KEY, JSON.stringify(q));
  window.dispatchEvent(new CustomEvent('yoda:quota'));
}

export function getQuotaState() {
  const q = read();
  const limit = q.tier === 'free' ? FREE_DAILY_QUESTIONS : Infinity;
  return {
    used: q.used,
    limit,
    remaining: Math.max(0, limit - q.used),
    tier: q.tier,
    isExceeded: q.used >= limit,
  };
}

export function consumeQuota(): { ok: boolean; remaining: number; tier: Quota['tier'] } {
  const q = read();
  const limit = q.tier === 'free' ? FREE_DAILY_QUESTIONS : Infinity;
  if (q.used >= limit) return { ok: false, remaining: 0, tier: q.tier };
  const next: Quota = { ...q, used: q.used + 1 };
  write(next);
  return { ok: true, remaining: Math.max(0, limit - next.used), tier: q.tier };
}

export function setTier(tier: Quota['tier']) {
  const q = read();
  write({ ...q, tier });
}
