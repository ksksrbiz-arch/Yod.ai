'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, MessageSquare, Share2, Calendar, Sparkles, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import Starfield from '@/components/Starfield';
import { useAuth } from '@/components/AuthProvider';
import { loginWithGoogle } from '@/lib/firebase';
import {
  ACHIEVEMENTS, RANKS, rankFor, rankProgress, readStats, type Stats,
} from '@/lib/gamification';
import { getQuotaState } from '@/lib/quota';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats>(() => readStats());
  const [quota, setQuota] = useState(() => getQuotaState());

  useEffect(() => {
    const refresh = () => {
      setStats(readStats());
      setQuota(getQuotaState());
    };
    refresh();
    window.addEventListener('yoda:stats', refresh);
    window.addEventListener('yoda:quota', refresh);
    return () => {
      window.removeEventListener('yoda:stats', refresh);
      window.removeEventListener('yoda:quota', refresh);
    };
  }, []);

  const rank = rankFor(stats.wisdomPoints);
  const progress = rankProgress(stats.wisdomPoints);

  const cards = [
    { icon: MessageSquare, label: 'Questions asked', value: stats.questionsAsked },
    { icon: Sparkles, label: 'Wisdom points', value: stats.wisdomPoints },
    { icon: Share2, label: 'Cards shared', value: stats.cardsShared },
    { icon: Calendar, label: 'Days active', value: stats.daysActive },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void-black">
      <Starfield density={50} />

      <header className="relative z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <ArrowLeft size={14} className="text-sage-green" />
            <span className="text-sm text-sage-green">Home</span>
          </Link>
          <Link href="/chat" className="btn-primary text-xs">
            Continue training
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-16">
        <p className="eyebrow mb-4">Your path</p>
        <h1 className="text-3xl md:text-5xl font-headers font-semibold tracking-tight headline mb-3">
          {loading ? 'Loading…' : user ? `Welcome back, ${user.displayName?.split(' ')[0] || 'Padawan'}` : 'Anonymous Seeker'}
        </h1>
        <p className="text-sage-green text-base md:text-lg mb-10 max-w-xl">
          {user
            ? 'Your wisdom journey, distilled. Ranks rise with depth, not volume.'
            : 'Track your progress in this browser. Sign in to sync across devices.'}
        </p>

        {!user && !loading && (
          <button onClick={loginWithGoogle} className="btn-ghost mb-10">
            Link Identity to sync
          </button>
        )}

        {/* Rank progress hero */}
        <div className="surface p-7 md:p-10 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,215,0,0.08), transparent 60%)' }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl glass-strong glow-gold flex items-center justify-center text-5xl">
                {rank.glyph}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-headers font-semibold text-crystal-white">{rank.label}</h2>
                <span className="text-xs font-mono uppercase tracking-widest text-sage-green/70">
                  {stats.wisdomPoints} pts
                </span>
              </div>
              <p className="text-sage-green italic mb-4">{rank.description}</p>
              {progress.next ? (
                <>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-sage-green to-energy-blue"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-sage-green/60 mt-2">
                    <span>{rank.label}</span>
                    <span>{progress.toNext} pts to {progress.next.label}</span>
                  </div>
                </>
              ) : (
                <p className="text-wisdom-gold font-mono text-xs uppercase tracking-widest">Master path complete · A teacher, you have become.</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {cards.map((c) => (
            <div key={c.label} className="surface p-5">
              <c.icon size={16} className="text-sage-green mb-3" />
              <div className="text-3xl font-headers font-semibold text-crystal-white">{c.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-sage-green/70 mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Quota */}
        <div className="surface p-6 mb-12 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-1">Today's quota</p>
            <h3 className="text-xl font-headers font-semibold text-crystal-white">
              {quota.tier === 'free'
                ? `${quota.used} / ${quota.limit} questions used`
                : `Unlimited · ${quota.used} today`}
            </h3>
          </div>
          {quota.tier === 'free' && (
            <Link href="/pricing" className="btn-primary text-xs">
              Unlock unlimited
            </Link>
          )}
        </div>

        {/* Achievements */}
        <p className="eyebrow mb-4">Achievements</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-14">
          {ACHIEVEMENTS.map((a) => {
            const earned = a.earned(stats);
            return (
              <div
                key={a.id}
                className={`surface p-5 flex items-center gap-4 transition ${earned ? 'border-sage-green/30' : 'opacity-60'}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${earned ? 'bg-sage-green/15 glow-force' : 'bg-white/3'}`}>
                  {earned ? <Award size={18} className="text-wisdom-gold" /> : <Lock size={16} className="text-sage-green/40" />}
                </div>
                <div className="flex-1">
                  <div className="font-headers font-medium text-crystal-white text-sm">{a.label}</div>
                  <div className="text-xs text-sage-green/70 mt-0.5">{a.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Path */}
        <p className="eyebrow mb-4">The path</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RANKS.map((r) => {
            const isCurrent = r.id === rank.id;
            return (
              <div key={r.id} className={`surface p-6 ${isCurrent ? 'border-sage-green/40 glow-force' : ''}`}>
                <div className="text-3xl mb-3">{r.glyph}</div>
                <div className="font-headers font-semibold text-crystal-white">{r.label}</div>
                <div className="text-xs text-sage-green/70 mt-1">{r.minPoints}+ pts</div>
                <div className="text-xs text-sage-green/80 italic mt-3">{r.description}</div>
                {isCurrent && (
                  <span className="rank-pill gold mt-4">You are here</span>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-10 border-t border-white/5">
        <span className="text-xs text-sage-green/60">Stats stored in this browser. Sign in to sync.</span>
      </footer>
    </div>
  );
}
