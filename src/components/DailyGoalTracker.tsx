import React from 'react';
import { CheckCircle2, Flame, Minus, Plus, Target } from 'lucide-react';
import { InterfaceLang } from '../types/academy';

interface DailyGoalTrackerProps {
  todayMinutesLearned: number;
  dailyTargetMinutes: number;
  streakDays: number;
  lang: InterfaceLang;
  onAdjustTarget: (nextTarget: number) => void;
  onLogMinutes: (minutes: number) => void;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({
  todayMinutesLearned,
  dailyTargetMinutes,
  streakDays,
  lang,
  onAdjustTarget,
  onLogMinutes,
}) => {
  const safeTarget = Math.max(5, dailyTargetMinutes);
  const pct = Math.min(100, Math.round((todayMinutesLearned / safeTarget) * 100));
  const goalReached = todayMinutesLearned >= safeTarget;
  const remainingMinutes = Math.max(0, safeTarget - todayMinutesLearned);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="surface-card rounded-3xl p-5 border border-emerald-500/35 bg-gradient-to-br from-emerald-500/12 via-transparent to-sky-500/5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          {/* SVG Circular Visual Progress Ring */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90" aria-label={`Daily goal ${pct}%`}>
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="var(--bg-surface-alt)"
                strokeWidth="8"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke={goalReached ? '#10b981' : '#0ea5e9'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold font-mono-num text-[var(--text-primary)]">{pct}%</span>
              {goalReached && <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5" />}
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'en' ? 'Daily Goal Tracker' : 'দৈনিক লক্ষ্য ট্র্যাকার'}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[var(--text-primary)]">
                {todayMinutesLearned}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] font-mono-num">
                / {safeTarget} মি.
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>
                {streakDays} {lang === 'en' ? 'day streak active' : 'দিনের স্ট্রিক চলমান'}
              </span>
            </div>
          </div>
        </div>

        {/* Target Stepper Controls */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">লক্ষ্য (মি.)</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAdjustTarget(Math.max(5, safeTarget - 5))}
              className="p-1.5 rounded-lg btn-secondary"
              title="দৈনিক লক্ষ্য ৫ মিনিট কমান"
              aria-label="Decrease daily target"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onAdjustTarget(Math.min(180, safeTarget + 5))}
              className="p-1.5 rounded-lg btn-secondary"
              title="দৈনিক লক্ষ্য ৫ মিনিট বাড়ান"
              aria-label="Increase daily target"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Status + Quick Log Pills */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[var(--text-secondary)] font-medium">
          {goalReached
            ? lang === 'en'
              ? 'Daily target complete! Keep momentum.'
              : 'মাশাআল্লাহ! আজকের দৈনিক লক্ষ্য পূর্ণ হয়েছে'
            : lang === 'en'
            ? `${remainingMinutes}m left to hit today’s goal`
            : `আজকের লক্ষ্য পূরণে আরও ${remainingMinutes} মি. বাকি`}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onLogMinutes(5)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold btn-secondary whitespace-nowrap"
          >
            +৫ মি.
          </button>
          <button
            type="button"
            onClick={() => onLogMinutes(10)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold btn-primary whitespace-nowrap"
          >
            +১০ মি.
          </button>
          <button
            type="button"
            onClick={() => onLogMinutes(15)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold btn-secondary whitespace-nowrap"
          >
            +১৫ মি.
          </button>
        </div>
      </div>
    </div>
  );
};
