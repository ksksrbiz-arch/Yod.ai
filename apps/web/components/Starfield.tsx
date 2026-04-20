'use client';
import React, { useMemo } from 'react';

export default function Starfield({ density = 60, className = '' }: { density?: number; className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: density }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.6 + 0.2,
      })),
    [density]
  );
  return (
    <div className={`starfield ${className}`} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
