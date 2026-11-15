import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Bot,
  CheckCircle2,
  Download,
  GitBranch,
  Home,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  NotebookPen,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { GeminiRichText } from '../components/GeminiRichText';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { QuickNahwText } from '../components/QuickNahwText';
import { TarkibVisualizer } from '../components/TarkibVisualizer';
import { useApp } from '../context/AppContext';
import { buildDetailedLessonForSlot } from '../data/lessonGenerator';
import { DetailedLesson } from '../types/academy';
import { localizeGrammarLabel } from '../utils/grammarTerminology';
import { getDeduplicatedCurriculumLessonVocab } from '../utils/lessonVocabDedupe';
import { buildSegmentsFromDetailedLesson } from '../utils/vocabAutoSync';
import {
  getOfflineLesson,
  removeLessonOffline,
  saveLessonOffline,
  useOfflineManifest,
} from '../utils/offlineCache';
import { RecognitionHandle, startContinuousSpeechRecognition } from '../utils/speech';

type LessonTab = 'overview' | 'vocab' | 'grammar' | 'dialogue' | 'practice' | 'quiz' | 'ai-practice';

const LESSON_NOTES_KEY = 'aaa_lesson_notes_v1';

interface LessonNoteEntry {
  text: string;
  updatedAt: string;
}

function readAllLessonNotes(): Record<string, LessonNoteEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LESSON_NOTES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LessonNoteEntry>) : {};
  } catch {
    return {};
  }
}

