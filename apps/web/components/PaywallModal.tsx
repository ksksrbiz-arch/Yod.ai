'use client';
import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Infinity as InfinityIcon, Mic, Crown } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PaywallModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-void-black/85 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative glass-strong rounded-3xl p-8 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          >
            <button
              className="absolute top-4 right-4 text-sage-green hover:text-crystal-white transition"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center glow-gold mb-4">
                <Crown size={22} className="text-wisdom-gold" />
              </div>
              <p className="eyebrow">Daily wisdom limit reached</p>
              <h3 className="headline text-2xl mt-2 mb-3">Continue your training, Padawan</h3>
              <p className="text-sage-green text-sm leading-relaxed mb-6">
                Three questions a day, the free path allows. Unbroken communion with the Force, the Padawan tier
                unlocks.
              </p>

              <ul className="w-full space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-green/8 border border-sage-green/15">
                  <InfinityIcon size={16} className="text-sage-green" />
                  <span className="text-crystal-white">Unlimited questions, daily.</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-green/8 border border-sage-green/15">
                  <Mic size={16} className="text-sage-green" />
                  <span className="text-crystal-white">Voice communion & deeper memory.</span>
                </li>
                <li className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-green/8 border border-sage-green/15">
                  <Sparkles size={16} className="text-sage-green" />
                  <span className="text-crystal-white">Premium wisdom cards & priority sage.</span>
                </li>
              </ul>

              <Link href="/pricing" className="btn-primary w-full">
                See the path · from $4.97/mo
              </Link>
              <button onClick={onClose} className="text-xs text-sage-green/70 mt-4 hover:text-sage-green transition">
                Return tomorrow, you may
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
