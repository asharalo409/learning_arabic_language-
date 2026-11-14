import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, GitBranch, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { matchNahwTipForToken, NahwQuickTip } from '../data/nahwQuickTips';
import { AudioButton } from './AudioButton';
import { SentenceTarkibCard } from './SentenceTarkibCard';

interface GlobalInspectedWord {
  word: string;
  sentence: string;
  tip: NahwQuickTip;
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

function getCaretTextAndOffset(x: number, y: number): { node: Text; offset: number } | null {
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
      return { node: range.startContainer as Text, offset: range.startOffset };
    }
  } else if (typeof doc.caretPositionFromPoint === 'function') {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE) {
      return { node: pos.offsetNode as Text, offset: pos.offset };
    }
  }
  return null;
}

function extractArabicContextFromText(
  fullText: string,
  offset: number
): { word: string; prevWord?: string; nextWord?: string; sentence: string; tokenIndex: number } | null {
  if (!fullText || !/[\u0621-\u064A]/.test(fullText)) return null;

  // Tokenize preserving character spans
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

  // Find token near clicked offset (tolerance +/- 3 chars for RTL touch taps)
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

  // Collect contiguous Arabic sentence around hitIdx
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
  const { globalGrammarEnabled } = useApp();
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
        el.setAttribute('title', 'যেকোনো আরবি শব্দে চাপলে ব্যাকরণ ও তারকিব দেখাবে');
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
      if (!target || isIgnoredElement(target)) return;

      // Ignore clicks inside our own inspector modal
      if (target.closest('[data-global-inspector="true"]')) return;

      let extracted: ReturnType<typeof extractArabicContextFromText> = null;

      const caret = getCaretTextAndOffset(e.clientX, e.clientY);
      if (caret && !isIgnoredElement(caret.node.parentElement)) {
        const blockEl =
          caret.node.parentElement?.closest('p, div, li, td, th, span, h1, h2, h3, h4') ||
          caret.node.parentElement;
        const containerText = blockEl?.textContent || caret.node.nodeValue || '';

        // If caret node is inside block text, compute relative offset accurately
        if (caret.node.nodeValue && /[\u0621-\u064A]/.test(caret.node.nodeValue)) {
          extracted = extractArabicContextFromText(caret.node.nodeValue, caret.offset);
          // Upgrade sentence context from surrounding block if container has full multi-word sentence
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

      // Touch-friendly fallback: if user tapped a leaf Arabic element containing 1-3 words
      if (!extracted && target.getAttribute('data-global-arabic') === 'true') {
        const text = (target.textContent || '').trim();
        if (text && /[\u0621-\u064A]{2,}/.test(text) && text.length <= 160) {
          extracted = extractArabicContextFromText(text, Math.floor(text.length / 2));
        }
      }

      if (!extracted) return;

      const cleanWord = extracted.word.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
      if (!cleanWord || !/[\u0621-\u064A]/.test(cleanWord)) return;

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
        tip,
      });
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [globalGrammarEnabled]);

  if (!globalGrammarEnabled || !inspected) return null;

  const sentenceWordCount = inspected.sentence
    .split(/\s+/)
    .filter((w) => /[\u0621-\u064A]/.test(w)).length;

  return (
    <div
      data-global-inspector="true"
      data-global-grammar-ignore="true"
      className="fixed inset-x-3 bottom-20 lg:bottom-6 lg:inset-x-auto lg:right-6 lg:w-[540px] z-50 max-h-[78vh] overflow-y-auto rounded-3xl surface-card border border-[var(--border-strong)] shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-150"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>গ্লোবাল ব্যাকরণ ও তারকিব টুল · {inspected.tip.categoryBn}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
              {inspected.word}
            </span>
            <span className="text-base font-extrabold text-[var(--text-primary)]">
              {inspected.tip.titleBn}
            </span>
          </div>
          {inspected.tip.meaningBn && (
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              অর্থ: {inspected.tip.meaningBn}
            </div>
          )}
          {inspected.tip.rootOrFormBn && (
            <div className="text-xs text-[var(--text-muted)] font-arabic-ui">
              {inspected.tip.rootOrFormBn}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <AudioButton text={inspected.word} compact showSlow={false} />
          <button
            type="button"
            onClick={() => {
              setInspected(null);
              setShowFullTarkib(false);
            }}
            className="p-2 rounded-full btn-secondary text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Word Role in Sentence (Tarkib) */}
      {inspected.tip.tarkibRoleBn && (
        <div className="rounded-2xl bg-[var(--emerald-highlight)] border border-[var(--accent)]/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--accent)]">
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span>বাক্যে তারকিব (পদ ভূমিকা): {inspected.tip.tarkibRoleBn}</span>
          </div>
          {inspected.tip.tarkibReasonBn && (
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {inspected.tip.tarkibReasonBn}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2 text-sm leading-relaxed">
        <p className="text-[var(--text-primary)]">
          <strong className="text-[var(--accent)]">কায়দা ও ছরফ: </strong>
          {inspected.tip.ruleBn}
        </p>
        <p className="text-[var(--text-secondary)]">
          <strong className="text-[var(--accent)]">ই‘রাব ও অবস্থান: </strong>
          {inspected.tip.irabEffectBn}
        </p>
      </div>

      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="truncate">{inspected.tip.exampleBn}</span>
        </div>
        {sentenceWordCount >= 2 && (
          <button
            type="button"
            onClick={() => setShowFullTarkib((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold btn-primary shrink-0"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{showFullTarkib ? 'পূর্ণ তারকিব লুকান' : 'সম্পূর্ণ বাক্যের তারকিব'}</span>
          </button>
        )}
      </div>

      {showFullTarkib && sentenceWordCount >= 2 && (
        <SentenceTarkibCard
          sentenceAr={inspected.sentence}
          onClose={() => setShowFullTarkib(false)}
        />
      )}
    </div>
  );
};
