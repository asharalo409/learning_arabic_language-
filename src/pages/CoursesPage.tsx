import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Mic,
  MicOff,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { buildDetailedLessonForSlot } from '../data/lessonGenerator';
import { startVoiceRecognition } from '../utils/speech';
import { ChapterInfo, CurriculumLevelNumber, DetailedLesson, LearningTrack } from '../types/academy';

export const CoursesPage: React.FC<{ initialLevel?: CurriculumLevelNumber }> = ({ initialLevel }) => {
  const { t, lang, progress, allChapters, allDetailedLessons, completeLesson, awardXp } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [levelFilter, setLevelFilter] = useState<CurriculumLevelNumber | 'all'>(initialLevel ?? 'all');
  const [trackFilter, setTrackFilter] = useState<LearningTrack | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapter, setExpandedChapter] = useState<number>(initialLevel === 1 ? 1 : 1);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'grammar' | 'dialogue' | 'practice' | 'quiz'>('overview');

  // Interactive practice & quiz states inside lesson player
  const [writingAnswer, setWritingAnswer] = useState('');
  const [aiWritingFeedback, setAiWritingFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [revealedTransIdx, setRevealedTransIdx] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [listeningMic, setListeningMic] = useState(false);

  // Dynamically synthesized Mabadiul Arabiyyah / Hidayatun Nahw / Kafiyah / Safwatul Masadir lesson for any slot
  const [synthesizedLesson, setSynthesizedLesson] = useState<DetailedLesson | null>(null);
  const [aiGeneratedLessonText, setAiGeneratedLessonText] = useState<string | null>(null);
  const [aiLessonTarget, setAiLessonTarget] = useState<{ ch: ChapterInfo; lessonNumber: number } | null>(null);

  useEffect(() => {
    const lvlParam = searchParams.get('level');
    if (lvlParam) {
      const parsed = Number(lvlParam) as CurriculumLevelNumber;
      if (parsed >= 1 && parsed <= 6) setLevelFilter(parsed);
    } else if (initialLevel) {
      setLevelFilter(initialLevel);
    }

    const chParam = searchParams.get('chapter');
    const lsParam = searchParams.get('lesson');
    if (chParam && lsParam) {
      const chNum = Number(chParam);
      const lsNum = Number(lsParam);
      setExpandedChapter(chNum);
      const id = `ch${chNum}-l${lsNum}`;
      if (allDetailedLessons[id]) {
        setActiveLessonId(id);
        setSynthesizedLesson(null);
        setActiveTab('overview');
      } else {
        const ch = allChapters.find((c) => c.chapterNumber === chNum);
        if (ch && lsNum >= 1 && lsNum <= 10) {
          setActiveLessonId(null);
          setSynthesizedLesson(buildDetailedLessonForSlot(ch, lsNum));
          setActiveTab('overview');
        }
      }
    }
  }, [searchParams, initialLevel, allDetailedLessons, allChapters]);

  const filteredChapters = useMemo(() => {
    return allChapters.filter((ch) => {
      if (levelFilter !== 'all' && ch.level !== levelFilter) return false;
      if (trackFilter !== 'all' && ch.track !== trackFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ch.titleBn.toLowerCase().includes(q) ||
          ch.titleEn.toLowerCase().includes(q) ||
          ch.titleAr.includes(searchQuery) ||
          String(ch.chapterNumber).includes(q)
        );
      }
      return true;
    });
  }, [allChapters, levelFilter, trackFilter, searchQuery]);

  const activeLesson: DetailedLesson | null = activeLessonId
    ? allDetailedLessons[activeLessonId] ?? synthesizedLesson
    : synthesizedLesson;

  const openLesson = (chapter: ChapterInfo, lessonNumber: number) => {
    const id = `ch${chapter.chapterNumber}-l${lessonNumber}`;
    setSearchParams({ chapter: String(chapter.chapterNumber), lesson: String(lessonNumber) });
    setWritingAnswer('');
    setAiWritingFeedback(null);
    setRevealedTransIdx([]);
    setQuizAnswers({});
    setAiGeneratedLessonText(null);
    setAiLessonTarget(null);

    if (allDetailedLessons[id]) {
      setSynthesizedLesson(null);
      setActiveLessonId(id);
    } else {
      setActiveLessonId(null);
      setSynthesizedLesson(buildDetailedLessonForSlot(chapter, lessonNumber));
    }
    setActiveTab('overview');
  };

  const handleCheckWritingWithAi = async () => {
    if (!activeLesson || !writingAnswer.trim() || aiLoading) return;
    setAiLoading(true);
    setAiWritingFeedback(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'correct-writing',
          level: `Chapter ${activeLesson.chapterNumber}`,
          interfaceLang: lang,
          message: `Prompt: ${activeLesson.writingPromptBn}\nExpected hint: ${activeLesson.writingTargetHintAr}\nStudent wrote: ${writingAnswer}`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Could not evaluate writing.');
      setAiWritingFeedback(data.reply);
      awardXp(15, {
        titleBn: `লেখার অনুশীলন: পাঠ ${activeLesson.chapterNumber}.${activeLesson.lessonNumber}`,
        titleEn: `Writing practice: Lesson ${activeLesson.chapterNumber}.${activeLesson.lessonNumber}`,
        type: 'ai',
      });
    } catch (err: unknown) {
      setAiWritingFeedback(err instanceof Error ? err.message : 'Error evaluating writing.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSyllabusLesson = async () => {
    if (!aiLessonTarget || aiLoading) return;
    setAiLoading(true);
    setAiGeneratedLessonText(null);
    const stub = aiLessonTarget.ch.lessons[aiLessonTarget.lessonNumber - 1];
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate-lesson',
          level: `Level ${aiLessonTarget.ch.level}`,
          interfaceLang: lang,
          context: `Chapter ${aiLessonTarget.ch.chapterNumber} (${aiLessonTarget.ch.titleBn} / ${aiLessonTarget.ch.titleEn}), Lesson ${aiLessonTarget.lessonNumber}: ${stub?.titleBn} (${stub?.titleEn}). Objective: ${aiLessonTarget.ch.objectiveBn}`,
          message: `Teach Chapter ${aiLessonTarget.ch.chapterNumber}, Lesson ${aiLessonTarget.lessonNumber}: ${stub?.titleBn}`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Could not generate lesson guide.');
      setAiGeneratedLessonText(data.reply);
    } catch (err: unknown) {
      setAiGeneratedLessonText(err instanceof Error ? err.message : 'AI Lesson generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppShell
      title={initialLevel === 1 ? t.sidebar.beginners : t.sidebar.courses}
      subtitle={
        lang === 'bn'
          ? '৬টি স্তর · ১০০ অধ্যায় · ১,০০০ ধাপে ধাপে পাঠ (আধুনিক ও কুরআনিক আরবি)'
          : '6 Levels · 100 Chapters · 1,000 Structured Lessons (MSA & Quranic)'
      }
    >
      <div className="space-y-6">
        {/* Active 22-Point Lesson Player */}
        {activeLesson && (
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-6 border-[var(--border-strong)]">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="text-xs text-[var(--accent)] font-medium">
                  {lang === 'bn'
                    ? `অধ্যায় ${activeLesson.chapterNumber} · পাঠ ${activeLesson.lessonNumber} · ${activeLesson.track}`
                    : `Chapter ${activeLesson.chapterNumber} · Lesson ${activeLesson.lessonNumber} · ${activeLesson.track}`}
                </div>
                <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                  {activeLesson.titleAr}
                </p>
                <h2 className="text-xl font-bold">
                  {lang === 'bn' ? activeLesson.titleBn : activeLesson.titleEn}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {progress.completedLessonIds.includes(activeLesson.id) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--emerald-highlight)] text-[var(--success)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.common.completed}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      completeLesson(activeLesson.id, activeLesson.titleBn, activeLesson.titleEn)
                    }
                    className="px-4 py-2 rounded-lg text-xs btn-primary"
                  >
                    {t.common.markComplete} (+50 XP)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveLessonId(null);
                    setSynthesizedLesson(null);
                  }}
                  className="px-3 py-2 rounded-lg text-xs btn-secondary"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>

            {/* Lesson Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'overview', labelBn: 'উদ্দেশ্য ও পুনরালোচনা', labelEn: 'Objectives & Revision' },
                  { id: 'vocab', labelBn: 'শব্দভাণ্ডার', labelEn: 'Vocabulary' },
                  { id: 'grammar', labelBn: 'ব্যাকরণ (নাহু-ছরফ)', labelEn: 'Grammar' },
                  { id: 'dialogue', labelBn: '১৫-লাইন সংলাপ', labelEn: '15-Line Dialogue' },
                  { id: 'practice', labelBn: 'লেখা ও অনুবাদ', labelEn: 'Writing & Translation' },
                  { id: 'quiz', labelBn: 'পাঠ কুইজ', labelEn: 'Lesson Quiz' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                    activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Tab 1: Objectives & Revision */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="surface-alt rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-[var(--accent)]">
                    {lang === 'bn' ? 'পাঠের শিখনফল (Learning Objectives)' : 'Learning Objectives'}
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc ps-5">
                    {(lang === 'bn' ? activeLesson.objectivesBn : activeLesson.objectivesEn).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="surface-alt rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-[var(--accent)]">
                    {lang === 'bn' ? 'পূর্ববর্তী শব্দ পুনরালোচনা' : 'Previous Vocabulary Revision'}
                  </h3>
                  {activeLesson.revisionVocabulary.map((v) => (
                    <div key={v.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-arabic text-2xl" dir="rtl">{v.arabic}</span>
                        <AudioButton text={v.arabic} compact />
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {v.pronunciationBn} · {v.meaningBn} ({v.meaningEn})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: New Vocabulary */}
            {activeTab === 'vocab' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLesson.newVocabulary.map((word) => (
                  <div key={word.id} className="surface-alt rounded-xl p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">{word.arabic}</p>
                        <p className="text-xs text-[var(--text-muted)]">{word.pronunciationBn}</p>
                      </div>
                      <AudioButton text={word.arabic} compact />
                    </div>
                    <div className="text-sm font-medium">
                      {word.meaningBn} <span className="text-[var(--text-muted)]">· {word.meaningEn}</span>
                    </div>
                    {word.root && (
                      <div className="text-xs text-[var(--text-muted)]">
                        মূলধাতু (Root): <span className="font-arabic text-sm" dir="rtl">{word.root}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                      <p className="font-arabic text-base" dir="rtl">{word.exampleAr}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{word.exampleBn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Grammar */}
            {activeTab === 'grammar' && (
              <div className="space-y-5">
                <div className="surface-alt rounded-xl p-5 space-y-3">
                  <p className="font-arabic text-xl text-[var(--accent)]" dir="rtl">
                    {activeLesson.grammarTopicAr}
                  </p>
                  <h3 className="text-lg font-bold">{activeLesson.grammarTopicBn}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'bn' ? activeLesson.grammarExplanationBn : activeLesson.grammarExplanationEn}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.grammarExamples.map((ex, i) => (
                    <div key={i} className="surface-alt rounded-xl p-4 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-arabic text-xl text-[var(--accent)]" dir="rtl">{ex.arabic}</p>
                        <p className="text-xs text-[var(--text-muted)]">{ex.pronunciationBn}</p>
                        <p className="text-sm">{ex.meaningBn} · {ex.meaningEn}</p>
                      </div>
                      <AudioButton text={ex.arabic} compact />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: 15-Line Multi-Speaker Conversation */}
            {activeTab === 'dialogue' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--accent)]">
                    {lang === 'bn'
                      ? '১৫-লাইনের বাস্তবসম্মত আরবি সংলাপ (স্বাভাবিক ও ধীর গতির অডিওসহ)'
                      : '15-Line Multi-Speaker Arabic Conversation'}
                  </h3>
                  <AudioButton
                    text={activeLesson.conversation.map((c) => c.arabic).join(' ')}
                    showSlow
                  />
                </div>

                <div className="space-y-3">
                  {activeLesson.conversation.map((line, index) => (
                    <div key={index} className="surface-alt rounded-xl p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-[var(--accent)]">
                          <span className="font-mono-num me-2">{String(index + 1).padStart(2, '0')}.</span>
                          <span className="font-arabic-ui text-sm me-2">{line.speaker}</span>
                          <span className="text-[var(--text-muted)]">({line.speakerRoleBn})</span>
                        </div>
                        <AudioButton text={line.arabic} compact />
                      </div>
                      <p className="font-arabic text-xl sm:text-2xl text-[var(--text-primary)]" dir="rtl">
                        {line.arabic}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{line.pronunciationBn}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {line.translationBn} <span className="text-xs text-[var(--text-muted)]">({line.translationEn})</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Writing & Translation Exercises */}
            {activeTab === 'practice' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="surface-alt rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-[var(--accent)]">
                    {lang === 'bn' ? 'আরবি লেখার অনুশীলন ও AI সংশোধন' : 'Arabic Writing & AI Correction'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {lang === 'bn' ? activeLesson.writingPromptBn : activeLesson.writingPromptEn}
                  </p>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={writingAnswer}
                    onChange={(e) => setWritingAnswer(e.target.value)}
                    placeholder="اكتب الجملة العربية هنا..."
                    className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-lg focus:outline-none focus:border-[var(--accent)]"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (listeningMic) return;
                        setListeningMic(true);
                        startVoiceRecognition('ar-SA', {
                          onResult: (transcript) => {
                            setListeningMic(false);
                            setWritingAnswer(transcript);
                          },
                          onError: (msg) => {
                            setListeningMic(false);
                            setAiWritingFeedback(msg);
                          },
                          onEnd: () => setListeningMic(false),
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${
                        listeningMic ? 'bg-[var(--danger)] text-white' : 'btn-secondary'
                      }`}
                    >
                      {listeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent)]" />}
                      <span>{listeningMic ? 'শুনছি...' : 'ভয়েসে বলুন'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckWritingWithAi}
                      disabled={aiLoading || !writingAnswer.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary disabled:opacity-50"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{aiLoading ? 'যাচাই হচ্ছে...' : 'AI দিয়ে লেখা যাচাই করুন'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWritingAnswer(activeLesson.writingTargetHintAr)}
                      className="px-3 py-2 rounded-lg text-xs btn-secondary"
                    >
                      নমুনা উত্তর বসিয়ে দেখুন
                    </button>
                    <Link
                      to={`/ai-teacher?q=${encodeURIComponent(`আমি "${activeLesson.titleBn}" পাঠটির (${activeLesson.grammarTopicBn}) ও নতুন শব্দগুলো নিয়ে আপনার সাথে আরবিতে চর্চা করতে চাই।`)}`}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      AI-এর সাথে সরাসরি ভয়েস চর্চা →
                    </Link>
                  </div>
                  {aiWritingFeedback && (
                    <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm whitespace-pre-wrap leading-relaxed">
                      {aiWritingFeedback}
                    </div>
                  )}
                </div>

                <div className="surface-alt rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-[var(--accent)]">
                    {lang === 'bn' ? 'অনুবাদ অনুশীলন' : 'Translation Exercises'}
                  </h3>
                  {activeLesson.translationExercises.map((ex, idx) => {
                    const revealed = revealedTransIdx.includes(idx);
                    return (
                      <div key={idx} className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
                        <div className="text-xs text-[var(--text-muted)]">
                          {ex.direction === 'ar-to-bn' ? 'আরবি → বাংলা' : 'বাংলা → আরবি'}
                        </div>
                        <p className={ex.direction === 'ar-to-bn' ? 'font-arabic text-lg' : 'text-sm font-medium'}>
                          {ex.prompt}
                        </p>
                        <div className="text-xs text-[var(--text-muted)]">ইঙ্গিত: {ex.hint}</div>
                        {revealed ? (
                          <p className="text-sm font-semibold text-[var(--success)] pt-1">{ex.answer}</p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRevealedTransIdx((prev) => [...prev, idx])}
                            className="px-3 py-1 rounded text-xs btn-secondary"
                          >
                            উত্তর দেখুন
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 6: Quiz */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {activeLesson.quiz.map((q, qIdx) => {
                  const chosen = quizAnswers[q.id];
                  const isAnswered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex;
                  return (
                    <div key={q.id} className="surface-alt rounded-xl p-5 space-y-3">
                      <div className="text-sm font-semibold">
                        {qIdx + 1}. {lang === 'bn' ? q.questionBn : q.questionEn}
                      </div>
                      {q.arabicPrompt && (
                        <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                          {q.arabicPrompt}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                            className={`text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                              chosen === oIdx
                                ? oIdx === q.correctIndex
                                  ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold'
                                  : 'border-[var(--danger)] bg-[var(--danger)]/10'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {isAnswered && (
                        <div className={`text-xs ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                          {isCorrect ? 'সঠিক উত্তর! ' : 'আবার দেখুন: '}
                          {lang === 'bn' ? q.explanationBn : q.explanationEn}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Syllabus Lesson Guide Panel (for chapters/lessons without static authored dialogue) */}
        {aiLessonTarget && !activeLesson && (
          <div className="surface-card rounded-2xl p-6 space-y-4 border-[var(--border-strong)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--accent)] font-medium">
                  অধ্যায় {aiLessonTarget.ch.chapterNumber} · পাঠ {aiLessonTarget.lessonNumber}
                </div>
                <h2 className="text-xl font-bold mt-1">
                  {aiLessonTarget.ch.lessons[aiLessonTarget.lessonNumber - 1]?.titleBn}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {aiLessonTarget.ch.objectiveBn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiLessonTarget(null)}
                className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
              >
                বন্ধ করুন
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateSyllabusLesson}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm btn-primary disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {aiLoading
                    ? 'AI শিক্ষক পাঠ প্রস্তুত করছেন...'
                    : 'AI শিক্ষকের মাধ্যমে এই পাঠটি শিখুন'}
                </span>
              </button>

              {!progress.completedLessonIds.includes(
                `ch${aiLessonTarget.ch.chapterNumber}-l${aiLessonTarget.lessonNumber}`
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    completeLesson(
                      `ch${aiLessonTarget.ch.chapterNumber}-l${aiLessonTarget.lessonNumber}`,
                      aiLessonTarget.ch.lessons[aiLessonTarget.lessonNumber - 1]?.titleBn || 'Lesson',
                      aiLessonTarget.ch.lessons[aiLessonTarget.lessonNumber - 1]?.titleEn || 'Lesson'
                    )
                  }
                  className="px-4 py-2.5 rounded-lg text-sm btn-secondary"
                >
                  পাঠ সম্পন্ন হিসেবে চিহ্নিত করুন (+50 XP)
                </button>
              )}
            </div>

            {aiGeneratedLessonText && (
              <div className="surface-alt rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap font-arabic-ui">
                {aiGeneratedLessonText}
              </div>
            )}
          </div>
        )}

        {/* Filter & Search Bar for all 100 Chapters */}
        <div className="surface-card rounded-2xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? '১০০টি অধ্যায় বা বিষয় খুঁজুন (যেমন: বর্ণমালা, ফাতিহা, মাদি)...'
                    : 'Search 100 chapters (e.g., Alphabet, Fatihah, Verbs)...'
                }
                className="w-full ps-9 pe-4 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'MSA', 'Quranic', 'Combined'] as const).map((tr) => (
                <button
                  key={tr}
                  type="button"
                  onClick={() => setTrackFilter(tr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    trackFilter === tr ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {tr === 'all' ? (lang === 'bn' ? 'সকল ট্র্যাক' : 'All Tracks') : tr}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                levelFilter === 'all' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {lang === 'bn' ? 'সকল স্তর (১–৬)' : 'All Levels (1–6)'}
            </button>
            {CURRICULUM_LEVELS.map((lvl) => (
              <button
                key={lvl.level}
                type="button"
                onClick={() => setLevelFilter(lvl.level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  levelFilter === lvl.level ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {lang === 'bn' ? `স্তর ${lvl.level}` : `Level ${lvl.level}`}
              </button>
            ))}
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-3">
          {filteredChapters.map((chapter) => {
            const isOpen = expandedChapter === chapter.chapterNumber;
            const completedCount = chapter.lessons.filter((l) =>
              progress.completedLessonIds.includes(`ch${chapter.chapterNumber}-l${l.lessonNumber}`)
            ).length;

            return (
              <div key={chapter.chapterNumber} className="surface-card rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedChapter(isOpen ? 0 : chapter.chapterNumber)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[var(--bg-surface-alt)] transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="font-mono-num font-semibold text-[var(--accent)]">
                        {lang === 'bn' ? `অধ্যায় ${chapter.chapterNumber}` : `Chapter ${chapter.chapterNumber}`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Level {chapter.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{chapter.track}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{completedCount}/10</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-base font-bold">
                        {lang === 'bn' ? chapter.titleBn : chapter.titleEn}
                      </h3>
                      <span className="font-arabic text-base text-[var(--accent)]" dir="rtl">
                        {chapter.titleAr}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {lang === 'bn' ? chapter.objectiveBn : chapter.objectiveEn}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 shrink-0 text-[var(--accent)]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--border-subtle)] p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-[var(--bg-canvas)]/40">
                    {chapter.lessons.map((lesson) => {
                      const lessonId = `ch${chapter.chapterNumber}-l${lesson.lessonNumber}`;
                      const hasRich = Boolean(allDetailedLessons[lessonId]);
                      const isDone = progress.completedLessonIds.includes(lessonId);

                      return (
                        <button
                          key={lesson.lessonNumber}
                          type="button"
                          onClick={() => openLesson(chapter, lesson.lessonNumber)}
                          className="p-3.5 rounded-lg surface-alt text-left flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <span className="font-mono-num">
                                {chapter.chapterNumber}.{lesson.lessonNumber}
                              </span>
                              <span className="text-[var(--accent)] font-semibold">
                                · {hasRich
                                  ? (lang === 'bn' ? 'পূর্ণাঙ্গ পাঠ + ১৬ সংলাপ' : 'Full Lesson')
                                  : (lang === 'bn' ? 'মাবাদি + ১৬ সংলাপ + AI' : 'Mabadi + 16 Lines + AI')}
                              </span>
                            </div>
                            <div className="text-sm font-medium truncate">
                              {lang === 'bn' ? lesson.titleBn : lesson.titleEn}
                            </div>
                          </div>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
