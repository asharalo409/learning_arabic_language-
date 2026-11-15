import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, GitBranch, X } from 'lucide-react';
import { matchNahwTipForToken, NahwQuickTip } from '../data/nahwQuickTips';
import { AudioButton } from './AudioButton';
import { computePortalPopoverCoords, FloatingAnchor, FloatingWordPortal } from './FloatingWordPortal';
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
    anchor: FloatingAnchor;
  } | null>(null);
  const [activeTarkibSentence, setActiveTarkibSentence] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const segments = useMemo(() => splitMixedSegments(text), [text]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    const onDocClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelected(null);
      }
    };
    const onScroll = () => setSelected(null);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onDocClick);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [selected]);

  return (
    <div className="space-y-2.5" data-nahw-managed="true">
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
                        const rect = e.currentTarget.getBoundingClientRect();
                        setSelected({
                          word: cleanWord,
                          sentence: seg.value,
                          tip,
                          anchor: computePortalPopoverCoords(rect),
                        });
                      }
                    }}
                    className={`inline font-arabic-ui px-0.5 rounded transition-colors cursor-pointer focus:outline-none ${
                      isSelected
                        ? 'bg-[var(--accent)]/18 text-[var(--accent)] underline decoration-2 underline-offset-4'
                        : 'hover:bg-[var(--emerald-highlight)]'
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

      {/* Portal-Rendered Absolute Floating Container (never disrupts AI Tutor / Grid layout) */}
      {selected && (
        <FloatingWordPortal
          anchor={selected.anchor}
          popoverRef={popoverRef}
          dataAttrs={{ 'data-nahw-managed': 'true', 'data-global-grammar-ignore': 'true' }}
          onContainerClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[var(--border-subtle)]">
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-arabic text-xl font-bold text-[var(--accent)]" dir="rtl">
                  {selected.word}
                </span>
                <span className="text-[11px] font-bold text-[var(--accent)]">
                  · {selected.tip.categoryBn}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                {selected.tip.titleBn}
                {selected.tip.meaningBn ? (
                  <span className="font-normal text-[var(--text-secondary)]"> — {selected.tip.meaningBn}</span>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <AudioButton text={selected.word} compact showSlow={false} />
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                aria-label="বন্ধ করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {selected.tip.tarkibRoleBn && (
            <div className="text-[11px] space-y-0.5">
              <div className="font-extrabold text-[var(--accent)]">{selected.tip.tarkibRoleBn}</div>
              {selected.tip.tarkibReasonBn && (
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  {selected.tip.tarkibReasonBn}
                </p>
              )}
            </div>
          )}

          <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-1 text-[11px] leading-snug">
            <p className="text-[var(--text-primary)]">
              <strong className="text-[var(--accent)]">কায়দা: </strong>
              {selected.tip.ruleBn}
            </p>
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--accent)]">ই‘রাব: </strong>
              {selected.tip.irabEffectBn}
            </p>
          </div>

          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] min-w-0 truncate">
              <BookOpen className="w-3 h-3 text-[var(--accent)] shrink-0" />
              <span className="truncate">{selected.tip.exampleBn}</span>
            </div>
            {selected.sentence.trim().split(/\s+/).length >= 2 && (
              <button
                type="button"
                onClick={() => {
                  const s = selected.sentence;
                  setSelected(null);
                  setActiveTarkibSentence((prev) => (prev === s ? null : s));
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold btn-primary shrink-0"
              >
                <GitBranch className="w-3 h-3" />
                <span>তারকিব</span>
              </button>
            )}
          </div>
        </FloatingWordPortal>
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
