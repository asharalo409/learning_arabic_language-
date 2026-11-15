import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, GitBranch, Link2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeSentenceTarkib, matchNahwTipForToken, NahwQuickTip } from '../data/nahwQuickTips';
import { formatGrammarTerm, localizeGrammarLabel } from '../utils/grammarTerminology';
import { AudioButton } from './AudioButton';
import { computePortalPopoverCoords, FloatingAnchor, FloatingWordPortal } from './FloatingWordPortal';
import { TarkibVisualizer } from './TarkibVisualizer';

interface GlobalInspectedWord {
  word: string;
  sentence: string;
  tokenIndex: number;
  tip: NahwQuickTip;
  anchor: FloatingAnchor;
}

const SKIP_TAGS = new Set([
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'OPTION',
  'BUTTON',
  'A',
  'SCRIPT',
  'STYLE',
  'SVG',
  'PATH',
  'CODE',
  'PRE',
  'LABEL',
  'NOSCRIPT',
]);

function isIgnoredElement(el: Element | null): boolean {
  let cur: Element | null = el;
  while (cur) {
    if (SKIP_TAGS.has(cur.tagName)) return true;
    if (cur.getAttribute('role') === 'button') return true;
    if (cur.getAttribute('contenteditable') === 'true') return true;
    if (cur.getAttribute('data-nahw-managed') === 'true') return true;
    if (cur.getAttribute('data-global-grammar-ignore') === 'true') return true;
    cur = cur.parentElement;
  }
  return false;
}

function getCaretTextAndOffset(
  x: number,
  y: number
): { node: Text; offset: number; rect: DOMRect | null } | null {
  if (typeof document === 'undefined') return null;

  const doc = document as Document & {
    caretPositionFromPoint?: (
      cx: number,
      cy: number
    ) => { offsetNode: Node; offset: number } | null;
  };

  if (typeof doc.caretRangeFromPoint === 'function') {
    const range = doc.caretRangeFromPoint(x, y);
    if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
      const rect = range.getBoundingClientRect();
      return {
        node: range.startContainer as Text,
        offset: range.startOffset,
        rect: rect && (rect.width > 0 || rect.height > 0) ? rect : null,
      };
    }
  } else if (typeof doc.caretPositionFromPoint === 'function') {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE) {
      const r = document.createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.setEnd(pos.offsetNode, Math.min((pos.offsetNode.textContent || '').length, pos.offset + 1));
      const rect = r.getBoundingClientRect();
      return {
        node: pos.offsetNode as Text,
        offset: pos.offset,
        rect: rect && (rect.width > 0 || rect.height > 0) ? rect : null,
      };
    }
  }
  return null;
}

// Positioning delegated to computePortalPopoverCoords inside FloatingWordPortal

function extractArabicContextFromText(
  fullText: string,
  offset: number
): { word: string; prevWord?: string; nextWord?: string; sentence: string; tokenIndex: number } | null {
  if (!fullText || !/[\u0621-\u064A]/.test(fullText)) return null;

  const tokenRegex = /\S+/g;
  const spans: { raw: string; start: number; end: number; isArabic: boolean }[] = [];
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(fullText)) !== null) {
    spans.push({
      raw: m[0],
      start: m.index,
      end: m.index + m[0].length,
      isArabic: /[\u0621-\u064A]/.test(m[0]),
    });
  }

  if (spans.length === 0) return null;

  let hitIdx = spans.findIndex((s) => offset >= s.start && offset <= s.end && s.isArabic);
  if (hitIdx < 0) {
    let bestDist = Infinity;
    spans.forEach((s, idx) => {
      if (!s.isArabic) return;
      const dist = offset < s.start ? s.start - offset : offset > s.end ? offset - s.end : 0;
      if (dist <= 6 && dist < bestDist) {
        bestDist = dist;
        hitIdx = idx;
      }
    });
  }

  if (hitIdx < 0) return null;

  const arabicRunIndices: number[] = [];
  let left = hitIdx;
  while (left > 0 && spans[left - 1].isArabic) {
    if (/[.!؟\n]/.test(spans[left - 1].raw)) break;
    left--;
  }
  let right = hitIdx;
  while (right < spans.length - 1 && spans[right + 1].isArabic) {
    if (/[.!؟\n]/.test(spans[right].raw)) break;
    right++;
  }
  for (let i = left; i <= right; i++) {
    if (spans[i].isArabic) arabicRunIndices.push(i);
  }

  const posInRun = arabicRunIndices.indexOf(hitIdx);
  const wordRaw = spans[hitIdx].raw;
  const prevRaw = posInRun > 0 ? spans[arabicRunIndices[posInRun - 1]].raw : undefined;
  const nextRaw =
    posInRun >= 0 && posInRun < arabicRunIndices.length - 1
      ? spans[arabicRunIndices[posInRun + 1]].raw
      : undefined;
  const sentence = arabicRunIndices.map((idx) => spans[idx].raw).join(' ');

  return {
    word: wordRaw,
    prevWord: prevRaw,
    nextWord: nextRaw,
    sentence,
    tokenIndex: Math.max(0, posInRun),
  };
}

