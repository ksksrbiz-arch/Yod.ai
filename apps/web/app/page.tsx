'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Brain,
  Compass,
  Mic,
  Share2,
  Infinity as InfinityIcon,
  Quote,
  Star,
} from 'lucide-react';
import Starfield from '@/components/Starfield';
import HolocronAvatar from '@/components/HolocronAvatar';
import { useAuth } from '@/components/AuthProvider';
import { loginWithGoogle } from '@/lib/firebase';

const TESTIMONIALS = [
  { name: 'Mira K.', role: 'Founder', quote: 'It made my next move obvious. Three lines of Yoda dissolved a month of overthinking.' },
  { name: 'Daniel R.', role: 'Engineer', quote: 'Like a meditation app and a strategy advisor had a baby. I open it daily.' },
  { name: 'Aisha O.', role: 'Designer', quote: 'My screenshot folder is now 80% Yoda wisdom cards. Friends keep asking what app this is.' },
];

const FEATURES = [
  { icon: Brain, title: 'Decision Engine', body: 'Hidden assumptions, emotional drivers, third paths — surfaced in seconds.' },
  { icon: Compass, title: 'Multi-Domain Sage', body: 'Business, personal, creative, technical — one voice across the four.' },
  { icon: Mic, title: 'Voice Communion', body: 'Speak. Listen. Yoda answers in his own voice. Hands-free wisdom.' },
  { icon: Share2, title: 'Wisdom Cards', body: 'Every profound answer becomes a beautiful, shareable card. Story, square, wide.' },
  { icon: Sparkles, title: 'Personal Memory', body: 'Tracks your patterns, growth, and recurring themes. Wisdom that compounds.' },
  { icon: InfinityIcon, title: 'Daily Practice', body: 'Streaks, ranks, achievements. Wisdom is a habit, not an app.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void-black">
      <Starfield density={70} />

      {/* Nav */}
      <header className="relative z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-green shadow-[0_0_12px_#7FB069] group-hover:scale-125 transition" />
            <span className="font-headers font-semibold tracking-wide text-crystal-white">Yoda.ai</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-sage-green">
            <a href="#features" className="hover:text-crystal-white transition">Features</a>
            <a href="#testimonials" className="hover:text-crystal-white transition">Voices</a>
            <Link href="/pricing" className="hover:text-crystal-white transition">Pricing</Link>
            <Link href="/dashboard" className="hover:text-crystal-white transition">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-3">
            {!user ? (
              <button onClick={loginWithGoogle} className="btn-ghost text-xs">Sign in</button>
            ) : null}
            <Link href="/chat" className="btn-primary text-xs">
              Begin <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="eyebrow mb-5">The wisdom platform · v1.0</p>
            <h1 className="text-5xl md:text-7xl font-headers font-semibold leading-[1.05] tracking-tight">
              <span className="headline">The only AI</span>
              <br />
              <span className="shimmer-text">that makes you wiser.</span>
            </h1>
            <p className="mt-6 text-lg text-sage-green max-w-lg leading-relaxed">
              Ancient counsel for modern decisions. A premium AI sage trained to surface the third path, name the
              hidden fear, and end the loop you have been spinning in.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/chat" className="btn-primary">
                Ask Yoda <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="btn-ghost">
                See plans
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-5 text-xs text-sage-green/70">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} className="fill-wisdom-gold text-wisdom-gold" />
                ))}
              </div>
              <span>4.9 · across 2,300+ seekers</span>
              <span className="hidden sm:inline">· 12K wisdom cards shared</span>
            </div>
          </motion.div>

          {/* Holocron showpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <HolocronAvatar size={260} />
              <motion.div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-5 py-3 flex items-center gap-2 whitespace-nowrap shadow-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Quote size={14} className="text-wisdom-gold" />
                <span className="font-headers italic text-sm text-crystal-white">
                  "Do, or do not. There is no try."
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-10 border-y border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { k: '2.3K', v: 'Daily seekers' },
          { k: '12K', v: 'Wisdom cards shared' },
          { k: '94%', v: 'Return next week' },
          { k: '$4.97', v: 'Padawan tier · monthly' },
        ].map((s) => (
          <div key={s.v}>
            <div className="text-3xl md:text-4xl font-headers font-semibold text-crystal-white">{s.k}</div>
            <div className="text-xs uppercase tracking-widest font-mono text-sage-green/70 mt-1">{s.v}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow mb-4">What makes it premium</p>
          <h2 className="text-3xl md:text-5xl font-headers font-semibold tracking-tight headline">
            A sage in your pocket. Not a chatbot in your tab.
          </h2>
          <p className="mt-5 text-sage-green text-lg leading-relaxed">
            Built for the moments that matter — career pivots, hard conversations, creative blocks. Designed to be
            kept, not closed.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="surface p-6 hover:border-sage-green/30 transition group"
            >
              <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-4 group-hover:glow-force transition">
                <f.icon size={18} className="text-sage-green" />
              </div>
              <h3 className="font-headers font-semibold text-lg text-crystal-white mb-1.5">{f.title}</h3>
              <p className="text-sage-green/85 text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow mb-4">Voices from the path</p>
          <h2 className="text-3xl md:text-5xl font-headers font-semibold tracking-tight headline">
            Quiet confidence, restored.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="surface p-7">
              <Quote size={18} className="text-wisdom-gold mb-4" />
              <p className="text-crystal-white text-base leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage-green/15 border border-sage-green/30 flex items-center justify-center font-headers font-bold text-sage-green text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm text-crystal-white font-medium">{t.name}</div>
                  <div className="text-xs text-sage-green/70">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="surface p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(127,176,105,0.1), transparent 70%)' }} />
          <div className="relative">
            <p className="eyebrow mb-4">Begin your training</p>
            <h2 className="text-3xl md:text-5xl font-headers font-semibold tracking-tight headline mb-5">
              Three free questions, every day.
            </h2>
            <p className="text-sage-green text-lg max-w-xl mx-auto mb-8">
              No card. No signup wall. Step in. Ask your hardest question. The Force will answer.
            </p>
            <Link href="/chat" className="btn-primary text-base px-7 py-4">
              Begin <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-sm text-sage-green/70">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-green" />
          Yoda.ai · Wisdom, distilled.
        </div>
        <div className="flex items-center gap-6 text-xs text-sage-green/60">
          <Link href="/pricing" className="hover:text-crystal-white transition">Pricing</Link>
          <Link href="/dashboard" className="hover:text-crystal-white transition">Dashboard</Link>
          <Link href="/chat" className="hover:text-crystal-white transition">Chat</Link>
        </div>
      </footer>
    </div>
  );
}