function saveLessonNoteToStorage(lessonId: string, text: string): string {
  const nowIso = new Date().toISOString();
  try {
    const map = readAllLessonNotes();
    if (!text.trim()) {
      delete map[lessonId];
    } else {
      map[lessonId] = { text, updatedAt: nowIso };
    }
    localStorage.setItem(LESSON_NOTES_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
  return nowIso;
}

export const LessonDetailPage: React.FC = () => {
  const { chapterNumber, lessonNumber } = useParams<{ chapterNumber: string; lessonNumber: string }>();
  const {
    t,
    lang,
    progress,
    allChapters,
    allDetailedLessons,
    completeLesson,
    toggleFavoriteLesson,
    recordLastLesson,
    awardXp,
    triggerSound,
    syncMissingVocabFromSegments,
    grammarTerminologyMode,
    setGrammarTerminologyMode,
  } = useApp();
  const offlineManifest = useOfflineManifest();
  const syncedLessonsRef = useRef<Set<string>>(new Set());

  const chNum = Math.max(1, Math.min(100, Number(chapterNumber) || 1));
  const lsNum = Math.max(1, Math.min(10, Number(lessonNumber) || 1));

  const chapter = allChapters.find((c) => c.chapterNumber === chNum) || allChapters[0];
  const lessonId = `ch${chapter.chapterNumber}-l${lsNum}`;

  const activeLesson: DetailedLesson = useMemo(() => {
    return (
      allDetailedLessons[lessonId] ||
      getOfflineLesson(lessonId) ||
      buildDetailedLessonForSlot(chapter, lsNum)
    );
  }, [allDetailedLessons, lessonId, chapter, lsNum]);

  const isSavedOffline = offlineManifest.downloadedLessonIds.includes(activeLesson.id);

  const [activeTab, setActiveTab] = useState<LessonTab>('overview');
  const [nahwTipsEnabled, setNahwTipsEnabled] = useState(true);
  const [writingAnswer, setWritingAnswer] = useState('');
  const [aiWritingFeedback, setAiWritingFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [revealedTransIdx, setRevealedTransIdx] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [listeningMic, setListeningMic] = useState(false);
  const [savingOffline, setSavingOffline] = useState(false);
  const [expandedExampleTarkib, setExpandedExampleTarkib] = useState<number | null>(null);
  const [distractionFree, setDistractionFree] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);
  const micRecRef = useRef<RecognitionHandle | null>(null);
  const notesPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveTab('overview');
    setWritingAnswer('');
    setAiWritingFeedback(null);
    setRevealedTransIdx([]);
    setQuizAnswers({});
    micRecRef.current?.stop();
    setListeningMic(false);
    const saved = readAllLessonNotes()[lessonId];
    setNoteText(saved?.text || '');
    setNoteSavedAt(saved?.updatedAt || null);
    recordLastLesson(lessonId);
    window.scrollTo({ top: 0 });
  }, [chNum, lsNum, lessonId, recordLastLesson]);

  useEffect(() => {
    if (!distractionFree) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDistractionFree(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [distractionFree]);

  useEffect(() => {
    return () => {
      micRecRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (syncedLessonsRef.current.has(activeLesson.id)) return;
    syncedLessonsRef.current.add(activeLesson.id);
    syncMissingVocabFromSegments(buildSegmentsFromDetailedLesson(activeLesson));
  }, [activeLesson, syncMissingVocabFromSegments]);

  const handleToggleOfflineSave = async () => {
    setSavingOffline(true);
    try {
      if (isSavedOffline) {
        await removeLessonOffline(activeLesson.id);
      } else {
        await saveLessonOffline(activeLesson);
        triggerSound('success');
      }
    } finally {
      setSavingOffline(false);
    }
  };

  const dedupedVocab = useMemo(
    () => getDeduplicatedCurriculumLessonVocab(chNum, lsNum, allChapters, allDetailedLessons),
    [chNum, lsNum, allChapters, allDetailedLessons]
  );

  const lessonScopeContext = useMemo(() => {
    const vocabLines = dedupedVocab.words
      .map((v) => `- ${v.arabic} (${v.pronunciationBn}): ${v.meaningBn}${v.root ? ` [মূলধাতু/নোট: ${v.root}]` : ''}`)
      .join('\n');
    const dialogueSample = activeLesson.conversation
      .slice(0, 6)
      .map((d) => `${d.speaker}: ${d.arabic} (${d.translationBn})`)
      .join('\n');

    return [
      `পাঠ: অধ্যায় ${activeLesson.chapterNumber}, পাঠ ${activeLesson.lessonNumber} — ${activeLesson.titleBn}`,
      `ব্যাকরণ বিষয়: ${activeLesson.grammarTopicBn} (${activeLesson.grammarTopicAr})`,
      `ব্যাকরণ সারসংক্ষেপ: ${activeLesson.grammarExplanationBn}`,
      `এই পাঠের নতুন শব্দভাণ্ডার:\n${vocabLines}`,
      `সংলাপের নমুনা:\n${dialogueSample}`,
    ].join('\n\n');
  }, [activeLesson, dedupedVocab.words]);

  const starterQuestions = useMemo(
    () => [
      `"${activeLesson.titleBn}" পাঠের শব্দগুলো দিয়ে আমাকে ১টি প্রশ্ন করুন।`,
      `এই পাঠের সংলাপ থেকে একটি আরবি বাক্য দিন, আমি অর্থ বলব।`,
      `"${activeLesson.grammarTopicBn}" নিয়মটি এই পাঠের উদাহরণ দিয়ে অনুশীলন করান।`,
    ],
    [activeLesson]
  );

  const handleCheckWritingWithAi = async () => {
    if (!writingAnswer.trim() || aiLoading) return;
    setAiLoading(true);
    setAiWritingFeedback(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'correct-writing',
          level: `Chapter ${activeLesson.chapterNumber}, Lesson ${activeLesson.lessonNumber}`,
          interfaceLang: lang,
          message: `Lesson: ${activeLesson.titleBn}\nGrammar focus: ${activeLesson.grammarTopicBn}\nPrompt: ${activeLesson.writingPromptBn}\nExpected hint: ${activeLesson.writingTargetHintAr}\nStudent wrote: ${writingAnswer}`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'লেখা যাচাই করা যায়নি।');
      setAiWritingFeedback(data.reply);
      awardXp(15, {
        titleBn: `লেখার অনুশীলন: পাঠ ${activeLesson.chapterNumber}.${activeLesson.lessonNumber}`,
        titleEn: `Writing practice: Lesson ${activeLesson.chapterNumber}.${activeLesson.lessonNumber}`,
        type: 'ai',
      });
    } catch (err: unknown) {
      setAiWritingFeedback(err instanceof Error ? err.message : 'লেখা যাচাই করতে সমস্যা হয়েছে।');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTogglePracticeMic = () => {
    if (listeningMic) {
      micRecRef.current?.stop();
      setListeningMic(false);
      return;
    }
    setListeningMic(true);
    const handle = startContinuousSpeechRecognition('ar-SA', {
      onTranscript: ({ fullText }) => {
        setWritingAnswer(fullText);
      },
      onError: (msg) => {
        setListeningMic(false);
        setAiWritingFeedback(msg);
      },
      onEnd: () => setListeningMic(false),
    });
    if (!handle) {
      setListeningMic(false);
    } else {
      micRecRef.current = handle;
    }
  };

  const prevLink =
    lsNum > 1
      ? `/courses/lesson/${chNum}/${lsNum - 1}`
      : chNum > 1
      ? `/courses/lesson/${chNum - 1}/10`
      : null;

  const nextLink =
    lsNum < 10
      ? `/courses/lesson/${chNum}/${lsNum + 1}`
      : chNum < allChapters.length
      ? `/courses/lesson/${chNum + 1}/1`
      : null;

  const isDone = progress.completedLessonIds.includes(activeLesson.id);
  const isBookmarked = (progress.favoriteLessonIds || []).includes(activeLesson.id);

  const handleSaveLessonNote = () => {
    const savedIso = saveLessonNoteToStorage(activeLesson.id, noteText);
    setNoteSavedAt(noteText.trim() ? savedIso : null);
    triggerSound('success');
  };

  const handleClearLessonNote = () => {
    setNoteText('');
    saveLessonNoteToStorage(activeLesson.id, '');
    setNoteSavedAt(null);
    triggerSound('click');
  };

  return (
    <AppShell
      title={`অধ্যায় ${activeLesson.chapterNumber} · পাঠ ${activeLesson.lessonNumber}`}
      subtitle={lang === 'bn' ? activeLesson.titleBn : activeLesson.titleEn}
      distractionFree={distractionFree}
      onExitDistractionFree={() => setDistractionFree(false)}
    >
      <div className={`${distractionFree ? 'max-w-3xl' : 'max-w-5xl'} mx-auto space-y-6`}>
        {/* Flat Top Navigation, Distraction-Free Toggle, Notes, Offline Save & Completion Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {!distractionFree && (
              <>
                <Link
                  to={`/courses/chapter/${activeLesson.chapterNumber}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold btn-secondary"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--accent)]" />
                  <span>অধ্যায় {activeLesson.chapterNumber}</span>
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium btn-secondary"
                >
                  <span>১০০ অধ্যায়</span>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium btn-secondary"
                >
                  <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--accent)]" />
                  <span className="hidden sm:inline">হোম</span>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                triggerSound('click');
                setDistractionFree((v) => !v);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap ${
                distractionFree
                  ? 'btn-primary'
                  : 'btn-secondary text-[var(--text-primary)]'
              }`}
              title="পার্শ্বমেনু লুকিয়ে পূর্ণ মনোযোগে আরবি পাঠ পড়ুন"
            >
              {distractionFree ? <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--accent)]" />}
              <span>{distractionFree ? 'স্বাভাবিক ভিউ' : 'মনোযোগী পাঠ'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNotesOpen(true);
                window.setTimeout(() => {
                  notesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 40);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap ${
                noteText.trim()
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                  : 'btn-secondary'
              }`}
              title="এই পাঠের জন্য ব্যক্তিগত নোট লিখুন"
            >
              <NotebookPen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
              <span>{noteText.trim() ? 'পাঠ নোট (সংরক্ষিত)' : 'পাঠ নোট'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleFavoriteLesson(activeLesson.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap ${
                isBookmarked
                  ? 'bg-amber-500/18 text-amber-700 dark:text-amber-300 border border-amber-500/45'
                  : 'btn-secondary'
              }`}
              title={isBookmarked ? 'পছন্দের তালিকা থেকে সরান' : 'ড্যাশবোর্ডের পছন্দের তালিকায় যোগ করুন'}
            >
              <Bookmark className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'পছন্দ ✓' : 'পছন্দের তালিকায়'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => void handleToggleOfflineSave()}
              disabled={savingOffline}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-colors ${
                isSavedOffline
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35'
                  : 'btn-secondary'
              }`}
              title={isSavedOffline ? 'অফলাইন ক্যাশ থেকে সরান' : 'ইন্টারনেট ছাড়া পড়তে সেভ করুন'}
            >
              {isSavedOffline ? (
                <>
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>অফলাইনে সংরক্ষিত</span>
                  <Trash2 className="w-3 h-3 opacity-60 ms-0.5" />
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--accent)]" />
                  <span>অফলাইনে সেভ</span>
                </>
              )}
            </button>

            {isDone ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[var(--emerald-highlight)] text-[var(--success)]">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.common.completed}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => completeLesson(activeLesson.id, activeLesson.titleBn, activeLesson.titleEn)}
                className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs btn-primary font-bold"
              >
                {t.common.markComplete} (+50 XP)
              </button>
            )}
          </div>
        </div>

        {/* Open Flat Lesson Header (No outer card squeezing mobile width) */}
        <header className="space-y-2 pb-4 border-b border-[var(--border-subtle)]">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--accent)]">
            <span>অধ্যায় {activeLesson.chapterNumber}</span>
            <span>·</span>
            <span>পাঠ {activeLesson.lessonNumber}</span>
            <span>·</span>
            <span>স্তর {chapter.level}</span>
            <span>·</span>
            <span>{activeLesson.track}</span>
          </div>
          <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)] leading-loose" dir="rtl">
            {activeLesson.titleAr}
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug text-[var(--text-primary)]">
            {lang === 'bn' ? activeLesson.titleBn : activeLesson.titleEn}
          </h2>
        </header>

        {/* Clean Unboxed Horizontal Pill Tabs + Quick Nahw Tip Switch */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <nav className="flex flex-wrap gap-1 sm:gap-1.5">
            {(
              [
                { id: 'overview', labelBn: 'উদ্দেশ্য', labelEn: 'Objectives' },
                {
                  id: 'vocab',
                  labelBn: `শব্দভাণ্ডার (${dedupedVocab.words.length})`,
                  labelEn: `Vocabulary (${dedupedVocab.words.length})`,
                },
                { id: 'grammar', labelBn: 'ব্যাকরণ', labelEn: 'Grammar' },
                { id: 'dialogue', labelBn: `সংলাপ (${activeLesson.conversation.length})`, labelEn: 'Dialogue' },
                { id: 'practice', labelBn: 'অনুশীলন', labelEn: 'Practice' },
                { id: 'quiz', labelBn: 'কুইজ', labelEn: 'Quiz' },
                { id: 'ai-practice', labelBn: 'AI চর্চা', labelEn: 'AI Practice' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                      : 'btn-secondary text-[var(--text-secondary)]'
                  }`}
                >
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </button>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div
              className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-0.5 text-[11px] font-bold"
              role="group"
              aria-label="Grammar terminology language"
            >
              <button
                type="button"
                onClick={() => setGrammarTerminologyMode('arabic')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  grammarTerminologyMode === 'arabic'
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
                  grammarTerminologyMode === 'bengali'
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
              onClick={() => setNahwTipsEnabled((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap ${
                nahwTipsEnabled
                  ? 'bg-[var(--emerald-highlight)] text-[var(--accent)] border border-[var(--accent)]/40'
                  : 'btn-secondary text-[var(--text-muted)]'
              }`}
              title="বাক্যের আরবি ব্যাকরণিক পদে ক্লিক করে সংক্ষিপ্ত নাহু নিয়ম দেখুন"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>নাহু টিপস: {nahwTipsEnabled ? 'চালু' : 'বন্ধ'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Objectives & Revision (Open Gemini-like flat sections with large readable font) */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section className="space-y-3 pb-6 border-b border-[var(--border-subtle)]">
              <h3 className="text-base sm:text-lg font-extrabold text-[var(--accent)]">
                পাঠের শিখনফল (Learning Objectives)
              </h3>
              <ul className="space-y-3 text-[15.5px] sm:text-base text-[var(--text-primary)] list-disc ps-5 leading-[1.85]">
                {(lang === 'bn' ? activeLesson.objectivesBn : activeLesson.objectivesEn).map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold text-[var(--accent)]">
                পূর্ববর্তী শব্দ পুনরালোচনা (সফওয়াতুল মাসাদির)
              </h3>
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeLesson.revisionVocabulary.map((v) => (
                  <div key={v.id} className="py-4 first:pt-1 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                        {v.arabic}
                      </span>
                      <AudioButton text={v.arabic} compact />
                    </div>
                    <div className="space-y-1 text-[15px] sm:text-base leading-relaxed">
                      <div>
                        <span className="text-[var(--text-muted)]">উচ্চারণ: </span>
                        <span className="font-semibold text-[var(--text-primary)]">{v.pronunciationBn}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">বাংলা অর্থ: </span>
                        <span className="font-bold text-[var(--text-primary)]">{v.meaningBn}</span>
                      </div>
                      {v.root && (
                        <div>
                          <span className="text-[var(--text-muted)]">মূলধাতু ও ক্রিয়া: </span>
                          <span className="font-arabic-ui text-[var(--text-secondary)]">{v.root}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: Open Un-Cramped Complete Sequential Vocabulary List */}
        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)]">
              <span>
                এই পাঠে ব্যবহৃত <strong className="text-[var(--accent)] font-mono-num">{dedupedVocab.words.length}টি</strong> নতুন শব্দ
                {dedupedVocab.skippedPreviouslyTaughtCount > 0 && (
                  <span className="text-[var(--text-muted)]">
                    {' '}· পূর্ববর্তী পাঠে শেখা {dedupedVocab.skippedPreviouslyTaughtCount}টি পুনরাবৃত্ত শব্দ বাদ দেওয়া হয়েছে
                  </span>
                )}
              </span>
            </div>

            {dedupedVocab.words.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--text-secondary)]">
                এই পাঠের ব্যবহৃত সকল শব্দ পূর্ববর্তী পাঠসমূহে ইতোমধ্যে শেখানো হয়েছে — পুনরাবৃত্তি এড়াতে পুনরায় তালিকাভুক্ত করা হয়নি।
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {dedupedVocab.words.map((word) => (
                  <article key={word.id} className="py-5 first:pt-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)]" dir="rtl">
                          {word.arabic}
                        </p>
                        <div className="text-sm text-[var(--text-muted)]">
                          উচ্চারণ: <span className="font-semibold text-[var(--text-primary)]">{word.pronunciationBn}</span>
                        </div>
                      </div>
                      <AudioButton text={word.arabic} showSlow compact />
                    </div>

                    <div className="space-y-1.5 text-[15.5px] sm:text-base leading-relaxed">
                      <div>
                        <span className="text-sm text-[var(--text-muted)]">বাংলা অর্থ: </span>
                        <span className="font-extrabold text-[var(--text-primary)]">{word.meaningBn}</span>
                        <span className="text-sm text-[var(--text-muted)] ms-2">({word.meaningEn})</span>
                      </div>
                      {(word.category || word.root) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
                          {word.category && (
                            <span>
                              শ্রেণি: <strong className="text-[var(--accent)]">{localizeGrammarLabel(word.category, grammarTerminologyMode)}</strong>
                            </span>
                          )}
                          {word.root && (
                            <span className="font-arabic-ui">মূলধাতু: {word.root}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--accent)]">বাক্যে উদাহরণ:</span>
                        <AudioButton text={word.exampleAr} compact showSlow={false} />
                      </div>
                      <QuickNahwText
                        text={word.exampleAr}
                        enabled={nahwTipsEnabled}
                        className="font-arabic text-xl sm:text-2xl text-[var(--text-primary)]"
                      />
                      <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">{word.exampleBn}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Open Grammar Explanation & Examples */}
        {activeTab === 'grammar' && (
          <div className="space-y-7">
            <section className="pb-6 border-b border-[var(--border-subtle)] space-y-3">
              <p className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                {activeLesson.grammarTopicAr}
              </p>
              <h3 className="text-xl font-extrabold">
                {localizeGrammarLabel(activeLesson.grammarTopicBn, grammarTerminologyMode)}
              </h3>
              <div className="text-[15.5px] sm:text-base text-[var(--text-primary)] leading-[1.85] whitespace-pre-line">
                {lang === 'bn'
                  ? localizeGrammarLabel(activeLesson.grammarExplanationBn, grammarTerminologyMode)
                  : activeLesson.grammarExplanationEn}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-extrabold text-[var(--accent)]">উদাহরণ ও পদ-বিশ্লেষণ:</h4>
                {nahwTipsEnabled && (
                  <span className="text-xs text-[var(--text-muted)]">
                    ডট-দাগযুক্ত আরবি শব্দে ক্লিক করে দ্রুত নাহু নিয়ম ও তারকিব ট্রি দেখুন
                  </span>
                )}
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeLesson.grammarExamples.map((ex, i) => {
                  const showTarkib = expandedExampleTarkib === i;
                  return (
                    <div key={i} className="py-4 first:pt-1 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <QuickNahwText
                            text={ex.arabic}
                            enabled={nahwTipsEnabled}
                            showSentenceTarkibButton={false}
                            className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <AudioButton text={ex.arabic} compact />
                          {ex.arabic.trim().split(/\s+/).length >= 2 && (
                            <button
                              type="button"
                              onClick={() => setExpandedExampleTarkib(showTarkib ? null : i)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                showTarkib ? 'btn-primary' : 'btn-secondary'
                              }`}
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>{showTarkib ? 'ট্রি লুকান' : 'তারকিব ট্রি'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-[15px] sm:text-base leading-relaxed">
                        <div>
                          <span className="text-[var(--text-muted)]">উচ্চারণ: </span>
                          <span className="font-medium">{ex.pronunciationBn}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">বাংলা অর্থ: </span>
                          <span className="font-bold">{ex.meaningBn}</span>
                        </div>
                        {ex.meaningEn && ex.meaningEn !== ex.meaningBn && (
                          <div className="text-sm text-[var(--text-secondary)]">
                            <span className="font-bold text-[var(--accent)]">বিশ্লেষণ: </span>
                            {localizeGrammarLabel(ex.meaningEn, grammarTerminologyMode)}
                          </div>
                        )}
                      </div>
                      {showTarkib && (
                        <TarkibVisualizer
                          sentenceAr={ex.arabic}
                          translationBn={ex.meaningBn}
                          compact
                          onClose={() => setExpandedExampleTarkib(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: Spacious Dialogue Flow */}
        {activeTab === 'dialogue' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--accent)]">
                  {activeLesson.conversation.length} লাইনের বাস্তবসম্মত আরবি সংলাপ
                </h3>
                {nahwTipsEnabled && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    ডট-দাগযুক্ত ব্যাকরণিক পদে ক্লিক করলে সাথে সাথে সংক্ষিপ্ত নাহু টিপ খুলবে
                  </p>
                )}
              </div>
              <AudioButton text={activeLesson.conversation.map((c) => c.arabic).join(' ')} showSlow />
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {activeLesson.conversation.map((line, index) => (
                <div key={index} className="py-4 first:pt-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs sm:text-sm font-bold text-[var(--accent)]">
                      <span className="font-mono-num me-2">{String(index + 1).padStart(2, '0')}.</span>
                      <span className="font-arabic-ui me-2">{line.speaker}</span>
                      <span className="text-[var(--text-muted)] font-normal">({line.speakerRoleBn})</span>
                    </div>
                    <AudioButton text={line.arabic} showSlow compact />
                  </div>
                  <QuickNahwText
                    text={line.arabic}
                    enabled={nahwTipsEnabled}
                    className="font-arabic text-2xl sm:text-3xl text-[var(--text-primary)] leading-[2.05]"
                  />
                  <div className="space-y-1 text-[15px] sm:text-base leading-relaxed">
                    <div>
                      <span className="text-[var(--text-muted)]">উচ্চারণ: </span>
                      <span className="font-medium text-[var(--text-secondary)]">{line.pronunciationBn}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">বাংলা অনুবাদ: </span>
                      <span className="font-bold text-[var(--text-primary)]">{line.translationBn}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Writing & Translation */}
        {activeTab === 'practice' && (
          <div className="space-y-8">
            <section className="space-y-3.5 pb-6 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-extrabold text-[var(--accent)]">
                আরবি লেখার অনুশীলন ও AI সংশোধন
              </h3>
              <p className="text-[15.5px] sm:text-base text-[var(--text-primary)] leading-relaxed">
                {lang === 'bn' ? activeLesson.writingPromptBn : activeLesson.writingPromptEn}
              </p>
              <textarea
                rows={3}
                dir="rtl"
                value={writingAnswer}
                onChange={(e) => setWritingAnswer(e.target.value)}
                placeholder="اكتب الجملة العربية هنا..."
                className="w-full p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] font-arabic text-xl sm:text-2xl focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePracticeMic}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold ${
                    listeningMic ? 'bg-emerald-500 text-white animate-pulse' : 'btn-secondary'
                  }`}
                >
                  {listeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent)]" />}
                  <span>{listeningMic ? 'শুনছে... থামান' : 'ভয়েসে আরবি বলুন'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCheckWritingWithAi}
                  disabled={aiLoading || !writingAnswer.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold btn-primary disabled:opacity-50"
                >
                  <Bot className="w-4 h-4" />
                  <span>{aiLoading ? 'যাচাই হচ্ছে...' : 'AI দিয়ে লেখা যাচাই করুন'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWritingAnswer(activeLesson.writingTargetHintAr)}
                  className="px-3.5 py-2 rounded-full text-xs font-semibold btn-secondary"
                >
                  নমুনা উত্তর বসান
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-practice')}
                  className="px-3 py-2 text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  এই পাঠ নিয়ে AI চর্চায় যান →
                </button>
              </div>
              {aiWritingFeedback && (
                <div className="surface-card rounded-3xl border border-[var(--border-subtle)] p-5 space-y-2">
                  <div className="text-xs font-bold text-[var(--accent)]">AI শিক্ষকের সংশোধন ও পরামর্শ</div>
                  <GeminiRichText
                    text={aiWritingFeedback}
                    className="text-[15.5px] sm:text-base whitespace-pre-wrap leading-[1.85] font-arabic-ui"
                  />
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-extrabold text-[var(--accent)]">অনুবাদ অনুশীলন</h3>
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeLesson.translationExercises.map((ex, idx) => {
                  const revealed = revealedTransIdx.includes(idx);
                  return (
                    <div key={idx} className="py-4 first:pt-1 space-y-2">
                      <div className="text-xs font-bold text-[var(--accent)]">
                        {ex.direction === 'ar-to-bn' ? 'আরবি → বাংলা অনুবাদ' : 'বাংলা → আরবি অনুবাদ'}
                      </div>
                      {ex.direction === 'ar-to-bn' ? (
                        <QuickNahwText
                          text={ex.prompt}
                          enabled={nahwTipsEnabled}
                          className="font-arabic text-2xl sm:text-3xl text-[var(--text-primary)]"
                        />
                      ) : (
                        <p className="text-base font-semibold">{ex.prompt}</p>
                      )}
                      <div className="text-sm text-[var(--text-muted)]">ইঙ্গিত: {ex.hint}</div>
                      {revealed ? (
                        <p className="text-base font-bold text-[var(--success)] pt-1">{ex.answer}</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRevealedTransIdx((prev) => [...prev, idx])}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold btn-secondary"
                        >
                          উত্তর দেখুন
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 6: Quiz */}
        {activeTab === 'quiz' && (
          <div className="divide-y divide-[var(--border-subtle)]">
            {activeLesson.quiz.map((q, qIdx) => {
              const chosen = quizAnswers[q.id];
              const isAnswered = chosen !== undefined;
              const isCorrect = chosen === q.correctIndex;
              return (
                <div key={q.id} className="py-5 first:pt-1 space-y-3">
                  <div className="text-base font-bold leading-snug">
                    {qIdx + 1}. {lang === 'bn' ? q.questionBn : q.questionEn}
                  </div>
                  {q.arabicPrompt && (
                    <QuickNahwText
                      text={q.arabicPrompt}
                      enabled={nahwTipsEnabled}
                      className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]"
                    />
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
                    <div className={`text-sm font-medium leading-relaxed ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                      {isCorrect ? 'সঠিক উত্তর! ' : 'আবার দেখুন: '}
                      {lang === 'bn' ? q.explanationBn : q.explanationEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 7: Embedded Strictly Scoped AI Lesson Practice */}
        {activeTab === 'ai-practice' && (
          <LessonAiPracticePanel
            lessonTitle={`অধ্যায় ${activeLesson.chapterNumber} · পাঠ ${activeLesson.lessonNumber}: ${activeLesson.titleBn}`}
            lessonScopeContext={lessonScopeContext}
            starterQuestions={starterQuestions}
            levelLabel={`Level ${chapter.level}`}
          />
        )}

        {/* Personal Per-Lesson Notes (localStorage persisted under aaa_lesson_notes_v1) */}
        <section
          ref={notesPanelRef}
          className="surface-card rounded-3xl border border-amber-500/35 bg-gradient-to-br from-amber-500/8 via-transparent to-emerald-500/5 p-5 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-[var(--text-primary)]"
            >
              <NotebookPen className="w-4 h-4 text-amber-500 shrink-0" />
              <span>পাঠের ব্যক্তিগত নোট (Lesson Notes · {activeLesson.chapterNumber}.{activeLesson.lessonNumber})</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              {noteSavedAt && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">
                  সংরক্ষিত ({new Date(noteSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
              <button
                type="button"
                onClick={() => setNotesOpen((v) => !v)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold btn-secondary"
              >
                {notesOpen ? 'সংকুচিত করুন' : 'নোট লিখুন'}
              </button>
            </div>
          </div>

          {(notesOpen || noteText.trim().length > 0) && (
            <div className="space-y-3 pt-1">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => {
                  const val = e.target.value;
                  setNoteText(val);
                  const iso = saveLessonNoteToStorage(activeLesson.id, val);
                  setNoteSavedAt(val.trim() ? iso : null);
                }}
                placeholder="এই পাঠের গুরুত্বপূর্ণ নাহু-ছরফ নিয়ম, নতুন শব্দের অর্থ বা নিজের বোঝার জন্য নোট লিখে রাখুন (অটো-সেভ হবে)..."
                className="w-full p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none text-sm leading-relaxed text-[var(--text-primary)]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">
                  নোট আপনার ব্রাউজারে পাঠ #{activeLesson.chapterNumber}.{activeLesson.lessonNumber}-এর সাথে স্থায়ীভাবে সংরক্ষিত থাকে।
                </span>
                <div className="flex items-center gap-2">
                  {noteText.trim() && (
                    <button
                      type="button"
                      onClick={handleClearLessonNote}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary text-rose-600 dark:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveLessonNote}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-primary"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>নোট সেভ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Clean Footer Lesson Navigation */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          {prevLink ? (
            <Link
              to={prevLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
              <span>পূর্ববর্তী পাঠ</span>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/chapter/${activeLesson.chapterNumber}`}
              className="px-4 py-2.5 rounded-full text-xs font-semibold btn-secondary"
            >
              অধ্যায় {activeLesson.chapterNumber} সূচি
            </Link>
            {nextLink && (
              <Link
                to={nextLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold btn-primary"
              >
                <span>পরবর্তী পাঠ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
