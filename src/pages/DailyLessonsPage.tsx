import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  GraduationCap,
  Layers,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { DAILY_LESSON_GROUPS, DailySentence } from '../data/dailyLessonsData';
import { speakText, startVoiceRecognition } from '../utils/speech';

type LessonTab = 'dialogue' | 'vocab' | 'grammar' | 'ai-practice';

export const DailyLessonsPage: React.FC = () => {
  const { lang, progress, awardXp } = useApp();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedLessonNum, setSelectedLessonNum] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<LessonTab>('dialogue');

  // AI 20-line dialogue expansion
  const [aiExpandedSentences, setAiExpandedSentences] = useState<Record<number, DailySentence[]>>({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Embedded AI Lesson Practice Partner (Voice + Text)
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceMessages, setPracticeMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [listeningMic, setListeningMic] = useState(false);

  const selectedGroup = DAILY_LESSON_GROUPS.find((g) => g.id === selectedGroupId) || null;
  const selectedLesson =
    selectedGroup?.lessons.find((l) => l.lessonNumber === selectedLessonNum) || null;

  const activeSentences = selectedLesson
    ? aiExpandedSentences[selectedLesson.lessonNumber] || selectedLesson.sentences
    : [];

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

  const handleSendLessonPractice = async (textToSend?: string) => {
    if (!selectedLesson || practiceLoading) return;
    const msg = (textToSend ?? practiceInput).trim();
    if (!msg) return;
    if (!textToSend) setPracticeInput('');
    setPracticeMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setPracticeLoading(true);
    try {
      const vocabSummary = selectedLesson.newVocabulary
        .slice(0, 6)
        .map((v) => `${v.arabic} (${v.meaningBn})`)
        .join(', ');
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'conversation',
          level: selectedLesson.difficultyLabel,
          interfaceLang: 'bn',
          context: `Student is practicing ${selectedLesson.titleBn} (${selectedLesson.mabadiLevelBn}). Grammar rule: ${selectedLesson.grammarRule.titleBn}. New vocab: ${vocabSummary}. Prompt shown to student: ${selectedLesson.aiPracticePromptAr}`,
          message: `The student replied in Arabic/Bengali practice: "${msg}". Praise their effort briefly in Bengali, correct any Arabic Harakat or Nahw/Sarf error gently, then continue the Arabic dialogue with 1 short vowelized follow-up Arabic sentence + Bengali meaning so they can reply again.`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const replyText = data.reply || data.error || 'উত্তর পাওয়া যায়নি।';
      setPracticeMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
      speakText(replyText.slice(0, 220), /[\u0600-\u06FF]/.test(replyText) ? 'ar-SA' : 'bn-BD', { rate: 0.92 });
      awardXp(15, {
        titleBn: `AI পাঠ চর্চা: ${selectedLesson.titleBn}`,
        titleEn: `AI practice for Lesson ${selectedLesson.lessonNumber}`,
        type: 'ai',
      });
    } catch (err: unknown) {
      setPracticeMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err instanceof Error ? err.message : 'ত্রুটি ঘটেছে।' },
      ]);
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleVoicePractice = () => {
    if (listeningMic) return;
    setListeningMic(true);
    startVoiceRecognition('ar-SA', {
      onResult: (transcript) => {
        setListeningMic(false);
        setPracticeInput(transcript);
        void handleSendLessonPractice(transcript);
      },
      onError: (msg) => {
        setListeningMic(false);
        setAiError(msg);
      },
      onEnd: () => setListeningMic(false),
    });
  };

  return (
    <AppShell
      title={lang === 'bn' ? 'মাবাদিউল আরাবিয়াহ আদলে ১০০টি পাঠ' : 'Mabadiul Arabiyyah Daily Lessons (1–100)'}
      subtitle={
        lang === 'bn'
          ? 'প্রতিটি পাঠে ১৫–২০ লাইনের কথোপকথন, নতুন শব্দ, কাফিয়া-হেদায়েতুন নাহু-মাবাদি ব্যাখ্যা ও AI চর্চা'
          : '100 Progressive Lessons with 15–20 line dialogues, vocabulary, grammar rules, and AI practice'
      }
    >
      <div className="space-y-6">
        {/* Level 1: 20 Groups of 5 lessons each (পাঠ ১–৫ ... পাঠ ৯৬–১০০) */}
        {!selectedGroup && (
          <div className="space-y-4">
            <div className="surface-alt rounded-xl p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong>মাবাদিউল আরাবিয়াহ</strong> ধারাবাহিকতা অনুসরণ করে পাঠ ১ থেকে ১০০ পর্যন্ত প্রতিটি ধাপে সহজ থেকে কঠিন (স্তর ১ → স্তর ৬) ক্রমানুসারে সাজানো হয়েছে। প্রতিটি পাঠে পাবেন ১৬–২০ লাইনের খাঁটি আরবি কথোপকথন, নতুন শব্দ, <em>সফওয়াতুল মাসাদির</em> ও <em>কাফিয়া/হেদায়েতুন নাহু</em>-র ব্যাখ্যা এবং AI উস্তাযের সাথে সরাসরি চর্চা।
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
                  className="surface-card rounded-xl p-5 text-left hover:border-[var(--border-strong)] transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-[var(--accent)]">{grp.rangeLabel}</span>
                    <span className="text-xs font-medium text-[var(--text-muted)]">{grp.difficultyLabel}</span>
                  </div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
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
            <div className="surface-card rounded-2xl p-6 space-y-2">
              <button
                type="button"
                onClick={() => setSelectedGroupId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>সব পাঠে যান</span>
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">আরবি {selectedGroup.rangeLabel}</h2>
                <span className="text-xs font-semibold text-[var(--accent)]">{selectedGroup.difficultyLabel}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{selectedGroup.summaryBn}</p>
              <p className="text-xs text-[var(--text-muted)]">{selectedGroup.mabadiLevelBn}</p>
            </div>

            <div className="space-y-3">
              {selectedGroup.lessons.map((lesson) => (
                <button
                  key={lesson.lessonNumber}
                  type="button"
                  onClick={() => {
                    setSelectedLessonNum(lesson.lessonNumber);
                    setActiveTab('dialogue');
                    setPracticeMessages([]);
                    setAiError(null);
                  }}
                  className="w-full surface-card rounded-xl p-5 text-left flex items-center justify-between gap-4 hover:border-[var(--border-strong)] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-base font-bold text-[var(--accent)]">{lesson.titleBn}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      ব্যাকরণ: {lesson.grammarRule.titleBn} ({lesson.grammarRule.sourceBook})
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {lesson.sentences.length} লাইন কথোপকথন · {lesson.newVocabulary.length}টি নতুন শব্দ ও মাসদার · AI চর্চা
                    </div>
                  </div>
                  <BookOpen className="w-5 h-5 text-[var(--accent)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level 3: Full Mabadiul Arabiyyah Lesson Workspace */}
        {selectedGroup && selectedLesson && (
          <div className="space-y-5">
            <div className="surface-card rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedLessonNum(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>পাঠের তালিকা ({selectedGroup.rangeLabel})</span>
                </button>
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary disabled:opacity-50"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-secondary"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span>পাঠ সম্পন্ন (+25 XP · মোট {progress.xp})</span>
                </button>
              </div>
            </div>

            {/* 4 Clean Sub-Tabs inside Every Lesson */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('dialogue')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'dialogue' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>কথোপকথন ({activeSentences.length} লাইন)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vocab')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'vocab' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>নতুন শব্দ ও মাসদার ({selectedLesson.newVocabulary.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('grammar')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'grammar' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ব্যাকরণ ও ব্যাখ্যা</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai-practice')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === 'ai-practice' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI-এর সাথে চর্চা</span>
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
                  <div className="text-xs text-[var(--text-secondary)]">
                    সম্পূর্ণ কথোপকথন একটানা শুনুন অথবা প্রতিটি লাইন আলাদাভাবে অনুশীলন করুন:
                  </div>
                  <AudioButton text={activeSentences.map((s) => s.arabic).join(' ')} showSlow />
                </div>

                {activeSentences.map((sent, idx) => (
                  <div key={idx} className="surface-card rounded-xl p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xs font-semibold text-[var(--accent)]">
                        <span className="font-mono-num me-2">{idx + 1}.</span>
                        {sent.speakerAr && (
                          <span className="font-arabic-ui text-sm me-1.5">{sent.speakerAr}</span>
                        )}
                        {sent.speakerBn && (
                          <span className="text-[var(--text-muted)] font-normal">({sent.speakerBn})</span>
                        )}
                      </div>
                      <AudioButton text={sent.arabic} showSlow compact />
                    </div>

                    <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] text-right leading-relaxed" dir="rtl">
                      {sent.arabic}
                    </p>

                    <div className="space-y-1">
                      <p className="text-xs text-[var(--text-muted)]">উচ্চারণ: {sent.pronunciationBn}</p>
                      <p className="text-sm sm:text-base font-medium">{sent.meaningBn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: New Vocabulary & Safwatul Masadir */}
            {activeTab === 'vocab' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 surface-alt rounded-xl p-4 text-xs text-[var(--text-secondary)]">
                  <span>এই পাঠের নতুন শব্দভাণ্ডার এবং সফওয়াতুল মাসাদির থেকে সংশ্লিষ্ট ক্রিয়া-মূল:</span>
                  <Link to="/safwatul-masadir" className="font-semibold text-[var(--accent)] hover:underline">
                    সম্পূর্ণ সফওয়াতুল মাসাদির দেখুন →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLesson.newVocabulary.map((w, i) => (
                    <div key={i} className="surface-card rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">{w.arabic}</p>
                          <p className="text-xs text-[var(--text-muted)]">{w.pronunciationBn}</p>
                        </div>
                        <AudioButton text={w.arabic} compact />
                      </div>
                      <div className="text-sm font-semibold">{w.meaningBn}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {w.meaningEn} {w.masdarNote ? `· ${w.masdarNote}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Classical Grammar Rule & Explanation */}
            {activeTab === 'grammar' && (
              <div className="surface-card rounded-2xl p-6 space-y-5">
                <div className="space-y-2 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="text-xs font-semibold text-[var(--accent)]">
                    উৎস কিতাব: {selectedLesson.grammarRule.sourceBook}
                  </div>
                  <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                    {selectedLesson.grammarRule.titleAr}
                  </p>
                  <h3 className="text-lg font-bold">{selectedLesson.grammarRule.titleBn}</h3>
                </div>

                <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {selectedLesson.grammarRule.explanationBn}
                </div>

                <div className="surface-alt rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--accent)]">প্রয়োগ ও উদাহরণ:</span>
                    <AudioButton text={selectedLesson.grammarRule.exampleAr} compact />
                  </div>
                  <p className="font-arabic text-2xl text-[var(--text-primary)]" dir="rtl">
                    {selectedLesson.grammarRule.exampleAr}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedLesson.grammarRule.exampleBn}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/grammar" className="px-4 py-2 rounded-lg text-xs btn-secondary">
                    কাফিয়া ও হেদায়েতুন নাহু-র সব নিয়ম পড়ুন →
                  </Link>
                  <Link to="/safwatul-masadir" className="px-4 py-2 rounded-lg text-xs btn-secondary">
                    সফওয়াতুল মাসাদির সব শব্দ ও গর্দান →
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 4: Practice This Lesson with AI (Text + Voice Mic) */}
            {activeTab === 'ai-practice' && (
              <div className="surface-card rounded-2xl p-6 space-y-5">
                <div className="surface-alt rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--accent)]">
                      উস্তায AI-এর প্রশ্ন (আরবিতে বা বাংলায় উত্তর দিয়ে চর্চা করুন):
                    </span>
                    <AudioButton text={selectedLesson.aiPracticePromptAr} compact />
                  </div>
                  <p className="font-arabic text-2xl text-[var(--text-primary)]" dir="rtl">
                    {selectedLesson.aiPracticePromptAr}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedLesson.aiPracticePromptBn}</p>
                </div>

                <div className="space-y-3 max-h-[340px] overflow-y-auto">
                  {practiceMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${
                        m.role === 'user' ? 'bg-[var(--accent)]/15 ms-8' : 'surface-alt me-8'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[var(--accent)] mb-1">
                        {m.role === 'user' ? 'আপনার উত্তর' : 'উস্তায AI'}
                      </div>
                      {m.text}
                    </div>
                  ))}
                  {practiceLoading && (
                    <div className="surface-alt rounded-xl p-3 text-xs text-[var(--text-muted)]">
                      উস্তায AI আপনার উত্তর যাচাই করছেন...
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendLessonPractice();
                  }}
                  className="flex gap-2"
                >
                  <button
                    type="button"
                    onClick={handleVoicePractice}
                    className={`px-3.5 py-2.5 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                      listeningMic ? 'bg-[var(--danger)] text-white' : 'btn-secondary'
                    }`}
                    title="মাইক্রোফোনে আরবি বলুন"
                  >
                    {listeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent)]" />}
                    <span className="hidden sm:inline">{listeningMic ? 'শুনছি...' : 'ভয়েস'}</span>
                  </button>
                  <input
                    type="text"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    placeholder="আরবিতে উত্তর লিখুন বা মাইক্রোফোনে বলুন..."
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    disabled={practiceLoading || !practiceInput.trim()}
                    className="px-4 py-2.5 rounded-lg btn-primary inline-flex items-center gap-1.5 text-xs shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>পাঠান</span>
                  </button>
                </form>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--text-muted)]">
                  <span>পূর্ণ ভয়েস কথোপকথনের জন্য ভয়েস ল্যাব ব্যবহার করতে পারেন:</span>
                  <Link
                    to={`/ai-teacher?q=${encodeURIComponent(`আমি "${selectedLesson.titleBn}" পাঠটি অনুশীলন করতে চাই। আমার সাথে আরবিতে কথোপকথন শুরু করুন।`)}`}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    AI ভয়েস টিচার খুলুন →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};
