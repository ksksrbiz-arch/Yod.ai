'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Mic, Image as ImageIcon, Video, 
  Search, Eye, FileAudio, Settings, LogIn, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { loginWithGoogle, logout } from '@/lib/firebase';

const ChatHolocron = dynamic(() => import('@/components/ChatHolocron'), {
  loading: () => <div className="h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-emerald-500/50 animate-pulse">Initializing Chat Matrix...</div>
});
const VisionHolocron = dynamic(() => import('@/components/VisionHolocron'), {
  loading: () => <div className="h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-emerald-500/50 animate-pulse">Focusing Visions...</div>
});
const AudioHolocron = dynamic(() => import('@/components/AudioHolocron'), {
  loading: () => <div className="h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-emerald-500/50 animate-pulse">Attuning Frequencies...</div>
});
const LiveCommunionHolocron = dynamic(() => import('@/components/LiveCommunionHolocron'), { ssr: false,
  loading: () => <div className="h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-emerald-500/50 animate-pulse">Awakening Master Yoda...</div>
});

type Tab = 'chat' | 'voice' | 'vision' | 'audio';

export default function JediTerminal() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { user, loading } = useAuth();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Council Wisdom (Chat)', icon: <MessageSquare size={20} /> },
    { id: 'voice', label: 'Live Communion (Voice)', icon: <Mic size={20} /> },
    { id: 'vision', label: 'Force Visions (VFX)', icon: <ImageIcon size={20} /> },
    { id: 'audio', label: 'Echoes (Transcribe)', icon: <FileAudio size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-shadow-black text-crystal-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-64 glass border-r-0 flex flex-col pt-6 pb-4 hidden md:flex z-20 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="px-6 mb-10 pb-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-force-green shadow-[0_0_10px_#7FB069]"></div>
          <h1 className="text-[14px] font-headers tracking-widest font-semibold text-crystal-white">Yod.ai</h1>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all duration-300 text-xs tracking-wider font-medium rounded-xl",
                activeTab === tab.id 
                  ? "bg-force-green/20 text-force-green border border-force-green/30 glow-force" 
                  : "text-sage-green hover:text-crystal-white hover:bg-deep-forest border border-transparent"
              )}
            >
              <div className={cn("transition-colors duration-300", activeTab === tab.id ? "text-force-green" : "text-sage-green")}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="px-6 mt-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-deep-forest to-transparent mb-4"></div>
          {loading ? (
             <p className="text-xs text-sage-green/60 tracking-wider font-medium">Checking resonance...</p>
          ) : user ? (
             <div className="flex flex-col gap-2">
                 <p className="text-xs text-force-green tracking-wider font-medium flex items-center gap-2 select-none"><span className="w-1.5 h-1.5 rounded-full bg-force-green animate-pulse"></span> {user.displayName}</p>
                 <button onClick={logout} className="text-xs text-sage-green hover:text-crystal-white transition-colors flex items-center gap-2 mt-1 py-2">
                    <LogOut size={14} /> Sever Link
                 </button>
             </div>
          ) : (
             <button onClick={loginWithGoogle} className="w-full py-3 rounded-xl text-xs font-medium tracking-wider text-crystal-white bg-deep-forest/50 border border-force-green/20 hover:bg-force-green/20 hover:text-force-green transition-all flex items-center justify-center gap-2">
                <LogIn size={14} /> Link Identity
             </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-shadow-black">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-force-green/10 to-transparent"></div>
        </div>
        <div className="h-full p-0 flex flex-col relative z-10 w-full mx-auto">
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
      
      {/* Mobile Navbar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 glass flex justify-around p-2 z-50 rounded-2xl shadow-2xl border-force-green/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "p-3 rounded-xl flex items-center justify-center transition-all",
              activeTab === tab.id ? "bg-force-green/20 text-force-green glow-force border border-force-green/30" : "text-sage-green hover:text-crystal-white"
            )}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
