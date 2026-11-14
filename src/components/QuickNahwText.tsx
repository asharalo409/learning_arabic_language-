import React, { useMemo, useState } from 'react';
import { BookOpen, GitBranch, Sparkles, X } from 'lucide-react';
import { matchNahwTipForToken, NahwQuickTip } from '../data/nahwQuickTips';
import { AudioButton } from './AudioButton';
import { SentenceTarkibCard } from './SentenceTarkibCard';

interface QuickNahwTextProps {
  text: string;
  enabled?: boolean;
  className?: string;
  showSentenceTarkibButton?: boolean;
}

interface ParsedToken {
  raw: string;
  isSpace: boolean;
  tip: NahwQuickTip | null;
}

export const QuickNahwText: React.FC<QuickNahwTextProps> = ({
  text,
  enabled = true,
  className = '',
  showSentenceTarkibButton = true,
}) => {
  const [selected, setSelected] = useState<{ idx: number; word: string; tip: NahwQuickTip } | null>(null);
  const [showFullTarkib, setShowFullTarkib] = useState(false);

  const { tokens, arabicWordCount } = useMemo<{ tokens: ParsedToken[]; arabicWordCount: number }>(() => {
    if (!text) return { tokens: [], arabicWordCount: 0 };
    const parts = text.split(/(\s+)/);
    const nonSpaceIndices: number[] = [];
    parts.forEach((p, idx) => {
      if (p && !/^\s+$/.test(p)) nonSpaceIndices.push(idx);
    });

    const parsed = parts.map((part, idx) => {
      if (!part || /^\s+$/.test(part)) {
        return { raw: part, isSpace: true, tip: null };
      }
      const posInWords = nonSpaceIndices.indexOf(idx);
      const prevWord = posInWords > 0 ? parts[nonSpaceIndices[posInWords - 1]] : undefined;
      const nextWord =
        posInWords >= 0 && posInWords < nonSpaceIndices.length - 1
          ? parts[nonSpaceIndices[posInWords + 1]]
          : undefined;

      const tip = enabled ? matchNahwTipForToken(part, prevWord, nextWord, text, posInWords) : null;
      return { raw: part, isSpace: false, tip };
    });

    const count = nonSpaceIndices.filter((i) => /[\u0621-\u064A]/.test(parts[i])).length;
    return { tokens: parsed, arabicWordCount: count };
  }, [text, enabled]);

  const cleanSelectedWord = selected
    ? selected.word.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '')
    : '';

  return (
    <div className="space-y-3" data-nahw-managed="true">
      <div className="space-y-2">
        <p className={className} dir="rtl">
          {tokens.map((tok, idx) => {
            if (tok.isSpace) {
              return <React.Fragment key={idx}>{tok.raw}</React.Fragment>;
            }
            if (!tok.tip) {
              return <span key={idx}>{tok.raw}</span>;
            }
            const isActive = selected?.idx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    setSelected(null);
                  } else {
                    setSelected({ idx, word: tok.raw, tip: tok.tip! });
                  }
                }}
                title={`ব্যাকরণ ও তারকিব: ${tok.tip.titleBn}`}
                className={`inline rounded-md px-0.5 transition-all cursor-pointer border-b-2 border-dotted focus:outline-none ${
                  isActive
                    ? 'bg-[var(--accent)]/18 border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--accent)]/60 hover:bg-[var(--emerald-highlight)] hover:border-[var(--accent)]'
                }`}
              >
                {tok.raw}
              </button>
            );
          })}
        </p>

        {enabled && showSentenceTarkibButton && arabicWordCount >= 2 && (
          <div className="flex justify-end" dir="ltr">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullTarkib((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                showFullTarkib
                  ? 'btn-primary shadow-xs'
                  : 'btn-secondary text-[var(--text-secondary)] hover:text-[var(--accent)]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{showFullTarkib ? 'বাক্যের তারকিব লুকান' : 'সম্পূর্ণ বাক্যের তারকিব'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Gemini-Style Spacious Word Grammar + Word Tarkib Sheet */}
      {enabled && selected && (
        <div
          dir="ltr"
          className="surface-card border border-[var(--border-strong)] rounded-3xl p-5 sm:p-6 shadow-lg text-left space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>ব্যাকরণ ও তারকিব বিশ্লেষণ · {selected.tip.categoryBn}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                  {cleanSelectedWord}
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                  {selected.tip.titleBn}
                </span>
              </div>
              {selected.tip.meaningBn && (
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  অর্থ: {selected.tip.meaningBn}
                </div>
              )}
              {selected.tip.rootOrFormBn && (
                <div className="text-xs sm:text-sm text-[var(--text-muted)] font-arabic-ui">
                  {selected.tip.rootOrFormBn}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <AudioButton text={cleanSelectedWord} compact showSlow={false} />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-full btn-secondary text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dedicated Word Tarkib Role Highlight */}
          {selected.tip.tarkibRoleBn && (
            <div className="rounded-2xl bg-[var(--emerald-highlight)] border border-[var(--accent)]/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--accent)]">
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                <span>এই বাক্যে তারকিব (শব্দটির ভূমিকা): {selected.tip.tarkibRoleBn}</span>
              </div>
              {selected.tip.tarkibReasonBn && (
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {selected.tip.tarkibReasonBn}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm sm:text-[15px] leading-relaxed">
            <p className="text-[var(--text-primary)]">
              <strong className="text-[var(--accent)]">কায়দা ও পরিচয়: </strong>
              {selected.tip.ruleBn}
            </p>
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--accent)]">ই‘রাব ও অবস্থান: </strong>
              {selected.tip.irabEffectBn}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5 flex-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>উদাহরণ:</span>
              </div>
              <p className="font-arabic text-xl text-[var(--accent)]" dir="rtl">
                {selected.tip.exampleAr}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{selected.tip.exampleBn}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {arabicWordCount >= 2 && (
                <button
                  type="button"
                  onClick={() => setShowFullTarkib((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold btn-secondary"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{showFullTarkib ? 'তারকিব লুকান' : 'পূর্ণ বাক্যের তারকিব'}</span>
                </button>
              )}
              <AudioButton text={selected.tip.exampleAr} compact showSlow={false} />
            </div>
          </div>
        </div>
      )}

      {/* Expandable Full Sentence Tarkib Card */}
      {enabled && showFullTarkib && arabicWordCount >= 2 && (
        <SentenceTarkibCard
          sentenceAr={text}
          onClose={() => setShowFullTarkib(false)}
        />
      )}
    </div>
  );
};
