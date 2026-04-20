'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Mic, Image as ImageIcon, FileAudio,
  LogIn, LogOut, ArrowLeft, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { loginWithGoogle, logout } from '@/lib/firebase';
import Starfield from '@/components/Starfield';
import QuotaBadge from '@/components/QuotaBadge';

const ChatHolocron = dynamic(() => import('@/components/ChatHolocron'), {
  loading: () => <LoadingState label="Initializing chat matrix" />,
});
const VisionHolocron = dynamic(() => import('@/components/VisionHolocron'), {
  loading: () => <LoadingState label="Focusing visions" />,
});
const AudioHolocron = dynamic(() => import('@/components/AudioHolocron'), {
  loading: () => <LoadingState label="Attuning frequencies" />,
});
const LiveCommunionHolocron = dynamic(() => import('@/components/LiveCommunionHolocron'), {
  ssr: false,
  loading: () => <LoadingState label="Awakening Master Yoda" />,
});

function LoadingState({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-sage-green/60 animate-pulse">
      {label}…
    </div>
  );
}

type Tab = 'chat' | 'voice' | 'vision' | 'audio';

export default function ChatWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { user, loading } = useAuth();

  const tabs: { id: Tab; label: string; short: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Council Wisdom', short: 'Chat', icon: <MessageSquare size={18} /> },
    { id: 'voice', label: 'Live Communion', short: 'Voice', icon: <Mic size={18} /> },
    { id: 'vision', label: 'Force Visions', short: 'Vision', icon: <ImageIcon size={18} /> },
    { id: 'audio', label: 'Echoes', short: 'Echoes', icon: <FileAudio size={18} /> },
  ];

  return (
    <div className="relative flex h-screen bg-void-black text-crystal-white font-sans overflow-hidden">
      <Starfield density={40} />

      {/* Sidebar */}
      <nav className="hidden md:flex w-72 glass-strong border-r border-white/5 flex-col pt-6 pb-4 z-20 relative">
        <div className="px-6 mb-8 pb-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-green shadow-[0_0_10px_#7FB069] group-hover:scale-125 transition" />
            <span className="font-headers font-semibold tracking-wide text-crystal-white text-sm">Yoda.ai</span>
          </Link>
          <Link href="/" className="text-sage-green/60 hover:text-sage-green transition" aria-label="Home">
            <ArrowLeft size={14} />
          </Link>
        </div>

        <div className="px-3 mb-4">
          <QuotaBadge />
        </div>

        <div className="flex-1 flex flex-col gap-1.5 px-3">
          <p className="eyebrow px-3 mb-3">Modes</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-all duration-200 text-sm rounded-xl border',
                activeTab === tab.id
                  ? 'bg-sage-green/12 text-crystal-white border-sage-green/30 glow-force'
                  : 'text-sage-green/80 hover:text-crystal-white hover:bg-white/3 border-transparent'
              )}
            >
              <span className={cn('transition-colors', activeTab === tab.id ? 'text-sage-green' : 'text-sage-green/60')}>
                {tab.icon}
              </span>
              <span className="tracking-wide">{tab.label}</span>
            </button>
          ))}

          <Link
            href="/dashboard"
            className="mt-2 flex items-center gap-3 px-4 py-3 text-sm rounded-xl border border-transparent text-sage-green/80 hover:text-crystal-white hover:bg-white/3 transition"
          >
            <BarChart3 size={18} className="text-sage-green/60" />
            <span className="tracking-wide">Your Dashboard</span>
          </Link>
        </div>

        <div className="px-4 mt-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          {loading ? (
            <p className="text-xs text-sage-green/60 tracking-wider px-2">Checking resonance…</p>
          ) : user ? (
            <div className="surface p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sage-green/15 border border-sage-green/30 flex items-center justify-center font-headers font-bold text-sage-green">
                {(user.displayName || 'J')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-crystal-white truncate">{user.displayName}</div>
                <button
                  onClick={logout}
                  className="text-[10px] text-sage-green/70 hover:text-sage-green transition flex items-center gap-1 mt-0.5"
                >
                  <LogOut size={10} /> Sever link
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full py-3 rounded-xl text-xs font-medium tracking-wider text-crystal-white bg-white/5 border border-white/10 hover:bg-sage-green/15 hover:border-sage-green/40 transition flex items-center justify-center gap-2"
            >
              <LogIn size={14} /> Link Identity
            </button>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-[280px] bg-gradient-to-b from-sage-green/8 to-transparent" />
        </div>
        <div className="h-full flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                <ChatHolocron />
              </motion.div>
            )}
            {activeTab === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                <LiveCommunionHolocron />
              </motion.div>
            )}
            {activeTab === 'vision' && (
              <motion.div key="vision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                <VisionHolocron />
              </motion.div>
            )}
            {activeTab === 'audio' && (
              <motion.div key="audio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                <AudioHolocron />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 glass-strong flex justify-around p-1.5 z-50 rounded-2xl shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition',
              activeTab === tab.id
                ? 'bg-sage-green/15 text-sage-green'
                : 'text-sage-green/60 hover:text-crystal-white'
            )}
            aria-label={tab.label}
          >
            {tab.icon}
            <span className="text-[9px] font-mono uppercase tracking-widest">{tab.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
