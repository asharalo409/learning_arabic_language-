import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  FileText,
  Flame,
  Heart,
  Layers,
  List,
  PartyPopper,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { CelebrationConfetti } from '../components/CelebrationConfetti';
import { QuickNahwText } from '../components/QuickNahwText';
import { useApp } from '../context/AppContext';
import { computeSm2Next, Sm2Quality } from '../data/curriculumVocabDeck';
import { CurriculumLevelNumber, VocabDeckStatus } from '../types/academy';
import { computeVocabDeckSummary, resolveVocabStatus } from '../utils/vocabStatus';
import {
  removeVocabularyOffline,
  saveAllVocabularyOffline,
  useOfflineManifest,
} from '../utils/offlineCache';
import {
  exportVocabToAnkiTsv,
  exportVocabToPrintableHtml,
  exportVocabToPrintablePdf,
} from '../utils/vocabExport';

const LEVEL_RANGES: { level: CurriculumLevelNumber; labelBn: string; labelEn: string }[] = [
  { level: 1, labelBn: 'স্তর ১ (অধ্যায় ১–১৬)', labelEn: 'Lv.1 (Ch 1–16)' },
  { level: 2, labelBn: 'স্তর ২ (অধ্যায় ১৭–৩৩)', labelEn: 'Lv.2 (Ch 17–33)' },
  { level: 3, labelBn: 'স্তর ৩ (অধ্যায় ৩৪–৫০)', labelEn: 'Lv.3 (Ch 34–50)' },
  { level: 4, labelBn: 'স্তর ৪ (অধ্যায় ৫১–৬৭)', labelEn: 'Lv.4 (Ch 51–67)' },
  { level: 5, labelBn: 'স্তর ৫ (অধ্যায় ৬৮–৮৪)', labelEn: 'Lv.5 (Ch 68–84)' },
  { level: 6, labelBn: 'স্তর ৬ (অধ্যায় ৮৫–১০০)', labelEn: 'Lv.6 (Ch 85–100)' },
];

