import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, GitBranch, Link2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  analyzeSentenceTarkib,
  matchNahwTipForToken,
  NahwQuickTip,
  SentenceTarkibWord,
} from '../data/nahwQuickTips';
import { formatGrammarTerm, localizeGrammarLabel } from '../utils/grammarTerminology';
import { AudioButton } from './AudioButton';
import { computePortalPopoverCoords, FloatingAnchor, FloatingWordPortal } from './FloatingWordPortal';
import { TarkibVisualizer } from './TarkibVisualizer';

interface QuickNahwTextProps {
  text: string;
  enabled?: boolean;
  className?: string;
  showSentenceTarkibButton?: boolean;
}

interface ParsedToken {
  raw: string;
  isSpace: boolean;
  wordPos: number;
  tip: NahwQuickTip | null;
}

// Positioning delegated to computePortalPopoverCoords inside FloatingWordPortal

export const QuickNahwText: React.FC<QuickNahwTextProps> = ({
  text,
  enabled = true,
  className = '',
  showSentenceTarkibButton = true,
}) => {
  const { grammarTerminologyMode } = useApp();
  const isArabicMode = grammarTerminologyMode === 'arabic';

  const [selected, setSelected] = useState<{
    idx: number;
    wordPos: number;
    word: string;
    tip: NahwQuickTip;
    anchor: FloatingAnchor;
  } | null>(null);
  const [showFullTarkib, setShowFullTarkib] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const tarkibResult = useMemo(
    () => (enabled && text ? analyzeSentenceTarkib(text) : null),
    [enabled, text]
  );

  const { tokens, arabicWordCount } = useMemo<{ tokens: ParsedToken[]; arabicWordCount: number }>(() => {
    if (!text) return { tokens: [], arabicWordCount: 0 };
    const parts = text.split(/(\s+)/);
    const nonSpaceIndices: number[] = [];
    parts.forEach((p, idx) => {
      if (p && !/^\s+$/.test(p)) nonSpaceIndices.push(idx);
    });

    const parsed = parts.map((part, idx) => {
      if (!part || /^\s+$/.test(part)) {
        return { raw: part, isSpace: true, wordPos: -1, tip: null };
      }
      const posInWords = nonSpaceIndices.indexOf(idx);
      const prevWord = posInWords > 0 ? parts[nonSpaceIndices[posInWords - 1]] : undefined;
      const nextWord =
        posInWords >= 0 && posInWords < nonSpaceIndices.length - 1
          ? parts[nonSpaceIndices[posInWords + 1]]
          : undefined;

      const tip = enabled ? matchNahwTipForToken(part, prevWord, nextWord, text, posInWords) : null;
      return { raw: part, isSpace: false, wordPos: posInWords, tip };
    });

    const count = nonSpaceIndices.filter((i) => /[\u0621-\u064A]/.test(parts[i])).length;
    return { tokens: parsed, arabicWordCount: count };
  }, [text, enabled]);

  const activeTarkibWord: SentenceTarkibWord | undefined =
    selected && tarkibResult && selected.wordPos >= 0
      ? tarkibResult.words[selected.wordPos]
      : undefined;

  const linkedWordPositions = useMemo(
    () => new Set(activeTarkibWord?.linkedIndices || []),
    [activeTarkibWord]
  );

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

  const cleanSelectedWord = selected
    ? selected.word.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '')
    : '';

  const activeRoleLabel = activeTarkibWord
    ? isArabicMode
      ? activeTarkibWord.tarkibRoleAr
      : activeTarkibWord.tarkibRoleBn
    : selected?.tip.tarkibRoleBn
    ? localizeGrammarLabel(selected.tip.tarkibRoleBn, grammarTerminologyMode)
    : '';

  const activeRoleSecondary = activeTarkibWord
    ? isArabicMode
      ? activeTarkibWord.tarkibRoleBn
      : activeTarkibWord.tarkibRoleAr
    : '';

  const activePosMeta = activeTarkibWord ? formatGrammarTerm(activeTarkibWord.roleKey, grammarTerminologyMode) : null;

  return (
    <div className="space-y-2.5" data-nahw-managed="true">
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
            const isLinkedPartner = !isActive && tok.wordPos >= 0 && linkedWordPositions.has(tok.wordPos);
            const wordObj = tarkibResult?.words[tok.wordPos];
            const hoverTitle = wordObj
              ? isArabicMode
                ? `${wordObj.tarkibRoleAr} (${wordObj.tarkibRoleBn})`
                : `${wordObj.tarkibRoleBn} (${wordObj.tarkibRoleAr})`
              : tok.tip.titleBn;

            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    setSelected(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setSelected({
                      idx,
                      wordPos: tok.wordPos,
                      word: tok.raw,
                      tip: tok.tip!,
                      anchor: computePortalPopoverCoords(rect),
                    });
                  }
                }}
                title={hoverTitle}
                className={`inline rounded px-0.5 transition-colors cursor-pointer focus:outline-none ${
                  isActive
                    ? 'bg-[var(--accent)]/18 text-[var(--accent)] underline decoration-2 underline-offset-4'
                    : isLinkedPartner
                    ? 'bg-amber-500/18 text-amber-800 dark:text-amber-200 underline decoration-dotted underline-offset-4'
                    : 'hover:bg-[var(--emerald-highlight)]'
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
              <span>
                {showFullTarkib
                  ? 'তারকিব ট্রি লুকান'
                  : isArabicMode
                  ? 'شَجَرَةُ التَّرْكِيبِ'
                  : 'বাক্যের তারকিব ট্রি'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Portal-Rendered Absolute Floating Popover (never disrupts parent grid) */}
      {enabled && selected && (
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
                  {cleanSelectedWord}
                </span>
                {activeTarkibWord && (
                  <span
                    title={activePosMeta?.tooltipBn || activeRoleSecondary}
                    className={`text-[11px] font-bold text-[var(--accent)] ${
                      isArabicMode ? 'font-arabic text-xs' : ''
                    }`}
                  >
                    · {isArabicMode ? activeTarkibWord.posShortAr : activeTarkibWord.posShortBn}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                {localizeGrammarLabel(selected.tip.titleBn, grammarTerminologyMode)}
                {selected.tip.meaningBn ? (
                  <span className="font-normal text-[var(--text-secondary)]"> — {selected.tip.meaningBn}</span>
                ) : null}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <AudioButton text={cleanSelectedWord} compact showSlow={false} />
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

          {activeRoleLabel && (
            <div className="space-y-0.5 text-[11px]" title={activeRoleSecondary}>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className={`font-extrabold text-[var(--accent)] ${isArabicMode ? 'font-arabic text-xs' : ''}`}>
                  {activeRoleLabel}
                </span>
                {activeRoleSecondary && (
                  <span className="text-[10px] text-[var(--text-muted)]">{activeRoleSecondary}</span>
                )}
              </div>
              {activeTarkibWord?.relationshipLabelAr && linkedWordPositions.size > 0 && tarkibResult && (
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                  <Link2 className="w-3 h-3 shrink-0" />
                  <span className={isArabicMode ? 'font-arabic text-[11px]' : ''}>
                    {isArabicMode
                      ? activeTarkibWord.relationshipLabelAr
                      : activeTarkibWord.relationshipLabelBn}
                    :
                  </span>
                  {activeTarkibWord.linkedIndices.map((li) => {
                    const p = tarkibResult.words[li];
                    return p ? (
                      <span key={li} className="font-arabic font-bold underline decoration-dotted" dir="rtl">
                        {p.clean}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-1 text-[11px] leading-snug">
            <p className="text-[var(--text-primary)]">
              <strong className="text-[var(--accent)]">কায়দা: </strong>
              {localizeGrammarLabel(selected.tip.ruleBn, grammarTerminologyMode)}
            </p>
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--accent)]">ই‘রাব: </strong>
              {localizeGrammarLabel(selected.tip.irabEffectBn, grammarTerminologyMode)}
            </p>
          </div>

          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] min-w-0 truncate">
              <BookOpen className="w-3 h-3 text-[var(--accent)] shrink-0" />
              <span className="truncate">{selected.tip.exampleBn}</span>
            </div>
            {arabicWordCount >= 2 && (
              <button
                type="button"
                onClick={() => {
                  setShowFullTarkib(true);
                  setSelected(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold btn-primary shrink-0"
              >
                <GitBranch className="w-3 h-3" />
                <span>তারকিব ট্রি</span>
              </button>
            )}
          </div>
        </FloatingWordPortal>
      )}

      {/* Expandable Full Sentence Tarkib Tree Visualizer */}
      {enabled && showFullTarkib && arabicWordCount >= 2 && (
        <TarkibVisualizer
          sentenceAr={text}
          initialSelectedIndex={Math.max(0, selected?.wordPos ?? 0)}
          onClose={() => setShowFullTarkib(false)}
        />
      )}
    </div>
  );
};
