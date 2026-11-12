import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { playSound } from '../utils/soundEffects';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [pct, setPct] = useState(12);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 1650;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, Math.round(12 + (elapsed / duration) * 88));
      setPct(next);
      if (elapsed < duration) {
        raf = window.requestAnimationFrame(tick);
      } else {
        setFading(true);
        window.setTimeout(onComplete, 320);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [onComplete]);

  const handleSkip = () => {
    playSound('loading');
    setFading(true);
    window.setTimeout(onComplete, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-opacity duration-300 no-print ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'var(--bg-canvas-gradient, var(--bg-canvas))',
      }}
    >
      <div className="max-w-md w-full space-y-6 surface-card rounded-3xl p-8 border border-[var(--border-strong)] shadow-2xl">
        {/* Glowing Sacred Star Emblem */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-[var(--emerald-highlight)] border border-[var(--border-strong)] flex items-center justify-center animate-float-slow">
          <svg
            width="44"
            height="44"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="26" height="26" rx="7" stroke="var(--accent)" strokeWidth="1.8" />
            <path d="M16 6L25 16L16 26L7 16L16 6Z" stroke="var(--accent)" strokeWidth="1.6" />
            <circle cx="16" cy="16" r="3.5" fill="var(--accent)" />
          </svg>
        </div>

        <div className="space-y-2">
          <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            AI Arabic Academy
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            আধুনিক ও কুরআনিক আরবি শিক্ষার উজ্জ্বল একাডেমি
          </p>
        </div>

        {/* Founder Credit */}
        <div className="surface-alt rounded-2xl p-4 space-y-1 border border-[var(--border-subtle)]">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>প্রতিষ্ঠাতা ও উদ্যোক্তা</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)]">তাসীন বিল্লাহ</div>
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            আল কুরআন এণ্ড ইসলামিক স্টাডিজ বিভাগ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়
          </div>
        </div>

        {/* Loading Progress */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-100 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono-num">
            <span>লোড হচ্ছে... (ট্যাপ করে এগিয়ে যান)</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