export const GlobalGrammarMonitor: React.FC = () => {
  const { globalGrammarEnabled, grammarTerminologyMode } = useApp();
  const isArabicMode = grammarTerminologyMode === 'arabic';

  const [inspected, setInspected] = useState<GlobalInspectedWord | null>(null);
  const [showFullTarkib, setShowFullTarkib] = useState(false);
  const rafRef = useRef<number | null>(null);

  const markArabicElements = useCallback(() => {
    if (typeof document === 'undefined') return;
    const root = document.getElementById('root');
    if (!root) return;

    if (!globalGrammarEnabled) {
      root.querySelectorAll('[data-global-arabic="true"]').forEach((el) => {
        el.removeAttribute('data-global-arabic');
      });
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const val = node.nodeValue;
        if (!val || !/[\u0621-\u064A]{2,}/.test(val)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || isIgnoredElement(parent)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const targets = new Set<Element>();
    let cur = walker.nextNode();
    let scanned = 0;
    while (cur && scanned < 600) {
      scanned++;
      const parent = cur.parentElement;
      if (parent && parent.getAttribute('data-global-arabic') !== 'true') {
        targets.add(parent);
      }
      cur = walker.nextNode();
    }

    targets.forEach((el) => {
      el.setAttribute('data-global-arabic', 'true');
      if (!el.getAttribute('title')) {
        el.setAttribute('title', 'যেকোনো আরবি শব্দে চাপলে সেখানেই ব্যাকরণ ও তারকিব দেখাবে');
      }
    });
  }, [globalGrammarEnabled]);

  useEffect(() => {
    markArabicElements();
    if (!globalGrammarEnabled) {
      setInspected(null);
      setShowFullTarkib(false);
      return;
    }

    const root = document.getElementById('root');
    if (!root) return;

    const scheduleScan = () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(() => {
        markArabicElements();
      });
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-global-arabic') continue;
        scheduleScan();
        break;
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [globalGrammarEnabled, markArabicElements]);

  useEffect(() => {
    if (!globalGrammarEnabled) return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const target = e.target as Element | null;

      if (target?.closest('[data-global-inspector="true"]')) return;
      if (target?.closest('[data-global-tarkib-modal="true"]')) return;

      if (!target || isIgnoredElement(target)) {
        setInspected(null);
        return;
      }

      let extracted: ReturnType<typeof extractArabicContextFromText> = null;
      let wordRect: { left: number; top: number; bottom: number; width: number } = {
        left: e.clientX - 20,
        top: e.clientY - 12,
        bottom: e.clientY + 12,
        width: 40,
      };

      const caret = getCaretTextAndOffset(e.clientX, e.clientY);
      if (caret && !isIgnoredElement(caret.node.parentElement)) {
        if (caret.rect) {
          wordRect = {
            left: caret.rect.left,
            top: caret.rect.top,
            bottom: caret.rect.bottom,
            width: Math.max(24, caret.rect.width),
          };
        }
        const blockEl =
          caret.node.parentElement?.closest('p, div, li, td, th, span, h1, h2, h3, h4') ||
          caret.node.parentElement;
        const containerText = blockEl?.textContent || caret.node.nodeValue || '';

        if (caret.node.nodeValue && /[\u0621-\u064A]/.test(caret.node.nodeValue)) {
          extracted = extractArabicContextFromText(caret.node.nodeValue, caret.offset);
          if (
            extracted &&
            containerText.length <= 500 &&
            containerText.includes(extracted.sentence) &&
            containerText.split(/\s+/).filter((w) => /[\u0621-\u064A]/.test(w)).length >
              extracted.sentence.split(/\s+/).length
          ) {
            const fullSentenceCtx = extractArabicContextFromText(
              containerText,
              Math.max(0, containerText.indexOf(extracted.word) + 1)
            );
            if (fullSentenceCtx) extracted = fullSentenceCtx;
          }
        }
      }

      if (!extracted && target.getAttribute('data-global-arabic') === 'true') {
        const text = (target.textContent || '').trim();
        if (text && /[\u0621-\u064A]{2,}/.test(text) && text.length <= 160) {
          extracted = extractArabicContextFromText(text, Math.floor(text.length / 2));
          const r = target.getBoundingClientRect();
          if (r.width > 0) {
            wordRect = { left: r.left, top: r.top, bottom: r.bottom, width: r.width };
          }
        }
      }

      if (!extracted) {
        setInspected(null);
        return;
      }

      const cleanWord = extracted.word.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
      if (!cleanWord || !/[\u0621-\u064A]/.test(cleanWord)) {
        setInspected(null);
        return;
      }

      const tip = matchNahwTipForToken(
        extracted.word,
        extracted.prevWord,
        extracted.nextWord,
        extracted.sentence,
        extracted.tokenIndex
      );
      if (!tip) return;

      setShowFullTarkib(false);
      setInspected({
        word: cleanWord,
        sentence: extracted.sentence,
        tokenIndex: extracted.tokenIndex,
        tip,
        anchor: computePortalPopoverCoords(wordRect),
      });
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspected(null);
        setShowFullTarkib(false);
      }
    };

    const handleScroll = () => {
      if (!showFullTarkib) setInspected(null);
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [globalGrammarEnabled, showFullTarkib]);

  const tarkibInfo = useMemo(() => {
    if (!inspected) return null;
    const analysis = analyzeSentenceTarkib(inspected.sentence);
    const wordObj = analysis.words[inspected.tokenIndex];
    return { analysis, wordObj };
  }, [inspected]);

  if (!globalGrammarEnabled) return null;

  const sentenceWordCount = inspected
    ? inspected.sentence.split(/\s+/).filter((w) => /[\u0621-\u064A]/.test(w)).length
    : 0;

  return (
    <>
      {inspected && (
        <FloatingWordPortal
          anchor={inspected.anchor}
          dataAttrs={{ 'data-global-inspector': 'true', 'data-global-grammar-ignore': 'true' }}
        >
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[var(--border-subtle)]">
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-arabic text-xl font-bold text-[var(--accent)]" dir="rtl">
                  {inspected.word}
                </span>
                {tarkibInfo?.wordObj && (
                  <span
                    title={formatGrammarTerm(tarkibInfo.wordObj.roleKey, grammarTerminologyMode).tooltipBn}
                    className={`text-[11px] font-bold text-[var(--accent)] ${
                      isArabicMode ? 'font-arabic text-xs' : ''
                    }`}
                  >
                    · {isArabicMode ? tarkibInfo.wordObj.posShortAr : tarkibInfo.wordObj.posShortBn}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                {localizeGrammarLabel(inspected.tip.titleBn, grammarTerminologyMode)}
                {inspected.tip.meaningBn ? (
                  <span className="font-normal text-[var(--text-secondary)]"> — {inspected.tip.meaningBn}</span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <AudioButton text={inspected.word} compact showSlow={false} />
              <button
                type="button"
                onClick={() => {
                  setInspected(null);
                  setShowFullTarkib(false);
                }}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                aria-label="বন্ধ করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {(tarkibInfo?.wordObj || inspected.tip.tarkibRoleBn) && (
            <div className="space-y-0.5 text-[11px]">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span
                  className={`font-extrabold text-[var(--accent)] ${
                    isArabicMode ? 'font-arabic text-xs' : ''
                  }`}
                >
                  {tarkibInfo?.wordObj
                    ? isArabicMode
                      ? tarkibInfo.wordObj.tarkibRoleAr
                      : tarkibInfo.wordObj.tarkibRoleBn
                    : localizeGrammarLabel(inspected.tip.tarkibRoleBn || '', grammarTerminologyMode)}
                </span>
                {tarkibInfo?.wordObj && (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {isArabicMode ? tarkibInfo.wordObj.tarkibRoleBn : tarkibInfo.wordObj.tarkibRoleAr}
                  </span>
                )}
              </div>

              {tarkibInfo?.wordObj && tarkibInfo.wordObj.linkedIndices.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                  <Link2 className="w-3 h-3 shrink-0" />
                  <span className={isArabicMode ? 'font-arabic text-[11px]' : ''}>
                    {isArabicMode
                      ? tarkibInfo.wordObj.relationshipLabelAr
                      : tarkibInfo.wordObj.relationshipLabelBn}
                    :
                  </span>
                  {tarkibInfo.wordObj.linkedIndices.map((li) => {
                    const p = tarkibInfo.analysis.words[li];
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
              {localizeGrammarLabel(inspected.tip.ruleBn, grammarTerminologyMode)}
            </p>
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--accent)]">ই‘রাব: </strong>
              {localizeGrammarLabel(inspected.tip.irabEffectBn, grammarTerminologyMode)}
            </p>
          </div>

          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] min-w-0 truncate">
              <BookOpen className="w-3 h-3 text-[var(--accent)] shrink-0" />
              <span className="truncate">{inspected.tip.exampleBn}</span>
            </div>
            {sentenceWordCount >= 2 && (
              <button
                type="button"
                onClick={() => setShowFullTarkib(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold btn-primary shrink-0"
              >
                <GitBranch className="w-3 h-3" />
                <span>তারকিব ট্রি</span>
              </button>
            )}
          </div>
        </FloatingWordPortal>
      )}

      {/* Full Sentence Tree Modal via document.body Portal */}
      {showFullTarkib && inspected && sentenceWordCount >= 2 && typeof document !== 'undefined' &&
        createPortal(
          <div
            data-global-tarkib-modal="true"
            data-global-grammar-ignore="true"
            className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setShowFullTarkib(false)}
          >
            <div
              className="w-full max-w-4xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <TarkibVisualizer
                sentenceAr={inspected.sentence}
                initialSelectedIndex={inspected.tokenIndex}
                onClose={() => setShowFullTarkib(false)}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
