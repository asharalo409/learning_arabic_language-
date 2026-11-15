import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Search, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_ISM_CATEGORIES } from '../data/ismCategoriesPart2';
import { matchNahwTipForToken, stripDiacriticsAndPunct } from '../data/nahwQuickTips';
import { SAFWATUL_MASADIR_LIST } from '../data/safwatulMasadirData';
import { SIFAT_CATEGORIES } from '../data/sifatBankData';
import { VocabItem } from '../types/academy';
import { normalizeArabicTokenKey } from '../utils/lessonVocabDedupe';
import { AudioButton } from './AudioButton';

export interface LookupResultEntry {
  id: string;
  arabic: string;
  root: string;
  babOrTypeBn: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  exampleAr?: string;
  exampleBn?: string;
  conjugationSummary?: string;
  sourceKind: 'vocab' | 'masdar' | 'ism' | 'sifat' | 'morphology';
}

function buildLookupResults(queryRaw: string, allVocabulary: VocabItem[]): LookupResultEntry[] {
  const trimmed = queryRaw.trim();
  if (!trimmed) return [];

  const qLower = trimmed.toLowerCase();
  const qNormAr = normalizeArabicTokenKey(trimmed);
  const qStripped = stripDiacriticsAndPunct(trimmed);
  const seenKeys = new Set<string>();
  const results: LookupResultEntry[] = [];

  const pushUnique = (entry: LookupResultEntry) => {
    const key = `${normalizeArabicTokenKey(entry.arabic)}-${entry.sourceKind}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    results.push(entry);
  };

  // 1. Curriculum & Personal Vocabulary
  for (const v of allVocabulary) {
    if (results.length >= 16) break;
    const arKey = normalizeArabicTokenKey(v.arabic);
    const rootClean = normalizeArabicTokenKey(v.root || '');
    const hit =
      (qNormAr && (arKey.includes(qNormAr) || rootClean.includes(qNormAr))) ||
      v.arabic.includes(trimmed) ||
      v.meaningBn.toLowerCase().includes(qLower) ||
      v.meaningEn.toLowerCase().includes(qLower) ||
      v.pronunciationBn.toLowerCase().includes(qLower);

    if (hit) {
      pushUnique({
        id: `lk-v-${v.id}`,
        arabic: v.arabic,
        root: v.root || 'শব্দভাণ্ডার',
        babOrTypeBn: v.category || 'পাঠ্যক্রমের শব্দ',
        pronunciationBn: v.pronunciationBn,
        meaningBn: v.meaningBn,
        meaningEn: v.meaningEn,
        exampleAr: v.exampleAr,
        exampleBn: v.exampleBn,
        sourceKind: 'vocab',
      });
    }
  }

  // 2. Safwatul Masadir (Roots, Masdar, Madi, Mudari, Amr, Ism Fa'il/Maful)
  for (const m of SAFWATUL_MASADIR_LIST) {
    if (results.length >= 22) break;
    const formsNorm = [
      m.masdarAr,
      m.madiAr,
      m.mudariAr,
      m.amrAr,
      m.ismFailAr,
      m.ismMafulAr,
      m.rootLetters,
    ]
      .map((s) => normalizeArabicTokenKey(s))
      .join(' ');

    const hit =
      (qNormAr && formsNorm.includes(qNormAr)) ||
      (qStripped && stripDiacriticsAndPunct(`${m.masdarAr} ${m.madiAr} ${m.mudariAr} ${m.rootLetters}`).includes(qStripped)) ||
      m.meaningBn.toLowerCase().includes(qLower) ||
      m.meaningEn.toLowerCase().includes(qLower) ||
      m.masdarPronunciationBn.toLowerCase().includes(qLower);

    if (hit) {
      pushUnique({
        id: `lk-m-${m.id}`,
        arabic: m.masdarAr,
        root: m.rootLetters,
        babOrTypeBn: `${m.babNameBn}${m.sarfType ? ` · ${m.sarfType}` : ''}`,
        pronunciationBn: m.masdarPronunciationBn,
        meaningBn: m.meaningBn,
        meaningEn: m.meaningEn,
        conjugationSummary: `${m.madiAr} · ${m.mudariAr} · ${m.amrAr}`,
        exampleAr: m.exampleAr,
        exampleBn: m.exampleBn,
        sourceKind: 'masdar',
      });
    }
  }

  // 3. Ism & Sifat Banks
  for (const cat of ALL_ISM_CATEGORIES) {
    if (results.length >= 28) break;
    for (const item of cat.entries) {
      if (results.length >= 28) break;
      const arKey = normalizeArabicTokenKey(item.arabic);
      const hit =
        (qNormAr && arKey.includes(qNormAr)) ||
        item.arabic.includes(trimmed) ||
        item.meaningBn.toLowerCase().includes(qLower) ||
        item.meaningEn.toLowerCase().includes(qLower) ||
        item.pronunciationBn.toLowerCase().includes(qLower);
      if (hit) {
        pushUnique({
          id: `lk-ism-${item.id}`,
          arabic: item.arabic,
          root: item.rootLetters || 'اسم (বিশেষ্য)',
          babOrTypeBn: item.categoryTitleBn,
          pronunciationBn: item.pronunciationBn,
          meaningBn: item.meaningBn,
          meaningEn: item.meaningEn,
          exampleAr: item.exampleAr,
          exampleBn: item.exampleBn,
          sourceKind: 'ism',
        });
      }
    }
  }

  for (const cat of SIFAT_CATEGORIES) {
    if (results.length >= 32) break;
    for (const item of cat.entries) {
      if (results.length >= 32) break;
      const arKey = normalizeArabicTokenKey(item.arabic);
      const hit =
        (qNormAr && arKey.includes(qNormAr)) ||
        item.arabic.includes(trimmed) ||
        item.meaningBn.toLowerCase().includes(qLower) ||
        item.meaningEn.toLowerCase().includes(qLower) ||
        item.pronunciationBn.toLowerCase().includes(qLower);
      if (hit) {
        pushUnique({
          id: `lk-sif-${item.id}`,
          arabic: item.arabic,
          root: item.rootLetters || 'صفة (বিশেষণ)',
          babOrTypeBn: item.categoryTitleBn,
          pronunciationBn: item.pronunciationBn,
          meaningBn: item.meaningBn,
          meaningEn: item.meaningEn,
          exampleAr: item.exampleAr,
          exampleBn: item.exampleBn,
          sourceKind: 'sifat',
        });
      }
    }
  }

  // 4. Morphological fallback for any inflected Arabic word
  if (/[\u0621-\u064A]/.test(trimmed)) {
    const tip = matchNahwTipForToken(trimmed);
    if (tip) {
      pushUnique({
        id: `lk-morph-${qNormAr || trimmed}`,
        arabic: trimmed,
        root: tip.rootOrFormBn || tip.tarkibRoleBn || tip.categoryBn,
        babOrTypeBn: tip.categoryBn,
        pronunciationBn: tip.titleBn,
        meaningBn: tip.meaningBn || tip.ruleBn,
        meaningEn: tip.tarkibRoleBn || 'Grammatical / Morphological Form',
        exampleAr: tip.exampleAr,
        exampleBn: tip.exampleBn,
        sourceKind: 'morphology',
      });
    }
  }

  return results.slice(0, 12);
}

const SOURCE_STYLE: Record<LookupResultEntry['sourceKind'], { label: string; cls: string }> = {
  vocab: { label: 'শব্দভাণ্ডার', cls: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  masdar: { label: 'মাসদার ও ধাতু', cls: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30' },
  ism: { label: 'ইসম (বিশেষ্য)', cls: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
  sifat: { label: 'সিফাত (বিশেষণ)', cls: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/30' },
  morphology: { label: 'নাহু ও ছরফ রূপ', cls: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/30' },
};

export const InstantLookupBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { allVocabulary, addCustomVocab, setInstantLookupOpen, triggerSound } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo(() => buildLookupResults(query, allVocabulary), [query, allVocabulary]);
  const showDropdown = focused && query.trim().length > 0;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleAddToDeck = (entry: LookupResultEntry) => {
    const vocabId = `lookup-${normalizeArabicTokenKey(entry.arabic) || entry.id}`;
    addCustomVocab({
      id: vocabId,
      arabic: entry.arabic,
      pronunciationBn: entry.pronunciationBn,
      meaningBn: entry.meaningBn,
      meaningEn: entry.meaningEn,
      category: entry.babOrTypeBn,
      root: entry.root,
      exampleAr: entry.exampleAr || entry.arabic,
      exampleBn: entry.exampleBn || entry.meaningBn,
      exampleEn: entry.meaningEn,
    });
    setAddedIds((prev) => new Set(prev).add(entry.id));
    triggerSound('success');
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Mobile Compact Search Trigger Button */}
      <button
        type="button"
        onClick={() => {
          triggerSound('click');
          setInstantLookupOpen(true);
        }}
        className="md:hidden inline-flex items-center justify-center p-2 rounded-xl btn-secondary text-[var(--text-primary)] hover:text-[var(--accent)]"
        title="তাৎক্ষণিক শব্দ ও মূলধাতু খুঁজুন (Instant Lookup)"
        aria-label="তাৎক্ষণিক শব্দ অনুসন্ধান"
      >
        <Search className="w-4 h-4 text-[var(--accent)]" />
      </button>

      {/* Desktop Inline Search Input */}
      <div className={`hidden md:block relative ${compact ? 'w-52 xl:w-64' : 'w-64 xl:w-72'}`}>
        <Search className="w-3.5 h-3.5 text-[var(--accent)] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocused(true);
          }}
          placeholder="শব্দ বা মূলধাতু খুঁজুন..."
          aria-label="Instant Arabic root & meaning lookup"
          className="w-full ps-8 pe-7 py-1.5 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="অনুসন্ধান মুছুন"
            className="absolute end-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {showDropdown && (
          <div className="absolute top-full mt-2 end-0 w-[390px] max-w-[92vw] max-h-[70vh] overflow-y-auto rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-2xl p-3 space-y-2 z-50">
            <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[var(--border-subtle)] text-[11px]">
              <span className="font-bold text-[var(--accent)] inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>তাৎক্ষণিক মূলধাতু ও অর্থ ({results.length}টি)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setFocused(false);
                  setInstantLookupOpen(true);
                }}
                className="text-[var(--accent)] font-semibold hover:underline"
              >
                বড় ভিউ খুলুন
              </button>
            </div>

            {results.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                "{query}" এর জন্য কোনো মিল পাওয়া যায়নি। আরবি, বাংলা বা ইংরেজি শব্দ লিখে চেষ্টা করুন।
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((entry) => {
                  const badge = SOURCE_STYLE[entry.sourceKind];
                  const added = addedIds.has(entry.id);
                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl surface-alt border border-[var(--border-subtle)] p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-arabic text-xl font-bold text-[var(--accent)]" dir="rtl">
                              {entry.arabic}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-[var(--text-primary)]">
                            {entry.meaningBn}
                            <span className="font-normal text-[var(--text-muted)] ms-1">({entry.meaningEn})</span>
                          </div>
                        </div>
                        <AudioButton text={entry.arabic} compact showSlow={false} />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-[var(--border-subtle)]">
                        <div className="text-[var(--text-secondary)] truncate">
                          <span className="text-[var(--text-muted)]">مَادَّة (মূলধাতু): </span>
                          <strong className="font-arabic text-sm text-[var(--accent)]" dir="rtl">
                            {entry.root}
                          </strong>
                          <span className="text-[var(--text-muted)] ms-1.5">· {entry.babOrTypeBn}</span>
                        </div>
                        {entry.sourceKind !== 'vocab' && (
                          <button
                            type="button"
                            onClick={() => handleAddToDeck(entry)}
                            disabled={added}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                              added
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                : 'btn-primary'
                            }`}
                          >
                            {added ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            <span>{added ? 'যুক্ত' : 'ডেকে'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const InstantLookupModal: React.FC = () => {
  const { instantLookupOpen, setInstantLookupOpen, allVocabulary, addCustomVocab, triggerSound } = useApp();
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => buildLookupResults(query, allVocabulary), [query, allVocabulary]);

  useEffect(() => {
    if (!instantLookupOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInstantLookupOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [instantLookupOpen, setInstantLookupOpen]);

  if (!instantLookupOpen) return null;

  const quickChips = ['كَتَبَ', 'عِلْم', 'قُرْآن', 'ধৈর্য', 'ন্যায়', 'ذهب', 'كتاب'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16"
      onClick={() => setInstantLookupOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="তাৎক্ষণিক শব্দ ও মূলধাতু অনুসন্ধান"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
      >
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--accent)]">
              <BookOpen className="w-4 h-4" />
              <span>তাৎক্ষণিক শব্দ, মূলধাতু (মাদ্দাহ) ও অর্থ অনুসন্ধান</span>
            </div>
            <button
              type="button"
              onClick={() => setInstantLookupOpen(false)}
              className="p-1.5 rounded-xl btn-secondary"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[var(--accent)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="আরবি (যেমন: كَتَبَ), মূলধাতু (ك ت ب), বাংলা বা ইংরেজি অর্থ লিখুন..."
              className="w-full ps-10 pe-10 py-2.5 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-strong)] focus:border-[var(--accent)] focus:outline-none text-sm text-[var(--text-primary)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="মুছুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[var(--text-muted)] font-semibold">দ্রুত উদাহরণ:</span>
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setQuery(chip)}
                className="px-2.5 py-1 rounded-lg surface-alt border border-[var(--border-subtle)] hover:border-[var(--accent)] font-semibold text-[var(--text-primary)]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {!query.trim() ? (
            <div className="py-10 text-center space-y-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <Sparkles className="w-6 h-6 mx-auto text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text-primary)]">
                শব্দভাণ্ডার, ২৩ বাবের ১৪১১+ মাসদার, ৩৫০ ইসম ও ১৪০ সিফাত একসাথে খুঁজুন
              </p>
              <p>উপরে যেকোনো আরবি, বাংলা বা ইংরেজি শব্দ লিখলেই মূলধাতু (মাদ্দাহ), বাব এবং বাংলা অর্থ দেখাবে।</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">
              "{query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি। বানান পরিবর্তন করে চেষ্টা করুন।
            </div>
          ) : (
            results.map((entry) => {
              const badge = SOURCE_STYLE[entry.sourceKind];
              const added = addedIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-arabic text-2xl sm:text-3xl font-bold text-[var(--accent)]" dir="rtl">
                          {entry.arabic}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        উচ্চারণ: <strong className="text-[var(--text-primary)]">{entry.pronunciationBn}</strong>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                        {entry.meaningBn}
                        <span className="text-xs font-normal text-[var(--text-muted)] ms-2">({entry.meaningEn})</span>
                      </div>
                    </div>
                    <AudioButton text={entry.arabic} compact showSlow={false} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-2 border-t border-[var(--border-subtle)]">
                    <div>
                      <span className="text-[var(--text-muted)]">মূলধাতু (مَادَّة): </span>
                      <strong className="font-arabic text-base text-[var(--accent)]" dir="rtl">
                        {entry.root}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">বাব / শ্রেণি: </span>
                      <strong className="text-[var(--text-primary)]">{entry.babOrTypeBn}</strong>
                    </div>
                    {entry.conjugationSummary && (
                      <div className="font-arabic text-base text-[var(--text-secondary)]" dir="rtl">
                        {entry.conjugationSummary}
                      </div>
                    )}
                  </div>

                  {(entry.exampleAr || entry.sourceKind !== 'vocab') && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
                      {entry.exampleAr ? (
                        <div className="text-xs text-[var(--text-secondary)] min-w-0">
                          <span className="font-arabic text-base text-[var(--text-primary)] me-2" dir="rtl">
                            {entry.exampleAr}
                          </span>
                          {entry.exampleBn && <span>— {entry.exampleBn}</span>}
                        </div>
                      ) : (
                        <div />
                      )}

                      {entry.sourceKind !== 'vocab' && (
                        <button
                          type="button"
                          onClick={() => {
                            const vocabId = `lookup-${normalizeArabicTokenKey(entry.arabic) || entry.id}`;
                            addCustomVocab({
                              id: vocabId,
                              arabic: entry.arabic,
                              pronunciationBn: entry.pronunciationBn,
                              meaningBn: entry.meaningBn,
                              meaningEn: entry.meaningEn,
                              category: entry.babOrTypeBn,
                              root: entry.root,
                              exampleAr: entry.exampleAr || entry.arabic,
                              exampleBn: entry.exampleBn || entry.meaningBn,
                              exampleEn: entry.meaningEn,
                            });
                            setAddedIds((prev) => new Set(prev).add(entry.id));
                            triggerSound('success');
                          }}
                          disabled={added}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold shrink-0 ${
                            added
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                              : 'btn-primary'
                          }`}
                        >
                          {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{added ? 'ডেকে যুক্ত হয়েছে' : 'ব্যক্তিগত ডেকে যোগ'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
