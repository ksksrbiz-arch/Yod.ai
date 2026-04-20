'use client';

import React, { useState } from 'react';
import { Mic, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function AudioHolocron() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="flex flex-col h-full bg-deep-forest/20 backdrop-blur border border-force-green/20 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-10 relative">
      <div className="max-w-3xl mx-auto w-full grid md:grid-cols-2 gap-12 h-full items-center pl-0 md:pl-10">
         <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-force-green/10 text-force-green rounded-full border border-force-green/30 text-[10px] uppercase tracking-widest font-bold mb-8 shadow-sm">
                <FileAudio size={14} className="text-force-green"/>
                Echo Chamber
            </div>
            <h2 className="text-4xl font-headers text-crystal-white mb-4 leading-tight block font-medium">
              Translate the <br/><span className="text-force-green italic">spoken echoes</span>.
            </h2>
            <p className="text-sage-green text-base font-sans leading-relaxed mb-10 max-w-sm">
               Through the master&apos;s understanding, the chaotic sounds of the galaxy become clear text. Record your echoes to transcribe them.
            </p>
            
            <button 
                onClick={() => setRecording(!recording)}
                className={cn(
                    "group relative overflow-hidden flex items-center gap-4 px-8 py-3 rounded-xl text-xs uppercase font-bold tracking-widest transition-all glow-force shadow-md",
                    recording ? "bg-danger-red/10 text-danger-red border border-danger-red/30" : "bg-force-green text-shadow-black hover:bg-sage-green hover:shadow-[0_0_20px_rgba(168,213,186,0.4)] border border-force-green/30"
                )}
            >
                <div className={cn("absolute inset-0 bg-sage-green/20 translate-y-full group-hover:translate-y-0 transition-transform", recording && "hidden")} />
                <div className={cn("w-2 h-2 rounded-full relative z-10", recording ? "bg-danger-red animate-pulse" : "bg-shadow-black")} />
                <span className="relative z-10">{recording ? 'Stop Recording' : 'Speak, you shall'}</span>
            </button>
         </div>

         <div className="bg-shadow-black/60 backdrop-blur border border-force-green/20 rounded-2xl h-[400px] flex flex-col p-6 relative overflow-hidden shadow-inner">
            {recording ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="flex items-center gap-2">
                        {[50, 80, 40, 100, 60, 90, 30].map((h, i) => (
                           <div key={i} className="w-1.5 bg-force-green rounded-full animate-bounce" style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                    <p className="text-force-green text-[10px] font-mono uppercase font-bold tracking-widest animate-pulse">Listening to the echoes...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                   <div className="w-16 h-16 rounded-full border border-force-green/30 flex items-center justify-center glow-force bg-force-green/5">
                       <Mic size={24} className="text-sage-green/60" />
                   </div>
                   <p className="text-sage-green/80 text-[10px] font-mono font-bold tracking-widest uppercase">Awaiting Input</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
