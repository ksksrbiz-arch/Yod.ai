'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Mic, Image as ImageIcon, Video, 
  Search, Eye, FileAudio, Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatHolocron from '@/components/ChatHolocron';
import VisionHolocron from '@/components/VisionHolocron';
import AudioHolocron from '@/components/AudioHolocron';
import LiveCommunionHolocron from '@/components/LiveCommunionHolocron';

type Tab = 'chat' | 'voice' | 'vision' | 'audio';

export default function JediTerminal() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Council Wisdom (Chat)', icon: <MessageSquare size={20} /> },
    { id: 'voice', label: 'Live Communion (Voice)', icon: <Mic size={20} /> },
    { id: 'vision', label: 'Force Visions (VFX)', icon: <ImageIcon size={20} /> },
    { id: 'audio', label: 'Echoes (Transcribe)', icon: <FileAudio size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#050608] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-64 glass border-r-0 flex flex-col pt-6 pb-4 hidden md:flex z-20 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="px-6 mb-10 pb-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
          <h1 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-500">Jedi Holocron</h1>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all duration-300 text-[10px] tracking-widest uppercase font-bold rounded-full",
                activeTab === tab.id 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald" 
                  : "text-slate-500 hover:text-emerald-400 hover:bg-white/5 border border-transparent"
              )}
            >
              <div className={cn("transition-colors duration-300", activeTab === tab.id ? "text-emerald-400" : "text-slate-500")}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="px-6 mt-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-4"></div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-relaxed select-none">
            Connection: Secure<br/>Force-Encrypted
          </p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-[#050608]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent opacity-30"></div>
        </div>
        <div className="h-full p-4 md:p-8 flex flex-col relative z-10 w-full max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full flex flex-col">
                <ChatHolocron />
              </motion.div>
            )}
            {activeTab === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full flex flex-col">
                <LiveCommunionHolocron />
              </motion.div>
            )}
            {activeTab === 'vision' && (
              <motion.div key="vision" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full flex flex-col">
                <VisionHolocron />
              </motion.div>
            )}
            {activeTab === 'audio' && (
              <motion.div key="audio" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full flex flex-col">
                <AudioHolocron />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Mobile Navbar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 glass flex justify-around p-2 z-50 rounded-full shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "p-3 rounded-full flex items-center justify-center transition-all",
              activeTab === tab.id ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald" : "text-slate-500"
            )}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
