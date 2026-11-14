import React, { useMemo, useState } from 'react';
import { BookOpen, GitBranch, Sparkles, X } from 'lucide-react';
import { matchNahwTipForToken, NahwQuickTip } from '../data/nahwQuickTips';
import { AudioButton } from './AudioButton';
import { SentenceTarkibCard } from './SentenceTarkibCard';

interface GeminiRichTextProps {
  text: string;
  className?: string;
}

interface TextSegment {
  type: 'arabic-run' | 'other';
  value: string;
}

function splitMixedSegments(text: string): TextSegment[] {
  if (!text) return [];
  const regex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s،؟.!؛:ـ«»()]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF؟!.]?)/g;
  const result: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: 'other', value: text.slice(lastIndex, match.index) });
    }
    const val = match[0];
    if (/[\u0621-\u064A]{2,}/.test(val)) {
      result.push({ type: 'arabic-run', value: val });
    } else {
      result.push({ type: 'other', value: val });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push({ type: 'other', value: text.slice(lastIndex) });
  }
  return result;
}

export const GeminiRichText: React.FC<GeminiRichTextProps> = ({ text, className = '' }) => {
  const [selected, setSelected] = useState<{
    word: string;
    sentence: string;
    tip: NahwQuickTip;
  } | null>(null);
  const [activeTarkibSentence, setActiveTarkibSentence] = useState<string | null>(null);

  const segments = useMemo(() => splitMixedSegments(text), [text]);

  return (
    <div className="space-y-3" data-nahw-managed="true">
      <div className={className}>
        {segments.map((seg, sIdx) => {
          if (seg.type === 'other') {
            return <React.Fragment key={sIdx}>{seg.value}</React.Fragment>;
          }

          const parts = seg.value.split(/(\s+)/);
          const nonSpaceIndices: number[] = [];
          parts.forEach((p, idx) => {
            if (p && !/^\s+$/.test(p) && /[\u0621-\u064A]/.test(p)) nonSpaceIndices.push(idx);
          });

          return (
            <span key={sIdx} dir="rtl" className="inline">
              {parts.map((part, pIdx) => {
                if (!part || /^\s+$/.test(part) || !/[\u0621-\u064A]/.test(part)) {
                  return <React.Fragment key={pIdx}>{part}</React.Fragment>;
                }
                const posInWords = nonSpaceIndices.indexOf(pIdx);
                const prevWord = posInWords > 0 ? parts[nonSpaceIndices[posInWords - 1]] : undefined;
                const nextWord =
                  posInWords >= 0 && posInWords < nonSpaceIndices.length - 1
                    ? parts[nonSpaceIndices[posInWords + 1]]
                    : undefined;

                const cleanWord = part.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '');
                const isSelected =
                  selected?.word === cleanWord && selected?.sentence === seg.value;

                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSelected) {
                        setSelected(null);
                        return;
                      }
                      const tip = matchNahwTipForToken(part, prevWord, nextWord, seg.value, posInWords);
                      if (tip) {
                        setSelected({ word: cleanWord, sentence: seg.value, tip });
                      }
                    }}
                    className={`inline font-arabic-ui px-0.5 rounded-md border-b border-dotted transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent)]/18 border-[var(--accent)] text-[var(--accent)]'
                        : 'border-[var(--accent)]/55 hover:bg-[var(--emerald-highlight)]'
                    }`}
                    title="শব্দের ব্যাকরণ ও তারকিব দেখুন"
                  >
                    {part}
                  </button>
                );
              })}
            </span>
          );
        })}
      </div>

      {/* Inline Selected Arabic Word Inspector (Grammar + Word Tarkib) */}
      {selected && (
        <div
          dir="ltr"
          className="surface-card border border-[var(--border-strong)] rounded-3xl p-4 sm:p-5 shadow-md space-y-3"
        >
          <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[var(--border-subtle)]">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{selected.tip.categoryBn}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                  {selected.word}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  {selected.tip.titleBn}
                </span>
              </div>
              {selected.tip.meaningBn && (
                <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  অর্থ: {selected.tip.meaningBn}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <AudioButton text={selected.word} compact showSlow={false} />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-full btn-secondary text-[var(--text-muted)]"
                aria-label="বন্ধ করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {selected.tip.tarkibRoleBn && (
            <div className="rounded-2xl bg-[var(--emerald-highlight)] border border-[var(--accent)]/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--accent)]">
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                <span>বাক্যে তারকিব: {selected.tip.tarkibRoleBn}</span>
              </div>
              {selected.tip.tarkibReasonBn && (
                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                  {selected.tip.tarkibReasonBn}
                </p>
              )}
            </div>
          )}

          <div className="text-xs sm:text-sm space-y-1.5 leading-relaxed">
            <p className="text-[var(--text-primary)]">
              <strong className="text-[var(--accent)]">কায়দা: </strong>
              {selected.tip.ruleBn}
            </p>
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--accent)]">ই‘রাব: </strong>
              {selected.tip.irabEffectBn}
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{selected.tip.exampleBn}</span>
            </div>
            {selected.sentence.trim().split(/\s+/).length >= 2 && (
              <button
                type="button"
                onClick={() =>
                  setActiveTarkibSentence((prev) =>
                    prev === selected.sentence ? null : selected.sentence
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold btn-primary"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>
                  {activeTarkibSentence === selected.sentence
                    ? 'পূর্ণ বাক্যের তারকিব লুকান'
                    : 'সম্পূর্ণ বাক্যের তারকিব'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {activeTarkibSentence && (
        <SentenceTarkibCard
          sentenceAr={activeTarkibSentence}
          onClose={() => setActiveTarkibSentence(null)}
        />
      )}
    </div>
  );
};
