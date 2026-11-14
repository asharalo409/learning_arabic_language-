import React, { useMemo } from 'react';
import { GitBranch, Sparkles, X } from 'lucide-react';
import { analyzeSentenceTarkib, SentenceTarkibResult } from '../data/nahwQuickTips';
import { AudioButton } from './AudioButton';

interface SentenceTarkibCardProps {
  sentenceAr: string;
  precomputed?: SentenceTarkibResult;
  onClose?: () => void;
  titleLabel?: string;
}

export const SentenceTarkibCard: React.FC<SentenceTarkibCardProps> = ({
  sentenceAr,
  precomputed,
  onClose,
  titleLabel = 'সম্পূর্ণ বাক্যের তারকিব (Full Sentence Tarkib)',
}) => {
  const result = useMemo(
    () => precomputed || analyzeSentenceTarkib(sentenceAr),
    [precomputed, sentenceAr]
  );

  if (!result.words.length) return null;

  return (
    <div
      dir="ltr"
      data-nahw-managed="true"
      className="rounded-3xl surface-card border border-[var(--border-strong)] p-5 sm:p-6 space-y-5 text-left shadow-md"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
            <GitBranch className="w-4 h-4 shrink-0" />
            <span>{titleLabel}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-arabic text-xl sm:text-2xl text-[var(--accent)]" dir="rtl">
              {result.sentenceTypeAr}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
              {result.sentenceTypeBn}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AudioButton text={result.sentenceAr} compact showSlow={false} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full btn-secondary text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="তারকিব বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Original Full Sentence + Summary Formula */}
      <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-4 space-y-2.5">
        <p className="font-arabic text-2xl sm:text-3xl text-[var(--text-primary)] text-right leading-[2.05]" dir="rtl">
          {result.sentenceAr}
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
          <strong className="text-[var(--accent)]">বাক্য গঠন সূত্র: </strong>
          {result.structureSummaryBn}
        </p>
      </div>

      {/* Grouped Syntactic Phrases (মুরাক্কাব ও বাক্য-অংশ) */}
      {result.phrases.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>মুরাক্কাব ও বাক্যাংশের তারকিব (Phrase Structure)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.phrases.map((ph, idx) => (
              <div
                key={`${ph.arabicChunk}-${idx}`}
                className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[var(--accent)]">{ph.roleBn}</span>
                  <span className="font-arabic text-xl text-[var(--text-primary)]" dir="rtl">
                    {ph.arabicChunk}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {ph.explanationBn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word-by-Word Complete Tarkib Breakdown */}
      <div className="space-y-2">
        <div className="text-xs font-extrabold text-[var(--accent)]">
          প্রতিটি শব্দের তারকিব বিশ্লেষণ ({result.words.length}টি পদ)
        </div>
        <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          {result.words.map((w) => (
            <div
              key={`${w.index}-${w.clean}`}
              className="p-3.5 sm:p-4 bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono-num text-[var(--text-muted)]">
                    #{w.index + 1}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[var(--accent)]">
                    {w.tarkibRoleBn}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    ({w.posShortBn})
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {w.tarkibDetailBn}
                </p>
                {w.meaningBn && (
                  <p className="text-xs text-[var(--text-muted)]">অর্থ: {w.meaningBn}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 shrink-0">
                <span className="font-arabic text-2xl sm:text-3xl text-[var(--text-primary)]" dir="rtl">
                  {w.clean}
                </span>
                <AudioButton text={w.clean} compact showSlow={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