export const VocabularyPage: React.FC = () => {
  const { t, lang, allVocabulary, progress, reviewVocabWord, setVocabStatus, toggleFavoriteVocab, triggerSound } =
    useApp();
  const offlineManifest = useOfflineManifest();
  const [savingVocabOffline, setSavingVocabOffline] = useState(false);

  const effectiveVocabulary = useMemo(() => {
    if (allVocabulary.length > 0) return allVocabulary;
    return offlineManifest.vocabSnapshot || [];
  }, [allVocabulary, offlineManifest.vocabSnapshot]);

  const isVocabSavedOffline = Boolean(offlineManifest.vocabularySavedAt);

  const handleToggleVocabOffline = async () => {
    setSavingVocabOffline(true);
    try {
      if (isVocabSavedOffline) {
        await removeVocabularyOffline();
      } else {
        await saveAllVocabularyOffline(effectiveVocabulary);
        triggerSound('success');
      }
    } finally {
      setSavingVocabOffline(false);
    }
  };

  const [viewMode, setViewMode] = useState<'flashcards' | 'list'>('flashcards');
  const [queueFilter, setQueueFilter] = useState<'due' | 'all' | 'favorites' | 'learning' | 'mastered' | 'review'>('due');
  const [levelFilter, setLevelFilter] = useState<CurriculumLevelNumber | 'all'>('all');
  const [search, setSearch] = useState('');

  // Interactive Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [celebrateDeckClear, setCelebrateDeckClear] = useState(false);

  // Export Panel State (PDF / Anki)
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportScope, setExportScope] = useState<'learned' | 'favorites' | 'filtered'>('learned');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const isBn = lang === 'bn';

  const deckSummary = useMemo(
    () => computeVocabDeckSummary(effectiveVocabulary, progress.vocabProgress),
    [effectiveVocabulary, progress.vocabProgress]
  );

  const srsStats = useMemo(() => {
    const now = Date.now();
    let due = 0;
    effectiveVocabulary.forEach((w) => {
      const rec = progress.vocabProgress[w.id];
      if (!rec || new Date(rec.nextReviewIso).getTime() <= now) {
        due += 1;
      }
    });
    return {
      total: effectiveVocabulary.length,
      due,
      mastered: deckSummary.mastered,
      learning: deckSummary.learning,
      review: deckSummary.review,
    };
  }, [deckSummary, effectiveVocabulary, progress.vocabProgress]);

  const filteredWords = useMemo(() => {
    const now = Date.now();
    return effectiveVocabulary
      .filter((w) => {
        if (levelFilter !== 'all' && w.level !== levelFilter) return false;
        const rec = progress.vocabProgress[w.id];
        if (queueFilter === 'favorites' && !rec?.favorite) return false;
        if (queueFilter === 'due' && rec && new Date(rec.nextReviewIso).getTime() > now) {
          return false;
        }
        if (queueFilter === 'learning' && (!rec || resolveVocabStatus(rec) !== 'learning')) {
          return false;
        }
        if (queueFilter === 'mastered' && (!rec || resolveVocabStatus(rec) !== 'mastered')) {
          return false;
        }
        if (queueFilter === 'review' && (!rec || resolveVocabStatus(rec) !== 'review')) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            w.arabic.includes(search) ||
            w.meaningBn.toLowerCase().includes(q) ||
            w.meaningEn.toLowerCase().includes(q) ||
            w.pronunciationBn.toLowerCase().includes(q) ||
            (w.chapterTitleBn || '').toLowerCase().includes(q) ||
            String(w.chapterNumber || '').includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Prioritize overdue or unreviewed cards first inside flashcard mode
        const recA = progress.vocabProgress[a.id];
        const recB = progress.vocabProgress[b.id];
        const dueA = recA ? new Date(recA.nextReviewIso).getTime() : 0;
        const dueB = recB ? new Date(recB.nextReviewIso).getTime() : 0;
        if (dueA !== dueB) return dueA - dueB;
        return (a.chapterNumber || 1) - (b.chapterNumber || 1);
      });
  }, [effectiveVocabulary, levelFilter, progress.vocabProgress, queueFilter, search]);

  const learnedWords = useMemo(
    () => effectiveVocabulary.filter((w) => Boolean(progress.vocabProgress[w.id])),
    [effectiveVocabulary, progress.vocabProgress]
  );

  const favoriteWords = useMemo(
    () => effectiveVocabulary.filter((w) => Boolean(progress.vocabProgress[w.id]?.favorite)),
    [effectiveVocabulary, progress.vocabProgress]
  );

  const exportTargetItems = useMemo(() => {
    if (exportScope === 'learned') return learnedWords;
    if (exportScope === 'favorites') return favoriteWords;
    return filteredWords;
  }, [exportScope, favoriteWords, filteredWords, learnedWords]);

  const handleRunExport = (format: 'anki' | 'pdf' | 'html') => {
    setExportFeedback(null);
    const items = exportTargetItems;
    if (items.length === 0) {
      setExportFeedback(
        exportScope === 'learned'
          ? 'এখনো কোনো শব্দ শেখা/রিভিউ করা হয়নি। ফ্ল্যাশকার্ড চর্চা করুন অথবা "বর্তমান তালিকা" বেছে নিন।'
          : exportScope === 'favorites'
          ? 'প্রিয় তালিকায় কোনো শব্দ যোগ করা হয়নি।'
          : 'বর্তমান ফিল্টারে কোনো শব্দ নেই।'
      );
      return;
    }

    const titleMap = {
      learned: 'শেখা ও রিভিউকৃত আরবি শব্দভাণ্ডার',
      favorites: 'প্রিয় আরবি শব্দভাণ্ডার',
      filtered: 'ফিল্টারকৃত আরবি শব্দভাণ্ডার',
    };

    if (format === 'anki') {
      const count = exportVocabToAnkiTsv(items, exportScope);
      triggerSound('success');
      setExportFeedback(`${count}টি শব্দের Anki (.txt) ফ্ল্যাশকার্ড ডেক ডাউনলোড শুরু হয়েছে!`);
    } else if (format === 'pdf') {
      exportVocabToPrintablePdf(items, titleMap[exportScope]);
      triggerSound('success');
      setExportFeedback(
        `${items.length}টি শব্দের PDF প্রিন্ট ডায়ালগ খোলা হয়েছে ("Save as PDF" নির্বাচন করে সেভ করুন)।`
      );
    } else {
      const count = exportVocabToPrintableHtml(items, titleMap[exportScope], exportScope);
      triggerSound('success');
      setExportFeedback(`${count}টি শব্দের অফলাইন প্রিন্টযোগ্য HTML শিট ডাউনলোড হয়েছে!`);
    }
  };

  const activeCard =
    filteredWords.length > 0 ? filteredWords[cardIndex % filteredWords.length] : undefined;
  const activeRecord = activeCard ? progress.vocabProgress[activeCard.id] : undefined;

  const intervalPreviews = useMemo(() => {
    const formatDays = (days: number) => {
      if (days <= 0) return isBn ? 'এখনই' : 'Now';
      if (days === 1) return isBn ? '১ দিন' : '1 day';
      return isBn ? `${days} দিন` : `${days} days`;
    };
    return {
      again: formatDays(computeSm2Next(activeRecord, 'again').intervalDays),
      hard: formatDays(computeSm2Next(activeRecord, 'hard').intervalDays),
      good: formatDays(computeSm2Next(activeRecord, 'good').intervalDays),
      easy: formatDays(computeSm2Next(activeRecord, 'easy').intervalDays),
    };
  }, [activeRecord, isBn]);

  const handleReview = useCallback(
    (quality: Sm2Quality) => {
      if (!activeCard) return;
      const wasLastDue = queueFilter === 'due' && filteredWords.length === 1 && quality !== 'again';
      reviewVocabWord(activeCard.id, quality);
      setFlipped(false);
      setSessionReviewed((c) => c + 1);
      if (queueFilter === 'due' && quality !== 'again') {
        setCardIndex(0);
      } else {
        setCardIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
      }
      if (wasLastDue) {
        triggerSound('badge');
        setCelebrateDeckClear(true);
      }
    },
    [activeCard, filteredWords.length, queueFilter, reviewVocabWord, triggerSound]
  );

  // Keyboard shortcuts for Flashcard studio (Space flips, 1-4 grades)
  useEffect(() => {
    if (viewMode !== 'flashcards' || !activeCard) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        if (e.key === '1') handleReview('again');
        else if (e.key === '2') handleReview('hard');
        else if (e.key === '3') handleReview('good');
        else if (e.key === '4') handleReview('easy');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCard, flipped, handleReview, viewMode]);

  return (
    <AppShell
      title={t.sidebar.vocabulary}
      subtitle={
        isBn
          ? `১০০ অধ্যায়ের শব্দভাণ্ডার · স্পেসড রিপিটেশন (SM-2) ফ্ল্যাশকার্ড (বাকি: ${srsStats.due}টি)`
          : `100-Chapter Curriculum Vocabulary · SM-2 Spaced Repetition (${srsStats.due} due)`
      }
    >
      <CelebrationConfetti
        active={celebrateDeckClear}
        onComplete={() => setCelebrateDeckClear(false)}
      />

      <div className="space-y-5">
        {/* Vibrant Top SRS Summary Banner + One-Tap Offline Download */}
        <div
          className="rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 55%, #059669 100%)' }}
        >
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isBn
                  ? '১০০-অধ্যায় পাঠ্যক্রমের স্মার্ট ফ্ল্যাশকার্ড (SM-2 SRS)'
                  : '100-Chapter SM-2 Spaced Repetition Deck'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {isBn
                ? `মোট ${srsStats.total}টি পাঠ্যক্রমের শব্দ · আজকের রিভিউ বাকি ${srsStats.due}টি`
                : `${srsStats.total} Curriculum Words · ${srsStats.due} Due Today`}
            </h2>
            {(progress.personalVocab?.length || 0) > 0 && (
              <p className="text-xs text-emerald-100 font-semibold">
                {isBn
                  ? `পড়া ও অনুশীলন থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত ${progress.personalVocab?.length}টি নতুন শব্দ যুক্ত হয়েছে`
                  : `${progress.personalVocab?.length} newly encountered words auto-registered from lessons`}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => void handleToggleVocabOffline()}
                disabled={savingVocabOffline}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  isVocabSavedOffline
                    ? 'bg-emerald-950/50 text-emerald-200 border border-emerald-300/40'
                    : 'bg-white text-indigo-950 hover:bg-indigo-50 shadow'
                }`}
              >
                {isVocabSavedOffline ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>শব্দভাণ্ডার অফলাইনে সংরক্ষিত</span>
                    <Trash2 className="w-3 h-3 opacity-75 ms-0.5" />
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{savingVocabOffline ? 'ডাউনলোড হচ্ছে...' : 'সব শব্দ অফলাইন ডাউনলোড করুন'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportPanel((v) => !v);
                  setExportFeedback(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/25 hover:bg-black/35 text-white border border-white/25 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-300" />
                <span>PDF / Anki এক্সপোর্ট</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center shrink-0">
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/25 backdrop-blur-sm">
              <div className="text-lg font-extrabold font-mono-num">{srsStats.due}</div>
              <div className="text-[10px] text-white/80">{isBn ? 'রিভিউ বাকি' : 'Due'}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/25 backdrop-blur-sm">
              <div className="text-lg font-extrabold font-mono-num text-emerald-200">
                {srsStats.mastered}
              </div>
              <div className="text-[10px] text-white/80">{isBn ? 'আয়ত্তকৃত' : 'Mastered'}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/25 backdrop-blur-sm">
              <div className="text-lg font-extrabold font-mono-num text-amber-200">
                {sessionReviewed}
              </div>
              <div className="text-[10px] text-white/80">{isBn ? 'আজ চর্চিত' : 'Session'}</div>
            </div>
          </div>
        </div>

        {/* Expandable PDF & Anki Export Studio */}
        {showExportPanel && (
          <div className="surface-card rounded-3xl p-5 sm:p-6 border border-[var(--border-strong)] shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                  <FileDown className="w-4 h-4" />
                  <span>অফলাইন রিভিউয়ের জন্য এক্সপোর্ট (PDF ও Anki ডেক)</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  আপনার শেখা শব্দ বা কাস্টম তালিকা PDF আকারে সংরক্ষণ করুন অথবা Anki Desktop / AnkiDroid-এ সরাসরি ইমপোর্ট করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportPanel(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary"
              >
                বন্ধ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'learned', label: `শেখা ও রিভিউকৃত (${learnedWords.length})` },
                  { id: 'favorites', label: `প্রিয় শব্দ (${favoriteWords.length})` },
                  { id: 'filtered', label: `বর্তমান তালিকা (${filteredWords.length})` },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setExportScope(opt.id);
                    setExportFeedback(null);
                  }}
                  className={`py-2.5 px-3.5 rounded-2xl text-xs font-bold border transition-colors text-left font-mono-num ${
                    exportScope === opt.id
                      ? 'btn-primary border-transparent shadow-sm'
                      : 'surface-alt border-[var(--border-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleRunExport('pdf')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold btn-primary shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>PDF হিসেবে সেভ / প্রিন্ট করুন</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('anki')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold btn-secondary"
              >
                <Layers className="w-4 h-4 text-[var(--accent)]" />
                <span>Anki ডেক (.txt) ডাউনলোড</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('html')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold btn-secondary"
              >
                <FileText className="w-4 h-4 text-[var(--accent)]" />
                <span>অফলাইন স্টাডি শিট (.html)</span>
              </button>
            </div>

            {exportFeedback && (
              <div className="p-3 rounded-xl bg-[var(--emerald-highlight)] border border-[var(--accent)]/35 text-xs font-semibold text-[var(--accent)]">
                {exportFeedback}
              </div>
            )}
          </div>
        )}

        {/* Unboxed Filter Strip (Zero heavy wrapper) */}
        <div className="space-y-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-full surface-alt border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setViewMode('flashcards');
                  setFlipped(false);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'flashcards' ? 'btn-primary shadow-sm' : 'text-[var(--text-secondary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isBn ? 'SRS ফ্ল্যাশকার্ড' : 'SRS Flashcards'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'btn-primary shadow-sm' : 'text-[var(--text-secondary)]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{isBn ? 'শব্দ তালিকা' : 'Word Directory'}</span>
              </button>
            </div>

            {/* Queue & Deck Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setQueueFilter('due');
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'due' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {isBn ? `বাকি রিভিউ (${srsStats.due})` : `Due Queue (${srsStats.due})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueueFilter('learning');
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'learning'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'btn-secondary'
                }`}
              >
                Learning ({srsStats.learning})
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueueFilter('mastered');
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'btn-secondary'
                }`}
              >
                Mastered ({srsStats.mastered})
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueueFilter('review');
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'review'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'btn-secondary'
                }`}
              >
                Review ({srsStats.review})
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueueFilter('all');
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'all' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {isBn ? `সকল শব্দ (${srsStats.total})` : `All (${srsStats.total})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueueFilter('favorites');
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'favorites' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{isBn ? 'প্রিয়' : 'Favorites'}</span>
              </button>
            </div>
          </div>

          {/* Search & 6-Level Chapter Range Chips */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCardIndex(0);
                }}
                placeholder={
                  isBn
                    ? 'আরবি, বাংলা অর্থ বা অধ্যায় নম্বর খুঁজুন (যেমন: ১৪, কিতাব)...'
                    : 'Search Arabic, Bengali meaning, or chapter number...'
                }
                className="w-full ps-10 pe-4 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setLevelFilter('all');
                  setCardIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  levelFilter === 'all' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {isBn ? 'সকল স্তর' : 'All Levels'}
              </button>
              {LEVEL_RANGES.map((lvl) => (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => {
                    setLevelFilter(lvl.level);
                    setCardIndex(0);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap ${
                    levelFilter === lvl.level ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {isBn ? lvl.labelBn : lvl.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Flashcard SM-2 Mode */}
        {viewMode === 'flashcards' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {activeCard ? (
              <div className="surface-card rounded-3xl p-6 sm:p-8 border border-[var(--border-strong)] shadow-lg space-y-6">
                {/* Top Card Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {activeCard.chapterNumber && (
                      <Link
                        to={`/courses/chapter/${activeCard.chapterNumber}`}
                        className="px-2.5 py-1 rounded-full bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 font-bold hover:underline"
                      >
                        {isBn
                          ? `অধ্যায় ${activeCard.chapterNumber} · স্তর ${activeCard.level || 1}`
                          : `Ch. ${activeCard.chapterNumber} · Lv.${activeCard.level || 1}`}
                      </Link>
                    )}
                    <span className="text-[var(--text-muted)] font-medium truncate max-w-[190px]">
                      {activeCard.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono-num text-[var(--text-muted)] font-semibold">
                      {(cardIndex % filteredWords.length) + 1} / {filteredWords.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFavoriteVocab(activeCard.id)}
                      aria-label="Toggle Favorite"
                      className="p-1.5 rounded-lg btn-secondary"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          activeRecord?.favorite
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-[var(--text-muted)]'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Flashcard Surface (Tap to Flip) */}
                <div
                  onClick={() => setFlipped((f) => !f)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFlipped((f) => !f);
                    }
                  }}
                  className="rounded-3xl surface-alt border border-[var(--border-subtle)] hover:border-[var(--accent)] p-6 sm:p-8 text-center cursor-pointer transition-all space-y-4 select-none"
                >
                  <div
                    className="flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">
                      {isBn ? 'শব্দের বিশুদ্ধ আরবি উচ্চারণ:' : 'Arabic Pronunciation:'}
                    </span>
                    <AudioButton text={activeCard.arabic} showSlow />
                  </div>

                  <p className="font-arabic text-4xl sm:text-6xl text-[var(--accent)] leading-relaxed pt-1" dir="rtl">
                    {activeCard.arabic}
                  </p>

                  {activeCard.root && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg surface-card border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                      <span>{isBn ? 'মূল / সূত্র:' : 'Root / Note:'}</span>
                      <span className="font-arabic-ui font-semibold text-[var(--text-primary)]">
                        {activeCard.root}
                      </span>
                    </div>
                  )}

                  {!flipped && (
                    <div className="pt-2 text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>
                        {isBn
                          ? 'অর্থ ও উদাহরণ দেখতে কার্ডে চাপুন (অথবা Space)'
                          : 'Tap card or press Space to reveal answer'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Audio Toolbar & Explicit Deck Status Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <AudioButton text={activeCard.arabic} showSlow />

                  <div className="inline-flex items-center gap-1 p-1 rounded-xl surface-alt border border-[var(--border-subtle)] text-[11px]">
                    {(['learning', 'mastered', 'review'] as VocabDeckStatus[]).map((st) => {
                      const currentSt = activeRecord ? resolveVocabStatus(activeRecord) : null;
                      const isCurrent = currentSt === st;
                      const activeStyle =
                        st === 'mastered'
                          ? 'bg-emerald-600 text-white'
                          : st === 'review'
                          ? 'bg-amber-600 text-white'
                          : 'bg-sky-600 text-white';
                      const label = st === 'mastered' ? 'Mastered' : st === 'review' ? 'Review' : 'Learning';
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setVocabStatus(activeCard.id, st)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                            isCurrent ? activeStyle : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[11px] font-mono-num text-[var(--text-muted)]">
                    {activeRecord
                      ? `Ease ${activeRecord.ease.toFixed(2)} · Reps ${activeRecord.repetitions}`
                      : isBn
                      ? 'নতুন কার্ড'
                      : 'New Card'}
                  </div>
                </div>

                {/* Flip Reveal / SM-2 4-Button Recall Bar */}
                {!flipped ? (
                  <button
                    type="button"
                    onClick={() => setFlipped(true)}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold btn-primary shadow-md"
                  >
                    {isBn ? 'উত্তর ও বাক্যের উদাহরণ দেখুন' : 'Flip Card & Reveal Meaning'}
                  </button>
                ) : (
                  <div className="space-y-5 pt-4 border-t border-[var(--border-subtle)] animate-fade-in">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-[var(--text-muted)]">
                        {isBn ? 'উচ্চারণ:' : 'Pronunciation:'} {activeCard.pronunciationBn}
                      </p>
                      <p className="text-2xl font-extrabold text-[var(--text-primary)]">
                        {activeCard.meaningBn}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">{activeCard.meaningEn}</p>
                    </div>

                    <div className="surface-alt rounded-2xl p-4 space-y-2 border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[var(--accent)]">
                          {isBn ? 'পাঠ্যক্রমের বাক্যে প্রয়োগ (শব্দে চাপলে ব্যাকরণ):' : 'Context Example:'}
                        </span>
                        <AudioButton text={activeCard.exampleAr} compact showSlow={false} />
                      </div>
                      <QuickNahwText
                        text={activeCard.exampleAr}
                        className="font-arabic text-xl text-[var(--text-primary)] text-right"
                      />
                      <p className="text-xs text-[var(--text-secondary)]">{activeCard.exampleBn}</p>
                    </div>

                    {/* 4-Grade SM-2 Rating Controls */}
                    <div className="space-y-2">
                      <div className="text-center text-[11px] font-medium text-[var(--text-muted)]">
                        {isBn
                          ? 'মনে রাখার মান অনুযায়ী বেছে নিন (SM-2 পরবর্তী রিভিউ নির্ধারণ করবে):'
                          : 'Rate recall quality to schedule next SM-2 interval:'}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview('again')}
                          className="p-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-center transition-colors"
                        >
                          <div className="text-xs font-extrabold inline-flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            <span>{isBn ? 'আবার' : 'Again'}</span>
                          </div>
                          <div className="text-[10px] opacity-80 font-mono-num mt-0.5">
                            {intervalPreviews.again}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReview('hard')}
                          className="p-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-center transition-colors"
                        >
                          <div className="text-xs font-extrabold">{isBn ? 'কঠিন' : 'Hard'}</div>
                          <div className="text-[10px] opacity-80 font-mono-num mt-0.5">
                            {intervalPreviews.hard}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReview('good')}
                          className="p-2.5 rounded-2xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-center transition-colors"
                        >
                          <div className="text-xs font-extrabold">{isBn ? 'মনে আছে' : 'Good'}</div>
                          <div className="text-[10px] opacity-80 font-mono-num mt-0.5">
                            {intervalPreviews.good}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReview('easy')}
                          className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-center shadow-sm transition-colors"
                        >
                          <div className="text-xs font-extrabold inline-flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{isBn ? 'খুব সহজ' : 'Easy'}</span>
                          </div>
                          <div className="text-[10px] text-emerald-100 font-mono-num mt-0.5">
                            {intervalPreviews.easy}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="surface-card rounded-3xl p-8 sm:p-10 text-center space-y-4 border border-[var(--border-strong)]">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  {queueFilter === 'due' ? (
                    <PartyPopper className="w-7 h-7" />
                  ) : (
                    <BookOpen className="w-7 h-7" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">
                    {queueFilter === 'due'
                      ? isBn
                        ? 'মাশাআল্লাহ! এই মুহূর্তের সব রিভিউ সম্পন্ন হয়েছে!'
                        : 'All due flashcards reviewed!'
                      : isBn
                      ? 'এই ফিল্টারে কোনো শব্দ পাওয়া যায়নি'
                      : 'No words match this filter'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    {queueFilter === 'due'
                      ? isBn
                        ? 'আপনার ১০০-অধ্যায়ের নির্ধারিত শব্দগুলো রিভিউ হয়ে গেছে। অতিরিক্ত চর্চার জন্য "সকল শব্দ" মোডে পড়তে পারেন।'
                        : 'Switch to "All Words" if you would like to practice ahead.'
                      : isBn
                      ? 'অনুগ্রহ করে স্তর ফিল্টার বা অনুসন্ধান পরিবর্তন করে দেখুন।'
                      : 'Try adjusting the level filter or search term.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQueueFilter('all');
                      setLevelFilter('all');
                      setSearch('');
                      setCardIndex(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold btn-primary"
                  >
                    <span>{isBn ? 'সকল শব্দ দিয়ে অনুশীলন করুন' : 'Practice All Words'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Word Directory List (Open, Unboxed Divider Layout) */}
        {viewMode === 'list' && (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredWords.length === 0 && (
              <div className="py-10 text-center text-base text-[var(--text-muted)]">
                {isBn
                  ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো শব্দ পাওয়া যায়নি।'
                  : 'No words found matching your filters.'}
              </div>
            )}

            {filteredWords.map((word) => {
              const rec = progress.vocabProgress[word.id];
              const isFav = Boolean(rec?.favorite);
              const isDue = !rec || new Date(rec.nextReviewIso).getTime() <= Date.now();
              return (
                <article key={word.id} className="py-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {word.chapterNumber && (
                          <Link
                            to={`/courses/chapter/${word.chapterNumber}`}
                            className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/12 text-[var(--accent)] font-bold hover:underline"
                          >
                            অধ্যায় {word.chapterNumber}
                          </Link>
                        )}
                        <span className="text-[var(--text-muted)] truncate">{word.category}</span>
                      </div>
                      <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)] pt-1" dir="rtl">
                        {word.arabic}
                      </p>
                      <div className="text-sm text-[var(--text-muted)]">
                        উচ্চারণ:{' '}
                        <span className="font-semibold text-[var(--text-primary)]">
                          {word.pronunciationBn}
                        </span>
                      </div>
                      {word.root && (
                        <div className="text-sm text-[var(--text-muted)]">
                          সূত্র/মূলধাতু:{' '}
                          <span className="font-arabic-ui text-[var(--text-secondary)]">
                            {word.root}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteVocab(word.id)}
                        aria-label="Toggle Favorite"
                        className="p-2 rounded-full btn-secondary"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-[var(--text-muted)]'
                          }`}
                        />
                      </button>
                      <AudioButton text={word.arabic} compact showSlow={false} />
                    </div>
                  </div>

                  <div className="text-[15.5px] sm:text-base space-y-0.5">
                    <div>
                      <span className="text-sm text-[var(--text-muted)]">বাংলা অর্থ: </span>
                      <span className="font-extrabold text-[var(--text-primary)]">{word.meaningBn}</span>
                      <span className="text-sm text-[var(--text-secondary)] ms-2">({word.meaningEn})</span>
                    </div>
                  </div>

                  <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--accent)]">
                        {isBn ? 'বাক্যে উদাহরণ:' : 'Example:'}
                      </span>
                      <AudioButton text={word.exampleAr} compact showSlow={false} />
                    </div>
                    <QuickNahwText
                      text={word.exampleAr}
                      className="font-arabic text-xl text-right"
                    />
                    <p className="text-[15px] text-[var(--text-secondary)]">{word.exampleBn}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] pt-1">
                    <span className="inline-flex items-center gap-1">
                      {rec ? (
                        <>
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              isDue ? 'text-amber-500' : 'text-emerald-500'
                            }`}
                          />
                          <span className="font-mono-num">
                            {isDue
                              ? `রিভিউ বাকি (${rec.repetitions} বার চর্চিত)`
                              : `পরবর্তী রিভিউ: ${rec.intervalDays} দিন পর`}
                          </span>
                        </>
                      ) : (
                        'এখনো রিভিউ করা হয়নি'
                      )}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg surface-alt border border-[var(--border-subtle)] text-[11px]">
                        {(['learning', 'mastered', 'review'] as VocabDeckStatus[]).map((st) => {
                          const currentSt = rec ? resolveVocabStatus(rec) : null;
                          const isCurrent = currentSt === st;
                          const activeStyle =
                            st === 'mastered'
                              ? 'bg-emerald-600 text-white'
                              : st === 'review'
                              ? 'bg-amber-600 text-white'
                              : 'bg-sky-600 text-white';
                          const label = st === 'mastered' ? 'Mastered' : st === 'review' ? 'Review' : 'Learning';
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setVocabStatus(word.id, st)}
                              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                                isCurrent ? activeStyle : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => reviewVocabWord(word.id, 'good')}
                        className="text-[var(--accent)] font-bold hover:underline"
                      >
                        + মনে আছে (+১০ XP)
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};
