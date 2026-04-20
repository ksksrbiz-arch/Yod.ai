'use client';

import React, { useState } from 'react';
import { Mic, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function AudioHolocron() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="flex flex-col h-full glass border border-white/5 rounded-2xl overflow-hidden shadow-xl p-6 md:p-10 relative">
      <div className="max-w-3xl mx-auto w-full grid md:grid-cols-2 gap-12 h-full items-center pl-0 md:pl-10">
         <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 text-[10px] uppercase tracking-widest font-bold mb-8 shadow-sm">
                <FileAudio size={14} className="text-emerald-400"/>
                Echo Chamber
            </div>
            <h2 className="text-4xl font-serif text-slate-100 mb-4 tracking-tight leading-tight block">
              Translate the <br/><span className="text-emerald-400 italic">spoken echoes</span>.
            </h2>
            <p className="text-slate-400 text-base font-light leading-relaxed mb-10 max-w-sm">
               Through the master&apos;s understanding, the chaotic sounds of the galaxy become clear text. Record your echoes to transcribe them.
            </p>
            
            <button 
                onClick={() => setRecording(!recording)}
                className={cn(
                    "group relative overflow-hidden flex items-center gap-4 px-8 py-3 rounded-full text-xs uppercase font-bold tracking-widest transition-all glow-emerald",
                    recording ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                )}
            >
                <div className={cn("absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform", recording && "hidden")} />
                <div className={cn("w-2 h-2 rounded-full relative z-10", recording ? "bg-red-400 animate-pulse" : "bg-emerald-400")} />
                <span className="relative z-10">{recording ? 'Stop Recording' : 'Speak, you shall'}</span>
            </button>
         </div>

         <div className="glass border border-white/5 rounded-2xl h-[400px] flex flex-col p-6 relative overflow-hidden">
            {recording ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="flex items-center gap-2">
                        {[50, 80, 40, 100, 60, 90, 30].map((h, i) => (
                           <div key={i} className="w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                    <p className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest animate-pulse">Listening to the echoes...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                   <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                       <Mic size={24} className="text-slate-600" />
                   </div>
                   <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">Awaiting Input</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
