'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Zap } from 'lucide-react';
import { getQuotaState } from '@/lib/quota';
import { rankFor, rankProgress, readStats, type Stats } from '@/lib/gamification';

export default function QuotaBadge() {
  const [quota, setQuota] = useState(() => getQuotaState());
  const [stats, setStats] = useState<Stats>(() => readStats());

  useEffect(() => {
    const refresh = () => {
      setQuota(getQuotaState());
      setStats(readStats());
    };
    refresh();
    window.addEventListener('yoda:quota', refresh);
    window.addEventListener('yoda:stats', refresh);
    return () => {
      window.removeEventListener('yoda:quota', refresh);
      window.removeEventListener('yoda:stats', refresh);
    };
  }, []);

  const rank = rankFor(stats.wisdomPoints);
  const progress = rankProgress(stats.wisdomPoints);

  return (
    <div className="surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="rank-pill gold">
          <Sparkles size={10} /> {rank.label}
        </span>
        <span className="text-xs text-sage-green/70 font-mono">
          {stats.wisdomPoints} <span className="text-sage-green/50">pts</span>
        </span>
      </div>

      {progress.next ? (
        <div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sage-green to-energy-blue rounded-full transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-sage-green/60 mt-1.5">
            <span>{rank.label}</span>
            <span>{progress.toNext} to {progress.next.label}</span>
          </div>
        </div>
      ) : (
        <div className="text-[10px] font-mono uppercase tracking-widest text-wisdom-gold">Master path complete</div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-sage-green" />
          <span className="text-xs text-crystal-white">
            {quota.tier === 'free' ? `${quota.remaining}/${quota.limit} today` : 'Unlimited'}
          </span>
        </div>
        {quota.tier === 'free' && quota.remaining <= 1 && (
          <Link href="/pricing" className="text-[10px] font-mono uppercase tracking-widest text-wisdom-gold hover:underline">
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
