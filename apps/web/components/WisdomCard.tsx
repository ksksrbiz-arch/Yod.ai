'use client';
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, Check, Loader2, Link2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { encodeWisdomId } from '@/lib/wisdom';
import { recordShare } from '@/lib/gamification';

interface WisdomCardProps {
  quote: string;
  variant?: 'compact' | 'showcase';
}

type Format = 'square' | 'story' | 'twitter';

const FORMATS: Record<Format, { label: string; w: number; h: number; aspect: string }> = {
  square: { label: 'Square', w: 1080, h: 1080, aspect: 'aspect-square' },
  story: { label: 'Story', w: 1080, h: 1920, aspect: 'aspect-[9/16]' },
  twitter: { label: 'Wide', w: 1200, h: 630, aspect: 'aspect-[1200/630]' },
};

export default function WisdomCard({ quote, variant = 'compact' }: WisdomCardProps) {
  const [format, setFormat] = useState<Format>('square');
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const id = encodeWisdomId(quote);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/wisdom/${id}` : `/wisdom/${id}`;

  const exportImage = async () => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0A0A0A',
      scale: 2,
      logging: false,
      useCORS: true,
    });
    return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  };

  const shareCard = async () => {
    setIsSharing(true);
    try {
      const blob = await exportImage();
      if (!blob) return;
      const file = new File([blob], `yoda-wisdom-${format}.png`, { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const text = `"${quote}" — Master Yoda · ${shareUrl}`;
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });
      if (canShareFiles) {
        try {
          await navigator.share({ title: 'Wisdom from Yoda.ai', text, files: [file], url: shareUrl });
          setShared(true);
          recordShare();
        } catch {
          downloadFallback(url);
        }
      } else {
        downloadFallback(url);
      }
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadFallback = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `yoda-wisdom-${format}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShared(true);
    recordShare();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
      recordShare();
    } catch {
      // ignore
    }
  };

  const dims = FORMATS[format];

  return (
    <div className={cn('w-full flex flex-col items-stretch', variant === 'showcase' ? 'gap-4' : 'gap-3')}>
      {/* Format selector */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="inline-flex p-1 rounded-xl bg-ethereal-gray/40 border border-white/5">
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition',
                format === f ? 'bg-sage-green/20 text-sage-green' : 'text-sage-green/50 hover:text-sage-green'
              )}
            >
              {FORMATS[f].label}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-sage-green/50">
          {dims.w}×{dims.h}
        </span>
      </div>

      {/* Card preview */}
      <div className={cn('relative w-full max-w-md mx-auto', dims.aspect)}>
        <div
          ref={cardRef}
          className="absolute inset-0 rounded-3xl overflow-hidden p-8 flex flex-col justify-between"
          style={{
            background:
              'radial-gradient(ellipse at top right, rgba(127,176,105,0.28), transparent 60%), radial-gradient(ellipse at bottom left, rgba(0,212,255,0.18), transparent 65%), linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)',
            border: '1px solid rgba(127,176,105,0.3)',
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-green to-transparent" />
          {/* Subtle glow */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-sage-green/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-energy-blue/12 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow */}
          <div className="relative flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-wisdom-gold shadow-[0_0_10px_#FFD700]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-sage-green">Wisdom · Yoda.ai</span>
          </div>

          {/* Quote */}
          <blockquote
            className="relative text-crystal-white font-headers italic leading-snug"
            style={{
              fontSize: format === 'twitter' ? '1.6rem' : format === 'story' ? '1.8rem' : '1.5rem',
              letterSpacing: '0.005em',
            }}
          >
            <span className="text-wisdom-gold text-3xl leading-none mr-1">“</span>
            {quote}
            <span className="text-wisdom-gold text-3xl leading-none ml-1">”</span>
          </blockquote>

          {/* Footer */}
          <div className="relative flex items-center justify-between pt-4 border-t border-sage-green/15">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(127,176,105,0.25), rgba(0,212,255,0.15))', border: '1px solid rgba(127,176,105,0.4)' }}>
                <span className="text-sage-green font-headers font-bold text-sm">Y</span>
              </div>
              <div className="flex flex-col">
                <span className="text-crystal-white text-sm font-medium leading-tight">Master Yoda</span>
                <span className="text-sage-green/70 text-[10px] uppercase tracking-[0.25em] font-mono">via Yoda.ai</span>
              </div>
            </div>
            <span className="text-sage-green/60 text-[10px] uppercase tracking-[0.3em] font-mono">
              yoda.ai/wisdom
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <button
          onClick={shareCard}
          disabled={isSharing || shared}
          className={cn(
            'px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-widest transition flex items-center gap-2',
            shared
              ? 'bg-sage-green/15 text-sage-green border border-sage-green/30'
              : 'btn-primary'
          )}
        >
          {isSharing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Manifesting...
            </>
          ) : shared ? (
            <>
              <Check size={14} /> Wisdom Shared
            </>
          ) : (
            <>
              <Share2 size={14} /> Share
            </>
          )}
        </button>
        <button onClick={copyLink} className="btn-ghost text-xs uppercase tracking-widest">
          {linkCopied ? <Check size={14} className="text-sage-green" /> : <Link2 size={14} />}
          {linkCopied ? 'Copied' : 'Copy Link'}
        </button>
        <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs uppercase tracking-widest">
          <Sparkles size={14} /> Open
        </a>
      </div>
    </div>
  );
}
