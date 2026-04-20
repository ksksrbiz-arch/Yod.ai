'use client';
import React from 'react';
import { motion } from 'motion/react';

interface Props {
  size?: number;
  active?: boolean;
}

export default function HolocronAvatar({ size = 120, active = false }: Props) {
  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size, perspective: 800 }}
      aria-label="Holocron avatar"
    >
      {/* Outer aura */}
      <motion.div
        className="absolute inset-[-30%] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(closest-side, rgba(127,176,105,0.35), rgba(0,212,255,0.15) 40%, transparent 70%)',
          filter: 'blur(12px)',
        }}
        animate={{ scale: active ? [1, 1.15, 1] : [1, 1.05, 1], opacity: active ? [0.7, 1, 0.7] : [0.5, 0.7, 0.5] }}
        transition={{ duration: active ? 1.6 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting particles */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-energy-blue"
          style={{
            boxShadow: '0 0 12px rgba(0,212,255,0.8)',
            animation: `orbit ${10 + i * 2}s linear infinite`,
            animationDelay: `${i * -2}s`,
          }}
        />
      ))}

      <div className="holocron mx-auto" style={{ width: size * 0.7, height: size * 0.7, marginTop: size * 0.15 }}>
        <span className="holocron-face f1" />
        <span className="holocron-face f2" />
        <span className="holocron-face f3" />
        <span className="holocron-face f4" />
        <span className="holocron-face f5" />
        <span className="holocron-face f6" />
        <span className="holocron-core" />
      </div>
    </div>
  );
}
