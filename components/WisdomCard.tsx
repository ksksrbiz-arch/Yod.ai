'use client';
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WisdomCardProps {
  quote: string;
}

export default function WisdomCard({ quote }: WisdomCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareCard = async () => {
    setIsSharing(true);
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1A1A1A', // shadow-black
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'yoda-wisdom.png', { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Wisdom from Yod.ai',
              text: `"${quote}" - Master Yoda`,
              files: [file]
            });
            setShared(true);
            URL.revokeObjectURL(url);
          } catch (e) {
            // User cancelled or share failed, fallback to download
            downloadFallback(url);
          }
        } else {
          // Fallback to direct download
          downloadFallback(url);
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (e) {
      console.error(e);
      setIsSharing(false);
    }
  };

  const downloadFallback = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yoda-wisdom.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShared(true);
  };

  return (
    <div className="mt-4 mb-2 flex flex-col items-start w-full">
      {/* Container to capture */}
      <div 
        ref={cardRef}
        className="bg-shadow-black rounded-2xl p-6 md:p-8 border border-force-green/30 w-full max-w-md shadow-2xl relative overflow-hidden"
        style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(47,79,47,0.4), transparent)' }}
      >
        {/* Subtle texture/glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-force-green to-transparent opacity-50" />
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-force-green/10 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <blockquote className="text-crystal-white text-lg md:text-xl font-headers italic leading-relaxed mb-6">
            "{quote}"
          </blockquote>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-force-green/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-force-green/20 flex items-center justify-center border border-force-green/30">
                <span className="text-force-green text-xs font-headers font-bold">Y</span>
              </div>
              <div className="flex flex-col">
                <span className="text-force-green text-sm font-medium leading-none mb-1">Master Yoda</span>
                <span className="text-sage-green text-[10px] uppercase tracking-widest font-mono leading-none">Force Communion</span>
              </div>
            </div>
            <div className="text-sage-green/60 text-xs font-headers tracking-widest font-bold">
              Yod.ai
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Action */}
      <button 
        onClick={shareCard}
        disabled={isSharing || shared}
        className={cn(
          "mt-4 px-6 py-2.5 rounded-xl text-xs uppercase font-bold tracking-widest transition-all shadow-lg flex items-center gap-2 font-sans",
          shared ? "bg-force-green/20 text-force-green border border-force-green/30" : "bg-force-green text-shadow-black hover:bg-sage-green hover:shadow-[0_0_15px_rgba(127,176,105,0.4)]"
        )}
      >
        {isSharing ? <><Loader2 size={14} className="animate-spin"/> Manifesting...</> : shared ? <><Check size={14}/> Wisdom Shared</> : <><Share2 size={14}/> Share Wisdom Card</>}
      </button>
    </div>
  );
}
