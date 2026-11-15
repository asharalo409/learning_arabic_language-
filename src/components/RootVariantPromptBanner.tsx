import React from 'react';
import { BookPlus, GitBranch, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RootVariantPromptBanner: React.FC = () => {
  const { rootSuggestions, acceptRootSuggestion, dismissRootSuggestion } = useApp();

  if (!rootSuggestions || rootSuggestions.length === 0) {
    return null;
  }

  const top = rootSuggestions[0];

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[min(370px,calc(100vw-2rem))] rounded-2xl border border-emerald-500/35 bg-[var(--bg-surface)]/95 p-3.5 shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 truncate">
              নতুন মূলধাতু (مَادَّة) শনাক্ত হয়েছে
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              {top.sourceLabelBn}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dismissRootSuggestion(top.id)}
          aria-label="বন্ধ করুন"
          className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap" dir="rtl">
          <span className="font-arabic text-base font-bold text-[var(--text-primary)]">
            {top.encounteredWordAr}
          </span>
          <span className="text-xs text-[var(--text-muted)]">←</span>
          <span className="font-arabic text-base font-bold text-emerald-600 dark:text-emerald-300">
            {top.matchedMasdarAr}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-[var(--text-primary)]">{top.meaningBn}</span>
          <span className="font-arabic text-xs font-bold text-amber-600 dark:text-amber-300" dir="rtl">
            {top.rootLetters}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-[var(--text-muted)]" dir="rtl">
          {top.madiAr} · {top.mudariAr} ({top.babNameAr})
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => dismissRootSuggestion(top.id)}
          className="px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
        >
          এখন নয়
        </button>
        <button
          type="button"
          onClick={() => acceptRootSuggestion(top.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-colors"
        >
          <BookPlus className="w-3.5 h-3.5" />
          পার্সোনাল ডেকে যোগ করুন (+১৫ XP)
        </button>
      </div>
    </div>
  );
};
