import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  GraduationCap,
  Home,
  Layers,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { QuickNahwText } from '../components/QuickNahwText';
import { useApp } from '../context/AppContext';
import { DAILY_LESSON_GROUPS, DailySentence } from '../data/dailyLessonsData';
import { getDeduplicatedDailyLessonVocab } from '../utils/lessonVocabDedupe';

type LessonTab = 'dialogue' | 'vocab' | 'grammar' | 'ai-practice';

export const DailyLessonsPage: React.FC = () => {
  const { lang, progress, awardXp } = useApp();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedLessonNum, setSelectedLessonNum] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<LessonTab>('dialogue');
  const [nahwTipsEnabled, setNahwTipsEnabled] = useState(true);

  // AI 20-line dialogue expansion
  const [aiExpandedSentences, setAiExpandedSentences] = useState<Record<number, DailySentence[]>>({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedGroupId, selectedLessonNum]);

  const selectedGroup = DAILY_LESSON_GROUPS.find((g) => g.id === selectedGroupId) || null;
  const selectedLesson =
    selectedGroup?.lessons.find((l) => l.lessonNumber === selectedLessonNum) || null;

  const activeSentences = selectedLesson
    ? aiExpandedSentences[selectedLesson.lessonNumber] || selectedLesson.sentences
    : [];

  const allLessonsFlat = useMemo(
    () => DAILY_LESSON_GROUPS.flatMap((g) => g.lessons.map((l) => ({ groupId: g.id, lessonNumber: l.lessonNumber }))),
    []
  );

  const currentFlatIndex = selectedLesson
    ? allLessonsFlat.findIndex((item) => item.lessonNumber === selectedLesson.lessonNumber)
    : -1;
  const prevFlat = currentFlatIndex > 0 ? allLessonsFlat[currentFlatIndex - 1] : null;
  const nextFlat =
    currentFlatIndex >= 0 && currentFlatIndex < allLessonsFlat.length - 1
      ? allLessonsFlat[currentFlatIndex + 1]
      : null;

  const dedupedVocab = useMemo(
    () =>
      selectedLesson
        ? getDeduplicatedDailyLessonVocab(selectedLesson.lessonNumber)
        : { words: [], skippedPreviouslyTaughtCount: 0 },
    [selectedLesson]
  );

  const lessonScopeContext = useMemo(() => {
    if (!selectedLesson) return '';
    const vocabLines = dedupedVocab.words
      .map((v) => `- ${v.arabic} (${v.pronunciationBn}): ${v.meaningBn}${v.masdarNote ? ` [${v.masdarNote}]` : ''}`)
      .join('\n');
    const dialogueLines = activeSentences
      .slice(0, 6)
      .map((s) => `${s.speakerAr || ''}: ${s.arabic} (${s.meaningBn})`)
      .join('\n');

    return [
      `পাঠ: ${selectedLesson.titleBn} (${selectedLesson.mabadiLevelBn})`,
      `ব্যাকরণ (${selectedLesson.grammarRule.sourceBook}): ${selectedLesson.grammarRule.titleBn} — ${selectedLesson.grammarRule.explanationBn}`,
      `নতুন শব্দ ও মাসদার:\n${vocabLines}`,
      `সংলাপের অংশ:\n${dialogueLines}`,
    ].join('\n\n');
  }, [selectedLesson, activeSentences, dedupedVocab.words]);

  const handleApplyOfflineTwentyLines = () => {
    if (!selectedLesson) return;
    const base = [...selectedLesson.sentences];
    const vocab = selectedLesson.newVocabulary;
    const spA = base[0]?.speakerAr || 'الأُسْتَاذُ';
    const spABn = base[0]?.speakerBn || 'শিক্ষক';
    const spB = base[1]?.speakerAr || 'التِّلْمِيذُ';
    const spBBn = base[1]?.speakerBn || 'ছাত্র';

    const extras: DailySentence[] = [
      {
        speakerAr: spA,
        speakerBn: spABn,
        arabic: `رَاجِعِ الكَلِمَاتِ الجَدِيدَةَ: ${vocab[0]?.arabic || 'العِلْمُ'} وَ${vocab[1]?.arabic || 'الأَدَبُ'}.`,
        pronunciationBn: `রাজিইল কালিমাতিল জাদীদাতা: ${vocab[0]?.pronunciationBn || 'আল-ইলমু'} ওয়া ${vocab[1]?.pronunciationBn || 'আল-আদাবু'}।`,
        meaningBn: `নতুন শব্দগুলো পুনরাবৃত্তি করো: ${vocab[0]?.meaningBn || 'জ্ঞান'} ও ${vocab[1]?.meaningBn || 'আদব'}।`,
        meaningEn: 'Review the new vocabulary words.',
      },
      {
        speakerAr: spB,
        speakerBn: spBBn,
        arabic: `فَهِمْتُ القَاعِدَةَ جَيِّدًا وَحَفِظْتُ مَعْنَى ${vocab[2]?.arabic || 'الدَّرْسِ'}.`,
        pronunciationBn: `ফাহিমতুল ক্বা‘ইদাতা জাইয়্যিদান ওয়া হাফিযতু মা‘না ${vocab[2]?.pronunciationBn || 'আদ-দারসি'}।`,
        meaningBn: `আমি নিয়মটি ভালোভাবে বুঝেছি এবং "${vocab[2]?.meaningBn || 'পাঠ'}"-এর অর্থ মুখস্থ করেছি।`,
        meaningEn: 'I understood the rule well and memorized the meaning.',
      },
      {
        speakerAr: spA,
        speakerBn: spABn,
        arabic: `أَحْسَنْتَ! هَلْ تَسْتَطِيعُ أَنْ تَسْتَعْمِلَ ${vocab[3]?.arabic || 'هٰذِهِ الكَلِمَةَ'} فِي جُمْلَةٍ مُفِيدَةٍ؟`,
        pronunciationBn: `আহসান্তা! হাল তাসতাতীউ আন তাসতা‘মিলা ${vocab[3]?.pronunciationBn || 'হাযিহিল কালিমাতা'} ফী জুমলাতিন মুফীদাহ?`,
        meaningBn: `চমৎকার! তুমি কি "${vocab[3]?.meaningBn || 'এই শব্দটি'}" দিয়ে একটি পূর্ণাঙ্গ বাক্য তৈরি করতে পারবে?`,
        meaningEn: 'Well done! Can you use this word in a complete sentence?',
      },
      {
        speakerAr: spB,
        speakerBn: spBBn,
        arabic: 'نَعَمْ، بِإِذْنِ اللَّهِ سَأَتَدَرَّبُ عَلَى النُّطْقِ وَالكِتَابَةِ كُلَّ يَوْمٍ.',
        pronunciationBn: 'না‘আম, বি-ইযনিল্লাহি সাআতাদাররাবু আলান নুতক্বি ওয়াল কিতাবাতি কুল্লা ইয়াওমিন।',
        meaningBn: 'হ্যাঁ, আল্লাহর ইচ্ছায় আমি প্রতিদিন উচ্চারণ ও লেখার চর্চা করব।',
        meaningEn: 'Yes, by Allah’s leave I will practice speaking and writing daily.',
      },
    ];

    const combined = [...base, ...extras].slice(0, 20);
    setAiExpandedSentences((prev) => ({ ...prev, [selectedLesson.lessonNumber]: combined }));
    setAiError(null);
  };

  const handleLoadTwentyWithAi = async () => {
    if (!selectedLesson || loadingAi) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          level: `${selectedLesson.difficultyLabel} (${selectedLesson.mabadiLevelBn})`,
          interfaceLang: 'bn',
          message: `Generate a 20-line realistic multi-speaker Arabic conversation (dialogue in Mabadiul Arabiyyah progression style) with complete Harakat for "${selectedLesson.titleBn}". Focus on the grammar rule "${selectedLesson.grammarRule.titleBn}". Format strictly as JSON array ONLY (no markdown fences) with objects having keys: "speakerAr", "speakerBn", "arabic", "pronunciationBn", "meaningBn", "meaningEn".`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'সংলাপ তৈরি করা যায়নি।');
      const cleaned = data.reply.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned) as DailySentence[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiExpandedSentences((prev) => ({ ...prev, [selectedLesson.lessonNumber]: parsed }));
        awardXp(20, {
          titleBn: `পাঠ ${selectedLesson.lessonNumber}: ২০ লাইনের AI সংলাপ`,
          titleEn: `Daily Lesson ${selectedLesson.lessonNumber} AI dialogue`,
          type: 'lesson',
        });
      } else {
        throw new Error('AI সঠিক ফরম্যাটে ২০ লাইন পাঠায়নি।');
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : '২০ লাইন সংলাপ তৈরি করতে সাময়িক সমস্যা হয়েছে।');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <AppShell
      title={lang === 'bn' ? 'মাবাদিউল আরাবিয়াহ আদলে ১০০টি পাঠ' : 'Mabadiul Arabiyyah Daily Lessons (1–100)'}
      subtitle={
        lang === 'bn'
          ? 'প্রতিটি পাঠে ১৫–২০ লাইনের কথোপকথন, নতুন শব্দ, কাফিয়া-হেদায়েতুন নাহু-মাবাদি ব্যাখ্যা ও পাঠভিত্তিক AI চর্চা'
          : '100 Progressive Lessons with 15–20 line dialogues, vocabulary, grammar rules, and scoped AI practice'
      }
    >
      <div className="space-y-6">
        {/* Level 1: 20 Groups of 5 lessons each */}
        {!selectedGroup && (
          <div className="space-y-4">
            <div className="surface-alt rounded-2xl p-4 sm:p-5 text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong>মাবাদিউল আরাবিয়াহ</strong> ধারাবাহিকতা অনুসরণ করে পাঠ ১ থেকে ১০০ পর্যন্ত প্রতিটি ধাপে সহজ থেকে কঠিন ক্রমানুসারে সাজানো হয়েছে। প্রতিটি পাঠে পাবেন ১৬–২০ লাইনের খাঁটি আরবি কথোপকথন, নতুন শব্দ, <em>সফওয়াতুল মাসাদির</em> ও <em>কাফিয়া/হেদায়েতুন নাহু</em>-র ব্যাখ্যা এবং সরাসরি ওই পাঠকেন্দ্রিক AI অনুশীলন।
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DAILY_LESSON_GROUPS.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroupId(grp.id);
                    setSelectedLessonNum(null);
                  }}
                  className="surface-card rounded-2xl p-5 text-left hover:border-[var(--border-strong)] transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-[var(--accent)]">{grp.rangeLabel}</span>
                    <span className="text-xs font-semibold text-[var(--text-muted)]">{grp.difficultyLabel}</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {lang === 'bn' ? grp.summaryBn : grp.summaryEn}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{grp.mabadiLevelBn}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level 2: 5 Lessons inside the Selected Group */}
        {selectedGroup && !selectedLesson && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedGroupId(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>সব পাঠের তালিকায় ফিরুন</span>
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
              >
                <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>হোম</span>
              </Link>
            </div>

            <div className="surface-card rounded-2xl p-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">আরবি {selectedGroup.rangeLabel}</h2>
                <span className="text-xs font-semibold text-[var(--accent)]">{selectedGroup.difficultyLabel}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{selectedGroup.summaryBn}</p>
              <p className="text-xs text-[var(--text-muted)]">{selectedGroup.mabadiLevelBn}</p>
            </div>

            <div className="space-y-3">
              {selectedGroup.lessons.map((lesson) => {
                const lessonVocabCount = getDeduplicatedDailyLessonVocab(lesson.lessonNumber).words.length;
                return (
                  <button
                    key={lesson.lessonNumber}
                    type="button"
                    onClick={() => {
                      setSelectedLessonNum(lesson.lessonNumber);
                      setActiveTab('dialogue');
                      setAiError(null);
                    }}
                    className="w-full surface-card rounded-2xl p-5 text-left flex items-center justify-between gap-4 hover:border-[var(--border-strong)] transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="text-base font-bold text-[var(--accent)]">{lesson.titleBn}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        ব্যাকরণ: {lesson.grammarRule.titleBn} ({lesson.grammarRule.sourceBook})
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {lesson.sentences.length} লাইন কথোপকথন · {lessonVocabCount}টি নতুন শব্দ ও মাসদার · পাঠভিত্তিক AI চর্চা
                      </div>
                    </div>
                    <BookOpen className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Level 3: Full Mabadiul Arabiyyah Lesson Workspace */}
        {selectedGroup && selectedLesson && (
          <div className="space-y-5">
            {/* Top Exit Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLessonNum(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>তালিকায় ফিরুন ({selectedGroup.rangeLabel})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLessonNum(null);
                    setSelectedGroupId(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium btn-secondary"
                >
                  ১–১০০ মূল সূচি
                </button>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
              >
                <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>হোম</span>
              </Link>
            </div>

            <div className="surface-card rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{selectedLesson.titleBn}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedLesson.difficultyLabel} · {selectedLesson.mabadiLevelBn}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeSentences.length < 20 && (
                  <button
                    type="button"
                    onClick={handleLoadTwentyWithAi}
                    disabled={loadingAi}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs btn-primary disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loadingAi ? 'তৈরি হচ্ছে...' : 'AI দিয়ে ২০ লাইন সংলাপ তৈরি করুন'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    awardXp(25, {
                      titleBn: `মাবাদি ${selectedLesson.titleBn} সম্পন্ন`,
                      titleEn: `Completed ${selectedLesson.titleEn}`,
                      type: 'lesson',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs btn-secondary"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span>পাঠ সম্পন্ন (+25 XP · মোট {progress.xp})</span>
                </button>
              </div>
            </div>

            {/* Non-Clipping Responsive 4-Column Segmented Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl surface-alt border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setActiveTab('dialogue')}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dialogue'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">সংলাপ ({activeSentences.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vocab')}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'vocab'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">শব্দ ({dedupedVocab.words.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('grammar')}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'grammar'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ব্যাকরণ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai-practice')}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ai-practice'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">AI চর্চা</span>
              </button>
            </div>

            {aiError && (
              <div className="p-3.5 rounded-xl border border-[var(--warning)]/40 surface-alt flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--warning)]">
                <span>{aiError}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleLoadTwentyWithAi}
                    className="px-3 py-1.5 rounded-lg btn-secondary text-xs"
                  >
                    পুনরায় চেষ্টা করুন
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyOfflineTwentyLines}
                    className="px-3 py-1.5 rounded-lg btn-primary text-xs"
                  >
                    অফলাইনে ২০ লাইন দেখুন
                  </button>
                </div>
              </div>
            )}

            {/* Tab 1: 16-20 Line Dialogue */}
            {activeTab === 'dialogue' && (
              <div className="space-y-3">
                <div className="surface-alt rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5 text-xs text-[var(--text-secondary)]">
                    <div>সম্পূর্ণ কথোপকথন একটানা শুনুন অথবা প্রতিটি লাইন আলাদাভাবে অনুশীলন করুন:</div>
                    {nahwTipsEnabled && (
                      <div className="text-[11px] text-[var(--accent)]">
                        ডট-দাগযুক্ত আরবি শব্দে ক্লিক করে দ্রুত নাহু নিয়ম দেখুন
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNahwTipsEnabled((v) => !v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                        nahwTipsEnabled
                          ? 'bg-[var(--emerald-highlight)] text-[var(--accent)] border border-[var(--accent)]/40'
                          : 'btn-secondary text-[var(--text-muted)]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>নাহু টিপস: {nahwTipsEnabled ? 'চালু' : 'বন্ধ'}</span>
                    </button>
                    <AudioButton text={activeSentences.map((s) => s.arabic).join(' ')} showSlow />
                  </div>
                </div>

                {activeSentences.map((sent, idx) => (
                  <div key={idx} className="surface-card rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xs font-semibold text-[var(--accent)]">
                        <span className="font-mono-num me-2">{String(idx + 1).padStart(2, '0')}.</span>
                        {sent.speakerAr && (
                          <span className="font-arabic-ui text-sm me-1.5">{sent.speakerAr}</span>
                        )}
                        {sent.speakerBn && (
                          <span className="text-[var(--text-muted)] font-normal">({sent.speakerBn})</span>
                        )}
                      </div>
                      <AudioButton text={sent.arabic} showSlow compact />
                    </div>

                    <QuickNahwText
                      text={sent.arabic}
                      enabled={nahwTipsEnabled}
                      className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] text-right leading-relaxed"
                    />

                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                      <div className="text-xs text-[var(--text-muted)]">
                        উচ্চারণ: <span className="font-medium text-[var(--text-secondary)]">{sent.pronunciationBn}</span>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                        বাংলা অর্থ: {sent.meaningBn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: New Vocabulary & Safwatul Masadir (Sequential Non-Duplicating) */}
            {activeTab === 'vocab' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 surface-alt rounded-xl p-4 text-xs text-[var(--text-secondary)]">
                  <span>
                    এই পাঠে ব্যবহৃত <strong className="text-[var(--accent)] font-mono-num">{dedupedVocab.words.length}টি</strong> নতুন শব্দ ও মাসদার
                    {dedupedVocab.skippedPreviouslyTaughtCount > 0 && (
                      <span className="text-[var(--text-muted)]">
                        {' '}· পূর্ববর্তী পাঠে শেখা {dedupedVocab.skippedPreviouslyTaughtCount}টি শব্দ পুনরাবৃত্তি এড়াতে বাদ দেওয়া হয়েছে
                      </span>
                    )}
                  </span>
                  <Link to="/safwatul-masadir" className="font-semibold text-[var(--accent)] hover:underline">
                    সম্পূর্ণ সফওয়াতুল মাসাদির দেখুন →
                  </Link>
                </div>

                {dedupedVocab.words.length === 0 ? (
                  <div className="surface-card rounded-2xl p-6 text-center text-sm text-[var(--text-secondary)]">
                    এই পাঠের ব্যবহৃত সকল শব্দ পূর্ববর্তী পাঠসমূহে ইতোমধ্যে যুক্ত হয়েছে।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dedupedVocab.words.map((w, i) => (
                      <div key={i} className="surface-card rounded-xl p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-start justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
                          <div className="space-y-1">
                            <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                              {w.arabic}
                            </p>
                            <div className="text-xs text-[var(--text-muted)]">
                              উচ্চারণ: <span className="font-semibold text-[var(--text-primary)]">{w.pronunciationBn}</span>
                            </div>
                          </div>
                          <AudioButton text={w.arabic} compact />
                        </div>

                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-xs text-[var(--text-muted)]">বাংলা অর্থ: </span>
                            <span className="font-bold text-[var(--text-primary)]">{w.meaningBn}</span>
                          </div>
                          <div>
                            <span className="text-xs text-[var(--text-muted)]">ইংরেজি: </span>
                            <span className="text-xs text-[var(--text-secondary)]">{w.meaningEn}</span>
                          </div>
                          {w.masdarNote && (
                            <div>
                              <span className="text-xs text-[var(--text-muted)]">মাসদার / ব্যাকরণ নোট: </span>
                              <span className="text-xs font-medium text-[var(--accent)]">{w.masdarNote}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Classical Grammar Rule & Explanation */}
            {activeTab === 'grammar' && (
              <div className="surface-card rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[var(--accent)]">
                      উৎস কিতাব: {selectedLesson.grammarRule.sourceBook}
                    </div>
                    <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                      {selectedLesson.grammarRule.titleAr}
                    </p>
                    <h3 className="text-lg font-bold">{selectedLesson.grammarRule.titleBn}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNahwTipsEnabled((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                      nahwTipsEnabled
                        ? 'bg-[var(--emerald-highlight)] text-[var(--accent)] border border-[var(--accent)]/40'
                        : 'btn-secondary text-[var(--text-muted)]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>নাহু টিপস: {nahwTipsEnabled ? 'চালু' : 'বন্ধ'}</span>
                  </button>
                </div>

                <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {selectedLesson.grammarRule.explanationBn}
                </div>

                <div className="surface-alt rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--accent)]">
                      প্রয়োগ ও উদাহরণ{nahwTipsEnabled ? ' (ক্লিকযোগ্য নাহু টিপস সহ)' : ''}:
                    </span>
                    <AudioButton text={selectedLesson.grammarRule.exampleAr} compact />
                  </div>
                  <QuickNahwText
                    text={selectedLesson.grammarRule.exampleAr}
                    enabled={nahwTipsEnabled}
                    className="font-arabic text-2xl text-[var(--text-primary)]"
                  />
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="text-xs text-[var(--text-muted)]">অর্থ ও ব্যাখ্যা: </span>
                    {selectedLesson.grammarRule.exampleBn}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/grammar" className="px-4 py-2 rounded-xl text-xs btn-secondary">
                    কাফিয়া ও হেদায়েতুন নাহু-র সব নিয়ম পড়ুন →
                  </Link>
                  <Link to="/safwatul-masadir" className="px-4 py-2 rounded-xl text-xs btn-secondary">
                    সফওয়াতুল মাসাদির সব শব্দ ও গর্দান →
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 4: Strictly Scoped Embedded AI Practice */}
            {activeTab === 'ai-practice' && (
              <div className="space-y-4">
                <div className="surface-alt rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--accent)]">
                      এই পাঠের নির্ধারিত অনুশীলন প্রশ্ন:
                    </span>
                    <AudioButton text={selectedLesson.aiPracticePromptAr} compact />
                  </div>
                  <p className="font-arabic text-2xl text-[var(--text-primary)]" dir="rtl">
                    {selectedLesson.aiPracticePromptAr}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedLesson.aiPracticePromptBn}</p>
                </div>

                <LessonAiPracticePanel
                  key={selectedLesson.lessonNumber}
                  lessonTitle={selectedLesson.titleBn}
                  lessonScopeContext={lessonScopeContext}
                  starterQuestions={[
                    selectedLesson.aiPracticePromptAr,
                    `এই পাঠের নতুন শব্দগুলো দিয়ে আমার পরীক্ষা নিন।`,
                    `"${selectedLesson.grammarRule.titleBn}" নিয়মটি উদাহরণ দিয়ে অনুশীলন করান।`,
                  ]}
                  levelLabel={selectedLesson.difficultyLabel}
                />
              </div>
            )}

            {/* Prev / Next Lesson Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {prevFlat ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroupId(prevFlat.groupId);
                    setSelectedLessonNum(prevFlat.lessonNumber);
                    setActiveTab('dialogue');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
                  <span>পূর্ববর্তী পাঠ ({prevFlat.lessonNumber})</span>
                </button>
              ) : (
                <div />
              )}

              {nextFlat && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroupId(nextFlat.groupId);
                    setSelectedLessonNum(nextFlat.lessonNumber);
                    setActiveTab('dialogue');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold btn-primary"
                >
                  <span>পরবর্তী পাঠ ({nextFlat.lessonNumber})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
