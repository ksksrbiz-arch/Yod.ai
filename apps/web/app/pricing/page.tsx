'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Crown, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'motion/react';
import Starfield from '@/components/Starfield';
import { setTier } from '@/lib/quota';

const TIERS = [
  {
    id: 'free',
    name: 'Seeker',
    price: '$0',
    cadence: 'forever',
    icon: Sparkles,
    blurb: 'Begin the path. Three questions a day, no card required.',
    features: ['3 questions per day', 'Wisdom card sharing', 'Local progress tracking', 'Standard sage depth'],
    cta: 'Start free',
  },
  {
    id: 'padawan',
    name: 'Padawan',
    price: '$4.97',
    cadence: 'per month',
    icon: Crown,
    highlighted: true,
    blurb: 'Unbroken communion. The tier most seekers choose.',
    features: [
      'Unlimited questions',
      'Voice communion with Yoda',
      'Full conversation memory',
      'Premium wisdom cards',
      'Priority sage depth',
      'Early access to new modes',
    ],
    cta: 'Begin Padawan',
  },
  {
    id: 'master',
    name: 'Master',
    price: '$19.97',
    cadence: 'per month',
    icon: InfinityIcon,
    blurb: 'For builders. API access, white-label, custom training.',
    features: [
      'Everything in Padawan',
      'API access',
      'Custom training on your domain',
      'White-label embedding',
      'Analytics dashboard',
      'Direct line to the council',
    ],
    cta: 'Become Master',
  },
] as const;

const FAQ = [
  {
    q: 'Will my card be charged immediately?',
    a: 'In this preview, no. Stripe checkout will be wired up in the next release. For now, your tier choice unlocks the full experience locally.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Wisdom is offered, not enforced. One click in your dashboard cancels at the end of the cycle.',
  },
  {
    q: 'What is "voice communion"?',
    a: 'A real-time voice mode where you speak to Yoda and he answers in his own voice. Available on Padawan and Master.',
  },
  {
    q: 'Is my conversation private?',
    a: 'Yes. Conversations live in your account, never sold, never trained on.',
  },
];

export default function Pricing() {
  const choose = (tier: 'free' | 'padawan' | 'master') => {
    setTier(tier);
    if (typeof window !== 'undefined') window.location.href = '/chat';
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void-black">
      <Starfield density={60} />

      <header className="relative z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <ArrowLeft size={14} className="text-sage-green" />
            <span className="text-sm text-sage-green">Home</span>
          </Link>
          <Link href="/chat" className="btn-ghost text-xs">
            Skip · go to chat
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow mb-4">Choose your path</p>
          <h1 className="text-4xl md:text-6xl font-headers font-semibold tracking-tight headline mb-5">
            Simple as a koan.
          </h1>
          <p className="text-sage-green text-lg leading-relaxed">
            Three tiers. No credit-card maze. Cancel anytime. Less than a coffee — more than an app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {TIERS.map((t, i) => {
            const Icon = t.icon;
            const highlighted = 'highlighted' in t && t.highlighted;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`surface p-7 md:p-8 relative flex flex-col ${
                  highlighted ? 'border-sage-green/40 glow-force scale-[1.02] md:-translate-y-2' : ''
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rank-pill gold whitespace-nowrap">
                    Most chosen
                  </div>
                )}
                <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-5">
                  <Icon size={18} className="text-sage-green" />
                </div>
                <h3 className="text-xl font-headers font-semibold text-crystal-white mb-1">{t.name}</h3>
                <p className="text-sage-green/80 text-sm mb-5 leading-relaxed">{t.blurb}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-headers font-semibold text-crystal-white">{t.price}</span>
                  <span className="text-xs text-sage-green/70 font-mono">/{t.cadence}</span>
                </div>

                <ul className="flex-1 space-y-2.5 mb-7">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-crystal-white">
                      <Check size={14} className="text-sage-green mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => choose(t.id as 'free' | 'padawan' | 'master')}
                  className={highlighted ? 'btn-primary w-full' : 'btn-ghost w-full'}
                >
                  {t.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="mt-24 max-w-3xl mx-auto">
          <p className="eyebrow text-center mb-4">Questions you might have</p>
          <h2 className="text-2xl md:text-4xl font-headers font-semibold text-center headline mb-10">
            Doubt is a teacher, too.
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="surface p-5 group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-medium text-crystal-white">{item.q}</span>
                  <span className="text-sage-green text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sage-green/85 text-sm leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-white/5 text-xs text-sage-green/60 text-center">
        Yoda.ai · Wisdom, distilled.
      </footer>
    </div>
  );
}
