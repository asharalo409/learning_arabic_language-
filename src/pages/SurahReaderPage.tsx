import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  GitBranch,
  Home,
  Link2,
  Sparkles,
  X,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { computePortalPopoverCoords, FloatingAnchor, FloatingWordPortal } from '../components/FloatingWordPortal';
import { TarkibVisualizer } from '../components/TarkibVisualizer';
import { useApp } from '../context/AppContext';
import { analyzeSentenceTarkib, SentenceTarkibResult, SentenceTarkibWord } from '../data/nahwQuickTips';
import { QURAN_GRAMMAR_BY_SURAH } from '../data/quranGrammarData';
import { analyzeQuranWord, WordGrammarDetail } from '../data/quranWordMorphology';
import { QURAN_ALL_SHORT_SURAHS, QuranSurahComplete } from '../data/quranicData';
import { exportElementToPdf } from '../utils/domPdfExport';
import { formatGrammarTerm, localizeGrammarLabel } from '../utils/grammarTerminology';

type SurahTab = 'verses' | 'vocab' | 'grammar' | 'tarkib' | 'practice';

const COMPLETED_SURAHS_KEY = 'aaa_completed_surahs_v1';

// Anchoring handled by computePortalPopoverCoords + FloatingWordPortal

function readCompletedSurahs(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPLETED_SURAHS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

interface SurahQuizItem {
  id: string;
  questionBn: string;
  arabicPrompt?: string;
  options: string[];
  correctIndex: number;
  explanationBn: string;
}

function buildSurahQuiz(surah: QuranSurahComplete): SurahQuizItem[] {
  const items: SurahQuizItem[] = [];
  const words = surah.keyWords || [];

  words.slice(0, 3).forEach((kw, idx) => {
    const distractors = words
      .filter((other) => other.meaningBn !== kw.meaningBn)
      .map((other) => other.meaningBn)
      .slice(0, 3);
    if (distractors.length < 2) {
      distractors.push('আল্লাহর ইবাদত', 'সঠিক পথ', 'দয়ালু ও মেহেরবান');
    }
    const uniqueDistractors = Array.from(new Set(distractors)).slice(0, 3);
    const insertPos = idx % (uniqueDistractors.length + 1);
    const options = [...uniqueDistractors];
    options.splice(insertPos, 0, kw.meaningBn);

    items.push({
      id: `sq-${surah.surahNumber}-kw-${idx}`,
      questionBn: `"${kw.arabic}" শব্দটির সঠিক বাংলা অর্থ কী?`,
      arabicPrompt: kw.arabic,
      options,
      correctIndex: insertPos,
      explanationBn: `${kw.arabic} (${kw.pronunciationBn}) অর্থ "${kw.meaningBn}" · মূলধাতু: ${kw.root} · ${kw.grammarNoteBn}`,
    });
  });

  if (surah.verses.length > 0) {
    const firstVerse = surah.verses[0];
    const otherTranslations = surah.verses
      .slice(1)
      .map((v) => v.translationBn)
      .filter((tr) => tr && tr !== firstVerse.translationBn)
      .slice(0, 3);
    while (otherTranslations.length < 3) {
      otherTranslations.push(
        otherTranslations.length === 0
          ? 'নিশ্চয় মানুষ ক্ষতির মধ্যে নিপতিত।'
          : otherTranslations.length === 1
          ? 'সমস্ত প্রশংসা জগতসমূহের প্রতিপালক আল্লাহর জন্য।'
          : 'বলুন, তিনি আল্লাহ, এক ও অদ্বিতীয়।'
      );
    }
    const correctIdx = 1;
    const opts = [...otherTranslations.slice(0, 3)];
    opts.splice(correctIdx, 0, firstVerse.translationBn);
    items.push({
      id: `sq-${surah.surahNumber}-v1`,
      questionBn: `${surah.nameBn}-এর ১ম আয়াতের সঠিক বাংলা অনুবাদ কোনটি?`,
      arabicPrompt: firstVerse.arabic,
      options: opts,
      correctIndex: correctIdx,
      explanationBn: `${firstVerse.arabic} — ${firstVerse.translationBn}`,
    });
  }

  return items;
}

export const SurahReaderPage: React.FC = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const {
    lang,
    grammarTerminologyMode,
    setGrammarTerminologyMode,
    awardXp,
    triggerSound,
    syncMissingVocabFromSegments,
  } = useApp();

  const num = Number(surahNumber) || 1;
  const surahIndex = Math.max(
    0,
    QURAN_ALL_SHORT_SURAHS.findIndex((s) => s.surahNumber === num)
  );
  const activeSurah = QURAN_ALL_SHORT_SURAHS[surahIndex] || QURAN_ALL_SHORT_SURAHS[0];
  const surahGrammar = QURAN_GRAMMAR_BY_SURAH[activeSurah.surahNumber];

  const prevSurah = surahIndex > 0 ? QURAN_ALL_SHORT_SURAHS[surahIndex - 1] : null;
  const nextSurah =
    surahIndex < QURAN_ALL_SHORT_SURAHS.length - 1 ? QURAN_ALL_SHORT_SURAHS[surahIndex + 1] : null;

  const [activeTab, setActiveTab] = useState<SurahTab>('verses');
  const [selectedTarkibAyahNum, setSelectedTarkibAyahNum] = useState<number>(
    activeSurah.verses[0]?.ayahNumber || 1
  );
  const [completedSurahs, setCompletedSurahs] = useState<number[]>(() => readCompletedSurahs());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Anchored popover state for tapped word inside Ayah verses
  const [selectedToken, setSelectedToken] = useState<{
    ayahNumber: number;
    wordIdx: number;
    detail: WordGrammarDetail;
    tarkibWord?: SentenceTarkibWord;
    tarkibResult: SentenceTarkibResult;
    anchor: FloatingAnchor;
  } | null>(null);

  const [showPdfSheet, setShowPdfSheet] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfExportError, setPdfExportError] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const pdfSheetRef = useRef<HTMLDivElement | null>(null);
  const syncedSurahsRef = useRef<Set<number>>(new Set());

  const isArabicMode = grammarTerminologyMode === 'arabic';
  const isSurahCompleted = completedSurahs.includes(activeSurah.surahNumber);

  // Precompute Tarkib for all verses of the active Surah so linked highlights are instant
  const verseTarkibMap = useMemo(() => {
    const map = new Map<number, SentenceTarkibResult>();
    activeSurah.verses.forEach((v) => {
      map.set(v.ayahNumber, analyzeSentenceTarkib(v.arabic));
    });
    return map;
  }, [activeSurah]);

  const surahQuiz = useMemo(() => buildSurahQuiz(activeSurah), [activeSurah]);

  useEffect(() => {
    setActiveTab('verses');
    setSelectedToken(null);
    setQuizAnswers({});
    setSelectedTarkibAyahNum(activeSurah.verses[0]?.ayahNumber || 1);
    window.scrollTo({ top: 0 });
  }, [activeSurah.surahNumber, activeSurah.verses]);

  useEffect(() => {
    if (syncedSurahsRef.current.has(activeSurah.surahNumber)) return;
    syncedSurahsRef.current.add(activeSurah.surahNumber);
    syncMissingVocabFromSegments(
      activeSurah.verses.map((v) => ({
        arabic: v.arabic,
        translationBn: v.translationBn,
        translationEn: v.translationEn,
        sourceLabelBn: `${activeSurah.nameBn} (${activeSurah.surahNumber}:${v.ayahNumber})`,
        isQuranic: true,
      }))
    );
  }, [activeSurah, syncMissingVocabFromSegments]);

  useEffect(() => {
    if (!selectedToken) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedToken(null);
    };
    const onDocClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelectedToken(null);
      }
    };
    const onScroll = () => setSelectedToken(null);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onDocClick);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [selectedToken]);

  const handleCompleteSurah = () => {
    if (isSurahCompleted) return;
    const next = Array.from(new Set([...completedSurahs, activeSurah.surahNumber]));
    setCompletedSurahs(next);
    try {
      localStorage.setItem(COMPLETED_SURAHS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    triggerSound('success');
    awardXp(25, {
      titleBn: `সূরা সম্পন্ন: ${activeSurah.nameBn}`,
      titleEn: `Completed Surah: ${activeSurah.nameEn}`,
      type: 'lesson',
    });
  };

  const handleExportSurahPdf = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    setPdfExportError(null);
    setShowPdfSheet(true);

    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
      if (!pdfSheetRef.current) {
        throw new Error('সূরার PDF শিট প্রস্তুত হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
      const slug = activeSurah.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await exportElementToPdf(pdfSheetRef.current, {
        filename: `surah-${activeSurah.surahNumber}-${slug || 'study'}.pdf`,
        scale: 2,
        margin: [10, 10, 10, 10],
        captureWidthPx: 794,
      });
    } catch (err: unknown) {
      setPdfExportError(err instanceof Error ? err.message : 'PDF ডাউনলোড করা যায়নি।');
    } finally {
      setExportingPdf(false);
      setShowPdfSheet(false);
    }
  };

  const linkedSetForActiveAyah = useMemo(() => {
    if (!selectedToken?.tarkibWord) return new Set<number>();
    return new Set(selectedToken.tarkibWord.linkedIndices || []);
  }, [selectedToken]);

  const activeTarkibVerse =
    activeSurah.verses.find((v) => v.ayahNumber === selectedTarkibAyahNum) || activeSurah.verses[0];

  return (
    <AppShell
      title={`${activeSurah.nameBn} (সূরা ${activeSurah.surahNumber})`}
      subtitle={
        lang === 'bn'
          ? `${activeSurah.revelationTypeBn} · ${activeSurah.verses.length} আয়াত · ১/১০০ পাঠ কাঠামোতে আয়াত, মূলধাতু, নাহু-ছরফ ও তারকিব`
          : `${activeSurah.nameEn} · ${activeSurah.verses.length} Ayat · 1/100 Structured Study`
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb, Terminology Switch & Complete Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/quranic-arabic"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>সব সূরা ({QURAN_ALL_SHORT_SURAHS.length})</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium btn-secondary"
            >
              <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline">হোম</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-0.5 text-[11px] font-bold"
              role="group"
              aria-label="Grammar terminology language"
            >
              <button
                type="button"
                onClick={() => setGrammarTerminologyMode('arabic')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  isArabicMode
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="আরবি পরিভাষা (اسم، فعل، مبتدأ، خبر)"
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setGrammarTerminologyMode('bengali')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  !isArabicMode
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="বাংলা পরিভাষা (ইসম, ফেল, মুবতাদা, খবর)"
              >
                বাংলা
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleExportSurahPdf()}
              disabled={exportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold btn-secondary disabled:opacity-60"
              title="এই সূরার আয়াত, শব্দভাণ্ডার ও নাহু-ছরফ PDF হিসেবে ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{exportingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>

            {isSurahCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--emerald-highlight)] text-[var(--success)]">
                <CheckCircle2 className="w-4 h-4" />
                <span>সূরা সম্পন্ন</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleCompleteSurah}
                className="px-4 py-1.5 rounded-full text-xs btn-primary font-bold"
              >
                সূরা সম্পন্ন করুন (+25 XP)
              </button>
            )}
          </div>
        </div>

        {pdfExportError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
            <span>{pdfExportError}</span>
            <button
              type="button"
              onClick={() => setPdfExportError(null)}
              className="px-2 py-0.5 rounded-lg font-bold hover:bg-rose-500/15"
            >
              বন্ধ
            </button>
          </div>
        )}

        {/* Rich Surah Header Banner */}
        <header
          className="rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-3"
          style={{ background: activeSurah.accentGradient }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white/85">
                সূরা নং {activeSurah.surahNumber} · {activeSurah.revelationTypeBn} · {activeSurah.verses.length} আয়াত
              </div>
              <p className="font-arabic text-3xl sm:text-4xl font-bold leading-snug" dir="rtl">
                {activeSurah.nameAr}
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                {activeSurah.nameBn} ({activeSurah.nameEn})
              </h2>
            </div>

            <AudioButton
              text={activeSurah.verses.map((v) => v.arabic).join(' ')}
              showSlow
            />
          </div>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-3xl">
            {activeSurah.summaryBn}
          </p>
        </header>

        {/* 1/100 Lesson Flow Navigation Tabs */}
        <nav className="flex flex-wrap gap-1.5 pb-3 border-b border-[var(--border-subtle)]">
          {(
            [
              { id: 'verses', labelBn: `আয়াত ও তিলাওয়াত (${activeSurah.verses.length})`, labelEn: 'Verses' },
              { id: 'vocab', labelBn: `শব্দ ও মূলধাতু (${activeSurah.keyWords.length})`, labelEn: 'Vocab & Roots' },
              { id: 'grammar', labelBn: 'নাহু ও ছরফ', labelEn: 'Nahw & Sarf' },
              {
                id: 'tarkib',
                labelBn: isArabicMode ? 'شَجَرَةُ التَّرْكِيبِ' : 'তারকিব ট্রি',
                labelEn: 'Tarkib Tree',
              },
              { id: 'practice', labelBn: 'অনুশীলন ও কুইজ', labelEn: 'Practice & Quiz' },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedToken(null);
                  setActiveTab(tab.id);
                }}
                className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                    : 'btn-secondary text-[var(--text-secondary)]'
                }`}
              >
                {lang === 'en' ? tab.labelEn : tab.labelBn}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: Ayah-by-Ayah Reading with Simultaneous Linked Highlighting & Anchored Floating Popover */}
        {activeTab === 'verses' && (
          <div className="space-y-4">
            <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent)]">
                <Sparkles className="w-3.5 h-3.5" />
                যেকোনো আরবি শব্দে চাপুন — সাথে সাথেই সেখানেই শব্দ-তথ্য ও তারকিব-জুটি হাইলাইট দেখাবে
              </span>
              <span className="text-[var(--text-muted)]">
                পরিভাষা: <strong className="text-[var(--text-primary)]">{isArabicMode ? 'العربية' : 'বাংলা'}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {activeSurah.verses.map((verse) => {
                const tarkibRes = verseTarkibMap.get(verse.ayahNumber);
                const tokens = verse.arabic.split(/\s+/).filter(Boolean);
                const ayahGrammar = surahGrammar?.ayat?.[verse.ayahNumber];
                const isSelectedVerse = selectedToken?.ayahNumber === verse.ayahNumber;

                return (
                  <article
                    key={verse.ayahNumber}
                    className="surface-card rounded-3xl border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
                      <span className="inline-flex items-center gap-2 text-xs font-mono-num font-extrabold text-[var(--accent)]">
                        আয়াত {activeSurah.surahNumber}:{verse.ayahNumber}
                      </span>

                      <div className="flex items-center gap-2">
                        <AudioButton text={verse.arabic} showSlow compact />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedToken(null);
                            setSelectedTarkibAyahNum(verse.ayahNumber);
                            setActiveTab('tarkib');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold btn-secondary hover:text-[var(--accent)]"
                          title="এই আয়াতের পূর্ণ তারকিব ট্রি দেখুন"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>{isArabicMode ? 'التَّرْكِيبُ' : 'তারকিব ট্রি'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Word Tokens (data-nahw-managed disables global monitor takeover) */}
                    <div
                      dir="rtl"
                      data-nahw-managed="true"
                      className="flex flex-wrap items-center gap-x-2 gap-y-2.5 leading-[2.4]"
                    >
                      {tokens.map((rawWord, wIdx) => {
                        const tWord = tarkibRes?.words[wIdx];
                        const isActiveWord = isSelectedVerse && selectedToken?.wordIdx === wIdx;
                        const isLinkedPartner =
                          isSelectedVerse && !isActiveWord && linkedSetForActiveAyah.has(wIdx);
                        const hoverRole = tWord
                          ? isArabicMode
                            ? `${tWord.tarkibRoleAr} (${tWord.tarkibRoleBn})`
                            : `${tWord.tarkibRoleBn} (${tWord.tarkibRoleAr})`
                          : undefined;

                        return (
                          <button
                            key={wIdx}
                            type="button"
                            title={hoverRole}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isActiveWord) {
                                setSelectedToken(null);
                                return;
                              }
                              const detail = analyzeQuranWord(rawWord, ayahGrammar);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setSelectedToken({
                                ayahNumber: verse.ayahNumber,
                                wordIdx: wIdx,
                                detail,
                                tarkibWord: tWord,
                                tarkibResult: tarkibRes || analyzeSentenceTarkib(verse.arabic),
                                anchor: computePortalPopoverCoords(rect),
                              });
                            }}
                            className={`font-arabic text-2xl sm:text-3xl px-1 rounded transition-colors cursor-pointer focus:outline-none ${
                              isActiveWord
                                ? 'bg-[var(--accent)]/18 text-[var(--accent)] underline decoration-2 underline-offset-4'
                                : isLinkedPartner
                                ? 'bg-amber-500/18 text-amber-800 dark:text-amber-200 underline decoration-dotted underline-offset-4'
                                : 'hover:bg-[var(--emerald-highlight)] text-[var(--text-primary)]'
                            }`}
                          >
                            {rawWord}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-1.5 pt-1 text-sm sm:text-[15.5px]">
                      <p className="text-xs sm:text-sm text-[var(--text-muted)]">{verse.pronunciationBn}</p>
                      <p className="font-bold text-[var(--text-primary)] leading-relaxed">
                        {lang === 'en' ? verse.translationEn : verse.translationBn}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Key Words & Morphological Roots */}
        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
              {activeSurah.nameBn}-এর গুরুত্বপূর্ণ <strong className="text-[var(--accent)]">{activeSurah.keyWords.length}টি</strong> কুরআনিক শব্দ, মূলধাতু ও ব্যাকরণগত পরিচয়
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSurah.keyWords.map((kw, idx) => (
                <div
                  key={`${kw.arabic}-${idx}`}
                  className="surface-card rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-arabic text-3xl text-[var(--accent)] font-bold" dir="rtl">
                        {kw.arabic}
                      </p>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        উচ্চারণ: <span className="font-semibold text-[var(--text-primary)]">{kw.pronunciationBn}</span>
                      </div>
                    </div>
                    <AudioButton text={kw.arabic} showSlow compact />
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div>
                      <span className="text-[var(--text-muted)]">অর্থ: </span>
                      <strong className="text-[var(--text-primary)]">{kw.meaningBn}</strong>
                      <span className="text-xs text-[var(--text-muted)] ms-1.5">({kw.meaningEn})</span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span>
                        <span className="text-[var(--text-muted)]">মূলধাতু (مَادَّة): </span>
                        <strong className="font-arabic text-base text-[var(--accent)]" dir="rtl">
                          {kw.root}
                        </strong>
                      </span>
                      <span>
                        <span className="text-[var(--text-muted)]">পদ: </span>
                        <strong className="text-[var(--accent)]">
                          {localizeGrammarLabel(kw.posBn, grammarTerminologyMode)}
                        </strong>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border-subtle)]">
                      {localizeGrammarLabel(kw.grammarNoteBn, grammarTerminologyMode)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Nahw & Sarf Analysis (1/100 Lesson Flow Grammar Tab) */}
        {activeTab === 'grammar' && (
          <div className="space-y-6">
            {surahGrammar ? (
              <>
                <section className="surface-alt rounded-3xl border border-[var(--border-strong)] p-5 sm:p-6 space-y-2.5">
                  <div className="text-xs font-bold text-[var(--accent)]">
                    {isArabicMode ? 'النَّحْوُ وَالصَّرْفُ — সূরা সারসংক্ষেপ' : 'নাহু ও ছরফ সারসংক্ষেপ'}
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                    {localizeGrammarLabel(surahGrammar.overviewTitleBn, grammarTerminologyMode)}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-[1.85]">
                    {localizeGrammarLabel(surahGrammar.overviewBn, grammarTerminologyMode)}
                  </p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-base font-extrabold text-[var(--accent)]">আয়াতভিত্তিক নাহু ও ছরফ বিশ্লেষণ:</h4>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {activeSurah.verses.map((v) => {
                      const note = surahGrammar.ayat?.[v.ayahNumber];
                      return (
                        <div key={v.ayahNumber} className="py-5 first:pt-1 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-mono-num font-bold text-[var(--accent)]">
                              আয়াত {activeSurah.surahNumber}:{v.ayahNumber}
                            </span>
                            <AudioButton text={v.arabic} compact showSlow={false} />
                          </div>
                          <p className="font-arabic text-2xl sm:text-3xl text-[var(--text-primary)]" dir="rtl">
                            {v.arabic}
                          </p>
                          {note ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div className="rounded-2xl surface-card border border-[var(--border-subtle)] p-4 space-y-1">
                                <div className="text-xs font-extrabold text-[var(--accent)]">
                                  {isArabicMode ? 'التَّحْلِيلُ النَّحْوِيُّ (নাহু)' : 'নাহু (বাক্য বিশ্লেষণ)'}
                                </div>
                                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                                  {localizeGrammarLabel(note.nahwBn, grammarTerminologyMode)}
                                </p>
                              </div>
                              <div className="rounded-2xl surface-card border border-[var(--border-subtle)] p-4 space-y-1">
                                <div className="text-xs font-extrabold text-[var(--accent)]">
                                  {isArabicMode ? 'التَّحْلِيلُ الصَّرْفِيُّ (ছরফ)' : 'ছরফ (শব্দ গঠন)'}
                                </div>
                                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                                  {localizeGrammarLabel(note.sarfBn, grammarTerminologyMode)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--text-muted)]">{v.translationBn}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            ) : (
              <div className="surface-card rounded-2xl p-6 text-sm text-[var(--text-secondary)]">
                আয়াত ট্যাবে যেকোনো আরবি শব্দে ক্লিক করে সরাসরি শব্দ-বিশ্লেষণ বা তারকিব ট্রি দেখতে পারেন।
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Interactive Tarkib Tree Visualizer */}
        {activeTab === 'tarkib' && activeTarkibVerse && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)]">আয়াত নির্বাচন করুন:</span>
              {activeSurah.verses.map((v) => (
                <button
                  key={v.ayahNumber}
                  type="button"
                  onClick={() => setSelectedTarkibAyahNum(v.ayahNumber)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono-num transition-colors ${
                    activeTarkibVerse.ayahNumber === v.ayahNumber
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  আয়াত {v.ayahNumber}
                </button>
              ))}
            </div>

            <TarkibVisualizer
              key={`${activeSurah.surahNumber}-${activeTarkibVerse.ayahNumber}`}
              sentenceAr={activeTarkibVerse.arabic}
              translationBn={activeTarkibVerse.translationBn}
              translationEn={activeTarkibVerse.translationEn}
              titleLabel={`${activeSurah.nameBn} (${activeSurah.surahNumber}:${activeTarkibVerse.ayahNumber}) · ${
                isArabicMode ? 'شَجَرَةُ التَّرْكِيبِ' : 'বাক্যের তারকিব ট্রি'
              }`}
            />
          </div>
        )}

        {/* TAB 5: Practice & Quiz */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="divide-y divide-[var(--border-subtle)]">
              {surahQuiz.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const isAnswered = chosen !== undefined;
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div key={q.id} className="py-5 first:pt-1 space-y-3">
                    <div className="text-base font-bold leading-snug">
                      {qIdx + 1}. {q.questionBn}
                    </div>
                    {q.arabicPrompt && (
                      <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                        {q.arabicPrompt}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            triggerSound(oIdx === q.correctIndex ? 'success' : 'error');
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                          }}
                          className={`text-left px-4 py-3 rounded-2xl text-[15px] border transition-colors ${
                            chosen === oIdx
                              ? oIdx === q.correctIndex
                                ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-bold'
                                : 'border-[var(--danger)] bg-[var(--danger)]/10'
                              : 'border-[var(--border-subtle)] surface-alt hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {isAnswered && (
                      <div
                        className={`text-sm font-medium leading-relaxed ${
                          isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'
                        }`}
                      >
                        {isCorrect ? 'সঠিক উত্তর! ' : 'আবার দেখুন: '}
                        {localizeGrammarLabel(q.explanationBn, grammarTerminologyMode)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Surah Prev/Next Navigation */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          {prevSurah ? (
            <Link
              to={`/quranic-arabic/${prevSurah.surahNumber}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
              <span>পূর্ববর্তী: {prevSurah.nameBn}</span>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Link
              to="/quranic-arabic"
              className="px-4 py-2.5 rounded-full text-xs font-semibold btn-secondary"
            >
              সব সূরা তালিকা
            </Link>
            {nextSurah && (
              <Link
                to={`/quranic-arabic/${nextSurah.surahNumber}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold btn-primary"
              >
                <span>পরবর্তী: {nextSurah.nameBn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Portal-Rendered Absolute Floating Popover Anchored at Tapped Ayah Word */}
      {selectedToken && (
        <FloatingWordPortal
          anchor={selectedToken.anchor}
          popoverRef={popoverRef}
          dataAttrs={{ 'data-nahw-managed': 'true', 'data-global-grammar-ignore': 'true' }}
          onContainerClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[var(--border-subtle)]">
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-arabic text-xl font-bold text-[var(--accent)]" dir="rtl">
                  {selectedToken.detail.arabic}
                </span>
                {selectedToken.tarkibWord && (
                  <span
                    title={
                      isArabicMode
                        ? selectedToken.tarkibWord.posShortBn
                        : selectedToken.tarkibWord.posShortAr
                    }
                    className={`text-[11px] font-bold text-[var(--accent)] ${
                      isArabicMode ? 'font-arabic text-xs' : ''
                    }`}
                  >
                    ·{' '}
                    {isArabicMode
                      ? selectedToken.tarkibWord.posShortAr
                      : selectedToken.tarkibWord.posShortBn}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                {selectedToken.detail.meaningBn}
                <span className="font-normal text-[var(--text-muted)]">
                  {' '}
                  · مَادَّة: <span className="font-arabic text-xs text-[var(--accent)]">{selectedToken.detail.root}</span>
                </span>
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <AudioButton text={selectedToken.detail.arabic} compact showSlow={false} />
              <button
                type="button"
                onClick={() => setSelectedToken(null)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                aria-label="বন্ধ করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {selectedToken.tarkibWord && (
            <div
              className="space-y-0.5 text-[11px]"
              title={
                formatGrammarTerm(selectedToken.tarkibWord.roleKey, grammarTerminologyMode).tooltipBn
              }
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span
                  className={`font-extrabold text-[var(--accent)] ${
                    isArabicMode ? 'font-arabic text-xs' : ''
                  }`}
                >
                  {isArabicMode
                    ? selectedToken.tarkibWord.tarkibRoleAr
                    : selectedToken.tarkibWord.tarkibRoleBn}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {isArabicMode
                    ? selectedToken.tarkibWord.tarkibRoleBn
                    : selectedToken.tarkibWord.tarkibRoleAr}
                </span>
              </div>

              {selectedToken.tarkibWord.linkedIndices.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                  <Link2 className="w-3 h-3 shrink-0" />
                  <span className={isArabicMode ? 'font-arabic text-[11px]' : ''}>
                    {isArabicMode
                      ? selectedToken.tarkibWord.relationshipLabelAr
                      : selectedToken.tarkibWord.relationshipLabelBn}
                    :
                  </span>
                  {selectedToken.tarkibWord.linkedIndices.map((li) => {
                    const p = selectedToken.tarkibResult.words[li];
                    return p ? (
                      <span
                        key={li}
                        className="font-arabic font-bold underline decoration-dotted"
                        dir="rtl"
                      >
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
              <strong className="text-[var(--accent)]">
                {isArabicMode ? 'الصَّرْفُ: ' : 'ছরফ: '}
              </strong>
              {localizeGrammarLabel(selectedToken.detail.sarfBn, grammarTerminologyMode)}
            </p>
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--accent)]">
                {isArabicMode ? 'النَّحْوُ: ' : 'নাহু: '}
              </strong>
              {localizeGrammarLabel(selectedToken.detail.nahwBn, grammarTerminologyMode)}
            </p>
          </div>

          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <span className="text-[10px] text-[var(--text-muted)]">
              আয়াত {activeSurah.surahNumber}:{selectedToken.ayahNumber}
            </span>
            <button
              type="button"
              onClick={() => {
                const targetAyah = selectedToken.ayahNumber;
                setSelectedToken(null);
                setSelectedTarkibAyahNum(targetAyah);
                setActiveTab('tarkib');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold btn-primary shrink-0"
            >
              <GitBranch className="w-3 h-3" />
              <span>তারকিব ট্রি</span>
            </button>
          </div>
        </FloatingWordPortal>
      )}

      {showPdfSheet && (
        <div
          style={{
            position: 'fixed',
            left: '-12000px',
            top: 0,
            width: '794px',
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <div
            ref={pdfSheetRef}
            style={{
              width: '794px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '28px',
            }}
            className="space-y-6"
          >
            <div
              style={{
                borderBottom: '2px solid #047857',
                paddingBottom: '14px',
              }}
              className="flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>
                  সূরা নং {activeSurah.surahNumber} · {activeSurah.revelationTypeBn} · {activeSurah.verses.length} আয়াত
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {activeSurah.nameBn} ({activeSurah.nameEn})
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                  {activeSurah.summaryBn}
                </div>
              </div>
              <div
                dir="rtl"
                className="font-arabic shrink-0"
                style={{ fontSize: '28px', fontWeight: 700, color: '#065f46' }}
              >
                {activeSurah.nameAr}
              </div>
            </div>

            <div className="space-y-3">
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46' }}>
                আয়াতসমূহ ও বঙ্গানুবাদ
              </div>
              <div className="space-y-3">
                {activeSurah.verses.map((v) => {
                  const ayahNote = surahGrammar?.ayat?.[v.ayahNumber];
                  return (
                    <div
                      key={v.ayahNumber}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                      }}
                      className="space-y-1.5"
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>
                        আয়াত {activeSurah.surahNumber}:{v.ayahNumber}
                      </div>
                      <p
                        dir="rtl"
                        className="font-arabic"
                        style={{ fontSize: '22px', lineHeight: 1.9, color: '#0f172a' }}
                      >
                        {v.arabic}
                      </p>
                      <p style={{ fontSize: '12px', color: '#475569' }}>
                        উচ্চারণ: {v.pronunciationBn}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.6 }}>
                        অর্থ: {v.translationBn}
                      </p>
                      {ayahNote && (
                        <div
                          style={{
                            borderTop: '1px dashed #cbd5e1',
                            paddingTop: '6px',
                            marginTop: '6px',
                            fontSize: '11.5px',
                            color: '#334155',
                            lineHeight: 1.55,
                          }}
                          className="space-y-1"
                        >
                          <div>
                            <strong style={{ color: '#047857' }}>নাহু: </strong>
                            {localizeGrammarLabel(ayahNote.nahwBn, grammarTerminologyMode)}
                          </div>
                          <div>
                            <strong style={{ color: '#047857' }}>ছরফ: </strong>
                            {localizeGrammarLabel(ayahNote.sarfBn, grammarTerminologyMode)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {activeSurah.keyWords.length > 0 && (
              <div className="space-y-2">
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#065f46' }}>
                  গুরুত্বপূর্ণ কুরআনিক শব্দ ও মূলধাতু ({activeSurah.keyWords.length}টি)
                </div>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>শব্দ</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>উচ্চারণ ও অর্থ</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>মূলধাতু ও ব্যাকরণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSurah.keyWords.map((kw, idx) => (
                      <tr key={`${kw.arabic}-${idx}`}>
                        <td
                          dir="rtl"
                          className="font-arabic"
                          style={{
                            border: '1px solid #cbd5e1',
                            padding: '6px 8px',
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#065f46',
                          }}
                        >
                          {kw.arabic}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>
                          <div style={{ fontWeight: 700 }}>{kw.meaningBn}</div>
                          <div style={{ fontSize: '11px', color: '#475569' }}>{kw.pronunciationBn}</div>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontSize: '11.5px' }}>
                          <div>
                            মূলধাতু: <span className="font-arabic">{kw.root}</span>
                          </div>
                          <div style={{ color: '#475569' }}>
                            {localizeGrammarLabel(kw.grammarNoteBn, grammarTerminologyMode)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {surahGrammar && (
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                }}
                className="space-y-1.5"
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                  {localizeGrammarLabel(surahGrammar.overviewTitleBn, grammarTerminologyMode)}
                </div>
                <p style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.65 }}>
                  {localizeGrammarLabel(surahGrammar.overviewBn, grammarTerminologyMode)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
};
